import Ember from 'ember'

const {
  Service,
  inject: {service}
} = Ember

export default Service.extend({
  fastboot:  service(),
  separator: '---',

  pushResponse(requestToken, response) {
    this.get('fastboot.shoebox').put(
      requestToken,
      JSON.stringify(response)
    )
    return response
  },

  popResponse(requestToken) {
    let response = this.get('fastboot.shoebox').retrieve(requestToken)
    this.eraseResponse(requestToken)
    return response ? JSON.parse(response) : response
  },

  eraseResponse(requestToken) {
    const element = document.getElementById(`shoebox-${requestToken}`)
    element && element.parentNode.removeChild(element)
    this.set(`fastboot.shoebox.${requestToken}`, undefined)
  },

  tokenizeAjaxRequest(url, type, options = {}) {
    let data = options.data
    let separator = this.get('separator')

    const encode = str => {
      if (typeof btoa === 'function') {
        return btoa(str);
      } else if (typeof FastBoot === 'object') {
        try {
          const buffer = FastBoot.require('buffer');
          return buffer.Buffer.from(str).toString('base64')
        } catch (err) {
          throw new Error(
            'buffer must be available for encoding base64 strings in FastBoot. Make sure to add buffer to your fastbootDependencies.'
          );
        }
      } else {
        throw new Error(
          'Neither btoa nor the FastBoot global are avaialble. Unable to encode base64 strings.'
        );
      }
    };

    return encode([
      url,
      type,
      JSON.stringify(data)
    ].join(separator))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/\=+$/, '')
  }
})

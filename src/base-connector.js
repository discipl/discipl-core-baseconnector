class BaseConnector {
  constructor () {
    if (new.target === BaseConnector) {
      throw new TypeError('BaseConnector must be overridden')
    }

    let methods = ['getName', 'getSsidOfClaim', 'getLatestClaim', 'newSsid', 'claim', 'get', 'observe']
    for (let method of methods) {
      if (this[method] === undefined || !(this[method] instanceof Function)) {
        throw new TypeError('Method ' + method + ' should be implemented')
      }
    }
  }

  /**
   * Verifies existence of a claim with the given data in the channel of the given ssid
   */
  async verify (ssid, data) {
    let current = await this.getLatestClaim(ssid)
    while (current != null) {
      let res = await this.get(current, ssid)
      if ((res != null) && (JSON.stringify(data) === JSON.stringify(res.data))) {
        return current
      }
      if (res != null) {
        current = res.previous
      } else {
        break
      }
    }
    return null
  }
}

export { BaseConnector }

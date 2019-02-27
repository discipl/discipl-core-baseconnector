const DID_DELIMITER = ':'
const LINK_PREFIX = 'link' + DID_DELIMITER + 'discipl' + DID_DELIMITER
const DID_PREFIX = 'did' + DID_DELIMITER + 'discipl' + DID_DELIMITER

class BaseConnector {
  constructor () {
    if (new.target === BaseConnector) {
      throw new TypeError('BaseConnector must be overridden')
    }

    let methods = ['getName', 'getDidOfClaim', 'getLatestClaim', 'newIdentity', 'claim', 'get', 'observe']
    for (let method of methods) {
      if (this[method] === undefined || !(this[method] instanceof Function)) {
        throw new TypeError('Method ' + method + ' should be implemented')
      }
    }
  }

  /**
   * Converts platform-specific reference to a claim to a link
   *
   * @param {string} claimReference Reference to the claim
   * @returns {string} The link if the reference is a non-empty string. Null otherwise.
   */
  linkFromReference (claimReference) {
    if ((claimReference) && (typeof claimReference === 'string')) {
      return LINK_PREFIX + this.getName() + DID_DELIMITER + claimReference
    }
    return null
  }

  didFromReference (reference) {
    if ((reference) && (typeof reference === 'string')) {
      return DID_PREFIX + this.getName() + DID_DELIMITER + reference
    }
    return null
  }

  static getConnectorName (linkOrDid) {
    let splitted = linkOrDid.split(DID_DELIMITER)
    return splitted[2]
  }

  static referenceFromLink (link) {
    let splitted = link.split(DID_DELIMITER)
    return splitted.slice(3).join(DID_DELIMITER)
  }

  static referenceFromDid (did) {
    return this.referenceFromLink(did)
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

  async import (ssid, link, data) {
    throw new Error('Claim import is not supported')
  }
}

export { BaseConnector }

import stringify from 'json-stable-stringify'

const DID_DELIMITER = ':'
const LINK_PREFIX = 'link' + DID_DELIMITER + 'discipl' + DID_DELIMITER
const DID_PREFIX = 'did' + DID_DELIMITER + 'discipl' + DID_DELIMITER

class BaseConnector {
  static get ALLOW () {
    return 'DISCIPL_ALLOW'
  }

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
   * Converts platform-specific reference to a discipl-link to a claim.
   *
   * Can be reverted with {@link BaseConnector.referenceFromLink}
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

  /**
   * Converts platform-specific reference to a discipl-did
   *
   * Can be reverted with {@link BaseConnector.referenceFromDid}
   *
   * @param {string} reference Reference to the identity
   * @returns {string} The link if the reference is a non-empty string. Null otherwise.
   */
  didFromReference (reference) {
    if ((reference) && (typeof reference === 'string')) {
      return DID_PREFIX + this.getName() + DID_DELIMITER + reference
    }
    return null
  }

  /**
   * Extracts connector name from a did or link
   *
   * @param {string} linkOrDid String from which the connector needs to be extracted
   * @returns {string} The name of the connector, if the input is a valid link or did. Null otherwise.
   */
  static getConnectorName (linkOrDid) {
    if (this.isDid(linkOrDid) || this.isLink(linkOrDid)) {
      let splitted = linkOrDid.split(DID_DELIMITER)
      return splitted[2]
    }
    return null
  }

  /**
   * Extracts the reference from a link
   *
   * @param {string} link
   * @returns {string} Reference part of the link, if the link is valid. Null otherwise
   */
  static referenceFromLink (link) {
    if (this.isLink(link)) {
      let splitted = link.split(DID_DELIMITER)
      return splitted.slice(3).join(DID_DELIMITER)
    }
    return null
  }

  /**
   * Extracts the reference from a did
   *
   * @param {string} did
   * @returns {string} Reference part of the did, if the did is valid. Null otherwise
   */
  static referenceFromDid (did) {
    if (this.isDid(did)) {
      let splitted = did.split(DID_DELIMITER)
      return splitted.slice(3).join(DID_DELIMITER)
    }
    return null
  }

  /**
   * @param {string} str Potential link
   * @returns {boolean} True if and only if the input is a valid link
   */
  static isLink (str) {
    return typeof str === 'string' && str.startsWith(LINK_PREFIX)
  }

  /**
   * @param {string} str Potential did
   * @returns {boolean} True if and only if the input is a valid did
   */
  static isDid (str) {
    return typeof str === 'string' && str.startsWith(DID_PREFIX)
  }

  /**
   * Verifies existence of a claim with the given data in the channel of the given did
   *
   * @param {string} did That might have claimed the data
   * @param {object} data Data that needs to be verified
   * @returns {Promise<string>} Link to claim that proves this data, null if such a claim does not exist
   */
  async verify (did, data) {
    let current = await this.getLatestClaim(did)
    while (current != null) {
      let res = await this.get(current)
      if ((res != null) && (stringify(data) === stringify(res.data))) {
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

  async import (did, link, data) {
    throw new Error('Claim import is not supported')
  }
}

export { BaseConnector }

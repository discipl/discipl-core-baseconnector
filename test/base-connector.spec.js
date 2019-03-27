/* eslint-env mocha */
/* eslint-disable no-unused-expressions */

import { expect } from 'chai'
import { BaseConnector } from '../src/base-connector'
import sinon from 'sinon'

class MockConnector extends BaseConnector {
  getName () {
    return 'base'
  }

  getDidOfClaim (reference) {
    return null
  }

  async getLatestClaim (ssid) {
    return null
  }

  async newIdentity () {
    return { 'pubkey': null, 'privkey': null }
  }

  async claim (ssid, data) {
    return false
  }

  async get (reference, ssid = null) {
    return { 'data': '', 'previous': null }
  }

  async observe (ssid) {
    return false
  }
}

describe('discipl-base-connector', () => {
  it('should correctly convert a reference to a did', () => {
    let mockConnector = new MockConnector()

    let did = mockConnector.didFromReference('fred')

    expect(did).to.equal('did:discipl:base:fred')
  })

  it('return null if a non-string reference is used to create a did', () => {
    let mockConnector = new MockConnector()

    let did = mockConnector.didFromReference({ 'weird': 'object' })

    expect(did).to.equal(null)
  })

  it('return null if an empty reference is used to create a did', () => {
    let mockConnector = new MockConnector()

    let did = mockConnector.didFromReference('')

    expect(did).to.equal(null)
  })

  it('should correctly convert a reference to a link', () => {
    let mockConnector = new MockConnector()

    let did = mockConnector.linkFromReference('yabadabadoo')

    expect(did).to.equal('link:discipl:base:yabadabadoo')
  })

  it('return null if a non-string reference is used to create a link', () => {
    let mockConnector = new MockConnector()

    let link = mockConnector.linkFromReference({ 'weird': 'object' })

    expect(link).to.equal(null)
  })

  it('return null if an empty string reference is used to create a link', () => {
    let mockConnector = new MockConnector()

    let link = mockConnector.linkFromReference('')

    expect(link).to.equal(null)
  })

  it('should return a correct ALLOW string', () => {
    expect(BaseConnector.ALLOW).to.equal('DISCIPL_ALLOW')
  })

  it('should be able to verify a single claim', async () => {
    let mockConnector = new MockConnector()

    sinon.stub(mockConnector, 'getLatestClaim').returns('beerClaimReference')
    sinon.stub(mockConnector, 'get').returns({ 'data': { 'need': 'beer' } })

    let verification = await mockConnector.verify('mockSsid', { 'need': 'beer' })

    expect(mockConnector.getLatestClaim.calledOnceWith('mockSsid')).to.equal(true)
    expect(mockConnector.get.calledOnceWith('beerClaimReference')).to.equal(true)

    expect(verification).to.equal('beerClaimReference')
  })

  it('should be able to verify a claim thats referred in a chain', async () => {
    let mockConnector = new MockConnector()

    sinon.stub(mockConnector, 'getLatestClaim').returns('wineClaimReference')
    let getStub = sinon.stub(mockConnector, 'get')
    getStub.onCall(0).returns({ 'data': { 'need': 'wine' }, 'previous': 'beerClaimReference' })
    getStub.onCall(1).returns({ 'data': { 'need': 'beer' } })

    let verification = await mockConnector.verify('mockSsid', { 'need': 'beer' })

    expect(mockConnector.getLatestClaim.calledOnceWith('mockSsid')).to.equal(true)
    expect(mockConnector.get.callCount).to.equal(2)
    expect(mockConnector.get.args[0]).to.deep.equal(['wineClaimReference', null, null])
    expect(mockConnector.get.args[1]).to.deep.equal(['beerClaimReference', null, null])

    expect(verification).to.equal('beerClaimReference')
  })

  it('should not be able to verify a claim that does not exist', async () => {
    let mockConnector = new MockConnector()

    sinon.stub(mockConnector, 'getLatestClaim').returns('beerClaimReference')
    sinon.stub(mockConnector, 'get').returns({ 'data': { 'need': 'beer' } })

    let verification = await mockConnector.verify('mockSsid', { 'need': 'a hole in the head' })

    expect(mockConnector.getLatestClaim.calledOnceWith('mockSsid')).to.equal(true)
    expect(mockConnector.get.calledOnceWith('beerClaimReference')).to.equal(true)

    expect(verification).to.be.null
  })

  it('should not be able to instantiate if the required functions are not implemented', () => {
    class BrokenConnector extends BaseConnector {
    }
    expect(() => new BrokenConnector()).to.throw(TypeError, /should be implemented/)
  })

  it('should not be able to be instantiated', () => {
    expect(() => new BaseConnector()).to.throw(TypeError, 'BaseConnector must be overridden')
  })
  // code to test the break condition
  it('should not be able to stay stuck in the while loop when res == null', async () => {
    let mockConnector = new MockConnector()

    sinon.stub(mockConnector, 'getLatestClaim').returns('wineClaimReference')
    let getStub = sinon.stub(mockConnector, 'get')
    getStub.onCall(0).returns({ 'data': { 'need': 'wine' }, 'previous': 'beerClaimReference' })
    getStub.onCall(1).returns(null)

    let verification = await mockConnector.verify('mockSsid', { 'need': 'beer' })

    expect(verification).to.be.null
  })

  it('import should throw not supported error when not overridden', async () => {
    let msg = null
    let mockConnector = new MockConnector()
    try {
      await mockConnector.import()
    } catch (err) {
      msg = err.message
    }
    expect(msg).to.equal('Claim import is not supported')
  })

  describe('utility functions', () => {
    it('get the correct connector name from a link', () => {
      let link = 'link:discipl:mock:yabadabadoo'

      let connector = BaseConnector.getConnectorName(link)

      expect(connector).to.equal('mock')
    })

    it('get the correct connector name from a did', () => {
      let did = 'did:discipl:mock:fred'

      let connector = BaseConnector.getConnectorName(did)

      expect(connector).to.equal('mock')
    })

    it('returns null if no connector name can be found', () => {
      let link = 'not really a did'

      let connector = BaseConnector.getConnectorName(link)

      expect(connector).to.equal(null)
    })

    it('get the correct reference from a link', () => {
      let link = 'link:discipl:mock:yabadabadoo'

      let reference = BaseConnector.referenceFromLink(link)

      expect(reference).to.equal('yabadabadoo')
    })

    it('get the correct connector name from a did', () => {
      let did = 'did:discipl:mock:fred'

      let reference = BaseConnector.referenceFromDid(did)

      expect(reference).to.equal('fred')
    })

    it('returns null if no reference can be found', () => {
      let notDidOrLink = 'did nor there'

      let reference = BaseConnector.referenceFromDid(notDidOrLink)
      let reference2 = BaseConnector.referenceFromLink(notDidOrLink)

      expect(reference).to.equal(null)
      expect(reference2).to.equal(null)
    })
  })
})

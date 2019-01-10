/* eslint-env mocha */
/* eslint-disable no-unused-expressions */

import { expect } from 'chai'
import { BaseConnector } from '../src/base-connector'
import sinon from 'sinon'

class MockConnector extends BaseConnector {
  getName () {
    return 'base'
  }

  getSsidOfClaim (reference) {
    return null
  }

  async getLatestClaim (ssid) {
    return null
  }

  async newSsid () {
    return { 'pubkey': null, 'privkey': null }
  }

  async claim (ssid, data) {
    return false
  }

  async get (reference, ssid = null) {
    return { 'data': '', 'previous': null }
  }

  async subscribe (ssid) {
    return false
  }
}

describe('disciple-base-connector', () => {
  it('should be able to verify a single claim', async () => {
    let mockConnector = new MockConnector()

    sinon.stub(mockConnector, 'getLatestClaim').returns('beerClaimReference')
    sinon.stub(mockConnector, 'get').returns({ 'data': { 'need': 'beer' } })

    let verification = await mockConnector.verify('mockSsid', { 'need': 'beer' })

    expect(mockConnector.getLatestClaim.calledOnceWith('mockSsid')).to.equal(true)
    expect(mockConnector.get.calledOnceWith('beerClaimReference', 'mockSsid')).to.equal(true)

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
    expect(mockConnector.get.args[0]).to.deep.equal(['wineClaimReference', 'mockSsid'])
    expect(mockConnector.get.args[1]).to.deep.equal(['beerClaimReference', 'mockSsid'])

    expect(verification).to.equal('beerClaimReference')
  })

  it('should be not able to verify a claim that does not exist', async () => {
    let mockConnector = new MockConnector()

    sinon.stub(mockConnector, 'getLatestClaim').returns('beerClaimReference')
    sinon.stub(mockConnector, 'get').returns({ 'data': { 'need': 'beer' } })

    let verification = await mockConnector.verify('mockSsid', { 'need': 'a hole in the head' })

    expect(mockConnector.getLatestClaim.calledOnceWith('mockSsid')).to.equal(true)
    expect(mockConnector.get.calledOnceWith('beerClaimReference', 'mockSsid')).to.equal(true)

    expect(verification).to.be.undefined
  })

  it('should not be able to instantiate if the required functions are not implemented', () => {
    class BrokenConnector extends BaseConnector {
    }
    expect(() => new BrokenConnector()).to.throw(TypeError, /should be implemented/)
  })

  it('should not be able to be instantiated', () => {
    expect(() => new BaseConnector()).to.throw(TypeError, 'BaseConnector must be overridden')
  })
})

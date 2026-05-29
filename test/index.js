const assert = require('node:assert/strict')
const { beforeEach, describe, it } = require('node:test')

// npm modules
const { makeConnection, makePlugin } = require('haraka-test-fixtures')

// start of tests
//    assert: https://nodejs.org/api/assert.html

beforeEach(function () {
  this.plugin = makePlugin('esets', { register: false })
})

describe('esets', function () {
  it('loads', function () {
    assert.ok(this.plugin)
  })
})

describe('load_esets_ini', function () {
  it('loads esets.ini from config/esets.ini', function () {
    this.plugin.load_esets_ini()
    assert.ok(this.plugin.cfg)
  })
})

describe('uses text fixtures', function () {
  it('sets up a connection', function () {
    this.connection = makeConnection()
    assert.ok(this.connection.server)
  })

  it('sets up a transaction', function () {
    this.connection = makeConnection({ withTxn: true })
    assert.ok(this.connection.transaction.header)
  })
})

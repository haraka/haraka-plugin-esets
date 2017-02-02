const assert = require('node:assert/strict')
const { beforeEach, describe, it } = require('node:test')

// npm modules
const fixtures = require('haraka-test-fixtures')

// start of tests
//    assert: https://nodejs.org/api/assert.html

beforeEach(function () {
  this.plugin = new fixtures.plugin('esets')
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
    this.connection = fixtures.connection.createConnection({})
    assert.ok(this.connection.server)
  })

  it('sets up a transaction', function () {
    this.connection = fixtures.connection.createConnection({})
    this.connection.transaction = fixtures.transaction.createTransaction({})
    assert.ok(this.connection.transaction.header)
  })
})

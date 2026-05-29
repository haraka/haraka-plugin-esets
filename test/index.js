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

describe('interpret_esets_exit', function () {
  it('exit 0 (clean) -> CONT', function () {
    const r = this.plugin.interpret_esets_exit(null, '', '')
    assert.equal(r.rc, undefined)
    assert.equal(r.exit_code, 0)
  })

  it('exit 2 (virus found) -> DENY with virus name', function () {
    const stdout = 'name="test.eml" result="infected" virus="Eicar-Test"\n'
    const err = Object.assign(new Error('exit 2'), { code: 2 })
    const r = this.plugin.interpret_esets_exit(err, stdout, '')
    assert.equal(r.rc, DENY)
    assert.match(r.msg, /Eicar-Test/)
  })

  it('exit 2 with no virus= line falls back to UNKNOWN', function () {
    const err = Object.assign(new Error('exit 2'), { code: 2 })
    const r = this.plugin.interpret_esets_exit(err, '', '')
    assert.equal(r.rc, DENY)
    assert.match(r.msg, /UNKNOWN/)
  })

  it('exit 1 (scanner internal error) -> DENYSOFT', function () {
    const err = Object.assign(new Error('exit 1'), { code: 1 })
    const r = this.plugin.interpret_esets_exit(err, '', 'fatal\n')
    assert.equal(r.rc, DENYSOFT)
  })

  it('exit 4 (out-of-range) -> DENYSOFT', function () {
    const err = Object.assign(new Error('exit 4'), { code: 4 })
    const r = this.plugin.interpret_esets_exit(err, '', 'wat\n')
    assert.equal(r.rc, DENYSOFT)
  })

  it('timeout / killed -> DENYSOFT (no numeric code)', function () {
    const err = Object.assign(new Error('timeout'), { code: 'ETIMEDOUT' })
    const r = this.plugin.interpret_esets_exit(err, '', '')
    assert.equal(r.rc, DENYSOFT)
  })
})

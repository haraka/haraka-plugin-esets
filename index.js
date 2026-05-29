// esets

const fs = require('node:fs')
const path = require('node:path')
const child_process = require('node:child_process')

const ESETS_CLI = '/opt/eset/esets/bin/esets_cli'
const ESETS_TIMEOUT_MS = 30 * 1000
const virus_re = /virus="([^"]+)"/

exports.register = function () {
  this.load_esets_ini()
}

exports.load_esets_ini = function () {
  this.cfg = this.config.get('esets.ini', () => {
    this.load_esets_ini()
  })
}

// Decision-only: given the exit/stdout/stderr from esets_cli, return what the
// hook should do. Pure so it can be unit-tested without spawning a process.
//   exit 0           -> CONT (clean)
//   exit 2 or 3      -> DENY  (virus found)
//   anything else    -> DENYSOFT (scanner error / timeout)
exports.interpret_esets_exit = function (error, stdout, stderr) {
  const exit_code = error ? Number(error.code) : 0

  if (Number.isNaN(exit_code) || exit_code < 0) {
    // non-numeric (ETIMEDOUT, ENOENT, ...) — treat as scanner failure
    const errMsg = (stdout || stderr || String(error?.message || 'UNKNOWN'))
      .replaceAll('\n', ' ')
      .trim()
    return { rc: DENYSOFT, msg: 'Virus scanner error', exit_code, errMsg }
  }

  if (exit_code === 0) return { rc: undefined, exit_code }

  if (exit_code > 1 && exit_code < 4) {
    const m = virus_re.exec(stdout || '')
    const virus = m ? m[1] : 'UNKNOWN'
    return {
      rc: DENY,
      msg: `Message is infected with ${virus}`,
      virus,
      exit_code,
    }
  }

  const errMsg = (stdout || stderr || 'UNKNOWN').replaceAll('\n', ' ').trim()
  return { rc: DENYSOFT, msg: 'Virus scanner error', exit_code, errMsg }
}

exports.hook_data_post = function (next, connection) {
  const plugin = this
  // path.join normalizes tmpdir; tmpfile is passed to execFile as an arg
  // element (not interpolated into a shell command) so shell metacharacters
  // in tmpdir cannot reach the shell parser.
  const tmpdir = this.cfg.main?.tmpdir || '/tmp'
  const tmpfile = path.join(tmpdir, `${connection?.transaction?.uuid}.esets`)
  const ws = fs.createWriteStream(tmpfile)

  let finished = false
  function finish(rc, msg) {
    if (finished) return
    finished = true
    fs.unlink(tmpfile, () => {})
    if (rc === undefined && msg === undefined) return next()
    next(rc, msg)
  }

  ws.once('error', (err) => {
    connection.logerror(plugin, `Error writing temporary file: ${err.message}`)
    finish()
  })

  ws.once('close', () => {
    if (finished) return
    const start_time = Date.now()
    child_process.execFile(
      ESETS_CLI,
      [tmpfile],
      {
        encoding: 'utf8',
        timeout: ESETS_TIMEOUT_MS,
        env: { ...process.env, LANG: 'C' },
      },
      (error, stdout, stderr) => {
        const elapsed = Date.now() - start_time

        for (const channel of [stdout, stderr]) {
          if (!channel) continue
          for (const line of channel.split('\n')) {
            if (line) connection.logdebug(plugin, `recv: ${line}`)
          }
        }

        const r = plugin.interpret_esets_exit(error, stdout, stderr)
        const summary = r.virus
          ? ` virus="${r.virus}"`
          : r.errMsg
            ? ` error="${r.errMsg}"`
            : ''
        connection.loginfo(
          plugin,
          `elapsed=${elapsed}ms code=${r.exit_code}${summary}`,
        )

        finish(r.rc, r.msg)
      },
    )
  })

  connection.transaction.message_stream.pipe(ws)
}

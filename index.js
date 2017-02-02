// esets

const fs = require('node:fs')
const child_process = require('node:child_process')

const virus_re = new RegExp('virus="([^"]+)"')

exports.register = function () {
  this.load_esets_ini()
}

exports.load_esets_ini = function () {
  this.cfg = this.config.get('esets.ini', () => {
    this.load_esets_ini()
  })
}

exports.hook_data_post = function (next, connection) {
  // Write message to temporary file
  const tmpdir = this.cfg.main.tmpdir || '/tmp'
  const tmpfile = `${tmpdir}/${connection?.transaction?.uuid}.esets`
  const ws = fs.createWriteStream(tmpfile)

  ws.once('error', (err) => {
    connection.logerror(this, `Error writing temporary file: ${err.message}`)
    next()
  })

  let start_time

  ws.once('close', () => {
    start_time = Date.now()
    const execCmd = `LANG=C /opt/eset/esets/bin/esets_cli ${tmpfile}`
    const execOpts = { encoding: 'utf8', timeout: 30 * 1000 }
    child_process.exec(execCmd, execOpts, function (error, stdout, stderr) {
      // Remove the temporary file
      fs.unlink(tmpfile, () => {})

      // Timing
      const end_time = Date.now()
      const elapsed = end_time - start_time

      // Debugging
      for (const channel of [stdout, stderr]) {
        if (channel) {
          const lines = channel.split('\n')
          for (const line of lines) {
            if (line) connection.logdebug(this, `recv: ${line}`)
          }
        }
      }

      // Get virus name
      let virus = virus_re.exec(stdout)
      if (virus) virus = virus[1]

      // Log a summary
      const exit_code = parseInt(error ? error.code : 0)
      const rmsg =
        exit_code === 0 || (exit_code > 1 && exit_code < 4)
          ? ` virus="${virus}"`
          : ` error="${(stdout || stderr || 'UNKNOWN').replace('\n', ' ').trim()}"`

      connection.loginfo(this, `elapsed=${elapsed}ms code=${exit_code}${rmsg}`)

      // esets_cli returns non-zero exit on virus/error
      if (exit_code) {
        if (exit_code > 1 && exit_code < 4) {
          next(DENY, `Message is infected with ${virus || 'UNKNOWN'}`)
        } else {
          next(DENYSOFT, 'Virus scanner error')
        }
      }
    })
  })

  connection.transaction.message_stream.pipe(ws)
}

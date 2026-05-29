# Changelog

The format is based on [Keep a Changelog](https://keepachangelog.com/).

### Unreleased

### [1.0.2] - 2026-05-29

- security: replace `exec()` with `execFile()`; pass `LANG=C` via env, not shell
- fix: always call `next()` (clean scans and scanner-error paths no longer hang)
- fix: unlink tmpfile when the write stream errors
- refactor: split scanner-exit interpretation into interpret_esets_exit()
- test: refactored against test-fixtures 1.7.0 #2

### [1.0.1] - 2025-01-30

- doc(CONTRIBUTORS): added
- prettier: move config into package.json
- dep(eslint): upgrade to v9

### [1.0.0] - 2024-05-08

- repackaged from haraka/Haraka

[1.0.0]: https://github.com/haraka/haraka-plugin-esets/releases/tag/v1.0.0
[1.0.1]: https://github.com/haraka/haraka-plugin-esets/releases/tag/v1.0.1
[1.0.2]: https://github.com/haraka/haraka-plugin-esets/releases/tag/v1.0.2

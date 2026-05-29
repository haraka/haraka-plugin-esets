# haraka-plugin-esets

[![Test][ci-img]][ci-url] [![Cover][cov-img]][cov-url] [![Qlty][qlty-img]][qlty-url]

This plugin allows virus scanning with ESET Mail Security for Linux/BSD.

Install the software as per the intructions from ESET and enable this plugin
and it will scan each message using the "esets_cli" command which defaults to
/opt/eset/esets/bin/esets_cli.

### Configure

```
cp node_modules/haraka-plugin-esets/config/esets.ini config/esets.ini
$EDITOR config/esets.ini
```

## USAGE

<!-- leave these buried at the bottom of the document -->

[ci-img]: https://github.com/haraka/haraka-plugin-esets/actions/workflows/ci.yml/badge.svg
[ci-url]: https://github.com/haraka/haraka-plugin-esets/actions/workflows/ci.yml
[cov-img]: https://codecov.io/github/haraka/haraka-plugin-esets/coverage.svg
[cov-url]: https://codecov.io/github/haraka/haraka-plugin-esets
[qlty-img]: https://qlty.sh/gh/haraka/projects/haraka-plugin-esets/maintainability.svg
[qlty-url]: https://qlty.sh/gh/haraka/projects/haraka-plugin-esets

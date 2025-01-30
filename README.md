[![CI Test Status][ci-img]][ci-url]
[![Code Climate][clim-img]][clim-url]

# haraka-plugin-esets

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
[clim-img]: https://codeclimate.com/github/haraka/haraka-plugin-esets/badges/gpa.svg
[clim-url]: https://codeclimate.com/github/haraka/haraka-plugin-esets

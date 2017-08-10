#!/bin/sh

### Clean up
rm -rf dist

node_modules/.bin/electron-builder --mac="dmg" --linux="tar.gz"

eval "$(pyenv init -)"
pyenv activate venv3.6.1
aws s3 cp dist/hr-click-ekg-monitor-*.dmg s3://idea-builder-demo/ekg/dist/
aws s3 cp dist/hr-click-ekg-monitor-*.tar.gz s3://idea-builder-demo/ekg/dist/
pyenv deactivate

#!/bin/bash
rm -rf www/bower_components
bower cache clean
bower install
grunt bowerInstall

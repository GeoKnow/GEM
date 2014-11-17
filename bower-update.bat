call rd /s /q www\bower_components
call bower cache clean
call bower install
call grunt bowerInstall

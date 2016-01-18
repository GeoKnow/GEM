GEM
===
**GEM (Geospatial-semantic Exploration on the Move)** is a mobile spatial-semantic visualization and exploration tool that relies on [Mappify](https://github.com/GeoKnow/Mappify) and its components ([Jassa](https://github.com/GeoKnow/Jassa), [Facete](https://github.com/GeoKnow/Facete)) to offer a rich mobile experience while exploiting all strengths of Linked Data and further rise above the common mobile geospatial visualization limitations by relying on open, crowd-sourced and semantically linked information found in publicly available sources, such as the LOD Cloud. This information is loaded and filtered according to user’s needs, on demand, in order to prevent maps from overpopulating. 

**Demo:** https://www.youtube.com/watch?v=KoAdrNiDljU

How to deploy
---
GEM is an [Apache Cordova](http://cordova.apache.org/) / [Adobe Phonegap](http://phonegap.com/) project. Automation and package dependency management are controlled via [Grunt](http://gruntjs.com) and [Bower](http://bower.io), respectively. Batch installation/update scripts are provided for both Unix-based and Windows operating systems (*bower-update.sh* and *bower-update.bat*), and the mobile application source code is easily compiled by simply executing the following command from the desired CLI:
```
cordova build <platform>
```
where *&lt;platform&gt;* can be any of the Cordova/Phonegap supported platforms (e.g. *android*). It is worth noting that the Phonegap equivalent of the Cordova command is *phonegap build \<platform\>*. To compile and deploy the application to the desired device, we execute:
```
cordova run <platform>
```
Where to download
---
Pre-built packages for Android are available at [http://geoknow.imp.bg.ac.rs/gem/apks](http://geoknow.imp.bg.ac.rs/gem/apks)

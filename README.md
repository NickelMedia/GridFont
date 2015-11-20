Gulp Project Template
=====================

Nickel Media Gulp Project templated, brought to you in part by...

* [npm](https://www.npmjs.com/) - node.js dependency management
* [gulp](http://gulpjs.com/) - the streaming build system
* [bower](http://bower.io/) - a package manager for the web
* [TypeScript](http://www.typescriptlang.org/) - Microsoft meets JavaScript
* [less](http://lesscss.org/) - a CSS preprocessor

Setup
-----

**Don't use sudo.**

Ensure you have npm installed.

    npm install .
    ./gulp

This will

* install
    * npm dependencies (build & front-end)
* process all assets
* bundle all JavaScript and dependencies
* start watching images/typescript/less for changes

Folder Structure Details
------------------------

Type       | Build Source          | Destination
-----------|-----------------------|-----------------------
Fonts      | src/fonts/            | dist/fonts/
TypeScript | src/ts/               | dist/gridfont.min.js
LESS       | src/less/             | dist/gridfont.min.css


Generating a Font
------------------------------


Running Builds
--------------
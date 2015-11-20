var path = require('path');
var del = require('del');
var gulp = require('gulp');
var gm = require('gulp-gm');
var rename = require('gulp-rename');
var jeditor = require("gulp-json-editor");
var jsonminify = require('gulp-jsonminify');
var plumber = require('gulp-plumber');
var typescript = require('gulp-typescript');
var sourceMaps = require('gulp-sourcemaps');
var concat = require('gulp-concat');
var uglifyJs = require('gulp-uglify');
var uglifyCss = require('gulp-minify-css');
var less = require('gulp-less');

var fontToGenerate = process.env.font;
var jsDist = './dist';
var cssDist = './dist';
var tsSrc = './src/ts';
var styles = './src/less/styles.less';
var lessSrc = './src/less/';
var libName = 'gridfont.min.js';
var cssName = 'gridfont.min.css';

function createTask(taskName, src, filename, charCode, x, y, width, height){

    var deps = [];
    if(lastTask) deps.push(lastTask);
    gulp.task(taskName, deps, function(){
        return cutImage(src, filename, charCode, x, y, width, height);
    }); 
    lastTask = taskName;
}

function cutImage(src, filename, charCode, x, y, width, height){

    var src = fontDir + '/' + fontToGenerate + '/pages/' + src;
    var dest = fontDist + '/img/' + charCode;

    // console.log("src: " + src);
    // console.log("dest: " + dest);
    // console.log("filename: " + filename);
    // console.log("code: " + charCode);

    return gulp.src(src)
        .pipe(gm(function (gmfile) {
            return gmfile.crop(width, height, x, y).fuzz(10).trim()
        }))
        .pipe(rename(filename))
        .pipe(gulp.dest(dest));
}

function handleError(err) {
  console.log(err.toString());
  this.emit('end');
}

if(fontToGenerate){

    var lastTask;
    var firstTask;
    var data = {};
    var fontDir = './src/fonts';
    var fontDist = './dist/fonts/' + fontToGenerate;
    var config = require(fontDir + '/' + fontToGenerate + '/config.json');

    var pages = config.pages.length;
    for(var i = 0; i<pages; i++){

        var page = config.pages[i];
        var colWidth = (config.page_width / page.cols)
        var rowHeight = (config.page_height / page.rows)

        var rows = page.rows;
        for(var r = page.start_row; r<rows; r++){

            var r = r - page.start_row;
            var charCode = page.chars[r];
            var ignoredChars = page.ignore[charCode.toString()];

            for(var c = page.start_col; c<page.cols; c++){

                var colNum = c - page.start_col;

                //check if we should ignore this character
                var ignore = false;
                if(ignoredChars){
                    if(ignoredChars.indexOf(colNum) != -1){
                        ignore = true;
                    }
                }

                if(!ignore){
                    var index = colNum;
                    var filename =  fontToGenerate + '_' + charCode + '_' + index + '.png';
                    var x = (c * colWidth) + config.padding_left;
                    var y = (r * rowHeight) + config.padding_top;
                    var taskName  = charCode + '_' + index;

                    if(!data[charCode]) data[charCode] = [];

                    var jsonName = filename.replace(fontToGenerate +'_' , '');
                    data[charCode].push(jsonName);

                    createTask(taskName, page.src, filename, charCode, x, y, colWidth - config.padding_left - config.padding_right, rowHeight - config.padding_top - config.padding_bottom);    
                }
            }
        }
    }

    if(lastTask){

        gulp.task('cut-images', [lastTask]);

        gulp.task('create-font', ['clear-dist', 'create-json-data', 'cut-images']);

        gulp.task('clear-dist', function(){

            return del([fontDist])
        });

        gulp.task('create-json-data', function(){

            return gulp.src("./data.json")
                .pipe(jeditor(data))
                .pipe(jeditor({
                    "font_name":fontToGenerate,
                    "line_height":config["line_height"],
                    "line_spacing":config["line_spacing"],
                    "character_width":config["character_width"]
                }))
                .pipe(jsonminify())
                .pipe(gulp.dest(fontDist));
        });
    }
}


gulp.task('compile-typescript', function(cb){
  return gulp.src(tsSrc + '**/*.ts')
        .pipe(plumber())
        .pipe(typescript({sortOutput:true}))
        .pipe(concat(libName))
        .pipe(sourceMaps.init({loadMaps: true}))
        .pipe(uglifyJs())
        .pipe(sourceMaps.write('.'))
        .pipe(gulp.dest(jsDist))
        cb(err);
});

gulp.task('compile-less', function(){

    return gulp.src(styles)
        .pipe(sourceMaps.init())
        .pipe(less({paths: [lessSrc]}))
        .pipe(uglifyCss({keepSpecialComments: 0}))
        .pipe(rename(cssName))
        .pipe(sourceMaps.write('.'))
        .pipe(gulp.dest(cssDist))
});

gulp.task('build', ['compile-less', 'compile-typescript']);

gulp.task('watch', function() {
 
  gulp.watch('./src/less/**/*.*', ['compile-less']);
  gulp.watch('./src/ts/**/*.*', ['compile-typescript']);

});

gulp.task('default', ['compile-less', 'compile-typescript', 'watch']);
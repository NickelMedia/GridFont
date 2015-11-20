var path = require('path');
var del = require('del');
var gulp = require('gulp');
var gm = require('gulp-gm');
var rename = require('gulp-rename');
var jeditor = require("gulp-json-editor");

var lastTask;
var firstTask;
var data = {};
var fontDir = "./fonts/gregs_handwriting";
var config = require(fontDir + '/config.json');
var pages = config.pages.length;

pages = 2;
for(var i = 1; i<pages; i++){

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
                var filename = charCode + '_' + colNum + '.png';
                var x = (c * colWidth) + config.padding_left;
                var y = (r * rowHeight) + config.padding_top;
                var taskName = filename + i + r + c;

                if(!data[charCode]) data[charCode] = [];
                data[charCode].push(filename);

                createTask(taskName, page.src, filename, x, y, colWidth - config.padding_left - config.padding_right, rowHeight - config.padding_top - config.padding_bottom);    
            }
        }
    }
}

function createTask(taskName, src, filename, x, y, width, height){

    var deps = [];
    if(lastTask) deps.push(lastTask);
    gulp.task(taskName, deps, function(){
        return cutImage(src, filename, x, y, width, height);
    }); 
    lastTask = taskName;
}

function cutImage(src, filename, x, y, width, height){

    return gulp.src(fontDir + '/pages/' + src)
        .pipe(gm(function (gmfile) {
            return gmfile.crop(width, height, x, y).fuzz(10).trim()
        }))
        .pipe(rename(filename))
        .pipe(gulp.dest(fontDir + '/dist/img/'));
}

gulp.task('create-font', ['create-json-data', 'cut-images']);


gulp.task('create-json-data', function(){

    return gulp.src("./data.json")
        .pipe(jeditor(data))
        .pipe(jeditor({
            "line_height":config["line_height"],
            "line_spacing":config["line_spacing"],
            "character_width":config["character_width"]
        }))
        .pipe(gulp.dest(fontDir + '/dist/'));
});

gulp.task('cut-images', [lastTask]);
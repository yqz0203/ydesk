/**
 * Created by qizhang on 1/25/16.
 */

var gulp = require('gulp'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    plumber = require('gulp-plumber'),
    mincss = require('gulp-mini-css'),
    sass = require('gulp-ruby-sass');

//var env = 'product';
var env = process.env.NODE_ENV || 'development';

gulp.task('default', function () {
    gulp.run('run_sass');
    gulp.run('run-js');
    //sass
    gulp.watch(['src/sass/*.scss', 'src/sass/*/*.scss'], function () {
        gulp.run('run_sass');
    });

    //js
    gulp.watch(['src/js/*.js', 'src/js/partial/*.js'], function () {
        gulp.run('run-js');
    });
});

//mini-js
gulp.task('run-js', function () {
    var r = gulp.src(['js/*.js', 'js/partial/*.js'])

    if (env == 'production') {
        r.pipe(uglify({compatibility: 'ie8'}))
            .pipe(gulp.dest('build/js'))
    }
    else {
        r
            .pipe(plumber())
            .pipe(gulp.dest('build/js'))
    }

});

gulp.task('run_sass', function () {
    var r = sass('src/sass/sass.scss', {compass: true})
        .pipe(rename('main.css'))
    if (env == 'production') {
        r.pipe(mincss({compatibility: 'ie8'}))
            .pipe(gulp.dest('build/css'));
    }
    else {
        r.pipe(gulp.dest('build/css'))
    }
    return r;
});
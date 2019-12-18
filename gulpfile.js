const gulp = require('gulp');
const notify = require('gulp-notify');
const plumber = require('gulp-plumber');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const pug = require('gulp-pug');
const uglify  = require('gulp-uglify');
const browserSync = require('browser-sync');
var fs = require('fs');
const data = require('gulp-data');
const path = require('path');

// srcパス
const srcPath = {
  // 出力対象は`_`で始まっていない`.pug`ファイル。
  'pug': ['./src/**/*.pug', '!' + './src/**/_*.pug'],
  'sass': './src/scss/**/*.scss',
  'js': './src/js/**/*.js',
  'json': './src/_data/',
}

// distパス
const distPath = {
  'root': './dist/',
  'html': './dist/**/*.html',
  'css': './dist/css/',
  'js': './dist/js/'
}

// Sass
gulp.task('sass', function() {
  return gulp.src(srcPath.sass)
    // コンパイルエラーを通知します。
    .pipe(plumber({ errorHandler: notify.onError("Error: <%= error.message %>") }))
    .pipe(sass({
      outputStyle: 'compressed'
    }))
    .pipe(autoprefixer())
    .pipe(gulp.dest(distPath.css));
});

// Pug
gulp.task('pug', function() {
  var locals = {
    'site': JSON.parse(fs.readFileSync(srcPath.json + 'site.json'))
  }
  return gulp.src(srcPath.pug)
    // コンパイルエラーを通知します。
    .pipe(plumber({ errorHandler: notify.onError("Error: <%= error.message %>") }))
    .pipe(data(function(file) {
      locals.relativePath = path.relative(file.base, file.path.replace(/.pug$/, '.html'));
      return locals;
    }))
    .pipe(pug({
      locals: locals,
      basedir: 'src',
      pretty: true
    }))
    .pipe(gulp.dest(distPath.root));
});

// Js Compress
gulp.task('js', function() {
  return gulp.src(srcPath.js)
    .pipe(plumber())
    .pipe(uglify())
    .pipe(gulp.dest(distPath.js));
});

// Browser-sync
gulp.task('browser-sync', () => {
   return browserSync.init({
    server: {
      baseDir: distPath.root,
      index: 'index.html'
    },
    port: 8080,
    reloadOnRestart: true
  });
});

// Browser-sync reload
gulp.task('reload', (done) => {
  browserSync.reload();
  done();
});

// watch
gulp.task('watch', function() {
  gulp.watch(srcPath.sass, gulp.series('sass', 'reload'));
  gulp.watch(srcPath.js, gulp.series('js', 'reload'));
  gulp.watch(srcPath.pug, gulp.series('pug', 'reload'));
});

gulp.task('default', gulp.parallel('watch', 'sass', 'js', 'pug', 'browser-sync'));

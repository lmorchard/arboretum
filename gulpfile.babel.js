import browserify from 'browserify';
import connect from 'gulp-connect';
import gulp from 'gulp';
import path from 'path';
import stylus from 'gulp-stylus';
import uglify from 'gulp-uglify';
import source from 'vinyl-source-stream';
import deploy from 'gulp-gh-pages';
import babelify from "babelify";
import buffer from 'vinyl-buffer';
import gulpif from 'gulp-if';
import history from 'connect-history-api-fallback';

const DEBUG = (process.env.NODE_ENV === 'development');

const packageJSON = require('./package.json');
const excludeVendorModules = [
];
const vendorModules = Object.keys(packageJSON.dependencies)
  .filter(name => excludeVendorModules.indexOf(name) === -1);

gulp.task('build', [
  'stylus', 'assets', 'browserify-vendor', 'browserify-app', 'browserify-tests'
]);

gulp.task('browserify-vendor', () => {
  return commonBrowserify('vendor.js', browserify({
    debug: DEBUG
  }).require(vendorModules));
});

gulp.task('browserify-app', () => {
  return commonBrowserify('index.js', browserify({
    entries: ['./src/index.js'],
    debug: DEBUG,
    fullPaths: DEBUG
  }).external(vendorModules));
});

gulp.task('browserify-tests', () => {
  return commonBrowserify('index.js', browserify({
    entries: ['./test/index.js'],
    debug: DEBUG,
    fullPaths: DEBUG
  }).external(vendorModules), './dist-test');
});

function commonBrowserify(sourceName, b, dest='./dist') {
  return b
    .transform("babelify", {presets: ["es2015", "stage-0", "react"]})
    .bundle()
    .pipe(source(sourceName))
    .pipe(buffer())
    .pipe(gulpif(!DEBUG, uglify()))
    .pipe(gulp.dest(dest))
    .pipe(connect.reload());
}

gulp.task('stylus', () => {
  return gulp.src('./src/**/*.styl')
    .pipe(stylus())
    .pipe(gulp.dest('./dist'))
    .pipe(connect.reload());
});

gulp.task('assets', () => {
  return gulp.src([
      './src/manifest.webapp',
      './src/**/*.png',
      './src/**/*.html'
    ])
    .pipe(gulp.dest('./dist'))
    .pipe(connect.reload());
});

gulp.task('connect', () => {
  connect.server({
    root: 'dist',
    /*
    middleware: (connect, opt) => [
      history({ verbose: true })
    ],
    */
    livereload: true,
    port: 3001
  });
});

gulp.task('watch', () => {
  gulp.watch('./src/**/*', ['browserify-app', 'browserify-tests', 'stylus', 'assets']);
  gulp.watch('./test/**/*', ['browserify-tests']);
  gulp.watch('./package.json', ['browserify-vendor']);
});

gulp.task('deploy', ['build'], () => {
  gulp.src('./dist/**/*')
    .pipe(deploy({}));
});

gulp.task('server', ['build', 'connect', 'watch']);

gulp.task('default', ['server']);

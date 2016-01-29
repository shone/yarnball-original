var gulp        = require('gulp'),
    gulp_if     = require('gulp-if'),
    spawn       = require('child_process').spawn,
    sass        = require('gulp-sass'),
    uglifyjs    = require('gulp-uglify'),
    cssnano     = require('gulp-cssnano'),
    htmlmin     = require('gulp-htmlmin'),
    styleModule = require('gulp-style-modules'),
    browserSync = require('browser-sync'),
    bowerFiles  = require('main-bower-files');

gulp.task('html', function() {
  return gulp.src('src/**/*.html')
    .pipe(gulp.dest('dist/'));
});

gulp.task('js', function() {
  return gulp.src('src/**/*.js')
    .pipe(gulp.dest('dist/'));
});

gulp.task('styles', function() {
  return gulp.src('src/*.sass')
    .pipe(sass())
    .pipe(gulp.dest('dist/'));
});

gulp.task('widget-styles', function() {
  return gulp.src('src/widgets/**/*.sass')
    .pipe(sass())
    .pipe(styleModule())
    .pipe(gulp.dest('dist/widgets/'));
});

gulp.task('png', function() {
  return gulp.src('src/**/*.png')
    .pipe(gulp.dest('dist/'));
});

gulp.task('svg', function() {
  return gulp.src('src/**/*.svg')
    .pipe(gulp.dest('dist/'));
});

gulp.task('bower', function() {
//   gulp.src(bowerFiles())
  gulp.src('bower_components/**/*')
    .pipe(gulp_if('*.js', uglifyjs()))
//     .pipe(gulp_if('*.html', htmlmin()))
    .pipe(gulp_if('*.css', cssnano()))
    .pipe(gulp.dest('dist/bower_components/'));
});

gulp.task('socket.io', function() {
  gulp.src('node_modules/socket.io-client/**')
    .pipe(gulp_if('*.js', uglifyjs()))
    .pipe(gulp.dest('dist/socket.io-client'));
});

gulp.task('node_names', function() {
  gulp.src('src/node_names.txt')
    .pipe(gulp.dest('dist/'));
});

gulp.task('links', function() {
  gulp.src('src/links.txt')
    .pipe(gulp.dest('dist/'));
});

gulp.task('default', ['html', 'js', 'styles', 'widget-styles', 'svg', 'png', 'bower', 'socket.io', 'node_names', 'links']);

gulp.task('watch', function() {
  gulp.watch('src/*.html', ['html']);
  gulp.watch('src/widgets/**/*.html', ['html']);
  gulp.watch('src/**/*.js',   ['js']);
  gulp.watch('src/*.sass',    ['styles']);
  gulp.watch('src/widgets/**/*.sass', ['widget-styles']);
  gulp.watch('src/*.svg',     ['svg']);
  gulp.watch('src/**/*.svg',  ['svg']);
  gulp.watch('src/*.png',     ['png']);
});

gulp.task('serve', ['default'], function() {
  spawn('node',
        ['server.js'],
        {
          stdio: 'inherit',
          cwd: 'dist/',
        }
       )
});

gulp.task('browser', ['default', 'watch'], function() {
  
  browserSync({
    port: 5000,
    ui: {
      port: 5001,
    },
    notify: false,
    proxy: {
      target: 'localhost:3000',
      ws: true
    },
    files: [
      "dist/*.html",
      "dist/widgets/**/*.html",
      "dist/*.js",
      "dist/*.css",
      "dist/*.svg",
      "dist/*.png",
      "dist/widgets/**/*.svg",
    ],
    snippetOptions: {
      rule: {
        match: '<span id="browser-sync-binding"></span>',
        fn: function (snippet) {
          return snippet;
        }
      }
    },
  });
});


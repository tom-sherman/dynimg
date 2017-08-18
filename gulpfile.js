const gulp = require('gulp')
const uglify = require('gulp-uglify')
const rename = require('gulp-rename')

const srcPath = './src/*.js'

gulp.task('docs', function () {
  gulp.src(srcPath)
    .pipe(gulp.dest('./docs/js/'))
})

gulp.task('build', function () {
  gulp.src(srcPath)
    .pipe(gulp.dest('./dist/'))
    .pipe(uglify())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('./dist/'))
})

gulp.task('default', function () {
  gulp.watch([srcPath], ['docs'])
})

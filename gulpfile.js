var gulp = require('gulp'),
  sass = require('gulp-sass'),
  // concat = require('gulp-concat'),
  uglify = require('gulp-uglify'),
  plumber = require('gulp-plumber'),
  changed = require('gulp-changed'), //检查改变状态
  browserSync = require('browser-sync').create(),
  del = require('del'),
  htmlMin = require('gulp-htmlmin'), //压缩html
  minifyCss = require('gulp-minify-css');

//删除dist下的所有文件
gulp.task('delete', function (cb) {
  return del(['dist/*', '!dist/images'], cb);
})

gulp.task('htmlMin', function () {
  var options = {
    removeComments: true, //清除HTML注释
    collapseWhitespace: true, //压缩HTML
    collapseBooleanAttributes: true, //省略布尔属性的值 <input checked="true"/> ==> <input />
    removeEmptyAttributes: true, //删除所有空格作属性值 <input id="" /> ==> <input />
    removeScriptTypeAttributes: true, //删除<script>的type="text/javascript"
    removeStyleLinkTypeAttributes: true, //删除<style>和<link>的type="text/css"
    minifyJS: true, //压缩页面JS
    minifyCSS: true //压缩页面CSS
  };
  gulp.src('src/*.html')
    .pipe(changed('dist', {hasChanged: changed.compareSha1Digest}))
    .pipe(plumber())
    .pipe(htmlMin(options))
    .pipe(gulp.dest('dist'))
    .pipe(browserSync.reload({stream:true}));
});

gulp.task('sass', function () {
  gulp.src('src/styles/*.scss')
    .pipe(changed('dist/css', {
      hasChanged: changed.compareSha1Digest
    }))
    .pipe(plumber())
    .pipe(sass())
    .pipe(gulp.dest('dist/css'))
    .pipe(browserSync.reload({
      stream: true
    }));
});


// 将所有js文件连接为一个文件并压缩，存到public/js
gulp.task('concatJs', function () {
  gulp.src(['src/js/*.js'])
    .pipe(changed('dist/js', {
      hasChanged: changed.compareSha1Digest
    }))
    .pipe(uglify())
    .pipe(gulp.dest('dist/js'))
    .pipe(browserSync.reload({
      stream: true
    }));
});

gulp.task('default', ['watch']);

// 监听任务
gulp.task('watch', function () {
  gulp.start('concatJs', 'sass', 'htmlMin');
  // 建立浏览器自动刷新服务器
  browserSync.init({
    server: {
      // livereload: true,
      port: 3000,
      baseDir: "dist"
    }
  });

  gulp.watch('src/js/*.js', ['concatJs']);
  gulp.watch('src/styles/*.scss', ['sass']);
  gulp.watch('src/*.html', ['htmlMin']);

  // 自动刷新
  // gulp.watch('src/**', function () {
  //   browserSync.reload();
  // });

});

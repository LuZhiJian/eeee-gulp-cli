var gulp = require('gulp'),
  sass = require('gulp-sass'),
  // concat = require('gulp-concat'),
  uglify = require('gulp-uglify'),
  plumber = require('gulp-plumber'),
  changed = require('gulp-changed'), //检查改变状态
  browserSync = require('browser-sync').create(),
  htmlMin = require('gulp-htmlmin'), //压缩html
  minifyCss = require('gulp-minify-css'),
  imagemin = require('gulp-imagemin'),
  clean = require('gulp-clean'),
  cleanCSS = require('gulp-clean-css'),
  del = require('del'),
  path = require('path'),
  fileinclude = require('gulp-file-include');


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
  gulp.src(['src/*.html', '!src/include/**.html'])
    .pipe(changed('dev', {
      hasChanged: changed.compareSha1Digest
    }))
    .pipe(plumber())
    .pipe(fileinclude({
      prefix: '@',
      basepath: './src/include', //引用文件路径
      indent: true //保留文件的缩进
    }))
    .pipe(htmlMin(options))
    .pipe(gulp.dest('dev'))
    .pipe(browserSync.reload({
      stream: true
    }));
});

gulp.task('sass', function () {
  gulp.src('src/styles/*.scss')
    .pipe(changed('dev/css', {
      hasChanged: changed.compareSha1Digest
    }))
    .pipe(plumber())
    .pipe(sass())
    .pipe(cleanCSS())
    .pipe(minifyCss())
    .pipe(gulp.dest('dev/css'))
    .pipe(browserSync.reload({
      stream: true
    }));
});


// 将所有js文件连接为一个文件并压缩，存到public/js
gulp.task('uglifyJs', function () {
  gulp.src(['src/js/*.js'])
    .pipe(changed('dev/js', {
      hasChanged: changed.compareSha1Digest
    }))
    .pipe(uglify())
    .pipe(gulp.dest('dev/js'))
    .pipe(browserSync.reload({
      stream: true
    }));
});

//压缩  img文件
gulp.task('testImagemin', function () {
  gulp.src('src/images/**/*.{png,jpg,gif,jpeg,ico}')
    .pipe(imagemin({
      optimizationLevel: 5, //类型：Number  默认：3  取值范围：0-7（优化等级）
      progressive: true, //类型：Boolean 默认：false 无损压缩jpg图片
      interlaced: true, //类型：Boolean 默认：false 隔行扫描gif进行渲染
      multipass: true //类型：Boolean 默认：false 多次优化svg直到完全优化
    }))
    .pipe(gulp.dest('dev/images'));
});

gulp.task("clean", function () {
  return gulp.src('dev')
    .pipe(clean());
})

// 监听任务
gulp.task('watch', function () {
  // 建立浏览器自动刷新服务器
  browserSync.init({
    server: {
      // livereload: true,
      port: 3000,
      baseDir: "dev"
    }
  });

  var watchJs = gulp.watch('src/js/*.js', ['uglifyJs']);
  var watchCss = gulp.watch('src/styles/*.scss', ['sass']);
  var watchImg = gulp.watch('src/images/**/*', ['testImagemin']);
  var watchHtml = gulp.watch('src/*.html', ['htmlMin']);

  watchJs.on('change', function (event) {
    if (event.type === 'deleted') {
      del('dev/js/' + path.basename(event.path));
    }
  });

  watchCss.on('change', function (event) {
    if (event.type === 'deleted') {
      var cssName = path.basename(event.path).split('.scss')[0]
      del('dev/css/' + cssName + '.css');
    }
  });

  watchImg.on('change', function (event) {
    if (event.type === 'deleted') {
      del('dev/images/' + path.basename(event.path));
    }
  });

  watchHtml.on('change', function (event) {
    if (event.type === 'deleted') {
      del('dev/' + path.basename(event.path));
    }
  });
  //自动刷新
  // gulp.watch('src/**', function () {
  //   browserSync.reload();
  // });
});

gulp.task('default', ['clean'], function () {
  gulp.start('uglifyJs', 'sass', 'htmlMin', 'testImagemin', 'watch');
});

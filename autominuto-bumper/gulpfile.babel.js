import del              from  'del'
import babel            from  'gulp-babel'
import cleanCSS         from  'gulp-clean-css'
import gls              from  'gulp-live-server'
import gulp             from  'gulp'
import gulpNgConfig     from  'gulp-ng-config'
import htmlmin          from  'gulp-htmlmin'
import inject           from  'gulp-inject'
import ngAnnotate       from  'gulp-ng-annotate'
import sass             from  'gulp-sass'
import swaggerGenerator from  'gulp-apidoc-swagger'
import config           from  './app/config'
import uglify           from  'gulp-uglify'
import csso             from  'gulp-csso'
import plumber          from  'gulp-plumber'
import concat           from  'gulp-concat'
import rename           from  'gulp-rename'
import bytediff         from  'gulp-bytediff'
import rev              from  'gulp-rev'
import revReplace       from  'gulp-rev-replace'



const librariesJS = [
  './source/js/vendor/jquery-2.2.0.min.js',
  './node_modules/angular/angular.min.js',
  './node_modules/moment/min/moment.min.js',
  './node_modules/angular-messages/angular-messages.min.js',
  './node_modules/@uirouter/angularjs/release/angular-ui-router.min.js',
  './node_modules/angular-local-storage/dist/angular-local-storage.min.js',
  './node_modules/angular-moment-picker/dist/angular-moment-picker.min.js',
  './node_modules/angular-spinner/dist/angular-spinner.min.js',
  './node_modules/angular-slick-carousel/dist/angular-slick.min.js',
  './node_modules/ngmap/build/scripts/ng-map.min.js',
  './node_modules/satellizer/dist/satellizer.min.js',
  './node_modules/underscore/underscore-min.js',
  './node_modules/gasparesganga-jquery-loading-overlay/src/loadingoverlay.min.js',
  './node_modules/angular-modal-service/dst/angular-modal-service.min.js',
  './node_modules/slick-carousel/slick/slick.min.js',
  './source/shared/scripts/vendor/autocomplete.js',
  './source/shared/scripts/vendor/bootstrap.min.js',
  './source/js/vendor/facebook.min.js',
  './node_modules/ng-file-upload/dist/ng-file-upload.min.js',
  './node_modules/ng-file-upload/dist/ng-file-upload-shim.min.js',
  './node_modules/angular-sanitize/angular-sanitize.min.js',
  './node_modules/ui-select/dist/select.min.js',
  './node_modules/angular-hotkeys/build/hotkeys.min.js',
  './node_modules/angular-scroll/angular-scroll.min.js',
  './node_modules/angular-bind-html-compile/angular-bind-html-compile.min.js',
  './node_modules/ui-router-metatags/dist/ui-router-metatags.min.js'
]

const librariesCSS = [
  './node_modules/angular-moment-picker/dist/angular-moment-picker.min.css',
  './source/shared/styles/vendor/bootstrap.min.css',
  './source/shared/styles/vendor/font-awesome.min.css',
  './source/shared/styles/vendor/autocomplete.css',
  './source/shared/styles/vendor/responsive.css',
  './source/shared/styles/vendor/slick.css',
  './source/shared/styles/vendor/slick-theme.css',
  './node_modules/ui-select/dist/select.min.css'
]

const dependenciesJS = [
  'public/export/assets/js/jquery-2.2.0.min.js',
  'public/export/assets/js/slick.min.js',
  'public/export/assets/js/angular.min.js',
  'public/export/assets/js/underscore-min.js',
  'public/export/assets/js/moment.min.js',
  'public/export/assets/js/loadingoverlay.min.js',
  'public/export/assets/js/bootstrap.min.js',
  'public/export/assets/js/autocomplete.js',
  'public/export/assets/js/facebook.min.js',
  'public/export/assets/js/angular-ui-router.min.js',
  'public/export/assets/js/angular-spinner.min.js',
  'public/export/assets/js/angular-slick.min.js',
  'public/export/assets/js/angular-moment-picker.min.js',
  'public/export/assets/js/angular-modal-service.min.js',
  'public/export/assets/js/angular-messages.min.js',
  'public/export/assets/js/angular-local-storage.min.js',
  'public/export/assets/js/satellizer.min.js',
  'public/export/assets/js/ng-map.min.js',
  'public/export/assets/js/ng-file-upload.min.js',
  'public/export/assets/js/ng-file-upload-shim.min.js',
  'public/export/assets/js/angular-sanitize.min.js',
  'public/export/assets/js/select.min.js',
  'public/export/assets/js/hotkeys.min.js',
  'public/export/assets/js/angular-scroll.min.js',
  'public/export/assets/js/angular-bind-html-compile.min.js',
  'public/export/assets/js/ui-router-metatags.min.js'
]

const server = gls.new('server.js')
const scripts = gulp.parallel(appScripts, vendorScripts)
const scriptsProd = gulp.parallel(appScriptsProd, vendorScripts)

const styles  = gulp.parallel(appStyles, vendorStyles)
const stylesProd  = gulp.parallel(appStylesProd, staticStylesProd, vendorStyles)

const common = gulp.parallel(ngConfig, scripts, styles, views, assets, downloadFiles, sitemap, docs)
const commonProd = gulp.parallel(ngConfig, scriptsProd, stylesProd, views, assets, downloadFiles, sitemap, docs)

gulp.task('default', gulp.series(clean, common, injectorDev, serve))
gulp.task('debug', gulp.series(clean, common, injectorDev))
gulp.task('prod', gulp.series(clean, commonProd, injectorProd, serve))
gulp.task('maquetar', gulp.series(clean, common, injectorDev, serve))

// Scripts

function appScripts() {
  return gulp.src(['./source/app.js', './source/**/*.js', '!./source/js/vendor/*.js'], {since: gulp.lastRun(appScripts)})
      .pipe(babel({presets: ['env']}))
      .pipe(gulp.dest('./public/export'));
}

function vendorScripts() {
  return gulp.src(librariesJS, {since: gulp.lastRun(vendorScripts)})
    .pipe(gulp.dest('./public/export/assets/js'))
}

function appScriptsProd() {
  return gulp.src(['./source/app.js', './source/**/*.js', '!./source/js/vendor/*.js'])
    .pipe(plumber())
      .pipe(babel({compact: false, presets: ['env']}))
      .pipe(concat('boundle.js', {newLine: ';'}))
      .pipe(ngAnnotate({add: true}))
      .pipe(bytediff.start())
      .pipe(uglify({ compress: false, mangle: true}))
      .pipe(bytediff.stop())
      .pipe(rename('boundle.min.js'))
      .pipe(rev())
      .pipe(gulp.dest('./public/export/static'))
      .pipe(rev.manifest('./public/export/rev-manifest.json', { merge: true, base: './public/export'}))
    .pipe(plumber.stop())
    .pipe(gulp.dest('./public/export'));
}

// Styles

function appStyles() {
  return gulp.src(['./source/**/*.scss', './static/**/*.scss'])
    .pipe(sass())
    .pipe(gulp.dest('./public/export'))
}

function staticStylesProd() {
  return gulp.src('./static/**/*.scss')
    .pipe(plumber())
      .pipe(sass())
      .pipe(cleanCSS({compatibility: 'ie8'}))
      .pipe(bytediff.start())
      .pipe(csso())
      .pipe(bytediff.stop())
    .pipe(plumber.stop())
    .pipe(gulp.dest('./public/export'));
}

function appStylesProd() {
  return gulp.src('./source/**/*.scss')
    .pipe(plumber())
      .pipe(sass())
      .pipe(concat('main.css'))
      .pipe(cleanCSS({compatibility: 'ie8'}))
      .pipe(bytediff.start())
      .pipe(csso())
      .pipe(bytediff.stop())
      .pipe(rename('main.min.css'))
      .pipe(rev())
      .pipe(gulp.dest('./public/export/static'))
      .pipe(rev.manifest('./public/export/rev-manifest.json', { merge: true, base: './public/export'}))
    .pipe(plumber.stop())
    .pipe(gulp.dest('./public/export'));
}

function vendorStyles() {
  return gulp.src(librariesCSS, {since: gulp.lastRun(vendorStyles)})
    .pipe(gulp.dest('./public/export/assets/css'))
}

// Views

function views() {
  return gulp.src(['./source/**/*.html', '!./source/index.html'], {since: gulp.lastRun(views)})
    .pipe(htmlmin({collapseWhitespace: true, removeComments: true}))
    .pipe(gulp.dest('./public/export'))
}

// Config
function ngConfig() {
  const configureSetup  = {
    constants: {
      API_END_POINT: config.HOST + '/api/',
      SOCIAL_RECOMMENDATION_URL: config.SOCIAL_RECOMMENDATION_URL,
      USER_INACTIVE_BANNER_EXPIRATION: config.USER_INACTIVE_BANNER_EXPIRATION
    }
  }
  return gulp.src('angularEnv.json')
    .pipe(gulpNgConfig('amApp.constants.env', configureSetup))
    .pipe(gulp.dest('./public/export/shared/scripts/'))
}


// Assets
function assets() {
  return gulp.src(['./source/shared/images/**/*', './source/shared/fonts/*'], {base: './source/shared/',})
    .pipe(gulp.dest('./public/export/assets'))
}

function downloadFiles() {
  return gulp.src(['./source/shared/download/**/*.xlsx', './source/shared/download/**/*.pdf'], {base: './source/shared/download/',})
    .pipe(gulp.dest('./public/export/download'))
}

function sitemap() {
  return gulp.src(['./source/shared/sitemap/sitemap.xml'])
    .pipe(gulp.dest('./public/export'))
}
// Other

function clean() {
  //return del(['public/export/*', '!public/export/static'])
  return del(['public/*'])
}


function injectorDev() {
  return gulp.src('./source/index.html')
    .pipe(inject(gulp.src(dependenciesJS), {relative: true, ignorePath: '../public/export', name:'dependencies'}))
    .pipe(inject(gulp.src(['./public/export/assets/css/*.css'], {read: false}), {relative: true, ignorePath: '../public/export', name:'dependencies'}))
    .pipe(inject(gulp.src(['./public/**/*.css', '!./public/export/assets/css/*.css'], {read: false}), {relative: true, ignorePath: '../public/export'}))
    .pipe(inject(gulp.src(['./source/**/*.js', '!./source/js/vendor/*.js'], {read: false}), {relative: true, ignorePath: '../source/'}))
    .pipe(inject(gulp.src(['./public/export/shared/scripts/angularEnv.js'], {read: false}), {relative: true, ignorePath: '../public/export', name: 'config'}))
    .pipe(gulp.dest('./public'))
}

function injectorProd() {
  return gulp.src('./source/index.html')
    .pipe(inject(gulp.src(dependenciesJS), {relative: true, ignorePath: '../public/export', name:'dependencies'}))
    .pipe(inject(gulp.src(['./public/export/assets/css/*.css'], {read: false}), {relative: true, ignorePath: '../public/export', name:'dependencies'}))
    //.pipe(inject(gulp.src(['./public/export/static/main*.min.css'], {read: false}), {relative: true, ignorePath: '../public/export'}))
    .pipe(inject(gulp.src(['./public/export/shared/scripts/angularEnv.js'], {read: false}), {relative: true, ignorePath: '../public/export', name: 'config'}))
    //.pipe(inject(gulp.src(['./public/export/static/boundle*.min.js'], {read: false}), {relative: true, ignorePath: '../public/export'}))
    .pipe(revReplace({manifest: gulp.src('./public/export/rev-manifest.json')}))
    .pipe(gulp.dest('./public'))
}


function docs(close) {
  swaggerGenerator.exec({src: 'app/', dest: 'doc/'})
  close()
}

function serve(close) {

  server.start().then((result) => { console.log('Server exited with result:', result) })

  // Watch: app
  gulp.watch(['server.js', 'app/**/*.js']).on('change', (file) => {
    file = {path: file}
    server.start.bind(server)()
  })

  // Watch: source
  gulp.watch([
    '!./source/js/vendor/*.js',
    './source/**/*.js',
    './source/**/*.scss',
    './static/**/*.scss',
    './source/**/*.html',
    './source/index.html',
  ], gulp.series(common, injectorDev))

  // Watch: public css
  gulp.watch(['./public/static/']).on('change', (file) => {
    file = {path: file}
    console.log("changes")
    server.notify.apply(server, [file])
  }) 
}

// node.js Packages / Dependencies
const gulp = require("gulp");
const sass = require("gulp-sass");
const uglify = require("gulp-uglify");
const rename = require("gulp-rename");
const concat = require("gulp-concat");
const cleanCSS = require("gulp-clean-css");
const imageMin = require("gulp-imagemin");
const pngQuint = require("imagemin-pngquant");
const browserSync = require("browser-sync").create();
const autoprefixer = require("gulp-autoprefixer");
const jpgRecompress = require("imagemin-jpeg-recompress");
const clean = require("gulp-clean");

// Paths
var paths = {
  root: {
    www: "dist",
  },
  src: {
    root: "src/assets",
    html: "src/*.html",
    css: "src/assets/css/*.css",
    js: "src/assets/js/*.js",
    vendors: "src/assets/vendors/**/*.*",
    imgs: "src/assets/imgs/**/*.+(png|jpg|gif|svg|ico)",
    scss: "src/assets/scss/**/*.scss",
  },
  dist: {
    root: "dist",
    html: "dist",
    css: "dist/css",
    js: "dist/js",
    imgs: "dist/imgs",
    vendors: "dist/vendors",
  },
};

// Compile SCSS
gulp.task("sass", function () {
  return gulp
    .src(paths.src.scss)
    .pipe(sass({ outputStyle: "expanded" }).on("error", sass.logError))
    .pipe(autoprefixer())
    .pipe(gulp.dest(paths.src.root + "/css"))
    .pipe(browserSync.stream());
});

// Minify + Combine CSS
gulp.task("css", function () {
  return gulp
    .src(paths.src.css)
    .pipe(cleanCSS({ compatibility: "ie8" }))
    .pipe(concat("ollie.css"))
    .pipe(rename({ suffix: ".min" }))
    .pipe(gulp.dest(paths.dist.css))
    .pipe(browserSync.stream());
});

// Minify + Combine JS
gulp.task("js", function () {
  return gulp
    .src(paths.src.js)
    .pipe(uglify())
    .pipe(concat("ollie.js"))
    .pipe(rename({ suffix: ".min" }))
    .pipe(gulp.dest(paths.dist.js))
    .pipe(browserSync.stream());
});

// Compress (JPEG, PNG, GIF, SVG, JPG)
gulp.task("img", function () {
  return gulp
    .src(paths.src.imgs)
    .pipe(
      imageMin([
        imageMin.gifsicle(),
        imageMin.jpegtran(),
        imageMin.optipng(),
        imageMin.svgo(),
        pngQuint(),
        jpgRecompress(),
      ])
    )
    .pipe(gulp.dest(paths.dist.imgs));
});

// copy vendors to dist
gulp.task("vendors", function () {
  return gulp.src(paths.src.vendors).pipe(gulp.dest(paths.dist.vendors));
});

// copy html to dist
gulp.task("pages", function () {
  return gulp.src(paths.src.html).pipe(gulp.dest(paths.dist.html));
});

gulp.task("extra", function () {
  return src("public/**", { base: "public" }).pipe(dest(paths.dist.root));
});

// clean dist
gulp.task("clean", function () {
  return gulp.src(paths.dist.root).pipe(clean());
});

// Prepare all assets for production
gulp.task(
  "build",
  gulp.series("clean", "sass", "css", "js", "img", "vendors", "pages")
);

// Watch (SASS, CSS, JS, and HTML) reload browser on change
gulp.task("watch", function () {
  browserSync.init({
    notify: false,
    // open: false,
    // files: 'dist/**',
    port: 9000,
    server: {
      baseDir: paths.root.www,
      routes: {
        "/node_modules": "node_modules",
      },
    },
  });
  gulp.watch(paths.src.scss, gulp.series("sass"));
  gulp.watch(paths.src.js).on("change", browserSync.reload);
  gulp.watch(paths.src.html).on("change", browserSync.reload);
});

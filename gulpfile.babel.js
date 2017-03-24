import gulp from "gulp";
import cp from "child_process";
import gutil from "gulp-util";
import BrowserSync from "browser-sync";
import rimraf from "rimraf";

const browserSync = BrowserSync.create();
const webpackOptions = ["--progress", "--colors", "--display-error-details"]
const hugoOptions = ["--source", "hugo", "--destination", "../public", "-v"];

gulp.task("clean", (cb) => {
  rimraf('./public', cb);
});

function buildHugo(cb, options) {
  const args = options ? hugoOptions.concat(options) : hugoOptions;
  return cp.spawn("hugo", args, {stdio: "inherit"}).on("close", (code) => {
    if (code === 0) {
      browserSync.reload();
      cb();
    } else {
      browserSync.notify("Hugo build failed :(");
      cb("Hugo build failed");
    } 
  });
}

gulp.task("hugo", (cb) => buildHugo(cb, ["--canonifyURLs"]));
gulp.task("hugo-draft", (cb) => buildHugo(cb, ["--buildDrafts", "--buildFuture"]));

gulp.task("webpack", (cb) => {
  return cp.spawn("webpack", webpackOptions, {stdio: "inherit"}).on("close", (code) => {
    if (code === 0) {
      browserSync.reload();
      cb();
    } else {
      browserSync.notify("Webpack failed :(");
      cb("Webpack failed");
    }
  });
});

gulp.task("build", ["clean", "webpack", "hugo"]);

gulp.task("server", ["clean", "webpack", "hugo-draft"], () => {
  browserSync.init({
    server: {
      baseDir: "./public"
    }
  });
  gulp.watch("./app/**/*", ["webpack"]);
  gulp.watch("./hugo/**/*", ["hugo-draft"]);
});

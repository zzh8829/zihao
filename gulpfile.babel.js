import gulp from "gulp";
import cp from "child_process";
import BrowserSync from "browser-sync";

const browserSync = BrowserSync.create();
const webpackOptions = ["--progress", "--colors", "--display-error-details"]
const hugoOptions = ["--source", "hugo", "--destination", "../public", "-v"];

// gulp.task("hugo", (cb) => runHugo(cb, ["--canonifyURLs"]));
gulp.task("hugo", (cb) => runHugo(cb));
gulp.task("hugo:watch", (cb) => runHugo(cb, ["--buildDrafts", "--buildFuture"]));

gulp.task("webpack", (cb) => runWebpack(cb, ["-p"]));
gulp.task("webpack:watch", (cb) => runWebpack(cb));

gulp.task("build", ["webpack", "hugo"]);

gulp.task("watch", ["webpack:watch", "hugo:watch"], () => {
  browserSync.init({
    server: {
      baseDir: "./public"
    }
  });
  gulp.watch("./app/**/*", ["webpack:watch"]);
  gulp.watch("./hugo/**/*", ["hugo:watch"]);
});

function runHugo(cb, options) {
  return cp.spawn("hugo", 
                  hugoOptions.concat(options || []), 
                  {stdio: "inherit"})
  .on("close", (code) => {
    if (code === 0) {
      browserSync.reload();
    } else {
      browserSync.notify("Hugo failed! :(");
    }
    cb();
  });
}

function runWebpack(cb, options) {
  return cp.spawn("webpack", 
                  webpackOptions.concat(options || []), 
                  {stdio: "inherit"})
  .on("close", (code) => {
    if (code === 0) {
      browserSync.reload();
    } else {
      browserSync.notify("Webpack failed! :(");
    }
    cb();
  });
}

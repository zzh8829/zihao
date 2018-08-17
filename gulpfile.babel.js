import gulp from "gulp";
import cp from "child_process";
import BrowserSync from "browser-sync";

const browserSync = BrowserSync.create();
const webpackOptions = ["--colors", "--display-error-details"];
const hugoOptions = ["-v"];

gulp.task("hugo", done => runHugo(done));
gulp.task("webpack", done =>
  runWebpack(["--mode production", "--profile"], done)
);

gulp.task("build", gulp.parallel("webpack", "hugo"));

gulp.task("watch", () => {
  runWebpack(["--mode", "development", "--watch"]);
  runHugo(["--buildDrafts", "--buildFuture", "--watch"]);

  browserSync.init({
    server: {
      baseDir: "./public"
    }
  });
  gulp.watch("./public/**/*").on("change", browserSync.reload);
});

function runHugo(options, done = null) {
  return cp
    .spawn("hugo", hugoOptions.concat(options || []), { stdio: "inherit" })
    .on("close", code => {
      if (code === 0) {
        done && done()
      } else {
        done && done("Hugo failed! :(");
      }
    });
}

function runWebpack(options, done = null) {
  return cp
    .spawn("webpack", webpackOptions.concat(options || []), {
      stdio: "inherit"
    })
    .on("close", code => {
      if (code === 0) {
        done && done()
      } else {
        done && done("Webpack failed! :(");
      }
    });
}

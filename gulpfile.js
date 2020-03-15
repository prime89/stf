var gulp = require("gulp");
var ts = require("gulp-typescript");
var tsProject = ts.createProject("tsconfig.json");
const alias = require('gulp-ts-alias');

gulp.task("default", function () {
    return tsProject.src()
        .pipe(alias({ configuration: tsProject.config }))
        .pipe(tsProject())
        .js.pipe(gulp.dest("dist"));
});
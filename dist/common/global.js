"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
exports.envs = ['prod', 'dev', 'boe'];
exports.basedir = path.resolve(__dirname, '../..');
function updateEnv(_env) {
    exports.env = _env;
}
exports.updateEnv = updateEnv;

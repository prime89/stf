"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var fs = require("fs");
var yaml = require("yaml");
var global = require("../../../common/global");
var types_1 = require("../../../common/types");
var instantiation_1 = require("../../../common/instantiation/instantiation");
function mixin(destination, source) {
    if (!types_1.isObject(destination)) {
        return source;
    }
    if (types_1.isObject(source)) {
        Object.keys(source).forEach(function (key) {
            if (types_1.isObject(destination[key]) && types_1.isObject(source[key])) {
                mixin(destination[key], source[key]);
            }
            else {
                destination[key] = source[key];
            }
        });
    }
    return destination;
}
exports.IConfigurationService = instantiation_1.createDecorator('configurationService');
var ConfigurationService = (function () {
    function ConfigurationService() {
        var basePath = path.resolve(global.basedir, 'configs');
        var baseConfigFileContent = fs.readFileSync(path.resolve(basePath, 'env.yaml'), 'utf8');
        var baseConfiguration = yaml.parse(baseConfigFileContent);
        if (global.env !== 'prod') {
            var specifiedConfigFileContent = fs.readFileSync(path.resolve(basePath, "env_" + global.env + ".yaml"), 'utf8');
            var specifiedConfiguration = yaml.parse(specifiedConfigFileContent);
            mixin(baseConfiguration, specifiedConfiguration);
        }
        this.configuration = baseConfiguration;
    }
    return ConfigurationService;
}());
exports.ConfigurationService = ConfigurationService;

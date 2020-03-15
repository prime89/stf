"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var moment = require("moment");
var winston = require("winston");
var triple_beam_1 = require("triple-beam");
var DaliyRotateFileTransport = require("winston-daily-rotate-file");
var mkdirp = require("mkdirp");
var stackTrace = require("stack-trace");
var configurationService_1 = require("./interface/configurationService");
var global = require("../../common/global");
var LEVELS = {
    fatal: 0,
    error: 1,
    warn: 2,
    info: 3,
    debug: 4,
    trace: 5,
};
var COLORS = {
    fatal: 'magenta',
    error: 'red',
    warn: 'yellow',
    info: 'green',
    debug: 'blue',
    trace: 'cyan'
};
function createSymlink(target, path) {
    fs.unlink(path, function () {
        fs.symlink(target, path, function () { });
    });
}
var DEFAULT_OPTIONS = {
    dirname: path.resolve(global.basedir, 'logs'),
    filename: 'dora',
    ext: '.log',
    level: 'info',
    enableConsoleLog: false,
    enableFileLog: true,
    frequency: '5h',
    callSiteFrameIndex: 1,
    prefix: undefined,
};
var LogService = (function () {
    function LogService(_configrationService) {
        this._configrationService = _configrationService;
        var options = __assign(__assign({}, DEFAULT_OPTIONS), this._configrationService.configuration.log);
        this._options = options;
        this._logger = winston.createLogger({
            level: options.level,
            levels: LEVELS,
        });
        var upperCaseLevel = winston.format(function (info) {
            info.level = info.level.toUpperCase();
            return info;
        })();
        var splat = winston.format.splat();
        var colorize = winston.format.colorize({
            colors: COLORS,
        });
        var printf = winston.format.printf(function (info) {
            return info.level + " " + info.date + " " + info.time + " " + info.location + " " + info.logId + " " + info.prefix + info.message;
        });
        if (options.enableFileLog) {
            var dirname = this._tryCreateLogDir(options.dirname);
            var ext = options.ext;
            var datePattern = 'YYYY-MM-DD_HH';
            var fileTransport = new DaliyRotateFileTransport({
                level: options.level,
                format: winston.format.combine(upperCaseLevel, splat, printf),
                dirname: dirname,
                filename: "" + options.filename + ext + ".%DATE%",
                frequency: options.frequency,
                datePattern: datePattern,
            });
            var source_1 = path.resolve(dirname, "" + options.filename + ext);
            var target = path.resolve(dirname, "" + options.filename + ext + "." + moment().format(datePattern));
            createSymlink(target, source_1);
            fileTransport.on('rotate', function (oldFilename, newFilename) {
                createSymlink(newFilename, source_1);
            });
            this._logger.add(fileTransport);
        }
        if (options.enableConsoleLog) {
            var consoleTransport = new winston.transports.Console({
                level: options.level,
                format: winston.format.combine(upperCaseLevel, colorize, splat, printf),
            });
            this._logger.add(consoleTransport);
        }
    }
    LogService.prototype.log = function (args) {
        var _a;
        if (args === void 0) { args = {}; }
        var trace = stackTrace.get();
        var frame = trace.length ? trace[this._options.callSiteFrameIndex] : undefined;
        var filepath = '-';
        var lineno = '-';
        if (frame && typeof frame.getFileName === 'function') {
            var filename = frame.getFileName();
            if (filename) {
                filepath = path.relative(process.cwd(), filename);
            }
        }
        if (frame && typeof frame.getLineNumber === 'function') {
            lineno = frame.getLineNumber();
        }
        var now = moment();
        var level = args.level;
        if (!level || !LEVELS.hasOwnProperty(level)) {
            level = 'info';
        }
        this._logger.log((_a = {
                level: level,
                date: args.date || now.format('YYYY-MM-DD'),
                time: args.time || now.format('HH:mm:ss,SSS'),
                location: args.location || filepath + ":" + lineno,
                logId: args.logId || '-',
                message: args.message || ''
            },
            _a[triple_beam_1.SPLAT] = args.meta || [],
            _a.prefix = this._options.prefix || '',
            _a));
        return this;
    };
    LogService.prototype.fatal = function (message) {
        var meta = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            meta[_i - 1] = arguments[_i];
        }
        return this.log({ level: 'fatal', message: message, meta: meta });
    };
    LogService.prototype.error = function (message) {
        var meta = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            meta[_i - 1] = arguments[_i];
        }
        return this.log({ level: 'error', message: message, meta: meta });
    };
    LogService.prototype.warn = function (message) {
        var meta = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            meta[_i - 1] = arguments[_i];
        }
        return this.log({ level: 'warn', message: message, meta: meta });
    };
    LogService.prototype.info = function (message) {
        var meta = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            meta[_i - 1] = arguments[_i];
        }
        return this.log({ level: 'info', message: message, meta: meta });
    };
    LogService.prototype.debug = function (message) {
        var meta = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            meta[_i - 1] = arguments[_i];
        }
        return this.log({ level: 'debug', message: message, meta: meta });
    };
    LogService.prototype.trace = function (message) {
        var meta = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            meta[_i - 1] = arguments[_i];
        }
        return this.log({ level: 'trace', message: message, meta: meta });
    };
    LogService.prototype._tryCreateLogDir = function (dirname) {
        if (fs.existsSync(dirname)) {
            return dirname;
        }
        try {
            mkdirp.sync(dirname);
            return dirname;
        }
        catch (e) {
            throw e;
        }
    };
    LogService = __decorate([
        __param(0, configurationService_1.IConfigurationService),
        __metadata("design:paramtypes", [Object])
    ], LogService);
    return LogService;
}());
exports.LogService = LogService;

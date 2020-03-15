"use strict";
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
var mongoose_1 = require("mongoose");
var configurationService_1 = require("../base/interface/configurationService");
exports.autoIndex = true;
exports.goingDown = false;
var BytedocService = (function () {
    function BytedocService(_configurationService) {
        this._configurationService = _configurationService;
        this.name = 'bytedoc';
        this._records = _configurationService.configuration.db.url;
        this._createConnection();
    }
    Object.defineProperty(BytedocService.prototype, "models", {
        get: function () {
            return this._models;
        },
        enumerable: true,
        configurable: true
    });
    BytedocService.prototype._createConnection = function () {
        var url = "mongodb://" + this._records.join(',') + "/stf";
        this.connection = mongoose_1.createConnection(url, {
            useNewUrlParser: true,
            autoIndex: exports.autoIndex || false,
            useFindAndModify: false,
            useUnifiedTopology: true,
        });
        this.connection.on('error', this._onError);
        this.connection.on('disconnected', this._onDisconnected);
    };
    BytedocService.prototype._onError = function () {
    };
    BytedocService.prototype._onDisconnected = function () {
        this.connection.removeListener('disconnected', this._onDisconnected);
        this.connection.close();
        if (exports.goingDown) {
        }
    };
    BytedocService = __decorate([
        __param(0, configurationService_1.IConfigurationService),
        __metadata("design:paramtypes", [Object])
    ], BytedocService);
    return BytedocService;
}());
exports.BytedocService = BytedocService;

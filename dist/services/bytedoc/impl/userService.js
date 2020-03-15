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
var typegoose_1 = require("@typegoose/typegoose");
var databaseService_1 = require("../../base/interface/databaseService");
var AdbKey = (function () {
    function AdbKey() {
    }
    __decorate([
        typegoose_1.prop({ index: true }),
        __metadata("design:type", String)
    ], AdbKey.prototype, "fingerprint", void 0);
    __decorate([
        typegoose_1.prop(),
        __metadata("design:type", String)
    ], AdbKey.prototype, "title", void 0);
    return AdbKey;
}());
var User = (function () {
    function User() {
    }
    __decorate([
        typegoose_1.prop({ unique: true }),
        __metadata("design:type", String)
    ], User.prototype, "email", void 0);
    __decorate([
        typegoose_1.arrayProp({ itemsRef: AdbKey }),
        __metadata("design:type", Array)
    ], User.prototype, "adbKeys", void 0);
    __decorate([
        typegoose_1.prop(),
        __metadata("design:type", String)
    ], User.prototype, "group", void 0);
    __decorate([
        typegoose_1.prop(),
        __metadata("design:type", String)
    ], User.prototype, "groupId", void 0);
    __decorate([
        typegoose_1.prop(),
        __metadata("design:type", String)
    ], User.prototype, "ip", void 0);
    __decorate([
        typegoose_1.prop(),
        __metadata("design:type", Date)
    ], User.prototype, "lastLoggedInAt", void 0);
    __decorate([
        typegoose_1.prop({ index: true }),
        __metadata("design:type", String)
    ], User.prototype, "name", void 0);
    return User;
}());
exports.User = User;
var UserService = (function () {
    function UserService(_databaseService) {
        this._databaseService = _databaseService;
        this.model = typegoose_1.getModelForClass(User, {
            existingConnection: _databaseService.connection
        });
    }
    UserService.prototype.findAll = function () {
        return [];
    };
    UserService = __decorate([
        __param(0, databaseService_1.IDatabaseService),
        __metadata("design:paramtypes", [Object])
    ], UserService);
    return UserService;
}());
exports.UserService = UserService;

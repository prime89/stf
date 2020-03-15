"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var IdleValue = (function () {
    function IdleValue(executor) {
        var _this = this;
        this._didRun = false;
        this._executor = function () {
            try {
                _this._value = executor();
            }
            catch (err) {
                _this._error = err;
            }
            finally {
                _this._didRun = true;
            }
        };
        this._handle = exports.runWhenIdle(function () { return _this._executor(); });
    }
    IdleValue.prototype.dispose = function () {
        this._handle.dispose();
    };
    IdleValue.prototype.getValue = function () {
        if (!this._didRun) {
            this._handle.dispose();
            this._executor();
        }
        if (this._error) {
            throw this._error;
        }
        return this._value;
    };
    return IdleValue;
}());
exports.IdleValue = IdleValue;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var hasOwnProperty = Object.prototype.hasOwnProperty;
function values(from) {
    var result = [];
    for (var key in from) {
        if (hasOwnProperty.call(from, key)) {
            result.push(from[key]);
        }
    }
    return result;
}
exports.values = values;
function size(from) {
    var count = 0;
    for (var key in from) {
        if (hasOwnProperty.call(from, key)) {
            count += 1;
        }
    }
    return count;
}
exports.size = size;
function first(from) {
    for (var key in from) {
        if (hasOwnProperty.call(from, key)) {
            return from[key];
        }
    }
    return undefined;
}
exports.first = first;
function forEach(from, callback) {
    var _loop_1 = function (key) {
        if (hasOwnProperty.call(from, key)) {
            var result = callback({ key: key, value: from[key] }, function () {
                delete from[key];
            });
            if (result === false) {
                return { value: void 0 };
            }
        }
    };
    for (var key in from) {
        var state_1 = _loop_1(key);
        if (typeof state_1 === "object")
            return state_1.value;
    }
}
exports.forEach = forEach;
function groupBy(data, groupFn) {
    var result = Object.create(null);
    for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
        var element = data_1[_i];
        var key = groupFn(element);
        var target = result[key];
        if (!target) {
            target = result[key] = [];
        }
        target.push(element);
    }
    return result;
}
exports.groupBy = groupBy;
function fromMap(original) {
    var result = Object.create(null);
    if (original) {
        original.forEach(function (value, key) {
            result[key] = value;
        });
    }
    return result;
}
exports.fromMap = fromMap;
function mapValues(map) {
    var result = [];
    map.forEach(function (v) { return result.push(v); });
    return result;
}
exports.mapValues = mapValues;
var SetMap = (function () {
    function SetMap() {
        this.map = new Map();
    }
    SetMap.prototype.add = function (key, value) {
        var values = this.map.get(key);
        if (!values) {
            values = new Set();
            this.map.set(key, values);
        }
        values.add(value);
    };
    SetMap.prototype.delete = function (key, value) {
        var values = this.map.get(key);
        if (!values) {
            return;
        }
        values.delete(value);
        if (values.size === 0) {
            this.map.delete(key);
        }
    };
    SetMap.prototype.forEach = function (key, fn) {
        var values = this.map.get(key);
        if (!values) {
            return;
        }
        values.forEach(fn);
    };
    return SetMap;
}());
exports.SetMap = SetMap;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _typeof = {
    number: 'number',
    string: 'string',
    undefined: 'undefined',
    object: 'object',
    function: 'function'
};
function isArray(array) {
    if (Array.isArray) {
        return Array.isArray(array);
    }
    if (array && typeof (array.length) === _typeof.number && array.constructor === Array) {
        return true;
    }
    return false;
}
exports.isArray = isArray;
function isString(str) {
    if (typeof (str) === _typeof.string || str instanceof String) {
        return true;
    }
    return false;
}
exports.isString = isString;
function isStringArray(value) {
    return isArray(value) && value.every(function (elem) { return isString(elem); });
}
exports.isStringArray = isStringArray;
function isObject(obj) {
    return typeof obj === _typeof.object
        && obj !== null
        && !Array.isArray(obj)
        && !(obj instanceof RegExp)
        && !(obj instanceof Date);
}
exports.isObject = isObject;
function isNumber(obj) {
    if ((typeof (obj) === _typeof.number || obj instanceof Number) && !isNaN(obj)) {
        return true;
    }
    return false;
}
exports.isNumber = isNumber;
function isBoolean(obj) {
    return obj === true || obj === false;
}
exports.isBoolean = isBoolean;
function isUndefined(obj) {
    return typeof (obj) === _typeof.undefined;
}
exports.isUndefined = isUndefined;
function isUndefinedOrNull(obj) {
    return isUndefined(obj) || obj === null;
}
exports.isUndefinedOrNull = isUndefinedOrNull;
function assertType(condition, type) {
    if (!condition) {
        throw new Error(type ? "Unexpected type, expected '" + type + "'" : 'Unexpected type');
    }
}
exports.assertType = assertType;
function assertIsDefined(arg) {
    if (isUndefinedOrNull(arg)) {
        throw new Error('Assertion Failed: argument is undefined or null');
    }
    return arg;
}
exports.assertIsDefined = assertIsDefined;
function assertAllDefined() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var result = [];
    for (var i = 0; i < args.length; i++) {
        var arg = args[i];
        if (isUndefinedOrNull(arg)) {
            throw new Error("Assertion Failed: argument at index " + i + " is undefined or null");
        }
        result.push(arg);
    }
    return result;
}
exports.assertAllDefined = assertAllDefined;
var hasOwnProperty = Object.prototype.hasOwnProperty;
function isEmptyObject(obj) {
    if (!isObject(obj)) {
        return false;
    }
    for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) {
            return false;
        }
    }
    return true;
}
exports.isEmptyObject = isEmptyObject;
function isFunction(obj) {
    return typeof obj === _typeof.function;
}
exports.isFunction = isFunction;
function areFunctions() {
    var objects = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        objects[_i] = arguments[_i];
    }
    return objects.length > 0 && objects.every(isFunction);
}
exports.areFunctions = areFunctions;
function validateConstraints(args, constraints) {
    var len = Math.min(args.length, constraints.length);
    for (var i = 0; i < len; i++) {
        validateConstraint(args[i], constraints[i]);
    }
}
exports.validateConstraints = validateConstraints;
function validateConstraint(arg, constraint) {
    if (isString(constraint)) {
        if (typeof arg !== constraint) {
            throw new Error("argument does not match constraint: typeof " + constraint);
        }
    }
    else if (isFunction(constraint)) {
        try {
            if (arg instanceof constraint) {
                return;
            }
        }
        catch (_a) {
        }
        if (!isUndefinedOrNull(arg) && arg.constructor === constraint) {
            return;
        }
        if (constraint.length === 1 && constraint.call(undefined, arg) === true) {
            return;
        }
        throw new Error("argument does not match one of these constraints: arg instanceof constraint, arg.constructor === constraint, nor constraint(arg) === true");
    }
}
exports.validateConstraint = validateConstraint;
function getAllPropertyNames(obj) {
    var res = [];
    var proto = Object.getPrototypeOf(obj);
    while (Object.prototype !== proto) {
        res = res.concat(Object.getOwnPropertyNames(proto));
        proto = Object.getPrototypeOf(proto);
    }
    return res;
}
exports.getAllPropertyNames = getAllPropertyNames;
function getAllMethodNames(obj) {
    var methods = [];
    for (var _i = 0, _a = getAllPropertyNames(obj); _i < _a.length; _i++) {
        var prop = _a[_i];
        if (typeof obj[prop] === 'function') {
            methods.push(prop);
        }
    }
    return methods;
}
exports.getAllMethodNames = getAllMethodNames;
function createProxyObject(methodNames, invoke) {
    var createProxyMethod = function (method) {
        return function () {
            var args = Array.prototype.slice.call(arguments, 0);
            return invoke(method, args);
        };
    };
    var result = {};
    for (var _i = 0, methodNames_1 = methodNames; _i < methodNames_1.length; _i++) {
        var methodName = methodNames_1[_i];
        result[methodName] = createProxyMethod(methodName);
    }
    return result;
}
exports.createProxyObject = createProxyObject;
function withNullAsUndefined(x) {
    return x === null ? undefined : x;
}
exports.withNullAsUndefined = withNullAsUndefined;
function withUndefinedAsNull(x) {
    return typeof x === 'undefined' ? null : x;
}
exports.withUndefinedAsNull = withUndefinedAsNull;

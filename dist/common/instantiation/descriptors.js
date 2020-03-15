"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SyncDescriptor = (function () {
    function SyncDescriptor(ctor, staticArguments, supportsDelayedInstantiation) {
        if (staticArguments === void 0) { staticArguments = []; }
        if (supportsDelayedInstantiation === void 0) { supportsDelayedInstantiation = false; }
        this.ctor = ctor;
        this.staticArguments = staticArguments;
        this.supportsDelayedInstantiation = supportsDelayedInstantiation;
    }
    return SyncDescriptor;
}());
exports.SyncDescriptor = SyncDescriptor;
exports.createSyncDescriptor = function (ctor) {
    var staticArguments = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        staticArguments[_i - 1] = arguments[_i];
    }
    return new SyncDescriptor(ctor, staticArguments);
};

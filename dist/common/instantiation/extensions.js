"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var descriptors_1 = require("./descriptors");
var _registry = [];
function registerSingleton(id, ctor, supportsDelayedInstantiation) {
    _registry.push([id, new descriptors_1.SyncDescriptor(ctor, [], supportsDelayedInstantiation)]);
}
exports.registerSingleton = registerSingleton;
function getSingletonServiceDescriptors() {
    return _registry;
}
exports.getSingletonServiceDescriptors = getSingletonServiceDescriptors;

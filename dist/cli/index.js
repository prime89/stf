#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var yargs = require("yargs");
var global = require("../common/global");
var serviceCollection_1 = require("../common/instantiation/serviceCollection");
var notifier_1 = require("../services/master/notifier");
var configurationService_1 = require("../services/base/interface/configurationService");
var descriptors_1 = require("../common/instantiation/descriptors");
var api_1 = require("../services/master/api");
var instantiationService_1 = require("../common/instantiation/instantiationService");
var instantiation_1 = require("../common/instantiation/instantiation");
var logService_1 = require("../services/base/logService");
var logService_2 = require("../services/base/interface/logService");
function buildArgv(argv) {
    var _argv = argv
        .options({
        s: {
            type: 'array',
            alias: 'services',
            demandOption: true,
        },
        e: {
            choices: global.envs,
            alias: 'env',
            default: 'dev',
        }
    }).argv;
    return _argv;
}
function startHandler(argv) {
    global.updateEnv(argv.e);
    var configurationService = new configurationService_1.ConfigurationService();
    var serviceCollection = new serviceCollection_1.ServiceCollection();
    serviceCollection.set(configurationService_1.IConfigurationService, configurationService);
    serviceCollection.set(logService_2.ILogService, new descriptors_1.SyncDescriptor(logService_1.LogService));
    serviceCollection.set(notifier_1.INotifierService, new descriptors_1.SyncDescriptor(notifier_1.NotifierService));
    serviceCollection.set(api_1.IApiService, new descriptors_1.SyncDescriptor(api_1.ApiService));
    var instantiationService = new instantiationService_1.InstantiationService(serviceCollection);
    instantiationService.invokeFunction(function (accessor) {
        var _services = argv.s;
        _services.forEach(function (s) {
            var serviceKey = s + "Service";
            var serviceIdentifier = instantiation_1._util.serviceIds.get(serviceKey);
            var service = accessor.get(serviceIdentifier);
            service.start();
        });
    });
}
function stopHandler(argv) {
}
yargs.usage('Usage: $0 [options]')
    .command('start', 'Start the service', buildArgv, startHandler)
    .command('stop', 'Stop the service', buildArgv, stopHandler)
    .example('$0 -s api', 'start api service')
    .help('h')
    .alias('h', 'help')
    .epilog('copyright 2020')
    .argv;

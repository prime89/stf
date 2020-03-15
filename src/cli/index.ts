#!/usr/bin/env node
import * as yargs from 'yargs';
import * as global from 'lib/common/global';
import { ServiceCollection } from 'lib/common/instantiation/serviceCollection';
import { INotifierService, NotifierService } from 'lib/services/master/notifier';
import { IConfigurationService, ConfigurationService } from 'lib/services/base/interface/configurationService';
import { SyncDescriptor } from 'lib/common/instantiation/descriptors';
import { IApiService, ApiService } from 'lib/services/master/api';
import { InstantiationService } from 'lib/common/instantiation/instantiationService';
import { _util } from 'lib/common/instantiation/instantiation';
import { IServer } from 'lib/common/server';
import { LogService } from 'lib/services/base/logService';
import { ILogService } from 'lib/services/base/interface/logService';

interface Arguments {
    [x: string]: unknown;
    s: (string | number)[];
    e: string;
}
function buildArgv(argv: yargs.Argv<{}>): Arguments {
    const _argv = argv
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

function startHandler(argv: Arguments): void {
    global.updateEnv(argv.e as global.Env);

    const configurationService = new ConfigurationService();

    const serviceCollection = new ServiceCollection();
    serviceCollection.set(IConfigurationService, configurationService);
    serviceCollection.set(ILogService, new SyncDescriptor(LogService));
    serviceCollection.set(INotifierService, new SyncDescriptor(NotifierService));
    serviceCollection.set(IApiService, new SyncDescriptor(ApiService));

    const instantiationService = new InstantiationService(serviceCollection);
    instantiationService.invokeFunction(accessor => {
        const _services = argv.s;
        _services.forEach((s: string): void => {
            const serviceKey = `${s}Service`;
            const serviceIdentifier = _util.serviceIds.get(serviceKey);
            const service: IServer = accessor.get(serviceIdentifier);
            service.start();
        });
    });
}

function stopHandler(argv: Arguments): void {

}

yargs.usage('Usage: $0 [options]')
    .command('start', 'Start the service', buildArgv, startHandler)
    .command('stop', 'Stop the service', buildArgv, stopHandler)
    .example('$0 -s api', 'start api service')
    .help('h')
    .alias('h', 'help')
    .epilog('copyright 2020')
    .argv;

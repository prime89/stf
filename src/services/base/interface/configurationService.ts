import * as path from 'path';
import * as fs from 'fs';
import * as yaml from 'yaml';
import * as global from 'lib/common/global';
import { isObject } from 'lib/common/types';
import { createDecorator } from 'lib/common/instantiation/instantiation';

function mixin(destination: any, source: any): any {

    if (!isObject(destination)) {
        return source;
    }

    if (isObject(source)) {
        Object.keys(source).forEach(key => {
            if (isObject(destination[key]) && isObject(source[key])) {
                mixin(destination[key], source[key]);
            } else {
                destination[key] = source[key];
            }
        });
    }

    return destination;
}

type ConfigurationModel = {
    [key: string]: any;
}

export const IConfigurationService = createDecorator<IConfigurationService>('configurationService');

export interface IConfigurationService {
    _serviceBrand: undefined;
    configuration: ConfigurationModel;
}

export class ConfigurationService implements IConfigurationService {
    _serviceBrand: undefined;
    configuration: ConfigurationModel;

    constructor() {
        const basePath = path.resolve(global.basedir, 'configs');
        const baseConfigFileContent = fs.readFileSync(path.resolve(basePath, 'env.yaml'), 'utf8');
        const baseConfiguration = yaml.parse(baseConfigFileContent);

        if (global.env !== 'prod') {
            const specifiedConfigFileContent = fs.readFileSync(path.resolve(basePath, `env_${global.env}.yaml`), 'utf8');
            const specifiedConfiguration = yaml.parse(specifiedConfigFileContent);
            mixin(baseConfiguration, specifiedConfiguration);
        }
        
        this.configuration = baseConfiguration;
    }
}
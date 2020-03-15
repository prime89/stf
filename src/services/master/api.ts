import * as Koa from 'koa';
import { createDecorator } from "lib/common/instantiation/instantiation";
import { IServer } from "lib/common/server";
import { IConfigurationService } from '../base/interface/configurationService';
import { ILogService } from '../base/interface/logService';


export const IApiService = createDecorator<IServer>('apiService');

export class ApiService implements IServer {

    constructor(
        @IConfigurationService private readonly _configrationService: IConfigurationService,
        @ILogService private readonly _logService: ILogService,
    ) {
    }

    start(): void {
        const app = new Koa();

        app.use(async ctx => {
            ctx.body = 'Hello world';
        });

        const port = this._configrationService.configuration.api.port;
        this._logService.info('Start api server, listen on port [%d]', port);
        app.listen(port);
    }
    stop(): void {

    }
}
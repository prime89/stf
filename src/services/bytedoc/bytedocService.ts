import { Connection, createConnection } from 'mongoose';
import { IConfigurationService } from 'lib/services/base/interface/configurationService';
import { IDatabaseService } from 'lib/services/base/interface/databaseService';

export let autoIndex = true;

export let goingDown = false;


export class BytedocService implements IDatabaseService{
    public _serviceBrand: undefined;
    public name: string = 'bytedoc';
    private _records: string[];
    private _models: object;
    public connection: Connection;

    public get models(): any {
        return this._models;
    }
    
    constructor(
        @IConfigurationService private readonly _configurationService: IConfigurationService,
    ) {
        this._records = _configurationService.configuration.db.url;
        this._createConnection();
    }

    private _createConnection(): void {
        const url = `mongodb://${this._records.join(',')}/stf`;

        this.connection = createConnection(url, {
            useNewUrlParser: true,
            autoIndex: autoIndex || false,
            useFindAndModify: false,
            useUnifiedTopology: true,
        });

        this.connection.on('error', this._onError);
        this.connection.on('disconnected', this._onDisconnected);

    }

    private _onError(): void {

    }

    private _onDisconnected(): void {
        this.connection.removeListener('disconnected', this._onDisconnected);
        this.connection.close();

        if (goingDown) {

        }
    }
}


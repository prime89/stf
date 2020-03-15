import * as http from 'http';
import * as net from 'net';
import * as url from 'url';
import * as SocketIO from 'socket.io';
import { IServer } from 'lib/common/server';
import { NetPackage } from 'lib/common/package';
import { EtcdService } from 'lib/common/etcd';
import { createDecorator } from 'lib/common/instantiation/instantiation';
import { IConfigurationService } from '../base/interface/configurationService';
import { IDeviceService, IDevice } from '../dao/deviceService';
import { IDeviceSocketPoolService, IDeviceProcessorPoolService } from '../base/deviceProcessorPoolService';
import { ILogService } from '../base/interface/logService';

type INetOptions = { port: number; host: string; client: SocketIO.Socket; };

class Session {
    private _frontendSocket: SocketIO.Socket;
    private _backendSocket: net.Socket;
    private _netPackage: NetPackage;

    constructor(
        _frontendSocket: SocketIO.Socket,
        _backendSocket: net.Socket,
    ) {
        this._backendSocket = _backendSocket;
        this._frontendSocket = _frontendSocket;
        this._backendSocket.on('timeout', this._onBackendSocketTimeout);
        this._netPackage = new NetPackage(_backendSocket);

        this._netPackage.on('data', this._recieveDataFromBackend)
        this._registerListeners();
    }

    private _recieveDataFromBackend(data: Buffer) {
        // this._frontendSocket.emit(data);
    }

    private _registerListeners() {
        this._frontendSocket.on('clipboard.paste', this._clipboardPaste)
    }

    private _onBackendSocketTimeout() {
        
    }

    private _clipboardPaste(data) {
        this._netPackage.send(data)
    }
}

export const INotifierService = createDecorator<IServer>('notifierService');

export class NotifierService implements IServer {
    private _server: SocketIO.Server;
    private _etcdService: EtcdService;
    constructor(
        @IConfigurationService private readonly _configurationService: IConfigurationService,
        @ILogService private readonly _logService: ILogService,
        @IDeviceProcessorPoolService private readonly _deviceSocketPoolService: IDeviceProcessorPoolService,
    ) {
        // this._etcdService = new EtcdService();

        const server: http.Server = http.createServer();
        this._server = SocketIO(server);
        this._server.use(this._parseRequest);
        this._server.on('connection', this._onConnect);
    }

    private _parseRequest(socket: SocketIO.Socket, next: () => void) {
        const req = socket.request;
        req.parseUrl = url.parse(req.url, true);
        next();
    }

    private _connectDeviceControlServer(options: INetOptions) {
        const socket = net.connect(options.port, options.host);
        return socket;
    }

    private async _onConnect(socket: SocketIO.Socket) {
        const query: any = socket.request.query;
        const serial: string = query.serial;

        let deviceSocket = await this._deviceSocketPoolService.get(serial);
        
        socket.on('clipboard.paste', deviceSocket.onClipboardPaste);
    }

    private async _bindListeners(serial: string, socket: SocketIO.Socket) {
        
        
    }

    start(): void {
    }

    stop(): void {

    }
    
}
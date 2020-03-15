import * as net from 'net';
import * as events from 'events';
import { IDeviceService } from '../dao/deviceService';
import { Device } from '../bytedoc/impl/deviceService';
import { createDecorator } from 'lib/common/instantiation/instantiation';
import { NetPackage } from 'lib/common/package';
import { ILogService } from './interface/logService';

export namespace DeviceProcessorPool {
    export const containers = new Map<string, DeviceProcessor>();
}

export interface Event<T> {
	(listener: (e: T) => any, thisArgs?: any): void;
}

class Emitter<T> {
    _event: Event<T>;

    get event(): Event<T> {
        if (!this._event) {
            this._event = (listener: (e: T) => any, thisArgs?: any) => {
                
            }
        }
    }
}

export class DeviceProcessor extends events.EventEmitter{
    socket: net.Socket;
    serial: string;
    netPackage: NetPackage;

    protected readonly _onClipboardPaste = new Emitter<>;
    public get onClipboardPaste() {
        return this._onClipboardPaste.event;
    }

    constructor(serial: string, socket: net.Socket) {
        super();
        this.serial = serial;
        this.socket = socket;
        this.netPackage = new NetPackage(this.socket);

        this._bindListeners();
    }

    private _bindListeners() {
        this.socket.on('close', this._onSocketClose);
    }

    private _onSocketClose() {
        DeviceProcessorPool.containers.delete(this.serial);
        this.emit('destroyed');
    }


}

export const IDeviceProcessorPoolService = createDecorator<IDeviceProcessorPoolService>('deviceProcessorPoolService');

export interface IDeviceProcessorPoolService {
    get(serial: string): Promise<DeviceProcessor>;
}

export class DeviceSocketPoolService implements IDeviceSocketPoolService {

    constructor(
        @ILogService private readonly _logService: ILogService,
        @IDeviceService private readonly _deviceService: IDeviceService,
    ) {

    }

    async get(serial: string): Promise<DeviceProcessor>{
        let processor = DeviceProcessorPool.containers.get(serial);
        if (!processor) {
            processor = await this._ensureDeviceProcessorActive(serial, 3)
        }
        return processor;
    }

    private async _ensureDeviceProcessorActive(serial, retries: number): Promise<DeviceProcessor> {
        if (retries === 0) {
            return null;
        }
        const device = await this._deviceService.findOne(serial);
        const backendSocket = net.connect(device.port, device.host);
        let socket = new DeviceProcessor(serial, backendSocket);

        return new Promise(r => {
            backendSocket.on('connect', () => {
                r();
            });
        }).then(() => {
            return socket;
        }).catch((e) => {
            return this._ensureDeviceProcessorActive(serial, --retries);
        }).finally(() => {
            return socket;
        });
    }
}
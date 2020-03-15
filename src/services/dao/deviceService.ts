import { createDecorator } from "lib/common/instantiation/instantiation";

export interface IDevice {
    port: number;
    host: string;
}

export const IDeviceService = createDecorator<IDeviceService>('deviceService');

export interface IDeviceService {
    _serviceBrand: undefined;

    findOne(serial: string): Promise<IDevice>;
}
import { createDecorator } from "lib/common/instantiation/instantiation";

export interface IUser {
    name: string;
    email: string;
}

export const IUserService = createDecorator<IUserService>('deviceService');

export interface IUserService {
    _serviceBrand: undefined;

    findAll(): IUser[];
}
import { createDecorator } from "lib/common/instantiation/instantiation";

export const IDatabaseService = createDecorator<IDatabaseService>('databaseService');

export interface IDatabaseService {
    _serviceBrand: undefined;
    name: string;

    connection: any;
}

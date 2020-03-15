import { createDecorator } from "lib/common/instantiation/instantiation";

export type LogLevel = 'debug' | 'info' | 'notice' | 'warning' | 'error' | 'crit' | 'alert' | 'emerg';

export const ILogService = createDecorator<ILogService>('logService');

interface LogEntry {
    level: string;
    message: string;
    [optionName: string]: any;
}

interface LoggerMethod {
    (entry: LogEntry): ILogService
}

export interface ILogService {
    _serviceBrand: undefined;

    fatal(message: string, ...meta: any[]): ILogService;

    error(message: string, ...meta: any[]): ILogService;

    warn(message: string, ...meta: any[]): ILogService;

    info(message: string, ...meta: any[]): ILogService;

    debug(message: string, ...meta: any[]): ILogService;

    trace(message: string, ...meta: any[]): ILogService;
}
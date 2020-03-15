import * as fs from 'fs';
import * as path from 'path';
import * as moment from 'moment';
import * as winston from 'winston';
import { SPLAT } from 'triple-beam';
import * as DaliyRotateFileTransport from 'winston-daily-rotate-file';
import * as mkdirp from 'mkdirp';
import * as stackTrace from 'stack-trace';
import { ILogService, LogLevel } from "./interface/logService";
import { IConfigurationService } from './interface/configurationService';
import * as global from 'lib/common/global';

const LEVELS = {
    fatal: 0,
    error: 1,
    warn: 2,
    info: 3,
    debug: 4,
    trace: 5,
}

const COLORS = {
    fatal: 'magenta',
    error: 'red',
    warn: 'yellow',
    info: 'green',
    debug: 'blue',
    trace: 'cyan'
};

function createSymlink(target: string, path: string) {
    fs.unlink(path, () => {
        fs.symlink(target, path, () => {});
    });
}


const DEFAULT_OPTIONS = {
    dirname: path.resolve(global.basedir, 'logs'),
    filename: 'dora',
    ext: '.log',
    level: 'info',
    enableConsoleLog: false,
    enableFileLog: true,
    frequency: '5h',
    callSiteFrameIndex: 1,
    prefix: undefined as string | string,
};

export type LoggerOptionsType = typeof DEFAULT_OPTIONS;

export interface LoggerArgsType {
    level?: string;
    date?: string;
    time?: string;
    location?: string;
    localIp?: string;
    logId?: string;
    message?: string;
    meta?: any[];
}

export class LogService implements ILogService {
    _serviceBrand: undefined;
    private _logger: winston.Logger;
    private _options: LoggerOptionsType;

    constructor(
        @IConfigurationService private readonly _configrationService: IConfigurationService,
    ) {
        const options = {
            ...DEFAULT_OPTIONS,
            ...this._configrationService.configuration.log
        } as LoggerOptionsType;

        this._options = options;

        this._logger = winston.createLogger({
            level: options.level,
            levels: LEVELS,
        });

        const upperCaseLevel = winston.format(info => {
            info.level = info.level.toUpperCase();
            return info;
        })();

        const splat = winston.format.splat();
        const colorize = winston.format.colorize({
            colors: COLORS,
        });

        const printf = winston.format.printf(info => {
            return `${info.level} ${info.date} ${info.time} ${info.location} ${info.logId} ${info.prefix}${info.message}`;
        });

        if (options.enableFileLog) {
            const dirname = this._tryCreateLogDir(options.dirname);
            const ext = options.ext;

            const datePattern = 'YYYY-MM-DD_HH';
            const fileTransport = new DaliyRotateFileTransport({
                level: options.level,
                format: winston.format.combine(upperCaseLevel, splat, printf),
                dirname,
                filename: `${options.filename}${ext}.%DATE%`,
                frequency: options.frequency,
                datePattern,
            });

            const source = path.resolve(dirname, `${options.filename}${ext}`);

            const target = path.resolve(dirname, `${options.filename}${ext}.${moment().format(datePattern)}`);

            createSymlink(target, source);

            fileTransport.on('rotate', (oldFilename, newFilename) => {
                createSymlink(newFilename, source);
            });
            this._logger.add(fileTransport);
        }

        if (options.enableConsoleLog) {
            const consoleTransport = new winston.transports.Console({
                level: options.level,
                format: winston.format.combine(
                    upperCaseLevel,
                    colorize,
                    splat,
                    printf,
                ),
            });
            this._logger.add(consoleTransport);
        }
    }

    log(args: LoggerArgsType = {}) : ILogService {
        const trace = stackTrace.get();

        const frame = trace.length ? trace[this._options.callSiteFrameIndex] : undefined;
        let filepath = '-';
        let lineno = '-';

        if (frame && typeof frame.getFileName === 'function') {
            const filename = frame.getFileName();
            if (filename) {
                filepath = path.relative(process.cwd(), filename);
            }
        }
        if (frame && typeof frame.getLineNumber === 'function') {
            lineno = frame.getLineNumber();
        }

        // 打印日志
        const now = moment();

        let level = args.level;
        if (!level || !LEVELS.hasOwnProperty(level)) {
            level = 'info';
        }

        this._logger.log({
            level,
            date: args.date || now.format('YYYY-MM-DD'),
            time: args.time || now.format('HH:mm:ss,SSS'),
            location: args.location || `${filepath}:${lineno}`,
            logId: args.logId || '-',
            message: args.message || '',
            [SPLAT]: args.meta || [],
            prefix: this._options.prefix || ''
        });
        return this;
    }

    fatal(message: string, ...meta: any[]): ILogService {
        return this.log({ level: 'fatal', message, meta });
    }
    error(message: string, ...meta: any[]): ILogService {
        return this.log({ level: 'error', message, meta });
    }
    warn(message: string, ...meta: any[]): ILogService {
        return this.log({ level: 'warn', message, meta });
    }
    info(message: string, ...meta: any[]): ILogService {
        return this.log({ level: 'info', message, meta });
    }
    debug(message: string, ...meta: any[]): ILogService {
        return this.log({ level: 'debug', message, meta });
    }
    trace(message: string, ...meta: any[]): ILogService {
        return this.log({ level: 'trace', message, meta });
    }

    private _tryCreateLogDir(dirname: string): string {
        if (fs.existsSync(dirname)) {
            return dirname;
        }

        try {
            mkdirp.sync(dirname);
            return dirname;
        } catch(e) {
            throw e;
        }
    }
}
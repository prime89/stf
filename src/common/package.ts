import { isUndefinedOrNull, isString } from "./types";
import * as net from 'net';
import * as events from 'events';

const _dataHeadLength = 4;

export class NetPackage extends events.EventEmitter{
    private _socket: net.Socket;
    private _bufferLength: number = 512;
    private _recievedDataLength: number;
    private _startPosition: number = 0;
    private _endPosition: number = 0;
    private _buffer: Buffer;


    public get availableLength(): number { return this._bufferLength - this._recievedDataLength; }

    constructor(_socket: net.Socket, bufferLength?: number) {
        super();
        this._buffer = Buffer.alloc(bufferLength || this._bufferLength);

        this._socket.on('data', (data) => {
            this._putData(data);
        })
    }

    public send(data: Buffer): void {
        const bodyBuffer = Buffer.from(data);
        const headBuffer = Buffer.alloc(_dataHeadLength);

        headBuffer.writeUInt32BE(bodyBuffer.byteLength, 0);

        const msgBuffer = new Buffer(headBuffer.length + bodyBuffer.length);
        headBuffer.copy(msgBuffer, 0, 0, headBuffer.length);
        bodyBuffer.copy(msgBuffer, headBuffer.length, 0, bodyBuffer.length);

        this._socket.write(msgBuffer);
    }


    private _putData(data: Buffer) {
        let start = 0;
        let availableLength = this.availableLength;
        let dataLength = data.length;

        if (availableLength < dataLength) {
            let extLength = Math.ceil((this._bufferLength + dataLength) / 512) * 512;
            let tempBuffer = Buffer.alloc(extLength);
            this._bufferLength = extLength;

            if (this._startPosition < this._endPosition) {
                let dataTailLen = this._bufferLength - this._endPosition;
                this._buffer.copy(tempBuffer, 0, this._endPosition, this._endPosition + dataTailLen);
                this._buffer.copy(tempBuffer, dataTailLen, 0, this._startPosition);
            } else {
                this._buffer.copy(tempBuffer, 0, this._endPosition, this._startPosition);
            }

            this._buffer = tempBuffer;
            tempBuffer = null;

            this._endPosition = 0;
            this._startPosition = dataLength;
            data.copy(this._buffer, this._startPosition, start, start + dataLength);

            this._recievedDataLength += dataLength;
            this._startPosition += dataLength;
        } else if (this._startPosition + dataLength > this._bufferLength){
            let bufferTailLength = this._bufferLength - this._startPosition;
            if (bufferTailLength < 0) {
                console.log('程序有漏洞，bufferTailLength < 0 ');
            }
            // 数据尾部位置
            let dataEndPosition = start + bufferTailLength;
            data.copy(this._buffer, this._startPosition, start, dataEndPosition);

            this._startPosition = 0;
            start = dataEndPosition;

            // data剩余未拷贝进缓存的长度
            let unDataCopyLen = dataLength - bufferTailLength;
            data.copy(this._buffer, this._startPosition, start, start + unDataCopyLen);
            // 记录数据长度
            this._recievedDataLength += dataLength;
            // 记录buffer可写位置
            this._startPosition += unDataCopyLen;
        } else {
            data.copy(this._buffer, this._startPosition, start, start + dataLength);

            if (this._startPosition > this._bufferLength) {
                console.log('程序有漏洞');
            }
            // 记录数据长度
            this._recievedDataLength += dataLength;
            // 记录buffer可写位置
            this._startPosition += dataLength;
        }


        this._read();
    }

    private _read() {
        while (true) {
            // 没有数据可读,不够解析出包头
            if (this._getDataLength() <= _dataHeadLength) {
                break;
            }
            // 解析包头长度
            // 尾部最后剩余可读字节长度
            let buffLastCanReadLen = this._bufferLength - this._endPosition;
            let dataLen = 0;
            let headBuffer = Buffer.alloc(_dataHeadLength);
            // 数据包为分段存储，不能直接解析出包头
            if (buffLastCanReadLen < _dataHeadLength) {
                // 取出第一部分头部字节
                this._buffer.copy(headBuffer, 0, this._endPosition, this._buffer.length);
                // 取出第二部分头部字节
                let unReadHeadLen = _dataHeadLength - buffLastCanReadLen;
                this._buffer.copy(headBuffer, buffLastCanReadLen, 0, unReadHeadLen);
                // 默认大端接收数据
                dataLen = headBuffer.readUInt32BE(0) + _dataHeadLength;
            }
            else {
                this._buffer.copy(headBuffer, 0, this._endPosition, this._endPosition + _dataHeadLength);
                dataLen = headBuffer.readUInt32BE(0);
                dataLen += _dataHeadLength;
            }
            // 数据长度不够读取，直接返回
            if (this._getDataLength() < dataLen) {
                break;
            }
            // 数据够读，读取数据包 
            else {
                let readData = Buffer.alloc(dataLen);
                // 数据是分段存储，需要分两次读取
                if (this._bufferLength - this._endPosition < dataLen) {
                    let firstPartLen = this._bufferLength - this._endPosition;
                    // 读取第一部分，直接到字符尾部的数据
                    this._buffer.copy(readData, 0, this._endPosition, firstPartLen + this._endPosition);
                    // 读取第二部分，存储在开头的数据
                    let secondPartLen = dataLen - firstPartLen;
                    this._buffer.copy(readData, firstPartLen, 0, secondPartLen);
                    this._endPosition = secondPartLen;
                }
                // 直接读取数据
                else {
                    this._buffer.copy(readData, 0, this._endPosition, this._endPosition + dataLen);
                    this._endPosition += dataLen;
                }


                this._onData(readData);
                this._recievedDataLength -= readData.length;
                // 已经读取完所有数据
                if (this._endPosition === this._startPosition) {
                    break;
                }
            }
        }
    }

    private _getDataLength() {
        let dataLen = 0;
        // 缓存全满
        if (this._recievedDataLength === this._bufferLength && this._startPosition >= this._endPosition) {
            dataLen = this._bufferLength;
        }
        // 缓存全部数据读空
        else if (this._startPosition >= this._endPosition) {
            dataLen = this._startPosition - this._endPosition;
        }
        else {
            dataLen = this._bufferLength - this._endPosition + this._startPosition;
        }

        if (dataLen !== this._recievedDataLength) {
            console.log('程序有漏洞,dataLen长度不合法');
        }
        return dataLen;
    }

    private _onData(data: Buffer) {
        const head = new Buffer(_dataHeadLength);
        data.copy(head, 0, 0, _dataHeadLength);

        const dataLength = head.readUInt32BE(0);
        const body = new Buffer(dataLength);
        data.copy(body, 0, _dataHeadLength, _dataHeadLength + dataLength);

        this.emit('data', body);
    }
}
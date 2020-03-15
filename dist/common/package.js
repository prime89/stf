"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var events = require("events");
var _dataHeadLength = 4;
var NetPackage = (function (_super) {
    __extends(NetPackage, _super);
    function NetPackage(_socket, bufferLength) {
        var _this = _super.call(this) || this;
        _this._bufferLength = 512;
        _this._startPosition = 0;
        _this._endPosition = 0;
        _this._buffer = Buffer.alloc(bufferLength || _this._bufferLength);
        _this._socket.on('data', function (data) {
            _this._putData(data);
        });
        return _this;
    }
    Object.defineProperty(NetPackage.prototype, "availableLength", {
        get: function () { return this._bufferLength - this._recievedDataLength; },
        enumerable: true,
        configurable: true
    });
    NetPackage.prototype.send = function (data) {
        var bodyBuffer = Buffer.from(data);
        var headBuffer = Buffer.alloc(_dataHeadLength);
        headBuffer.writeUInt32BE(bodyBuffer.byteLength, 0);
        var msgBuffer = new Buffer(headBuffer.length + bodyBuffer.length);
        headBuffer.copy(msgBuffer, 0, 0, headBuffer.length);
        bodyBuffer.copy(msgBuffer, headBuffer.length, 0, bodyBuffer.length);
        this._socket.write(msgBuffer);
    };
    NetPackage.prototype._putData = function (data) {
        var start = 0;
        var availableLength = this.availableLength;
        var dataLength = data.length;
        if (availableLength < dataLength) {
            var extLength = Math.ceil((this._bufferLength + dataLength) / 512) * 512;
            var tempBuffer = Buffer.alloc(extLength);
            this._bufferLength = extLength;
            if (this._startPosition < this._endPosition) {
                var dataTailLen = this._bufferLength - this._endPosition;
                this._buffer.copy(tempBuffer, 0, this._endPosition, this._endPosition + dataTailLen);
                this._buffer.copy(tempBuffer, dataTailLen, 0, this._startPosition);
            }
            else {
                this._buffer.copy(tempBuffer, 0, this._endPosition, this._startPosition);
            }
            this._buffer = tempBuffer;
            tempBuffer = null;
            this._endPosition = 0;
            this._startPosition = dataLength;
            data.copy(this._buffer, this._startPosition, start, start + dataLength);
            this._recievedDataLength += dataLength;
            this._startPosition += dataLength;
        }
        else if (this._startPosition + dataLength > this._bufferLength) {
            var bufferTailLength = this._bufferLength - this._startPosition;
            if (bufferTailLength < 0) {
                console.log('程序有漏洞，bufferTailLength < 0 ');
            }
            var dataEndPosition = start + bufferTailLength;
            data.copy(this._buffer, this._startPosition, start, dataEndPosition);
            this._startPosition = 0;
            start = dataEndPosition;
            var unDataCopyLen = dataLength - bufferTailLength;
            data.copy(this._buffer, this._startPosition, start, start + unDataCopyLen);
            this._recievedDataLength += dataLength;
            this._startPosition += unDataCopyLen;
        }
        else {
            data.copy(this._buffer, this._startPosition, start, start + dataLength);
            if (this._startPosition > this._bufferLength) {
                console.log('程序有漏洞');
            }
            this._recievedDataLength += dataLength;
            this._startPosition += dataLength;
        }
        this._read();
    };
    NetPackage.prototype._read = function () {
        while (true) {
            if (this._getDataLength() <= _dataHeadLength) {
                break;
            }
            var buffLastCanReadLen = this._bufferLength - this._endPosition;
            var dataLen = 0;
            var headBuffer = Buffer.alloc(_dataHeadLength);
            if (buffLastCanReadLen < _dataHeadLength) {
                this._buffer.copy(headBuffer, 0, this._endPosition, this._buffer.length);
                var unReadHeadLen = _dataHeadLength - buffLastCanReadLen;
                this._buffer.copy(headBuffer, buffLastCanReadLen, 0, unReadHeadLen);
                dataLen = headBuffer.readUInt32BE(0) + _dataHeadLength;
            }
            else {
                this._buffer.copy(headBuffer, 0, this._endPosition, this._endPosition + _dataHeadLength);
                dataLen = headBuffer.readUInt32BE(0);
                dataLen += _dataHeadLength;
            }
            if (this._getDataLength() < dataLen) {
                break;
            }
            else {
                var readData = Buffer.alloc(dataLen);
                if (this._bufferLength - this._endPosition < dataLen) {
                    var firstPartLen = this._bufferLength - this._endPosition;
                    this._buffer.copy(readData, 0, this._endPosition, firstPartLen + this._endPosition);
                    var secondPartLen = dataLen - firstPartLen;
                    this._buffer.copy(readData, firstPartLen, 0, secondPartLen);
                    this._endPosition = secondPartLen;
                }
                else {
                    this._buffer.copy(readData, 0, this._endPosition, this._endPosition + dataLen);
                    this._endPosition += dataLen;
                }
                this._onData(readData);
                this._recievedDataLength -= readData.length;
                if (this._endPosition === this._startPosition) {
                    break;
                }
            }
        }
    };
    NetPackage.prototype._getDataLength = function () {
        var dataLen = 0;
        if (this._recievedDataLength === this._bufferLength && this._startPosition >= this._endPosition) {
            dataLen = this._bufferLength;
        }
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
    };
    NetPackage.prototype._onData = function (data) {
        var head = new Buffer(_dataHeadLength);
        data.copy(head, 0, 0, _dataHeadLength);
        var dataLength = head.readUInt32BE(0);
        var body = new Buffer(dataLength);
        data.copy(body, 0, _dataHeadLength, _dataHeadLength + dataLength);
        this.emit('data', body);
    };
    return NetPackage;
}(events.EventEmitter));
exports.NetPackage = NetPackage;

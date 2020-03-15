import { prop, arrayProp, Ref, getModelForClass, ReturnModelType, mongoose } from "@typegoose/typegoose";
import { IDeviceService, IDevice } from "lib/services/dao/deviceService";
import { IDatabaseService } from "lib/services/base/interface/databaseService";

class Battery {
    @prop()
    public health: number;

    @prop()
    public level: number;
}

class DeviceDisplay {
    @prop()
    public width: number;

    @prop()
    public height: number;

    @prop()
    public url: string;
}

export class Device implements IDevice{
    @prop()
    public abi: string;

    @prop()
    public airplaneMode: boolean;

    @prop({ref: Battery})
    public battery: Ref<Battery>;

    @prop()
    public display: Ref<DeviceDisplay>;

    @prop({unique: true})
    public serial: string;

    @prop()
    public owner: string;

    @prop()
    public host: string;
    
    @prop()
    public port: number;
}

export class DeviceService implements IDeviceService {
    
    public _serviceBrand: undefined;
    public model: mongoose.Model<mongoose.Document>;
    
    constructor(
        @IDatabaseService private readonly _databaseService: IDatabaseService,
    ) {
        this.model = getModelForClass(Device, {
            existingConnection: _databaseService.connection
        });
    }

    async findOne(serial: string): Promise<IDevice> {
        const device = await this.model.findOne({serial}).lean();
        return device;
    }
}
import { prop, arrayProp, Ref, getModelForClass } from "@typegoose/typegoose";
import { IDatabaseService } from "lib/services/base/interface/databaseService";
import { IUserService } from "lib/services/dao/userService";

class AdbKey {
    @prop({index: true})
    public fingerprint: string;

    @prop()
    public title: string;
}

export class User {
    @prop({unique: true})
    public email: string;

    @arrayProp({itemsRef: AdbKey})
    public adbKeys: Ref<AdbKey>[];

    @prop()
    public group: string;

    @prop()
    public groupId: string;

    @prop()
    public ip: string;

    @prop()
    public lastLoggedInAt: Date;

    @prop({index: true})
    public name: string;
}

export class UserService implements IUserService {
    public _serviceBrand: undefined;
    public model: User;

    constructor(
        @IDatabaseService private readonly _databaseService: IDatabaseService,
    ) {
        this.model = getModelForClass(User, {
            existingConnection: _databaseService.connection
        });
    }

    findAll(): User[] {
        return [];
    }
}
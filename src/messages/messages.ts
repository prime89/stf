import { Message, Type, Field, OneOf } from "protobufjs/light";

export class RegisterDeviceMessage extends Message<RegisterDeviceMessage>{
    
    @Field.d(1, "string", "optional")
    public serial: string;
}


import { Message, Type, Field, OneOf } from "protobufjs/light";

export class ClipboardPasteMessage extends Message<ClipboardPasteMessage>{
    
    @Field.d(1, "string", "optional")
    public data: string;
}


import { registerSingleton } from "lib/common/instantiation/extensions";
import { IDatabaseService } from "lib/services/base/interface/databaseService";
import { IDeviceService } from 'lib/services/dao/deviceService';
import { IUserService } from "lib/services/dao/userService";
import { BytedocService } from "./bytedocService";
import { UserService } from "./impl/userService";
import { DeviceService } from "./impl/deviceService";

registerSingleton(IDatabaseService, BytedocService, false);
registerSingleton(IUserService, UserService, true);
registerSingleton(IDeviceService, DeviceService, true);

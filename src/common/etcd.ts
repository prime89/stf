// import { Etcd3 } from 'etcd3';
import { IConfigurationService } from 'lib/services/base/interface/configurationService';

export class EtcdService {
    constructor(
        @IConfigurationService private readonly _configurationService: IConfigurationService,
    ) {
        // this.client = new Etcd3();
    }
}
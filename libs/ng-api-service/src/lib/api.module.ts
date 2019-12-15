import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { ERROR_EVENTS_PROVIDER } from './providers/event-manager.provider';
import { SERVERS_INFO_PROVIDER } from './providers/servers.info.provider';

@NgModule({
    declarations: [],
    imports: [HttpClientModule],
    providers: [
        ERROR_EVENTS_PROVIDER,
        SERVERS_INFO_PROVIDER
    ]
})
export class ApiModule {
}

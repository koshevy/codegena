import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgHttpToolsModule } from '@codegena/ng-http-tools';
// Backend services
import { GetListsBackendService } from './get-lists/get-lists-backend.service';
import { CreateListBackendService } from './create-list/create-list-backend.service';
import { GetListBackendService } from './get-list/get-list-backend.service';
import { UpdateListBackendService } from './update-list/update-list-backend.service';
import { RewriteListBackendService } from './rewrite-list/rewrite-list-backend.service';
import { GetListItemsBackendService } from './get-list-items/get-list-items-backend.service';
import { CreateListItemBackendService } from './create-list-item/create-list-item-backend.service';
import { UpdateListItemBackendService } from './update-list-item/update-list-item-backend.service';
import { RewriteListItemBackendService } from './rewrite-list-item/rewrite-list-item-backend.service';

@NgModule({
    imports: [
        CommonModule,
        HttpClientModule,
        NgHttpToolsModule,
    ],
    providers: [
        GetListsBackendService,
CreateListBackendService,
GetListBackendService,
UpdateListBackendService,
RewriteListBackendService,
GetListItemsBackendService,
CreateListItemBackendService,
UpdateListItemBackendService,
RewriteListItemBackendService
    ],
})
export class ShopModule {}

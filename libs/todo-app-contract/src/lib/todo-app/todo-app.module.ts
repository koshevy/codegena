import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgHttpToolsModule } from '@codegena/ng-http-tools';
// Backend services
import { GetGroupsBackendService } from './get-groups/get-groups-backend.service';
import { CreateGroupBackendService } from './create-group/create-group-backend.service';
import { DeleteGroupBackendService } from './delete-group/delete-group-backend.service';
import { GetGroupBackendService } from './get-group/get-group-backend.service';
import { UpdateGroupBackendService } from './update-group/update-group-backend.service';
import { RewriteGroupBackendService } from './rewrite-group/rewrite-group-backend.service';
import { GetGroupItemsBackendService } from './get-group-items/get-group-items-backend.service';
import { CreateGroupItemBackendService } from './create-group-item/create-group-item-backend.service';
import { UpdateGroupItemBackendService } from './update-group-item/update-group-item-backend.service';
import { RewriteGroupItemBackendService } from './rewrite-group-item/rewrite-group-item-backend.service';
import { UpdateFewItemsBackendService } from './update-few-items/update-few-items-backend.service';

@NgModule({
    imports: [CommonModule, NgHttpToolsModule],
    providers: [
        GetGroupsBackendService,
        CreateGroupBackendService,
        DeleteGroupBackendService,
        GetGroupBackendService,
        UpdateGroupBackendService,
        RewriteGroupBackendService,
        GetGroupItemsBackendService,
        CreateGroupItemBackendService,
        UpdateGroupItemBackendService,
        RewriteGroupItemBackendService,
        UpdateFewItemsBackendService,
    ],
})
export class TodoAppModule {}

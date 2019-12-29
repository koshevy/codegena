import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { DragDropModule } from '@angular/cdk/drag-drop';
import { OverlayModule } from '@angular/cdk/overlay';
import { ObserversModule } from '@angular/cdk/observers';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import {
    ApiModule,
    API_ERROR_HANDLER
} from '@codegena/ng-api-service';

import { TodoAppRoutingModule } from './todo-app-routing.module';
import { TodoAppComponent } from './todo-app.component';
import { TodosGroupComponent } from './todos-groups/todos-group.component';
import { NoInternetComponent } from './todos-groups/no-internet/no-internet.component';

import {
    DeleteGroupService,
    GetGroupsService,
    GetGroupItemsService,
    UpdateFewItemsService,
    CreateGroupItemService,
    CreateGroupService,
    UpdateGroupService,
    UpdateGroupItemService,
} from '@codegena/todo-app-scheme';

import { EditGroupComponent } from './todos-groups/edit-group/edit-group.component';
import { TodoTasksComponent } from './todo-tasks/todo-tasks.component';
import { JsonValidationService } from './lib/json-validation.service';
import { ToasterService } from './lib/toaster.service';
import { ApiErrorHandlerService } from './lib/api-error-handler.service';
import { ConfirmationComponent } from './confirmation/confirmation.component';
import { ConfirmationService } from './confirmation/confirmation.service';
import { FroalaEditorModule, FroalaViewModule } from 'angular-froala-wysiwyg';

// Directives

import {
    ErrorValidationDirective,
    ERROR_DIRECTIVE_FLASH_PROVIDER
} from './lib/error-validation.directive';
import { NullableAccessorDirective } from './lib/nullable-accessor';
import { TaskListComponent } from './todo-tasks/task-list/task-list.component';

const API_SERVICES_PROVIDERS = [
    DeleteGroupService,
    GetGroupsService,
    GetGroupItemsService,
    CreateGroupService,
    UpdateFewItemsService,
    UpdateGroupService,
    UpdateGroupItemService,
    CreateGroupItemService
];

@NgModule({
    bootstrap: [TodoAppComponent],
    declarations: [
        ConfirmationComponent,
        EditGroupComponent,
        ErrorValidationDirective,
        NoInternetComponent,
        NullableAccessorDirective,
        TaskListComponent,
        TodoAppComponent,
        TodosGroupComponent,
        TodoTasksComponent,
    ],
    entryComponents: [
        EditGroupComponent,
        ConfirmationComponent,
        TaskListComponent,
    ],
    exports: [
        ConfirmationComponent,
        TaskListComponent,
        TodoAppComponent,
    ],
    imports: [
        ApiModule,
        RouterModule.forRoot([]),
        CommonModule,
        TodoAppRoutingModule,
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        FormsModule,
        ReactiveFormsModule,
        NgbModule,
        DragDropModule,
        MatBottomSheetModule,
        MatIconModule,
        MatListModule,
        MatProgressSpinnerModule,
        MatProgressBarModule,
        MatSnackBarModule,
        MatTooltipModule,
        OverlayModule,
        ObserversModule,
        FroalaEditorModule.forRoot(),
        FroalaViewModule.forRoot()
    ],
    providers: [
        ...API_SERVICES_PROVIDERS,
        ERROR_DIRECTIVE_FLASH_PROVIDER,
        ConfirmationService,
        JsonValidationService,
        ToasterService,
        {
            provide: API_ERROR_HANDLER,
            useClass: ApiErrorHandlerService
        }
    ]
})
export class TodoAppModule { }

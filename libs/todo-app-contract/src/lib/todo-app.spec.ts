import { TestBed } from '@angular/core/testing';
import {
    HttpHeaders,
    HttpErrorResponse,
    HttpClientModule,
} from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { pickResponse } from '@codegena/ng-http-tools/rx-operators';
import { NgHttpToolsModule } from '@codegena/ng-http-tools';
import * as faker from 'faker';
import { TodoAppModule } from './todo-app/todo-app.module';
import {
    GetGroupsBackendService,
    GetGroupsResponse,
    GetGroupBackendService,
    GetGroupResponse,
    CreateGroupBackendService,
    CreateGroupResponse,
} from './todo-app';

let createGroupBackend: CreateGroupBackendService;
let getGroupBackend: GetGroupBackendService;
let getGroupsBackend: GetGroupsBackendService;

describe('TodoAppModule', () => {
    beforeAll(() => {
        TestBed.configureTestingModule({
            imports: [
                TodoAppModule,
                HttpClientModule,
                NgHttpToolsModule.forModule({
                    shouldThrowOnFails: true,
                    formats: {},
                    unknownFormats: [],
                }),
            ],
        });

        createGroupBackend = TestBed.inject(CreateGroupBackendService);
        getGroupBackend = TestBed.inject(GetGroupBackendService);
        getGroupsBackend = TestBed.inject(GetGroupsBackendService);
    });

    it.skip('should create new group', (done) => {
        createGroupBackend
            .request({
                title: 'Another thing to do',
            })
            .pipe(pickResponse(201))
            .subscribe({
                next(result: CreateGroupResponse<201>): void {
                    console.log(result);
                },
                error(error): void {
                    console.error(error);
                    done();
                },
                complete(): void {
                    done();
                },
            });
    });

    it.skip('should get all groups', (done) => {
        getGroupsBackend
            .request({
                withItems: true,
            })
            .pipe(pickResponse(200))
            .subscribe({
                next(result: GetGroupsResponse<200>): void {
                    console.log(result);
                },
                error(error): void {
                    console.error(error);
                    done();
                },
                complete(): void {
                    done();
                },
            });
    });

    it('should handle 404 no such groupId', (done) => {
        const groupId = faker.random.alphaNumeric(16);
        // const groupId = 'pqVx-B4tp6bCdDoumjifj';

        getGroupBackend
            .request({ groupId })
            .pipe(pickResponse(404))
            .subscribe({
                next(result: GetGroupResponse<404>): void {
                    console.log(result.message);
                },
                error(error): void {
                    console.error(error);
                    done();
                },
                complete(): void {
                    done();
                },
            });
    });
});

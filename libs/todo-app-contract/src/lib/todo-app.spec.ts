import { EventEmitter, Provider } from '@angular/core';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import {
    HttpClientTestingModule,
    HttpTestingController,
} from '@angular/common/http/testing';
import { tap } from 'rxjs/operators';
import { pickResponse } from '@codegena/ng-http-tools/rx-operators';
import {
    NgHttpToolsModule,
    VALIDATION_ERROR_STREAM,
    ValidationError,
} from '@codegena/ng-http-tools';
import * as faker from 'faker';
import { TodoAppModule } from './todo-app/todo-app.module';
import {
    CreateGroupBackendService,
    CreateGroupResponse,
    GetGroupBackendService,
    GetGroupParameters,
    GetGroupResponse,
    GetGroupsBackendService,
    GetGroupsParameters,
    GetGroupsResponse,
    ToDoGroup,
    ToDoTask,
    UpdateGroupItemBackendService,
    UpdateGroupItemParameters,
    UpdateGroupItemRequest,
    UpdateGroupItemResponse,
} from './todo-app';

let createGroupBackend: CreateGroupBackendService;
let getGroupBackend: GetGroupBackendService;
let getGroupsBackend: GetGroupsBackendService;
let updateGroupItemBackend: UpdateGroupItemBackendService;
let httpController: HttpTestingController;

describe('Create url for default server environment', () => {
    beforeEach(() => {
        configureTestBed({
            shouldThrowOnFails: true,
        });
    });

    it('should create local-environment url', () => {
        expect(createGroupBackend.createUrl()).toContain('local.');
    });

    it('should create url with path and without query params', () => {
        const params: GetGroupParameters = { groupId: createMockUuid() };
        const url = getGroupBackend.createUrl(params, {}, true);

        expect(url).toContain(params.groupId);
        expect(url).not.toContain('?');
    });

    it('should create url with query and without path params', () => {
        const params: GetGroupsParameters = {
            isComplete: false,
            withItems: true,
        };
        const url = getGroupsBackend.createUrl(params, {}, true);

        expect(url).toContain('isComplete=false');
        expect(url).toContain('withItems=true');
        expect(url).toContain('?');
    });

    it('should create url with query and path params', () => {
        const params: UpdateGroupItemParameters = {
            groupId: createMockUuid(),
            itemId: createMockUuid(),
            forceSave: true,
        };
        const url = updateGroupItemBackend.createUrl(params, {}, true);

        expect(url).toContain(params.groupId);
        expect(url).toContain(params.itemId);
        expect(url).toContain('?forceSave=true');
    });
});

describe('Do requests for default server environment', () => {
    beforeEach(() => {
        configureTestBed({
            shouldThrowOnFails: true,
        });

        httpController = TestBed.inject(HttpTestingController);
    });

    it('should complete POST request with body and no params', fakeAsync(() => {
        const request = createGroupBackend
            .request({ title: 'Another thing to do' })
            .pipe(
                pickResponse(201),
                // Here gets checked generic type CreateGroupResponse
                tap((result: CreateGroupResponse<201>) => {
                    expect(result.uid).toBeTruthy();
                    expect(result.items).toEqual([]);
                })
            )
            .toPromise();

        tick();

        httpController
            .expectOne(createGroupBackend.createUrl())
            .flush(createMockGroup(), {
                status: 201,
                statusText: 'Created',
            });

        tick();

        return expect(request).resolves.toBeTruthy();
    }));

    it('should complete GET request with path params and no body', fakeAsync(() => {
        const params = { groupId: createMockUuid() };
        const request = getGroupBackend
            .request(params)
            .pipe(
                pickResponse(200),
                tap((result: GetGroupResponse<200>) => {
                    expect(result.uid).toBeTruthy();
                    expect(result.items).toEqual([]);
                })
            )
            .toPromise();

        tick();

        httpController
            .expectOne(getGroupBackend.createUrl(params, {}, true))
            .flush(createMockGroup(), {
                status: 200,
                statusText: 'Found',
            });

        tick();

        return expect(request).resolves.toBeTruthy();
    }));

    it('should complete GET request with query params and no body', fakeAsync(() => {
        const params = { withItems: true };
        const request = getGroupsBackend
            .request(params)
            .pipe(
                pickResponse(200),
                tap((result: GetGroupsResponse<200>) => {
                    expect(result).toHaveLength(1);
                    expect(result[0].items).toEqual([]);
                })
            )
            .toPromise();

        tick();

        httpController
            .expectOne(getGroupsBackend.createUrl(params, {}, true))
            .flush([createMockGroup()], {
                status: 200,
                statusText: 'Found',
            });

        tick();

        return expect(request).resolves.toBeTruthy();
    }));

    it('should complete PATCH request with params and body', fakeAsync(() => {
        const params: UpdateGroupItemParameters = {
            groupId: createMockUuid(),
            itemId: createMockUuid(),
            forceSave: true,
        };
        const body: UpdateGroupItemRequest = {
            title: faker.company.catchPhraseAdjective(),
            isDone: true,
            position: null,
            attachments: null,
        };
        const request = updateGroupItemBackend
            .request(params, body)
            .pipe(
                pickResponse(200),
                tap((result: UpdateGroupItemResponse<200>) => {
                    expect(result.title).toBeTruthy();
                    expect(result.isDone).toBeTruthy();
                })
            )
            .toPromise();

        tick();

        httpController
            .expectOne(updateGroupItemBackend.createUrl(params, {}, true))
            .flush(createMockGroupTask(), {
                status: 200,
                statusText: 'Found',
            });

        tick();

        return expect(request).resolves.toBeTruthy();
    }));

    it('should throw request validation error', fakeAsync(() => {
        const request = createGroupBackend
            .request({ wrongProp: 'Another thing to do' } as any)
            .pipe(pickResponse(201))
            .toPromise();

        const expectation = expect(request).rejects.toBeInstanceOf(
            ValidationError
        );
        tick();

        return expectation;
    }));

    it('should throw params validation error', fakeAsync(() => {
        const request = getGroupBackend
            .request({ wrongProp: 'Another thing to do' } as any)
            .pipe(pickResponse(201))
            .toPromise();

        const expectation = expect(request).rejects.toBeInstanceOf(
            ValidationError
        );
        tick();

        return expectation;
    }));

    it('should throw response validation error', fakeAsync(() => {
        const request = createGroupBackend
            .request({ title: 'Another thing to do' })
            .pipe(pickResponse(201))
            .toPromise();

        tick();

        httpController.expectOne(createGroupBackend.createUrl()).flush(
            {
                ...createMockGroup(),
                // wrong uid
                uid: faker.random.number(),
            },
            {
                status: 201,
                statusText: 'Created',
            }
        );

        const expectation = expect(request).rejects.toBeInstanceOf(
            ValidationError
        );
        tick();

        return expectation;
    }));

    it('should handle proper error response', fakeAsync(() => {
        const request = createGroupBackend
            .request({ title: 'Another thing to do' })
            .pipe(
                pickResponse(400),
                // Here gets checked generic type CreateGroupResponse
                tap((result: CreateGroupResponse<400>) => {
                    expect(result.message).toBeTruthy();
                })
            )
            .toPromise();

        tick();

        httpController.expectOne(createGroupBackend.createUrl()).flush(
            {
                message: 'Correct bad request error',
            },
            {
                status: 400,
                statusText: 'Created',
            }
        );

        tick();

        return expect(request).resolves.toBeTruthy();
    }));
});

describe('Validation error broadcast', () => {
    const validationErrorStream = new EventEmitter<any>();

    beforeEach(() => {
        configureTestBed(
            { shouldThrowOnFails: false },
            [
                {
                    provide: VALIDATION_ERROR_STREAM,
                    useValue: validationErrorStream,
                },
            ],
        );

        httpController = TestBed.inject(HttpTestingController);
    });

    it('should emit ValidationError in validation errors stream', fakeAsync(() => {
        createGroupBackend
            .request({ wrongProp: 'Another thing to do' } as any)
            .pipe(pickResponse(201))
            .subscribe();

        tick();

        const expectation = expect(validationErrorStream.toPromise())
            .resolves
            .toBeInstanceOf(ValidationError);

        httpController.expectOne(createGroupBackend.createUrl()).flush(
            {
                ...createMockGroup(),
                // wrong uid
                uid: faker.random.number(),
            },
            {
                status: 201,
                statusText: 'Created',
            },
        );

        tick();
        validationErrorStream.complete();

        return expectation;
    }));
});

describe('Create URL for dev environment', () => {
    beforeEach(() => {
        configureTestBed({
            serverEnvironment: {
                environment: 'dev',
            },
        });
    });

    it('should create dev-environment url', () => {
        expect(createGroupBackend.createUrl()).toContain('dev.');
    });
});

function configureTestBed(
    ngHttpToolsModuleParams: any,
    providers: Provider[] = [],
): void {
    TestBed.configureTestingModule({
        imports: [
            TodoAppModule,
            HttpClientTestingModule,
            NgHttpToolsModule.forModule(ngHttpToolsModuleParams),
        ],
        providers,
    });

    createGroupBackend = TestBed.inject(CreateGroupBackendService);
    getGroupBackend = TestBed.inject(GetGroupBackendService);
    getGroupsBackend = TestBed.inject(GetGroupsBackendService);
    updateGroupItemBackend = TestBed.inject(UpdateGroupItemBackendService);
}

function createMockGroup(): ToDoGroup {
    return {
        dateChanged: faker.date.recent(1).toISOString(),
        dateCreated: faker.date.recent(2).toISOString(),
        isComplete: null,
        title: faker.company.catchPhraseDescriptor(),
        items: [],
        uid: createMockUuid(),
    };
}

function createMockGroupTask(): ToDoTask {
    return {
        dateChanged: faker.date.recent(1).toISOString(),
        dateCreated: faker.date.recent(2).toISOString(),
        position: 0,
        isDone: true,
        title: faker.company.catchPhraseDescriptor(),
        uid: createMockUuid(),
    };
}

function createMockUuid(): string {
    return faker.random.alphaNumeric(21);
}

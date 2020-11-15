import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import {
    HttpClientTestingModule,
    HttpTestingController,
} from '@angular/common/http/testing';
import { pickResponse } from '@codegena/ng-http-tools/rx-operators';
import * as faker from 'faker';
import { ShopModule } from './shop/shop.module';
import { RewriteListBackendService } from './shop/rewrite-list/rewrite-list-backend.service';
import { CreateListBackendService } from './shop/create-list/create-list-backend.service';
import { CreateListResponse } from './shop/create-list/create-list-response';

let rewriteList: RewriteListBackendService;
let createList: CreateListBackendService;
let httpController: HttpTestingController;

describe('ShopModule', () => {
    beforeAll(() => {
        TestBed.configureTestingModule({
            imports: [ShopModule, HttpClientTestingModule],
        });

        rewriteList = TestBed.inject(RewriteListBackendService);
        createList = TestBed.inject(CreateListBackendService);
        httpController = TestBed.inject(HttpTestingController);
    });

    it.skip('RewriteListBackendService', fakeAsync(() => {
        const listUid = faker.random.number(1000);
        const uid = faker.random.number(1000);

        rewriteList
            .request(
                {
                    listId: listUid,
                },
                {
                    title: 'List title',
                    items: [
                        {
                            uid,
                            dateChanged: '2005-08-09T18:31:42-03',
                            dateCreated: '2005-08-09T18:31:42-03',
                            position: 0,
                            listUid,
                            title: 'Item',
                            isDone: false,
                        },
                    ],
                    isComplete: false,
                }
            )
            .subscribe({
                next: (response) => {
                    console.log('Result:', (response as any).body);
                },
            });

        tick();

        httpController.expectOne(
            rewriteList.createUrl({listId: listUid}),
        ).flush(
            {
                uid,
                dateCreated: '2005-08-09T18:31:42-03',
                dateChanged: '2005-08-09T18:31:42-03',
                position: 0,
                listUid,
                title: 'Title',
                description: 'Description',
                isDone: false,
            },
            {
                status: 200,
                statusText: 'Success',
                headers: new HttpHeaders({
                    'content-type': 'application/json',
                }),
            }
        );

        tick();
    }));

    it('RewriteListBackendService', fakeAsync(() => {
        const listUid = faker.random.number(1000);
        const uid = faker.random.number(1000);

        createList
            .request({
                title: 'List title',
                items: [
                    {
                        uid,
                        dateChanged: '2005-08-09T18:31:42-03',
                        dateCreated: '2005-08-09T18:31:42-03',
                        position: 0,
                        listUid,
                        title: 'Item',
                        isDone: false,
                    },
                ],
                isComplete: false,
            })
            .pipe(
                pickResponse(500),
            )
            .subscribe((response: CreateListResponse<500>) => {
                console.log('Result:', response);
            });

        tick();

        httpController.expectOne(createList.createUrl()).flush(
            {
                message: 'Server 500 emulated',
            },
            {
                status: 500,
                statusText: 'Server error',
                headers: new HttpHeaders({
                    'content-type': 'application/json',
                }),
            }
        );

        tick();
    }));
});

import * as _ from 'lodash';

import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Patch,
    Post,
    Put,
    Param,
    Query,
    Session
} from '@nestjs/common';
import { Partial } from './lib/partial';

import { ParseQueryPipe } from './lib/parse-query.pipe';
import {
    ToDoTask,
    CreateGroupRequest,
    CreateGroupResponse,
    CreateGroupItemParameters,
    CreateGroupItemRequest,
    CreateGroupItemResponse,
    DeleteGroupParameters,
    DeleteGroupResponse,
    GetGroupParameters,
    GetGroupResponse,
    GetGroupsResponse,
    GetGroupsParameters,
    GetGroupItemsParameters,
    GetGroupItemsResponse,
    RewriteGroupParameters,
    RewriteGroupRequest,
    RewriteGroupResponse,
    RewriteGroupItemParameters,
    RewriteGroupItemRequest,
    RewriteGroupItemResponse,
    UpdateFewItemsParameters,
    UpdateFewItemsRequest,
    UpdateFewItemsResponse,
    UpdateGroupParameters,
    UpdateGroupRequest,
    UpdateGroupResponse
} from '@codegena/todo-app-contract';

import { TodoStorageService } from './todo-storage.service';

@Controller('group')
export class AppController {
    public session;

    constructor(private readonly appService: TodoStorageService) {}

    @Get()
    getGroups(
        @Query(ParseQueryPipe) query: GetGroupsParameters,
        @Session() session
    ): GetGroupsResponse<HttpStatus.OK> {
        return this.appService
          .setSession(session)
          .getGroups(query);
    }

    @Get(':groupId')
    getGroup(
        @Param(ParseQueryPipe) { groupId }: GetGroupParameters,
        @Session() session
    ): GetGroupResponse<HttpStatus.OK> {
        return this.appService
          .setSession(session)
          .getGroupByUid(groupId);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    postGroup(
        @Body() body: CreateGroupRequest,
        @Session() session
    ): CreateGroupResponse<HttpStatus.CREATED> {
        return this.appService
          .setSession(session)
          .createGroup(body);
    }

    @Put(':groupId')
    rewriteGroup(
        @Param(ParseQueryPipe) { groupId }: RewriteGroupParameters,
        @Body() body: RewriteGroupRequest,
        @Session() session
    ): RewriteGroupResponse<HttpStatus.OK> {
        return this.appService
            .setSession(session)
            .rewriteGroup(groupId, body);
    }

    @Patch(':groupId')
    patchGroup(
        @Param(ParseQueryPipe) { groupId }: UpdateGroupParameters,
        @Body() body: UpdateGroupRequest,
        @Session() session
    ): UpdateGroupResponse<HttpStatus.OK> {
        return this.appService
            .setSession(session)
            .patchGroup(groupId, body);
    }

    @Delete(':groupId')
    @HttpCode(HttpStatus.ACCEPTED)
    deleteGroup(
        @Param(ParseQueryPipe) { groupId }: UpdateGroupParameters,
        @Body() body: UpdateGroupRequest,
        @Session() session
    ): DeleteGroupResponse<HttpStatus.ACCEPTED> {
        this.appService
            .setSession(session)
            .deleteGroup(groupId);

        return null;
    }

    @Get(':groupId/item')
    getTasks(
        @Param(ParseQueryPipe) params: Partial<GetGroupItemsParameters>,
        @Query(ParseQueryPipe) query: Partial<GetGroupsParameters>,
        @Session() session
    ): GetGroupItemsResponse<HttpStatus.OK> {
        const {groupId, isComplete} = {...query, ...params} as GetGroupItemsParameters;

        return this.appService
            .setSession(session)
            .getTasksOfGroup(groupId, isComplete);
    }

    @Post(':groupId/item')
    createTask(
        @Param(ParseQueryPipe) { groupId }: CreateGroupItemParameters,
        @Body() body: CreateGroupItemRequest,
        @Session() session
    ): CreateGroupItemResponse<HttpStatus.CREATED> {
        return this.appService
            .setSession(session)
            .createTaskOfGroup(groupId, body);
    }

    @Put(':groupId/item/:itemId')
    putTask(
        @Param(ParseQueryPipe) {groupId, itemId}: RewriteGroupItemParameters,
        @Body() body: RewriteGroupItemRequest,
        @Session() session
    ): RewriteGroupItemResponse<HttpStatus.OK> {
        return this.appService
            .setSession(session)
            .patchTask(groupId, itemId, body);
    }

    @Patch(':groupId/item/:itemId')
    patchTask(
        @Param(ParseQueryPipe) {groupId, itemId}: RewriteGroupItemParameters,
        @Body() body: Partial<RewriteGroupItemRequest>,
        @Session() session
    ): RewriteGroupItemResponse<HttpStatus.OK> {
        return this.appService
            .setSession(session)
            .patchTask(groupId, itemId, body);
    }

    @Post('items')
    @HttpCode(HttpStatus.OK)
    updateFewItems(
        @Param(ParseQueryPipe) {forceSave}: UpdateFewItemsParameters,
        @Body() body: UpdateFewItemsRequest,
        @Session() session
    ): UpdateFewItemsResponse<HttpStatus.OK> {
        return _.map(body, (task: ToDoTask) => {
            const {uid, groupUid} = task;

            return this.appService
                .setSession(session)
                .patchTask(groupUid, uid, task);
        });
    }
}

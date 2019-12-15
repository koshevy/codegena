import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TodosGroupComponent } from './todos-groups/todos-group.component';
import { TodoTasksComponent } from './todo-tasks/todo-tasks.component';

const routes: Routes = [
    {
        component: TodoTasksComponent,
        path: '',
        pathMatch: 'full'
    },
    {
        component: TodosGroupComponent,
        path: 'groups',
        pathMatch: 'full'
    },
    {
        component: TodosGroupComponent,
        data: { isCreateGroupModalOpen: true },
        path: 'groups/create',
        pathMatch: 'full'
    }
];

@NgModule({
  exports: [RouterModule],
  imports: [RouterModule.forChild(routes)]
})
export class TodoAppRoutingModule { }

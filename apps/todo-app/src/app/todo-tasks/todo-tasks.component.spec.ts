import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TodoTasksComponent } from './todo-tasks.component';

describe('TodoTasksComponent', () => {
  let component: TodoTasksComponent;
  let fixture: ComponentFixture<TodoTasksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TodoTasksComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TodoTasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

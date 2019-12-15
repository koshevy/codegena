import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TodosGroupComponent } from './todos-group.component';

describe('TodosGroupComponent', () => {
  let component: TodosGroupComponent;
  let fixture: ComponentFixture<TodosGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TodosGroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TodosGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

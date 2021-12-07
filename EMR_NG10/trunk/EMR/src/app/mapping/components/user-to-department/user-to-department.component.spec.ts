import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserToDepartmentComponent } from './user-to-department.component';

describe('UserToDepartmentComponent', () => {
  let component: UserToDepartmentComponent;
  let fixture: ComponentFixture<UserToDepartmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserToDepartmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserToDepartmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserLeftMenusComponent } from './user-left-menus.component';

describe('UserLeftMenusComponent', () => {
  let component: UserLeftMenusComponent;
  let fixture: ComponentFixture<UserLeftMenusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserLeftMenusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserLeftMenusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

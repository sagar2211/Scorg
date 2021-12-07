import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleAndPermissionHomeComponent } from './role-and-permission-home.component';

describe('RoleAndPermissionHomeComponent', () => {
  let component: RoleAndPermissionHomeComponent;
  let fixture: ComponentFixture<RoleAndPermissionHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RoleAndPermissionHomeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RoleAndPermissionHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangePasswordFromLoginComponent } from './change-password-from-login.component';

describe('ChangePasswordFromLoginComponent', () => {
  let component: ChangePasswordFromLoginComponent;
  let fixture: ComponentFixture<ChangePasswordFromLoginComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChangePasswordFromLoginComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangePasswordFromLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

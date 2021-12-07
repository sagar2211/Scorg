import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResetForgotPasswordComponent } from './reset-forgot-password.component';

describe('ResetForgotPasswordComponent', () => {
  let component: ResetForgotPasswordComponent;
  let fixture: ComponentFixture<ResetForgotPasswordComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResetForgotPasswordComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResetForgotPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

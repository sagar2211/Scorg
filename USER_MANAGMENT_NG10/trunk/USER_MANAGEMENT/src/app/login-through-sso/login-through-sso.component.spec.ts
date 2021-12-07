import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginThroughSSOComponent } from './login-through-sso.component';

describe('LoginThroughSSOComponent', () => {
  let component: LoginThroughSSOComponent;
  let fixture: ComponentFixture<LoginThroughSSOComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoginThroughSSOComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginThroughSSOComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

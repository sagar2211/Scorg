import {async, ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';

import { LoginComponent } from './login.component';
import {Router, RouterModule, Routes} from '@angular/router';
import {UserMenusComponent} from '../user-menus/user-menus.component';
import {of} from 'rxjs';
import {HttpClientModule} from '@angular/common/http';
import {RouterTestingModule} from '@angular/router/testing';
import {AuthService} from '../../services/auth.service';
import {BrowserDynamicTestingModule} from '@angular/platform-browser-dynamic/testing';
import {SharedModule} from '../../shared/shared.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {Location} from '@angular/common';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {NavbarComponent} from '../navbar/navbar.component';
import {UserListComponent} from '../user-list/user-list.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let loginForm;
  let authServiceSpy;
  let   location: Location;
  let router: Router;
  const routes: Routes = [
    { path: 'userMenus/userList', component: UserListComponent }
  ];

  loginForm = {
    user_name: 'logintest@jest.com',
    password: 'doctor'
  };

  const loginSuccessResponse = {
    user_details: {
      auth_token: '1234567890',
      name: 'Mayur',
      id: '11',
      role_name: 'Doctor',
      mobile_number: '81499727'
    },
    status_code: '200',
    status_message: 'Success',
    message: ''
  };

  const tempGlobal = {
    auth_token: loginSuccessResponse.user_details.auth_token,
    user_id: loginSuccessResponse.user_details.id,
    userLoggedIn: true
  };

  class AuthServiceSpy {
    login = jest.fn().mockImplementation(() => {
      return of(loginSuccessResponse);
    });
    storeLoginInfo = jest.fn().mockImplementation((userInfo) => {
      const global = {
        auth_token: userInfo.auth_token,
        user_id: userInfo.id,
        userLoggedIn: true
      };
      localStorage.setItem('globals', JSON.stringify(global));
    });

    isUserLoggedIn = jest.fn().mockImplementation(() => {
      return JSON.parse(localStorage.getItem('globals')).userLoggedIn;
    });
  }


  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, NgbModule, FormsModule, ReactiveFormsModule, HttpClientTestingModule,
        RouterTestingModule.withRoutes(routes)],
      declarations: [LoginComponent, UserListComponent, NavbarComponent],
      providers: [{ provide: AuthService, useValue: {} }],
    })
    // Override component's own provider
      .overrideComponent(LoginComponent, {
        set: {
          providers: [
            { provide: AuthService, useClass: AuthServiceSpy }
          ]
        }
      })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authServiceSpy = fixture.debugElement.injector.get(AuthService) as any;
    router = TestBed.get(Router);
    location = TestBed.get(Location);
  });

  it('should create component', () => {
    expect(component).toBeDefined();
  });

  it('Form must be invalid on load', () => {
    component.ngOnInit();
    expect(component.loginForm.valid).toBeFalsy();
  });
  //
  it('Should redirect to application home page after successful login', fakeAsync(() => {
    component.ngOnInit();
    component.loginForm.patchValue(loginForm);
    component.onSubmit();
    tick();
    expect(location.path()).toBe('/userMenus/userList');
  }));
  //
  it('Should set global variables after successful login', () => {
    component.ngOnInit();
    component.loginForm.patchValue(loginForm);
    component.onSubmit();
    const storedGlobalsObj = JSON.parse(localStorage.getItem('globals'));
    expect(storedGlobalsObj.auth_token).toEqual(loginSuccessResponse.user_details.auth_token);
    expect(storedGlobalsObj.user_id).toEqual(loginSuccessResponse.user_details.id);
    expect(storedGlobalsObj.userLoggedIn).toBeTruthy();
  });

});

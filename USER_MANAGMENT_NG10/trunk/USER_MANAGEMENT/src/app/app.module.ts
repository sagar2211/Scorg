import { UserProfileComponent } from './user-profile/user-profile.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { HomeComponent } from './home/home.component';
import { NavbarComponent } from './navbar/navbar.component';
import { ResetForgotPasswordComponent } from './reset-forgot-password/reset-forgot-password.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule, APP_INITIALIZER, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgIdleServiceService } from './public/services/ng-idle-service';
import { NgxPermissionsService, NgxPermissionsModule } from 'ngx-permissions';
import { AuthService } from './public/services/auth.service';
import { UsersService } from './public/services/users.service';
import { LoadingIndicatorInterceptor } from './auth/http.interceptor';
import { AuthIntercept } from './auth/auth.intercept';
import { ChangePasswordFromLoginComponent } from './change-password-from-login/change-password-from-login.component';
import { LoginComponent } from './login/login.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { SessionoutpopupComponent } from './sessionoutpopup/sessionoutpopup.component';
import { SidebarFloatingComponent } from './sidebar-floating/sidebar-floating.component';
import { SharedModule } from './shared/shared.module';
import { LoginThroughSSOComponent } from './login-through-sso/login-through-sso.component';
import { NotificationComponent } from './notification/notification.component';
import { DefaultLandingSelectionComponent } from './default-landing-selection/default-landing-selection.component';

@NgModule({
  declarations: [
    AppComponent,
    ChangePasswordFromLoginComponent,
    LoginComponent,
    ChangePasswordComponent,
    SidebarFloatingComponent,
    SessionoutpopupComponent,
    ForgotPasswordComponent,
    ResetForgotPasswordComponent,
    NavbarComponent,
    HomeComponent,
    UserProfileComponent,
    LoginThroughSSOComponent,
    NotificationComponent,
    DefaultLandingSelectionComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule, ReactiveFormsModule, SharedModule,
    NgSelectModule,
    HttpClientModule,
    NgxPermissionsModule.forRoot()
  ],
  entryComponents: [
    ForgotPasswordComponent,
    ChangePasswordComponent,
    DefaultLandingSelectionComponent
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthIntercept, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: LoadingIndicatorInterceptor, multi: true },
    UsersService,
    {
      provide: APP_INITIALIZER,
      useFactory: (authService: AuthService, userService: UsersService, ps: NgxPermissionsService) => () => {
        if (authService.isLoggedIn() && authService.isUserLoggedIn()) {
          const userInfo = authService.getUserInfoFromLocalStorage();
          return userService.GetAssignedRolePermissionsByUserId_Promise(userInfo.user_id)
            .then((result) => {
              const userPermission = userService.userPermission;
              return ps.loadPermissions(userPermission);
            });
        } else {
          userService.userPermission = [];
          ps.flushPermissions();
          return true;
        }
      },
      deps: [AuthService, UsersService, NgxPermissionsService],
      multi: true
    },
    NgIdleServiceService, NgbActiveModal
  ],
  bootstrap: [AppComponent],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class AppModule { }

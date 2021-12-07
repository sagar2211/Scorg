import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AuthService } from './public/services/auth.service';
import { NgxPermissionsService, NgxPermissionsModule } from 'ngx-permissions';
import { CommonService } from './public/services/common.service';
import { LoadingIndicatorInterceptor } from './auth/http.interceptor';
import { AuthIntercept } from './auth/auth.intercept';
import { NavbarComponent } from './navbar/navbar.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { LoginThroughSSOComponent } from './login-through-sso/login-through-sso.component';
import { LoginComponent } from './login/login.component';
import { SidebarFloatingComponent } from './sidebar-floating/sidebar-floating.component';
import { NotificationComponent } from './notification/notification.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { MainHomeComponent } from './main-home/main-home.component';
import { CommunicationSideMenuComponent } from './communication-side-menu/communication-side-menu.component';
import { CommonModule } from '@angular/common';
import { NgIdleServiceService } from './public/services/ng-idle-service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { SessionoutpopupComponent } from './sessionoutpopup/sessionoutpopup.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    LoginThroughSSOComponent,
    LoginComponent,
    SidebarFloatingComponent,
    SessionoutpopupComponent,
    UserProfileComponent,
    NotificationComponent,
    MainHomeComponent,
    CommunicationSideMenuComponent,
  ],
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    NgxPermissionsModule.forRoot(),
    HttpClientModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule
    // QmsQlistLibModule,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthIntercept, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: LoadingIndicatorInterceptor, multi: true },
    {
      provide: APP_INITIALIZER,
      useFactory: (authService: AuthService, commonService: CommonService, ps: NgxPermissionsService) => () => {
        if (authService.isLoggedIn() && authService.isUserLoggedIn()) {
          const userInfo = authService.getUserInfoFromLocalStorage();
          return commonService.GetAssignedRolePermissionsByUserId_Promise(userInfo.user_id)
            .then((result) => {
              const userPermission = commonService.userPermission;
              return ps.loadPermissions(userPermission);
            });
        } else {
          commonService.userPermission = [];
          ps.flushPermissions();
          return true;
        }
      },
      deps: [AuthService, CommonService, NgxPermissionsService],
      multi: true
    },
    NgIdleServiceService, NgbActiveModal
  ],
  bootstrap: [AppComponent],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
})
export class AppModule { }

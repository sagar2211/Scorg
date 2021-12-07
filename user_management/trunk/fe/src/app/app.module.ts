import { QmsQlistLibService } from '@qms/qlist-lib';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
// import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from './shared/shared.module';
import { HttpClientModule } from '@angular/common/http';
import { AngularDualListBoxModule } from 'angular-dual-listbox';
import { NavbarComponent } from './components/navbar/navbar.component';
// import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthIntercept } from './auth/auth.intercept';
import { LoadingIndicatorInterceptor } from './auth/http.interceptor';
import { SidebarFloatingComponent } from './components/sidebar-floating/sidebar-floating.component';
import { NotificationComponent } from './components/notification/notification.component';
import { HomeComponent } from './components/home/home.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ChangePasswordComponent } from './components/change-password/change-password.component';
import { ResetForgotPasswordComponent } from './components/reset-forgot-password/reset-forgot-password.component';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { NgxPermissionsModule, NgxPermissionsService } from 'ngx-permissions';
import { APP_INITIALIZER } from '@angular/core';
import { UsersService } from './services/users.service';
import { AuthService } from './services/auth.service';
import { ChangePasswordFromLoginComponent } from './components/change-password-from-login/change-password-from-login.component';
import { QueueService } from './modules/qms/services/queue.service';
import { NoPermissionComponent } from './components/no-permission/no-permission.component';
import { TagInputModule } from 'ngx-chips';
import { NgIdleServiceService } from './services/ng-idle-service';
import { LoginThroughSSOComponent } from './components/login-through-sso/login-through-sso.component';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { CalendarComponent } from './components/calendar/calendar.component';
import { UserCalendarModule } from './modules/user-calendar/user-calendar.module';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { SettingsComponent } from './components/settings/settings.component';
import { AppointmentAppHomeComponent } from './components/appointment-app-home/appointment-app-home.component';
import { AppointmentAppSideMenuComponent } from './components/appointment-app-side-menu/appointment-app-side-menu.component';

// import { UserRegistrationComponent } from './components/user-registration/user-registration.component';
// import { UserListComponent } from './components/user-list/user-list.component';
// import { UserMenusComponent } from './components/user-menus/user-menus.component';
// import { RoleComponent } from './components/role/role.component';
// import { ScheduleComponent } from './components/schedule/schedule.component';
// import { RolePermissionsComponent } from './components/role-permissions/role-permissions.component';
// import { DoctorMappingComponent } from './components/doctor-mapping/doctor-mapping.component';
// import { MappedDoctorListComponent } from './components/mapped-doctor-list/mapped-doctor-list.component';
// import { UserLeftMenusComponent } from './components/user-left-menus/user-left-menus.component';
// import { DoctorSearchComponent } from './components/doctor-search/doctor-search.component';
// import { DoctorMappingEditComponent } from './components/doctor-mapping-edit/doctor-mapping-edit.component';

@NgModule({
  declarations: [
    AppComponent,
    // UserRegistrationComponent,
    // UserListComponent,
    // UserLeftMenusComponent,
    // DoctorSearchComponent,
    // DoctorMappingEditComponent,
    // UserMenusComponent,
    // RoleComponent,
    // ScheduleComponent,
    // RolePermissionsComponent,
    // DoctorMappingComponent,
    // MappedDoctorListComponent,
    UserProfileComponent,
    SettingsComponent,
    LoginComponent,
    NavbarComponent,
    SidebarFloatingComponent,
    NotificationComponent,
    HomeComponent,
    ForgotPasswordComponent,
    ChangePasswordComponent,
    ResetForgotPasswordComponent,
    ChangePasswordFromLoginComponent,
    NoPermissionComponent,
    LoginThroughSSOComponent,
    CalendarComponent,
    AppointmentAppHomeComponent,
    AppointmentAppSideMenuComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    SharedModule,
    HttpClientModule,
    AngularDualListBoxModule,
    BsDatepickerModule.forRoot(),
    NgxPermissionsModule.forRoot(),
    TagInputModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory
    }),
    UserCalendarModule
  ],
  entryComponents: [
    // DoctorMappingEditComponent,
     ForgotPasswordComponent,
     ChangePasswordComponent
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
    QueueService,
    QmsQlistLibService,
    NgIdleServiceService
  ],
  // entryComponents: [UserListActionComponent],
  bootstrap: [AppComponent]
})
export class AppModule { }

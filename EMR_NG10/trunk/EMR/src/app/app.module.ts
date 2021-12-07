import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { QmsQlistLibModule } from '@qms/qlist-lib';
import { BrowserModule, Title } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { EmrSideMenuComponent } from './emr-side-menu/emr-side-menu.component';
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
import { EmrHomeDashboardComponent } from './emr-home-dashboard/emr-home-dashboard.component';
import { LoginComponent } from './login/login.component';
import { SidebarFloatingComponent } from './sidebar-floating/sidebar-floating.component';
import { NotificationComponent } from './notification/notification.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { NursingMainHomeComponent } from './modules/nursing-main-home/nursing-main-home.component';
import { SessionoutpopupComponent } from './sessionoutpopup/sessionoutpopup.component';
import { NgIdleServiceService } from './public/services/ng-idle-service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DischargeHomeComponent } from './modules/discharge-home/discharge-home.component';
import { EmrSettingsMainHomeComponent } from './modules/emr-settings-main-home/emr-settings-main-home.component';
import { NursingStationSelectionComponent } from './nursing-station-selection/nursing-station-selection.component';
import { NoNursingStationComponent } from './no-nursing-station/no-nursing-station.component';
import { EmrSharedModule } from './emr-shared/emr-shared.module';
import { DefaultLandingSelectionComponent } from './default-landing-selection/default-landing-selection.component';
import { EmrWelcomeComponent } from './emr-welcome/emr-welcome.component';
import { UsersService } from './public/services/users.service';
import { PatientViewOnlyRedirectComponent } from './patient-view-only-redirect/patient-view-only-redirect.component';

@NgModule({
  declarations: [
    AppComponent,
    EmrSideMenuComponent,
    NavbarComponent,
    LoginThroughSSOComponent,
    EmrHomeDashboardComponent,
    LoginComponent,
    SidebarFloatingComponent,
    SessionoutpopupComponent,
    UserProfileComponent,
    NotificationComponent,
    NursingMainHomeComponent,
    DischargeHomeComponent,
    EmrSettingsMainHomeComponent,
    NursingStationSelectionComponent,
    NoNursingStationComponent,
    DefaultLandingSelectionComponent,
    EmrWelcomeComponent,
    PatientViewOnlyRedirectComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    NgxPermissionsModule.forRoot(),
    HttpClientModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    EmrSharedModule
  ],
  entryComponents: [
    DefaultLandingSelectionComponent
  ],
  providers: [
    Title,
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
    NgIdleServiceService,
    NgbActiveModal,
    UsersService,
    CommonService
  ],
  bootstrap: [AppComponent],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
})
export class AppModule { }

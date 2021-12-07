import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginThroughSSOComponent } from './login-through-sso/login-through-sso.component';
import { LoginComponent } from './login/login.component';
import { SidebarFloatingComponent } from './sidebar-floating/sidebar-floating.component';
import { AuthIntercept } from './auth/auth.intercept';
import { LoadingIndicatorInterceptor } from './auth/http.interceptor';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { NotificationComponent } from './notification/notification.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from './shared/shared.module';
import { AuthService } from './public/services/auth.service';
import { CommonService } from './public/services/common.service';
import { NgxPermissionsService, NgxPermissionsModule } from 'ngx-permissions';
import { InventoryHomeComponent } from './inventory-home/inventory-home.component';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { LeftMenuComponent } from './left-menu/left-menu.component';
import { NavbarComponent } from './navbar/navbar.component';
import { StoreSelectionComponent } from './store-selection/store-selection.component';
import { NoStoreComponent } from './no-store/no-store.component';
import { SessionoutpopupComponent } from './sessionoutpopup/sessionoutpopup.component';
import { NgIdleServiceService } from './public/services/ng-idle-service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [
    AppComponent,
    LoginThroughSSOComponent,
    LoginComponent,
    SidebarFloatingComponent,
    SessionoutpopupComponent,
    UserProfileComponent,
    NotificationComponent,
    InventoryHomeComponent,
    LeftMenuComponent,
    NavbarComponent,
    StoreSelectionComponent,
    NoStoreComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    NgxPermissionsModule.forRoot(),
    HttpClientModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule
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

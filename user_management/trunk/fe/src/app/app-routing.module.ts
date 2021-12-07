import { ChangePasswordFromLoginComponent } from './components/change-password-from-login/change-password-from-login.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { AuthGuard } from './auth/auth.guard'; import { HomeComponent } from './components/home/home.component';
import { ResetForgotPasswordComponent } from './components/reset-forgot-password/reset-forgot-password.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { PermissionsConstants } from 'src/app/shared/constants/PermissionsConstants';
import { CommonService } from './services/common.service';
import { NoPermissionComponent } from './components/no-permission/no-permission.component';
import { LoginThroughSSOComponent } from './components/login-through-sso/login-through-sso.component';
import { CalendarComponent } from './components/calendar/calendar.component';
import { AppointmentAppHomeComponent } from './components/appointment-app-home/appointment-app-home.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  // -- vikram
  {
    path: 'app',
    canActivate: [AuthGuard],
    component: HomeComponent,
    canActivateChild: [AuthGuard],
    children: [
      { path: '', redirectTo: 'qms', pathMatch: 'full' },
      {
        path: 'qms',
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
          permissions: {
            only: PermissionsConstants.QMS_APP_MENU,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
        loadChildren: () => import('./modules/qms/qms.module').then(m => m.QmsModule)
      },
      {
        path: 'chat',
        canActivate: [AuthGuard],
        loadChildren: () => import('./modules/chat/chat.module').then(m => m.ChatModule)
      },
      {
        path: 'nopermission', component: NoPermissionComponent,
      },
    ]
  },
  { path: 'forgotpassword', component: ForgotPasswordComponent },
  { path: 'changepassword', component: ChangePasswordFromLoginComponent },
  { path: 'resetforgotpassword/:id', component: ResetForgotPasswordComponent },
  {
    path: 'display',
    loadChildren: () => import('./modules/display/display.module').then(m => m.DisplayModule)
  },
  {
    path: 'feedback',
    loadChildren: () => import('./modules/feedback/feedback.module').then(m => m.FeedbackModule)
  },
  {
    path: 'external',
    loadChildren: () => import('./modules/external-book-appointment/external-book-appointment.module').then(m => m.ExternalBookAppointmentModule)
  },
  {
    path: 'appointmentApp', component: AppointmentAppHomeComponent,
    children: [
      { path: '', redirectTo: 'appointmentApp', pathMatch: 'full' },
      {
        path: 'appointments',
        loadChildren: () => import('./modules/appointment/appointment.module').then(m => m.AppointmentModule)
      },
    ]
  },
  {
    path: 'loginThroughSSO/:token',
    component: LoginThroughSSOComponent
  },
  {
    path: 'loginThroughSSO/:token/:appKey',
    component: LoginThroughSSOComponent
  },
  { path: 'partialCalendar/:userTokan/:patientId/:source', component: CalendarComponent },
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }


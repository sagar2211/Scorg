import { LoginComponent } from './login/login.component';
import { LoginThroughSSOComponent } from './login-through-sso/login-through-sso.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainHomeComponent } from './main-home/main-home.component';
import { AuthGuard } from './auth/auth.guard';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { PermissionsConstants } from './config/PermissionsConstants';
import { CommonService } from './public/services/common.service';
import { WelcomeAppComponent } from './welcome-app/welcome-app.component';

const appRoutes: Routes = [
  {
    path: '', redirectTo: 'login', pathMatch: 'full'
  },
  {
    path: 'loginThroughSSO/:token',
    component: LoginThroughSSOComponent
  },
  {
    path: 'loginThroughSSO/:token/:notificationId',
    component: LoginThroughSSOComponent
  },
  {
    path: 'otApp', component: MainHomeComponent,
    children: [
      { path: '', redirectTo: 'ot', pathMatch: 'full' },
      {
        path: 'ot',
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
          permissions: {
            only: PermissionsConstants.QMS_APP_MENU,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
        loadChildren: () => import('./ot module/ot/ot.module').then(m => m.OtModule)
      },
      {
        path: 'welcome',
        component: WelcomeAppComponent
      },
    ]
  },

  { path: 'login', component: LoginComponent },
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }

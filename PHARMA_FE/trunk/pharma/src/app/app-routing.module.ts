import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginThroughSSOComponent } from './login-through-sso/login-through-sso.component';
import { LoginComponent } from './login/login.component';
import { InventoryHomeComponent } from './inventory-home/inventory-home.component';
import { AuthGuard } from './auth/auth.guard';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { PermissionsConstants } from './config/PermissionsConstants';
import { CommonService } from './public/services/common.service';
import { StoreSelectionComponent } from './store-selection/store-selection.component';
import { NoStoreComponent } from './no-store/no-store.component';
import { PatientConsumptionComponent } from './modules/patient-issue/component/patient-consumption/patient-consumption.component';
import { IssueService } from './modules/issue/services/issue.service';
import { TransactionsService } from './modules/transactions/services/transactions.service';
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
    path: 'inventory', component: InventoryHomeComponent, canActivateChild: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
          permissions: {
            only: PermissionsConstants.QMS_APP_MENU,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
        loadChildren: () => import('./modules/dashboards/dashboards.module').then(m => m.DashboardsModule)
      },
      {
        path: 'masters',
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
          permissions: {
            only: PermissionsConstants.QMS_APP_MENU,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
        loadChildren: () => import('./modules/masters/masters.module').then(m => m.MastersModule)
        // loadChildren: './modules/qms/qms.module#QmsModule'
      },
      {
        path: 'transactions',
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
          permissions: {
            only: PermissionsConstants.QMS_APP_MENU,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
        loadChildren: () => import('./modules/transactions/transactions.module').then(m => m.TransactionsModule)
      },
      {
        path: 'indent',
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
          permissions: {
            only: PermissionsConstants.QMS_APP_MENU,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
        loadChildren: () => import('./modules/indent/indent.module').then(m => m.IndentModule)
      },
      {
        path: 'issue',
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
          permissions: {
            only: PermissionsConstants.QMS_APP_MENU,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
        loadChildren: () => import('./modules/issue/issue.module').then(m => m.IssueModule)
      },
      {
        path: 'reports',
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
          permissions: {
            only: PermissionsConstants.QMS_APP_MENU,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
        loadChildren: () => import('./modules/reports/reports.module').then(m => m.ReportsModule)
      },
      {
        path: 'stock',
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
          permissions: {
            only: PermissionsConstants.QMS_APP_MENU,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
        loadChildren: () => import('./modules/stock-details/stock-details.module').then(m => m.StockDetailsModule)
      },
      {
        path: 'dashboard', component: InventoryHomeComponent,
        canActivateChild: [AuthGuard],
        data: {
          breadCrumInfo: {
            display: 'Dashboard',
            route: ''
          },
          relatedLinks: []
        },
      },
      {
        path: 'welcome',
        component: WelcomeAppComponent
      }
    ]
  },
  { path: 'login', component: LoginComponent },
  { path: 'consumption/:id/:token/:loadFrom', component: PatientConsumptionComponent },
  { path: 'selectStore', component: StoreSelectionComponent },
  { path: 'noStore', component: NoStoreComponent },
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes, { useHash: true })
  ],
  exports: [RouterModule],
  providers: [
    IssueService,
    TransactionsService
  ]
})
export class AppRoutingModule { }

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IssueHomeComponent } from './component/issue-home/issue-home.component';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { PermissionsConstants } from 'src/app/config/PermissionsConstants';
import { CommonService } from 'src/app/public/services/common.service';
import { AuthGuard } from 'src/app/auth/auth.guard';

const issueRoutes: Routes = [
  {
    path: '', component: IssueHomeComponent,
    children: [
      {
        path: '', redirectTo: 'summeryIndent', pathMatch: 'full'
      },
      {
        path: 'summeryIndent',
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
          permissions: {
            only: PermissionsConstants.VIEW_MATERIAL_INDENT,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
        loadChildren: () => import('../summery-indent/summery-indent.module').then(m => m.SummeryIndentModule)
      },
      {
        path: 'consumption',
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
          permissions: {
            only: PermissionsConstants.QMS_APP_MENU,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
        loadChildren: () => import('../consumption/consumption.module').then(m => m.ConsumptionModule)
      },
      {
        path: 'patient',
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
          permissions: {
            only: PermissionsConstants.QMS_APP_MENU,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
        loadChildren: () => import('../patient-issue/patient-issue.module').then(m => m.PatientIssueModule)
      },
      {
        path: 'sale',
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
          permissions: {
            only: PermissionsConstants.QMS_APP_MENU,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
        loadChildren: () => import('../sale/sale.module').then(m => m.SaleModule)
      },
      {
        path: 'issueList',
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
          permissions: {
            only: PermissionsConstants.QMS_APP_MENU,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
        loadChildren: () => import('../issue-list/issue-list.module').then(m => m.IssueListModule)
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(issueRoutes)],
  exports: [RouterModule]
})
export class IssueRoutingModule { }

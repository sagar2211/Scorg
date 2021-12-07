import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IssueReportHomeComponent } from './components/issue-report-home/issue-report-home.component';
import { ReportsMenuComponent } from "../reports/components/reports-menu/reports-menu.component";
import { NgxPermissionsGuard } from 'ngx-permissions';
import { PermissionsConstants } from 'src/app/config/PermissionsConstants';
import { CommonService } from 'src/app/public/services/common.service';

const routes: Routes = [
  {
    path : '',
    component : IssueReportHomeComponent,
    children : [
      {
        path : '',
        redirectTo : ''
      },
      {
        path: 'issue',
        component: ReportsMenuComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          breadCrumInfo: { display: 'Issue Report', route: '/inventory/reports/issue' },
          permissions: {
            // only: PermissionsConstants.GRN_Datewise_Report_View,
            only: PermissionsConstants.VIEW_ISSUE_REPORT,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
      },
      {
        path: 'issueItemWIse',
        component: ReportsMenuComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          breadCrumInfo: {display: 'Issue Item wise Report', route: '/inventory/reports/issueItemWIse'},
          permissions: {
            // only: PermissionsConstants.GRN_Datewise_Report_View,
            only: PermissionsConstants.VIEW_ISSUE_ITEM_WISE_REPORT,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        }
      },
      {
        path: 'issueReturn',
        component: ReportsMenuComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          breadCrumInfo: { display: 'Issue Return Report', route: '/inventory/reports/issueReturn' },
          permissions: {
            // only: PermissionsConstants.GRN_Datewise_Report_View,
            only: PermissionsConstants.VIEW_ISSUE_RETURN_REPORT,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IssueReportRoutingModule { }

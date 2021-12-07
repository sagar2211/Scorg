import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IssueHomeComponent } from './component/issue-home/issue-home.component';
import { MaterialIndentSummeryListComponent } from './component/material-indent-summery-list/material-indent-summery-list.component';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { PermissionsConstants } from 'src/app/config/PermissionsConstants';
import { CommonService } from 'src/app/public/services/common.service';
import { DeptStoreIssueComponent } from './component/dept-store-issue/dept-store-issue.component';
import { IssueSummeryListComponent } from './component/issue-summery-list/issue-summery-list.component';
import { IssueAcceptanceListComponent } from './component/issue-acceptance-list/issue-acceptance-list.component';
import { AcceptIssueComponent } from './components/accept-issue/accept-issue.component';
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
        component: MaterialIndentSummeryListComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          displayName: 'Material Indent Summary',
          breadCrumInfo: {
            display: 'Material Indent Summary', route: '/inventory/issue/summeryIndent', redirectTo: '',
            isFilter: false, isAddPopup: false
          },
          permissions: {
            only: PermissionsConstants.VIEW_MATERIAL_INDENT,
            redirectTo: CommonService.redirectToIfNoPermission
          },
          relatedLinks: []
        }
      },
      {
        path: 'addUpdateIssue/:id/:type',
        component: DeptStoreIssueComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          displayName: 'Add Issue',
          breadCrumInfo: {
            display: 'Add Issue', route: '/inventory/issue/addUpdateIssue', redirectTo: '',
            isFilter: false, isAddPopup: false
          },
          permissions: {
            only: PermissionsConstants.ADD_INDENT_ISSUE,
            redirectTo: CommonService.redirectToIfNoPermission
          },
          relatedLinks: []
        }
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
        path: 'summeryIssue',
        component: IssueSummeryListComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          displayName: 'Material Issue Summary',
          breadCrumInfo: {
            display: 'Material Issue Summary', route: '/inventory/issue/summeryIssue', redirectTo: '',
            isFilter: false, isAddPopup: false
          },
          permissions: {
            only: PermissionsConstants.VIEW_ISSUE_SUMMARY,
            redirectTo: CommonService.redirectToIfNoPermission
          },
          relatedLinks: []
        }
      },
      {
        path: 'issueAcceptanceList',
        component: IssueAcceptanceListComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          displayName: 'Issue Acceptance List',
          breadCrumInfo: {
            display: 'Issue Acceptance List', route: '/inventory/issue/issueAcceptanceList', redirectTo: '',
            isFilter: false, isAddPopup: false
          },
          permissions: {
            only: PermissionsConstants.VIEW_ISSUE_ACCEPTANCE,
            redirectTo: CommonService.redirectToIfNoPermission
          },
          relatedLinks: []
        }
      },
      {
        path: 'acceptIssue/:id',
        component: AcceptIssueComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          displayName: 'Issue Acceptance',
          breadCrumInfo: {
            display: 'Issue Acceptance', route: '/inventory/issue/acceptIssue/:id', redirectTo: '',
            isFilter: true, isAddPopup: false
          },
          permissions: {
            only: PermissionsConstants.ADD_ISSUE_ACCEPTANCE,
            redirectTo: CommonService.redirectToIfNoPermission
          },
          relatedLinks: []
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(issueRoutes)],
  exports: [RouterModule]
})
export class IssueRoutingModule { }

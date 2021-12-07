import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IssueListHomeComponent } from './components/issue-list-home/issue-list-home.component';
import { DeptStoreIssueComponent } from './components/dept-store-issue/dept-store-issue.component';
import { IssueAcceptanceListComponent } from './components/issue-acceptance-list/issue-acceptance-list.component';
import { IssueSummeryListComponent } from './components/issue-summery-list/issue-summery-list.component';
import { AcceptIssueComponent } from './components/accept-issue/accept-issue.component';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { PermissionsConstants } from 'src/app/config/PermissionsConstants';
import { CommonService } from 'src/app/public/services/common.service';

const routes: Routes = [
  {
    path : '',
    component : IssueListHomeComponent,
    children : [
      {
        path: 'addUpdateIssue/:id/:type',
        component: DeptStoreIssueComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          displayName: 'Add Issue',
          breadCrumInfo: {
            display: 'Add Issue', route: '/inventory/issue/issueList/addUpdateIssue', redirectTo: '',
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
        path: 'summeryIssue',
        component: IssueSummeryListComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          displayName: 'Material Issue Summary',
          breadCrumInfo: {
            display: 'Material Issue Summary', route: '/inventory/issue/issueList/summeryIssue', redirectTo: '',
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
            display: 'Issue Acceptance List', route: '/inventory/issue/issueList/issueAcceptanceList', redirectTo: '',
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
            display: 'Issue Acceptance', route: '/inventory/issue/issueList/acceptIssue/:id', redirectTo: '',
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
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IssueListRoutingModule { }

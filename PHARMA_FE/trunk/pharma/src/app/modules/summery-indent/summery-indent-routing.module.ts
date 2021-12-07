import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SummaryIndentHomeComponent } from './components/summary-indent-home/summary-indent-home.component';
import { MaterialIndentSummeryListComponent } from './components/material-indent-summery-list/material-indent-summery-list.component';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { PermissionsConstants } from 'src/app/config/PermissionsConstants';
import { CommonService } from 'src/app/public/services/common.service';

const routes: Routes = [
  {
    path : '',
    component : SummaryIndentHomeComponent,
    children : [
      {
        path : '',
        redirectTo : 'summeryIndent'
      },
      {
        path: 'summeryIndent',
        component: MaterialIndentSummeryListComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          displayName: 'Material Indent Summary',
          breadCrumInfo: {
            display: 'Material Indent Summary', route: '/inventory/issue/summeryIndent/summeryIndent', redirectTo: '',
            isFilter: false, isAddPopup: false
          },
          permissions: {
            only: PermissionsConstants.VIEW_MATERIAL_INDENT,
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
export class SummeryIndentRoutingModule { }

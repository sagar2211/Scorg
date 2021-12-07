import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IndentHomeComponent } from './components/indent-home/indent-home.component';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { PermissionsConstants } from 'src/app/config/PermissionsConstants';
import { CommonService } from 'src/app/public/services/common.service';

const indentRoutes: Routes = [
  {
    path: '', component: IndentHomeComponent,
    children: [
      {
        path: '', redirectTo: 'materialIndentList', pathMatch: 'full'
      },
      {
        path: 'materialIndent',
        canActivate: [NgxPermissionsGuard],
        data: {
          permissions: {
            only: PermissionsConstants.VIEW_MATERIAL_INDENT,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
        loadChildren: () => import('../material-indent/material-indent.module').then(m => m.MaterialIndentModule)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(indentRoutes)],
  exports: [RouterModule]
})
export class IndentRoutingModule { }

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IndentHomeComponent } from './components/indent-home/indent-home.component';
import { MaterialIndentListComponent } from './components/material-indent-list/material-indent-list.component';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { PermissionsConstants } from 'src/app/config/PermissionsConstants';
import { CommonService } from 'src/app/public/services/common.service';
import { MaterialIndentAddUpdateComponent } from './components/material-indent-add-update/material-indent-add-update.component';

const indentRoutes: Routes = [
  {
    path: '', component: IndentHomeComponent,
    children: [
      {
        path: '', redirectTo: 'materialIndentList', pathMatch: 'full'
      },
      {
        path: 'materialIndentList',
        component: MaterialIndentListComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          displayName: 'Material Indent',
          breadCrumInfo: {
            display: 'Material Indent', route: '/inventory/indent/materialIndentList', redirectTo: '',
            isFilter: false, isAddPopup: true
          },
          permissions: {
            only: PermissionsConstants.VIEW_MATERIAL_INDENT,
            redirectTo: CommonService.redirectToIfNoPermission
          },
          relatedLinks: []
        }
      },
      {
        path: 'addMaterialIndent',
        component: MaterialIndentAddUpdateComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          displayName: 'Add Material Indent',
          breadCrumInfo: {
            display: 'Add Material Indent', route: '/inventory/indent/addMaterialIndent', redirectTo: '',
            isFilter: false, isAddPopup: false
          },
          permissions: {
            only: PermissionsConstants.ADD_MATERIAL_INDENT,
            redirectTo: CommonService.redirectToIfNoPermission
          },
          relatedLinks: []
        }
      },
      {
        path: 'updateMaterialIndent/:id',
        component: MaterialIndentAddUpdateComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          displayName: 'Update Material Indent',
          breadCrumInfo: {
            display: 'Update Material Indent', route: '/inventory/indent/updateMaterialIndent', redirectTo: '',
            isFilter: false, isAddPopup: false
          },
          permissions: {
            only: PermissionsConstants.UPDATE_MATERIAL_INDEND,
            redirectTo: CommonService.redirectToIfNoPermission
          },
          relatedLinks: []
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(indentRoutes)],
  exports: [RouterModule]
})
export class IndentRoutingModule { }

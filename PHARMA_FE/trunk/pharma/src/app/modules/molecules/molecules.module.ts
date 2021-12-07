import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MoleculesHomeComponent } from './components/molecules-home/molecules-home.component';
import { MoleculesListComponent } from './components/molecules-list/molecules-list.component';
import { MoleculesAddUpdateComponent } from './components/molecules-add-update/molecules-add-update.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { PermissionsConstants } from 'src/app/config/PermissionsConstants';
import { CommonService } from 'src/app/public/services/common.service';

const moleculesRoute: Routes = [
  {
    path: '', component: MoleculesHomeComponent,
    children: [
      {
        path: '', redirectTo: 'genericNameList', pathMatch: 'full'
      },
      {
        path: 'genericNameList',
        component: MoleculesListComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          displayName: 'Generic Name List',
          breadCrumInfo: {
            display: 'Item Type', route: '/inventory/masters/item/itemType', redirectTo: '',
            isFilter: false, isAddPopup: true
          },
          permissions: {
            only: PermissionsConstants.VIEW_ITEM_TYPE,
            redirectTo: CommonService.redirectToIfNoPermission
          },
          relatedLinks: []
        }
      }
    ]
  }
];

@NgModule({
  declarations: [
    MoleculesHomeComponent,
    MoleculesListComponent,
    MoleculesAddUpdateComponent
  ],
  imports: [
    FormsModule,
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    RouterModule.forChild(moleculesRoute),
    NgxDatatableModule
  ]
})
export class MoleculesModule { }

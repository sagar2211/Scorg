import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CheckListHomeComponent } from './component/check-list-home/check-list-home.component';
import { ParameterCheckComponent } from './component/parameter-check/parameter-check.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { ParamMedicineComponent } from './component/param-medicine/param-medicine.component';

const otCheckListRoute: Routes = [
  {
    path: '', component: CheckListHomeComponent,
    children: [
      {
        path: '', redirectTo: 'paramCheck', pathMatch: 'full'
      },
      {
        path: 'paramCheck',
        component: ParameterCheckComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          displayName: 'Pre Operative Check List',
          breadCrumInfo: {
            display: 'Pre Operative Check List', route: '/otApp/ot/checkList/paramCheck', redirectTo: '',
            isFilter: false, isAddPopup: false
          },
          permissions: {
            // only: PermissionsConstants.VIEW_ITEM_TYPE,
            // redirectTo: CommonService.redirectToIfNoPermission
          },
          relatedLinks: []
        }
      },
    ]
  }
];


@NgModule({
  declarations: [
    CheckListHomeComponent,
    ParameterCheckComponent,
    ParamMedicineComponent
  ],
  imports: [
    FormsModule,
    CommonModule,
    SharedModule,
    //EmrSharedModule,
    ReactiveFormsModule,
    RouterModule.forChild(otCheckListRoute),
    NgxDatatableModule
  ],
  exports: [
    ParamMedicineComponent
  ]
})
export class ParametarCheckListModule { }

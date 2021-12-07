import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParametarHomeComponent } from './component/parametar-home/parametar-home.component';
import { ParametarListComponent } from './component/parametar-list/parametar-list.component';
import { ParametarComponent } from './component/parametar/parametar.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { PermissionsConstants } from 'src/app/config/PermissionsConstants';
import { CommonService } from 'src/app/public/services/common.service';

const otParamRoute: Routes = [
  {
    path: '', component: ParametarHomeComponent,
    children: [
      {
        path: '', redirectTo: 'list', pathMatch: 'full'
      },
      {
        path: 'parameterList',
        canActivate: [NgxPermissionsGuard],
        data: {
          permissions: {
            only: PermissionsConstants.QMS_APP_MENU,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
        loadChildren: () => import('../parameter-list/parameter-list.module').then(m => m.ParameterListModule)
      },
    ]
  }
];

@NgModule({
  declarations: [
    ParametarHomeComponent,
    ParametarListComponent,
    ParametarComponent
  ],
  imports: [
    FormsModule,
    CommonModule,
    SharedModule,
    //EmrSharedModule,
    ReactiveFormsModule,
    RouterModule.forChild(otParamRoute),
    NgxDatatableModule
  ],
  exports: [
    ParametarComponent
  ]
})
export class OtParamaterModule { }

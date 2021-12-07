import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HimsHomeComponent } from './components/hims-home/hims-home.component';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

const himsRoute: Routes = [
  {
    path: '', component: HimsHomeComponent,
    children: [
      {
        path: '', redirectTo: 'bed', pathMatch: 'full'
      },
      {
        path: 'bed',
        // // canActivate: [AuthGuard, NgxPermissionsGuard],
        // data: {
        //   permissions: {
        //     only: PermissionsConstants.QMS_APP_MENU,
        //     redirectTo: CommonService.redirectToIfNoPermission
        //   }
        // },
        // loadChildren: './modules/dashboard/dashboard.module#DashboardModule',
        loadChildren: () => import('./modules/bed-data/bed-data.module').then(m => m.BedDataModule)
      },
    ]
  }
];

@NgModule({
  declarations: [
    HimsHomeComponent
  ],
  imports: [
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(himsRoute),
  ]
})
export class HimsModule { }

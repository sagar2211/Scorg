import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PrescriptionHomeComponent } from './components/prescription-home/prescription-home.component';
import { PrescriptionDetailComponent } from "../prescription/components/prescription-detail/prescription-detail.component";
import { NgxPermissionsGuard } from 'ngx-permissions';

const routes: Routes = [
  {
    path : '',
    component : PrescriptionHomeComponent,
    children : [
      {
        path : '',
        redirectTo : ''
      },
      {
        path: 'prescription',
        component: PrescriptionDetailComponent,
        canActivate: [NgxPermissionsGuard]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PrescriptionRoutingModule { }

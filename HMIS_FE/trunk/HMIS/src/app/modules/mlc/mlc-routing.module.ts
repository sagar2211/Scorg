import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MtpAndMlcHomeComponent } from './components/mtp-and-mlc-home/mtp-and-mlc-home.component';
import { MtpMlcAddUpdateComponent } from './components/mtp-mlc-add-update/mtp-mlc-add-update.component';
import { MtpMlcListComponent } from './components/mtp-mlc-list/mtp-mlc-list.component';

const routes: Routes = [
  {
    path: '', component: MtpAndMlcHomeComponent,
    children: [
      {
        path: '', redirectTo: 'list', pathMatch: 'full'
      },
      {
        path: 'list',
        component: MtpMlcListComponent,
      },
      {
        path: 'addPatient',
        component: MtpMlcAddUpdateComponent,
      },
      {
        path: 'updatePatient/:id',
        component: MtpMlcAddUpdateComponent,
      },
      {
        path: 'updatePatient/:id/:token/:loadAs',
        component: MtpMlcAddUpdateComponent,
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MlcRoutingModule { }

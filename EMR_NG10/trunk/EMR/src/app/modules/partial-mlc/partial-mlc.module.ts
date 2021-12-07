import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PartialMlcHomeComponent } from './components/partial-mlc-home/partial-mlc-home.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

const mlcRoute: Routes = [
  {
    path: '', component: PartialMlcHomeComponent,
    children: [
      {
        path: '', redirectTo: 'mlc', pathMatch: 'full'
      },
      {
        path: 'mlc',
        loadChildren: () => import('../../modules/mtp-and-mlc/mtp-and-mlc.module').then(m => m.MtpAndMlcModule)
      },
    ]
  }
];

@NgModule({
  declarations: [
    PartialMlcHomeComponent
  ],
  imports: [
    FormsModule,
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    RouterModule.forChild(mlcRoute),
  ]
})
export class PartialMlcModule { }

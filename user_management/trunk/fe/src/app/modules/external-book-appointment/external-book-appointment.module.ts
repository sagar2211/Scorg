import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { ExternalbookappointmentComponent } from './components/externalbookappointment/externalbookappointment.component';
import { FormsModule } from '@angular/forms';

const externalBokAppointmentRoutes: Routes = [{
  path: '', component: ExternalbookappointmentComponent,
  children: [{
    path: '', redirectTo: 'book-appointment', pathMatch: 'full'
  },
  {
    path: 'book-appointment',
    component: ExternalbookappointmentComponent
  }]
}];

@NgModule({
  declarations: [
    ExternalbookappointmentComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(externalBokAppointmentRoutes),
    FormsModule
  ]
})
export class ExternalBookAppointmentModule { }

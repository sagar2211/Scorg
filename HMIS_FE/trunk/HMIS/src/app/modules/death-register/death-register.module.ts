import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DeathRegisterRoutingModule } from './death-register-routing.module';
import { DeathPatientAddUpdateComponent } from './components/death-patient-add-update/death-patient-add-update.component';
import { DeathRegisterHomeComponent } from './components/death-register-home/death-register-home.component';
import { DeathPatientListComponent } from './components/death-patient-list/death-patient-list.component';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [
    DeathPatientAddUpdateComponent, 
    DeathRegisterHomeComponent, 
    DeathPatientListComponent],
  imports: [
    CommonModule,
    DeathRegisterRoutingModule,
    SharedModule
  ],
  providers: [
    NgbActiveModal
  ]
})
export class DeathRegisterModule { }

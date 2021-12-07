import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MlcRoutingModule } from './mlc-routing.module';
import { MtpAndMlcHomeComponent } from './components/mtp-and-mlc-home/mtp-and-mlc-home.component';
import { MtpMlcAddUpdateComponent } from './components/mtp-mlc-add-update/mtp-mlc-add-update.component';
import { MtpMlcListComponent } from './components/mtp-mlc-list/mtp-mlc-list.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';


@NgModule({
  declarations: [MtpAndMlcHomeComponent, MtpMlcAddUpdateComponent, MtpMlcListComponent],
  imports: [
    CommonModule,
    MlcRoutingModule,
    SharedModule
  ],
  providers: [
    NgbActiveModal
  ]
})
export class MlcModule { }

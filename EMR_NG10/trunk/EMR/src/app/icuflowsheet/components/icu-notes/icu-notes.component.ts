import { Component, OnInit, Input, OnChanges } from '@angular/core';
import * as _ from 'lodash';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { IcuFlowSheetService } from './../../../public/services/icu-flow-sheet.service';
import { AuthService } from './../../../public/services/auth.service';
import { EncounterPatient } from 'src/app/public/models/encounter-patient.model';

@Component({
  selector: 'app-icu-notes',
  templateUrl: './icu-notes.component.html',
  styleUrls: ['./icu-notes.component.scss']
})
export class IcuNotesComponent implements OnInit, OnChanges {

  @Input() displayData: any = { displayName: 'SPECIAL INSTRUCTIONS', displayKey: 'special_instructions', value: 'valxyz' };
  @Input() patientObj: EncounterPatient;
  sheetDate: any;
  userInfo: any;
  constructor(
    public authService: AuthService,
    public icuFlowSheetService: IcuFlowSheetService,
    private modalService: NgbModal
  ) { }

  ngOnInit() {

  }

  ngOnChanges() {
    this.userInfo = this.authService.getUserInfoFromLocalStorage();
    this.getParamData();
  }

  getParamData() {
    this.sheetDate = this.icuFlowSheetService.getIcuFlowSheetSelectedDate();
    const param = {
      patient_id: this.patientObj.patientData.id,
      opd_id: this.patientObj.visitNo,
      date: this.sheetDate,
      key: this.displayData.displayKey,
    };
    const data = this.icuFlowSheetService.getDataByKeyParam(param);
    if (data) {
      this.displayData.value = data;
    }
  }

  openPopup(object): void {
    const modelInstance = this.modalService.open(object, {
      backdrop: 'static',
      keyboard: false,
      windowClass: 'custom-modal modal-md'
    });
    modelInstance.result.then(result => {
      this.updateParamValue();
    }, reason => {
      // console.log('rejected');
      // this.closeResult = `Dismissed ${reason}`;
    });
  }

  updateParamValue(): void {
    const param = {
      patient_id: this.patientObj.patientData.id,
      opd_id: this.patientObj.visitNo,
      date: this.sheetDate,
      key: this.displayData.displayKey,
      value: this.displayData.value,
      user_id: this.userInfo.user_id,
    };
    this.icuFlowSheetService.saveKeyWiseData(param).subscribe(res => {
      this.getParamData();
    });
  }

}

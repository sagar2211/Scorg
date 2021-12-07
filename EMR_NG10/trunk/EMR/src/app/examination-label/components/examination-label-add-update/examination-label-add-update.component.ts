import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ExaminationLabelsService } from './../../../public/services/examination-labels.service';
import { IAlert } from './../../../public/models/AlertMessage';
import { Constants } from 'src/app/config/constants';

@Component({
  selector: 'app-examination-label-add-update',
  templateUrl: './examination-label-add-update.component.html',
  styleUrls: ['./examination-label-add-update.component.scss']
})
export class ExaminationLabelAddUpdateComponent implements OnInit {

  @Input() examinationData: any;
  selectedServicesType: any;
  selectedSpeciality: any;
  selectedExaminationType: any;
  selectedSaveSetting: any;
  labelName: string;
  labelIsActive: boolean;
  selectedPrintSetting: string;
  setAlertMessage: IAlert;
  headId: number;
  constVar: any;

  constructor(
    public modal: NgbActiveModal,
    public examinationLabelsService: ExaminationLabelsService,
  ) { }

  ngOnInit() {
    this.defaultObject();
    if (this.examinationData.type === 'edit') {
      this.bindEditData();
    }
  }

  defaultObject() {
    this.selectedServicesType = null;
    this.selectedSpeciality = null;
    this.selectedExaminationType = null;
    this.selectedSaveSetting = 'no_master_save';
    this.labelName = '';
    this.labelIsActive = true;
    this.selectedPrintSetting = '';
    this.headId = 0;
    this.constVar = Constants;
  }

  bindEditData() {
    this.selectedServicesType = this.examinationData.data.serviceType;
    this.selectedSpeciality = this.examinationData.data.speciality;
    this.selectedExaminationType = this.examinationData.data.examType;
    this.labelName = this.examinationData.data.labelName;
    this.labelIsActive = this.examinationData.data.isActive;
    this.selectedPrintSetting = this.examinationData.data.printSetting;
    this.headId = this.examinationData.data.headId;
    if (this.selectedExaminationType.id === 1 || this.selectedExaminationType.id === 2) {
      this.selectedSaveSetting = this.examinationData.data.masterSaveSetting ?
        this.examinationData.data.masterSaveSetting : 'no_master_save';
    } else {
      this.selectedSaveSetting = null;
    }
  }

  selectValueConfirm(typ: string) {
    if (typ === 'Ok') {
      if (this.checkSaveData()) {
        this.saveExaminationLabel(typ);
      }
    } else {
      this.modal.close(typ);
    }
  }

  checkSaveData() {
    if (!this.selectedServicesType) {
      this.notifyAlertMessage({
        msg: 'Please Select Service Type',
        class: 'danger',
      });
      return false;
    } else if (!this.selectedExaminationType) {
      this.notifyAlertMessage({
        msg: 'Please Select Examination Type',
        class: 'danger',
      });
      return false;
    } else if (!this.labelName) {
      this.notifyAlertMessage({
        msg: 'Please Add Label Name',
        class: 'danger',
      });
      return false;
    } else {
      return true;
    }
  }

  notifyAlertMessage(data): void {
    this.setAlertMessage = {
      message: data.msg,
      messageType: data.class,
      duration: Constants.ALERT_DURATION
    };
  }

  saveExaminationLabel(typ) {
    const param = {
      exam_head_id: this.headId,
      service_type_id: this.selectedServicesType.id,
      speciality_id: this.selectedSpeciality ? this.selectedSpeciality.id : null,
      display_name: this.labelName,
      exam_type_id: this.selectedExaminationType.id,
      print_setting: this.selectedPrintSetting,
      is_active: this.labelIsActive,
      save_setting: this.selectedSaveSetting
    };
    this.examinationLabelsService.saveExaminationLabel(param).subscribe(res => {
      if (res) {
        this.modal.close(typ);
      } else {
        this.notifyAlertMessage({
          msg: 'Something Went Wrong',
          class: 'danger',
        });
        return false;
      }
    });
  }

  getSelectedSpeciality(val) {
    this.selectedSpeciality = val;
  }

  getSelectedServiceType(val) {
    this.selectedServicesType = val;
  }

  getSelectedExaminationType(val) {
    this.selectedExaminationType = val;
    if (this.selectedExaminationType.id === 1 || this.selectedExaminationType.id === 2) {
      this.selectedSaveSetting = this.examinationData.data.masterSaveSetting ?
        this.examinationData.data.masterSaveSetting : 'no_master_save';
    } else {
      this.selectedSaveSetting = null;
    }
  }

  updateValueActiveInactive() {
    this.labelIsActive = !this.labelIsActive;
  }

}

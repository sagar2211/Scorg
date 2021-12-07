import {Component, Input, OnInit} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import { Constants } from 'src/app/config/constants';
import { IAlert } from 'src/app/public/models/AlertMessage';
import {FaqService} from '../../faq.service';

@Component({
  selector: 'app-add-faq-template',
  templateUrl: './add-faq-template.component.html',
  styleUrls: ['./add-faq-template.component.scss']
})
export class AddFaqTemplateComponent implements OnInit {
  @Input() templateData: any;
  selectedServicesType: any;
  selectedSpeciality: any;
  templateName: string;
  templateIsActive: boolean;
  setAlertMessage: IAlert;
  templateKey = '';
  constructor(
    public modal: NgbActiveModal,
    public faqService: FaqService,
  ) { }

  ngOnInit() {
    this.createDefaultObject();
    if (this.templateData.type === 'edit') {
      this.bindEditData();
    }
  }

  createDefaultObject() {
    this.selectedServicesType = null;
    this.selectedSpeciality = null;
    this.templateName = '';
    this.templateIsActive = true;
  }
  bindEditData() {
    this.selectedServicesType = this.templateData.data.serviceType;
    this.selectedSpeciality = this.templateData.data.speciality;
    this.templateName = this.templateData.data.templateName;
    this.templateIsActive = this.templateData.data.isActive;
    this.templateKey = this.templateData.data.templateKey;
  }

  getSelectedSpeciality(val) {
    this.selectedSpeciality = val;
  }

  getSelectedServiceType(val) {
    this.selectedServicesType = val;
  }

  saveTemplate() {
    const param = {
      serviceTypeId: this.selectedServicesType.id,
      specialityId: this.selectedSpeciality ? this.selectedSpeciality.id : 0,
      templateId: (this.templateData.data && this.templateData.data.templateId) ? this.templateData.data.templateId : 0,
      templateName: this.templateName,
      isActive: this.templateIsActive,
      templateKey: this.templateKey
    };
    this.faqService.saveTemplate(param).subscribe(res => {
      if (res) {
        this.modal.close(true);
      } else {
        this.notifyAlertMessage({
          msg: 'Something Went Wrong',
          class: 'danger',
        });
        return false;
      }
    });
  }

  notifyAlertMessage(data): void {
    this.setAlertMessage = {
      message: data.msg,
      messageType: data.class,
      duration: Constants.ALERT_DURATION
    };
  }

  closePopup(): void {
    this.modal.close('cancel');
  }

  selectValueConfirm(typ: string) {
    if (typ === 'Ok') {
      if (this.checkSaveData()) {
        this.saveTemplate();
      }
    } else {
      this.modal.close(false);
    }
  }

  checkSaveData() {
    if (!this.selectedServicesType) {
      this.notifyAlertMessage({
        msg: 'Please Select Service Type',
        class: 'danger',
      });
      return false;
    } else if (!this.templateName) {
      this.notifyAlertMessage({
        msg: 'Please Add Template Name',
        class: 'danger',
      });
      return false;
    } else {
      return true;
    }
    // else if (!this.selectedSpeciality) {
    //   this.notifyAlertMessage({
    //     msg: 'Please Add Speciality',
    //     class: 'danger',
    //   });
    //   return false;
    // }
  }

}

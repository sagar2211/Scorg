import {Component, Input, OnInit} from '@angular/core';
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {Constants} from "../../../../config/constants";
import * as _ from 'lodash';
import { MastersService } from 'src/app/modules/masters/services/masters.service';

@Component({
  selector: 'app-add-edit-tax-master',
  templateUrl: './add-edit-tax-master.component.html',
  styleUrls: ['./add-edit-tax-master.component.scss']
})
export class AddEditTaxMasterComponent implements OnInit {

  @Input() taxData: any;
  setAlertMessage: any;
  addEditTaxObject: {taxId: number, taxPercent: number, taxDesc: string, isActive: boolean};

  constructor(
    public modal: NgbActiveModal,
    private masterService: MastersService

  ) { }

  ngOnInit() {
    this.setDefaultObject();
    if (this.taxData.type === 'edit') {
      this.bindEditData();
    }
  }

  setDefaultObject() {
    this.addEditTaxObject = {
      taxId: 0,
      taxPercent: 0,
      taxDesc: '',
      isActive: true
    };
  }
  bindEditData(): any {
    this.addEditTaxObject = _.cloneDeep(this.taxData.data);
  }

  selectValueConfirm (typ: string) {
    if (typ === 'Ok') {
      if (this.checkSaveData()) {
        this.saveTaxMaster();
      }
    } else {
      this.modal.close(false);
    }
  }

  checkSaveData() {
    if (!this.addEditTaxObject.taxPercent || this.addEditTaxObject.taxPercent === 0) {
      this.notifyAlertMessage({
        msg: 'Please Provide Tax Percentage',
        class: 'danger',
      });
      return false;
    } else {
      return true;
    }
  }

  closePopup(): void {
    this.modal.close(false);
  }

  saveTaxMaster() {
    const param = {
      taxId: this.addEditTaxObject.taxId,
      taxPercent: this.addEditTaxObject.taxPercent,
      taxDesc: this.addEditTaxObject.taxDesc,
      isActive: this.addEditTaxObject.isActive,
    };
    this.masterService.saveTaxMaster(param).subscribe(res => {
      if ((res.status_code === 200 && res.status_message === 'Success' && res.data)) {
        this.modal.close(true);
      } else {
        this.notifyAlertMessage({
          msg: res.message,
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
}

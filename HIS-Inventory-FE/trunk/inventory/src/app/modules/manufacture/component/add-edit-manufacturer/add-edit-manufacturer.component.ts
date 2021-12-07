import {Component, Input, OnInit} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'lodash';
import {Constants} from '../../../../config/constants';
import { MastersService } from 'src/app/modules/masters/services/masters.service';
@Component({
  selector: 'app-add-edit-manufacturer',
  templateUrl: './add-edit-manufacturer.component.html',
  styleUrls: ['./add-edit-manufacturer.component.scss']
})
export class AddEditManufacturerComponent implements OnInit {

  @Input() manufacturerData: any;
  setAlertMessage: any;
  addEditManufacturerObject: {id: number, name: string, shortName: string, isActive: boolean};
  constructor(
    public modal: NgbActiveModal,
    private masterService: MastersService
  ) { }

  ngOnInit() {
    this.setDefaultObject();
    if (this.manufacturerData.type === 'edit') {
      this.bindEditData();
    }
  }

  setDefaultObject() {
    this.addEditManufacturerObject = {
      id: 0,
      name: '',
      shortName: '',
      isActive: true
    };
  }
  bindEditData(): any {
    this.addEditManufacturerObject = this.manufacturerData.data;
  }

  selectValueConfirm(typ: string) {
    if (typ === 'Ok') {
      if (this.checkSaveData()) {
        this.saveManufacturer();
      }
    } else {
      this.modal.close(false);
    }
  }

  checkSaveData() {
    if (!this.addEditManufacturerObject.name || this.addEditManufacturerObject.name === '') {
      this.notifyAlertMessage({
        msg: 'Please Provide Name',
        class: 'danger',
      });
      return false;
    } else {
      return true;
    }
  }

  closePopup(): void {
    this.modal.close('cancel');
  }

  saveManufacturer() {
    const param = {
      manufacturerId: this.addEditManufacturerObject.id,
      manufacturerName: this.addEditManufacturerObject.name,
      shortName: this.addEditManufacturerObject.shortName,
      isActive: this.addEditManufacturerObject.isActive,
    };
    this.masterService.saveManufacturer(param).subscribe(res => {
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

}

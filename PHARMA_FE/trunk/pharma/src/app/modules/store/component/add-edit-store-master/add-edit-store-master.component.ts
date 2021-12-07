import {Component, Input, OnInit} from '@angular/core';
import {Constants} from '../../../../config/constants';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import * as _ from 'lodash';
import {MappingService} from "../../../../public/services/mapping.service";
import { MastersService } from 'src/app/modules/masters/services/masters.service';
@Component({
  selector: 'app-add-edit-store-master',
  templateUrl: './add-edit-store-master.component.html',
  styleUrls: ['./add-edit-store-master.component.scss']
})
export class AddEditStoreMasterComponent implements OnInit {

  @Input() storeData: any;
  setAlertMessage: any;
  compInstance: any;
  addEditStoreMasterObject: {id: number, name: string, isActive: boolean, department: any, isMainStore: boolean};
  constructor(
    public modal: NgbActiveModal,
    private masterService: MastersService,
    private mappingService: MappingService

  ) { }

  ngOnInit() {
    this.compInstance = this;
    this.setDefaultObject();
    if (this.storeData.type === 'edit') {
      this.bindEditData();
    }
  }

  setDefaultObject() {
    this.addEditStoreMasterObject = {
      id: 0,
      name: '',
      isActive: true,
      department: null,
      isMainStore: false
    };
  }
  bindEditData(): any {
    this.addEditStoreMasterObject = this.storeData.data;
    this.addEditStoreMasterObject.department = {id: this.storeData.data.id, name: ''};
  }

  selectValueConfirm (typ: string) {
    if (typ === 'Ok') {
      if (this.checkSaveData()) {
        this.saveStoreMaster();
      }
    } else {
      this.modal.close(false);
    }
  }

  checkSaveData() {
    if (!this.addEditStoreMasterObject.name || this.addEditStoreMasterObject.name === '') {
      this.notifyAlertMessage({
        msg: 'Please Provide Store Name',
        class: 'danger',
      });
      return false;
    } else if (!this.addEditStoreMasterObject.department || this.addEditStoreMasterObject.department === null) {
      this.notifyAlertMessage({
        msg: 'Please Select Department',
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

  saveStoreMaster() {
    const param = {
      storeId: this.addEditStoreMasterObject.id,
      storeName: this.addEditStoreMasterObject.name,
      isActive: this.addEditStoreMasterObject.isActive,
      deptId: this.addEditStoreMasterObject.department.id,
      isMainStore: this.addEditStoreMasterObject.isMainStore,
    };
    this.masterService.saveStoreMaster(param).subscribe(res => {
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

  getDepartmentList(searchKey?): Observable<any> {
    const params = {
      searchKeyword: searchKey ? searchKey : '',
      pageNumber: 1,
      limit: 50
    };
    return this.compInstance.mappingService.getDepartmentList(params).pipe(map((res: any) => {
      const deptList = res;
      return deptList;
    }));
  }

  selectValue($event) {
    this.addEditStoreMasterObject.department = $event;
  }

}

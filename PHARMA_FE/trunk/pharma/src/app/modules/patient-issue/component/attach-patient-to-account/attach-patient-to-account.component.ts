import { Component, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import CustomStore from 'devextreme/data/custom_store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MastersService } from 'src/app/modules/masters/services/masters.service';
import { IAlert } from 'src/app/public/models/AlertMessage';
import * as _ from 'lodash';
import { DxDataGridComponent } from 'devextreme-angular';

@Component({
  selector: 'app-attach-patient-to-account',
  templateUrl: './attach-patient-to-account.component.html',
  styleUrls: ['./attach-patient-to-account.component.scss']
})
export class AttachPatientToAccountComponent implements OnInit {
  @ViewChild(DxDataGridComponent, { static: false }) public dataGrid: DxDataGridComponent;
  @Input() formData: any;
  patientList = [];
  alertMsg: IAlert;

  editorOptions: object;
  patientDataSource: any;
  selectedIndex = 0;
  allowEditing = true;
  selectedItem;
  patientDropdownList: Array<any> = [];

  patientName = null;
  mobileNo = null;
  patientAddress = null;
  isAddPatient = false;
  isSubmitted = false;

  constructor(
    public modal: NgbActiveModal,
    public mastersService: MastersService,
  ) {
    this.editorOptions = {
      itemTemplate: "itemTemplate"
    }
    this.getpatientDataSource();
    this.onEditorPreparing = this.onEditorPreparing.bind(this);
    this.onDelete = this.onDelete.bind(this);
  }

  ngOnInit(): void {
    this.getCounterPatientList().subscribe();
  }

  closePopup(from?) {
    const obj = {
      data: null,
      type: from ? 'yes' : 'no'
    }
    this.modal.close(obj);
  }

  getpatientDataSource() {
    let compObj = this;
    this.patientDataSource = new CustomStore({
      key: "patientName",
      load: function (loadOptions: any) {
        return compObj.getListPromise(compObj, loadOptions.searchValue).then((result) => {
          return result;
        });
      },
      // Needed to process selected value(s) in the SelectBox, Lookup, Autocomplete, and DropDownBox
      byKey: (key) => {
        return compObj.getListPromise(compObj, key).then((result) => {
          return result;
        });
      }
    });
  }

  getListPromise(compObj, searchValue) {
    return new Promise((resolve, reject) => {
      const param = {
        searchKeyword: searchValue,
        debtorId: 0,
      };
      compObj.mastersService.getPharmacyPatientBySearchKeyword(param).subscribe(result => {
        const patIds = this.patientList.map(d => {
          return d.patientId;
        });
        const list = result.filter(d => {
          return !_.includes(patIds, d.patientId);
        });
        this.patientDropdownList = list;
        resolve(list);
      });
    });
  }

  onEditorPreparing(evt: any): void {
    if (evt.parentType == "dataRow") {
      evt.editorOptions.onKeyDown = (arg) => {

      }
    }

    evt.editorOptions.onValueChanged = (e: any) => {
      this.selectedIndex = evt.row.rowIndex;
      let rowObj = this.patientList[evt.row.rowIndex];
      if (evt.dataField == 'patient') {
        this.selectedItem = { ...e.value };
        this.patientList[evt.row.rowIndex].patientId = _.cloneDeep(this.selectedItem.patientId);
        this.patientList[evt.row.rowIndex].patientName = _.cloneDeep(this.selectedItem.patientName);
        this.patientList[evt.row.rowIndex].doctorId = _.cloneDeep(this.selectedItem.doctorId);
        this.patientList[evt.row.rowIndex].doctorName = _.cloneDeep(this.selectedItem.doctorName);
        this.patientList[evt.row.rowIndex].gender = _.cloneDeep(this.selectedItem.gender);
        this.patientList[evt.row.rowIndex].isActive = _.cloneDeep(this.selectedItem.isActive);
        this.patientList[evt.row.rowIndex].mobileNo = _.cloneDeep(this.selectedItem.mobileNo);
        this.patientList[evt.row.rowIndex].patientAddress1 = _.cloneDeep(this.selectedItem.patientAddress1);
        this.patientList[evt.row.rowIndex].patientAddress2 = _.cloneDeep(this.selectedItem.patientAddress2);
        this.patientList[evt.row.rowIndex].patientAddress3 = _.cloneDeep(this.selectedItem.patientAddress3);
        this.patientList[evt.row.rowIndex].patientFirstName = _.cloneDeep(this.selectedItem.patientFirstName);
        this.patientList[evt.row.rowIndex].patientLastName = _.cloneDeep(this.selectedItem.patientLastName);
        this.patientList[evt.row.rowIndex].patientMidName = _.cloneDeep(this.selectedItem.patientMidName);
        this.patientList[evt.row.rowIndex].patient = { ...this.selectedItem };
        this.addBlankRow();
        this.initDataGrid(this.patientList.length - 1);
      }
    }
  }

  initDataGrid(index?) {
    setTimeout(() => {
      this.dataGrid.instance.editCell(index ? index : 0, 'patient');
    }, 500);
  }

  onDelete(e) {

  }

  allowDeleting(e) {
    return e.component.totalCount() == 1 ? e.row.rowIndex != 0 : true;
  }

  getCounterPatientList(searchKey?): Observable<any> {
    const param = {
      searchKeyword: searchKey,
      debtorId: this.formData.accountId,
    };
    return this.mastersService.getPharmacyPatientBySearchKeyword(param).pipe(map((res: any) => {
      res.map(d => {
        d.patient = d;
        d.tempId = Math.random();
      });
      this.patientList = res;
      this.addBlankRow();
      this.initDataGrid(this.patientList.length - 1);
      return res;
    }));
  }

  addBlankRow() {
    const row = {
      doctorId: 0,
      doctorName: null,
      gender: null,
      isActive: true,
      mobileNo: null,
      patientAddress1: null,
      patientAddress2: null,
      patientAddress3: null,
      patientFirstName: null,
      patientId: 0,
      patientLastName: null,
      patientMidName: null,
      patientName: null,
      patient: null,
      tempId: Math.random()
    }
    this.patientList.push({ ...row });
  }

  linkPatients() {
    if (this.patientList.length > 0) {
      const obj = {
        accountId: this.formData.accountId,
        patientData: []
      }
      this.patientList.map(d => {
        if (d.patientId) {
          const pObj = {
            patientId: d.patientId,
            patientName: d.patientName,
            patientAddress1: d.patientAddress1,
            mobileNo: d.mobileNo,
          };
          obj.patientData.push({ ...pObj });
        }
      });
      if (obj.patientData.length > 0) {
        this.mastersService.savePatientMasterFromSaleBill(obj).subscribe(res => {
          this.closePopup(true);
        });
      }
    }
  }

  savePatient() {
    this.isSubmitted = true;
    if (this.patientName) {
      this.isSubmitted = false;
      const reqParam = {
        patientId: 0,
        mobileNo: this.mobileNo ? this.mobileNo : '',
        patientName: this.patientName,
        patientAddress: this.patientAddress ? this.patientAddress : null,
        doctorID: 0,
        doctorName: '',
        gender: '',
        isActive: true,
      }
      this.mastersService.savePatientMaster(reqParam).subscribe(res => {
        if (res) {
          const row = {
            doctorId: 0,
            doctorName: null,
            gender: null,
            isActive: true,
            mobileNo: this.mobileNo ? this.mobileNo : '',
            patientAddress: this.patientAddress ? this.patientAddress : null,
            patientId: res,
            patientName: this.patientName,
            patient: {
              patientId: res,
              mobileNo: this.mobileNo ? this.mobileNo : '',
              patientName: this.patientName,
              patientAddress: this.patientAddress ? this.patientAddress : null,
            },
            tempId: Math.random()
          }
          this.patientList.push({ ...row });
        }
      });
    }
  }

  @HostListener('document:keyup', ['$event'])
  handleDeleteKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.closePopup();
    }
  }

}

import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import CustomStore from 'devextreme/data/custom_store';
import { Observable, concat } from 'rxjs';
import { map } from 'rxjs/operators';
import { IAlert } from 'src/app/public/models/AlertMessage';
import { ServiceComponentItemModel } from '../../modals/service-component-item-model';
import { BillingService } from '../../services/billing.service';
import * as _ from 'lodash';
import { DxDataGridComponent } from 'devextreme-angular';
import { Constants } from 'src/app/config/constants';
import { timeStamp } from 'console';
import { _MatOptgroupBase } from '@angular/material/core';

@Component({
  selector: 'app-attach-component-service',
  templateUrl: './attach-component-service.component.html',
  styleUrls: ['./attach-component-service.component.scss']
})
export class AttachComponentServiceComponent implements OnInit {
  @Input() componentObj: any;
  @ViewChild(DxDataGridComponent, { static: false }) public dataGrid: DxDataGridComponent;

  focusedRowData: any;
  focusedRowIndex: number;
  compListArray: any = [];
  serviceGradeList: any = [];

  componentGridData: Array<ServiceComponentItemModel>;
  compServiceDataSource: any;
  doctorDataSource: any;
  serviceCenterDataSource: any;
  alertMsg: IAlert;


  constructor(public modal: NgbActiveModal,
    private billingService: BillingService,
  ) {
    this.onEditingStart = this.onEditingStart.bind(this);
    this.onEditorPreparing = this.onEditorPreparing.bind(this);
    this.getCompServiceDataSource = this.getCompServiceDataSource.bind(this);
    this.getDoctorDataSource = this.getDoctorDataSource.bind(this);
    this.getServiceCenterDataSource = this.getServiceCenterDataSource.bind(this);
    this.isAddIconVisible = this.isAddIconVisible.bind(this);
    this.isDeleteIconVisible = this.isDeleteIconVisible.bind(this);
    this.onAddButtonClick = this.onAddButtonClick.bind(this);

    this.getCompServiceDataSource();
    this.getDoctorDataSource();
    this.getServiceCenterDataSource();
  }

  ngOnInit(): void {
    this.componentGridData = _.cloneDeep(this.componentObj.attachedCompList);
    const serviceId = this.componentObj.service.serviceId;
    const chargingTypeId = this.componentObj.chargingTypeId;
    this.GetServiceGradeList(serviceId, chargingTypeId).subscribe();
    this.loadComponents(serviceId).subscribe();


    if (this.componentGridData && this.componentGridData.length > 0) {
      setTimeout(() => {
        this.initDataGrid();
      }, 1000);
    } else if (!this.componentObj.isBillFinal) {
      this.addNewEmptyRow();
    }
  }

  GetServiceGradeList(serviceId, chargingTypeId): Observable<any> {
    return this.billingService.getServiceGradeList(serviceId, chargingTypeId).pipe(map(res => {
      this.serviceGradeList = res.srvGradeList;
      this.serviceGradeList.splice(0, 0, { id: 0, name: "--SELECT--", rate: 1 });

      _.map(this.serviceGradeList, (o) => {
        o.customName = o.name + (o.id == 0 ? '' : ' (' + o.rate + 'X)');
      });
    }));
  }

  loadComponents(serviceId): Observable<any> {
    return this.billingService.loadComponents(serviceId).pipe(map(res => {
      this.compListArray = res;
    }));
  }

  getCompServiceDataSource() {
    const compObj = this;
    this.compServiceDataSource = new CustomStore({
      key: "compId",
      load: function (loadOptions: any) {
        return new Promise((resolve, reject) => {
          const componentId = compObj.focusedRowData.componentId || 0;
          const searchText = (loadOptions.searchValue || '').toUpperCase();
          // skip already added components from list
          let compList = _.filter(compObj.compListArray, (o) => {
            return !(_.find(compObj.componentGridData, d => { return d.componentId == o.componentId; })) || componentId == o.componentId;
          });
          compList = _.filter(compList, (o) => { return o.componentId == componentId || o.componentName.toUpperCase().indexOf(searchText) !== -1; });
          compList = _.chain(compList).sortBy('componentName').take(50).value();
          resolve(compList);
        });
      },
      // Needed to process selected value(s) in the SelectBox, Lookup, Autocomplete, and DropDownBox
      byKey: (key) => {
        return new Promise((resolve, reject) => {
          let compList = _.filter(this.compListArray, (o) => { return o.componentId == key; });
          compList = _.chain(compList).sortBy('componentName').take(50).value();
          resolve(compList);
        });
      }
    });
  }

  getDoctorDataSource() {
    const compObj = this;
    this.doctorDataSource = new CustomStore({
      key: "doctorId",
      load: function (loadOptions: any) {
        return new Promise((resolve, reject) => {
          const doctorId = compObj.focusedRowData.doctor || 0;
          const searchText = (loadOptions.searchValue || '').toUpperCase();
          let doctorList = _.filter(compObj.componentObj.doctorListArray, (o) => { return o.doctorId == doctorId || o.doctorName.toUpperCase().indexOf(searchText) !== -1; });
          doctorList = _.chain(doctorList).sortBy('doctorName').take(50).value();
          resolve(doctorList);
        });
      },
      // Needed to process selected value(s) in the SelectBox, Lookup, Autocomplete, and DropDownBox
      byKey: (key) => {
        return new Promise((resolve, reject) => {
          let doctorList = _.filter(this.componentObj.doctorListArray, (o) => { return o.doctorId == key; });
          doctorList = _.chain(doctorList).sortBy('doctorName').take(50).value();
          resolve(doctorList);
        });
      }
    });
  }

  getServiceCenterDataSource() {
    const compObj = this;
    this.serviceCenterDataSource = new CustomStore({
      key: "serviceCenterId",
      loadMode: 'raw',
      cacheRawData: true,
      load: function (loadOptions: any) {
        return new Promise((resolve, reject) => {
          const serviceId = compObj.focusedRowData?.componentId || 0;
          compObj.billingService.GetServiceCenterList(serviceId).subscribe(result => {
            resolve(result);
          });
        });
      },
      // Needed to process selected value(s) in the SelectBox, Lookup, Autocomplete, and DropDownBox
      byKey: (key) => {
        return new Promise((resolve, reject) => {
          const serviceId = compObj.focusedRowData?.componentId || 0;
          compObj.billingService.GetServiceCenterList(serviceId).subscribe(result => {
            resolve(result);
          });
        });
      }
    });
  }

  getSelectedMultiplier(event) {
    if (event && event.rate !== 0) {
      _.map(this.componentGridData, (o) => {
        o.multiplier = event.rate;
        o.netRate = _.toNumber((parseFloat(o.rate || 0) * parseFloat(o.multiplier || 0)).toFixed(2));
        o.totalAmount = _.toNumber((parseFloat(o.orderQty || 0) * parseFloat(o.netRate || 0)).toFixed(2));
      });
      this.dataGrid.instance.refresh();
    }
  }

  initDataGrid() {
    let el = this.dataGrid.instance.getCellElement(0, 'componentId');
    this.dataGrid.instance.focus(el);
    this.dataGrid.tabIndex = 3;
    this.dataGrid.keyboardNavigation.enabled = true;
    //this.dataGrid.focusStateEnabled = true;
  }

  allowDeleting(e) {
    return e.component.totalCount() == 1 ? e.row.rowIndex != 0 : !e.row.data.isDefault;
  }

  onFocusedRowChanged(evt) {
    console.log(evt);
    this.focusedRowData = evt.row.data;
    this.focusedRowIndex = evt.row.rowIndex;
    this.serviceCenterDataSource.clearRawDataCache();
  }

  onEditingStart(evt: any) {
    if (this.componentObj.isBillFinal) {
      evt.cancel = true;
    } else if (evt.column.dataField !== 'isSelected' && (evt.data.isReadOnly || !evt.data.isSelected)) {
      evt.cancel = true;
    } else if (evt.column.dataField == 'doctorId' && !evt.data.isDoctorPolicy) {
      evt.cancel = true;
    } else if (evt.column.dataField == 'componentId' && evt.data.isDefault) {
      evt.cancel = true;
    }
  }

  onEditorPreparing(evt: any): void {
    const compInstance = this;
    if (evt.parentType == "dataRow") {
      // validation and add new row on tab press
      evt.editorOptions.onKeyDown = (arg) => {
        if (evt.dataField == "remark" && arg.event.keyCode == 9
          && (evt.row.dataIndex == (compInstance.componentGridData.length - 1))) {
          this.onAddButtonClick(evt);
          arg.event.preventDefault();
        }
      }
    }

    // on cell value change event fire here
    evt.editorOptions.onValueChanged = (e: any) => {
      evt.setValue(e.value);
      let rowObj = this.componentGridData[evt.row.rowIndex];

      switch (evt.dataField) {
        case 'componentId':
          if (e.value) {
            var component = e.component.option("selectedItem");
            rowObj.componentName = component.componentName;

            // get component details
            this.billingService.getComponentDetails(rowObj.componentId).subscribe(result => {
              if (result) {
                rowObj.componentType = result.scomType;
                rowObj.isDoctorPolicy = result.isDoctorPolicy == 'Y';
                rowObj.serviceCenterId = result.serviceCenterId;
                rowObj.serviceCenterName = result.serviceCenterName;
                rowObj.doctorName = rowObj.isDoctorPolicy ? 'Select' : 'NA';
              }
            });
          } else {
            evt.setValue('');
          }
          break;
        case 'doctorId':
          var doctor = e.component.option("selectedItem");
          rowObj.doctorName = doctor.doctorName;
          break;
        case 'serviceCenterId':
          var serviceCenter = e.component.option("selectedItem");
          rowObj.serviceCenterName = serviceCenter.serviceCenterName;
          break;
        case 'orderQty':
          rowObj.orderQty = _.toNumber(parseFloat(e.value || 0).toFixed(2));
          break;
        case 'rate':
          rowObj.rate = _.toNumber(parseFloat(e.value || 0).toFixed(2));
          break;
        case 'remark':
          rowObj.remark = _.toNumber(parseFloat(e.value || '').toFixed(2));
          break;
      }
      this.calculateRowData(evt.row.rowIndex);
      //this.dataGrid.instance.refresh();
    }
  }

  onEditCanceled(evt: any) {
    this.dataGrid.instance.refresh();
  }

  calculateRowData(rowIndex) {
    let rowObj = this.componentGridData[rowIndex];
    rowObj.netRate = _.toNumber((rowObj.multiplier * rowObj.rate).toFixed(2));
    rowObj.totalAmount = _.toNumber((rowObj.orderQty * rowObj.netRate).toFixed(2));
  }

  calculateSelectedRow(options) {
    if (options.summaryProcess === "start") {
      options.totalValue = 0;
    }
    if (options.summaryProcess === "calculate" && options.value.isSelected) {
      if (options.name === "rateSummary") {
        options.totalValue = ((+options.totalValue) + (+options.value.rate)).toFixed(2);
      }
      else if (options.name === "netRateSummary") {
        options.totalValue = ((+options.totalValue) + (+options.value.netRate)).toFixed(2);
      }
      else if (options.name === "orderQtySummary") {
        options.totalValue = ((+options.totalValue) + (+options.value.orderQty)).toFixed(2);
      }
      else if (options.name === "totalAmountSummary") {
        options.totalValue = ((+options.totalValue) + (+options.value.totalAmount)).toFixed(2);
      }
    }
  }

  showValidationMsg(msg) {
    this.alertMsg = {
      message: msg,
      messageType: 'warning',
      duration: Constants.ALERT_DURATION
    };
  }

  validateRowDetail(rowIndex) {
    let flag = '';
    let rowObj = this.componentGridData[rowIndex];
    if (!rowObj.componentId || !rowObj.componentName) {
      this.showValidationMsg('Component name is required');
      flag = 'componentId';
    } else if (!rowObj.orderQty || rowObj.orderQty <= 0) {
      this.showValidationMsg('Qty is required');
      flag = 'orderQty';
    } else if (rowObj.isDoctorPolicy && (!rowObj.doctorId || !rowObj.doctorName)) {
      this.showValidationMsg('Attach Doctor is required');
      flag = 'doctorId';
    }
    // else if (!rowObj.rate || rowObj.rate <= 0) {
    //   this.showValidationMsg('Rate is required');
    //   flag = 'rate';
    // }
    if (flag) {
      // let el = this.dataGrid.instance.getCellElement(rowIndex, flag);
      // this.dataGrid.instance.focus(el);
      this.dataGrid.instance.editCell(rowIndex, flag);
    }
    return flag;
  }

  isAddIconVisible(e) {
    return !this.componentObj.isBillFinal && e.row.rowIndex === (this.componentGridData.length - 1) && !this.componentObj.isPatientClassChangePage;
  }
  isDeleteIconVisible(e) {
    return !this.componentObj.isBillFinal && !e.row.data.isDefault;
  }

  onAddButtonClick(evt) {
    let isValidDataField = this.validateRowDetail(evt.row.rowIndex)
    if (!isValidDataField) {
      this.addNewEmptyRow();
    }
  }

  decimalWithPrecision(data: any) {
    return parseFloat(data.value || 0).toFixed(2);
  }

  addNewEmptyRow() {
    const serviceObj = new ServiceComponentItemModel();
    serviceObj.generateObject({ multiplier: this.componentObj.multiplier }, this.componentObj.service);
    this.componentGridData.push(serviceObj);
  }

  saveAttachDetail() {
    let inValidDataField = '';
    _.map(this.componentGridData, (data: any, rowIndex: any) => {
      if (!inValidDataField && data.isSelected) {
        inValidDataField = this.validateRowDetail(rowIndex);
      }
    });

    // save if all data is valid
    if (!inValidDataField) {
      const response = {
        multiplier: this.componentObj.multiplier,
        attachedCompList: this.componentGridData
      }
      this.modal.close(response);
      //this.modal.dismiss();
    }

  }

}

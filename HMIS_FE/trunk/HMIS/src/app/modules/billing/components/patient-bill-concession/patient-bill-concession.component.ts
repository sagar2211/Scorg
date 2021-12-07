import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { BillingService } from '../../services/billing.service';
import * as _ from 'lodash';
import { IAlert } from 'src/app/public/models/AlertMessage';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { concat, Observable, of, Subject } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import CustomStore from 'devextreme/data/custom_store';
import { DxDataGridComponent } from 'devextreme-angular';
import { Constants } from 'src/app/config/constants';
import { BillConcessionModel } from '../../modals/bill-concession-model';
import { CanActivate } from '@angular/router';

@Component({
  selector: 'app-patient-bill-concession',
  templateUrl: './patient-bill-concession.component.html',
  styleUrls: ['./patient-bill-concession.component.scss']
})
export class PatientBillConcessionComponent implements OnInit {
  @Input() patientData: any;
  @ViewChild(DxDataGridComponent, { static: false }) public dataGrid: DxDataGridComponent;

  alertMsg: IAlert;
  isApply = false;
  popupHeaderTitle: string;
  //concessionForm: FormGroup;
  discountEntityArray: Array<any> = [
    { entityType: 'attach_doctor', entityTypeName: 'Billing Doctor Concession'},
    { entityType: 'employee', entityTypeName: 'Employee Concession'},
    { entityType: 'service_head', entityTypeName: 'Service Head Concession'},
    { entityType: 'referral_doctor', entityTypeName: 'Referral Hospital Doctor Concession'},
    { entityType: 'external_doctor', entityTypeName: 'Referral External Doctor Concession'},
  ];

  serviceList$ = new Observable<any>();
  serviceListInput$ = new Subject<any>();
  serviceList: Array<any> = [];
  serviceHeadListArray: Array<any> = [];
  employeeListArray: Array<any> = [];
  doctorListArray: Array<any> = [];
  referralDoctorList: Array<any> = [];
  externalReferralDoctorList: Array<any> = [];
  billServiceArray: Array<any> = [];
  billConcessionArray: Array<any> = [];
  billConcessionArrayCloned: Array<any> = [];

  focusedRowIndex: number;
  focusedRowData: any;
  lastKeyEventCode: any;
  entityDataSource: any;

  isServiceAdminCharge: boolean = false;
  serviceAdminChargeBeforeCons: boolean = false;
  isViewOnly: boolean = false;

  constructor(
    public fb: FormBuilder,
    public modal: NgbActiveModal,
    public billingService: BillingService
  ) {
    this.onEditingStart = this.onEditingStart.bind(this);
    this.onEditorPreparing = this.onEditorPreparing.bind(this);
    this.geEntityDataSource = this.geEntityDataSource.bind(this);

    this.isAddIconVisible = this.isAddIconVisible.bind(this);
    this.isDeleteIconVisible = this.isDeleteIconVisible.bind(this);
    this.onAddButtonClick = this.onAddButtonClick.bind(this);

    // register data source
    this.geEntityDataSource();
  }

  ngOnInit(): void {
    // set patient details to popup title
    this.popupHeaderTitle = " UHID - " + this.patientData.selectedPatient?.uhid + '/' + this.patientData.selectedPatient?.fullName;
    this.isViewOnly = this.patientData.isBillViewOnly;

    // admin charges setting check its apply before or after concession
    this.isServiceAdminCharge = this.patientData.isServiceAdminCharge;
    this.serviceAdminChargeBeforeCons = this.patientData.serviceAdminChargeBeforeCons;

    // get bill service and doctor array from bill page
    this.billConcessionArray = _.cloneDeep(this.patientData.billConcessionArray || []);
    this.billServiceArray = _.cloneDeep(this.patientData.billServiceArray);

    // reform doctor list array for ng-select
    this.doctorListArray = _.map(this.patientData.doctorListArray, (o) => {
      return { id: o.doctorId, name: o.doctorName };
    });

    if (this.patientData.selectedPatient.referralInfo) {
      const referralInfo = this.patientData.selectedPatient.referralInfo;
      if (referralInfo.referTypeId == 1) {
        this.referralDoctorList = [{ id: referralInfo.referById, name: referralInfo.referByName }];
      } else if (referralInfo.referTypeId == 5) {
        this.externalReferralDoctorList = [{ id: referralInfo.referById, name: referralInfo.referByName }];
      }
    }

    // load service and service head list from api
    this.loadServiceList();
    this.getEmployeeList().subscribe(res => {
      this.getServiceHeadList().subscribe(o => {
        this.updateDiscountApplicableAmount();
        this.repopulateConcessionData(true);
        this.initDataGrid();
      });
    });
  }

  updateDiscountApplicableAmount() {
    // update Discount Applicable Amount
    _.map(this.billServiceArray, (rowObj) => {
      //let rowObj = this.billServiceArray[rowIndex];
      const amountAfterPckDisc = _.round((rowObj.amount - rowObj.pkgDiscAmt), 2);
      // calculate admin charge before concession
      let serviceAdminCharges = 0;
      if (this.isServiceAdminCharge && this.serviceAdminChargeBeforeCons && rowObj.adminChargePercent > 0) {
        serviceAdminCharges = _.round((amountAfterPckDisc * rowObj.adminChargePercent) / 100, 2);
      }
      // service amount after admin charges
      let serviceAmountAfterAdminCharge = amountAfterPckDisc + serviceAdminCharges;
      rowObj.discountApplicableAmount = serviceAmountAfterAdminCharge;
    });
  }

  repopulateConcessionData(isLoad?) {
    // update entity billing amount, entity type name and concession amount - service level priority first
    let billConcessionArray = _.filter(this.billConcessionArray, (o) => { return o.applicableOn != 'Bill'; });
    _.map(billConcessionArray, (v, k) => {
      const rowIndex = _.findIndex(this.billConcessionArray, (o) => { return o.tempId == v.tempId; });
      const entityTypeObj = _.find(this.discountEntityArray, (o) => { return o.entityType == v.discountEntityType; });
      v.discountEntityTypeName = entityTypeObj.entityTypeName;
      this.onEntityChange(rowIndex);
    });

    // Apply concession into bill service array
    this.applyConcessionIntoBillServiceArray();

    billConcessionArray = _.filter(this.billConcessionArray, (o) => { return o.applicableOn == 'Bill'; });
    _.map(billConcessionArray, (v, k) => {
      const rowIndex = _.findIndex(this.billConcessionArray, (o) => { return o.tempId == v.tempId; });
      const entityTypeObj = _.find(this.discountEntityArray, (o) => { return o.entityType == v.discountEntityType; });
      v.discountEntityTypeName = entityTypeObj.entityTypeName;
      this.onEntityChange(rowIndex);
    });

    if (isLoad) {
      this.billConcessionArrayCloned = _.cloneDeep(this.billConcessionArray);
    }
  }

  getServiceHeadList(): Observable<any> {
    return this.billingService.GetServiceHeadAllList().pipe(map(res => {
      this.serviceHeadListArray = res;
      return res;
    }));
  }

  getEmployeeList(): Observable<any> {
    return this.billingService.getEmployeeList().pipe(map(res => {
      this.employeeListArray = _.map(res, (o) => {
        return { id: o.employeeId, name: o.employeeName };
      });
      return res;
    }));
  }

  private loadServiceList(searchKeyword?): void {
    this.serviceList$ = concat(
      this.billingService.GetServiceListBySearchKeyword(searchKeyword ? searchKeyword : ''), // default items
      this.serviceListInput$.pipe(
        distinctUntilChanged(),
        debounceTime(500),
        switchMap(term => this.billingService.GetServiceListBySearchKeyword(term ? term : (searchKeyword ? searchKeyword : '')).pipe(
          catchError(() => of([]))
        ))
      )
    );
  }

  onEntityChange(rowIndex) {
    // get billing amount against selected entity
    const rowObj = this.billConcessionArray[rowIndex];
    if (rowObj) {
      // for bill level concession show concession applicable amount in entity billing amount
      if (rowObj.applicableOn == 'Bill') {
        rowObj.entityBillAmount = _.round(this.concessionApplicableBillAmount, 2);
      }
      else {
        // for service level concession show concession applicable amount in entity billing amount
        const entityBillAmount = _.round((_.sumBy(this.billServiceArray, (o) => {
          if (o.service && ((o.discountPercent == 0  && o.discountAmount == 0) || (o.discountEntityType == rowObj.discountEntityType))) {
            return (rowObj.discountEntityType == 'attach_doctor' && o.doctorId == rowObj.discountEntityId) ? o.discountApplicableAmount
              : (rowObj.discountEntityType == 'service_head' && o.service.serviceHeadId == rowObj.discountEntityId) ? o.discountApplicableAmount : 0;
          } else {
            return 0;
          };
        })), 2);
        rowObj.entityBillAmount = entityBillAmount;
      }

      // show calculated discount amount based on discount percent
      rowObj.discountPercent = parseFloat(rowObj.discountPercent || 0);
      rowObj.discountAmount = _.round(((rowObj.entityBillAmount * rowObj.discountPercent) / 100), 2);
    }
  }

  updateBillCalType($event, rowIndex, discountType) {
    const rowObj = this.billConcessionArray[rowIndex];
    if (rowObj) {
      if (discountType == 'discountPercent') {
        const discountAmount = _.round(((rowObj.entityBillAmount * rowObj.discountPercent) / 100), 2);
        rowObj.discountAmount = discountAmount;
      } else {
        const discountPercent = _.round(((rowObj.discountAmount * 100) / rowObj.entityBillAmount), 2);
        rowObj.discountPercent = discountPercent;
      }
      rowObj.discountType = discountType;

      // update discount percent and discount amount in bill array
      this.applyConcessionIntoBillServiceArray();
    }
  }

  private get concessionApplicableBillAmount() {
    // for bill level concession show concession applicable amount in entity billing amount
    const billingForm = this.patientData.billingForm.value;

    // *** ADMIN CHARGE RULES ****
    // IP and ER patient --> admin charges apply on service level and bill level
    // OP patient --> admin charges apply on service level only
    const isOpPatient = billingForm.selectedPatient.penType == 'OP';
    const gridData = this.billServiceArray;

    // bill amount is grid net amount sum
    const billAmount = _.round(_.sumBy(gridData, (o) => { return parseFloat(o.totNetAmt || 0); }), 2);

    // calculate admin charge before concession
    let adminChargeAppBillAmount = _.round(_.sumBy(gridData, (o) => {
      return ((o.isNonService && o.service && o.service.isAdminCharge) || o.adminChargeAmount > 0) ? 0 : parseFloat(o.totNetAmt || 0);
    }), 2);

    // skip admin charges for OP patient
    let billAdminCharges = 0;
    if (!isOpPatient && this.patientData.isBillAdminCharge && this.patientData.billAdminChargeBeforeCons && billingForm.adminChargesPer > 0) {
      billAdminCharges = _.round((adminChargeAppBillAmount * billingForm.adminChargesPer) / 100, 2);
    }

    // bill amount after admin charges
    let billAmountAfterAdminCharge = billAmount + billAdminCharges;

    // patient category concession
    const categoryConcPer = _.round((billingForm.selectedPatient.penCategoryConcession), 2);

    // calculate category concession amount on bill amount
    const categoryConcAmt = _.round((billAmountAfterAdminCharge * categoryConcPer) / 100, 2);

    // bill amount after category concession
    const billAmountAfterCatCons = _.round((billAmountAfterAdminCharge - categoryConcAmt), 2)

    return billAmountAfterCatCons;
  }

  applyConcessionIntoBillServiceArray() {
    // reset existing applied bill concession...
    this.resetBillConcession();

    // apply
    //const concessionArray = this.concessionForm.get('concessionArray').value;
    _.map(this.billConcessionArray, (con) => {
      _.map(this.billServiceArray, (bill) => {
        if (bill.service && bill.status != "REVERSE" && bill.status != "CANCEL"
          && ((bill.discountPercent == 0  && bill.discountAmount == 0) || (bill.discountEntityType == con.discountEntityType))
          && con.discountPercent >= 0 // update concession amount where percent greater than zero
          && ((con.discountEntityType == 'service' && bill.service.serviceId == con.discountEntityId)
            || (con.discountEntityType == 'attach_doctor' && bill.doctorId == con.discountEntityId)
            || (con.discountEntityType == 'service_head' && bill.service.serviceHeadId == con.discountEntityId))
          ) {
          this.calculateRowData(bill, con);
          // mark dirty bill rows where discount is applied
          if (bill.discountAmount > 0) {
            bill.isDirty = true;
          }
        }
      });
    });
  }

  resetBillConcession() {
    _.map(this.billServiceArray, (bill) => {
      if (bill.service && bill.status != "REVERSE" && bill.status != "CANCEL" && bill.discountEntityType != 'manual') {
        bill.discountEntityType = 'manual';
        bill.discountType = 'discountAmount';
        bill.discountPercent = 0;
        bill.discountAmount = 0;
        bill.isDirty = this.isViewOnly ? false : true;
        this.calculateRowData(bill);
      }
    });
  }

  getMaxConcession(billRowObj) {
    billRowObj = _.cloneDeep(billRowObj);
    const concessionArray = this.billConcessionArray;
    // check for service level first
    const serviceCon = _.find(concessionArray, (o) => { return o.discountEntityType == 'service' && o.discountEntityId == billRowObj.service.serviceId });
    if (serviceCon) {
      billRowObj = this.calculateRowData(billRowObj, serviceCon);
    }
    // check for service level first
    const serviceHeadCon = _.find(concessionArray, (o) => { return o.discountEntityType == 'service_head' && o.discountEntityId == billRowObj.service.serviceHeadId });
    if (serviceHeadCon) {
      billRowObj = this.calculateRowData(billRowObj, serviceHeadCon);
    }
    // check for service level first
    const doctorConcession = _.find(concessionArray, (o) => { return o.discountEntityType == 'attach_doctor' && o.discountEntityId == billRowObj.doctorId });
    if (doctorConcession) {
      billRowObj = this.calculateRowData(billRowObj, doctorConcession);
    }
  }

  calculateRowData(rowObj, conObj?) {
    //let rowObj = this.billServiceArray[rowIndex];
    const amountAfterPckDisc = _.round((rowObj.amount - rowObj.pkgDiscAmt), 2);

    // calculate admin charge before concession
    let serviceAdminCharges = 0;
    if (this.isServiceAdminCharge && this.serviceAdminChargeBeforeCons && rowObj.adminChargePercent > 0) {
      serviceAdminCharges = _.round((amountAfterPckDisc * rowObj.adminChargePercent) / 100, 2);
    }

    // service amount after admin charges
    let serviceAmountAfterAdminCharge = amountAfterPckDisc + serviceAdminCharges;

    // apply bill level concession..
    if (conObj && conObj.discountType) {
      rowObj.discountEntityType = conObj.discountEntityType;
      // discount amount and percent calculation
      if (conObj.discountType == 'discountPercent') {
        rowObj.discountPercent = conObj.discountPercent;
        rowObj.discountAmount = _.round(((serviceAmountAfterAdminCharge * conObj.discountPercent) / 100), 2);
      } else if (conObj.discountType != 'discountPercent') {
        rowObj.discountType = 'discountAmount'
        // utilize discount amount into bill
        const discountBal =  parseFloat(conObj.discountAmout) - parseFloat(conObj.discountUtilized);
        rowObj.discountAmount = serviceAmountAfterAdminCharge  >= discountBal ? discountBal : serviceAmountAfterAdminCharge;
        rowObj.discountPercent = _.round(((rowObj.discountAmount * 100) / serviceAmountAfterAdminCharge), 2);
      }
    }
    else {
      // discount amount and percent calculation
      if (rowObj.discountType == 'discountPercent') {
        rowObj.discountAmount = _.round(((serviceAmountAfterAdminCharge * rowObj.discountPercent) / 100), 2);
      } else if (rowObj.discountType != 'discountPercent') {
        rowObj.discountType = 'discountAmount'
        rowObj.discountPercent = _.round(((rowObj.discountAmount * 100) / serviceAmountAfterAdminCharge), 2);
        rowObj.discountAmount = rowObj.discountAmount || 0;
      }
    }

    // service amount after concession
    let serviceAmountAfterDiscount = _.round(serviceAmountAfterAdminCharge - rowObj.discountAmount, 2);

    // calculate admin charge after concession
    if (this.isServiceAdminCharge && !this.serviceAdminChargeBeforeCons && rowObj.adminChargePercent > 0) {
      serviceAdminCharges = _.round((serviceAmountAfterDiscount * rowObj.adminChargePercent) / 100, 2);

      // service amount after admin charges
      serviceAmountAfterDiscount = _.round(serviceAmountAfterDiscount + serviceAdminCharges, 2);
    }

    // set service admin charges amount
    rowObj.adminChargeAmount = serviceAdminCharges;

    // gst, purchase amount, unit rate and mrp calculation
    rowObj.grossAmt = _.round(serviceAmountAfterDiscount, 2);
    rowObj.gstAmount = _.round((rowObj.grossAmt * rowObj.gstPercent) / 100, 2) || 0;
    rowObj.totNetAmt = _.round((rowObj.grossAmt + rowObj.gstAmount), 2) || 0;
  }

  geEntityDataSource() {
    const compObj = this;
    this.entityDataSource = new CustomStore({
      key: "id",
      load: function (loadOptions: any) {
        return new Promise((resolve, reject) => {
          const entityType = compObj.focusedRowData.discountEntityType || 'attach_doctor';
          const dataSourceArray = compObj.getEntityDataSourceArray(entityType);
          const entityId = compObj.focusedRowData.discountEntityId || 0;
          const searchText = (loadOptions.searchValue || '').toUpperCase();
          let entityList = _.filter(dataSourceArray, (o) => { return o.id == entityId || o.name.toUpperCase().indexOf(searchText) !== -1; });
          entityList = _.chain(entityList).sortBy('name').take(50).value();
          resolve(entityList);
        });
      },
      // Needed to process selected value(s) in the SelectBox, Lookup, Autocomplete, and DropDownBox
      byKey: (key) => {
        return new Promise((resolve, reject) => {
          const entityType = compObj.focusedRowData.discountEntityType || 'attach_doctor';
          const dataSourceArray = compObj.getEntityDataSourceArray(entityType);
          let entityList = _.filter(dataSourceArray, (o) => { return o.id == key; });
          entityList = _.chain(entityList).sortBy('name').take(50).value();
          resolve(entityList);
        });
      }
    });
  }

  getEntityDataSourceArray(discountEntityType)
  {
    let dataSourceArray = [];
    switch(discountEntityType)
    {
      case 'attach_doctor': {
        dataSourceArray = _.filter(this.doctorListArray, (o) => {
          return _.find(this.billServiceArray, (b) => { return b.doctorId == o.id; });
        });
        break;
      }
      case 'employee': {
        dataSourceArray = this.employeeListArray;
        break;
      }
      case 'service_head': {
        dataSourceArray = _.filter(this.serviceHeadListArray, (o) => {
          return _.find(this.billServiceArray, (b) => { return b.service && b.service.serviceHeadId == o.id; });
        });
        break;
      }
      case 'referral_doctor': {
        dataSourceArray = this.referralDoctorList;
        break;
      }
      case 'external_doctor': {
        dataSourceArray = this.externalReferralDoctorList;
        break;
      }
    }
    return _.cloneDeep(dataSourceArray);
  }

  // grid events ------------------------------------------------------

  private get newRowIndex() {
    return this.billConcessionArray.length - 1;
  }

  initDataGrid() {
    this.dataGrid.instance.refresh();

    // add new empty bill concession row
    if (this.billConcessionArray.length == 0) {
      this.addNewEmptyRow();
    }

    setTimeout(() => {
      let el = this.dataGrid.instance.getCellElement(this.newRowIndex, 'discountEntityType');
      this.dataGrid.instance.focus(el);
      this.dataGrid.tabIndex = 1;
      this.dataGrid.keyboardNavigation.enabled = true;
      this.dataGrid.instance.editCell(this.newRowIndex, 'discountEntityType');
    }, 200);
  }

  allowDeleting(e) {
    return e.component.totalCount() == 1 ? e.row.rowIndex != 0 : true;
  }

  getFocusedRowIndex(tempId) {
    const focusedRowIndex = _.findIndex(this.billConcessionArray, (o) => { return o.tempId == tempId; });
    return focusedRowIndex;
  }

  onFocusedRowChanged(evt) {
    this.focusedRowData = evt.row.data;
    //this.focusedRowIndex = evt.row.rowIndex;
    this.focusedRowIndex = this.getFocusedRowIndex(evt.row.data.tempId);
    this.entityDataSource.clearRawDataCache();
  }

  onRowPrepared(e) {

  }

  onRowRemoving(e) {
    if (this.billConcessionArray.length == 1) {
      this.addNewEmptyRow();
    }
    this.dataGrid.instance.refresh();

    setTimeout(() => {
      // update entity billing amount and concession
      this.repopulateConcessionData();
    }, 100);
  }

  onEditingStart(evt: any) {
    // disable all grid fields for view only mode
    if (this.isViewOnly) {
      evt.cancel = true;
    }

    if (evt.column.dataField == 'discountEntityType' && this.focusedRowIndex != this.newRowIndex) {
      evt.cancel = true;
    }
    else if (evt.column.dataField == 'discountPercent' && !evt.data.discountEntityId) {
      evt.cancel = true;
    }
  }

  onEditorPrepared(evt: any) {
    //console.log('onEditorPrepared', evt.dataField, evt);
  }

  onEditorPreparing(evt: any): void {
    const compInstance = this;
    if (evt.parentType == "dataRow") {
      // validation and add new row on tab press
      evt.editorOptions.onKeyDown = (arg) => {
        this.lastKeyEventCode = arg.event.keyCode;
        if (evt.dataField == "discountEntityId" && arg.event.keyCode == 9 && !arg.component.option("selectedItem")) {
          compInstance.showValidationMsg('Discount Entity should be not be empty');
        } else if (evt.dataField == "discountPercent" && arg.event.keyCode == 9 && parseFloat(arg.component.option("text") || 0) <= 0) {
          compInstance.showValidationMsg('Discount Percent should be not be empty');
        }
      }
    }

    // on cell value change event fire here
    evt.editorOptions.onValueChanged = (e: any) => {
      evt.setValue(e.value);

      const rowIndex = this.getFocusedRowIndex(evt.row.data.tempId);
      let rowObj = this.billConcessionArray[rowIndex];
      let newCellValue = null;

      switch (evt.dataField) {
        case 'discountEntityType':
          var type = e.component.option("selectedItem");
          rowObj.discountEntityType = type.entityType;
          rowObj.discountEntityTypeName = type.entityTypeName;
          newCellValue = rowObj.entityType;
          // reset row values
          // check for concession applicable on service level bill level by entity type
          rowObj.applicableOn = (rowObj.discountEntityType == 'attach_doctor' || rowObj.discountEntityType == 'service_head') ? 'Services' : 'Bill';
          rowObj.entityBillAmount = rowObj.applicableOn == 'Bill' ? _.round(this.concessionApplicableBillAmount, 2) : 0.00;
          rowObj.discountEntityId = null;
          rowObj.discountEntityName = '-Select-';

          rowObj.discountPercent = 0.00;
          rowObj.discountAmount = 0.00;
          break;
        case 'discountEntityId':
          var entity = e.component.option("selectedItem");
          rowObj.discountEntityId = entity.id;
          rowObj.discountEntityName = entity.name;
          newCellValue = entity.id;
          // reset row values
          rowObj.discountPercent = 0.00;
          rowObj.discountAmount = 0.00;
          //this.onEntityChange(rowIndex);

          // check same concession already applied then prevent
          const isConcessionExists = _.find(this.billConcessionArray, (o) => {
            return o.tempId != evt.row.data.tempId && o.discountEntityType == rowObj.discountEntityType
              && o.discountEntityId == rowObj.discountEntityId;
          });
          if (isConcessionExists) {
            evt.setValue(null);
            rowObj.discountEntityId = null;
            rowObj.discountEntityName = '-Select-';
            newCellValue = null;
            this.showValidationMsg('Same concession already applied. Please select other concession type or entity');
          }
          break;
        case 'discountPercent':
          const oldDiscount = rowObj.discountPercent;
          rowObj.discountPercent = _.round(parseFloat(e.value || 0), 2);

          // check bill level discount should not be more than 100%
          const totalBillConcessionPercent = _.sumBy(this.billConcessionArray, (o) => {
            return o.applicableOn == 'Bill' ? o.discountPercent : 0;
          });
          if (totalBillConcessionPercent > 100) {
            evt.setValue(oldDiscount);
            rowObj.discountPercent = oldDiscount;
            this.showValidationMsg('Bill level total concession percent should be less than 100 precent.');
          }
          //rowObj.isRateChanged = oldDiscount != rowObj.discountPercent;
          const discountAmount = rowObj.discountPercent == 0 ? 0 :_.round(((rowObj.entityBillAmount * rowObj.discountPercent) / 100), 2);
          rowObj.discountAmount = discountAmount;
          newCellValue = rowObj.discountPercent;
          break;
      }

      // update discount percent and discount amount in bill array
      this.repopulateConcessionData();
      //this.applyConcessionIntoBillServiceArray();

      if (evt.dataField == "discountPercent" && this.lastKeyEventCode == 9
        && (rowIndex == this.newRowIndex)) {
        this.onAddButtonClick(evt);
        this.lastKeyEventCode = 0;
        //arg.event.preventDefault();
      }
      this.dataGrid.instance.refresh();
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
    let rowObj = this.billConcessionArray[rowIndex];

    // validation will be check for service order and non edited and old records if rate flag is incomplete
    if (!rowObj.discountEntityType) {
      this.showValidationMsg('Concession Entity Type is required');
      flag = 'discountEntityType';
    } else if (!rowObj.discountEntityId) {
      this.showValidationMsg('Please select Concession Entity Id');
      flag = 'discountEntityId';
    } else if (rowObj.discountPercent <= 0 || rowObj.discountPercent > 100) {
      this.showValidationMsg('Please enter valid concession percent');
      flag = 'discountPercent';
    }
    if (flag) {
      let el = this.dataGrid.instance.getCellElement(rowIndex, flag);
      this.dataGrid.instance.focus(el);
      this.dataGrid.instance.editCell(rowIndex, flag);
    }
    return flag;
  }

  isAddIconVisible(e) {
    return this.isViewOnly ? false : e.row.rowIndex === this.newRowIndex;
  }

  isDeleteIconVisible(e) {
    return !this.isViewOnly;
  }

  onAddButtonClick(evt) {
    const rowIndex = this.getFocusedRowIndex(evt.row.data.tempId);
    let isValidDataField = this.validateRowDetail(rowIndex)
    if (!isValidDataField) {
      this.addNewEmptyRow();
    }
  }

  decimalWithPrecision(data: any) {
    return parseFloat(data.value || 0).toFixed(2);
  }

  addNewEmptyRow() {
    const concessionObj = new BillConcessionModel();
    concessionObj.generateObject({});
    this.billConcessionArray.splice(this.newRowIndex + 1, 0, concessionObj);

    this.initDataGrid();
  }

  applyConcession() {
    let inValidDataField = '';
    _.map(this.billConcessionArray, (data: any, rowIndex: any) => {
      if (!inValidDataField && data.discountEntityType && data.discountEntityId) {
        inValidDataField = this.validateRowDetail(rowIndex);
      }
    });
    // if invalid data entered then prevent to add
    if (inValidDataField) {
      return;
    }

    const returnObj = {
      billServiceArray: this.billServiceArray,
      billConcessionArray: _.filter(this.billConcessionArray, (o) => { return o.discountPercent > 0; })
    }

    // check for dirty changes..
    const isDirtyChanges = !(_.isEqual(this.billConcessionArrayCloned, returnObj.billConcessionArray));
    if (isDirtyChanges) {
      this.modal.dismiss(returnObj);
    } else {
      this.modal.dismiss(false);
    }
  }

}

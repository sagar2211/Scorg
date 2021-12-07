import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectComponent } from '@ng-select/ng-select';
import { DxDataGridComponent } from 'devextreme-angular';
import * as _ from 'lodash';
import * as moment from 'moment';
import { concat, Observable, of, Subject } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { Constants } from 'src/app/config/constants';
import { IssueService } from 'src/app/modules/issue/services/issue.service';
import { MastersService } from 'src/app/modules/masters/services/masters.service';
import { IAlert } from 'src/app/public/models/AlertMessage';
import { AuthService } from 'src/app/public/services/auth.service';
import { CommonService } from 'src/app/public/services/common.service';
import { MappingService } from "../../../../public/services/mapping.service";
import { SaleReturnService } from '../../services/sale-return.service';


@Component({
  selector: 'app-sale-return',
  templateUrl: './sale-return.component.html',
  styleUrls: ['./sale-return.component.scss']
})
export class SaleReturnComponent implements OnInit {
  @ViewChild(DxDataGridComponent, { static: false }) public dataGrid: DxDataGridComponent;
  public items$: Observable<any>;
  public input$ = new Subject<string | null>();
  @ViewChild('code') private codeRef?: ElementRef<HTMLElement>;
  @ViewChild('patientSelection') selectPat: NgSelectComponent;
  @ViewChild('deptSelection') selectDept: NgSelectComponent;
  @ViewChild('counterPatientSelection') selectCounterPatient: NgSelectComponent;
  alertMsg: IAlert;
  allTypeSaleForm: FormGroup;
  saleTypeList = [
    {
      id: 1,
      name: 'Counter Sale'
    }
  ];
  counterTypeList = [
    {
      id: 1,
      name: 'Debtor/Patient'
    },
    {
      id: 2,
      name: 'Voucher'
    }
  ];
  debtorType = [
    {
      id: 1,
      name: 'Debtor'
    },
    {
      id: 2,
      name: 'Company'
    }
  ];
  voucherTypeList = [{
    id: 1,
    name: 'CASH'
  },
  {
    id: 2,
    name: 'CREDIT'
  }];
  patientSearchKey: any;
  voucherTypeListClone = [];
  storeId;
  isVoucherDropDownVisible = false;
  patientList$ = new Observable<any>();
  patientListInput$ = new Subject<any>();
  patientVoucherList$ = new Observable<any>();
  patientListtVoucherInput$ = new Subject<any>();
  debtorList$ = new Observable<any>();
  debtorListInput$ = new Subject<any>();
  patientList: Array<any> = [];
  voucherList = [];
  showCounterPatientSearchBox: boolean = true;
  fromDate: Date = new Date(moment().format('YYYY-MM-01'));
  toDate: Date = new Date();
  activeCounterIndex = 0;
  itemListOperation = null;
  selectedVoucherItemList = [];
  isItemGridEditingAllow = false;
  batchSetting = false;
  selctedCounterItemList = [];
  prescriptionItemListSelected = [];
  prescriptionItemList = [];
  indentItemListSelected = [];
  indentItemList = [];
  loadForm = false;
  isPrescriptionAdded = false;
  isIndentAdded = false;
  patientListSearch: any;
  saleReturnItemArray: any = [];
  saleBillItemArray = [];

  allowEditing = false;
  constructor(
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private issueService: IssueService,
    private saleReturnService: SaleReturnService,
    private modalService: NgbModal,
    private mappingService: MappingService,
    private mastersService: MastersService,
    private commonService: CommonService,
  ) {
    this.onEditorPreparing = this.onEditorPreparing.bind(this);
  }

  ngOnInit(): void {
    this.commonService.routeChanged(this.activatedRoute);
    this.voucherTypeListClone = [...this.voucherTypeList];
    this.activatedRoute.paramMap.subscribe(data => {
      const consumptionId = +data.get('id');
      const token = data.get('token');
      const loadFrom = data.get('loadFrom');
      this.loadDebtorList();
      this.loadPatientList();
      this.loadtVoucherPatientList();
      this.loadFormAndData(consumptionId);
    });
  }

  loadFormAndData(consumptionId) {
    this.storeId = this.authService.getLoginStoreId();
    this.createSaleform();
  }

  private loadPatientList(searchTxt?, accountId?) {
    this.patientList$ = concat(
      this.getPatientListBySearchKeyword(searchTxt ? searchTxt : '', accountId ? accountId : 0), // default items
      this.patientListInput$.pipe(
        distinctUntilChanged(),
        debounceTime(500),
        switchMap(term => this.getPatientListBySearchKeyword(term ? term : (searchTxt ? searchTxt : '')).pipe(
          catchError(() => of([]))
        ))
      )
    );
  }

  getPatientListBySearchKeyword(searchText, accountId?): Observable<any> {
    const param = {
      searchKeyword: searchText,
      debtorId: accountId
    };
    return this.mastersService.getPharmacyPatientBySearchKeyword(param).pipe(map((res: any) => {
      return res;
    }));
  }

  calculateReturnAmount() {
    const sum = _.sumBy(this.saleReturnItemArray, 'retAmount');
    const decimals = sum - Math.floor(sum);
    let decimalPlaces = sum.toString().split('.')[1];
    decimalPlaces = decimalPlaces ? decimalPlaces.length : 0;
    const roundAmt = decimals.toFixed(decimalPlaces)
    this.allTypeSaleForm.patchValue({
      retAmountTotal: sum,
      roundingAmt: roundAmt,
      amountNet: sum - +roundAmt,
    });
  }

  createSaleform() {
    this.selctedCounterItemList.length = 0;
    this.allTypeSaleForm = this.fb.group({
      counterType: [this.counterTypeList[0]],
      debtorId: [null],
      patientId: [null],
      startDate: [new Date(moment().format('YYYY-MM-01'))],
      endDate: [new Date(moment().format('YYYY-MM-DD'))],
      returnDate: [new Date(moment().format('YYYY-MM-DD'))],
      retAmountTotal: 0,
      roundingAmt: 0,
      amountNet: 0,
      amountClear: 0,
    });
    this.loadForm = true;
  }

  applySearch() {
    if (!this.allTypeSaleForm.value.patientId) {
      this.alertMsg = {
        message: 'Please Select Patient',
        messageType: 'danger',
        duration: Constants.ALERT_DURATION
      };
      return;
    }
    const param = {
      fromDate: this.allTypeSaleForm.value.startDate,
      toDate: this.allTypeSaleForm.value.endDate,
      accountId: this.allTypeSaleForm.value.debtorId || 0,
      patientId: this.allTypeSaleForm.value.patientId || 0,
      medicineId: 0
    }
    this.saleReturnService.getSaleBillsForReturn(param).subscribe((response) => {
      if (response && response.length > 0) {
        this.saleBillItemArray.length = 0;
        _.map(response, item => {
          item.qty = _.clone(item.returnQty);
          item.returnQty = 0;
          item.amount = item.qty * item.saleRate;
          item.retAmount = 0;
          item.tempId = Math.random();
          this.saleBillItemArray.push(item)
        })
        this.saleReturnItemArray = this.saleBillItemArray;
      } else {
        this.saleBillItemArray.length = 0;
        this.saleReturnItemArray.length = 0;
      }
    })
  }

  saveSaleData() {
    const formValue = { ...this.allTypeSaleForm.getRawValue() };
    if (!formValue.amountNet) {
      this.alertMsg = {
        message: 'Please Add Return Qty',
        messageType: 'danger',
        duration: Constants.ALERT_DURATION
      };
      return;
    }
    const saveObj = this.generateSaveObj();
    this.saleReturnService.saveSalesReturn(saveObj).subscribe(res => {
      if (res && res.status_message === 'Success') {
        this.alertMsg = {
          message: res.message,
          messageType: 'success',
          duration: Constants.ALERT_DURATION
        };
        this.allTypeSaleForm.patchValue({
          debtorId: null,
          patientId: null
        });
        this.saleBillItemArray.length = 0;
        this.saleReturnItemArray.length = 0;
        this.calculateReturnAmount();
      }
    });
  }

  generateSaveObj() {
    const formValue = { ...this.allTypeSaleForm.getRawValue() };
    const grpData = _.groupBy(this.saleReturnItemArray, 'saleBillID');
    const data = [];
    _.map(grpData, (d, i) => {
      const obj = {
        saleReturnId: 0,
        salesReturnDate: formValue.returnDate,
        accountId: formValue.accountId ? formValue.accountId : 0,
        patientId: formValue.patientId ? formValue.patientId : 0,
        amount: formValue.retAmountTotal ? formValue.retAmountTotal : 0,
        roundingAmt: formValue.roundingAmt ? formValue.roundingAmt : 0,
        amountNet: formValue.amountNet ? formValue.amountNet : 0,
        amountClear: 0,
        clearedInId: d[0].saleBillID,
        clearedInBillNo: d[0].saleBillNo,
        salesReturnDetails: []
      };
      _.map(d, itm => {
        if (+itm.returnQty > 0) {
          const dt = {
            detailSaleReturnId: 0,
            medicineId: itm.itemId,
            stockId: itm.stockId,
            batchNo: itm.batchNo,
            returnQty: itm.returnQty,
            schemeQty: itm.schemeQty,
            gstPer: itm.gstPer,
            gstAmt: itm.gstAmount,
            saleRate: itm.saleRate,
            returnRate: itm.returnRate,
            expiryDate: itm.expiry,
            reason: null,
            detailSaleId: itm.detailSaleId,
          }
          obj.salesReturnDetails.push({ ...dt });
        }
      });
      if (obj.salesReturnDetails.length > 0) {
        data.push({ ...obj });
      }
    });
    return data;
  }


  onPatientChange(evt) {
    this.saleBillItemArray.length = 0;
    this.saleReturnItemArray.length = 0;
  }

  onCounterTypeChange(type) {
    this.allTypeSaleForm.patchValue({
      debtorId: null,
      patientId: null
    });
  }

  private loadDebtorList(searchTxt?): void {
    this.debtorList$ = concat(
      this.getDebtorList(searchTxt ? searchTxt : ''),
      this.debtorListInput$.pipe(
        distinctUntilChanged(),
        debounceTime(500),
        switchMap(term => this.getDebtorList(term ? term : (searchTxt ? searchTxt : '')).pipe(
          catchError(() => of([]))
        ))
      )
    );
  }

  getDebtorList(searchKey?): Observable<any> {
    const params = {
      searchKeyword: "",
      patientId: 0,
      accountType: ""
    };
    return this.mappingService.getDebtorList(params).pipe(map((res: any) => {
      return res;
    }));
  }

  onDebtorChange(evt) {
    if (evt) {
      this.allTypeSaleForm.patchValue({
        patientId: null
      });
      this.loadPatientList("", evt.accountId)
    }
  }

  decimalWithPrecision(data: any) {
    return parseFloat(data.value || 0).toFixed(2);
  }

  private loadtVoucherPatientList(searchTxt?) {
    this.patientVoucherList$ = concat(
      this.getPatientListByType(searchTxt ? searchTxt : ''), // default items
      this.patientListtVoucherInput$.pipe(
        distinctUntilChanged(),
        debounceTime(500),
        switchMap(term => this.getPatientListByType(term ? term : (searchTxt ? searchTxt : '')).pipe(
          catchError(() => of([]))
        ))
      )
    );
  }

  getPatientListByType(searchText): Observable<any> {
    const param = {
      search_string: searchText,
      page_number: 1,
      limit: 50,
      visit_Type: '',
    };
    return this.mastersService.getPatientListByType(param).pipe(map((res: any) => {
      return res;
    }));
  }

  onEditorPreparing(evt: any): void {
    evt.editorOptions.onValueChanged = (e: any) => {
      const selectedIndex = evt.row.rowIndex;
      let rowObj = this.saleReturnItemArray[evt.row.rowIndex];
      if (evt.dataField == 'returnQty') {
        if (+e.value > +this.saleReturnItemArray[evt.row.rowIndex].qty) {
          this.saleReturnItemArray[evt.row.rowIndex].returnQty = 0;
          this.alertMsg = {
            message: 'Return Qty Should be Less Then Sale Qty',
            messageType: 'danger',
            duration: Constants.ALERT_DURATION
          };
          return;
        }
        this.saleReturnItemArray[evt.row.rowIndex].returnQty = e.value;
        this.saleReturnItemArray[evt.row.rowIndex].retAmount = this.saleReturnItemArray[evt.row.rowIndex].returnQty * this.saleReturnItemArray[evt.row.rowIndex].saleRate
        this.dataGrid.instance.refresh();
        if (this.saleReturnItemArray.length > selectedIndex + 1) {
          this.dataGrid.instance.editCell(selectedIndex + 1, 'returnQty');
        }
        this.calculateReturnAmount();
      }
    }
  }

}

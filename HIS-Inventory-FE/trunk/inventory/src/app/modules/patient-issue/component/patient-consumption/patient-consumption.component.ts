import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from 'src/app/public/services/common.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IssueService } from 'src/app/modules/issue/services/issue.service';
import { MastersService } from 'src/app/modules/masters/services/masters.service';
import { AuthService } from 'src/app/public/services/auth.service';
import { IAlert } from 'src/app/public/models/AlertMessage';
import { Observable, Subject, concat, of } from 'rxjs';
import { PermissionsConstants } from 'src/app/config/PermissionsConstants';
import { distinctUntilChanged, switchMap, catchError, debounceTime, map } from 'rxjs/operators';
import { Constants } from 'src/app/config/constants';
import { environment } from 'src/environments/environment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PatientVoucherItemListComponent } from '../patient-voucher-item-list/patient-voucher-item-list.component';
import * as _ from 'lodash';
import * as moment from 'moment';
import { ConfirmationPopupWithReasonComponent } from 'src/app/shared/confirmation-popup-with-reason/confirmation-popup-with-reason.component';
import { UsersService } from 'src/app/public/services/users.service';
import { NgxPermissionsService } from 'ngx-permissions';
import { MappingService } from 'src/app/public/services/mapping.service';

@Component({
  selector: 'app-patient-consumption',
  templateUrl: './patient-consumption.component.html',
  styleUrls: ['./patient-consumption.component.scss']
})
export class PatientConsumptionComponent implements OnInit {

  patientList$ = new Observable<any>();
  patientListInput$ = new Subject<any>();
  patientList: Array<any> = [];

  voucherList: Array<any> = [];

  patientIssueFrm: FormGroup;
  consumptionId: number;
  alertMsg: IAlert;
  itemList$ = new Observable<any>();
  itemListInput$ = new Subject<any>();
  itemStockList: Array<any> = [];
  storeId: number;
  itemList: Array<any> = [];
  constpermissionList: any = [];
  printData = null;
  isItemSubmit: boolean;
  userData: any;
  showPatientSearchBox: boolean;
  itemBatchArray = [];
  storesArray = [];
  selectedStore: any;
  isPartialLoad: boolean = false;
  loadFormPatient: boolean = null;
  storeName: string;
  constructor(
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private issueService: IssueService,
    private mastersService: MastersService,
    private authService: AuthService,
    private router: Router,
    private userService: UsersService,
    private commonService: CommonService,
    private modalService: NgbModal,
    private permissionsService: NgxPermissionsService,
    private mappingService: MappingService,
  ) { }

  ngOnInit(): void {
    this.isItemSubmit = false;
    this.userData = this.authService.getUserInfoFromLocalStorage();
    this.storeId = this.authService.getLoginStoreId();
    this.createForm();
    this.activatedRoute.paramMap.subscribe(data => {
      this.consumptionId = +data.get('id');
      const token = data.get('token');
      const loadFrom = data.get('loadFrom');
      if (token && loadFrom) {
        this.isPartialLoad = true;
        this.loadFormPatient = false;
        this.loginThroghSSO(token).then(res => {
          this.getUserStoreMappingByUserId();
        })
      } else {
        this.isPartialLoad = false;
        this.loadFormPatient = true;
        this.loadFormAndData();
      }
    });

    // form change detection
    this.patientIssueFrm.get('itemObjForm').get('qty').valueChanges.subscribe(qty => {
      const rowVal = this.patientIssueFrm.getRawValue();
      if (qty <= 0) {
        this.patientIssueFrm.get('itemObjForm').get('qty').setErrors({ isQtyLess: true });
      } else {
        this.patientIssueFrm.get('itemObjForm').get('qty').setErrors(null);
      }
    });
    this.constpermissionList = PermissionsConstants;
  }

  selectStoreData(str) {
    if (str) {
      this.authService.setStoreDetails(str);
      this.storeId = str.storeId;
      this.loadFormPatient = true;
      this.loadFormAndData();
    }
  }

  getUserStoreMappingByUserId(): void {
    this.mappingService.GetUserStoreMappingByUserId(this.authService.getLoggedInUserId()).subscribe(res => {
      if (res) {
        this.storesArray = res;
      }
      if (!this.storesArray.length) {
        this.router.navigate(['/noStore']);
      }
    });
  }

  loadFormAndData() {
    this.loadItemList();
    this.storeName = this.authService.getLoginStoreName();
    this.commonService.routeChanged(this.activatedRoute);
    if (this.consumptionId !== -1) { // update
      this.updateConsumption(this.consumptionId);
      this.showPatientSearchBox = false;
    } else { // add
      this.loadPatientList();
      this.showPatientSearchBox = true;
    }
  }

  loginThroghSSO(token) {
    const promise = new Promise((resolve, reject) => {
      this.authService.loginThroghSSO(token).subscribe(res => {
        if (res.status_message === 'Success') {
          console.log('Success', res);
          // localStorage.setItem('globals', JSON.stringify(res.data));
          const userObject = res.data;
          this.commonService.storeKeyValues = [];
          this.commonService.userListTempParams = null;
          this.commonService.getScheduleDataParams = null;
          this.userService.masterUserDetails = {};
          this.authService.redirectUrl = null;
          // store login info to local storage
          this.authService.storeLoginInfo(userObject);
          this.assignRoleAndRedirect(userObject);
          // this.router.navigate(['/app/user/userList']);
          resolve(true);
        } else if (res) {
          let loginPageUrl = environment.SSO_LOGIN_URL;
          loginPageUrl = environment.production && loginPageUrl ? loginPageUrl : window.location.origin;
          window.open(loginPageUrl, '_self');
          resolve(true);
        }
      });
    });
    return promise;
  }

  assignRoleAndRedirect(userObject): void {
    this.userService.GetAssignedRolePermissionsByUserId(userObject.id)
      .subscribe((result) => {
        const userPermission = this.userService.userPermission;
        this.permissionsService.loadPermissions(userPermission);
        // this.redirectTo();
      });
  }

  updateConsumption(consumptionId) {
    this.issueService.getPatientIssueById(consumptionId).subscribe(res => {
      if (res.status_message === 'Success') {
        const consumptionData = res.data;
        this.loadPatientList(consumptionData.patientName);
        this.patientIssueFrm.patchValue({
          consumptionId: consumptionData.consumptionId,
          consumptionNo: consumptionData.consumptionNo,
          consumptionDate: new Date(consumptionData.consumptionDate),
          storeId: this.storeId,
          totalAmount: consumptionData.totalAmount,
          discountAmount: consumptionData.discountAmount,
          discountPercent: consumptionData.discountPercent,
          netAmount: consumptionData.netTotalAmount,
          remark: consumptionData.remark,
          stockId: consumptionData.stockId,
          // patientId: consumptionData.patientId,
          selectedVoucher: consumptionData.consumptionId,
          selectedPatient: {
            patientId: consumptionData.patientId,
            patientName: consumptionData.patientName,
            visitNo: consumptionData.visitNo,
            gender: consumptionData.gender,
            age: consumptionData.age,
            bedNo: consumptionData.bedNo,
            admissionDate: consumptionData.admissionDate,
            visitType: consumptionData.visitType,
          }
        });
        this.itemList = consumptionData.itemlist;
        this.getAllVoucherList().subscribe();
        // this.patientIssueFrm.controls.patientId.disable();
      }
    });
  }

  createForm(): void {
    this.patientIssueFrm = this.fb.group({
      consumptionId: [0],
      consumptionNo: [''],
      consumptionDate: [new Date()],
      storeId: [this.storeId],
      totalAmount: [0],
      remark: [''],
      isTakePrint: [false],
      patientId: [null, Validators.required],
      selectedPatient: [null],
      selectedVoucher: [0],
      discountPercent: [0],
      discountAmount: [0],
      netAmount: [0],
      // itemDetails: [null],
      // stockDetails: [null],
      itemObjForm: this.fb.group({
        // id: [0],
        // tempHoldId: [''],
        // batchNo: [null, Validators.required],
        // expiryDate: [new Date(), Validators.required],
        // balanceQty: [0],
        // unitRate: [0],
        // stockId: [''],
        // unit: [''],
        itemId: [null, Validators.required],
        itemCode: [''],
        itemName: [''],
        qty: [null, Validators.required],
        amount: [0],
        netAmount: [0],
        discAmt: [0],
        discPer: [0],
        remark: [null],
      })
    });
    this.patientIssueFrm.get('itemObjForm').get('amount').disable();
    this.patientIssueFrm.get('itemObjForm').get('netAmount').disable();
    this.patientIssueFrm.get('netAmount').disable();
    this.patientIssueFrm.get('totalAmount').disable();
  }

  getItemListObjControls(): FormGroup {
    return this.patientIssueFrm.get('itemObjForm') as FormGroup;
  }

  private loadItemList(searchTxt?): void {
    this.itemList$ = concat(
      this.mastersService.getItemBySearchKeyword(searchTxt ? searchTxt : ''), // default items
      this.itemListInput$.pipe(
        distinctUntilChanged(),
        // tap(() => this.formLoading = true),
        switchMap(term => this.mastersService.getItemBySearchKeyword(term ? term : (searchTxt ? searchTxt : '')).pipe(
          catchError(() => of([])), // empty list on error
          // tap(() => this.formLoading = false)
        ))
      )
    );
  }

  saveStoreConsumption(): void {
    const formValue = this.patientIssueFrm.getRawValue();
    delete formValue.itemObjForm;
    formValue.itemList = this.itemList;
    if (this.itemList.length === 0) {
      this.alertMsg = {
        message: 'Please Add Item',
        messageType: 'warning',
        duration: Constants.ALERT_DURATION
      };
      return;
    }
    formValue.visitType = formValue.selectedPatient.visitType;
    formValue.visitNo = formValue.selectedPatient.visitNo;
    formValue.patientId = formValue.selectedPatient.patientId;
    formValue.netTotalAmount = formValue.netAmount;
    this.issueService.savePatientIssue(formValue).subscribe(res => {
      if (res.status_message === 'Success') {
        this.alertMsg = {
          message: res.message,
          messageType: 'success',
          duration: Constants.ALERT_DURATION
        };
        if (this.patientIssueFrm.value.isTakePrint) {
          this.consumptionId = (this.consumptionId == -1 || !this.consumptionId) ? res.data : this.consumptionId;
          this.getPrintData(this.consumptionId);
        } else {
          this.navigateToSummery();
        }
      }
    });
  }

  navigateToSummery(): void {
    this.router.navigate(['/inventory/issue/patient/consumptionSummary']);
  }

  onPatientChange(event): void {
    if (event) {
      this.patientIssueFrm.patchValue({ patientId: null });
      this.patientIssueFrm.patchValue({ selectedPatient: event });
      this.showPatientSearchBox = false;
      this.getAllVoucherList().subscribe();
    } else {
      this.patientIssueFrm.patchValue({ patientId: null });
      this.patientIssueFrm.patchValue({ selectedPatient: null });
      this.showPatientSearchBox = true;
    }
  }

  onItemChange(event): void {
    this.itemStockList.length = 0;
    if (!event) {
      this.clearItemForm();
      this.itemBatchArray.length = 0;
      return;
    }
    this.patientIssueFrm.get('itemObjForm').patchValue({
      itemId: event.itemId,
      itemCode: event.itemCode,
      itemName: event.itemDescription,
      unit: event.unitName
    });
    this.patientIssueFrm.get('itemObjForm').patchValue({
      qty: null,
      amount: null,
      discAmt: 0,
      discPer: 0,
      remark: null,
      netAmount: 0
    });
    this.itemBatchArray.length = 0;
    const reqParams = {
      storeId: this.storeId,
      itemId: event.itemId
    };
    this.issueService.getItemStockById(reqParams).subscribe(res => {
      if (res && res.length) {
        this.itemStockList = res;
      } else {
        this.alertMsg = {
          message: 'No Stock Found',
          messageType: 'danger',
          duration: Constants.ALERT_DURATION
        };
      }
    });
  }

  // -- called when click on add button
  onAddItem(): void {
    this.isItemSubmit = true;
    if (this.itemBatchArray.length == 0) {
      // this.isItemSubmit = false;
      this.alertMsg = {
        message: 'Please Add Items',
        messageType: 'danger',
        duration: Constants.ALERT_DURATION
      };
      return;
    }
    const holdQtyArray = [];
    _.map(this.itemBatchArray, stk => {
      const obj = {
        amount: stk.amount,
        batchNo: stk.batchNo,
        expiryDate: stk.expiryDate,
        id: stk.id,
        itemCode: stk.itemCode,
        itemId: stk.itemId,
        itemName: stk.itemName,
        qty: stk.qty,
        remark: stk.remark,
        stockId: stk.stockId,
        tempHoldId: stk.tempHoldId,
        unitRate: stk.unitRate,
        discountPercent: stk.discPer,
        discountAmount: stk.discAmt,
        netAmount: stk.netAmount,
      };
      this.itemList.push(obj);
      const reqParams = {
        tempHoldId: stk.tempHoldId,
        storeId: this.storeId,
        stockId: stk.stockId,
        itemId: stk.itemId,
        holdQty: stk.qty
      };
      holdQtyArray.push(_.cloneDeep(reqParams));
    });
    this.clearItemForm();
    this.itemBatchArray.length = 0;
    this.totolAmtCal();
    this.itemStockHoldList(holdQtyArray);
    this.isItemSubmit = false;
  }

  clearItemForm(from?) {
    this.patientIssueFrm.get('itemObjForm').patchValue({
      itemId: null,
      itemCode: null,
      itemName: null,
      qty: null,
      amount: 0,
      netAmount: 0,
      discAmt: 0,
      discPer: 0,
      remark: null
    });
    if (from) {
      this.itemBatchArray.length = 0;
    }
  }

  onDeleteItem(indx): void {
    this.calculateDiscountForAllItem();
    this.itemStockRelease(this.itemList[indx]);
    this.itemList.splice(indx, 1);
  }

  totolAmtCal(): void {
    let amt = 0;
    this.itemList.forEach(res => {
      amt += res.amount;
    });
    this.patientIssueFrm.patchValue({
      totalAmount: amt,
    });
    this.calculateDiscountForAllItem();
  }

  itemStockHoldList(data): void {
    this.issueService.itemStockHoldList(data).subscribe();
  }

  itemStockRelease(data): void {
    const reqParams = [data.tempHoldId];
    this.issueService.itemStockRelease(reqParams).subscribe();
  }

  getPrintData(id?) {
    const idVal = id || this.patientIssueFrm.value.consumptionId;
    const url = environment.REPORT_API + 'Report/PatientConsumptionPrint/?auth_token=' + this.authService.getAuthToken() + '&consumptionId=' + idVal;
    this.printData = { url: url, returnType: id ? true : false };
  }

  private loadPatientList(searchTxt?): void {
    this.patientList$ = concat(
      this.mastersService.getQuickPatientList(searchTxt ? searchTxt : ''), // default items
      this.patientListInput$.pipe(
        distinctUntilChanged(),
        debounceTime(500),
        switchMap(term => this.mastersService.getQuickPatientList(term ? term : (searchTxt ? searchTxt : '')).pipe(
          catchError(() => of([]))
        ))
      )
    );
  }

  getAllVauchers() {
    const param = this.patientIssueFrm.getRawValue().selectedPatient;
    param.patientId = this.patientIssueFrm.getRawValue().patientId;
    const modalInstance = this.modalService.open(PatientVoucherItemListComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false,
        size: 'xl',
        container: '#homeComponent'
      });
    modalInstance.result.then((result) => {
      if (result === 'yes') {
        return;
      } else {
        return;
      }
    });
    modalInstance.componentInstance.patientData = param;
  }

  getAllVoucherList(): Observable<any> {
    const param = {
      storeId: this.storeId,
      visitType: this.patientIssueFrm.value.selectedPatient.visitType,
      patientId: this.patientIssueFrm.value.selectedPatient.patientId,
      visitNo: this.patientIssueFrm.value.selectedPatient.visitNo
    };
    return this.issueService.getVoucherData(param).pipe(map(res => {
      this.voucherList = [];
      this.voucherList.push({
        consumptionId: 0,
        consumptionNo: 'Add New',
        customName: 'Add New',
        consumptionDate: null,
        totalAmount: null,
        netTotalAmount: null
      })
      if (res.length > 0) {
        _.map(res, d => {
          d.customName = d.consumptionNo + ' - ' + moment(d.consumptionDate).format('DD/MM/YYYY')
        })
        this.voucherList = this.voucherList.concat(res);
      }
      return this.voucherList;
    }));
  }

  getSelectedVoucher(event) {
    if (event && event.consumptionId !== 0) {
      this.patientIssueFrm.patchValue({ selectedVoucher: event.consumptionId });
      this.updateConsumption(event.consumptionId);
    } else {
      this.patientIssueFrm.patchValue({ selectedVoucher: 0 });
      this.patientIssueFrm.patchValue({ consumptionId: null });
      this.patientIssueFrm.patchValue({ consumptionNo: null });
      this.patientIssueFrm.patchValue({ consumptionDate: new Date() });
      this.patientIssueFrm.patchValue({ totalAmount: 0 });
      this.patientIssueFrm.patchValue({ netAmount: 0 });
      this.patientIssueFrm.patchValue({ discountAmount: 0 });
      this.patientIssueFrm.patchValue({ discountPercent: 0 });
      this.patientIssueFrm.patchValue({ remark: null });
      this.clearItemForm();
      this.itemList.length = 0;
      this.itemBatchArray.length = 0;
    }
  }

  enablePatientSearch(value) {
    if (value === false && !this.patientIssueFrm.value.selectedPatient) {
      return;
    }
    this.showPatientSearchBox = value;
  }

  updateItemBatchValue() {
    this.itemBatchArray = []
    const data = this.patientIssueFrm.getRawValue().itemObjForm;
    const ttlAvlQty = _.sumBy(this.itemStockList, 'closingQty');
    if (data.qty > 0) {
      if (ttlAvlQty >= data.qty) {
        let currentQty = _.cloneDeep(data.qty);
        _.map(this.itemStockList, stkData => {
          if (currentQty === 0) {
            return;
          }
          const stk = _.cloneDeep(stkData);
          if (stkData.closingQty >= currentQty) {
            stk.tempHoldId = new Date().getTime();
            stk.qty = currentQty;
            stk.amount = +((stk.qty * stk.unitRate).toFixed(2));
            stk.discPer = data.discPer;
            stk.discAmt = ((stk.amount * data.discPer) / 100).toFixed(2);
            stk.netAmount = ((+stk.amount - +stk.discAmt)).toFixed(2);
            stk.remark = data.remark;
            stk.itemId = data.itemId;
            stk.itemName = data.itemName;
            stk.itemCode = data.itemCode;
            stk.id = 0;
            currentQty = 0;
            this.itemBatchArray.push(_.cloneDeep(stk));
          } else if (stkData.closingQty > 0 && stkData.closingQty <= currentQty) {
            stk.tempHoldId = new Date().getTime();
            stk.qty = stkData.closingQty;
            stk.amount = +((stk.qty * stk.unitRate).toFixed(2));
            stk.discPer = data.discPer;
            stk.discAmt = ((stk.amount * data.discPer) / 100).toFixed(2);
            stk.netAmount = ((+stk.amount - +stk.discAmt)).toFixed(2);
            stk.remark = data.remark;
            stk.itemId = data.itemId;
            stk.itemName = data.itemName;
            stk.itemCode = data.itemCode;
            stk.id = 0;
            currentQty = +currentQty - stk.qty;
            this.itemBatchArray.push(_.cloneDeep(stk));
          }
        });
      } else {
        this.patientIssueFrm.get('itemObjForm').patchValue({
          qty: ttlAvlQty
        });
        this.alertMsg = {
          message: 'Only ' + ttlAvlQty + ' unit is available',
          messageType: 'warning',
          duration: Constants.ALERT_DURATION
        };
        this.updateItemBatchValue();
      }
    }

    this.patientIssueFrm.get('itemObjForm').patchValue({
      amount: (_.sumBy(this.itemBatchArray, 'amount')).toFixed(2),
      netAmount: (_.sumBy(this.itemBatchArray, d => { return _.toNumber(d.netAmount); })).toFixed(2),
    });
  }

  updateItemBatchValueDiscount(type) {
    const data = this.patientIssueFrm.getRawValue().itemObjForm;
    if (type === 'amt' && data.discAmt > 0) {
      const discPerMain = ((+data.discAmt * 100) / +data.amount);
      _.map(this.itemBatchArray, stk => {
        stk.discPer = discPerMain;
        stk.discAmt = ((stk.amount * stk.discPer) / 100).toFixed(2);
        stk.netAmount = (+stk.amount - +stk.discAmt).toFixed(2);
      });
      this.patientIssueFrm.get('itemObjForm').patchValue({
        amount: (_.sumBy(this.itemBatchArray, 'amount')).toFixed(2),
        netAmount: (_.sumBy(this.itemBatchArray, d => { return _.toNumber(d.netAmount); })).toFixed(2),
        discPer: discPerMain
      });
    } else {
      const discAmtMain = (+data.amount * +data.discPer / 100).toFixed(4);
      _.map(this.itemBatchArray, stk => {
        stk.discPer = data.discPer;
        stk.discAmt = ((stk.amount * data.discPer) / 100).toFixed(2);
        stk.netAmount = (+stk.amount - +stk.discAmt).toFixed(2);
      });
      this.patientIssueFrm.get('itemObjForm').patchValue({
        amount: (_.sumBy(this.itemBatchArray, 'amount')).toFixed(2),
        netAmount: (_.sumBy(this.itemBatchArray, d => { return _.toNumber(d.netAmount); })).toFixed(2),
        discAmt: discAmtMain
      });
    }
  }

  updateItemBatchValueRemark() {
    const data = this.patientIssueFrm.getRawValue().itemObjForm;
    if (data.remark) {
      _.map(this.itemBatchArray, stk => {
        stk.remark = data.remark;
      });
    }
  }

  calculateDiscountForAllItem() {
    const data = this.patientIssueFrm.getRawValue();
    const ttlVal = (_.sumBy(this.itemList, d => { return _.toNumber(d.netAmount); })).toFixed(2);
    this.patientIssueFrm.patchValue({
      totalAmount: ttlVal ? ttlVal : 0,
      netAmount: (+ttlVal - +data.discountAmount).toFixed(2)
    });
  }

  updateVoucherDiscount(type) {
    const data = this.patientIssueFrm.getRawValue();
    if (type === 'amt' && data.discountAmount > 0) {
      const discPerMain = ((+data.discountAmount * 100) / +data.totalAmount);
      this.patientIssueFrm.patchValue({
        discountPercent: discPerMain
      });
      this.calculateDiscountForAllItem();
    } else if (data.discountPercent > 0) {
      const discAmtMain = (+data.totalAmount * +data.discountPercent / 100).toFixed(2)
      this.patientIssueFrm.patchValue({
        discountAmount: discAmtMain
      });
      this.calculateDiscountForAllItem();
    }
  }

  openRemarkPopup() {
    const data = this.patientIssueFrm.getRawValue().itemObjForm;
    const modalTitleobj = data.remark ? 'Update Remark' : 'Add Remark';
    const modalBodyobj = null;
    const messageDetails = {
      modalTitle: modalTitleobj,
      modalBody: modalBodyobj,
      buttonType: 'yes_no',
      reasonText: data.remark
    };
    const modalInstance = this.modalService.open(ConfirmationPopupWithReasonComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false
      });
    modalInstance.result.then((result) => {
      if (result.status === 'yes') {
        this.patientIssueFrm.get('itemObjForm').patchValue({
          remark: result.reason
        });
        this.updateItemBatchValueRemark();
      }
    });
    modalInstance.componentInstance.messageDetails = messageDetails;
  }

}

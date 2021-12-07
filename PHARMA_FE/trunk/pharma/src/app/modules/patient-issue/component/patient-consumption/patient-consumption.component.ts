import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
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
import { DxDataGridComponent } from 'devextreme-angular';
import CustomStore from 'devextreme/data/custom_store';
import { BatchListComponent } from '../batch-list/batch-list.component';
import { NgSelectComponent } from '@ng-select/ng-select';

@Component({
  selector: 'app-patient-consumption',
  templateUrl: './patient-consumption.component.html',
  styleUrls: ['./patient-consumption.component.scss']
})
export class PatientConsumptionComponent implements OnInit {
  @ViewChild('patientSelection') select: NgSelectComponent;
  itemListEmpty = false;
  patientList$ = new Observable<any>();
  patientListInput$ = new Subject<any>();
  patientList: Array<any> = [];

  voucherList: Array<any> = [];

  patientIssueFrm: FormGroup;
  consumptionId: number;
  alertMsg: IAlert;
  storeId: number;
  itemList: Array<any> = [];
  constpermissionList: any = [];
  printData = null;
  isItemSubmit: boolean;
  userData: any;
  showPatientSearchBox: boolean;
  storesArray = [];
  selectedStore: any;
  isPartialLoad: boolean = false;
  loadFormPatient: boolean = false;
  storeName: string;
  selectedVoucherItemList = [];

  isBatchSelectSettingApply = true;
  isVoucherDropDownVisible = false;

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
        consumptionData.itemlist.map(d => {
          d.item = {
            issueUnitId: null,
            issueUnitName: null,
            itemCode: d.itemCode,
            itemName: d.itemName,
            itemId: d.itemId,
            unitId: null,
            unitName: null,
          };
          d.tempId = Math.random();
        })
        this.selectedVoucherItemList = [...consumptionData.itemlist];
        setTimeout(() => {
          this.selectedVoucherItemList = [];
        }, 1000);
        // this.source.localdata = this.itemList;
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
    });
    this.patientIssueFrm.get('netAmount').disable();
    this.patientIssueFrm.get('totalAmount').disable();
    setTimeout(() => {
      this.select ? this.select.focus() : '';
    }, 500);
  }

  saveStoreConsumption(): void {
    const formValue = this.patientIssueFrm.getRawValue();
    formValue.itemList = this.itemList.filter(d => {
      return d.itemId;
    });
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
    this.itemListEmpty = true;
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
    // param.patientId = this.patientIssueFrm.getRawValue().patientId;
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
      // this.voucherList.push({
      //   consumptionId: 0,
      //   consumptionNo: 'Add New',
      //   customName: 'Add New',
      //   consumptionDate: null,
      //   totalAmount: null,
      //   netTotalAmount: null
      // })
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
      this.patientIssueFrm.patchValue({ consumptionId: 0 });
      this.patientIssueFrm.patchValue({ consumptionNo: null });
      this.patientIssueFrm.patchValue({ consumptionDate: new Date() });
      this.patientIssueFrm.patchValue({ totalAmount: 0 });
      this.patientIssueFrm.patchValue({ netAmount: 0 });
      this.patientIssueFrm.patchValue({ discountAmount: 0 });
      this.patientIssueFrm.patchValue({ discountPercent: 0 });
      this.patientIssueFrm.patchValue({ remark: null });
      this.itemList.length = 0;
      this.itemListEmpty = true;
      setTimeout(() => {
        this.itemListEmpty = false;
      }, 1000);
    }
  }

  enablePatientSearch(value) {
    if (value === false && !this.patientIssueFrm.value.selectedPatient) {
      return;
    }
    this.showPatientSearchBox = value;
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
    if (type === 'amt') {
      const discPerMain = ((+data.discountAmount * 100) / +data.totalAmount).toFixed(2);
      this.patientIssueFrm.patchValue({
        discountPercent: discPerMain
      });
      this.calculateDiscountForAllItem();
    } else if (type !== 'amt') {
      const discAmtMain = (+data.totalAmount * +data.discountPercent / 100).toFixed(2)
      this.patientIssueFrm.patchValue({
        discountAmount: discAmtMain
      });
      this.calculateDiscountForAllItem();
    }
  }

  getUpdatedItemList(list) {
    this.itemList = [...list];
    this.calculateDiscountForAllItem();
  }

}

import { VisitType } from './../../../../public/models/visit-type.model';
import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DxDataGridComponent } from 'devextreme-angular';
import { IAlert } from 'src/app/public/models/AlertMessage';
import * as _ from 'lodash';
import CustomStore from "devextreme/data/custom_store";
import { Constants } from 'src/app/config/constants';
import { BillingService } from '../../services/billing.service';
import { NgbModal, NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'src/app/public/services/auth.service';
import { concat, forkJoin, Observable, of, Subject, Subscriber } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxPermissionsService } from 'ngx-permissions';
import { CommonService } from 'src/app/public/services/common.service';
import { PermissionsConstants } from 'src/app/config/PermissionsConstants';
import { catchError, debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import * as moment from 'moment';
import { BillServiceModel } from '../../modals/bill-service-model';
import { DoctorModel } from '../../modals/doctor-model';
import { ServiceSurchargeModel } from '../../modals/service-surcharge-model';
import { AttachComponentServiceComponent } from '../attach-component-service/attach-component-service.component';
import { BillPaymentComponent } from '../bill-payment/bill-payment.component';
import { PatientAdvancePaymentComponent } from '../patient-advance-payment/patient-advance-payment.component';
import { HmisSettingModel } from '../../modals/hmis-setting-model';
import { NonServiceBillHeadModel } from '../../modals/nonservice-billhead-model';
import { PatientInsuranceUtilizationComponent } from '../patient-insurance-utilization/patient-insurance-utilization.component';
import { PackageDetailModel } from '../../modals/package-detail-model';
import { ConfirmationPopupComponent } from 'src/app/shared/confirmation-popup/confirmation-popup.component';
import { analyzeAndValidateNgModules } from '@angular/compiler';
import { BillSaveApiModel } from '../../modals/bill-save-api-model';
import { UsersService } from 'src/app/public/services/users.service';
import { environment } from 'src/environments/environment';
import { Service } from '../../../../public/models/service.model';
import { ConfirmationPopupWithInputComponent } from 'src/app/shared/confirmation-popup-with-input/confirmation-popup-with-input.component';
import { ServiceModel } from '../../modals/service-master-model';
import { ServiceComponentItemModel } from '../../modals/service-component-item-model';
import { PatientBillConcessionComponent } from '../patient-bill-concession/patient-bill-concession.component';
import { BillConcessionModel } from '../../modals/bill-concession-model';
import { PatientInsuranceDetailComponent } from '../patient-insurance-detail/patient-insurance-detail.component';
import { ServiceCenterModel } from '../../modals/service-center-model';

@Component({
  selector: 'app-patient-bill',
  templateUrl: './patient-bill.component.html',
  styleUrls: ['./patient-bill.component.scss']
})
export class PatientBillComponent implements OnInit {
  @ViewChild(DxDataGridComponent, { static: false }) public dataGrid: DxDataGridComponent;
  @ViewChild('addSectionPopover', { static: false }) public ngbAddSectionPopover: NgbPopover;
  ngbAddSectionPopoverIsOpen: boolean = false;
  alertMsg: IAlert;

  billingForm: FormGroup;
  billingFormClone: any;
  serviceMasterDataSource: any;
  doctorDataSource: any;
  serviceCenterDataSource: any;
  statusMasterDataSource: any;

  focusedRowData: any;
  focusedRowIndex: any;
  lastKeyEventCode: any;
  isPopupVisible: boolean = false;
  editorOptions: object;

  hmisSettingArray: Array<HmisSettingModel> = [];
  billNonServiceHeadArray: Array<NonServiceBillHeadModel> = [];
  billServiceArray: Array<BillServiceModel> = [];
  cloneBillServiceArray: Array<BillServiceModel> = [];
  cloneBillServiceArrayBeforeClassChange: Array<BillServiceModel> = [];

  doctorListArray: Array<DoctorModel> = [];
  serviceSurchargeTypeArray: Array<ServiceSurchargeModel> = [];
  statusArray: Array<any> = [{
    status: 'PENDING',
    value: 'PENDING',
    text: 'PENDING'
  }, {
    status: 'PROCESSED',
    value: 'PROCESSED',
    text: 'PROCESSED',
  }, {
    status: 'REVERSE',
    value: 'REVERSE',
    text: 'REVERSE'
  }, {
    status: 'CANCEL',
    value: 'CANCEL',
    text: 'CANCEL'
  }];
  surchargeArray: Array<any> = [{
    surchargeTypeId: 0,
    surchargeType: 'ROUTINE'
  }, {
    surchargeTypeId: 1,
    surchargeType: 'HAPPYHOURS'
  }, {
    surchargeTypeId: 2,
    surchargeType: 'EMERGENCYCHARGES'
  }];

  //billId: number;
  patientList$ = new Observable<any>();
  patientListInput$ = new Subject<any>();
  patientList: Array<any> = [];
  voucherList: Array<any> = [];

  activeChargingTypeId: any;
  chargingTypeList: Array<any> = [];
  activeCategoryTypeId: any;
  categoryTypeList: Array<any> = [];
  existingPayment: Array<any> = [];
  billPackageArray: Array<PackageDetailModel> = [];

  allowSpotBill: boolean = false;
  isModifyServiceCenter: boolean = false;
  isServiceAdminCharge: boolean = false;
  isBillAdminCharge: boolean = false;
  serviceAdminChargeBeforeCons: boolean = false;
  billAdminChargeBeforeCons: boolean = false;
  billAdminChargePercent: number;
  isEditBillAfterFinal: boolean;
  isEditBillAfterSettle: boolean;

  billPaymentReqParam: any;
  constpermissionList: any = [];
  printData = null;
  userData: any;
  showPatientSearchBox: boolean;
  isPartialLoad: boolean = false;
  loadFormPatient: boolean = null;
  headerFilterServiceData: any;
  isDiscountApproval = false;

  serviceMasterCache: any = [];
  statusFilterValues: Array<any> = ['REVERSE'];
  statusfilterType: string = 'exclude';
  assignedServiceCenter: any = [];
  restrictServiceCenter: boolean = false;

  isPatientClassChangePage: boolean = false;
  isPatientClassChange: boolean = false;
  isPatientClassChangeFinal: boolean = false;
  originalSetteledAmt: any;
  originalFinalBillAmt: number;
  verifiedServices: number = 0;
  appKey: string = 'billing';
  insuranceDetailArray: any[];

  isViewOnlyBillMode: boolean = true;

  constructor(private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private billingService: BillingService,
    private modalService: NgbModal,
    private authService: AuthService,
    private userService: UsersService,
    private commonService: CommonService,
    private permissionsService: NgxPermissionsService,
    private ngbModal: NgbModal,
    private router: Router
  ) {
    this.editorOptions = {
      itemTemplate: "serviceTemplate"
    }
    this.onEditingStart = this.onEditingStart.bind(this);
    this.onEditorPreparing = this.onEditorPreparing.bind(this);
    this.getServiceMasterDataSource = this.getServiceMasterDataSource.bind(this);
    this.getDoctorDataSource = this.getDoctorDataSource.bind(this);
    this.getServiceCenterDataSource = this.getServiceCenterDataSource.bind(this);
    this.getStatusMasterDataSource = this.getStatusMasterDataSource.bind(this);

    this.isAddIconVisible = this.isAddIconVisible.bind(this);
    this.isDeleteIconVisible = this.isDeleteIconVisible.bind(this);
    this.onAddButtonClick = this.onAddButtonClick.bind(this);

    // register data source
    this.getServiceMasterDataSource();
    this.getDoctorDataSource();
    this.getServiceCenterDataSource();
  }

  ngOnInit(): void {
    this.userData = this.authService.getUserInfoFromLocalStorage();
    this.resetBillForm();
    if (this.router.url.includes('changepatientclass')) {
      this.isPatientClassChangePage = true;
    }
    this.activatedRoute.paramMap.subscribe(data => {
      //this.billId = +data.get('id');
      const token = data.get('token');
      this.appKey = data.get('appKey');
      const uhid = data.get('uhid');
      const penId = data.get('penId');
      const billMainId = data.get('billMainId');
      const loadFrom = data.get('loadFrom');
      if (token) {
        this.isPartialLoad = true;
        this.loadFormPatient = false;
        this.checkAndCreateUserSession(token).then(res => {
          this.loadFormAndData(uhid, penId, billMainId);
        })
      } else {
        this.isPartialLoad = false;
        this.loadFormPatient = true;
        this.loadFormAndData();
      }
    });

    // form change detection - write off input disable
    // this.billingForm.get('isWriteOff').valueChanges.subscribe(isWriteOff => {
    //   if (isWriteOff) {
    //     this.billingForm.get('writeOffAmount').enable();
    //   } else {
    //     this.billingForm.get('writeOffAmount').disable();
    //   }
    // });

    this.constpermissionList = PermissionsConstants;
  }

  checkAndCreateUserSession(token) {
    const promise = new Promise((resolve, reject) => {
      const oldToken = this.authService.getAuthToken();
      if (!oldToken || oldToken != token) {
        this.loginThroghSSO(token).then(res => {
          resolve(true);
        });
      }
      else {
        const userId = this.authService.getLoggedInUserId()
        this.assignRoleAndRedirect(userId).subscribe(res => {
          resolve(true);
        });
      }
    });
    return promise;
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
          this.assignRoleAndRedirect(userObject.id).subscribe(res => {
            resolve(true);
          });
        } else if (res) {
          this.router.navigate(['/error']);
          // let loginPageUrl = environment.SSO_LOGIN_URL;
          // loginPageUrl = environment.production && loginPageUrl ? loginPageUrl : window.location.origin;
          // window.open(loginPageUrl, '_self');
          resolve(true);
        }
      });
    });
    return promise;
  }

  assignRoleAndRedirect(userId): Observable<any> {
    const userPermission = this.userService.userPermission;
    if (userPermission && userPermission.length > 0) {
      return of(userPermission);
    }
    const appId = this.authService.getAppIdByAppKey('billing');
    return this.userService.GetAssignedRolePermissionsByUserId(userId, appId)
      .pipe(map(res => {
        const userPermission = this.userService.userPermission;
        this.permissionsService.loadPermissions(userPermission);
        // this.redirectTo();
      }));
  }

  private get newRowIndex() {
    return 0; // this.billServiceArray.length - 1;
  }

  resetBillForm(): void {
    this.billingForm = this.fb.group({
      billId: [0],
      billNo: [''],
      billDate: [new Date()],
      billDatetime: [moment().format('DD/MM/YYYY hh:mm A')],
      patientId: [null, Validators.required],
      selectedPatient: [null],
      billTypeStatus: [null],
      grossAmount: [null],
      billAmount: [null],
      //totalAmount: [0],
      categoryConcAmt: [null],
      categoryConcPer: [null],
      billAuthority: [null],
      discountType: ['percent'],
      discountPercent: [0],
      discountAmount: [0],
      adminChargeAppBillAmount: [0],
      adminChargesPer: [null],
      adminChargesAmt: [null],
      netAmount: [0],
      isGstApplicable: [false],
      gstType: ['percent'],
      gstPercent: [null],
      gstAmount: [null],
      finalNetAmount: [0],
      creditApprovedAmount: [0],
      creditApprovedBalance: [0],
      insuranceAmount: [0],
      billAdvanceAdjustmentAmt: [0],
      advanceAdjustmentAmt: [0],
      settledAmount: [0],
      refundedAmount: [0],
      //balanceAmount: [0],
      isWriteOff: [false],
      writeOffAmount: [0],
      netPayableAmount: [0],
      status: ['PENDING'],
      paymentStatus: [''],
      tpaStatus: [''],
      remark: [''],
      isSpotBill: [false],
      isTakePrint: [false],
      showPayDetail: [false],
      isSavedBillFinal: [false],
      isFinal: [false],
      isDischargeApprove: [false],
      isVoucherDropDownVisible: [false],

      billConcessionArray: [],
      advancePaymentRowData: [],
      advPaymentSettlement: [],
      utilizeAdvanceAmount: [],
      utilizeInsuranceAmount: []
    });
    this.voucherList = [];
    this.insuranceDetailArray = [];
    this.billServiceArray = [];
    // this.billingForm.get('itemObjForm').get('amount').disable();
    // this.billingForm.get('itemObjForm').get('netAmount').disable();
    //this.billingForm.get('netAmount').disable();
    //this.billingForm.get('totalAmount').disable();
  }

  loadFormAndData(uhid?, penId?, billMainId?) {
    // check user has permission of Edit Final bill and Settled bill
    this.isEditBillAfterFinal = _.isUndefined(this.permissionsService.getPermission(PermissionsConstants.EditBillAfterFinal_PatientBill)) ? false : true;
    this.isEditBillAfterSettle = _.isUndefined(this.permissionsService.getPermission(PermissionsConstants.EditBillAfterSettle_PatientBill)) ? false : true;

    // load all setting and doctor list at once
    this.getSettingDetails().subscribe();
    this.getAssignedServiceCenter().subscribe();
    // this.getNonServiceBillingHeadList().subscribe();
    this.getDoctorsList().subscribe();
    this.loadPatientList();

    this.commonService.routeChanged(this.activatedRoute);
    if (uhid && uhid != '0' && uhid != '') { // update
      this.showPatientSearchBox = false;
      const patientObj = { uhid: uhid, penId: penId };
      this.onPatientChange(patientObj, billMainId);
    } else {
      this.showPatientSearchBox = true;
    }
  }

  getSettingDetails(): Observable<any> {
    return this.billingService.getSettingDetails().pipe(map(res => {
      this.hmisSettingArray = res;

      // is service admin charges application
      this.isServiceAdminCharge = (_.find(this.hmisSettingArray, (o) => {
        return o.tagName == 'BILLING' && o.question == 'ADMINCHARGES_ON_SERVICE_LEVEL'
      })?.tagValue == 'Y') || false;

      // service admin charge before concession
      this.serviceAdminChargeBeforeCons = (_.find(this.hmisSettingArray, (o) => {
        return o.tagName == 'BILLING' && o.question == 'SERVICE_ADMINCHARGE_BEFORE_CONCESSION'
      })?.tagValue == 'Y') || false;

      // is bill admin charges application
      this.isBillAdminCharge = (_.find(this.hmisSettingArray, (o) => {
        return o.tagName == 'BILLING' && o.question == 'ADMINCHARGE_APPLICABLE'
      })?.tagValue == 'Y') || false;

      // bill admin charge before concession ...
      this.billAdminChargeBeforeCons = (_.find(this.hmisSettingArray, (o) => {
        return o.tagName == 'BILLING' && o.question == 'ADMINCHARGE_BEFORE_CONCESSION'
      })?.tagValue == 'Y') || false;

      // bill admin charge percent ...
      const billAdminChargePercent = _.find(this.hmisSettingArray, (o) => {
        return o.tagName == 'BILLING' && o.question == 'ADMINCHARGE_PERCENTAGE'
      })?.tagValue || 0;

      this.billAdminChargePercent = this.isBillAdminCharge ? +billAdminChargePercent : 0;

      this.isModifyServiceCenter = (_.find(this.hmisSettingArray, (o) => {
        return o.tagName == 'BILLING' && o.question == 'IS_CHANGE_SERVICE_CENTER'
      })?.tagValue == 'Y') || false;

      this.restrictServiceCenter = (_.find(this.hmisSettingArray, (o) => {
        return o.tagName == 'BILLING' && o.question == 'USER_RESTRICT_SERVICE_CENTER'
      })?.tagValue == 'Y') || false;

      return res;
    }));
  }

  getAssignedServiceCenter(): Observable<any> {
    const userId = this.authService.getLoggedInUserId();
    return this.commonService.getAssignedServiceCenter(userId).pipe(map(res => {
      this.assignedServiceCenter = res;
      return res;
    }));
  }

  getPatientPayDetails(): Observable<any> {
    let param = {
      uhId: this.billingForm.value.selectedPatient.uhid,
      penId: this.billingForm.value.selectedPatient.penId,
      PpmId: 0, //this.billingForm.value.billId,
      flag: 0, // 0 for get payment detail by uhid only
      pbmId: 0, //this.billingForm.value.billId
    };
    return this.billingService.GetPatientPayDetails(param).pipe(map(res => {
      this.existingPayment = res;
      return this.existingPayment;
    }));
  }

  getNonServiceBillingHeadList(): Observable<any> {
    return this.billingService.getNonServiceBillingHeadList().pipe(map(res => {
      this.billNonServiceHeadArray = res;
      return this.billNonServiceHeadArray;
    }));
  }

  getDoctorsList(): Observable<any> {
    return this.billingService.getDoctorsList().pipe(map(res => {
      this.doctorListArray = res;
      return res;
    }));
  }

  private loadPatientList(searchTxt?): void {
    this.patientList$ = concat(
      this.billingService.getQuickPatientList(searchTxt ? searchTxt : ''), // default items
      this.patientListInput$.pipe(
        distinctUntilChanged(),
        debounceTime(500),
        switchMap(term => this.billingService.getQuickPatientList(term ? term : (searchTxt ? searchTxt : '')).pipe(
          catchError(() => of([]))
        ))
      )
    );
  }

  onPatientChange(event, billMainId?): void {
    if (event) {
      this.billingForm.patchValue({ patientId: event.uhid });
      this.billingForm.patchValue({ selectedPatient: event });
      this.billingForm.patchValue({ selectedPatientData: event });
      this.showPatientSearchBox = false;
      this.getDoctorNameForPatient(event.uhid, event.penId).subscribe(res => {
        if (res) {
          const visitType = this.billingForm.value?.selectedPatient.penType;
          this.activeChargingTypeId = this.billingForm.value?.selectedPatient?.activeChargingTypeId;
          this.activeCategoryTypeId = this.billingForm.value?.selectedPatient?.penCategoryId;
          this.getChargingTypeList(visitType).subscribe();
          this.getAllVoucherList(billMainId).subscribe();
          this.getCategoryTypeList(this.activeChargingTypeId, visitType).subscribe();
        }
        else {
          this.showPatientSearchBox = true;
          this.resetBillForm();
        }
      });
    } else {
      // this.billingForm.patchValue({ patientId: null });
      // this.billingForm.patchValue({ selectedPatient: null });
      // this.billingForm.patchValue({ selectedPatientData: null });
      this.showPatientSearchBox = true;
      this.resetBillForm();
    }
  }

  getDoctorNameForPatient(uhid, penId): Observable<any> {
    return this.billingService.getDoctorNameForPatient(uhid, penId).pipe(map(res => {
      if (res) {
        res.patEncounterStatus = res.patEncounterStatus || 'OPEN';
        this.allowSpotBill = res.penType == 'IP';
        this.billingForm.patchValue({ selectedPatient: res });
        this.billingForm.value.selectedPatient.admissionDate = res.patEncDate12;
        this.billingForm.value.selectedPatient.bedNo = res.BedInfo;
        this.billingForm.value.selectedPatient.doctorName = res.doctorName;
        this.billingForm.value.selectedPatient.orginalChargingType = _.cloneDeep(res.activeChargingType);
        this.billingForm.value.selectedPatient.orginalChargingTypeId = _.cloneDeep(res.activeChargingTypeId);
        this.billingForm.value.selectedPatient.isPatientClassChangePage = this.isPatientClassChangePage;
      }
      return res;
    }));
  }

  getAllVoucherList(billMainId?): Observable<any> {
    const param = {
      penId: this.billingForm.value.selectedPatient.penId,
      uhId: this.billingForm.value.selectedPatient.uhid,
      serviceSodId: '',
      isSpotBill: 'N',
      billMainId: billMainId ? billMainId : 0,
      fromBill: true,
      loadAllBill: true
    };
    return this.billingService.getOrderedServicesList(param).pipe(map(res => {
      this.voucherList = [];
      if (this.billingForm.value.selectedPatient.penType != 'IP') {
        this.voucherList.push({
          billId: 0,
          bookType: '',
          billNo: 'Add New',
          customName: 'Add New',
          billDate: null,
          status: 'PENDING',
          billTypeStatus: 'INTERIM BILL',
          // totalAmount: null,
          // netTotalAmount: null,
          finalNetAmount: null,
          netPayableAmount: null,
          isSpotBill: false
        });
      }
      // populate vouchers
      if (res && res.data && res.data.patBillMainData && res.data.patBillMainData.length > 0) {
        _.map(res.data.patBillMainData, d => {
          let objBill = {
            billId: d.PbmId,
            bookType: d.PbmBookType,
            billNo: d.PbmBillno,
            customName: d.PbmBillno + ' - ' + moment(d.PbmBilldate).format('DD/MM/YYYY'),
            billDate: moment(d.PbmBilldate),
            billDatetime: d.Billdatetime,
            status: d.PbmStatus,
            billTypeStatus: d.PbmBilltypestatus || 'INTERIM BILL',
            finalNetAmount: d.PbmTotNetamt,
            netPayableAmount: d.PbmFialbillNetamt,
            isSpotBill: d.PbmIsspotBill == 'Y'
          }
          this.voucherList.push(objBill);
        });
      }

      // if no bill generated then add new bill entry
      if (!this.voucherList.length) {
        this.voucherList.push({
          billId: 0,
          bookType: '',
          billNo: 'Add New',
          customName: 'Add New',
          billDate: null,
          billDatetime: null,
          status: 'PENDING',
          billTypeStatus: 'INTERIM BILL',
          finalNetAmount: null,
          netPayableAmount: null,
          isSpotBill: false
        });
      }

      // select first bill and populate into grid
      this.populateBillGridData(res, billMainId);

      return this.voucherList;
    }));
  }

  getSelectedVoucher(event) {
    if (event && event.billId !== 0) {
      this.billingForm.patchValue({ billId: event.billId });
      this.getPatientBillById(event.billId).subscribe();
      return;
    } else if (this.billingForm.value?.isSavedBillFinal || this.billingForm.value?.status == 'CANCELLED') {
      // if encounter is inactive then user not allow add new bill
      if (this.billingForm.value?.selectedPatient?.penIsactive == 'N') {
        this.billingForm.patchValue({ isVoucherDropDownVisible: false });
        this.showValidationMsg('Encounter is not active. So, you can not create new bill.');
        return;
      }

      // check any bill in active state..
      const isActiveBill = _.find(this.voucherList, (o) => { return o.billId != 0 && o.billTypeStatus != 'FINAL BILL' && o.status != 'CANCELLED'; });
      if (isActiveBill) {
        this.billingForm.patchValue({ isVoucherDropDownVisible: false });
        this.showValidationMsg('Please close patient active bill first.');
        return;
      }

      // check IP bill already created then show that one ??
      if (this.billingForm.value.selectedPatient.penType == 'IP') {
        const ipVoucherObjExists = _.find(this.voucherList, (o) => { return o.isSpotBill == false && o.bookType == this.billingForm.value.selectedPatient.penType; });
        if (ipVoucherObjExists) {
          this.billingForm.patchValue({ isVoucherDropDownVisible: false });
          this.billingForm.patchValue({ billId: ipVoucherObjExists.billId });
          this.getPatientBillById(ipVoucherObjExists.billId).subscribe();
          this.showValidationMsg('IP patient active bill already exists.');
          return;
        }
      }

      // Add new voucher
      const newVoucherObjExists = _.find(this.voucherList, (o) => { return o.billId == 0; });
      if (!newVoucherObjExists) {
        const newVoucherObj = {
          billId: 0,
          billNo: 'Add New',
          customName: 'Add New',
          billDate: null,
          billDatetime: null,
          status: 'PENDING',
          billTypeStatus: 'INTERIM BILL',
          finalNetAmount: null,
          netPayableAmount: null
        };
        this.voucherList.splice(0, 0, newVoucherObj);
      }
      // generate new bill...
      this.billServiceArray = [];
      this.insuranceDetailArray = [];
      this.populateBillData({ PbmTotDisctype: 'percent', PbmTotGstType: 'percent' });
    } else {
      this.showValidationMsg('Please close patient active bill first.');
    }
    this.billingForm.patchValue({ isVoucherDropDownVisible: false });
  }

  getPatientBillById(billMainId): Observable<any> {
    const param = {
      penId: this.billingForm.value.selectedPatient.penId,
      uhId: this.billingForm.value.selectedPatient.uhid,
      serviceSodId: '',
      isSpotBill: 'N',
      billMainId: billMainId || 0,
      fromBill: true,
      loadAllBill: false
    };
    return this.billingService.getOrderedServicesList(param).pipe(map(res => {
      this.populateBillGridData(res, billMainId);
      // update voucher detail in voucher list after bill save
      var voucherIndex = _.findIndex(this.voucherList, (o) => { return o.billId == billMainId; });
      if (voucherIndex != -1) {
        const voucherExists = _.find(res.data.patBillMainData, (o) => { return o.PbmId == billMainId; });
        if (voucherExists) {
          let objBill = {
            billId: voucherExists.PbmId,
            billNo: voucherExists.PbmBillno,
            customName: voucherExists.PbmBillno + ' - ' + moment(voucherExists.PbmBilldate).format('DD/MM/YYYY'),
            billDate: moment(voucherExists.PbmBilldate),
            billDatetime: voucherExists.Billdatetime,
            status: voucherExists.PbmStatus,
            billTypeStatus: voucherExists.PbmBilltypestatus || 'INTERIM BILL',
            finalNetAmount: voucherExists.PbmTotNetamt,
            netPayableAmount: voucherExists.PbmFialbillNetamt,
            isSpotBill: voucherExists.PbmIsspotBill == 'Y'
          }
          this.voucherList[voucherIndex] = objBill;
        }
      }
      return res;
    }));
  }

  getPatientPackageInclusiveDetail(penId, billMainId): Observable<any> {
    return this.billingService.getPatientPackageInclusiveDetail(penId, billMainId).pipe(map(res => {
      this.billPackageArray = _.sortBy(res, 'sequence');
    }));
  }

  getPackageDetailsById(packageId, billRowTempId): Observable<any> {
    // check package detail already fetch bill row id then return
    const isExists = _.find(this.billPackageArray, (o) => { return o.billRowTempId == billRowTempId; })
    if (isExists) {
      return of(this.billPackageArray);
    }

    const activeChargingTypeId = this.billingForm.value.selectedPatient.activeChargingTypeId;
    const visitType = this.billingForm.value.selectedPatient.penType;
    return this.billingService.getPackageDetailsById(packageId, activeChargingTypeId, visitType, billRowTempId).pipe(map(res => {
      this.billPackageArray = _.sortBy(_.uniq(this.billPackageArray.concat(res)), 'sequence');
      return res;
    }));
  }

  populateBillGridData(res, billMainId?) {
    let billMain: any;
    this.billServiceArray = [];
    this.insuranceDetailArray = [];

    if (res && res.status_message === 'Success') {
      let orderServices = res.data.srvOrderDetailsList;
      let orderNonServices = res.data.nonServiceDetailList;
      this.isDiscountApproval = res.data.isDiscountApproval;

      // billing insurance request details
      this.insuranceDetailArray = res.data.insuranceDetail;

      // add services
      _.map(orderServices, (d) => {
        const serviceObj = new BillServiceModel();
        if (serviceObj.isObjectValid(d)) {
          serviceObj.generateObject(d, this.doctorListArray);
          this.billServiceArray.push(serviceObj);
        }
      });

      // add non services
      _.map(orderNonServices, (d) => {
        const serviceObj = new BillServiceModel();
        if (serviceObj.isObjectValid(d)) {
          serviceObj.generateObject(d);
          this.billServiceArray.push(serviceObj);
        }

        // update service center and calculate net amount of auto posted services
        if (!serviceObj.isNonService) {
          const rowIndex = this.billServiceArray.length - 1;
          // set default service center to auto posted service
          if (!serviceObj.serviceCenterId) {
            this.setDefaultServiceCenter(rowIndex);
          }
          // recalculate service admin and gst charges
          this.calculateRowData(rowIndex);
        }
      });

      billMainId = (billMainId || 0);
      if (billMainId > 0) {
        billMain = _.find(res.data.patBillMainData, (o) => { return o.PbmId == billMainId });
      } else {
        billMain = (res.data && res.data.patBillMainData) ? res.data.patBillMainData[0] : {};
      }

      // Load all service surcharge types
      const billServices = _.filter(this.billServiceArray, (o) => { return o.service && o.service.serviceId; });
      const serviceIds = _.map(billServices, (o) => { return o.service.serviceId; });
      this.populateSurchargeData(serviceIds).subscribe();

      // Patient encounter status...
      this.billingForm.value.selectedPatient.patEncounterStatus = res.data.patEncounterStatus;
      this.billingForm.value.selectedPatient.advanceDeposit = _.round(parseFloat(res.data.totalDeposited || 0), 2);
      this.billingForm.value.selectedPatient.pendingBillAmount = _.round(parseFloat(res.data.pendingBillAmount || 0), 2);
      this.billingForm.value.selectedPatient.refundBillAmount = _.round(parseFloat(res.data.refundBillAmount || 0), 2);

      if (this.billingForm.value.selectedPatient.pendingBillAmount > 0) {
        const pendingDueMsg = "Patient has pending bill amount of ₹: " + this.billingForm.value.selectedPatient.pendingBillAmount + "/-";
        this.showValidationMsg(pendingDueMsg);
      }
    }

    // populate bill head data into billing form
    // and load package inclusive services on bill change and calculate footer bill details
    this.populateBillData(billMain);

    // this.getPatientPayDetails().subscribe(res => {
    // })
  }

  populateBillData(billMain: any) {
    this.originalSetteledAmt = billMain?.PbmSettledAmount || 0;
    this.originalFinalBillAmt = (billMain?.PbmTotNetamt || 0) - (billMain?.PbmTotAdvamt || 0);
    //let isFinalBill = (billMain?.PbmStatus || 'PENDING') == 'CONFIRMED' || (billMain?.PbmStatus || 'PENDING') == 'CLOSED';
    const billTypeStatus = (billMain?.PbmBilltypestatus || 'INTERIM BILL');
    let isFinalBill = billTypeStatus == 'FINAL BILL' || billTypeStatus == 'FINAL DRAFT BILL';
    const refundedAndUnaccoutedAmount = parseFloat(billMain?.PbmRefundedAmount || 0) + parseFloat(billMain?.PbmServiceRefundAmt || 0) + parseFloat(billMain?.PbmUnaccountedExcessAmt || 0);

    this.billingForm.patchValue({ billId: (billMain?.PbmId || 0) });
    this.billingForm.patchValue({ billNo: (billMain?.PbmBillno || null) });
    this.billingForm.patchValue({ billDate: (billMain?.PbmBilldate ? new Date(billMain?.PbmBilldate) : new Date()) });
    this.billingForm.patchValue({ billDatetime: (billMain?.Billdatetime ? billMain?.Billdatetime : moment().format('DD/MM/YYYY hh:mm A')) });
    this.billingForm.patchValue({ grossAmount: (billMain?.PbmTotGrossamt || 0) }); // PbmBillAmt
    this.billingForm.patchValue({ billAmount: (billMain?.PbmBillAmt || 0) }); // PbmBillAmt
    this.billingForm.patchValue({ categoryConcPer: (billMain?.PbmCategoryConcper || 0) });
    this.billingForm.patchValue({ categoryConcAmt: (billMain?.PbmCategoryConcamt || 0) });
    this.billingForm.patchValue({ billAuthority: (billMain?.PbmAuthorityId || 0) });
    this.billingForm.patchValue({ discountType: (billMain?.PbmTotDisctype || 'discountAmount') });
    this.billingForm.patchValue({ discountPercent: (billMain?.PbmTotDiscper || 0) });
    this.billingForm.patchValue({ discountAmount: (billMain?.PbmTotDiscamt || 0) });
    this.billingForm.patchValue({ adminChargeAppBillAmount: 0 });
    this.billingForm.patchValue({ adminChargesPer: (billMain?.PbmAdminChargesPer || 0) });
    this.billingForm.patchValue({ adminChargesAmt: (billMain?.PbmAdminChargesAmt || 0) });
    this.billingForm.patchValue({ netAmount: (billMain?.PbmTotAmount || 0) }); // PbmBillNetamt
    this.billingForm.patchValue({ isGstApplicable: (billMain?.PbmTotGstamt || 0) > 0 });
    this.billingForm.patchValue({ gstType: (billMain?.PbmTotGstType || 'gstAmount') });
    this.billingForm.patchValue({ gstPercent: (billMain?.PbmTotGstper || 0) });
    this.billingForm.patchValue({ gstAmount: (billMain?.PbmTotGstamt || 0) });
    this.billingForm.patchValue({ finalNetAmount: (billMain?.PbmTotNetamt || 0) }); // PbmFialbillNetamt
    this.billingForm.patchValue({ creditApprovedAmount: billMain?.PbmCreditApprovedAmount || 0 }); // PbmCreditApprovedAmount
    this.billingForm.patchValue({ creditApprovedBalance: billMain?.PbmCreditApprovedBalance || 0 }); // PbmCreditApprovedAmount
    this.billingForm.patchValue({ insuranceAmount: billMain?.PbmTotInsuranceamt || 0 }); // PbmCreditApprovedAmount
    this.billingForm.patchValue({ billAdvanceAdjustmentAmt: (billMain?.PbmTotAdvamt || 0) });
    this.billingForm.patchValue({ advanceAdjustmentAmt: (billMain?.PbmTotAdvamt || 0) });
    this.billingForm.patchValue({ settledAmount: (billMain?.PbmSettledAmount || 0) });
    this.billingForm.patchValue({ refundedAmount: (refundedAndUnaccoutedAmount || 0) });
    //this.billingForm.patchValue({ balanceAmount: billMain?.balanceAmount || 0 });
    this.billingForm.patchValue({ isWriteOff: ((billMain?.PbmIswriteoff == 'Y') || false) });
    this.billingForm.patchValue({ writeOffAmount: (billMain?.PbmWriteoffAmount || 0) });
    this.billingForm.patchValue({ netPayableAmount: (billMain?.PbmFialbillNetamt || 0) });
    this.billingForm.patchValue({ status: (billMain?.PbmStatus || 'PENDING') });
    this.billingForm.patchValue({ paymentStatus: (billMain?.PbmPstatus || 'PAYMENT DUE') });
    this.billingForm.patchValue({ tpaStatus: (billMain?.PbmTpastatus || '') });
    this.billingForm.patchValue({ billTypeStatus: (billMain?.PbmBilltypestatus || 'INTERIM BILL') });
    this.billingForm.patchValue({ remark: (billMain?.PbmRemarks || '') });
    this.billingForm.patchValue({ isSpotBill: ((billMain?.PbmIsspotBill == 'Y') || false) });
    this.billingForm.patchValue({ isTakePrint: false });
    this.billingForm.patchValue({ showPayDetail: false });
    this.billingForm.patchValue({ isSavedBillFinal: isFinalBill });
    this.billingForm.patchValue({ isFinal: isFinalBill });
    this.billingForm.patchValue({ isDischargeApprove: false });
    this.billingForm.patchValue({ isVoucherDropDownVisible: false });

    // For OP and ER Patient ecounter default mark bill as final
    if (this.billingForm.value.selectedPatient.penType == 'OP' || this.billingForm.value.selectedPatient.penType == 'ER') {
      this.billingForm.patchValue({ isFinal: true });
    }

    // show remark in view only mode if bill is not editable
    this.billingForm.patchValue({ remark: (billMain?.PbmRemarks || ''), disabled: this.isBillViewOnly });

    // show all services when bill status is cancelled / if all services are reversed then show all services
    const isCancelledBill = this.billingForm.value.status == 'CANCELLED';
    const nonReverseServices = _.find(this.billServiceArray, (o) => { return o.status != 'REVERSE'; });
    if (isCancelledBill || (!nonReverseServices && this.billServiceArray.length > 0)) {
      this.statusFilterValues = [];
    }

    // billing addition utilization details
    this.billingForm.patchValue({ advancePaymentRowData: [] });
    this.billingForm.patchValue({ advPaymentSettlement: [] });
    this.billingForm.patchValue({ utilizeAdvanceAmount: [] });
    this.billingForm.patchValue({ utilizeInsuranceAmount: [] });

    // add bill concession
    const billConcessionArray = [];
    _.map(billMain?.concessionDetails, (d) => {
      const concessionObj = new BillConcessionModel();
      if (concessionObj.isObjectValid(d)) {
        concessionObj.generateObject(d);
        billConcessionArray.push(concessionObj);
      }
    });

    // billing addition concession details
    this.billingForm.patchValue({ billConcessionArray: billConcessionArray });

    // clone bill service array
    this.cloneBillServiceArray = JSON.parse(JSON.stringify(this.billServiceArray));

    // calculate footer bill data based on bill grid data
    this.calculateBillData();

    // load all package inculsive service on bill selection
    this.billPackageArray = [];
    if (this.billingForm.value.billId) {
      this.getPatientPackageInclusiveDetail(this.billingForm.value.selectedPatient.penId, this.billingForm.value.billId).subscribe(res => {
        // on bill load update package utilization details
        this.adjustPackageDiscIntoBill();

        // clone patient billing form for dirty
        this.billingFormClone = JSON.parse(JSON.stringify(this.billingForm.value));
      });
    }
    else {
      // clone patient billing form for dirty
      this.billingFormClone = JSON.parse(JSON.stringify(this.billingForm.value));
    }

    // Add first empty row into bill grid if bill is empty
    // or bill is not final then add new row at last for service posting
    if ((this.billServiceArray.length == 0) && !this.isPatientClassChangePage) { // || !this.isBillViewOnly
      this.addNewEmptyRow();
    }
    else {
      // set focus to first row service cell
      this.initDataGrid();
    }
  }

  populateSurchargeData(serviceIds: Array<number>): Observable<any> {
    if (serviceIds.length == 1) {
      const isExists = _.find(this.serviceSurchargeTypeArray, (o) => { return o.serviceId == serviceIds[0]; });
      if (isExists) { return of(this.serviceSurchargeTypeArray); }
    }

    return this.billingService.getServiceSurcharge(serviceIds).pipe(map(res => {
      this.serviceSurchargeTypeArray = _.uniq(this.serviceSurchargeTypeArray.concat(res));
      return this.serviceSurchargeTypeArray;
    }));
  }

  addPackageServiceIntoBill(packageService: Array<PackageDetailModel>, packageRowIndex) {
    const packageRowNextIndex = packageRowIndex + 1;
    // For OP / ER Patient Visit added package service into bill when select as package
    _.map(packageService, (d: PackageDetailModel, index) => {
      const serviceObj = new BillServiceModel();
      serviceObj.generatePkgServiceObject(d);
      const newRowIndex = (packageRowNextIndex + index);
      this.billServiceArray.splice(newRowIndex, 0, serviceObj);
      this.setDefaultServiceCenter(newRowIndex);
    });

    // refresh grid data
    this.dataGrid.instance.refresh();
  }

  adjustPackageDiscIntoBill() {
    let rowIndex;
    let packageArray = this.billPackageArray;
    let billServiceArray = rowIndex ? _.filter(this.billServiceArray, (v, k) => { return k == rowIndex }) : this.billServiceArray;

    // update utilized qty in package array
    _.map(packageArray, (pkg) => {
      pkg.utilizedQty = 0;
      pkg.utilizedAmount = 0;
    });

    // if rowIndex not passed then clear package data
    // and recalculate all grid items against package
    _.map(billServiceArray, (srvObj) => {
      const validPkgDisc = _.find(packageArray, (o) => { return o.packageRowId == srvObj.pkgRowId });
      if (!validPkgDisc) {
        srvObj.pkgDiscAmt = 0;
        srvObj.pkgQty = 0;
        srvObj.pkgRowId = '';
        srvObj.pkgRate = 0;
        srvObj.pkgConDetail = [];
      } else {
        validPkgDisc.utilizedQty += srvObj.pkgQty;
        validPkgDisc.utilizedAmount += srvObj.pkgDiscAmt;
      }
    });

    if (packageArray.length) {

      // SERVICE - update utilized qty into service against service
      _.map(packageArray, (pkg) => {
        if (pkg.categoryType == 'SERVICE') {
          let availQty = pkg.qty - pkg.utilizedQty;
          if (availQty > 0) {
            _.map(billServiceArray, (srvObj, index) => {
              if (availQty > 0 && !srvObj.isNonService && srvObj.status != 'REVERSE' && srvObj.status != 'CANCEL'
                && srvObj.service && srvObj.service.serviceId == pkg.serviceId && srvObj.orderQty > srvObj.pkgQty) {
                const serviceQty = srvObj.orderQty - srvObj.pkgQty;
                const utilizedQty = availQty < serviceQty ? availQty : serviceQty;
                pkg.utilizedQty += utilizedQty;
                const utilizedAmount = utilizedQty * srvObj.rate;

                // update available package qty
                availQty -= utilizedQty;

                // update pckQty,  pckDiscount, rowId and derivedRate
                srvObj.pkgQty += utilizedQty;
                srvObj.pkgDiscAmt += utilizedAmount;
                srvObj.pkgRowId = pkg.packageRowId;
                srvObj.pkgRate = pkg.derivedAmt;

                // add package concession details
                srvObj.pkgConDetail.push({
                  pkgRowId: pkg.packageRowId,
                  utilizedQty: utilizedQty,
                  utilizedAmount: utilizedAmount
                });

                // calculate row data after package discount
                const serviceRowIndex = rowIndex ? rowIndex : index;
                this.calculateRowData(serviceRowIndex);

                // update change log details for package discount
                // this.updateLogDetail(serviceRowIndex, 'pkgDiscAmt', srvObj.pkgDiscAmt);
              }
            });
          }
        }
      });

      // FIXED - update utilized amount into services against service head
      _.map(packageArray, (pkg) => {
        if (pkg.categoryType == 'FIXED') {
          let availAmount = pkg.amount - pkg.utilizedAmount;
          if (availAmount > 0) {
            _.map(billServiceArray, (srvObj, index) => {
              if (availAmount > 0 && !srvObj.isNonService && srvObj.status != 'REVERSE' && srvObj.status != 'CANCEL'
                && srvObj.service && srvObj.service.serviceHeadId == pkg.serviceHeadId && srvObj.amount > srvObj.pkgDiscAmt) {
                const srviceAmount = srvObj.amount - srvObj.pkgDiscAmt;
                const utilizedAmount = availAmount < srviceAmount ? availAmount : srviceAmount;
                pkg.utilizedAmount += utilizedAmount;
                availAmount -= utilizedAmount;

                // update pckQty,  pckDiscount, rowId and derivedRate
                srvObj.pkgDiscAmt += utilizedAmount;
                srvObj.pkgRowId = pkg.packageRowId;
                srvObj.pkgRate = pkg.derivedAmt;

                // add package concession details
                srvObj.pkgConDetail.push({
                  pkgRowId: pkg.packageRowId,
                  utilizedQty: 0,
                  utilizedAmount: utilizedAmount
                });

                // calculate row data after package discount
                const serviceRowIndex = rowIndex ? rowIndex : index;
                this.calculateRowData(serviceRowIndex);

                // update change log details for package discount
                // this.updateLogDetail(serviceRowIndex, 'pkgDiscAmt', srvObj.pkgDiscAmt);
              }
            });
          }
        }
      });

      // NONSERVICE - calculate package discount first time only
      // update utilized non service bed charges qty into services
      _.map(packageArray, (pkg) => {
        if (pkg.categoryType == 'NONSERVICE' && pkg.bedTypeId > 0) {
          let availQty = pkg.qty - pkg.utilizedQty;
          if (availQty > 0) {
            _.map(billServiceArray, (srvObj, index) => {
              if (availQty > 0 && srvObj.isNonService && srvObj.status != 'REVERSE' && srvObj.status != 'CANCEL'
                && srvObj.service && srvObj.nonServiceHeadId == pkg.serviceId && srvObj.nonServiceBedTypeId == pkg.bedTypeId && srvObj.orderQty > srvObj.pkgQty) {
                const serviceQty = srvObj.orderQty - srvObj.pkgQty;
                const utilizedQty = availQty < serviceQty ? availQty : serviceQty;
                pkg.utilizedQty += utilizedQty;
                const utilizedAmount = utilizedQty * srvObj.rate;

                // update available package qty
                availQty -= utilizedQty;

                // update pckQty,  pckDiscount, rowId and derivedRate
                srvObj.pkgQty += utilizedQty;
                srvObj.pkgDiscAmt += utilizedAmount;
                srvObj.pkgRowId = pkg.packageRowId;
                srvObj.pkgRate = pkg.derivedAmt;

                // add package concession details
                srvObj.pkgConDetail.push({
                  pkgRowId: pkg.packageRowId,
                  utilizedQty: utilizedQty,
                  utilizedAmount: utilizedAmount
                });

                // calculate row data after package discount
                const serviceRowIndex = rowIndex ? rowIndex : index;
                this.calculateRowData(serviceRowIndex);

                // update change log details for package discount
                // this.updateLogDetail(serviceRowIndex, 'pkgDiscAmt', srvObj.pkgDiscAmt);
              }
            });
          }
        }
      });

      // update utilized non service amount into services
      _.map(packageArray, (pkg) => {
        if (pkg.categoryType == 'NONSERVICE' && pkg.bedTypeId == 0) {
          let availAmount = pkg.amount - pkg.utilizedAmount;
          if (availAmount > 0) {
            _.map(billServiceArray, (srvObj, index) => {
              if (availAmount > 0 && !srvObj.isNonService && srvObj.status != 'REVERSE' && srvObj.status != 'CANCEL'
                && srvObj.service && srvObj.nonServiceHeadId == pkg.serviceId && srvObj.amount > srvObj.pkgDiscAmt) {
                const srviceAmount = srvObj.amount - srvObj.pkgDiscAmt;
                const utilizedAmount = availAmount < srviceAmount ? availAmount : srviceAmount;
                pkg.utilizedAmount += utilizedAmount;
                availAmount -= utilizedAmount;

                // update pckQty,  pckDiscount, rowId and derivedRate
                srvObj.pkgDiscAmt += utilizedAmount;
                srvObj.pkgRowId = pkg.packageRowId;
                srvObj.pkgRate = pkg.derivedAmt;

                // add package concession details
                srvObj.pkgConDetail.push({
                  pkgRowId: pkg.packageRowId,
                  utilizedQty: 0,
                  utilizedAmount: utilizedAmount
                });

                // calculate row data after package discount
                const serviceRowIndex = rowIndex ? rowIndex : index;
                this.calculateRowData(serviceRowIndex);

                // update change log details for package discount
                // this.updateLogDetail(serviceRowIndex, 'pkgDiscAmt', srvObj.pkgDiscAmt);
              }
            });
          }
        }
      });

      // update is dirty flag...
      _.map(billServiceArray, (srvObj, serviceRowIndex) => {
        if (srvObj.isEditMode && srvObj.status != 'REVERSE' && srvObj.status != 'CANCEL') {
          const oldRowObj: BillServiceModel = _.find(this.cloneBillServiceArray, (o) => { return o.billDetailId == srvObj.billDetailId; });
          if (oldRowObj && oldRowObj.pkgDiscAmt != srvObj.pkgDiscAmt
            && !_.isEqual(oldRowObj.pkgConDetail, srvObj.pkgConDetail)) {
              // update change log details for package discount
              this.updateLogDetail(serviceRowIndex, 'pkgDiscAmt', srvObj.pkgDiscAmt);
          }
        }
      });

    }

    // refresh grid data
    this.dataGrid.instance.refresh();
  }

  enablePatientSearch(showPatientSearch) {
    if (showPatientSearch === false && !this.billingForm.value.selectedPatient) {
      return;
    }
    this.showPatientSearchBox = showPatientSearch;
    this.billingForm.patchValue({ showPayDetail: false });
  }

  getServiceMasterDataSource() {
    const compObj = this;
    this.serviceMasterDataSource = new CustomStore({
      key: "serviceId",
      load: function (loadOptions: any) {
        return new Promise((resolve, reject) => {
          //if (loadOptions.searchValue) {
          let visitType = compObj.billingForm && compObj.billingForm.value && compObj.billingForm.value.selectedPatient ? compObj.billingForm.value.selectedPatient.penType : '';
          compObj.generateServiceData(loadOptions.searchValue, visitType).subscribe(result => {
            resolve(result);
          });
          // } else {
          //   resolve([]);
          // }
        });
      },
      // Needed to process selected value(s) in the SelectBox, Lookup, Autocomplete, and DropDownBox
      byKey: (key) => {
        return new Promise((resolve, reject) => {
          // if (key) {
          let visitType = compObj.billingForm && compObj.billingForm.value && compObj.billingForm.value.selectedPatient ? compObj.billingForm.value.selectedPatient.penType : '';
          key = key && key.serviceId ? key.serviceId : key;
          compObj.generateServiceData(key, visitType).subscribe(result => {
            resolve(result);
          });
          // } else {
          //   resolve([]);
          // }
        });
      }
    });
  }

  generateServiceData(searchKeyword, visitType): Observable<any> {
    const defaultServiceCenterId = parseFloat(this.authService.getUserDefaultServiceCenter() || 0);
    const dataArray = _.find(this.serviceMasterCache, (o) => { return _.isEqual(o.request, { searchKeyword, visitType }); });
    if (dataArray && dataArray.result && dataArray.result.length > 0) {
      return of(dataArray.result);
    }
    return this.billingService.generateServiceData(searchKeyword, visitType, defaultServiceCenterId).pipe(map((res: any) => {
      this.serviceMasterCache.push({
        request: { searchKeyword, visitType },
        result: res
      });
      return res;
    }));
  }

  populateHeaderFilterServiceData() {
    let gridServices = _.map(this.billServiceArray, (o) => { return o.serviceName; });
    gridServices = _.sortBy(_.uniq(gridServices), (o) => { return o; });
    this.headerFilterServiceData = {
      store: gridServices,
      map: (item) => {
        return {
          value: item,
          text: item,
          serviceName: item
        }
      }
    };
  }

  getServiceNameWithType(rowData) {
    const serviceObj = rowData ? (rowData.serviceName ? rowData : rowData.service) : { serviceName: null };
    if (rowData.isNonService) {
      return serviceObj ? serviceObj.serviceName : null;
    } else {
      return serviceObj && serviceObj.serviceName ? (serviceObj.serviceName + " (" + serviceObj.serviceType + ")") : null;
    }
  }

  getServiceTypeShortName(rowData) {
    if (rowData.serviceType) {
      return rowData.serviceType.substr(0, 1);
    } else {
      return 'N';
    }
  }

  updateServiceRate(rowIndex: any): Observable<any> {
    // get service updated service rate
    const rowObj = this.billServiceArray[rowIndex];
    const reqParams = {
      srvId: rowObj.service.serviceId,
      chargingTypeId: this.billingForm.value.selectedPatient.activeChargingTypeId || 0,
      custId: 0, //this.billingForm.value.penIscorporateCustomer
      doctorId: rowObj.doctorId || 0,
      orderDateTime: rowObj.orderDate
    }
    return this.billingService.getServiceRate(reqParams).pipe(map(res => {
      rowObj.rate = res.rate;
      rowObj.incompleteRateFlag = !res.isRateDefined;
      this.calculateRowData(rowIndex);
      return res;
    }));
  }

  updateServiceSurchargeType(rowIndex: any) {
    const rowObj = this.billServiceArray[rowIndex];
    if (rowObj.service) {
      const orderTime = moment(rowObj.orderDate).format('HH:mm');
      const customOrderDate = moment(orderTime, 'HH:mm')
      const surchargeType = _.find(this.serviceSurchargeTypeArray, (o) => {
        return o.serviceId == rowObj.service.serviceId
          && moment(customOrderDate).isBetween(moment(o.fromTime, 'HH:mm'), moment(o.toTime, 'HH:mm'));
      });
      if (surchargeType) {
        rowObj.surchargeTypeId = surchargeType.surchargeTypeId;
        rowObj.surchargeType = surchargeType.surchargeType;
      } else {
        rowObj.surchargeTypeId = 0;
        rowObj.surchargeType = 'ROUTINE';
      }
    }
  }

  setDefaultServiceCenter(rowIndex: any) {
    const rowObj = this.billServiceArray[rowIndex];
    this.billingService.GetServiceCenterList(rowObj.service?.serviceId).subscribe(result => {
      rowObj.isServiceCenterMapped = true;
      const userDefaultCenterId = this.authService.getUserDefaultServiceCenter();
      const userDefaultCenter = _.find(this.assignedServiceCenter, (o) => { return o.serviceCenterId == userDefaultCenterId; });

      if (this.restrictServiceCenter && userDefaultCenter) {
        rowObj.serviceCenterId = userDefaultCenter.serviceCenterId;
        rowObj.serviceCenterName = userDefaultCenter.serviceCenterName;
      }
      else {
        // check for default service center assigned for service
        let defaultCenter = _.find(result, (o, index) => { return o.isDefault == true; });
        if (defaultCenter) {
          rowObj.serviceCenterId = defaultCenter.serviceCenterId;
          rowObj.serviceCenterName = defaultCenter.serviceCenterName;
        }
        // check for user service center assigned for service
        if (!defaultCenter && userDefaultCenter?.serviceCenterId > 0) {
          defaultCenter = _.find(result, (o, index) => { return (o.serviceCenterId == userDefaultCenter?.serviceCenterId); });
          if (defaultCenter) {
            rowObj.serviceCenterId = defaultCenter.serviceCenterId;
            rowObj.serviceCenterName = defaultCenter.serviceCenterName;
          }
        }
        // set first service center from assigned service center for service
        if (!defaultCenter && result.length > 0) {
          rowObj.serviceCenterId = result[0].serviceCenterId;
          rowObj.serviceCenterName = result[0].serviceCenterName;
        }
        else if (!defaultCenter) {
          // no service center assigned to service
          rowObj.isServiceCenterMapped = false;
          rowObj.serviceCenterName = 'NA';
        }
      }
      // refresh grid data
      this.dataGrid.instance.refresh();
    });
  }

  getComponentItems(rowIndex: any): Observable<any> {
    const rowObj = this.billServiceArray[rowIndex];
    if (rowObj && rowObj.attachedCompList && rowObj.attachedCompList.length > 0) {
      return of(rowObj.attachedCompList);
    }
    // get service updated service rate
    const reqParams = {
      srvId: rowObj.service.serviceId,
      srvType: rowObj.service.serviceType,
      chargingTypeId: this.billingForm.value.selectedPatient.activeChargingTypeId,
      sorcsodId: rowObj.orderDetailId,
    }
    return this.billingService.getComponentItems(reqParams).pipe(map(res => {
      rowObj.attachedCompList = res;
      return rowObj.attachedCompList;
    }));
  }

  getDoctorDataSource() {
    const compObj = this;
    this.doctorDataSource = new CustomStore({
      key: "doctorId",
      load: function (loadOptions: any) {
        return new Promise((resolve, reject) => {
          const doctorId = compObj.focusedRowData.doctor || 0;
          const searchText = (loadOptions.searchValue || '').toUpperCase();
          let doctorList = _.filter(compObj.doctorListArray, (o) => { return o.doctorId == doctorId || o.doctorName.toUpperCase().indexOf(searchText) !== -1; });
          doctorList = _.chain(doctorList).sortBy('doctorName').take(50).value();
          resolve(doctorList);
        });
      },
      // Needed to process selected value(s) in the SelectBox, Lookup, Autocomplete, and DropDownBox
      byKey: (key) => {
        return new Promise((resolve, reject) => {
          let doctorList = _.filter(this.doctorListArray, (o) => { return o.doctorId == key; });
          doctorList = _.chain(doctorList).sortBy('doctorName').take(50).value();
          resolve(doctorList);
        });
      }
    });
  }

  addUserServiceCenterModel(result) {
    // if load user restricted service center
    if (this.restrictServiceCenter) {
      const userDefaultCenterId = this.authService.getUserDefaultServiceCenter();
      const userDefaultCenter = _.find(this.assignedServiceCenter, (o) => { return o.serviceCenterId == userDefaultCenterId; });
      if (userDefaultCenter) {
        const serviceCenterExists = _.find(result, (o) => { return o.serviceCenterId == userDefaultCenter.serviceCenterId; });
        if (!serviceCenterExists) {
          const centerObj = new ServiceCenterModel();
          centerObj.setUserServiceCenter(userDefaultCenter);
          result.push(centerObj);
        }
      }
    }
    return result;
  }

  getServiceCenterDataSource() {
    const compObj = this;
    this.serviceCenterDataSource = new CustomStore({
      key: "serviceCenterId",
      loadMode: 'raw',
      cacheRawData: true,
      load: function (loadOptions: any) {
        return new Promise((resolve, reject) => {
          const serviceId = compObj.focusedRowData.service?.serviceId || 0;
          compObj.billingService.GetServiceCenterList(serviceId).subscribe(result => {
            // if load user restricted service center
            result = compObj.addUserServiceCenterModel(result);
            resolve(result);
          });
        });
      },
      // Needed to process selected value(s) in the SelectBox, Lookup, Autocomplete, and DropDownBox
      byKey: (key) => {
        return new Promise((resolve, reject) => {
          const serviceId = compObj.focusedRowData.service?.serviceId || 0;
          compObj.billingService.GetServiceCenterList(serviceId).subscribe(result => {
            // if load user restricted service center
            result = compObj.addUserServiceCenterModel(result);
            resolve(result);
          });
        });
      }
    });
  }

  getStatusMasterDataSource() {
    this.statusMasterDataSource = new CustomStore({
      key: "statusId",
      load: function (loadOptions: any) {
        return new Promise((resolve, reject) => {
          resolve(this.statusArray);
        });
      },
      // Needed to process selected value(s) in the SelectBox, Lookup, Autocomplete, and DropDownBox
      byKey: (key) => {
        return new Promise((resolve, reject) => {
          resolve(this.statusArray);
        });
      }
    });
  }

  onIsFinalChange() {
    // if already bill saved as final
    if (this.billingForm.value.isSavedBillFinal || (this.billingForm.value.selectedPatient.penType == 'OP'
      || this.billingForm.value.selectedPatient.penType == 'ER')) {
      this.billingForm.patchValue({ isFinal: true });
    }
    // check IP bill marked as send for bill or not
    else if (this.billingForm.value.selectedPatient.penType == 'IP'
      && this.billingForm.value.selectedPatient.patEncounterStatus != 'SEND FOR BILLING' && this.billingForm.value.selectedPatient.patEncounterStatus != 'DISCHARGE APPROVED'
      && this.billingForm.value.selectedPatient.patEncounterStatus != 'ACTUAL DISCHARGE') {
      this.billingForm.patchValue({ isFinal: false });
      this.showValidationMsg('Patient encounter status must be SEND FOR BILLING');
      return;
    }

    this.dataGrid.instance.refresh();
  }

  UpdateServiceOrderStatusApi(sodId: number, updateStatus: string): Observable<any> {
    return this.billingService.UpdateServiceOrderStatusApi(sodId, updateStatus).pipe(map(res => {
      return res;
    }));
  }

  showHidePayDetail(evt) {
    if (!evt) {
      this.billingForm.patchValue({ showPayDetail: evt });
    }
  }

  showHideAddSectionPopOver() {
    if (this.ngbAddSectionPopover.isOpen()) {
      this.ngbAddSectionPopoverIsOpen = false;
      this.ngbAddSectionPopover.close();
    } else {
      this.ngbAddSectionPopoverIsOpen = true;
      this.ngbAddSectionPopover.open();
    }
  }

  printBill(billType: string) {
    // if (this.billingForm.value.billId == 0 || !this.billingForm.value.billNo) {
    //   this.showValidationMsg('Please save patient bill first');
    //   return;
    // }
    // const isDirtyChanges = _.find(this.billServiceArray, (obj: BillServiceModel, index) => {
    //   return (obj.status != 'REVERSE' && obj.status != 'CANCEL' && obj.isDirty && obj.service && obj.service.serviceName);
    // });
    // if (isDirtyChanges) {
    //   this.showValidationMsg('Please save unsaved patient bill changes first');
    //   return;
    // }
    //const url = environment.REPORT_API + 'Report/GRNPrint/?auth_token=' + this.authService.getAuthToken() + '&grnId=' + this.billingForm.value.billId;
    let url = '';
    if (billType == 'detailedPrintBill') {
      url = environment.REPORT_API + '/ShowReport/ShowPatBillingDetailReport?vno=' + this.billingForm.value.billNo + '&type=' + this.billingForm.value.selectedPatient.penType;
    } else {
      url = environment.REPORT_API + '/ShowReport/ShowPatBillingReport?vno=' + this.billingForm.value.billNo + '&type=' + this.billingForm.value.selectedPatient.penType;
    }
    this.printData = { url: url, returnType: false };
  }

  enableViewOnlyBillMode($event) {
    this.isViewOnlyBillMode = $event;
  }

  redirectToAdvancePayment() {
    const uhId = this.billingForm.value?.selectedPatient?.uhid;
    const parentAppUrl = window.location.ancestorOrigins.length ? window.location.ancestorOrigins[0] : '';
    if (parentAppUrl) {
      const appName = window.location.href.includes('hmis-fe') ? '/hmis-web' : '';
      const advancePaymentUrl = parentAppUrl + appName + '/' + this.appKey + '/AdvancePayment/AdvancePaymentDetails?uhid=' + uhId;
      window.top.location.href = advancePaymentUrl;
    }
  }

  redirectToBillPayment() {
    const uhId = this.billingForm.value?.selectedPatient?.uhid;
    const parentAppUrl = window.location.ancestorOrigins.length ? window.location.ancestorOrigins[0] : '';
    if (parentAppUrl) {
      const appName = window.location.href.includes('hmis-fe') ? '/hmis-web' : '';
      let redirectionUrl = '';
      if (parseFloat(this.billingForm.value?.selectedPatient?.pendingBillAmount || 0) < 0) {
        redirectionUrl = parentAppUrl + appName + '/' + this.appKey + '/PatientBillingRefund/BillingRefundDetails?uhId=' + uhId;
      } else {
        redirectionUrl = parentAppUrl + appName + '/' + this.appKey + '/PatientPayment/PatientPaymentDetails?uhId=' + uhId;
      }
      // navigate to url
      if (redirectionUrl) {
        window.top.location.href = redirectionUrl;
        return true;
      }
    } else {
      return false;
    }
  }

  redirectToBillRefund() {
    const uhId = this.billingForm.value?.selectedPatient?.uhid;
    const parentAppUrl = window.location.ancestorOrigins.length ? window.location.ancestorOrigins[0] : '';
    if (parentAppUrl) {
      const appName = window.location.href.includes('hmis-fe') ? '/hmis-web' : '';
      let redirectionUrl = parentAppUrl + appName + '/' + this.appKey + '/PatientBillingRefund/BillingRefundDetails?uhId=' + uhId;
      // navigate to url
      if (redirectionUrl) {
        window.top.location.href = redirectionUrl;
        return true;
      }
    } else {
      return false;
    }
  }

  checkForUnsavedPatientBill(actionName) {
    if (this.isPatientClassChangePage) {
      this.showValidationMsg('Not applicable with patient active class change.');
      return;
    }

    // for spot bill not to allow bill concession and insurance add and utilize
    if (this.isSpotBill && (actionName == 'patientBillConcession' || actionName == 'insuranceDetail' || actionName == 'patientInsurance')) {
      this.showValidationMsg('This action not allowed for spot bill.');
      return;
    }

    // if action name is patientInsurance then check for TPA patient
    if ((actionName == 'insuranceDetail' || actionName == 'patientInsurance') && this.billingForm.value?.selectedPatient?.penIscorporateCustomer != 'Y') {
      // check patient has insurance added or not
      this.showValidationMsg('Insurance not applicable for this patient.');
      return;
    }

    // add insurance tentative request amount for TPA patient
    if (actionName == 'insuranceDetail') {
      this.defaultActionAfterBillSave(actionName);
      return;
    }

    // check patient bill marked as final or not
    const isCancelledBill = this.billingForm.value.status == 'CANCELLED';
    if (actionName != 'printBill' && actionName != 'detailedPrintBill' && isCancelledBill) {
      this.showValidationMsg('Bill already cancelled.');
      return;
    }
    if (actionName == 'billPayment' && this.billingForm.value?.billTypeStatus != "FINAL BILL") {
      this.showValidationMsg('Bill type status should be Final.');
      return;
    }
    if (actionName != 'printBill' && actionName != 'detailedPrintBill' && !this.billingForm.value?.isFinal) {
      this.showValidationMsg('Please mark bill as Final first');
      return;
    }

    let inValidDataField = '';
    _.map(this.billServiceArray, (data: any, rowIndex: any) => {
      if (!inValidDataField && data.service && data.service.serviceName) {
        inValidDataField = this.validateRowDetail(rowIndex);
      }
    });

    if (!inValidDataField) {
      // check bill outstanding should not be less than zero
      // if (parseFloat(this.billingForm.value?.netPayableAmount || 0) < 0) {
      //   this.showValidationMsg('Bill Balance Amount should not be in minus');
      //   return;
      // }

      let confirmationMsg = '';
      if (this.billingForm.value.billId == 0 || !this.billingForm.value.billNo) {
        confirmationMsg = 'Patient Bill not saved. Do you want save patient bill and Continue?';
      }
      let isDirtyChanges = _.find(this.billServiceArray, (obj: BillServiceModel, index) => {
        return (obj.status != 'REVERSE' && obj.status != 'CANCEL' && obj.isDirty && obj.service && obj.service.serviceName);
      });
      // check bill level unsaved changes...
      if (!isDirtyChanges) {
        isDirtyChanges = this.billingFormClone.billAmount != this.billingForm.value.billAmount
                      || this.billingFormClone.adminChargesAmt != this.billingForm.value.adminChargesAmt
                      || this.billingFormClone.categoryConcAmt != this.billingForm.value.categoryConcAmt
                      || this.billingFormClone.discountAmount != this.billingForm.value.discountAmount
                      || this.billingFormClone.adminChargesAmt != this.billingForm.value.adminChargesAmt
                      || this.billingFormClone.netAmount != this.billingForm.value.netAmount
                      || this.billingFormClone.finalNetAmount != this.billingForm.value.finalNetAmount
                      || this.billingFormClone.creditApprovedAmount != this.billingForm.value.creditApprovedAmount
                      || this.billingFormClone.insuranceAmount != this.billingForm.value.insuranceAmount
                      || (actionName != 'patientAdvancePayment' && this.billingFormClone.advanceAdjustmentAmt != this.billingForm.value.advanceAdjustmentAmt)
                      || this.billingFormClone.settledAmount != this.billingForm.value.settledAmount
                      || this.billingFormClone.refundedAmount != this.billingForm.value.refundedAmount
                      || this.billingFormClone.writeOffAmount != this.billingForm.value.writeOffAmount;
      }
      if (isDirtyChanges) {
        confirmationMsg = 'Patient Bill has unsaved changes. Do you want save patient bill and Continue?';
      }

      // if no unsaved bill changes found
      if (!confirmationMsg) {
        this.defaultActionAfterBillSave(actionName);
        return;
      }

      const messageDetails = {
        modalTitle: 'Confirm',
        modalBody: confirmationMsg,
        buttonType: 'yes_no',
      };
      const modalInstance = this.ngbModal.open(ConfirmationPopupComponent,
        {
          ariaLabelledBy: 'modal-basic-title',
          backdrop: 'static',
          keyboard: false
        });
      modalInstance.result.then((result) => {
        if (result == 'yes') {
          const isSaveOnly = true;
          this.savePatientBillData(isSaveOnly).then(res => {
            this.defaultActionAfterBillSave(actionName);
          });
        }
      });
      modalInstance.componentInstance.messageDetails = messageDetails;
    }
  }

  defaultActionAfterBillSave(actionName) {
    if (actionName == 'printBill' || actionName == 'detailedPrintBill') {
      this.printBill(actionName);
    } else if (actionName == 'insuranceDetail') {
      this.patientInsuranceDetail();
    } else if (actionName == 'patientInsurance') {
      this.patientInsurance();
    } else if (actionName == 'patientAdvancePayment') {
      this.patientAdvancePayment();
    } else if (actionName == 'billPayment') {
      this.billPayment();
    } else if (actionName == 'patientBillConcession') {
      this.patientBillConcession();
    }
  }

  savePatientBillConfirmation() {
    let inValidDataField = '';
    _.map(this.billServiceArray, (data: any, rowIndex: any) => {
      if (!inValidDataField && data.service && data.service.serviceName) {
        inValidDataField = this.validateRowDetail(rowIndex);
      }
    });

    if (!inValidDataField) {
      // check bill outstanding should not be less than zero
      if (parseFloat(this.billingForm.value?.netPayableAmount || 0) < 0) {
        this.showValidationMsg('Bill Balance Amount should not be in minus');
      }
      let confirmationMessage = 'Are you sure to save bill?';
      if (this.isPatientClassChangePage)
        confirmationMessage = 'Patient Class, Category and Service rate will be change. ' + confirmationMessage;

      const messageDetails = {
        modalTitle: 'Confirm',
        modalBody: confirmationMessage,
        buttonType: 'yes_no',
      };
      const modalInstance = this.ngbModal.open(ConfirmationPopupComponent,
        {
          ariaLabelledBy: 'modal-basic-title',
          backdrop: 'static',
          keyboard: false
        });
      modalInstance.result.then((result) => {
        if (result == 'yes') {
          this.savePatientBillData().then(res => {
            // show print bill popup after final bill save only
            if (this.billingForm.value.isSavedBillFinal) {
              this.printBill('printBill');
            }
          })
        }
      });
      modalInstance.componentInstance.messageDetails = messageDetails;
    }
  }

  savePatientBillData(isSaveOnly?) {
    const promise = new Promise((resolve, reject) => {
      const billSaveObj = new BillSaveApiModel();
      billSaveObj.generateObject(this.billingForm.value, this.insuranceDetailArray, this.billServiceArray);

      // for background save skip bill mark as final if already not marked as final
      if (isSaveOnly && !this.billingForm.value.isSavedBillFinal) {
        billSaveObj.billInfo.isFinalBill = this.billingForm.value.isSavedBillFinal;
      }

      this.billingService.savePatientBillData(billSaveObj).subscribe(res => {
        if (res.status_message === 'Success') {

          // check bill successfully save or not
          if (!isSaveOnly && res.data && res.data.billDetail) {
            if (res.data.billDetail.msg == 'SUCCESS') {
              const isSpotBill = this.billingForm.value?.isSpotBill || false;
              this.alertMsg = {
                message: (isSpotBill ? 'Spot ' : '') + 'Bill Saved Successfully',
                messageType: 'success',
                duration: Constants.ALERT_DURATION
              };
            } else {
              this.showValidationMsg(res.data.billDetail.msg, 'danger');
            }
          }

          // check any spot bill generated
          if (!isSaveOnly && res.data && res.data.spotBillDetail) {
            if (res.data.spotBillDetail.msg == 'SUCCESS') {
              this.alertMsg = {
                message: 'Spot Bill generated Successfully',
                messageType: 'success',
                duration: Constants.ALERT_DURATION
              };
            } else {
              this.showValidationMsg(res.data.spotBillDetail.msg, 'danger');
            }
          }

          // reload voucher and bill details...
          const billId = this.billingForm.value?.billId;
          if (!billId || res.data.spotBillDetail) {
            this.getAllVoucherList().subscribe(res => {
              resolve(true);
            });
          } else {
            this.billingForm.patchValue({ billId: billId });
            this.getPatientBillById(billId).subscribe(res => {
              resolve(true);
            });
          }

          // // if bill marked as final then redirect to payment screen else reload
          // // As discuss with Anirudh sir, no need to redirect on payment page, already there is payment option on biiling page
          // if (this.billingForm.value?.isFinal && !isSaveOnly && false) {
          //   const isNavigate = this.redirectToBillPayment();
          //   if (isNavigate == false) {
          //     // reload voucher and bill details...
          //     this.getAllVoucherList().subscribe(res => {
          //       resolve(true);
          //     });
          //   }
          // }
        } else {
          this.showValidationMsg('Failed to save bill..');
        }
      });
    });
    return promise;
  }

  getRowNumber(dataGrid, data) {
    let missedRowsNumber = dataGrid.instance.getController('data').virtualItemsCount().begin;
    return data.row.rowIndex + missedRowsNumber + 1;
  }

  initDataGrid(isEditRow?: boolean) {
    this.dataGrid.instance.refresh();

    setTimeout(() => {
      this.dataGrid.focusedRowIndex = this.newRowIndex;
      this.dataGrid.keyboardNavigation.enabled = true;
      if (isEditRow) {
        //let el = this.dataGrid.instance.getCellElement(this.newRowIndex, 'serviceName');
        //this.dataGrid.instance.focus(el);
        this.dataGrid.tabIndex = 3;
        this.dataGrid.instance.editCell(this.newRowIndex, 'serviceName');
      }
    }, 200);
  }

  attachCompServicePopup(rowIndex) {
    this.focusedRowIndex = rowIndex;

    const rowObj = this.billServiceArray[rowIndex];
    const componentObj = {
      service: rowObj.service,
      multiplier: rowObj.multiplier,
      chargingTypeId: this.billingForm.value.activeChargingTypeId,
      attachedCompList: _.cloneDeep(rowObj.attachedCompList),
      doctorListArray: this.doctorListArray,
      isEditMode: rowObj.isEditMode,
      isBillFinal: this.isBillViewOnly,
      isPatientClassChangePage: this.isPatientClassChangePage
    }
    const modalInstance = this.modalService.open(AttachComponentServiceComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false,
        size: 'xl',
        windowClass: "attach-comp-service-popup",
        container: '#homeComponent'
      });
    modalInstance.result.then((result) => {
      if (_.isObject(result) && result != 'cancel') {
        const rowObj = this.billServiceArray[this.focusedRowIndex];
        const oldRate = rowObj.rate;
        rowObj.multiplier = result.multiplier;
        rowObj.rate = _.round((_.sumBy(result.attachedCompList, (o) => { return o.isSelected ? parseFloat(o.totalAmount || 0) : 0; })), 2);
        rowObj.incompleteRateFlag = rowObj.rate <= 0;
        rowObj.attachedCompList = result.attachedCompList;
        rowObj.isRateChanged = oldRate != rowObj.rate;
        this.calculateRowData(this.focusedRowIndex);

        // adjust package discount into bill
        this.adjustPackageDiscIntoBill();
        return;
      } else {
        return;
      }
    });
    modalInstance.componentInstance.componentObj = componentObj;
  }

  allowDeleting(e) {
    return e.component.totalCount() == 1 ? e.row.rowIndex != 0 : true;
  }

  onContentReady(e) {
    e.component.option("loadPanel.enabled", false);
  }

  onCellPrepared(e) {
    if (e.rowType === "data" && e.column.dataField === "serviceType") {
      if (e.data.serviceType == 'COMPONENT') {
        e.cellElement.classList.add("btn-link");
      } else {
        e.cellElement.classList.remove("btn-link");
      }
      e.cellElement.title = e.data.serviceType;
    }
  }

  getFocusedRowIndex(tempId) {
    const focusedRowIndex = _.findIndex(this.billServiceArray, (o) => { return o.tempId == tempId; });
    return focusedRowIndex;
  }

  onFocusedRowChanged(evt) {
    this.focusedRowData = evt.row.data;
    //this.focusedRowIndex = evt.row.rowIndex;
    this.focusedRowIndex = this.getFocusedRowIndex(evt.row.data.tempId); //_.findIndex(this.billServiceArray, (o) => { return o.tempId == evt.row.data.tempId; });
    this.isPopupVisible = false;
    this.serviceCenterDataSource.clearRawDataCache();
    if (this.billingForm.value && this.billingForm.value.showPayDetail) {
      this.billingForm.patchValue({ showPayDetail: false });
    }
  }

  onRowPrepared(e) {
    // reverse service
    if (e.rowType === "data" && e.data.status === 'REVERSE' && (e.data.orderQty < 0 || e.data.amount < 0 || e.data.reverseId > 0)) {
      let classString = e.rowElement.className;
      let isClassExist = classString.indexOf('inactive-row') !== -1;
      if (!isClassExist) {
        e.rowElement.className += ' inactive-row';
      }
    } else if (e.isEditing) {
      let classString = e.rowElement.className;
      let isClassExist = classString.indexOf('inactive-row') !== -1;
      if (isClassExist) {
        classString.replace(' inactive-row', '');
      }
    }

    // non service
    if (e.rowType === "data" && e.data.isNonService) {
      let classString = e.rowElement.className;
      let isClassExist = classString.indexOf('nonservice-row') !== -1;
      if (!isClassExist) {
        e.rowElement.className += ' nonservice-row';
      }
    } else if (e.isEditing) {
      let classString = e.rowElement.className;
      let isClassExist = classString.indexOf('nonservice-row') !== -1;
      if (isClassExist) {
        classString.replace(' nonservice-row', '');
      }
    }

    // incomplete services
    if (e.rowType === "data" && !e.data.isNonService && e.data.billDetailId != 0 && (e.data.incompleteServiceFlag || e.data.incompleteRateFlag)) {
      let classString = e.rowElement.className;
      let isClassExist = classString.indexOf('incomplete-row') !== -1;
      if (!isClassExist) {
        e.rowElement.className += ' incomplete-row';
      }
    } else if (e.isEditing) {
      let classString = e.rowElement.className;
      let isClassExist = classString.indexOf('incomplete-row') !== -1;
      if (isClassExist) {
        classString.replace(' incomplete-row', '');
      }
    }
  }

  onRowRemoving(e) {
    if (e.data.isEditMode && e.data.orderDetailId) {
      e.cancel = true;

      // update service status as REVERSE
      this.UpdateServiceOrderStatusApi(e.data.orderDetailId, 'REVERSE').subscribe(res => {
        if (res == 'success') {
          const rowIndex = this.getFocusedRowIndex(e.data.tempId);
          e.data.status = 'REVERSE';

          // empty concession, admin charge, gst and package disc on service reverse
          const billRowObj = this.billServiceArray[rowIndex];
          billRowObj.amount = billRowObj.orderQty * billRowObj.rate;
          billRowObj.discountType = 'discountAmount';
          billRowObj.discountPercent = 0;
          billRowObj.discountAmount = 0;
          billRowObj.adminChargePercent = 0;
          billRowObj.adminChargeAmount = 0;
          billRowObj.grossAmt = billRowObj.amount;
          billRowObj.gstPercent = 0;
          billRowObj.gstAmount = 0;
          billRowObj.pkgDetailId = 0;
          billRowObj.pkgRowId = '';
          billRowObj.pkgDiscAmt = 0;
          billRowObj.pkgQty = 0;
          billRowObj.pkgRate = 0;
          billRowObj.pkgConDetail = [];
          billRowObj.totNetAmt = billRowObj.amount;
          billRowObj.status = 'REVERSE';

          // add reverse service record into bill
          const reverseRowObj = _.cloneDeep(billRowObj);
          reverseRowObj.orderQty = reverseRowObj.orderQty * -1;
          reverseRowObj.rate = reverseRowObj.rate * -1;
          reverseRowObj.amount = reverseRowObj.amount * -1;
          reverseRowObj.totNetAmt = reverseRowObj.totNetAmt * -1;
          this.billServiceArray.splice(rowIndex + 1, 0, reverseRowObj);

          // if all services are reversed then show all services
          const nonReverseServices = _.find(this.billServiceArray, (o) => { return o.status != 'REVERSE'; });
          if (!nonReverseServices && this.billServiceArray.length > 0) {
            this.statusFilterValues = [];
          }

          this.dataGrid.instance.refresh();

          setTimeout(() => {
            // update package utilization details
            this.adjustPackageDiscIntoBill();
            // calculate bill footer subtotal data..
            this.calculateBillData();
          }, 100);
        }
      });

    } else {
      // on bill row remove if pacakge removed then remove package detail from package array
      if (e.data.service && e.data.service.serviceType == 'PACKAGE') {
        this.removePackageService(e.data.tempId);
      }

      if (this.billServiceArray.length == 1) {
        this.addNewEmptyRow();
      }

      // if all services are reversed then show all services
      const nonReverseServices = _.find(this.billServiceArray, (o) => { return o.status != 'REVERSE'; });
      if (!nonReverseServices && this.billServiceArray.length > 0) {
        this.statusFilterValues = [];
      }

      this.dataGrid.instance.refresh();

      setTimeout(() => {
        // update package utilization details
        this.adjustPackageDiscIntoBill();
        // calculate bill footer subtotal data..
        this.calculateBillData();
      }, 100);

    }
  }

  removePackageService(billRowTempId) {
    _.remove(this.billPackageArray, (o) => {
      return o.billRowTempId == billRowTempId;
    });

    _.remove(this.billServiceArray, (o) => {
      return o.billRowTempId == billRowTempId;
    });
  }

  onEditingStart(evt: any) {
    // After final bill disable all grid fields for edit and net amount all time disable
    // or view only bill and spot bill
    if (evt.column.dataField == 'totNetAmt' || this.isBillViewOnly) {
      evt.cancel = true;
    }
    // disable service column other than last row
    else if (evt.column.dataField == 'serviceName' && (this.focusedRowIndex != this.newRowIndex || this.isPatientClassChangePage || this.isBillViewOnly)) {
      evt.cancel = true;
    }
    // disable all fields if nonservice, status is reverse, or sevice not selected
    else if ((evt.data.isNonService && evt.column.dataField != 'rate' && evt.column.dataField != 'discountPercent' && evt.column.dataField != 'discountAmount')
      || evt.data.status == 'REVERSE' || (evt.column.dataField !== 'serviceName' && !evt.data.service)) {
      evt.cancel = true;
    }
    // disable is spot bill option in edit mode
    else if (evt.data.isEditMode && evt.column.dataField == "isSpotBill") {
      evt.cancel = true;
    }

    // // disable all fields if complete rate flag or is spot bill option in edit mode
    // else if (evt.data.isEditMode && ((!evt.data.incompleteServiceFlag && !evt.data.incompleteRateFlag) || evt.column.dataField == "isSpotBill")) {
    //   evt.cancel = true;
    // }
    // // in edit mode enable only attach doctor service in case of incomplete rate flag
    // else if (evt.data.isEditMode && (evt.data.incompleteServiceFlag || evt.data.incompleteRateFlag
    //   || (evt.column.dataField == 'serviceCenterId' && this.isModifyServiceCenter))
    //   && (evt.column.dataField == 'doctorId' ? !evt.data.service.isDoctorPolicy : true)
    //   && (evt.column.dataField == 'rate' ? !evt.data.service.isModifyRate : true)
    //   && (evt.column.dataField == 'serviceCenterId' ? (!evt.data.incompleteServiceFlag && !evt.data.incompleteRateFlag && !this.isModifyServiceCenter) : true)
    //   ) {
    //     evt.cancel = true;
    // }

    // disable rate, qty fields if service type not equal to NORMAL
    else if (evt.column.dataField == "serviceType" || (evt.data.serviceType != 'NORMAL'
      && (evt.column.dataField == 'doctorId' || evt.column.dataField == "orderQty" || evt.column.dataField == "rate"))) {
      evt.cancel = true;
      if (evt.data.serviceType == 'COMPONENT' && evt.column.dataField == "serviceType") {
        this.getComponentItems(this.focusedRowIndex).subscribe(result => {
          this.attachCompServicePopup(this.focusedRowIndex);
        });
      }
    }

    // disable attach doctor if doctor policy is false
    if (evt.column.dataField == 'doctorId' && evt.data.service && !evt.data.service.isDoctorPolicy) {
      evt.cancel = true;
    }
    // disable attach doctor if doctor policy is false // && evt.data.isEditMode
    else if (evt.column.dataField == 'serviceCenterId' && (!evt.data.isServiceCenterMapped || (evt.data.serviceCenterId && !this.isModifyServiceCenter))) {
      //  && evt.data.isEditMode && !evt.data.incompleteServiceFlag && !evt.data.incompleteRateFlag
      evt.cancel = true;
    }
    // disable rate field if is modify rate is false
    else if (evt.column.dataField == 'rate' && evt.data.service && !evt.data.service.isModifyRate) {
      evt.cancel = true;
    }
    // disable concession fields if is service is fully chargable
    else if ((evt.column.dataField == 'discountPercent' || evt.column.dataField == 'discountAmount') && evt.data.service && evt.data.service.isFullychargeable) {
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
        if (evt.dataField == "orderQty" && arg.event.keyCode == 9 && parseFloat(arg.component.option("text") || 0) <= 0) {
          compInstance.showValidationMsg('Qty should be not be empty');
          //arg.event.preventDefault();
        } else if (evt.dataField == "rate" && arg.event.keyCode == 9 && parseFloat(arg.component.option("text") || 0) <= 0) {
          compInstance.showValidationMsg('Rate should be not be empty');
          //arg.event.preventDefault();
        }
        // else if (evt.dataField == "discountAmount" && arg.event.keyCode == 9
        //   && (evt.row.dataIndex == compInstance.newRowIndex)) {
        //     this.onAddButtonClick(evt);
        //     //arg.event.preventDefault();
        // }
      }
    }

    // on cell value change event fire here
    evt.editorOptions.onValueChanged = (e: any) => {
      evt.setValue(e.value);

      const rowIndex = this.getFocusedRowIndex(evt.row.data.tempId);
      let rowObj = this.billServiceArray[rowIndex];
      let newCellValue = null;

      switch (evt.dataField) {
        case 'serviceName':
          var service = e.component.option("selectedItem");
          if (service && service.serviceType) {
            // remove package services on service change
            if (rowObj.service && rowObj.service.serviceType == 'PACKAGE') {
              this.removePackageService(rowObj.tempId);
            }

            evt.setValue(service);
            rowObj.service = service;
            rowObj.serviceType = service.serviceType;
            rowObj.gstPercent = service.isGST ? _.round(parseFloat(service.gstRate || 0), 2) : 0;
            rowObj.status = service.status;
            rowObj.isSpotBill = service.isSpotBill;
            rowObj.doctorId = null;
            rowObj.doctorName = (service.serviceType == 'NORMAL' && service.isDoctorPolicy) ? '' : 'NA';
            rowObj.adminChargePercent = this.isServiceAdminCharge && service.isAdminCharge ? service.adminChargePercent : 0;
            this.serviceCenterDataSource.clearRawDataCache();

            // if service exists then ask for confirmation else clear
            const seviceExists = _.find(this.billServiceArray, (o, index) => {
              return o.service && o.service.serviceId == rowObj.service.serviceId && index !== rowIndex
                && (o.status != 'CANCEL' && o.status != 'REVERSE');
            });
            if (seviceExists) {
              this.confirmOnAddService(evt, 'duplicate', seviceExists);
            }
            // get all package inclusive service
            else if (rowObj.serviceType == 'PACKAGE') {
              this.confirmOnAddService(evt, 'package', rowObj);
            }
            else {
              this.onServiceChange(evt);
            }
          } else {
            evt.setValue(null);
            this.serviceCenterDataSource.clearRawDataCache();
          }
          this.serviceCenterDataSource.clearRawDataCache();
          break;
        case 'doctorId':
          var doctor = e.component.option("selectedItem");
          rowObj.doctorId = doctor.doctorId;
          rowObj.doctorName = doctor.doctorName;
          newCellValue = rowObj.doctorId;
          break;
        case 'orderDate':
          rowObj.orderDate = new Date(e.value);
          newCellValue = rowObj.orderDate;

          this.updateServiceRate(rowIndex).subscribe(result => {
            // set surcharge type on order date time
            this.updateServiceSurchargeType(rowIndex);
            // on rate change adjust package amount
            this.adjustPackageDiscIntoBill();
          });
          break;
        case 'surchargeTypeId':
          var surcharge = e.component.option("selectedItem");
          rowObj.surchargeTypeId = surcharge.surchargeTypeId;
          rowObj.surchargeType = surcharge.surchargeType;
          newCellValue = rowObj.surchargeTypeId;
          break;
        case 'serviceCenterId':
          var serviceCenter = e.component.option("selectedItem");
          rowObj.serviceCenterId = serviceCenter.serviceCenterId;
          rowObj.serviceCenterName = serviceCenter.serviceCenterName;
          newCellValue = rowObj.serviceCenterId;
          break;
        case 'isSpotBill':
          rowObj.isSpotBill = e.value || false;
          break;
        case 'orderQty':
          rowObj.orderQty = _.round(parseFloat(e.value || 0), 2);
          newCellValue = rowObj.orderQty;
          // clear existing applied package discount
          rowObj.pkgDiscAmt = 0;
          rowObj.pkgQty = 0;
          rowObj.pkgRowId = '';
          rowObj.pkgRate = 0;
          rowObj.pkgConDetail = [];
          break;
        case 'rate':
          const oldRate = rowObj.rate;
          rowObj.rate = _.round(parseFloat(e.value || 0), 2);
          rowObj.incompleteRateFlag = false;
          rowObj.isRateChanged = oldRate != rowObj.rate;
          newCellValue = rowObj.rate;
          // clear existing applied package discount
          rowObj.pkgDiscAmt = 0;
          rowObj.pkgQty = 0;
          rowObj.pkgRowId = '';
          rowObj.pkgRate = 0;
          rowObj.pkgConDetail = [];
          break;
        case 'pkgDiscAmt':
          rowObj.pkgDiscAmt = _.round(parseFloat(e.value || 0), 2);
          newCellValue = rowObj.pkgDiscAmt;
          break;
        case 'discountPercent':
          rowObj.discountEntityType = 'manual';
          rowObj.discountType = 'discountPercent';
          const newDiscountPercent = _.round(parseFloat(e.value || 0), 2);

          // validate discount percent
          if (newDiscountPercent > 100) {
            evt.setValue(100);
            rowObj.discountPercent = 100;
            this.showValidationMsg('Concession should not be greater than 100 percent')
            break;
          }
          rowObj.discountPercent = newDiscountPercent;
          newCellValue = rowObj.discountPercent;
          break;
        case 'discountAmount':
          rowObj.discountEntityType = 'manual';
          rowObj.discountType = 'discountAmount';
          const newDiscountAmount = _.round(parseFloat(e.value || 0), 2);

          // check discount should not greater than applicable amount
          const applicableDiscountAmount = rowObj.amount - rowObj.pkgDiscAmt;
          if (newDiscountAmount > applicableDiscountAmount) {
            evt.setValue(applicableDiscountAmount);
            rowObj.discountAmount = applicableDiscountAmount;
            this.showValidationMsg('Concession should not be greater than 100 percent')
            break;
          }
          rowObj.discountAmount = newDiscountAmount;
          newCellValue = rowObj.discountAmount;
          break;
        case 'status':
          rowObj.status = e.value || '';
          newCellValue = rowObj.status;
          break;
        case 'remark':
          rowObj.remark = e.value || '';
          newCellValue = rowObj.remark;
          break;
      }

      // Update log detail for existing service
      if (newCellValue != null) {
        this.updateLogDetail(rowIndex, evt.dataField, newCellValue);
      }

      this.calculateRowData(rowIndex);

      // adjust package disc into bill
      if (evt.dataField == 'orderQty' || evt.dataField == 'rate') {
        this.adjustPackageDiscIntoBill();
      }

      if (evt.dataField == "discountAmount" && this.lastKeyEventCode == 9
        && (rowIndex == compInstance.newRowIndex)) {
        this.onAddButtonClick(evt);
        this.lastKeyEventCode = 0;
        //arg.event.preventDefault();
      }
      this.verifiedServices = 0;
      _.map(this.billServiceArray, (o) => {
        if (o.isVerify == true && o.orderDetailId != 0) {
          this.verifiedServices++;
        }
      });
      this.dataGrid.instance.refresh();
    }
  }

  confirmOnAddService(evt, confirmType, seviceExists) {
    //event.stopPropagation();
    let modalBodyobj = '';

    // show confirmation for duplicate service
    if (confirmType == 'duplicate') {
      modalBodyobj = seviceExists.service.serviceName + ' service already added by ' + (seviceExists.adduser || 'you')
        + ' on ' + moment(seviceExists.orderDate).format('DD/MM/YYYY hh:mm A') + '. Do you want to add again?';
    }
    // change the confirmation msg for package service
    else if (confirmType == 'package') {
      modalBodyobj = 'Package Concession will be applied to added services. Are you sure want to continue?';
    } else {
      return;
    }

    const messageDetails = {
      modalTitle: 'Confirm',
      modalBody: modalBodyobj,
      buttonType: 'yes_no',
    };
    const modalInstance = this.ngbModal.open(ConfirmationPopupComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false
      });
    modalInstance.result.then((result) => {
      if (result == 'yes') {
        this.onServiceChange(evt);
      } else {
        this.clearServiceSelection(evt);
      }
    });
    modalInstance.componentInstance.messageDetails = messageDetails;
  }

  clearServiceSelection(evt) {
    // clear service row ...
    const rowIndex = this.getFocusedRowIndex(evt.row.data.tempId);
    const rowObj = this.billServiceArray[rowIndex];
    const serviceObj = new BillServiceModel();
    serviceObj.generateObject({ tempId: rowObj.tempId });
    this.billServiceArray[rowIndex] = serviceObj;

    // clear cell value and refresh grid
    evt.setValue(serviceObj.service);
    this.dataGrid.instance.refresh();
    this.dataGrid.instance.editCell(rowIndex, 'serviceName');

    // adjust package discount
    this.adjustPackageDiscIntoBill();
  }

  onServiceChange(evt) {
    const rowIndex = this.getFocusedRowIndex(evt.row.data.tempId);
    let rowObj = this.billServiceArray[rowIndex];
    rowObj.serviceName = rowObj.service ? rowObj.service.serviceName : '';
    // clear existing applied package discount
    rowObj.pkgDiscAmt = 0;
    rowObj.pkgQty = 0;
    rowObj.pkgRowId = '';
    rowObj.pkgRate = 0;
    rowObj.pkgConDetail = [];

    // Fetch service surcharge, rate and open attach component service detail popup if service type is component
    this.updateServiceRate(rowIndex).subscribe(result => {
      // check service rate defined or not and allow user to modfify rate
      if (rowObj.service && rowObj.service.serviceType != 'COMPONENT' && !result.isRateDefined && !result.rate) {
        if (!rowObj.service.isModifyRate) {
          this.clearServiceSelection(evt);
        }
        this.showValidationMsg('Tariff Not defined');
        return false;
      }

      // if rate is defined then allow user to add other details
      this.populateSurchargeData([rowObj.service.serviceId]).subscribe(result => {
        // load component list popup with selected component services
        if (rowObj.serviceType == 'COMPONENT') {
          const isComponentChanged = _.find(rowObj.attachedCompList, (o) => { return o.serviceId != rowObj.service.serviceId; });
          if (isComponentChanged) {
            rowObj.attachedCompList = [];
          }
          this.getComponentItems(rowIndex).subscribe(result => {
            this.attachCompServicePopup(rowIndex);
          });
        }
        // set surcharge type on order date time
        this.updateServiceSurchargeType(rowIndex);

        // set default service center on service selection
        if (rowObj.service?.serviceId) {
          this.setDefaultServiceCenter(rowIndex);
        }

        // update package detail into bill
        if (rowObj.serviceType == 'PACKAGE') {
          this.getPackageDetailsById(rowObj.service.serviceId, rowObj.tempId).subscribe(res => {
            if (res && res.length && (this.billingForm.value.selectedPatient.penType == 'OP'
              || this.billingForm.value.selectedPatient.penType == 'ER')) {
              this.addPackageServiceIntoBill(res, rowIndex);
            }
            // after confirmation > update package utilization details into bill
            else {
              this.adjustPackageDiscIntoBill();
            }
          });
        } else {
          this.adjustPackageDiscIntoBill();
        }
      });
    });
  }

  updateLogDetail(rowIndex, dataField, newValue, prevValue?) {
    const rowObj: BillServiceModel = this.billServiceArray[rowIndex];
    if (rowObj.isEditMode && prevValue != newValue) {
      const oldRowObj: BillServiceModel = _.find(this.cloneBillServiceArray, (o) => { return o.billDetailId == rowObj.billDetailId });
      if (!oldRowObj) {
        return;
      }

      switch (dataField) {
        case 'serviceName':
          rowObj.logDetail = '';
          break;
        case 'doctorId':
          if (oldRowObj.doctorId != rowObj.doctorId) {
            rowObj.logDetail += (rowObj.logDetail ? ' || ' : '');
            rowObj.logDetail += 'Attached Doctor changed > Prev: ' + oldRowObj.doctorName + ', New: ' + rowObj.doctorName;
          }

          break;
        case 'orderDate':
          if (oldRowObj.doctorId != rowObj.doctorId) {
            rowObj.logDetail += (rowObj.logDetail ? ' || ' : '');
            rowObj.logDetail += 'Order Date changed > Prev: ' + oldRowObj.orderDate + ', New: ' + rowObj.orderDate;
          }
          break;
        case 'surchargeTypeId':
          if (oldRowObj.surchargeTypeId != rowObj.surchargeTypeId) {
            rowObj.logDetail += (rowObj.logDetail ? ' || ' : '');
            rowObj.logDetail += 'Surcharge Type changed > Prev: ' + oldRowObj.surchargeType + ', New: ' + rowObj.surchargeType;
          }
          break;
        case 'serviceCenterId':
          if (oldRowObj.serviceCenterId != rowObj.serviceCenterId) {
            rowObj.logDetail += (rowObj.logDetail ? ' || ' : '');
            rowObj.logDetail += 'Service Center changed > Prev: ' + oldRowObj.serviceCenterName + ', New: ' + rowObj.serviceCenterName;
          }
          break;
        case 'orderQty':
          if (oldRowObj.orderQty != rowObj.orderQty) {
            rowObj.logDetail += (rowObj.logDetail ? ' || ' : '');
            rowObj.logDetail += 'Order Qty changed > Prev: ' + oldRowObj.orderQty + ', New: ' + rowObj.orderQty;
          }
          break;
        case 'rate':
          if (oldRowObj.rate != rowObj.rate) {
            rowObj.logDetail += (rowObj.logDetail ? ' || ' : '');
            rowObj.logDetail += 'Service Rate changed > Prev: ' + oldRowObj.rate + ', New: ' + rowObj.rate;
          }
          break;
        case 'pkgDiscAmt':
          if (oldRowObj.pkgDiscAmt != rowObj.pkgDiscAmt) {
            rowObj.logDetail += (rowObj.logDetail ? ' || ' : '');
            rowObj.logDetail += 'Package Concession changed > Prev: ' + oldRowObj.pkgDiscAmt + ', New: ' + rowObj.pkgDiscAmt;
          }
          break;
        case 'discountPercent':
          if (oldRowObj.discountPercent != rowObj.discountPercent) {
            rowObj.logDetail += (rowObj.logDetail ? ' || ' : '');
            rowObj.logDetail += 'Concession Percent changed > Prev: ' + oldRowObj.discountPercent + ', New: ' + rowObj.discountPercent;
          }
          break;
        case 'discountAmount':
          if (oldRowObj.discountAmount != rowObj.discountAmount) {
            rowObj.logDetail += (rowObj.logDetail ? ' || ' : '');
            rowObj.logDetail += 'Concession Amount changed > Prev: ' + oldRowObj.discountAmount + ', New: ' + rowObj.discountAmount;
          }
          break;
        case 'status':
          if (oldRowObj.status != rowObj.status) {
            rowObj.logDetail += (rowObj.logDetail ? ' || ' : '');
            rowObj.logDetail += 'Status changed > Prev: ' + oldRowObj.status + ', New: ' + rowObj.status;
          }
          break;
        case 'remark':
          if (oldRowObj.remark != rowObj.remark) {
            rowObj.logDetail += (rowObj.logDetail ? ' || ' : '');
            rowObj.logDetail += 'Remark changed > Prev: ' + oldRowObj.remark + ', New: ' + rowObj.remark;
          }
          break;
      }

      if (oldRowObj.logDetail != rowObj.logDetail) {
        rowObj.isDirty = true;
      }
    }
  }

  calculateRowData(rowIndex) {
    let rowObj = this.billServiceArray[rowIndex];
    rowObj.amount = _.round((rowObj.orderQty * rowObj.rate), 2);
    const amountAfterPckDisc = _.round((rowObj.amount - rowObj.pkgDiscAmt), 2);

    // calculate admin charge before concession
    let serviceAdminCharges = 0;
    if (this.isServiceAdminCharge && this.serviceAdminChargeBeforeCons && rowObj.adminChargePercent > 0) {
      serviceAdminCharges = _.round((amountAfterPckDisc * rowObj.adminChargePercent) / 100, 2);
    }

    // service amount after admin charges
    let serviceAmountAfterAdminCharge = amountAfterPckDisc + serviceAdminCharges;

    // discount amount and percent calculation
    if (rowObj.discountType == 'discountPercent') {
      rowObj.discountAmount = _.round(((serviceAmountAfterAdminCharge * rowObj.discountPercent) / 100), 2).toFixed(2);
    } else if (rowObj.discountType != 'discountPercent') {
      rowObj.discountType = 'discountAmount'
      rowObj.discountPercent = serviceAmountAfterAdminCharge ? _.round(((rowObj.discountAmount * 100) / serviceAmountAfterAdminCharge), 2).toFixed(2) : 0;
      rowObj.discountAmount = rowObj.discountAmount || 0;
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
    rowObj.totNetAmt = (_.round((rowObj.grossAmt + rowObj.gstAmount - rowObj.refundedAmount), 2) || 0);

    // calculate bill footer subtotal data..
    this.calculateBillData();
  }

  calculateSelectedRow(options) {
    //const compInstance = this;
    if (options.name === "totalAmountSummary") {
      if (options.summaryProcess === "start") {
        options.totalValue = 0;
      } else if (options.summaryProcess === "calculate") {
        options.totalValue = _.round(parseFloat(options.totalValue + options.value.amount), 2);
      }
    } else if (options.name === "totalGstAmountSummary") {
      if (options.summaryProcess === "start") {
        options.totalValue = 0;
      } else if (options.summaryProcess === "calculate") {
        options.totalValue = _.round(parseFloat(options.totalValue + options.value.gstAmount), 2);
      }
    } else if (options.name === "totalNetAmountSummary") {
      if (options.summaryProcess === "start") {
        options.totalValue = 0;
      } else if (options.summaryProcess === "calculate") {
        options.totalValue = _.round(parseFloat(options.totalValue + options.value.netAmount), 2);
      }
    } else if (options.name === "grandTotalSummary") {
      if (options.summaryProcess === "start") {
        options.totalValue = 0;
      } else if (options.summaryProcess === "calculate") {
        //options.totalValue = _.round(parseFloat(options.totalValue + options.value.netAmount), 2);
      }
    }
  }

  updateBillCalType(type) {
    if (type == 'discountPercent' || type == 'discountAmount') {
      this.billingForm.patchValue({ discountType: type });
    } else if (type == 'gstPercent' || type == 'gstAmount') {
      this.billingForm.patchValue({ gstType: type });
    }

    // validate perncent and amount
    if (type == 'discountPercent' && this.billingForm.value.discountPercent > 100) {
      this.billingForm.patchValue({ discountPercent: 100 });
      this.showValidationMsg('Concession should not be greater than 100 percent')
    } else if (type == 'gstPercent' && this.billingForm.value.gstPercent > 100) {
      this.billingForm.patchValue({ gstPercent: 100 });
      this.showValidationMsg('GST should not be greater than 100 percent')
    }

    if (type == 'discountAmount') {
      const billAmount = parseFloat(this.billingForm.value.billAmount || 0);
      const adminChargesAmt = parseFloat(this.billAdminChargeBeforeCons ? (this.billingForm.value.adminChargesAmt || 0) : 0);
      const categoryConcAmt = parseFloat(this.billingForm.value.categoryConcAmt || 0);
      const discountApplicableAmount = billAmount + adminChargesAmt + categoryConcAmt;
      // check discount should not greater than applicable amount
      if (this.billingForm.value.discountAmount > discountApplicableAmount) {
        this.billingForm.patchValue({ discountAmount: discountApplicableAmount });
        this.showValidationMsg('Concession should not be greater than 100 percent')
      }
    }
    else if (type == 'gstAmount') {
      const billAmount = parseFloat(this.billingForm.value.billAmount || 0);
      const adminChargesAmt = parseFloat(this.billingForm.value.adminChargesAmt || 0);
      const categoryConcAmt = parseFloat(this.billingForm.value.categoryConcAmt || 0);
      const discountAmount = parseFloat(this.billingForm.value.discountAmount || 0);
      const gstApplicableAmount = billAmount + adminChargesAmt + categoryConcAmt + discountAmount;
      // check gst should not greater than applicable amount
      if (this.billingForm.value.gstAmount > gstApplicableAmount) {
        this.billingForm.patchValue({ gstAmount: gstApplicableAmount });
        this.showValidationMsg('GST should not be greater than 100 percent')
      }
    }

    this.calculateBillData();
  }

  calculateBillData() {
    // *** ADMIN CHARGE RULES ****
    // IP and ER patient --> admin charges apply on service level and bill level
    // OP patient --> admin charges apply on service level only
    const isOpPatient = this.billingForm.value.selectedPatient.penType == 'OP';
    const isSpotBill = this.isSpotBill;
    const fixedBillAmount = parseFloat(this.billingForm.value.selectedPatient.penFixBillTotalAmt || 0);
    const gridData = isSpotBill ? this.billServiceArray : _.filter(this.billServiceArray, (o) => { return o.isSpotBill == false; });

    // set bill level discount as zero if fixed amount package applied for encounter
    if (!isOpPatient && !isSpotBill && fixedBillAmount > 0) {
      this.billingForm.patchValue({ discountType: 'discountAmount' });
      this.billingForm.patchValue({ discountPercent: 0 });
      this.billingForm.patchValue({ discountAmount: 0 });
    }

    // check service level gst applied or not
    const isServiceLevelGstApply = _.find(gridData, (o) => { return parseFloat(o.gstAmount || 0) > 0; });
    this.billingForm.patchValue({ isGstApplicable: !isServiceLevelGstApply });

    // bill amount is grid net amount sum
    const grossAmount = _.round(_.sumBy(gridData, (o) => { return (o.status != 'REVERSE' && o.status != 'CANCELLED') ? parseFloat(o.amount || 0) : 0; }), 2);
    this.billingForm.patchValue({ grossAmount: grossAmount || 0 });

    // bill amount is grid net amount sum
    const billAmount = _.round(_.sumBy(gridData, (o) => { return parseFloat(o.totNetAmt || 0); }), 2);
    this.billingForm.patchValue({ billAmount: billAmount || 0 });

    // calculate admin charge before concession
    let adminChargeAppBillAmount = _.round(_.sumBy(gridData, (o) => {
      return ((o.isNonService && o.service && o.service.isAdminCharge) || o.adminChargeAmount > 0) ? 0 : parseFloat(o.totNetAmt || 0);
    }), 2);

    // skip admin charges for OP patient
    let billAdminCharges = 0;
    if (!isOpPatient && !isSpotBill && this.isBillAdminCharge && this.billAdminChargeBeforeCons && this.billAdminChargePercent > 0) {
      billAdminCharges = _.round((adminChargeAppBillAmount * this.billAdminChargePercent) / 100, 2);
    }

    // bill amount after admin charges
    let billAmountAfterAdminCharge = billAmount + billAdminCharges;

    // patient category concession
    const categoryConcPer = _.round((this.billingForm.value.selectedPatient.penCategoryConcession), 2);
    this.billingForm.patchValue({ categoryConcPer: categoryConcPer || 0 });

    // calculate category concession amount on bill amount
    const categoryConcAmt = _.round((billAmountAfterAdminCharge * categoryConcPer) / 100, 2);
    this.billingForm.patchValue({ categoryConcAmt: categoryConcAmt || 0 });

    // bill amount after category concession
    const billAmountAfterCatCons = _.round((billAmountAfterAdminCharge - categoryConcAmt), 2)

    // bill discount calculation as per discount type
    const discountType = this.billingForm.value.discountType;
    let discountPercent = parseFloat(this.billingForm.value.discountPercent);
    let discountAmount = parseFloat(this.billingForm.value.discountAmount);

    if (discountType == 'discountPercent') {
      discountAmount = _.round((billAmountAfterCatCons * discountPercent) / 100, 2);
      this.billingForm.patchValue({ discountAmount: discountAmount });
    } else {
      const discountPercent = billAmountAfterCatCons ? _.round((discountAmount * 100) / billAmountAfterCatCons, 2) : 0;
      this.billingForm.patchValue({ discountPercent: discountPercent });
    }

    // bill amount after concession
    let billAmountAfterDiscount = _.round(billAmountAfterCatCons - discountAmount, 2);

    // calculate admin charge after concession - skip for OP patient
    if (!isOpPatient && !isSpotBill && this.isBillAdminCharge && !this.billAdminChargeBeforeCons && this.billAdminChargePercent > 0) {
      // take applicable admin charge bill amount by skiping admin charge services
      adminChargeAppBillAmount = _.round(adminChargeAppBillAmount - categoryConcAmt - discountAmount, 2)
      billAdminCharges = _.round((adminChargeAppBillAmount * this.billAdminChargePercent) / 100, 2);

      // bill amount after admin charges
      billAmountAfterAdminCharge = _.round(billAmountAfterDiscount + billAdminCharges, 2);
      this.billingForm.patchValue({ adminChargeAppBillAmount: adminChargeAppBillAmount });

      // update bill amount after discount + admin charge = net Amount
      billAmountAfterDiscount = billAmountAfterAdminCharge;
    }

    // set bill admin charges percent and amount
    this.billingForm.patchValue({ adminChargeAppBillAmount: (!isOpPatient && !isSpotBill ? adminChargeAppBillAmount : 0) });
    this.billingForm.patchValue({ adminChargesPer: (!isOpPatient && !isSpotBill ? this.billAdminChargePercent : 0) });
    this.billingForm.patchValue({ adminChargesAmt: billAdminCharges });


    // check bill amount exceed the fixed package amount applied on encounter then settle using bill discount
    if (!isOpPatient && !isSpotBill && fixedBillAmount > 0 && billAmountAfterDiscount > fixedBillAmount) {
      const billDiscountAmount = billAmountAfterDiscount - fixedBillAmount;
      const billDiscountPercent = billAmountAfterDiscount ? _.round((billDiscountAmount * 100) / billAmountAfterDiscount, 2) : 0;
      this.billingForm.patchValue({ discountPercent: billDiscountPercent });
      this.billingForm.patchValue({ discountAmount: billDiscountAmount });
      billAmountAfterDiscount = billAmountAfterDiscount - billDiscountAmount;
    }

    // bill net amount
    const netAmount = billAmountAfterDiscount;
    this.billingForm.patchValue({ netAmount: netAmount });

    // bill gst calculation as per gst type
    let billGstPercent = 0;
    let billGstAmount = 0;

    if (!isServiceLevelGstApply) {
      // calculate gst amount and percent
      const gstType = this.billingForm.value.gstType;
      billGstPercent = parseFloat(this.billingForm.value.gstPercent);
      billGstAmount = parseFloat(this.billingForm.value.gstAmount);

      if (gstType == 'gstPercent') {
        billGstAmount = _.round((netAmount * billGstPercent) / 100, 2);
      } else {
        billGstPercent = netAmount ? _.round((billGstAmount * 100) / netAmount, 2) : 0;
      }
    }

    // set billing gst details
    this.billingForm.patchValue({ gstPercent: billGstPercent });
    this.billingForm.patchValue({ gstAmount: billGstAmount });

    // final net amount after gst
    const finalNetAmount = _.round(netAmount + billGstAmount, 2);
    this.billingForm.patchValue({ finalNetAmount: finalNetAmount });

    // insurance amount, advanced amount, settled amount to calculate balance amount
    const insuranceAmount = _.round((this.billingForm.value.insuranceAmount || 0), 2);
    const advanceAdjustmentAmt = _.round((this.billingForm.value.advanceAdjustmentAmt || 0), 2);
    const settledAmount = _.round((this.billingForm.value.settledAmount || 0), 2);
    const refundedAmount = _.round((this.billingForm.value.refundedAmount || 0), 2);
    const balanceAmount = _.round(finalNetAmount - insuranceAmount - advanceAdjustmentAmt - settledAmount + refundedAmount, 2);
    //this.billingForm.patchValue({ balanceAmount: balanceAmount });

    // write off amount
    const isWriteOff = this.billingForm.value.isWriteOff || false;
    let writeOffAmount = 0;
    if (isWriteOff) {
      writeOffAmount = parseFloat(this.billingForm.value.writeOffAmount);
    }

    // net payable calculate....
    const netPayableAmount = _.round(balanceAmount - writeOffAmount, 2);
    this.billingForm.patchValue({ netPayableAmount: netPayableAmount });

    // update patient bill credit approved amount sum of tentative request amount
    const creditApprovedAmount = _.round(_.sumBy(this.insuranceDetailArray, (o) => { return parseFloat(o.policyRequestAmount);}), 2);
    this.billingForm.patchValue({ creditApprovedAmount: creditApprovedAmount });

    // update patient bill credit approved balance amount - sum of request final approved amount
    const creditApprovedBalance = _.round(_.sumBy(this.insuranceDetailArray, (o) => { return parseFloat(o.policyApprovedAmount);}), 2);
    this.billingForm.patchValue({ creditApprovedBalance: creditApprovedBalance });

    // update payment status based on net payable
    // const paymentStatus = netPayableAmount > 0 ? "PAYMENT DUE" : netPayableAmount < 0 ? "PAYMENT REFUND" : "SETTLED";
    // this.billingForm.patchValue({ paymentStatus: paymentStatus });

    // populate grid service name filter data
    this.populateHeaderFilterServiceData();
  }

  showValidationMsg(msg, messageType?) {
    this.alertMsg = {
      message: msg,
      messageType: messageType || 'warning',
      duration: Constants.ALERT_DURATION
    };
  }

  validateRowDetail(rowIndex) {
    let flag = '';
    let rowObj = this.billServiceArray[rowIndex];

    // validation will be check for service order and non edited and old records if rate flag is incomplete
    if (!rowObj.isNonService && (!rowObj.isEditMode || (rowObj.isEditMode && (rowObj.incompleteServiceFlag || rowObj.incompleteRateFlag) && rowObj.status != 'REVERSE'))) {
      if (!rowObj.service || (rowObj.service && !rowObj.service.serviceId && !rowObj.service.serviceName)) {
        this.showValidationMsg('Service name is required');
        flag = 'serviceName';
      } else if (rowObj.serviceType == 'NORMAL' && rowObj.service.isDoctorPolicy && (!rowObj.doctorId || rowObj.doctorId <= 0)) {
        this.showValidationMsg('Please Attach Doctor');
        flag = 'doctorId';
      } else if (rowObj.serviceType !== 'PACKAGE' && rowObj.isServiceCenterMapped && rowObj.serviceCenterId <= 0) {
        this.showValidationMsg('Please Attach Service Center');
        flag = 'serviceCenterId';
      } else if (!rowObj.orderQty || rowObj.orderQty <= 0) {
        this.showValidationMsg('Qty is required');
        flag = 'qty';
      } else if (rowObj.incompleteRateFlag && (!rowObj.rate || rowObj.rate <= 0)) {
        this.showValidationMsg('Rate is required');
        flag = 'rate';
      }

      // if any required fields are not attached with component then open that component
      if (rowObj.serviceType == 'COMPONENT') {
        let isInValid = '';
        _.map(rowObj.attachedCompList, (o, index) => {
          if (!isInValid) {
            isInValid = this.validateComponentRowDetail(rowObj.attachedCompList, index);
          }
        });
        if (isInValid) {
          this.attachCompServicePopup(rowIndex);
          return isInValid;
        }
      }
    }

    if (flag) {
      let el = this.dataGrid.instance.getCellElement(rowIndex, flag);
      this.dataGrid.instance.focus(el);
      this.dataGrid.instance.editCell(rowIndex, flag);
    }
    return flag;
  }

  validateComponentRowDetail(attachedCompList, rowIndex) {
    let flag = '';
    let rowObj = attachedCompList[rowIndex];
    if (!rowObj.componentId || !rowObj.componentName) {
      this.showValidationMsg('Component name is required');
      flag = 'componentId';
    } else if (!rowObj.orderQty || rowObj.orderQty <= 0) {
      this.showValidationMsg('Component Service Qty is required');
      flag = 'orderQty';
    } else if (rowObj.isDoctorPolicy && (!rowObj.doctorId || !rowObj.doctorName)) {
      this.showValidationMsg('Component Service Attach Doctor is required');
      flag = 'doctorId';
    }
    return flag;
  }

  isAddIconVisible(e) {
    return this.isBillViewOnly ? false : e.row.rowIndex === this.newRowIndex;
  }

  isDeleteIconVisible(e) {
    return this.isBillViewOnly ? !e.row.data.isEditMode : (!this.isBillViewOnly && (!e.row.data.isNonService && e.row.data.status !== 'REVERSE'));
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

  private get isSpotBill() {
    let isSpotBill = this.billingForm.value?.isSpotBill || false;
    if (!isSpotBill) {
      const gridData = _.filter(this.billServiceArray, (o) => { return o.isSpotBill == true; });
      isSpotBill = gridData.length == this.billServiceArray.length;
    }
    return isSpotBill || false;
  }

  private get isBillViewOnly() {
    const isCancelledBill = this.billingForm.value.status == 'CANCELLED';
    const isSavedBillFinal = this.billingForm.value.isSavedBillFinal;
    const paymentStatus = this.billingForm.value.paymentStatus;
    const isBillViewOnly = (isCancelledBill || this.isSpotBill || (!this.isEditBillAfterFinal && isSavedBillFinal && paymentStatus != 'SETTLED')
      || (!this.isEditBillAfterSettle && isSavedBillFinal)); // && paymentStatus == 'PAYMENT DUE' && paymentStatus == 'SETTLED'
    return isBillViewOnly;
  }

  addNewEmptyRow() {
    const serviceObj = new BillServiceModel();
    serviceObj.generateObject({});
    this.billServiceArray.splice(this.newRowIndex, 0, serviceObj);

    this.initDataGrid(true);
  }

  // Class changes related  ----- Started

  getChargingTypeList(visitType): Observable<any> {
    return this.billingService.GetChargingTypeList(visitType).pipe(map(res => {
      this.chargingTypeList = res;
      if (this.chargingTypeList.length > 1) {
        _.remove(this.chargingTypeList, (o) => {
          return o.chargingId == this.billingForm.value.selectedPatient.orginalChargingTypeId;
        });
      }
      return res;
    }));
  }

  getCategoryTypeList(chargingtypeId: any, visitType: string): Observable<any> {
    return this.billingService.GetCategoryTypeList(chargingtypeId, visitType).pipe(map(res => {
      this.categoryTypeList = res;
      if (this.chargingTypeList.length == 1 && this.categoryTypeList.length > 1) {
        _.remove(this.categoryTypeList, (o) => {
          return o.id == this.billingForm.value.selectedPatient.penCategoryId;
        });
      }
      return res;
    }));
  }

  getSelectedChargingType(event) {
    if (event && event.chargingId !== 0) {
      let selectedPatient = this.billingForm.value.selectedPatient;
      selectedPatient.activeChargingTypeId = event.chargingId;
      selectedPatient.activeChargingType = event.chargingType;

      const visitType = this.billingForm.value?.selectedPatient.penType
      this.categoryTypeList = [];
      this.getCategoryTypeList(event.chargingId, visitType).subscribe();
      this.categoryTypeList.unshift({ id: -1, name: "Select Category" });
      this.activeCategoryTypeId = -1;
      return;
    }
  }

  getSelectedCategoryType(event) {
    let selectedPatient = this.billingForm.value.selectedPatient;
    selectedPatient.penCategoryId = event.id;
    selectedPatient.penCategory = event.name;
    selectedPatient.penCategoryConcession = event.categoryConcession;
    this.billingForm.patchValue({ selectedPatient: selectedPatient });
    this.cloneBillServiceArrayBeforeClassChange = JSON.parse(JSON.stringify(this.billServiceArray));
    this.isPatientClassChange = true;
  }

  cancelSelectedChargingType() {

  }

  getNewServiceRate(): Observable<any> {
    let selectedPatient = this.billingForm.value.selectedPatient;
    // apply rate to old rate

    _.map(this.billServiceArray, (o) => {
      o.oldRate = o.rate;
      // if (o.service.serviceId && !o.isRateChanged && o.status != "REVERSE" && o.status != "CANCEL") {
      //   const reqParams = {
      //     srvId: o.service.serviceId,
      //     chargingTypeId: selectedPatient.activeChargingTypeId || 0,
      //     custId: selectedPatient.penCategoryId,
      //     doctorId: o.doctorId || 0,
      //     orderDateTime: o.orderDate,
      //     tempId: o.tempId
      //   }
      //   param.push(reqParams);
      // }
    });
    const billId = this.billingForm.value?.billId || 0;
    const reqParams = {
      billId: billId,
      chargingTypeId: selectedPatient.activeChargingTypeId || 0,
      categoryId: selectedPatient.penCategoryId,
    }
    return this.billingService.GetBillServiceRates(reqParams).pipe(map(res => {
      // Check if proforma attached, so remove this from service array
      // _.map(this.billPackageArray, (r) => {
      //   if (r.proformaId != null && r.proformaId > 0 && r.billDetailId != null && r.billDetailId > 0) {
      //     let rowIndex = _.findIndex(this.billServiceArray, (o) => o.billDetailId == r.billDetailId);
      //     let billRowTempId = this.billServiceArray[rowIndex].tempId;
      //     _.remove(this.billServiceArray, (o) => {
      //       return o.tempId == billRowTempId;
      //     });
      //     this.calculateRowData(rowIndex);
      //   }
      // });
      this.billPackageArray = [];
      // fetch rate against new patient class
      _.map(res.srvRates, (r) => {
        let rowIndex = _.findIndex(this.billServiceArray, (o) => o.billDetailId == r.billDetailId);
        let isRateChanged = this.billServiceArray[rowIndex].isRateChanged;
        let status = this.billServiceArray[rowIndex].status;
        if (rowIndex != -1 && !isRateChanged && status != "REVERSE" && status != "CANCEL") {
          const rowObj = this.billServiceArray[rowIndex];
          rowObj.rate = r.rate;
          rowObj.incompleteRateFlag = !r.isRateDefined;
          rowObj.isDirty = true;
          this.calculateRowData(rowIndex);
        }
      });
      this.getNewPackageRate(res.packageData)
      this.getNewComponentRate(res.componentData);
      return res;
    }));
  }

  getNewPackageRate(res: any) {
    this.billPackageArray = [];
    _.map(res, (r) => {
      let rowIndex = _.findIndex(this.billServiceArray, (o) => o.billDetailId == r.billDetailId);
      if (rowIndex != -1 && r.pkgDetail.length > 0) {
        let billRowTempId = this.billServiceArray[rowIndex].tempId;
        const tempArray = [];
        _.map(r.pkgDetail, (d) => {
          const tempObj = new PackageDetailModel();
          tempObj.generateObject(d, billRowTempId);
          tempArray.push({ ...tempObj });
        });
        this.billPackageArray = _.sortBy(_.uniq(this.billPackageArray.concat(tempArray)), 'sequence');
        this.calculateRowData(rowIndex);
      }
    });
  }

  getNewComponentRate(res: any) {
    _.map(res, (r) => {
      let rowIndex = _.findIndex(this.billServiceArray, (o) => o.billDetailId == r.billDetailId);
      if (rowIndex != -1 && r.componentList.length > 0) {
        const tempArray = [];
        _.map(r.componentList, (d) => {
          const tempObj = new ServiceComponentItemModel();
          if (tempObj.isObjectValid(d)) {
            tempObj.generateObject(d);
            tempArray.push(tempObj);
          }
        });
        const rowObj = this.billServiceArray[rowIndex];
        rowObj.attachedCompList = tempArray;
        this.calculateRowData(rowIndex);
      }
    });
  }

  applyPatientClass() {
    let selectedPatient = this.billingForm.value.selectedPatient;
    if (selectedPatient.activeChargingTypeId == selectedPatient.orginalChargingTypeId && this.chargingTypeList.length > 1) {
      this.alertMsg = {
        message: "Please select Patient Class/Category",
        messageType: "warning",
        duration: Constants.ALERT_DURATION
      };
    } else {
      this.getNewServiceRate().subscribe(res => {
        this.calculateBillData();
        this.isPatientClassChangeFinal = true;
      });
    }
  }
  // Class changes related - END

  // Patiebt Bill Payment Code started ----------------------------------------

  billPayment() {
    let visitType = this.billingForm && this.billingForm.value && this.billingForm.value.selectedPatient ? this.billingForm.value.selectedPatient.penType : '';
    const billId = this.billingForm.value?.billId || 0;
    const billNo = this.billingForm.value?.billNo || '';
    const netPayableAmount = this.billingForm.value?.netPayableAmount || 0;
    const modalInstance = this.modalService.open(BillPaymentComponent, {
      ariaLabelledBy: 'modal-basic-title',
      keyboard: false,
      size: 'xl',
      windowClass: "bill-payment-popup",
      container: '#homeComponent',
      // backdrop: 'static',
    });

    modalInstance.componentInstance.patientData = {
      penId: this.billingForm.value.selectedPatient.penId,
      uhId: this.billingForm.value.selectedPatient.uhid,
      patientInfo: this.billingForm.value.selectedPatient,
      visitType: visitType,
      billId: billId,
      billNo: billNo,
      billAmount: netPayableAmount,
      isBillViewOnly: this.isBillViewOnly
    };
    modalInstance.componentInstance.saveBillPaymentEvent.subscribe((res: any) => {
      if (billId != 0 && billNo != '') {//if BillId and and BillNo are available
        //this.billPaymentReqParam = { ...e };
        //this.savePatientBillPayment(e);
        this.alertMsg = {
          message: 'Bill payment saved successfully',
          messageType: 'success',
          duration: Constants.ALERT_DURATION
        };
        // reload voucher and bill details...
         const billId = this.billingForm.value.billId;
         this.billingForm.patchValue({ billId: billId });
         this.getPatientBillById(billId).subscribe();
      }
    });
    modalInstance.componentInstance.updateSettledAmtEvent.subscribe((e: any) => {
      if (billId != 0 && billNo != '') {//if BillId and and BillNo are available
        this.billingForm.patchValue({ settledAmount: _.round((this.originalSetteledAmt + e.amount), 2) });
        this.billingForm.patchValue({ netPayableAmount: _.round((this.originalFinalBillAmt - (this.originalSetteledAmt + e.amount)), 2) });
      }
    });
    modalInstance.result.then((result) => {
      if (result === true) {

      }
    });
  }

  savePatientBillPayment(param: any) {
    this.billingService.AddEditPatientPaymentDetails(param).subscribe(res => {
      this.alertMsg = {
        message: 'Bill payment saved successfully',
        messageType: 'success',
        duration: Constants.ALERT_DURATION
      };
    });
  }

  cancelBill() {
    const messageDetails = {
      modalTitle: 'Confirm',
      modalBody: 'Are you sure want to cancel bill?',
      buttonType: 'yes_no',
    };
    const modalInstance = this.ngbModal.open(ConfirmationPopupComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false
      });
    modalInstance.result.then((result) => {
      if (result == 'yes') {
        this.cancelPatientBill();
      }
    });
    modalInstance.componentInstance.messageDetails = messageDetails;

  }

  cancelPatientBill() {
    const billId = this.billingForm.value?.billId || 0;
    let orderIds = [];
    _.map(this.billServiceArray, (o) => {
      if (o.status != "REVERSE" && o.status != "CANCEL" && o.orderDetailId != 0) {
        orderIds.push(o.orderDetailId)
      }
    });
    const param = {
      billMainId: billId,
      serviceOrderId: orderIds
    };
    this.billingService.cancelPatientBill(param).subscribe(res => {
      if (res.status_message === 'Success') {
        this.alertMsg = {
          message: 'Bill Cancelled Successfully',
          messageType: 'success',
          duration: Constants.ALERT_DURATION
        };
         // reload voucher and bill details...
         this.billingForm.patchValue({ billId: billId });
         this.getPatientBillById(billId).subscribe();
      }
    });
  }

  // Patient Bill Additional Concession Code started ----------------------------------------
  patientBillConcession() {
    // check patient bill marked as final or not
    const isCancelledBill = this.billingForm.value.status == 'CANCELLED';
    if (isCancelledBill) {
      this.showValidationMsg('Bill already cancelled.');
      return;
    }

    // Not applicable with patient active class change
    if (this.isPatientClassChangePage) {
      this.showValidationMsg('Not applicable with patient active class change.');
      return;
    }

    // check fixed bill amount set from encounter then not allowed to give addition concession
    if ((this.billingForm.value.selectedPatient.penFixBillTotalAmt || 0) > 0) {
      this.showValidationMsg('Fixed bill amount already applied from encounter. You can not allowed to give addition concession.');
      return;
    }

    // if bill level concession already applied then additional concession not allowed to add
    if (this.billingForm.value.discountAmount > 0 && !this.billingForm.value.billConcessionArray.length) {
      this.showValidationMsg('Please clear bill level concession and apply additional concession.');
      return;
    }

    const modalInstance = this.modalService.open(PatientBillConcessionComponent, {
      ariaLabelledBy: 'modal-basic-title',
      keyboard: false,
      size: 'xl',
      container: '#homeComponent',
      windowClass: "patient-bill-concession-popup",
      // backdrop: 'static',
    });
    modalInstance.componentInstance.patientData = {
      selectedPatient: this.billingForm.value.selectedPatient,
      doctorListArray: this.doctorListArray,
      billingForm: this.billingForm,
      billServiceArray: this.billServiceArray,
      billConcessionArray: this.billingForm.value.billConcessionArray,
      isServiceAdminCharge: this.isServiceAdminCharge,
      serviceAdminChargeBeforeCons: this.serviceAdminChargeBeforeCons,
      isBillAdminCharge: this.isBillAdminCharge,
      billAdminChargeBeforeCons: this.billAdminChargeBeforeCons,
      isBillViewOnly: this.isBillViewOnly
    };
    modalInstance.result.then((res1: any) => { }, (result) => {
      if (result) {
        // update billing services and bill concession details in bill form
        this.billServiceArray = result.billServiceArray;
        this.billingForm.patchValue({ billConcessionArray: result.billConcessionArray });

        // apply bill level concession from additional concessions by sum of all bill concession percent
        const billLevelConcesionPercentTotal = _.sumBy(result.billConcessionArray, (o) => {
          return !(o.discountEntityType == 'attach_doctor' || o.discountEntityType == 'service_head') ? o.discountPercent : 0;
        });
        this.billingForm.patchValue({ discountType: 'discountPercent' });
        this.billingForm.patchValue({ discountPercent: billLevelConcesionPercentTotal });
        this.calculateBillData();
      }
    });
  }

  // Advanced Utilization Code started ----------------------------------------
  patientAdvancePayment() {
    const netPayableAmount = this.billingForm.value?.netPayableAmount || 0;
    const modalInstance = this.modalService.open(PatientAdvancePaymentComponent, {
      ariaLabelledBy: 'modal-basic-title',
      keyboard: false,
      size: 'xl',
      container: '#homeComponent',
      windowClass: "patient-advance-payment-popup",
      // backdrop: 'static',
    });
    modalInstance.componentInstance.patientData = {
      penId: this.billingForm.value.selectedPatient.penId,
      uhId: this.billingForm.value.selectedPatient.uhid,
      billAmount: netPayableAmount,
      advancePaymentRowData: _.cloneDeep(this.billingForm.value.advancePaymentRowData),
      isBillViewOnly: this.isBillViewOnly
    };
    modalInstance.componentInstance.AdvancePaymentEvent.subscribe((e: any) => {
      // update patient advance payment untilization into bill
      const advancePaymentRowData = _.cloneDeep(e.advancePaymentRowData);
      const advPaymentSettlement = _.cloneDeep(e.advPaymentSettlement);
      const utilizeAdvanceAmount = _.cloneDeep(e.utilizeAdvanceAmount);
      const advanceAppliedAmount = _.cloneDeep(e.advanceAppliedAmount);

      // update advanced Adjusted amount existing amount
      const billAdvanceAdjustmentAmt = parseFloat(this.billingForm.value.billAdvanceAdjustmentAmt || 0);
      const advanceAdjustmentAmt = _.round(billAdvanceAdjustmentAmt + advanceAppliedAmount, 2);

      this.billingForm.patchValue({ advanceAdjustmentAmt: advanceAdjustmentAmt });
      this.billingForm.patchValue({ advancePaymentRowData: advancePaymentRowData });
      this.billingForm.patchValue({ advPaymentSettlement: advPaymentSettlement });
      this.billingForm.patchValue({ utilizeAdvanceAmount: utilizeAdvanceAmount });

      this.calculateBillData();
    });
    modalInstance.result.then((result) => {
      if (result === true) {

      }
    });
  }

  // Insurance Utilization Code started ----------------------------------------
  patientInsuranceDetail() {
    const netAmount = this.billingForm.value?.netAmount || 0;
    const modalInstance = this.modalService.open(PatientInsuranceDetailComponent, {
      ariaLabelledBy: 'modal-basic-title',
      keyboard: false,
      size: 'xl',
      container: '#homeComponent',
      windowClass: "patient-insurance-detail",
      // backdrop: 'static',
    });

    // send only saved and valid records for insurance approval
    const billForInsuranceApproval = _.cloneDeep(_.filter(this.billServiceArray, (o) => {
      return o.billDetailId && (!o.isNonService ? o.service : true) && o.status != 'REVERSE';
    }));

    modalInstance.componentInstance.patientData = {
      penId: this.billingForm.value.selectedPatient.penId,
      uhId: this.billingForm.value.selectedPatient.uhid,
      billAmount: netAmount,
      insuranceDetailArray: this.insuranceDetailArray,
      patientInfo: this.billingForm,
      isBillViewOnly: this.isBillViewOnly
    };
    modalInstance.result.then((res: any) => { }, (result) => {
      if (result) {
        this.insuranceDetailArray = result;
        this.calculateBillData();
      }
    });
  }

  // Insurance Utilization Code started ----------------------------------------
  patientInsurance() {
    const netAmount = this.billingForm.value?.netAmount || 0;
    const modalInstance = this.modalService.open(PatientInsuranceUtilizationComponent, {
      ariaLabelledBy: 'modal-basic-title',
      keyboard: false,
      size: 'xl',
      container: '#homeComponent',
      windowClass: "patient-insurance",
      // backdrop: 'static',
    });

    // send only saved and valid records for insurance approval
    const billForInsuranceApproval = _.cloneDeep(_.filter(this.billServiceArray, (o) => {
      return o.billDetailId && (!o.isNonService ? o.service : true) && o.status != 'REVERSE';
    }));

    modalInstance.componentInstance.patientData = {
      penId: this.billingForm.value.selectedPatient.penId,
      uhId: this.billingForm.value.selectedPatient.uhid,
      billAmount: netAmount,
      billServiceData: billForInsuranceApproval,
      patientInfo: this.billingForm,
      isBillViewOnly: this.isBillViewOnly
    };
    modalInstance.result.then((res: any) => { }, (reason) => {
      if (reason === true) {
        this.alertMsg = {
          message: "Insurance utilization saved successfully!",
          messageType: "success",
          duration: Constants.ALERT_DURATION
        };
        // reload voucher and bill details...
        const billId = this.billingForm.value.billId;
        this.billingForm.patchValue({ billId: billId });
        this.getPatientBillById(billId).subscribe();
      }
    });
  }

  /// Discount Approval/rejection region --------------------------------------
  showDiscountConfirmation(action: any) {
    const modalInstance = this.modalService.open(ConfirmationPopupWithInputComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false,
        windowClass: 'custom-modal'
      });
    modalInstance.componentInstance.messageDetails = {
      modalTitle: 'Do you want to ' + action,
      modalBody: 'Concession approval reason',
      buttonName: action
    };
    modalInstance.result.then((res: any) => { }, (reason) => {
      if (reason.popupVal === 'ok') {
        var param = {
          pbmId: this.billingForm.value.billId,
          status: action,
          reason: reason.confirmationMsg
        }
        this.billingService.updateDiscountApprovalRequest(param).subscribe(res => {
          this.alertMsg = {
            message: "Data save successfully!!",
            messageType: "success",
            duration: Constants.ALERT_DURATION
          };
        });
        // reload voucher and bill details...
        const billId = this.billingForm.value.billId;
        this.billingForm.patchValue({ billId: billId });
        this.getPatientBillById(billId).subscribe();
      }
    });
  }

  ///Bill Verification region    ----------- START

  verifyPatientBill() {
    const modalInstance = this.modalService.open(ConfirmationPopupWithInputComponent,
    {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      windowClass: 'custom-modal'
    });
    modalInstance.componentInstance.messageDetails = {
      modalTitle: 'Do you want to verify the bill',
      modalBody: 'Bill Verification remark',
      buttonName: 'Verify'
    };
    modalInstance.result.then((res: any) => {}, (reason) => {
      if (reason.popupVal === 'ok') {
        var param = {
          billId: this.billingForm.value.billId,
          remark: reason.confirmationMsg
        }
        this.billingService.patientBillVerification(param).subscribe(res => {
          this.alertMsg = {
            message: "Data save successfully!!",
            messageType: "success",
            duration: Constants.ALERT_DURATION
          };
          // reload voucher and bill details...
          const billId = this.billingForm.value.billId;
          this.billingForm.patchValue({ billId: billId });
          this.getPatientBillById(billId).subscribe();
        });
      }
    });
  }

  ///Bill Verification region    ----------- END

  @HostListener('document:click', ['$event'])
  handleDeleteKeyboardEvent(event: any) {
    // if (event.key === 'Delete') {
    //   // if (this.selectedIndex !== null) {
    //   //   this.deleteItemFromArray(this.billServiceArray[this.selectedIndex], this.selectedIndex);
    //   // }
    // }
  }


}

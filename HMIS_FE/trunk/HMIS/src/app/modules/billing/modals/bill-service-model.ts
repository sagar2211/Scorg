import { ServiceModel } from './service-master-model';
import * as _ from 'lodash';
import { PackageDetailModel } from './package-detail-model';

export class BillServiceModel {
  //uhid: string; //"20210300007"
  //billId: number; //61210
  billDetailId: number; //66848
  orderId: number; //61663
  orderDetailId: number; //66037
  isEditMode: boolean;
  isNonService: boolean;
  attachedCompList: any;

  tempId: any;
  billRowTempId: any;
  service: ServiceModel;
  serviceName: string;
  serviceType: string; //"NORMAL"
  executionType: number; //2

  nonServiceId: number;
  nonServiceHeadId: number;
  nonServiceHeadName: string;
  nonServiceBedId: number;
  nonServiceBedTypeId: number;

  // isDoctorPolicy: boolean; //"N"
  // fullychargeable: boolean; //"N"
  // isRatechange: boolean; //"N"
  // serviceHeadId: number; //9
  // outsideLabCharge: boolean; //"Y"

  //serviceId: number; //4262
  //serviceName: string; //"ACID PHOSPHATASE"
  //billdatetime: string; //"02/04/2021 10:18 PM"
  doctorId: number;
  doctorName: string;
  orderDate: Date; //"2021-04-02T22:15:00"
  serviceCenterId: number;
  serviceCenterName: string;
  isServiceCenterMapped: boolean;
  surchargeTypeId: number;
  surchargeType: string;
  //qty: number; //1
  multiplier: number;
  isSpotBill: boolean;
  orderQty: number; //1
  oldRate: number;
  rate: number; //500
  amount: number; //500

  pkgDetailId: number; //144
  pkgRowId: string;
  pkgDiscAmt: number; //500
  pkgQty: number; //0
  pkgRate: number; //500
  pkgConDetail: any;

  discountEntityType: string;
  discountType: string;
  discountPercent: number; //0
  discountAmount: number; //0
  //isAdminCharge: boolean;
  adminChargePercent: number;
  adminChargeAmount: number;
  grossAmt: number; //0
  //gstRate: number; //0
  gstPercent: number; //0
  gstAmount: number; //0

  //adduser: "SAGAR TEST"

  refundedAmount: number; //0
  totNetAmt: number; //0

  isDeposit: boolean; //"NO"
  actualTotnetamt: number; //500
  refBillNo: string; //"IPB2122010400002"
  duration: number; //1
  durationType: string; //"1"
  frequency: string; //"24"

  // insurance utilisation details
  patInsApprovalId: number;
  approvalAmmount: number;
  insuranceRate: number;
  //selfContriAmt: number;

  status: string; //"PENDING"insuranceRate
  remark: string;
  isActive: boolean; //"Y"
  adduser: string;
  reverseId: any;
  incompleteServiceFlag: boolean;
  incompleteRateFlag: boolean;

  logDetail: string;
  isRateChanged: boolean;
  isDirty: boolean;

  isVerify: boolean;
  constructor() { }

  isObjectValid(obj: any) {
    return (obj.hasOwnProperty('PbdId') && obj.PbdId !== '') ? true : false;
  }

  generateObject(obj: any, doctorList?: any): void {
    obj = obj ? obj : {};

    this.tempId = obj.tempId || Math.random();
    this.billDetailId = obj.PbdId || 0; //66848
    this.orderId = obj.SodSomId || 0; //61663
    this.orderDetailId = obj.SodId || 0; //66037
    this.isEditMode = (obj.PbdId || obj.PbnsId) ? true : false;
    //this.isNonService = obj.PbnsId ? true : false;
    this.isNonService = obj.IsNonService ? true : false;
    this.attachedCompList = [];

    // service object
    const serviceObj = new ServiceModel();
    serviceObj.serviceId = obj.IsNonService ? null : (obj.PbdServiceId || null); //4262
    serviceObj.serviceName = obj.PbdDescription || obj.PbnsDescription || obj.SrvName || ''; //4262
    serviceObj.serviceType = obj.SrvServicetype || 'NORMAL';
    serviceObj.serviceHeadId = obj.SrvServiceheadId || 0;
    serviceObj.serviceHeadName = obj.SvhName || obj.nonServiceHeadName || '';
    serviceObj.serviceCategoryName = obj.SvcName || '';
    serviceObj.isGST = false;
    serviceObj.gstRate = 0;
    serviceObj.status = '';
    serviceObj.isDoctorPolicy = obj.SrvIsdoctorpolicy == 'Y';
    serviceObj.isModifyRate = obj.SrvIsratechange ? (obj.SrvIsratechange == 'Y') : (obj.NsbhIsratechange == 'Y');
    serviceObj.isFullychargeable = obj.SrvFullychargeable ? (obj.SrvFullychargeable == 'Y') : (obj.NsbhFullychargeable == 'Y');
    serviceObj.outsidelabcharge = obj.SrvOutsidelabcharge == 'Y';
    serviceObj.isSpotBill = false;
    serviceObj.isAdminCharge = obj.SrvIsAdminCharges ? (obj.SrvIsAdminCharges == 'Y') : (obj.NsbhIsadmincharges == 'Y');
    serviceObj.adminChargePercent = obj.SrvAdminchargesper || 0;
    serviceObj.rate = 0;
    this.service = serviceObj.serviceName !== '' ? serviceObj : null;

    this.serviceName = serviceObj.serviceName;
    this.serviceType = obj.SrvServicetype || 'NORMAL'; //"NORMAL"
    this.executionType = obj.SrvExecutiontype; //2

    // set non service id
    this.nonServiceId = obj.PbnsId || 0;
    this.nonServiceHeadId = obj.PbnsNonserviceHeadId || 0;
    this.nonServiceHeadName = obj.nonServiceHeadName || '';
    this.nonServiceBedId = obj.PbnsBedid || 0;
    this.nonServiceBedTypeId = obj.BedTypeId || 0;

    // set resource name from doctor list
    this.doctorId = obj.AttachResourceId || null;
    const resource = _.find(doctorList, (o) => { return o.doctorId == this.doctorId; });
    this.doctorName = resource?.doctorName || (serviceObj.isDoctorPolicy ? 'Select' : 'NA');
    this.orderDate = obj.SodReqstdDate ? new Date(obj.SodReqstdDate) : new Date(); //"2021-04-02T22:15:00"

    // service center object
    this.isServiceCenterMapped = (this.isNonService || this.serviceType == 'PACKAGE') ? false : (obj.hasOwnProperty('IsServiceCenterMapped') ? obj.IsServiceCenterMapped : (!this.isNonService && this.serviceType != 'PACKAGE'));
    this.serviceCenterId = obj.SodServicecenterId || (obj.defualtServiceCenter ? obj.defualtServiceCenter.ScmId : null) || null;
    this.serviceCenterName = (obj.ServiceCenterName || (obj.defualtServiceCenter ? obj.defualtServiceCenter.ScmName : null) || (this.isServiceCenterMapped ? 'Select' : 'NA'));

    this.surchargeTypeId = obj.SodSurchargeTypeId || 0;
    this.surchargeType = obj.SodPriority || 'ROUTINE';
    //this.surchargeType = this.surchargeTypeId == 1 ? 'HAPPYHOURS' : this.surchargeTypeId == 1 ? 'EMERGENCYCHARGES' : 'ROUTINE',
    this.multiplier = 1;
    this.isSpotBill = obj.PbdIsspotBill == 'Y'; //"N"

    this.orderQty = obj.PbdOrdQty || 1; //1
    this.rate = obj.PbdRate || obj.PbnsAmount || 0; //500
    this.amount = obj.PbdAmount || obj.PbnsAmount || 0; //500

    this.pkgDetailId = obj.PbdPkgDetailId || 0; //144
    this.pkgRowId = obj.PbdPkgRowId || '';
    this.pkgDiscAmt = obj.PbdPkgDiscAmt || 0; //500
    this.pkgQty = obj.PbdPkgQty || 0; //0
    this.pkgRate = obj.PbdPkgRate || 0; //500
    this.pkgConDetail = [];

    this.discountEntityType = obj.PbdDiscEntityType || 'manual';
    this.discountType = obj.PbdDisctype || 'discountAmount';
    this.discountAmount = obj.PbdDiscamt || 0; //0
    this.discountPercent = obj.PbdDiscper || 0; //0
    this.adminChargePercent = obj.PbdAdminChargePer || 0;
    this.adminChargeAmount = obj.PbdAdminChargeAmt || 0;

    this.grossAmt = obj.PbdGrossamt || obj.PbnsAmount || 0; //0
    this.gstPercent = obj.PbdGstper || 0; //0
    this.gstAmount = obj.PbdGstamt || 0; //0

    this.isDeposit = obj.Deposit == 'YES' || false; //"NO"
    this.actualTotnetamt = obj.PbdActualTotnetamt || obj.PbnsAmount || 0; //500

    this.refundedAmount = obj.PbdRefundedAmt || 0; //0
    this.totNetAmt = obj.PbdTotnetamt || obj.PbnsAmount || 0; //0
    this.refBillNo = obj.RefBillNo || 0; //"IPB2122010400002"
    this.duration = obj.SodDuration || 1; //1
    this.durationType = obj.SodDurationtype || 0; //"1"
    this.frequency = obj.SodFrequency || 1; //"24"

    // insurance utilisation details
    this.patInsApprovalId = obj.PbiPiaId || 0;
    this.insuranceRate = obj.PbiInsuranceRate || 0;
    this.approvalAmmount = obj.PbiApprovedAmount || 0;

    const oldStaus = obj.SodStatus || obj.PbnsStatus || 'PROCESSED';
    this.status = oldStaus; // oldStaus == 'PENDING' ? 'PROCESSED' : oldStaus;
    this.reverseId = obj.PbdReverseId || 0;

    this.remark = obj.PbdRemarks || obj.PbnsRemarks || '';
    this.isActive = obj.SodIsactive == 'Y'; //"Y"
    this.adduser = obj.PbdAdduser || '';
    this.incompleteServiceFlag = obj.SodIncompleteRateFlag == 'Y';
    this.incompleteRateFlag = obj.SodIncompleteRateFlag == 'Y';

    // if service type is normal and doctor policy applicable
    // attach doctor and service center is mandatory
    if (this.service && this.service.serviceType !== 'PACKAGE'
      && ((this.service.isDoctorPolicy && !this.doctorId) || (this.isServiceCenterMapped && !this.serviceCenterId))) {
      this.incompleteServiceFlag = true;
    }

    // if service type is component and rate not saved
    if (this.service && this.service.serviceType == 'COMPONENT' && this.rate <= 0) {
      this.incompleteServiceFlag = true;
      this.incompleteRateFlag = true;
    }

    this.logDetail = '';
    this.isRateChanged = obj.PbdIsRateChanged == 'Y';
    this.isDirty = this.billDetailId == 0 || oldStaus == 'PENDING';

    this.isVerify = false;
    // if service type is component and rate not saved
    if (this.isDirty && this.service && this.service.serviceType == 'NORMAL' && this.rate <= 0) {
      this.incompleteRateFlag = true;
    }
  }

  generatePkgServiceObject(obj: PackageDetailModel) {
    this.tempId = Math.random();
    this.billRowTempId = obj.billRowTempId || 0;
    this.billDetailId = 0;
    this.orderId = 0;
    this.orderDetailId = 0;
    this.isEditMode = true; // for package service disable service name change
    this.isNonService = false;
    this.attachedCompList = [];

    // service object
    this.service = obj.service;

    this.serviceName = this.service.serviceName;
    this.serviceType = this.service.serviceType;
    this.executionType = null;

    // set non service id
    this.nonServiceId = 0;
    this.nonServiceHeadId = 0;
    this.nonServiceHeadName = '';
    this.nonServiceBedId = 0;
    this.nonServiceBedTypeId = 0;

    // set resource name from doctor list
    this.doctorId = null;
    this.doctorName = (this.service.serviceType == 'NORMAL' && this.service.isDoctorPolicy) ? '' : 'NA';
    this.orderDate = new Date();

    // service center object
    this.serviceCenterId = null;
    this.serviceCenterName = 'Select';
    this.isServiceCenterMapped = true;

    this.surchargeTypeId = 0,
    this.surchargeType = 'ROUTINE',
    this.multiplier = 1;
    this.isSpotBill = false;

    this.orderQty = obj.qty || 0;
    this.rate = obj.rate || 0;
    this.amount = _.round(this.orderQty * this.rate, 2);

    this.pkgDetailId = obj.detailId || 0;
    this.pkgRowId = obj.packageRowId || '';
    this.pkgDiscAmt = this.amount;
    this.pkgQty = obj.qty || 0;
    this.pkgRate = obj.derivedAmt || 0;
    this.pkgConDetail = [];

    this.discountEntityType = 'manual';
    this.discountType = 'discountAmount';
    this.discountAmount = 0;
    this.discountPercent = 0;
    this.adminChargePercent = 0;
    this.adminChargeAmount = 0;

    this.grossAmt = 0;
    this.gstPercent = 0;
    this.gstAmount = 0;

    this.isDeposit = false;
    this.actualTotnetamt = 0;

    this.refundedAmount = 0;
    this.totNetAmt = 0;
    this.refBillNo = '';
    this.duration = 1;
    this.durationType = '';
    this.frequency = '';

    this.status = 'PROCESSED'; // oldStaus == 'PENDING' ? 'PROCESSED' : oldStaus;

    this.remark = '';
    this.isActive = true;
    this.adduser = '';
    this.reverseId = 0;
    this.incompleteServiceFlag = true;

    // if service type is normal and doctor policy applicable
    // attach doctor and service center is mandatory
    if (this.service && this.service.serviceType == 'NORMAL'
      && ((this.service.isDoctorPolicy && !this.doctorId) || !this.serviceCenterId)) {
      this.incompleteServiceFlag = true;
    }

    this.logDetail = '';
    this.isDirty = this.billDetailId == 0;
    this.isVerify = false;
  }
}

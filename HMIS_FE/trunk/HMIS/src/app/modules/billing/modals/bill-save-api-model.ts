import { ServiceModel } from './service-master-model';
import * as _ from 'lodash';
import { BillServiceModel } from './bill-service-model';
import { ServiceComponentItemModel } from './service-component-item-model';

export class BillSaveApiModel {
  chargingTypeId: number;
  categoryTypeId: number;
  isChargingTypeUpdate: boolean;
  billInfo: any = {};
  insuranceDetail: Array<any> = [];
  insertRowDatalist: Array<any> = [];
  concessionDetails: Array<any> = [];
  advPaymentSettlement: Array<any> = [];
  utilizeAdvanceAmount: Array<any> = [];
  utilizeInsuranceAmount: Array<any> = [];

  constructor() { }

  isObjectValid(obj: any) {
    return (obj.hasOwnProperty('PbdId') && obj.PbdId !== '') ? true : false;
  }
  generateObject(billingForm: any, insuranceDetailArray: any, billServiceArray: Array<BillServiceModel>): void {
    this.chargingTypeId = billingForm.selectedPatient.activeChargingTypeId;
    this.categoryTypeId = billingForm.selectedPatient.penCategoryId;
    this.isChargingTypeUpdate = billingForm.selectedPatient.isPatientClassChangePage;
    this.billInfo = this.generateBilInfo(billingForm);
    this.insuranceDetail = this.generateInsuranceData(insuranceDetailArray);
    this.insertRowDatalist = this.generateServicesData(billServiceArray);
    this.concessionDetails = this.generateConcessionData(billingForm.billConcessionArray);
    this.advPaymentSettlement = this.generateAdvancePayData(billingForm.advPaymentSettlement);
    this.utilizeAdvanceAmount = this.generateUtilizeAdvanceData(billingForm.utilizeAdvanceAmount);
    this.utilizeInsuranceAmount = this.generateUtilizedInsuranceData(billingForm.utilizeInsuranceAmount);
  }

  generateBilInfo(billingForm) {
    const billInfoObj = {
      PbmId: billingForm.billId,
      PbmUhid: billingForm.selectedPatient.uhid,
      PbmVisitNo: billingForm.selectedPatient.penVisitNo,
      PbmPenId: billingForm.selectedPatient.penId,
      PbmBillno: billingForm.billNo,
      PbmTotGrossamt: billingForm.grossAmount,
      PbmBillAmt: billingForm.billAmount,
      PbmCategoryConcper: billingForm.categoryConcPer,
      PbmCategoryConcamt: billingForm.categoryConcAmt,
      PbmTotDisctype: billingForm.discountType,
      PbmTotDiscper: billingForm.discountPercent,
      PbmTotDiscamt: billingForm.discountAmount,
      PbmAdminChargesPer: billingForm.adminChargesPer,
      PbmAdminChargesAmt: billingForm.adminChargesAmt,
      PbmTotAmount: billingForm.netAmount,
      PbmTotGstper: billingForm.gstPercent,
      PbmTotGstamt: billingForm.gstAmount,
      PbmTotNetamt: billingForm.finalNetAmount,
      PbmTotInsuranceamt: billingForm.insuranceAmount,
      PbmCreditApprovedAmount: billingForm.creditApprovedAmount,
      PbmCreditApprovedBalance: billingForm.creditApprovedBalance,
      PbmTotAdvamt: billingForm.advanceAdjustmentAmt,
      PbmIswriteoff: billingForm.isWriteOff ? 'Y' : 'N',
      PbmWriteoffAmount: billingForm.writeOffAmount,
      PbmBillNetamt: billingForm.finalNetAmount,
      PbmFialbillNetamt: billingForm.netPayableAmount,

      PbmRemarks: billingForm.remark,
      PbmTpastatus: billingForm.tpaStatus,
      PbmAuthorityId: 0,
      addrow: true,
      isFinalBill: billingForm.isFinal,
      IsDischargeApprove: billingForm.isDischargeApprove
    }
    return billInfoObj;
  }

  generateServicesData(billServiceArray: Array<BillServiceModel>) {
    const serviceRowData = [];
    _.map(billServiceArray, (obj: BillServiceModel, index) => {
      if (obj.status != 'REVERSE' && obj.status != 'CANCEL' && obj.isDirty && obj.service && obj.service.serviceName) {
        const serviceObj = {
          PbdId: obj.billDetailId,
          PbdSodId: obj.orderDetailId,
          PbdServiceId: obj.service.serviceId,
          PbdNonserviceId: obj.nonServiceId,
          PbdDescription: obj.service.serviceName,
          PbdOrdQty: obj.orderQty,
          PbdQty: obj.orderQty,
          PbdIsspotBill: obj.isSpotBill,
          PbdRate: obj.rate,
          PbdAmount: obj.amount,
          PbdDiscEntityType: obj.discountEntityType,
          PbdDisctype: obj.discountType,
          PbdDiscper: obj.discountPercent,
          PbdDiscamt: obj.discountAmount,
          PbdGrossamt: obj.grossAmt,
          PbdGstper: obj.gstPercent,
          PbdGstamt: obj.gstAmount,
          PbdRefundedAmt: obj.refundedAmount,
          PbdTotnetamt: obj.totNetAmt,
          PbdRemarks: obj.remark,
          PbdServicecenterId: obj.serviceCenterId,
          PbdBilldate: obj.orderDate,
          PbdBilldatetime: obj.orderDate,
          PbdStatus: obj.status == 'PENDING' ? 'PROCESSED' : obj.status,
          PbdPriority: obj.surchargeType,
          RowIndex: index,
          PbdAuthorityId: 0,
          PbdConcper: obj.discountPercent,
          PbdConcamt: obj.discountAmount,
          Billdatetime: obj.orderDate,
          rowaction: obj.isEditMode ? 'update' : 'Add',
          doctorId: obj.doctorId,
          PbdPkgDetailId: obj.pkgDetailId,
          PbdPkgRowId: obj.pkgRowId,
          PbdPkgQty: obj.pkgQty,
          PbdPkgRate: obj.pkgRate,
          PbdPkgDiscAmt: obj.pkgDiscAmt,
          PbdActualTotnetamt: obj.totNetAmt,
          wardInfo: "",
          bedInfo: "NA",
          isSpotBill: obj.isSpotBill,
          adminChargePercent: obj.adminChargePercent,
          adminChargeAmount: obj.adminChargeAmount,
          attachPackageData: [],
          attachComponentData: this.generateAttachCompData(obj.orderDetailId, obj.attachedCompList),
          isEditMode: obj.isEditMode,
          logDetail: obj.logDetail
        }
        serviceRowData.push(serviceObj);
      }
    });
    return serviceRowData;
  }

  generateAttachCompData(orderDetailId, attachedCompList: Array<ServiceComponentItemModel>) {
    const attachedCompData = [];
    _.map(attachedCompList, (obj: ServiceComponentItemModel, index) => {
      if (obj.isSelected) {
        const serviceObj = {
          SorcId: obj.sorcId,
          SorcSodId: orderDetailId || 0,
          SorcServiceId: obj.serviceId,
          SorcComponentId: obj.componentId,
          SorcResTypeId: 1,
          SorcResourceId: obj.doctorId || 0,
          SorcRate: obj.netRate,
          SorcPercent: 0,
          SorcAmount: obj.totalAmount,
          SorcNetamount: obj.totalAmount,
          SorcRemarks: obj.remark,
          SorcQty: obj.orderQty,
        }
        attachedCompData.push(serviceObj);
      }
    });
    return attachedCompData;
  }

  generateInsuranceData(insuranceDetail) {
    return insuranceDetail;
  }

  generateConcessionData(concessionData) {
    return _.filter(concessionData, (o) => { return o.discountPercent > 0; });
  }

  generateAdvancePayData(payData) {
    return payData;
  }

  generateUtilizeAdvanceData(advanceUtilizedData) {
    return advanceUtilizedData;
  }

  generateUtilizedInsuranceData(insuranceData) {
    return insuranceData;
  }
}


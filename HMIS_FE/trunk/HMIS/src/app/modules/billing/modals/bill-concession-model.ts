import { ServiceModel } from './service-master-model';
import * as _ from 'lodash';
import { PackageDetailModel } from './package-detail-model';

export class BillConcessionModel {
  pbcId: number;
  tempId: any;
  discountEntityType: string;
  discountEntityTypeName: string;
  discountEntityId: number;
  discountEntityName: string;
  applicableOn: string;
  entityBillAmount: number;
  discountType: string;
  discountPercent: number; //0
  discountAmount: number; //0

  constructor() { }

  isObjectValid(obj: any) {
    return (obj.hasOwnProperty('pbcId') && obj.pbcId) ? true : false;
  }

  generateObject(obj: any): void {
    obj = obj ? obj : {};

    this.tempId = obj.tempId || Math.random();
    this.pbcId = obj.pbcId || 0; //66848
    this.discountEntityType = obj.discountEntityType || 'attach_doctor';
    this.discountEntityTypeName = obj.discountEntityTypeName || 'Billing Doctor Concession';
    this.discountEntityId = obj.discountEntityId || null; //66037
    this.discountEntityName = obj.discountEntityName || '-Select-';
    this.applicableOn = (this.discountEntityType == 'attach_doctor' || this.discountEntityType == 'service_head') ? 'Services' : 'Bill';
    this.entityBillAmount = obj.entityBillAmount || 0.00;
    this.discountType = 'discountPercent';
    this.discountPercent = obj.discountPercent || 0.00;
    this.discountAmount = obj.discountAmount || 0.00;
  }
}

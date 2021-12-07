import { MedicineMasterData } from './medicine-master-data';
import { LabOrders } from './lab-order';
import { RadiologyOrder } from './radiology-orders';
import { DietOrder } from './diet-order';
import { NursingOrder } from './nursing-order';

export class Ordersetmodel {
    orderSetId?: number;
    ordersetName: string;
    isVisible: boolean;
    isExpanded: boolean;
    isDataAvailable: boolean;
    medicineOrders: Array<MedicineMasterData> = [];
    labOrders: Array<LabOrders> = [];
    radiologyOrders: Array<RadiologyOrder> = [];
    dietOrders: Array<DietOrder> = [];
    nursingOrders: Array<NursingOrder> = [];

    isObjectValid(obj: any) {
        return obj.hasOwnProperty('orderSetId') ?
         obj.hasOwnProperty('ordersetName') ?
         // obj.hasOwnProperty('medicineOrders') ?
         // obj.hasOwnProperty('labOrders') ?
         // obj.hasOwnProperty('radiologyOrders') ?
         // obj.hasOwnProperty('dietOrders') ?
         // obj.hasOwnProperty('nursingOrders') ?
         true : false : false;
    }

    generateObject(obj) {
        this.orderSetId = obj.orderSetId;
        this.ordersetName = obj.ordersetName;
        this.isDataAvailable = obj.isDataAvailable;
        this.isVisible = obj.isVisible;
        this.isExpanded = obj.isExpanded;
        this.medicineOrders = obj.medicineOrders || [];
        this.labOrders = obj.labOrders || [];
        this.radiologyOrders = obj.radiologyOrders || [];
        this.dietOrders = obj.dietOrders || [];
        this.nursingOrders = obj.nursingOrders || [];
    }
}



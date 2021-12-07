export class DoctorInformationOrder {
    name: string;
    tempId?: number;
    instructionId: number;
    action?: string;
    id?: number;
    status?: string;
    isDirty?: boolean;
    freq: string;
    startDateTime: Date;
    endDateTime: Date;
    isValidObject?: boolean;
    // quantity: string;
    specInstruction?: string;
    is_favourite?: string;
    use_count?: string;
    tempstatus?: string;
    invalidObjectMessage?: string;
    orderDate: Date;
    orderBy: any;
    approvedBy: any;
    isFav: boolean;
    sequence: number;
    key: string;

    isObjectValid(obj: any) {
        return this.isValidObject = (obj.hasOwnProperty('id')) ? (obj.hasOwnProperty('name') && obj.name !== '') ?
            (obj.hasOwnProperty('instructionId') && obj.instructionId !== '') ? true : false : false : false;
    }

    // isObjectIncomplete(obj: any) {
    //     return (obj.hasOwnProperty('name') && obj.name !== '') ? (obj.hasOwnProperty('instructionId') && obj.instructionId !== '') ?
    //         (obj.hasOwnProperty('startDateTime') && obj.startDateTime != '' && obj.startDateTime != null) ? (obj.hasOwnProperty('endDateTime') && obj.endDateTime != '' && obj.endDateTime != null) ?
    //             false : true : true : true : true;
    // }

    // getInvalidObjectMessage() {
    //     return 'Name or Start date-time or End date-time may be missing';
    // }

    generateObject(obj: any, isFromSuggestion?) {
        this.name = obj.name;
        this.tempId = obj.tempId;
        this.instructionId = obj.instructionId;
        this.action = obj.action;
        this.id = obj.id || '';
        this.status = obj.status;
        this.isDirty = obj.isDirty;
        this.freq = obj.freq ? obj.freq : 0;
        this.startDateTime = obj.startDateTime ? new Date(obj.startDateTime) : new Date();
        this.endDateTime = obj.endDateTime ? new Date(obj.endDateTime) : null;
        this.isValidObject = obj.isValidObject;
        // this.quantity = obj.quantity;
        this.specInstruction = obj.specInstruction;
        // this.invalidObjectMessage = this.isValidObject ? this.getInvalidObjectMessage() : '';
        this.is_favourite = obj.is_favourite;
        this.use_count = obj.use_count;
        this.tempstatus = obj.tempstatus || '';
        this.orderDate = (obj.order_date) ? new Date(obj.order_date) : new Date();
        this.orderBy = obj.orderBy || null;
        this.approvedBy = obj.approvedBy || null;
        this.isFav = obj.suggestion_flag && obj.suggestion_flag === 'user_fav' ? true : false;
        this.sequence = obj.sequence || null;
        this.key = obj.key || null;
    }

}
export class OtherServicesOrder {
    name: string;
    tempId?: number;
    serviceId: number;
    action?: string;
    id?: number;
    status?: string;
    isDirty?: boolean;
    freq: string;
    startDateTime: Date;
    endDateTime: Date;
    isValidObject?: boolean;
    // quantity: string;
    specInstruction?: string;
    is_favourite?: string;
    use_count?: string;
    tempstatus?: string;
    invalidObjectMessage?: string;
    orderDate: Date;
    orderBy: any;
    approvedBy: any;
    isFav: boolean;
    sequence: number;
    key: string;

    isObjectValid(obj: any) {
        return this.isValidObject = (obj.hasOwnProperty('id')) ?
            (obj.hasOwnProperty('serviceId') && obj.serviceId !== '') ? true : false : false;
    }

    // isObjectIncomplete(obj: any) {
    //     return (obj.hasOwnProperty('name') && obj.name !== '') ? (obj.hasOwnProperty('serviceId') && obj.serviceId !== '') ?
    //         (obj.hasOwnProperty('startDateTime') && obj.startDateTime != '' && obj.startDateTime != null) ? (obj.hasOwnProperty('endDateTime') && obj.endDateTime != '' && obj.endDateTime != null) ?
    //             false : true : true : true : true;
    // }

    // getInvalidObjectMessage() {
    //     return 'Name or Start date-time or End date-time may be missing';
    // }

    generateObject(obj: any, isFromSuggestion?) {
        this.name = obj.service_name ? obj.service_name : obj.name;
        this.tempId = obj.tempId;
        this.serviceId = obj.serviceId;
        this.action = obj.action;
        this.id = obj.id || '';
        this.status = obj.status;
        this.isDirty = obj.isDirty;
        this.freq = obj.freq ? obj.freq : 0;
        this.startDateTime = obj.startDateTime ? new Date(obj.startDateTime) : new Date();
        this.endDateTime = obj.endDateTime ? new Date(obj.endDateTime) : null;
        this.isValidObject = obj.isValidObject;
        // this.quantity = obj.quantity;
        this.specInstruction = obj.specInstruction;
        // this.invalidObjectMessage = this.isValidObject ? this.getInvalidObjectMessage() : '';
        this.is_favourite = obj.is_favourite;
        this.use_count = obj.use_count;
        this.tempstatus = obj.tempstatus || '';
        this.orderDate = (obj.order_date) ? new Date(obj.order_date) : new Date();
        this.orderBy = obj.orderBy || null;
        this.approvedBy = obj.approvedBy || null;
        this.isFav = obj.suggestion_flag && obj.suggestion_flag === 'user_fav' ? true : false;
        this.sequence = obj.sequence || null;
        this.key = obj.key || null;
    }

}

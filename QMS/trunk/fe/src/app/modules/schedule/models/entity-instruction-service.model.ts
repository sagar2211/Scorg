import { Service } from './service.model';

export class EntityInstructionService {
    service: Service;
    instructionPatient: string;
    instructionOperator: string;
    formId: number;

    isObjectValid(obj: any) {
        return obj.hasOwnProperty('service')
            && obj.hasOwnProperty('instructionOperator')
            && obj.hasOwnProperty('instructionPatient') ? true : false;
    }

    generateObject(obj: any) {
        this.service = obj.service;
        this.instructionOperator = obj.instructionOperator;
        this.instructionPatient = obj.instructionPatient;
        this.formId = obj.formId || null;
    }
}

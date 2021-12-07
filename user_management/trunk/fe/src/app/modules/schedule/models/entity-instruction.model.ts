export class EntityInstruction {
    commonInstructionPatient: string;
    commonInstructionOperator: string;
    serviceForm: any;

    isObjectValid(obj: any) {
        return obj.hasOwnProperty('commonInstructionPatient')
            && obj.hasOwnProperty('commonInstructionOperator') ? true : false;
    }

    generateObject(obj: any) {
        this.commonInstructionPatient = obj.commonInstructionPatient;
        this.commonInstructionOperator = obj.commonInstructionOperator;
        this.serviceForm = obj.serviceForm;
    }
}

export class InvestigationComponentMaster {
    id: Number;
    investigationId: Number;
    isSelected: Boolean;
    parameterName;
    parameterData: String;

    isObjectValid(obj: any) {
        return obj.hasOwnProperty('id')
            && obj.hasOwnProperty('isSelected')
            && obj.hasOwnProperty('investigation_id')
            && obj.hasOwnProperty('parameterData')
            && obj.hasOwnProperty('parameter_name') ? true : false;
    }

    generateObject(obj: any) {
        this.id = obj.id;
        this.investigationId = obj.investigation_id;
        this.isSelected = obj.isSelected;
        this.parameterName = obj.parameter_name;
        this.parameterData = obj.parameterData;
    }
}

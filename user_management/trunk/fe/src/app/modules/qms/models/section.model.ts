export class Section {
    id: number;
    name: string;
    remark: string;
    isActive: string;

    isObjectValid(obj: any) {
        return (obj.hasOwnProperty('rsm_id') || obj.hasOwnProperty('id'))
            && (obj.hasOwnProperty('rsm_name') || obj.hasOwnProperty('name'))
            && (obj.hasOwnProperty('rsm_remark') || obj.hasOwnProperty('remark')) ? true : false;
    }

    generateObject(obj: any) {
        this.id = obj.rsm_id || obj.id;
        this.name = obj.rsm_name || obj.name;
        this.remark = obj.rsm_remark || obj.remark;
        this.isActive = obj.rsm_isactive || obj.isActive;
    }
}

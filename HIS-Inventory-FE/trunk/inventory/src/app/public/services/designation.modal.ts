export class Designation {
    designationId: number;
    designation: string;
    roleTypeId: number;
    roleType: string;

    generateObject(obj: any): void {
        this.designationId = obj.desg_id;
        this.designation = obj.desg_name;
        this.roleTypeId = obj.role_type_id;
        this.roleType = obj.role_type;
    }
}

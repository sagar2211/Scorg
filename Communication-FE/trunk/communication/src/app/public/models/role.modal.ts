export class Role {
    roleTypeId: number;
    roleType: string;
    roleTypeKey: string;

    generateObject(obj: any): void {
        this.roleTypeId = obj.role_type_id;
        this.roleType = obj.role_type;
        this.roleTypeKey = obj.role_type_key;
    }
}

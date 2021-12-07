export class Permission {
    name: string;
    id: number;
    key: string;
    application_id: number;
    module_id: number;
    module_permission_id: number;

    generateObj(obj: any) {
        this.name = obj.permission_name;
        this.id = obj.permission_id;
        this.application_id = obj.application_id;
        this.module_id = obj.module_id;
        this.module_permission_id = obj.module_permission_id;
    }
}

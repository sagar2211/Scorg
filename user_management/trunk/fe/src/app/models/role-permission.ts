import { Permission } from './permission';

export class RolePermission {
    id: number;
    permissions: Array<Permission>;

    generateObject(obj) {
        this.id = obj.role_id;
    }
}

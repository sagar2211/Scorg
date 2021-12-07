export class ServiceType {
  id: number;
  name: string;
  key: string;
  description?: string;
  isActive: boolean;

  isObjectValid(obj: any): boolean {
    return obj.hasOwnProperty('service_type_id') ? obj.hasOwnProperty('service_type') ?
      obj.hasOwnProperty('display_name') ? true : false : false : false;
  }

  generateObject(obj: any): void {
    this.id = obj.service_type_id || obj.serviceTypeId || obj.id || null;
    this.name = obj.display_name || obj.serviceType || obj.name || null;
    this.key = obj.service_type || obj.key || null;
    this.description = obj.description || null;
    this.isActive = obj.is_active || obj.isActive || true;
  }
}



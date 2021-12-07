export class Provider {
    providerId: number;
    providerTypeName: string;
    providerType: string;
    providerValueId: number;
    providerName: string;

    constructor(obj: any) {
        this.providerId = obj.entity_id ? obj.entity_id : null;
        this.providerTypeName = obj.entity_name ? obj.entity_name : null;
        this.providerType = obj.entity_alias ? obj.entity_alias : null;
        this.providerValueId = obj.entity_value_id ? obj.entity_value_id : null;
        this.providerName = obj.entity_value_name ? obj.entity_value_name : null;
    }
}
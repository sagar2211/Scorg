export class TemplateCategory {
    id: number;
    key: string;
    name: string;
    isActive: boolean;

    isObjectValid(obj: any) {
        return (obj.hasOwnProperty('template_category_id') || obj.hasOwnProperty('id'))
            && (obj.hasOwnProperty('category_name') || obj.hasOwnProperty('name'))
            && (obj.hasOwnProperty('category_tag') || obj.hasOwnProperty('key')) ? true : false;
    }

    generateObject(obj: any) {
        this.id = obj.template_category_id || obj.id;
        this.name = obj.category_name || obj.name;
        this.key = obj.category_tag || obj.key;
        this.isActive = obj.template_isactive || obj.isActive;
    }
}

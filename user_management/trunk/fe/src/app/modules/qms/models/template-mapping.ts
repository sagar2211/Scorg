export class TemplateMapping {
    'id': number;
    'entity_id': number;
    'entity_name': string;
    'template_category_id': number;
    'category_name': string;
    'event_name': string;
    'template_id': number;
    'template_name': string;
    'template_isactive': boolean;
    'event_display_name': string;

    isObjectValid(obj: any) {
      return obj.hasOwnProperty('id') ? true : false;
    }
    generateObject(obj: any) {
      this.id = obj.id;
      this.entity_id = obj.entity_id;
      this.entity_name = obj.entity_name;
      this.template_category_id = obj.template_category_id;
      this.category_name = obj.category_name;
      this.event_name = obj.event_name;
      this.template_id = obj.template_id;
      this.template_name = obj.template_name;
      this.template_isactive = obj.template_isactive ? obj.template_isactive : false;
      this.event_display_name = obj.event_display_name;
    }
  }

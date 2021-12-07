import { TemplateCategory } from './template-category.model';

export class Template {
  id: number;
  name: string;
  isActive: boolean;
  email: string;
  sms: string;
  whatsApp: string;
  category: TemplateCategory;
  templateFor: string;
  eventValue: string;
  eventName: string;
  is_email_template: boolean;
  is_sms_template: boolean;
  is_whatsapp_template: boolean;

  generateObject(obj: any) {
    this.id = obj.template_id;
    this.name = obj.template_name;
    this.isActive = obj.template_isactive;
    this.email = obj.template_email_template;
    this.sms = obj.template_sms_template;
    this.whatsApp = obj.whatsapp_template || null;
    this.templateFor = obj.template_for ? obj.template_for : '';
    this.eventValue = obj.event_value;
    this.eventName = obj.event_name;
    this.is_email_template = obj.is_email_template;
    this.is_sms_template = obj.is_sms_template;
    this.is_whatsapp_template = obj.is_whatsapp_template;

    this.category = this.generateCategoryObject(obj);
  }

  generateCategoryObject(obj) {
    const catModel = new TemplateCategory();
    const tempobj = {
      id: obj.template_category_id ? obj.template_category_id : obj.category_id,
      name: obj.category_name,
      key: obj.category_tag ? obj.category_tag : obj.category_name,
      isActive: true
    };
    catModel.generateObject(tempobj);
    return catModel;
  }
}

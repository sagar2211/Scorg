import { TemplateCategory } from './template-category.model';

export class Template {
  id: number;
  name: string;
  isActive: boolean;
  email: string;
  sms: string;
  category: TemplateCategory;
  templateFor: string;
  eventValue: string;
  eventName: string;

    generateObject(obj: any) {
      this.id = obj.template_id;
      this.name = obj.template_name;
      this.isActive = obj.template_isactive;
      this.email = obj.template_email_template;
      this.sms = obj.template_sms_template;
      this.templateFor = obj.template_for ? obj.template_for : '';
      this.eventValue = obj.event_value;
      this.eventName = obj.event_name;

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

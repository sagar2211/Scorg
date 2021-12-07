import * as _ from 'lodash';
export class ReportMenus {
  menuId: number;
  menuName: string;
  menuURL: string;
  menuKey: string;

  generateObj(obj) {
    this.menuId =  obj && obj.menu_id;
    this.menuName = obj && obj.menu_text;
    this.menuURL = obj && obj.menu_url;
    this.menuKey = (obj && obj.menu_text) ? _.camelCase(obj.menu_text) : undefined;
  }
}

export class ReportMenuRoutingDetails {
  linkKey: string;
  name: string;
  isActive: boolean;
  isFavourite: boolean;
  cssClass: string;
  isVisible: boolean;
  permission?: string;
}

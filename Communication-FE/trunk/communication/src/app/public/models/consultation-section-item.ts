import { Type } from '@angular/core';

export class ConsultationSectionItem {
  constructor(public component: Type<any>, public groupKey: string, public name: string, public data: any) {}
}

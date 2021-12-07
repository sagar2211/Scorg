export class Advice {
  id: string;
  name: string;
  description: string;
  isFav: boolean;
  
  constructor() { }

  isObjectValid(obj: any) {
    return (obj.hasOwnProperty('advice_id') && obj.advice_id !== '') ?
      (obj.hasOwnProperty('advice_id') && obj.advice_id !== '') ?
        (obj.hasOwnProperty('description') && obj.description !== '') ? true : false : false : false;
  }
  generateObject(obj: any): void {
    this.id = obj.advice_id || obj.id || '';
    this.name = obj.template_name || obj.name || '';
    this.description = obj.description || '';
    this.isFav = obj.suggestion_flag && obj.suggestion_flag === 'user_fav' ? true : false;
  }
}

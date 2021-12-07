import { Pipe, PipeTransform } from '@angular/core';
import { TranslateLangService } from './../../../public/services/translate-lang.service';

@Pipe({
  name: 'translate',
  pure: false
})
export class TranslatePipe implements PipeTransform {

  constructor(
    private translate: TranslateLangService
  ) { }

  transform(key: any, args?: any): any {
    // this._translate.use()
    if (args === 'number' && key) { // --convert numbers(en, hi, mr)
      let val = key;
      val = val.toString().split('');
      let newtext = '';
      for (let i = 0; i < val.length; i++) {
        newtext += newtext + this.translate.prescriotionLanguageData[val[i]] === undefined ? val[i] : this.translate.prescriotionLanguageData[val[i]] || val[i];
      }
      return newtext;
    } else { // -- translate the language(en, hi, mr)
      return (this.translate.prescriotionLanguageData[key] || key) + ': ';
    }
  }

}

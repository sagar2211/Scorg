import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TranslateLangService {
  prescriotionLanguageData: any = {};
  adviceLanguageData: any = {};

  constructor(private http: HttpClient) { }

  use(lang: string, source: string): Observable<any> {
    const langPath = `../assets/i18n/${lang || 'en'}.json`;
    return this.http.get(langPath).pipe(
      map(res => {
        if (source === 'prescription') {
          return this.prescriotionLanguageData = Object.assign({}, res || {});
        }
        if (source === 'advice') {
          return this.adviceLanguageData = Object.assign({}, res || {});
        }
      })
    );
  }
}

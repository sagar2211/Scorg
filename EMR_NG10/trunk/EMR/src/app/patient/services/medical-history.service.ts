import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import * as _ from 'lodash';
import { map } from 'rxjs/operators';
import { IFormData } from '../../public/models/iFormData';
import { environment } from 'src/environments/environment';

export const defaultMedicalHistoryObj = { // medicalHistoryObj
  medicalHistoryNote: '',
  attachmentData: []
};

@Injectable({
  providedIn: 'root'
})
export class MedicalHistoryService {
  medicalHistoryInputs: IFormData[] = [];
  medicalHistoryFilesInputs: any;

  constructor(
    private http: HttpClient
  ) { }

  // API: medicine/get_prescription_by_diagnosis_id. Method: POST.
  // getMedicalHistoryAttachmentData(patientId): Observable<any> {
  //   const medicalHistoryInputs = this.consultationService.getConsultationFormDataByKey(patientId, 'medicalHistoryFilesInputs');
  //   if (medicalHistoryInputs && !_.isEmpty(medicalHistoryInputs)) {
  //     return of(medicalHistoryInputs);
  //   }
  //   const defaultObj = _.cloneDeep(defaultMedicalHistoryObj);
  //   return of(this.consultationService.setConsultationFormData(patientId, 'medicalHistoryFilesInputs', defaultObj));
  // }

  getMedicalHistoryAttachmentData(patId): Observable<any> {
    const self = this;
    const reqUrl = environment.STATIC_JSON_URL + 'medical-history.json';
    return this.http.get(reqUrl).pipe(
      map((res: any) => {
        res = res.medicalHistoryFilesInputs;
        if (_.isEmpty(this.medicalHistoryFilesInputs)) {
          const medicalHistoryData = {
            medicalHistoryNote: res.medical_history_note,
            attachmentData: res.attachment_data
          };
          self.medicalHistoryFilesInputs = medicalHistoryData;
        }
        return self.medicalHistoryFilesInputs;
      })
    );
  }

  // addMedicalHistoryAttachments(medicalHistoryNote, fileInputs) {
  //   const medicalHistoryData = {
  //     medicalHistoryNote: medicalHistoryNote ? medicalHistoryNote : '',
  //     attachmentData: fileInputs
  //   };
  //   this.medicalHistoryFilesInputs = medicalHistoryData;
  // }

}

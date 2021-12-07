import { environment } from '../../../environments/environment';
import { PublicService } from './public.service';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map, filter } from 'rxjs/operators';
import * as _ from 'lodash';
import { IFormData } from './prescription.service';
import { ConsultationService } from './consultation.service';

@Injectable({
  providedIn: 'root'
})
export class ImageAnnotationService {
  imageAnnotationInputs: IFormData[] = [];

  imageAnnotationDefaultObject = [
  ];

  constructor(
    private http: HttpClient,
    private publicService: PublicService,
    private consultationService: ConsultationService) {
  }


  getImageAnnotationData(patientId): Observable<any> {
    const complaintsData = this.consultationService.getConsultationFormDataByKey(patientId, 'imageAnnotation');
    if (!_.isEmpty(complaintsData)) {
      return of(complaintsData);
    } else {
      const dt = _.cloneDeep(this.imageAnnotationDefaultObject);
      return of(this.consultationService.setConsultationFormData(patientId, 'imageAnnotation', dt));
    }
  }

  uploadImageForAnnotation(fileData: any): Observable<any> {
    // const url = environment.dashboardBaseURL  + '/ImageAnnotation/UploadImageAnnotation';
    // const params = {
    //   files: fileData
    // };
    // return this.http.post(url, params).pipe(
    //   map((res: any) => {
    //     return res.data;
    //   })
    // );
    const reqUrl = environment.dashboardBaseURL + '/ImageAnnotation/UploadPatientAnnotation';
    return this.http.post(reqUrl, fileData).pipe(
      map((res: any) => {
        return res.data;
      })
    );
  }
  uploadBase64File(fileObj: any): Observable<any> {
    const param = {
      master_doc_id: 0,
      file_name: fileObj.fileName,
      file_data: fileObj.fileData,
      file_title: fileObj.fileTitle
    };
    const reqUrl = environment.dashboardBaseURL + '/ImageAnnotation/UploadBase64File';
    return this.http.post(reqUrl, param).pipe(
      map((res: any) => {
        return res.data;
      })
    );
  }


  getDoctorImageAnnotationFiles(obj): Observable<any> {
    const url = environment.dashboardBaseURL + '/ImageAnnotation/GetImageAnnotationList';
    const params = {
      service_type_id: obj.serviceTypeId,
      speciality_id: obj.specialityId,
      page_number: obj.pageNumber,
      limit: obj.limit
    };

    // call method here.
    return this.http.post(url, params).pipe(
      map((res: any) => {
        return res.data;
      })
    );
  }

  getBase64FileByMasterDocId(masterDocId): Observable<any> {
    const reqUrl = environment.dashboardBaseURL + '/ImageAnnotation/GetBase64FileByMasterDocId?MasterDocId=' + masterDocId;
    return this.http.get(reqUrl).pipe(
      map((res: any) => {
        return res.data;
      })
    );
  }
}

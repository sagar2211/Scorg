import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable()
export class SectionMasterService {
    constructor(
    private  http:HttpClient
    ){}

     getSelectedSectionDetails(param):Observable<any>{
        let url = `${environment.baseUrlAppointment}/QueueMaster/getRoomSectionMappingListWithEntity`
        return this.http.post(url,param).pipe(map((res: any) => {
            if (res.status_message === 'Success') {
              return res;
            } else {
              return null;
            }
          }))
    }

}
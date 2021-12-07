import { Injectable } from '@angular/core';
import {Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';
import {HttpClient} from '@angular/common/http';
import * as _ from 'lodash';
import {ReportMenus, PrescriptionDetails} from '../models/report-menus-model';
import { environment } from 'src/environments/environment';


// export class Employee {
//   patientID: number;
//   patientName: string;
//   pres: [
//     {
//       prescriptionId: 4,
// 				prescriptionDate: "2021-08-19T00:00:00+05:30",
// 				doctorName: "SNEHA SHENOY",
// 				visitType: "IP",
// 				medicine : {
// 				  "medicineId": 4,
// 				  "medicineName": "sdfsa gdgghfhj fj jh gfhj ",
// 				  "requiredQty": 1,
// 				  "issueQty": 0,
// 				  "saleQty": 1,
// 				  "prescriptionId": 4,
// 				  "prescriptionDate": "2021-08-19T19:18:06.17+05:30",
// 				  "doctorName": "SNEHA SHENOY",
// 				  "frequency": 1,
// 				  "dose": "",
// 				  "doseUnit": "",
// 				  "route": "",
// 				  "sig": "",
// 				  "days": "1",
// 				  "closingStockData": []
// 				}
//     }
//   ];
//   Prefix: string;
//   Position: string;
//   Picture: string;
//   BirthDate: string;
//   HireDate: string;
//   Notes: string;
//   Address: string;
//   State: string;
//   City: string;
// }

let patient = [
  {
    patientID: "20180500117",
    patientName: "ADITI KUMAR",
    prescriptionId: 4,
    prescriptionDate: "2021-08-19T00:00:00+05:30",
    prescriptionCount : 2,
    itemCount : 3,
    doctorName: "SNEHA SHENOY",
    visitType: "IP",
    medicineId: 4,
    medicineName: "sdfsa gdgghfhj fj jh gfhj ",
    requiredQty: 1,
    issueQty: 0,
    saleQty: 1,
    frequency: 1,
    dose: "",
    doseUnit: "",
    route: "",
    sig: "",
    days: "1",
    closingStockData: [],
    isExpanded : false,
    id: Math.random()
  },
  {
    patientID: "20180500118",
    patientName: "SAGAR BHUJBAL",
    prescriptionId: 8,
    prescriptionDate: "2021-08-19T00:00:00+05:30",
    prescriptionCount : 2,
    itemCount : 3,
    doctorName: "AMAR",
    visitType: "IP",
    medicineId: 4,
    medicineName: "DOLO 500 ",
    requiredQty: 1,
    issueQty: 0,
    saleQty: 1,
    frequency: 1,
    dose: "",
    doseUnit: "",
    route: "",
    sig: "",
    days: "1",
    closingStockData: [],
    isExpanded : false,
    id: Math.random()
  },
  {
    patientID: "20180500118",
    patientName: "SAGAR BHUJBAL",
    prescriptionId: 8,
    prescriptionDate: "2021-08-19T00:00:00+05:30",
    prescriptionCount : 2,
    itemCount : 3,
    doctorName: "AMAR",
    visitType: "IP",
    medicineId: 4,
    medicineName: "fdgdfg 500 ",
    requiredQty: 1,
    issueQty: 0,
    saleQty: 1,
    frequency: 1,
    dose: "",
    doseUnit: "",
    route: "",
    sig: "",
    days: "1",
    closingStockData: [],
    isExpanded : false,
    id: Math.random()
  },
  {
    patientID: "20180500118",
    patientName: "SAGAR BHUJBAL",
    prescriptionId: 9,
    prescriptionDate: "2021-08-19T00:00:00+05:30",
    prescriptionCount : 2,
    itemCount : 3,
    doctorName: "AMAR",
    visitType: "IP",
    medicineId: 4,
    medicineName: "ytyut 500 ",
    requiredQty: 1,
    issueQty: 0,
    saleQty: 1,
    frequency: 1,
    dose: "",
    doseUnit: "",
    route: "",
    sig: "",
    days: "1",
    closingStockData: [],
    isExpanded : false,
    id: Math.random()
  }
];
@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  
  reportMenus: any[] = [{
    menuId: 1,
    menuName: 'GRN Date Wise Report',
    menuURL: 'Report/GrnDateWise?auth_token=#token#&storeId=#storeId#',
    menuKey: 'grnDateWise'
  },
  {
    menuId: 2,
    menuName: 'GRN Item Wise Report',
    menuURL: 'Report/grnItemWise?auth_token=#token#&storeId=#storeId#',
    menuKey: 'grnItemWise'
  },
  {
    menuId: 3,
    menuName: 'GDN Date Wise Report',
    menuURL: 'Report/gdnDateWise?auth_token=#token#&storeId=#storeId#',
    menuKey: 'gdnDateWise'
  },
  {
    menuId: 4,
    menuName: 'GDN Item Wise Report',
    menuURL: 'Report/gdnItemWise?auth_token=#token#&storeId=#storeId#',
    menuKey: 'gdnItemWise'
  },
  {
    menuId: 5,
    menuName: 'Issue Report',
    menuURL: 'Report/IssueDateWise?auth_token=#token#&storeId=#storeId#',
    menuKey: 'issue'
  },
  {
    menuId: 6,
    menuName: 'Issue Item wise Report',
    menuURL: 'Report/issueItemWIse?auth_token=#token#&storeId=#storeId#',
    menuKey: 'issueItemWIse'
  },
  {
    menuId: 7,
    menuName: 'Issue Return Report',
    menuURL: 'Report/issueReturn?auth_token=#token#&storeId=#storeId#',
    menuKey: 'issueReturn'
  },
  {
    menuId: 8,
    menuName: 'Stock Reorder Report',
    menuURL: 'Report/StockReorderReport?auth_token=#token#&storeId=#storeId#',
    menuKey: 'stockReorder'
  },
  {
    menuId: 9,
    menuName: 'Stock Expiry Date Report',
    menuURL: 'Report/StockExpiryReport?auth_token=#token#&storeId=#storeId#',
    menuKey: 'stockExpDate'
  },
  {
    menuId: 10,
    menuName: 'Stock Report',
    menuURL: 'Report/StockReport?auth_token=#token#&storeId=#storeId#',
    menuKey: 'stock'
  },
  {
    menuId: 11,
    menuName: 'Opening Stock Report',
    menuURL: 'Report/OpeningStockReport?auth_token=#token#&storeId=#storeId#',
    menuKey: 'openingStock'
  },
  {
    menuId: 12,
    menuName: 'Item ledger Report',
    menuURL: 'Report/ItemLedgerReport?auth_token=#token#&storeId=#storeId#',
    menuKey: 'itemLedger'
  }];
  constructor(private http: HttpClient) { }

  getReportsMenu(): Observable<any> {
    if (this.reportMenus.length) {
      return of(this.reportMenus);
    }
    const reqUrl = `${environment.baseUrlAppointment}/DashBoard/getQMSReportMenus`;
    return this.http.get(reqUrl).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.status_message === 'Success' && res.reportMenus.length > 0) {
          _.map(res.reportMenus, (menu) => {
            const reportMenu = new ReportMenus();
            reportMenu.generateObj(menu);
            reportMenu.menuName =  _.replace(reportMenu.menuName, 'Entity', 'Provider');
            this.reportMenus.push(reportMenu);
          });
          return this.reportMenus;
        } else {
          return [];
        }
      })
    );
  }

  getPatient() {
    return patient;
  }

  getAllPrescription(param){
    const reqUrl = `${environment.baseUrlPharma}/Consumption/GetAllActivePrescriptionDetails`;
    return this.http.post(reqUrl, param).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.data.length > 0) {
          const data = [];
          _.map(res.data, (val, key) => {
            const prescriptionDetails = new PrescriptionDetails();
            if (prescriptionDetails.isObjectValid(val)) {
              prescriptionDetails.generateObject(val);
              data.push(prescriptionDetails);
            }
          });
          return { data: data, totalCount: res.total_records };
        } else {
          return { data: [], totalCount: 0 };
        }
      })
    );
  }

  getPrescriptionDetailById(param){
    const reqUrl = `${environment.baseUrlPharma}/Consumption/GetPrescriptionItemDetailsByPrescriptionId`;
    return this.http.post(reqUrl,param).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.status_message === 'Success' && res.data.length > 0) {
          return res.data;
        } else {
          return [];
        }
      })
    );
  }

}

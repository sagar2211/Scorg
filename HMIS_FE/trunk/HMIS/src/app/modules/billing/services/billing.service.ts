import { VisitType } from './../../../public/models/visit-type.model';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';
import * as _ from 'lodash';
import { ServiceModel } from '../modals/service-master-model';
import { ServiceCenterModel } from '../modals/service-center-model';
import { DoctorModel } from '../modals/doctor-model';
import { ServiceSurchargeModel } from '../modals/service-surcharge-model';
import { ComponentItemModel } from '../modals/component-model';
import { ServiceComponentItemModel } from '../modals/service-component-item-model';
import { HmisSettingModel } from '../modals/hmis-setting-model';
import { NonServiceBillHeadModel } from '../modals/nonservice-billhead-model';
import { PackageDetailModel } from '../modals/package-detail-model';
import { AdvancePaymentModel } from '../modals/advance-payment-model';
import { EmployeeModel } from '../modals/employee-model';

@Injectable()
export class BillingService {
  serviceCenterListCached: any = [];
  chargingTypeListCached: any = [];
  doctorListCached: any = [];
  employeeListCached: any = [];
  PaymentMode = [
    { id: 'CASH', name: "Cash" },
    { id: 'CHEQUE', name: "Cheque" },
    { id: 'CARD', name: "Card" },
    { id: 'NEFT', name: "NEFT" },
    { id: 'RTGS', name: "RTGS" },
    { id: 'IMPS', name: "IMPS" },
    { id: 'UPI', name: "UPI" },
    // { id: 'DebitNote', name: "Debit Note" }
  ];

  constructor(private http: HttpClient) {
    this.SavePatientBillInsuranceDetail = this.SavePatientBillInsuranceDetail.bind(this)
  }

  getQuickPatientList(searchText): Observable<any> {
    // searchText is mandatory
    if ((searchText || '') == '') {
      return of([]);
    }
    const reqUrl = `${environment.baseUrlHis}/PatientBilling/SearchPatientListForBilling?searchText=` + searchText;
    return this.http.get(reqUrl).pipe(map((res: any) => {
      if (res.status_message === 'Success' && res.data && res.data.length > 0) {
        return res.data;
      } else {
        return [];
      }
    }));
  }

  GetChargingTypeList(visitType): Observable<any> {
    // cached all charging type list
    if (this.chargingTypeListCached.length > 0) {
      const chargingTypes = _.filter(this.chargingTypeListCached, (o) => { return o.visitType == visitType; });
      return of(chargingTypes);
    }
    const reqUrl = `${environment.baseUrlHis}/PatientBilling/GetChargingTypeList`;
    return this.http.get(reqUrl).pipe(map((res: any) => {
      if (res.status_message === 'Success' && res.data && res.data.length > 0) {
        this.chargingTypeListCached = res.data;
        const chargingTypes = _.filter(this.chargingTypeListCached, (o) => { return o.visitType == visitType; });
        return chargingTypes;
      } else {
        return [];
      }
    }));
  }

  GetCategoryTypeList(chargingtypeId, visitType): Observable<any> {
    chargingtypeId = chargingtypeId ? chargingtypeId : 0;
    const reqUrl = `${environment.baseUrlHis}/Patient/GetPatientCategory?chargingtypeId=` + chargingtypeId + '&PenType=' + visitType;
    return this.http.get(reqUrl).pipe(map((res: any) => {
      if (res.status_message === 'Success' && res.data && res.data.length > 0) {
        return res.data;
      } else {
        return null;
      }
    }));
  }

  getDoctorNameForPatient(uhid, penId): Observable<any> {
    penId = penId ? penId : 0;
    const reqUrl = `${environment.baseUrlHis}/PatientBilling/getDoctorNameForPatient?uhid=` + uhid + '&penId=' + penId;
    return this.http.get(reqUrl).pipe(map((res: any) => {
      if (res.status_message === 'Success' && res.data && res.data.length > 0) {
        return res.data[0];
      } else {
        return null;
      }
    }));
  }

  getOrderedServicesList(reqParams): Observable<any> {
    const reqUrl = `${environment.baseUrlHis}/PatientBilling/GetOrderedServicesApi`;
    return this.http.post(reqUrl, reqParams).pipe(map((res: any) => {
      return res;
    }));
  }

  getPatientPackageInclusiveDetail(penId, billMainId): Observable<any> {
    const reqUrl = `${environment.baseUrlHis}/PatientBilling/GetPatientPackageInclusiveDetail?penId=` + penId + '&billMainId=' + billMainId;
    return this.http.get(reqUrl).pipe(map((res: any) => {
      if (res.status_message === 'Success') {
        const tempArray = [];
        _.map(res.data, (d) => {
          const tempObj = new PackageDetailModel();
          tempObj.generateObject(d, 'inclusive');
          tempArray.push({ ...tempObj });
        })
        return tempArray;
      } else {
        return [];
      }
    }));
  }

  getPackageDetailsById(packageId, chargingTypeId, visitType, billRowTempId): Observable<any> {
    const reqUrl = `${environment.baseUrlHis}/ServiceEstimation/getPackageDetailsById?packageId=` + packageId + '&chargingTypeId=' + chargingTypeId + '&visitType=' + visitType;
    return this.http.get(reqUrl).pipe(map((res: any) => {
      if (res.status_message === 'Success') {
        const tempArray = [];
        _.map(res.data, (d) => {
          const tempObj = new PackageDetailModel();
          tempObj.generateObject(d, billRowTempId);
          tempArray.push({ ...tempObj });
        })
        return tempArray;
      } else {
        return [];
      }
    }));
  }

  generateServiceData(searchKeyword, visitType, serviceCenterId): Observable<any> {
    const reqUrl = `${environment.baseUrlHis}/PatientBilling/GenerateServiceData?searchText=` + (searchKeyword || '') + `&serviceCenterId=` + (serviceCenterId || 0) + `&visitType=` + (visitType || '');
    return this.http.get(reqUrl).pipe(map((res: any) => {
      if (res.status_message === 'Success') {
        const temp = [];
        _.map(res.data, (d) => {
          const serviceObj = new ServiceModel();
          serviceObj.generateObject(d);
          temp.push({ ...serviceObj });
        })
        return temp;
      } else {
        return [];
      }
    }));
  }

  getServiceRate(params): Observable<any> {
    const reqUrl = `${environment.baseUrlHis}/PatientBilling/getServiceRate`;
    return this.http.post(reqUrl, params).pipe(map((res: any) => {
      if (res.status_message === 'Success') {
        return res.data;
      } else {
        return { rate: 0, isRateDefined: false };
      }
    }));
  }

  GetBillServiceRates(params): Observable<any> {
    const reqUrl = `${environment.baseUrlHis}/PatientBilling/GetBillServiceRates`;
    return this.http.post(reqUrl, params).pipe(map((res: any) => {
      if (res.status_message === 'Success') {
        return res.data;
      } else {
        return [];
      }
    }));
  }

  getServiceGradeList(serviceId, chargingTypeId): Observable<any> {
    const reqUrl = `${environment.baseUrlHis}/PatientBilling/getServiceGradeList?srvid=` + serviceId + '&chargingtypeid=' + chargingTypeId;
    return this.http.get(reqUrl).pipe(map((res: any) => {
      if (res.status_message === 'Success') {
        return res.data;
      } else {
        return {
          srvGradeList: [],
          componentList: []
        };
      }
    }));
  }

  loadComponents(serviceId): Observable<any> {
    const reqUrl = `${environment.baseUrlHis}/PatientBilling/LoadComponents?serviceId=` + serviceId;
    return this.http.get(reqUrl).pipe(map((res: any) => {
      if (res.status_message === 'Success') {
        const componentList = _.uniq(res.data.nonselectedComp.concat(res.data.selectedComp));
        const tempArray = [];
        _.map(componentList, (d) => {
          const tempObj = new ComponentItemModel();
          if (tempObj.isObjectValid(d)) {
            tempObj.generateObject(d);
            tempArray.push(tempObj);
          }
        });
        return tempArray;
      } else {
        return [];
      }
    }));
  }

  getComponentItems(params: any): Observable<any> {
    const reqUrl = `${environment.baseUrlHis}/PatientBilling/GetComponentItems`;
    return this.http.post(reqUrl, params).pipe(map((res: any) => {
      if (res.status_message === 'Success') {
        const tempArray = [];
        _.map(res.data.componentList, (d) => {
          const tempObj = new ServiceComponentItemModel();
          if (tempObj.isObjectValid(d)) {
            tempObj.generateObject(d);
            tempArray.push(tempObj);
          }
        });
        return tempArray;
      } else {
        return [];
      }
    }));
  }

  getComponentDetails(compId: any): Observable<any> {
    const reqUrl = `${environment.baseUrlHis}/PatientBilling/GetComponentDetails?compId=` + compId;
    return this.http.get(reqUrl).pipe(map((res: any) => {
      if (res.status_message === 'Success') {
        return res.data;
      } else {
        return null;
      }
    }));
  }

  getSettingDetails(): Observable<any> {
    const reqUrl = `${environment.baseUrlHis}/HMISSettings/getSettingDetails`;
    return this.http.get(reqUrl).pipe(map((res: any) => {
      if (res.status_message === 'Success') {
        const temp = [];
        _.map(res.data, (d) => {
          const tempObj = new HmisSettingModel();
          tempObj.generateObject(d);
          temp.push({ ...tempObj });
        });
        return temp;
      } else {
        return [];
      }
    }));
  }

  getNonServiceBillingHeadList(): Observable<any> {
    const reqUrl = `${environment.baseUrlHis}/PatientBilling/getNonServiceBillingHeadList`;
    return this.http.get(reqUrl).pipe(map((res: any) => {
      if (res.status_message === 'Success') {
        const temp = [];
        _.map(res.data, (d) => {
          const tempObj = new NonServiceBillHeadModel();
          tempObj.generateObject(d);
          temp.push({ ...tempObj });
        });
        return temp;
      } else {
        return [];
      }
    }));
  }

  GetServiceHeadAllList(): Observable<any> {
    const reqUrl = `${environment.baseUrlHis}/ServiceHead/GetServiceHeadAllList`;
    return this.http.get(reqUrl).pipe(map((res: any) => {
      if (res.status_message === 'Success') {
        return res.data;
      } else {
        return [];
      }
    }));
  }

  GetServiceListBySearchKeyword(searchKeyword): Observable<any> {
    const reqUrl = `${environment.baseUrlHis}/ServiceMaster/GetServiceListBySearchKeyword?searchKeyword=` + searchKeyword;
    return this.http.get(reqUrl).pipe(map((res: any) => {
      if (res.status_message === 'Success') {
        return res.data;
      } else {
        return [];
      }
    }));
  }

  getEmployeeList(): Observable<any> {
    // cached all service centers list
    if (this.employeeListCached.length > 0) {
      return of(this.employeeListCached);
    }
    const reqUrl = `${environment.baseUrlHis}/Patient/getStaff`;
    return this.http.get(reqUrl).pipe(map((res: any) => {
      if (res.status_message === 'Success') {
        const temp = [];
        _.map(res.data, (d) => {
          const employeeObj = new EmployeeModel();
          employeeObj.generateObject(d);
          temp.push({ ...employeeObj });
        });
        this.employeeListCached = temp;
        return temp;
      } else {
        return [];
      }
    }));
  }

  getDoctorsList(): Observable<any> {
    // cached all service centers list
    if (this.doctorListCached.length > 0) {
      return of(this.doctorListCached);
    }
    const reqUrl = `${environment.baseUrlHis}/PatientBilling/GetDoctorsList`;
    return this.http.get(reqUrl).pipe(map((res: any) => {
      if (res.status_message === 'Success') {
        const temp = [];
        _.map(res.data, (d) => {
          const doctorObj = new DoctorModel();
          doctorObj.generateObject(d);
          temp.push({ ...doctorObj });
        });
        this.doctorListCached = temp;
        return temp;
      } else {
        return [];
      }
    }));
  }

  getServiceSurcharge(serviceIds): Observable<any> {
    const reqParams = serviceIds; // { srvIds: serviceIds }
    const reqUrl = environment.baseUrlHis + '/PatientBilling/GetServiceSurcharge';
    return this.http.post(reqUrl, reqParams).pipe(map((res: any) => {
      if (res.status_message === 'Success') {
        const temp = [];
        _.map(res.data, (d) => {
          const typeObj = new ServiceSurchargeModel();
          typeObj.generateObject(d);
          temp.push({ ...typeObj });
        });
        return temp;
      } else {
        return [];
      }
    }));
  }

  GetPatientPayDetails(param): Observable<any> {
    const reqUrl = environment.baseUrlHis + '/PatientBilling/GetPatientPayDetails';
    return this.http.post(reqUrl, param).pipe(
      map((res: any) => {
        if (res.status_message === 'Success') {
          return res.data;
        } else {
          return [];
        }
      })
    );
  }

  GetServiceCenterList(serviceId): Observable<Array<ServiceCenterModel>> {
    serviceId = (serviceId || 0)
    // cached all service centers list
    const centerCached = _.find(this.serviceCenterListCached, (o) => { return o.serviceId == serviceId; });
    if (centerCached) {
      return of(centerCached.data);
    }
    const reqUrl = `${environment.baseUrlHis}/PatientBilling/GetServiceCenterList?Id=` + serviceId;
    return this.http.get(reqUrl).pipe(map((res: any) => {
      if (res.status_message === 'Success') {
        const temp = [];
        _.map(res.data.srvcenterList, (d) => {
          const centerObj = new ServiceCenterModel();
          centerObj.generateObject(d);
          temp.push({ ...centerObj });
        });
        this.serviceCenterListCached.push({ serviceId: serviceId, data: temp });
        return temp;
      } else {
        return [];
      }
    }));
  }

  UpdateServiceOrderStatusApi(sodId, updateStatus): Observable<any> {
    const reqUrl = `${environment.baseUrlHis}/StatusBrowser/UpdateServiceOrderStatusApi?sodId=${sodId}&updateStatus=${updateStatus}`;
    return this.http.get(reqUrl).pipe(map((res: any) => {
      if (res.status_message === 'Success') {
        return res.data;
      } else {
        return 'Failed';
      }
    })
    )
  };

  savePatientBillData(reqParam): Observable<any> {
    const reqUrl = `${environment.baseUrlHis}/PatientBilling/SavePatientBillData`;
    return this.http.post(reqUrl, reqParam).pipe(map((res: any) => {
      return res;
    })
    )
  };

  getBankDepoTypeDetails(searchText, flag): Observable<any> {
    if ((searchText || '') == '') {
      return of([]);
    }
    const reqUrl = `${environment.baseUrlHis}/PatientBilling/GetBankDepoTypeDetails?searchText=${searchText}&flag=${flag}`;
    return this.http.get(reqUrl).pipe(map((res: any) => {
      if (res.status_message === 'Success') {
        return res.data;
      } else {
        return [];
      }
    })
    )
  };

  AddEditPatientPaymentDetails(param): Observable<any> {
    const reqUrl = environment.baseUrlHis + '/PatientBilling/AddEditPatientPaymentDetails';
    return this.http.post(reqUrl, param).pipe(
      map((res: any) => {
        return res;
      })
    );
  }

  getAdvancePaymentDetailsList(uhId: any, patEncounterId: any): Observable<any> {
    const reqUrl = `${environment.baseUrlHis}/PatientBilling/GetAdvancePaymentDetailsList?uhId=${uhId}&patEncounterId=${patEncounterId}`;
    return this.http.get(reqUrl).pipe(map((res: any) => {
      if (res.status_message === 'Success') {
        const result = [];
        _.map(res.data, (d: any) => {
          const advanceData = new AdvancePaymentModel();
          advanceData.isAdvanceApply = d.PapChqCleared == "Y" ? true : false;
          var balanceAmount = isNaN(parseFloat(d.BalanceAmount)) ? 0.00 : parseFloat(d.BalanceAmount).toFixed(2);
          if (d.BalanceAmount == null) {
            balanceAmount = parseFloat(d.PapAmount).toFixed(2);
          }
          advanceData.balanceAmount = _.cloneDeep(balanceAmount);
          advanceData.applicableAmount = 0; //_.cloneDeep(balanceAmount);
          advanceData.generateObject(d);
          result.push(advanceData);
        });
        return result;
      } else {
        return [];
      }
    })
    )
  }

  getInsuranceDetail(uhId, patEncounterId) {
    const reqUrl = `${environment.baseUrlHis}/PatientBilling/GetPatientInsuranceDetails?uhId=${uhId}&patEncounterId=${patEncounterId}`;
    return this.http.get(reqUrl).pipe(map((res: any) => {
      if (res.status_message === 'Success') {
        return res.data;
      } else {
        return [];
      }
    })
    )
  }

  SavePatientBillInsuranceDetail(param) {
    const reqUrl = environment.baseUrlHis + '/PatientBilling/SavePatientBillInsuranceDetail';
    return this.http.post(reqUrl, param).pipe(
      map((res: any) => {
        if (res.status_message === 'Success') {
          return res.data;
        } else {
          return [];
        }
      })
    );
  }

  updateDiscountApprovalRequest(param) {
    const reqUrl = environment.baseUrlHis + '/PatientBilling/UpdateDiscountApprovalRequest';
    return this.http.post(reqUrl, param).pipe(
      map((res: any) => {
        if (res.status_message === 'Success') {
          return res.data;
        } else {
          return [];
        }
      })
    );
  }

  getPatientEncounterData(penId) {
    const reqUrl = `${environment.baseUrlHis}/PatientBilling/GetPatientEncounterData?penId=${penId}`;
    return this.http.get(reqUrl).pipe(map((res: any) => {
      if (res.status_message === 'Success') {
        return res.data;
      } else {
        return [];
      }
    })
    )
  }
  cancelPatientBill(reqParam): Observable<any> {
    const reqUrl = `${environment.baseUrlHis}/PatientBilling/CancelPatientBill`;
    return this.http.post(reqUrl, reqParam).pipe(map((res: any) => {
      return res;
    })
    )
  };

  getDabitNote(reqParam){
    const reqUrl = `${environment.baseUrlHis}/PatientBilling/GetDebitNoteByBillId`;
    return this.http.post(reqUrl, reqParam).pipe(map((res: any) => {
      if (res.status_message === 'Success') {
        return res.data;
      } else {
        return [];
      }
    })
    )
  }

  saveDabitNote(reqParam){
    const reqUrl = `${environment.baseUrlHis}/PatientBilling/SaveDebitNote`;
    return this.http.post(reqUrl, reqParam).pipe(map((res: any) => {
      if (res.status_message === 'Success') {
        return res;
      } else {
        return null;
      }
    })
    )
  }

  patientBillVerification(reqParam) {
    const reqUrl = environment.baseUrlHis + '/PatientBilling/PatientBillVerification';
    return this.http.post(reqUrl, reqParam).pipe(
      map((res: any) => {
        if (res.status_message === 'Success') {
          return res.data;
        } else {
          return [];
        }
      })
    );
  }
}

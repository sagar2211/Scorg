import { EncounterPatient } from './../../public/models/encounter-patient.model';
import { Component, OnInit } from '@angular/core';
import * as _ from 'lodash';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { CommonService } from 'src/app/public/services/common.service';
import { HistoryService } from 'src/app/history/history.service';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
@Component({
  selector: 'app-investigation-history',
  templateUrl: './investigation-history.component.html',
  styleUrls: ['./investigation-history.component.scss']
})
export class InvestigationHistoryComponent implements OnInit {

  apiData: any;
  visitDatesArray = [];
  dateWiseInvestigationData = [];
  patientObj: EncounterPatient;
  patientId: any;
  loadtable: boolean;
  constructor(
    private commonService: CommonService,
    private historyService: HistoryService,
    private router: Router,
  ) {
  }

  ngOnInit() {
    this.loadtable = false;
    this.getpatientData();
    this.apiData = [
      {
        "serviceTypeId": 1,
        "serviceType": "IP",
        "visitNo": "IP0001",
        "visitDate": "2021-01-07T05:15:11.394Z",
        "orderData": [
          {
            "orderId": 1,
            "serviceId": 1,
            "serviceName": "Investigation",
            "orderDateTime": "2021-01-07T07:15:11.394Z",
            isFinal: false,
            isCritical: true,
            "parameterData": [
              {
                "parameterId": 1,
                "parameterDesc": "HbA1C- Glycated Haemoglobin (HPLC)(Serum,Enzymatic)",
                "result": "4.9",
                "unit": "%",
                "refRange": "Disarable: < 200 Borderline, High: 200-239, High: > 240",
                "textRefRange": "Disarable: < 200 Borderline, High: 200-239, High: > 240",
                "remark": "Test performed",
                "isQualitative": false,
                isNormal: true
              },
              {
                "parameterId": 2,
                "parameterDesc": "Estimated Average Glucose (eAG)",
                "result": "93.93",
                "unit": "mg/dL",
                "refRange": "Disarable: < 200 Borderline, High: 200-239, High: > 240",
                "textRefRange": "Disarable: < 200 Borderline, High: 200-239, High: > 240",
                "remark": "Test performed",
                "isQualitative": false,
                isNormal: true
              }
            ]
          },
          {
            "orderId": 1,
            "serviceId": 2,
            "serviceName": "Lipid-Profile-2",
            "orderDateTime": "2021-01-07T07:15:11.394Z",
            isFinal: true,
            isCritical: true,
            "parameterData": [
              {
                "parameterId": 3,
                "parameterDesc": "Cholesterol-Total",
                "result": "108",
                "unit": "mg/dL",
                "refRange": "Disarable: < 200 Borderline, High: 200-239, High: > 240",
                "textRefRange": "Disarable: < 200 Borderline, High: 200-239, High: > 240",
                "remark": "Test performed",
                "isQualitative": false,
                isNormal: true
              }
            ]
          },
          {
            "orderId": 2,
            "serviceId": 1,
            "serviceName": "Investigation",
            "orderDateTime": "2021-01-08T09:15:11.394Z",
            isFinal: true,
            isCritical: true,
            "parameterData": [
              {
                "parameterId": 1,
                "parameterDesc": "HbA1C- Glycated Haemoglobin (HPLC)(Serum,Enzymatic)",
                "result": "5.2",
                "unit": "%",
                "refRange": "Disarable: < 200 Borderline, High: 200-239, High: > 240",
                "textRefRange": "Disarable: < 200 Borderline, High: 200-239, High: > 240",
                "remark": "Test performed",
                "isQualitative": false,
                isNormal: true
              },
              {
                "parameterId": 2,
                "parameterDesc": "Estimated Average Glucose (eAG)",
                "result": "102.54",
                "unit": "mg/dL",
                "refRange": "Disarable: < 200 Borderline, High: 200-239, High: > 240",
                "textRefRange": "Disarable: < 200 Borderline, High: 200-239, High: > 240",
                "remark": "Test performed",
                "isQualitative": false,
                isNormal: true
              }
            ]
          },
          {
            "orderId": 2,
            "serviceId": 2,
            "serviceName": "Lipid-Profile-2",
            "orderDateTime": "2021-01-08T09:15:11.394Z",
            isFinal: true,
            isCritical: true,
            "parameterData": [
              {
                "parameterId": 3,
                "parameterDesc": "Cholesterol-Total",
                "result": "108",
                "unit": "mg/dL",
                "refRange": "Disarable: < 200 Borderline, High: 200-239, High: > 240",
                "textRefRange": "Disarable: < 200 Borderline, High: 200-239, High: > 240",
                "remark": "Test performed",
                "isQualitative": false,
                isNormal: true
              }
            ]
          },
          {
            "orderId": 3,
            "serviceId": 1,
            "serviceName": "Investigation",
            "orderDateTime": "2021-01-10T12:15:11.394Z",
            isFinal: true,
            isCritical: true,
            "parameterData": [
              {
                "parameterId": 1,
                "parameterDesc": "HbA1C- Glycated Haemoglobin (HPLC)(Serum,Enzymatic)",
                "result": "5.2",
                "unit": "%",
                "refRange": "Disarable: < 200 Borderline, High: 200-239, High: > 240",
                "textRefRange": "Disarable: < 200 Borderline, High: 200-239, High: > 240",
                "remark": "Test performed",
                "isQualitative": false,
                isNormal: true
              }
            ]
          },
          {
            "orderId": 3,
            "serviceId": 2,
            "serviceName": "Lipid-Profile-2",
            "orderDateTime": "2021-01-10T12:15:11.394Z",
            isFinal: true,
            isCritical: true,
            "parameterData": [
              {
                "parameterId": 3,
                "parameterDesc": "Cholesterol-Total",
                "result": "108",
                "unit": "mg/dL",
                "refRange": "Disarable: < 200 Borderline, High: 200-239, High: > 240",
                "textRefRange": "Disarable: < 200 Borderline, High: 200-239, High: > 240",
                "remark": "Test performed",
                "isQualitative": false,
                isNormal: true
              }
            ]
          }
        ]
      },
      {
        "serviceTypeId": 2,
        "serviceType": "oP",
        "visitNo": "IP0002",
        "visitDate": "2020-01-07T05:15:11.394Z",
        "orderData": [
          {
            "orderId": 1,
            "serviceId": 1,
            "serviceName": "Investigation",
            "orderDateTime": "2020-01-07T07:15:11.394Z",
            isFinal: true,
            isCritical: true,
            "parameterData": [
              {
                "parameterId": 1,
                "parameterDesc": "HbA1C- Glycated Haemoglobin (HPLC)(Serum,Enzymatic)",
                "result": "4.9",
                "unit": "%",
                "refRange": "Disarable: < 200 Borderline, High: 200-239, High: > 240",
                "textRefRange": "Disarable: < 200 Borderline, High: 200-239, High: > 240",
                "remark": "Test performed",
                "isQualitative": false,
                isNormal: true
              },
              {
                "parameterId": 2,
                "parameterDesc": "Estimated Average Glucose (eAG)",
                "result": "93.93",
                "unit": "mg/dL",
                "refRange": "Disarable: < 200 Borderline, High: 200-239, High: > 240",
                "textRefRange": "Disarable: < 200 Borderline, High: 200-239, High: > 240",
                "remark": "Test performed",
                "isQualitative": false,
                isNormal: true
              }
            ]
          },
          {
            "orderId": 1,
            "serviceId": 2,
            "serviceName": "Lipid-Profile-2",
            "orderDateTime": "2020-01-07T07:15:11.394Z",
            isFinal: true,
            isCritical: true,
            "parameterData": [
              {
                "parameterId": 3,
                "parameterDesc": "Cholesterol-Total",
                "result": "108",
                "unit": "mg/dL",
                "refRange": "Disarable: < 200 Borderline, High: 200-239, High: > 240",
                "textRefRange": "Disarable: < 200 Borderline, High: 200-239, High: > 240",
                "remark": "Test performed",
                "isQualitative": false,
                isNormal: true
              }
            ]
          },
          {
            "orderId": 2,
            "serviceId": 1,
            "serviceName": "Investigation",
            "orderDateTime": "2020-01-08T09:15:11.394Z",
            isFinal: true,
            isCritical: true,
            "parameterData": [
              {
                "parameterId": 1,
                "parameterDesc": "HbA1C- Glycated Haemoglobin (HPLC)(Serum,Enzymatic)",
                "result": "5.2",
                "unit": "%",
                "refRange": "Disarable: < 200 Borderline, High: 200-239, High: > 240",
                "textRefRange": "Disarable: < 200 Borderline, High: 200-239, High: > 240",
                "remark": "Test performed",
                "isQualitative": false,
                isNormal: true
              },
              {
                "parameterId": 2,
                "parameterDesc": "Estimated Average Glucose (eAG)",
                "result": "102.54",
                "unit": "mg/dL",
                "refRange": "Disarable: < 200 Borderline, High: 200-239, High: > 240",
                "textRefRange": "Disarable: < 200 Borderline, High: 200-239, High: > 240",
                "remark": "Test performed",
                "isQualitative": false,
                isNormal: true
              }
            ]
          },
          {
            "orderId": 2,
            "serviceId": 2,
            "serviceName": "Lipid-Profile-2",
            "orderDateTime": "2020-01-08T09:15:11.394Z",
            isFinal: true,
            isCritical: true,
            "parameterData": [
              {
                "parameterId": 3,
                "parameterDesc": "Cholesterol-Total",
                "result": "108",
                "unit": "mg/dL",
                "refRange": "Disarable: < 200 Borderline, High: 200-239, High: > 240",
                "textRefRange": "Disarable: < 200 Borderline, High: 200-239, High: > 240",
                "remark": "Test performed",
                "isQualitative": false,
                isNormal: true
              }
            ]
          },
          {
            "orderId": 3,
            "serviceId": 1,
            "serviceName": "Investigation",
            "orderDateTime": "2020-01-10T12:15:11.394Z",
            isFinal: true,
            isCritical: true,
            "parameterData": [
              {
                "parameterId": 1,
                "parameterDesc": "HbA1C- Glycated Haemoglobin (HPLC)(Serum,Enzymatic)",
                "result": "5.2",
                "unit": "%",
                "refRange": "Disarable: < 200 Borderline, High: 200-239, High: > 240",
                "textRefRange": "Disarable: < 200 Borderline, High: 200-239, High: > 240",
                "remark": "Test performed",
                "isQualitative": false,
                isNormal: true
              }
            ]
          },
          {
            "orderId": 3,
            "serviceId": 2,
            "serviceName": "Lipid-Profile-2",
            "orderDateTime": "2020-01-10T12:15:11.394Z",
            isFinal: true,
            isCritical: true,
            "parameterData": [
              {
                "parameterId": 3,
                "parameterDesc": "Cholesterol-Total",
                "result": "108",
                "unit": "mg/dL",
                "refRange": "Disarable: < 200 Borderline, High: 200-239, High: > 240",
                "textRefRange": "Disarable: < 200 Borderline, High: 200-239, High: > 240",
                "remark": "Test performed",
                "isQualitative": false,
                isNormal: true
              }
            ]
          }
        ]
      }
    ];
    this.getPatientInvestigationData().subscribe();
  }

  getPatientInvestigationData(): Observable<any> {
    const param = {
      patientId: this.patientId,
      serviceTypeId: this.patientObj.serviceType.id,
      visitNo: this.patientObj.visitNo
    };
    return this.historyService.getPatientInvestigationHistory(param).pipe(map((res: any) => {
      this.apiData = res && res.data && res.data.length > 0 ? res.data : [];
      let serviceTypeListArray = [];
      let paramTypeListArray = [];
      _.map(this.apiData, visit => {
        _.map(visit.orderData, od => {
          const dtObj = {
            date: moment(od.orderDateTime).format('YYYY-MM-DD hh:mm a'),
            isFinal: od.isFinal,
            isCritical: od.isCritical,
            isQualitative: od.isQualitative,
            serviceId:od.serviceId
          };
          this.visitDatesArray.push(_.cloneDeep(dtObj));
          serviceTypeListArray.push({
            serviceId: od.serviceId,
            serviceName: od.serviceName,
            isFinal: od.isFinal,
            isCritical: od.isCritical,
            isQualitative: od.isQualitative
          });
          _.map(od.parameterData, pd => {
            paramTypeListArray = paramTypeListArray.concat({
              parameterDesc: pd.parameterDesc,
              parameterId: pd.parameterId
            });
          })
        })
      });
      this.visitDatesArray = _.uniqBy(this.visitDatesArray, d => {
        return moment(new Date(d.date)).format('YYYY/MM/DD H:m');
      });

      this.visitDatesArray = _.orderBy(this.visitDatesArray, ['date'], ['desc']);
      serviceTypeListArray = _.uniqBy(serviceTypeListArray, 'serviceId');
      paramTypeListArray = _.uniqBy(paramTypeListArray, 'parameterId');
      let allOrderData = [];
      _.map(this.apiData, apDt => {
        allOrderData = allOrderData.concat(apDt.orderData);
      });
      let serviceTypeListArrayFinal = [];
      let expand = true;
      _.map(serviceTypeListArray, sd => {
        let obj = sd;
        obj.serviceTypeData = [];
        obj.paramStatus = [];
        obj.isExpand = _.cloneDeep(expand);
        expand = false;
        _.map(paramTypeListArray, pd => {
          let paramObj = pd;
          paramObj.paramData = []
          _.map(this.visitDatesArray, vd => {
            const dateData = _.filter(allOrderData, odt => {
              return moment(moment(odt.orderDateTime).format('YYYY/MM/DD H:m')).isSame(moment(moment(vd.date).format('YYYY/MM/DD H:m'))) && odt.serviceId === sd.serviceId;
            });
            if (dateData.length > 0) {
              _.map(dateData, dateDt => {
                obj.paramStatus = obj.paramStatus.concat(_.cloneDeep(dateDt.isFinal));
                const fData = _.find(dateDt.parameterData, pm => {
                  return pm.parameterId === pd.parameterId;
                });
                if (fData) {
                  paramObj.paramData.push(_.cloneDeep(fData));
                } else {
                  paramObj.paramData.push(_.cloneDeep(null));
                }
              });
            } else {
              paramObj.paramData.push(_.cloneDeep(null));
            }
          });
          const nullLengthData = _.filter(paramObj.paramData, ndt => {
            return ndt === null;
          });
          if (nullLengthData.length === this.visitDatesArray.length) {
            paramObj.paramData = [];
          }
          obj.serviceTypeData.push(_.cloneDeep(paramObj));
        });
        // check if have same param data
        const odrData = _.filter(allOrderData, dt => {
          return dt.serviceId === obj.serviceId;
        });
        let allParamData = [];
        let selectedParamData = [];
        if (odrData.length > 0) {
          odrData.map(odt => {
            odt.parameterData.map(pdt => {
              pdt.orderDateTime = odt.orderDateTime;
            });
          });
          if (odrData.length === 1) {
            if (odrData.parameterData === 0) {
              return;
            } else {
              allParamData = odrData[0].parameterData;
              selectedParamData = [];
              _.map(obj.serviceTypeData, d => {
                const chk = _.find(allParamData, pd => {
                  return pd.parameterId === d.parameterId;
                });
                if (chk) {
                  selectedParamData.push({ ...chk });
                }
              });
            }
          } else {
            odrData.map(dt => {
              allParamData = allParamData.concat(dt.parameterData);
            });
            _.map(obj.serviceTypeData, d => {
              const chk = _.find(allParamData, pd => {
                return pd.parameterId === d.parameterId;
              });
              if (chk) {
                selectedParamData.push({ ...chk });
              }
            });
          }
        }
        obj.serviceTypeData = [];
        selectedParamData.map(sd => {
          const pObj = {
            parameterDesc: sd.parameterDesc,
            parameterId: sd.parameterId,
            paramData: []
          };

          _.map(this.visitDatesArray, dts => {
            if (moment(dts.date).isSame(moment(moment(sd.orderDateTime).format('YYYY/MM/DD H:m')))) {
              pObj.paramData.push({ ...sd });
            } else {
              pObj.paramData.push(null);
            }
          });
          obj.serviceTypeData.push({
            ...pObj
          });
        });
        console.log(selectedParamData);
        serviceTypeListArrayFinal.push(_.cloneDeep(obj));
      });
      this.dateWiseInvestigationData = serviceTypeListArrayFinal;
      // console.log(this.visitDatesArray);
      // console.log(serviceTypeListArray);
      console.log(serviceTypeListArrayFinal);
      this.loadtable = true;
      return true;
    }));
  }

  redirectToService() {
    this.router.navigate(['emr/patient/investigationHistory/reports/' + this.patientId]);
  }

  getpatientData(patient?) {
    if (patient) {
      this.patientObj = patient;
    } else {
      this.patientObj = this.commonService.getLastActivePatient();
    }
    this.patientId = this.patientObj.patientData.id;
  }

}

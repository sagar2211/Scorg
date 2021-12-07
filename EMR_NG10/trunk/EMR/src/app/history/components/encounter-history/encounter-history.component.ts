import { Component, OnInit } from '@angular/core';
import { CommonService } from './../../../public/services/common.service';
import { Observable, of, forkJoin } from 'rxjs';
import { HistoryService } from '../../history.service';
import * as _ from 'lodash';
import { map } from 'rxjs/operators';
import { OrderService } from './../../../public/services/order.service';
import * as moment from 'moment';
import { EncounterPatient } from 'src/app/public/models/encounter-patient.model';
import { DischargeSummaryService } from 'src/app/discharge-summary/discharge-summary.service';

@Component({
  selector: 'app-encounter-history',
  templateUrl: './encounter-history.component.html',
  styleUrls: ['./encounter-history.component.scss']
})
export class EncounterHistoryComponent implements OnInit {

  patientObj: EncounterPatient;
  patientId: any;
  historydataAll = [];
  chartComponentList = [];
  componentKeysList = [];
  chartDataComponentArray = [];
  showHistory: boolean;
  otherDate: any;
  collaseDatesArray = [];

  chartsSequenceList: Array<{ name: string, sequence: number }> = [
    {
      name: 'Rapid Response Team Record',
      sequence: 0
    },
    {
      name: 'Trauma Evaluation Sheet',
      sequence: 1
    },
    {
      name: 'ER Assessment',
      sequence: 2
    },
    {
      name: 'Anesthesia Assessment',
      sequence: 3
    },
    {
      name: 'Anesthesia Record',
      sequence: 4
    },
    {
      name: 'Peri Operative Evaluation Form',
      sequence: 5
    },
    {
      name: 'OT Note',
      sequence: 6
    },
    {
      name: 'Inpatient assessment',
      sequence: 7
    },
    {
      name: 'ICU daily notes',
      sequence: 8
    },
    {
      name: 'Critical care flow',
      sequence: 9
    },
    {
      name: 'Critical care flow sheet',
      sequence: 10
    },
    {
      name: 'Nursing Notes',
      sequence: 11
    },
    {
      name: 'ICU Daily Notes',
      sequence: 12
    },
    {
      name: 'Physician Order',
      sequence: 13
    },
    {
      name: 'Nursing Kardex',
      sequence: 14
    },
    {
      name: 'Progress Notes',
      sequence: 15
    },
    {
      name: 'Lab Result',
      sequence: 16
    },
    {
      name: 'ICU Transfer Out',
      sequence: 17
    },
    {
      name: 'Nursing Handover',
      sequence: 18
    },
    {
      name: 'Nutritional Profile',
      sequence: 19
    },
    {
      name: 'Restrain Order Form',
      sequence: 20
    },
    {
      name: 'Surgical safety checklist',
      sequence: 21
    },
    {
      name: 'Blood Bank/ Transfusion Medicine',
      sequence: 22
    },
    {
      name: 'Cross Match Interpretation',
      sequence: 23
    },
    {
      name: 'Fall Risk Assessment',
      sequence: 24
    },
    {
      name: 'Discharge Summary',
      sequence: 25
    },
    {
      name: 'Nursing ER Assessment',
      sequence: 26
    }
  ];

  constructor(
    private dischargeSummaryService: DischargeSummaryService,
    private commonService: CommonService,
    private historyService: HistoryService,
    private orderService: OrderService,
  ) { }

  ngOnInit() {
    this.getpatientData();
    this.commonService.updateHistoryTabHideShow('encounter');
    this.showHistory = false;
  }

  getpatientData(patient?) {
    if (patient) {
      this.patientObj = patient;
    } else {
      this.patientObj = this.commonService.getLastActivePatient();
    }
    this.patientId = this.patientObj.patientData.id;
    this.otherDate = new Date(moment(this.patientObj.admissionDate).add(1, 'days').format('YYYY/MM/DD'));
    // this.getPatientEncounterVisitList().subscribe();
    this.getPatientVisitAllHistory(this.patientObj.visitNo).then(res => {
      this.historydataAll.map(d => {
        d.consultationDatetimeMoment = moment(d.consultationDatetime).format('YYYY-MM-DD');
      });
      const grpDateData = _.groupBy(this.historydataAll, d => {
        return new Date(d.consultationDatetimeMoment);
      });
      this.collaseDatesArray = [];
      _.map(grpDateData, (dt, i) => {
        const obj = {
          date: new Date(moment(i).format('YYYY/MM/DD')),
          isCollapse: true,
          chartListData: dt,
          chartData: dt
        };
        this.collaseDatesArray.push({ ...obj });
      });
      if (this.collaseDatesArray.length > 0) {
        this.collaseDatesArray = _.orderBy(this.collaseDatesArray, 'date', 'desc');
        this.collaseDatesArray[0].isCollapse = false;
        this.collaseDatesArray[0].chartData[0].isSelected = true;
      }
      this.historydataAll = [];
      this.showHistory = true;
    });
  }

  getPatientVisitAllHistory(visitNo): Promise<any> {
    return new Promise((resolve, reject) => {
      const param = {
        service_type_id: this.patientObj.serviceType.id,
        patient_id: this.patientId,
        dates: [],
        doctor_ids: [],
        section_keys: [],
        chart_ids: [],
        visit_no: visitNo
      };
      this.dischargeSummaryService.getPatientVisitAllHistory(param).subscribe(res => {
        let historyData = [];
        if (res.length > 0) {
          _.map(res, (data, indx) => {
            data.visit_date = new Date(data.visit_date);
            data.componentListArray = data.chart_components;
            historyData.push(data);
          });
          this.updateObject(historyData).then(dt => {
            resolve(true);
          });
        } else {
          resolve(true);
        }
      });
    });
  }

  getAllOrdersList(): Promise<any> {
    return new Promise((resolve, reject) => {
      const params = {
        serviceTypeId: this.patientObj.serviceType.id,
        patientId: this.patientId,
        visitNo: this.patientObj.visitNo
      };
      this.orderService.getOrderDetailsByIpdId(params, true).subscribe(res => {
        if (res) {
          const obj = {
            chartName: 'Physician Order',
            chartId: null,
            chartData: res,
            isSelected: false
          };
          this.historydataAll.push(_.clone(obj));
        }
        // console.log(this.historydataAll);
        resolve(this.historydataAll);
      });
    });
  }

  updateObject(historyData): Promise<any> {
    return new Promise((resolve, reject) => {
      const chartData = _.groupBy(historyData, 'patient_chart_id');
      _.map(chartData, cData => {
        const obj = {
          chartName: cData[0].patient_chart_name,
          chartId: cData[0].patient_chart_id,
          visitDate: cData[0].visit_date,
          consultationDatetime: cData[0].consultation_datetime,
          chartData: cData,
          isSelected: false,
        };
        this.historydataAll.push(_.clone(obj));
      });

      this.historydataAll.forEach(h => {
        const indx = this.chartsSequenceList.findIndex((vik: any) => {
          return _.upperCase(vik.name) === _.upperCase(h.chartName);
        });
        if (indx !== -1) {
          h['sequence'] = +this.chartsSequenceList[indx].sequence;
        } else {
          h['sequence'] = this.historydataAll.length;
        }
      });
      this.historydataAll = _.orderBy(this.historydataAll, ['sequence'], ['asc']);
      _.map(this.historydataAll, hd => {
        hd.chartData = _.sortBy(hd.chartData, dt => {
          return new Date(moment(dt.consultation_datetime).format('YYYY/MM/DD HH:mm:ss'))
        }).reverse();
      });
      // this.historydataAll[0].isSelected = true;
      this.getAllOrdersList().then(res => {
        resolve(true);
      });
    });
  }

  scrollToSection(indexMain, indexSub) {
    _.map(this.collaseDatesArray, dt1 => {
      _.map(dt1.chartData, dt2 => {
        dt2.isSelected = false;
      });
    });
    this.collaseDatesArray[indexMain].chartData[indexSub].isSelected = true;
    const chartId = this.collaseDatesArray[indexMain].chartData[indexSub].chartId;
    if (chartId) {
      setTimeout(() => {
        document.querySelector('#patient_chart_' + chartId).scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      setTimeout(() => {
        document.querySelector('#all_order_list_' + indexMain).scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }

  updateDateSection(indx) {
    _.map(this.collaseDatesArray, dt => {
      return dt.isCollapse = true;
    });
    this.collaseDatesArray[indx].isCollapse = false;
    if (this.collaseDatesArray[indx].chartData) {
      this.scrollToSection(indx, 0);
    } else {
      this.getPatientVisitAllHistory(this.collaseDatesArray[indx].chartListData.visitNo).then((result) => {
        this.collaseDatesArray[indx].chartData = this.historydataAll;
        this.scrollToSection(indx, 0);
      })
    }
  }

  // getPatientEncounterVisitList(): Observable<any> {
  //   const param = {
  //     serviceTypeId: this.patientObj.serviceType.id,
  //     patientId: this.patientId
  //   };
  //   return this.historyService.getPatientEncounterVisitList(param).pipe(map((res: any) => {
  //     res = _.orderBy(res, dt => {
  //       return new Date(moment(dt.visitDate).format('YYYY/MM/DD HH:mm:ss'))
  //     }).reverse();
  //     _.map(res, (dt, i) => {
  //       const obj = {
  //         date: new Date(moment(dt.visitDate).format('YYYY/MM/DD')),
  //         isCollapse: i === 0 ? false : true,
  //         chartListData: dt,
  //         chartData: null
  //       };
  //       this.collaseDatesArray.push(obj);
  //     });
  //     _.map(this.collaseDatesArray, dt => {
  //       if (!dt.isCollapse) {
  //         this.getPatientVisitAllHistory(dt.chartListData.visitNo).then((result) => {
  //           dt.chartData = _.cloneDeep(this.historydataAll);
  //           this.historydataAll = [];
  //           this.showHistory = true;
  //         })
  //       }
  //     });
  //     if (this.collaseDatesArray.length === 0) {
  //       this.showHistory = true;
  //     }
  //     console.log(this.collaseDatesArray, 'encounter');
  //     return res;
  //   }));
  // }
}

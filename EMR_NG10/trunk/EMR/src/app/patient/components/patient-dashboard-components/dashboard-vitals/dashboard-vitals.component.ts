import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import * as _ from 'lodash';
import { IcutempdataService } from './../../../../public/services/icutempdata.service';
import { ConsultationService } from './../../../../public/services/consultation.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-dashboard-vitals',
  templateUrl: './dashboard-vitals.component.html',
  styleUrls: ['./dashboard-vitals.component.scss']
})
export class DashboardVitalsComponent implements OnInit {
  patientId: any;
  constructor(
    private icutempdataservice: IcutempdataService,
    private consultationService: ConsultationService,
    private route: ActivatedRoute,
    private router: Router
  ) { }
  patientVitals: Array<any> = [];
  vitalsList: Array<any> = this.icutempdataservice.vitalsList;
  date = null;
  now: string;
  timeList: Array<any> = [];
  dasboardVitalsData: Array<any> = [];
  ngOnInit() {
    this.now = moment(new Date()).format('HH.00');
    this.patientId = this.consultationService.getPatientObj('patientId');
    if (this.icutempdataservice.icuTempData.vitalsSheetData.length >= 0) {
      this.patientVitals = this.icutempdataservice.icuTempData.vitalsSheetData;
    } else {
      this.patientVitals = this.icutempdataservice.icuTempData.vitalsSheetData['data'];
    }
    this.date = new Date();
    this.patientId = this.route.snapshot.paramMap.get('patientId');
    const PatientData = _.find(this.patientVitals, patientData => {
      return patientData.patientId.toString() === this.patientId.toString();
    });
    if (this.patientVitals.length === 0) {
      this.icutempdataservice.getVitalsSheetData().subscribe(dt => {
        this.patientVitals = dt.data;
        //this.checkDataExist();
      });
    }
    for (let index = 0; index <= 9; index++) {
      const time = moment().subtract(index, 'hours').format('HH.00');
      // console.log(moment().subtract(index, 'hours').format('HH.00'));
      this.timeList.push(time);
      this.timeList = _.orderBy(this.timeList, (o: any) => {
        if (o !== 'name') {
          return o;
        }
      }, ['asc']);
    }
    this.timeList.unshift('name');
    //this.ShowtVitalsData();
    // if(_.isUndefined(PatientData)) {
    this.checkDataExist();
    // }
  }

  checkDataExist() {
    const self = this;
    const SelectedDate = moment(new Date(self.date)).format('YYYY-MM-DD');
    const PatientData = _.find(self.patientVitals, patientData => {
      return patientData.patientId === self.patientId;
    });
    if (PatientData) {
      const findIndex = _.findIndex(PatientData.dateWiseVitals, findObj => {
        return findObj.date === SelectedDate;
      });
      if (findIndex !== -1) {
        this.ShowtVitalsData();
      } else {
        PatientData.dateWiseVitals.push({ 'date': SelectedDate, 'vitalsData': {} });
        const emptyVitalData = _.find(PatientData.dateWiseVitals, patientVData => {
          return patientVData.date === SelectedDate;
        });
        if (emptyVitalData) {
          _.map(self.timeList, tk => {
            if (tk !== 'name') {
              emptyVitalData.vitalsData[tk] = {};
              _.map(self.vitalsList, nk => {
                emptyVitalData.vitalsData[tk][nk.name] = '';
              });
            }
          });
        }
        this.ShowtVitalsData();
      }

    } else {
      self.patientVitals.push({ 'patientId': self.patientId, 'dateWiseVitals': [{ 'date': SelectedDate, 'vitalsData': self.icutempdataservice.dummyVitalData }] });
      const newPatientData = _.find(self.patientVitals, patientData => {
        return patientData.patientId === self.patientId;
      });
      const emptyVitalData = _.find(newPatientData.dateWiseVitals, patientVData => {
        return patientVData.date === SelectedDate;
      });
      // if (emptyVitalData) {
      //   _.map(self.timeList, tk => {
      //     if (tk != 'name') {
      //       emptyVitalData.vitalsData[tk] = {};
      //      _.map(self.vitalsList, nk => {
      //         emptyVitalData.vitalsData[tk][nk.name] = '';
      //       });
      //     }
      //   });
      // }
      this.ShowtVitalsData();
    }

  }

  ShowtVitalsData() {

    const self = this;
    const vitalNameKeys = this.getAllKeys();
    _.map(self.patientVitals, o => {
      if (self.patientId === o.patientId) {
        const SelectedDate = moment(new Date(self.date)).format('YYYY-MM-DD');
        const findVital = _.find(o.dateWiseVitals, findObj => {
          return findObj.date === SelectedDate;
        });
        const vitalsDate = moment(new Date(findVital.date)).format('YYYY-MM-DD');
        if (findVital) {
          const vitalTimeKeys = Object.keys(findVital.vitalsData);
          if (vitalTimeKeys.length > 0) {
            _.map(vitalTimeKeys, tk => {
              _.map(vitalNameKeys, nk => {
                const setObj = _.find(self.vitalsList, dispVitals => {
                  return dispVitals.name === nk;
                });
                if (_.isUndefined(findVital.vitalsData[tk][nk])) {
                  setObj[tk] = '';
                } else {
                  // if (setObj.type === 'string') {
                  //   if (setObj.name === 'BP') {
                  //     setObj[tk] = self.calculateRndomNumber().toString() +  '/' + self.calculateRndomNumber().toString();
                  //   } else{
                  //     setObj[tk] = '';
                  //   }
                  // } else {
                  setObj[tk] = findVital.vitalsData[tk][nk]; //!= '' ? findVital.vitalsData[tk][nk] : self.calculateRndomNumber().toString();
                  //}
                }
              });
            });
          } else {
            _.map(self.timeList, tk => {
              if (tk !== 'name') {
                self.vitalsList = _.map(self.vitalsList, nk => {
                  nk[tk] = '';
                  return nk;
                });
              }
            });
          }
          self.vitalsList = _.cloneDeep(self.vitalsList);
          _.forEach(self.vitalsList, (value, key) => {
            const calMinMaxData = {}
            let currentValue = 0;
            if (value['name'] !== 'TOTAL SCORE') {
              _.forEach(vitalTimeKeys, (hValue, hKey) => {
                if (value.type === 'string') {
                  calMinMaxData[hValue] = value[hValue] === '' ? '' : value[hValue];
                } else if (hValue === self.now) {
                  currentValue = value[hValue] === '' ? 0 : +value[hValue];
                } else {
                  calMinMaxData[hValue] = value[hValue] === '' ? '' : +value[hValue];
                }
                //self.updateList(hKey, value, hValue, '');
              });
              if (value['name'] === 'BP') {
                self.dasboardVitalsData.push({
                  'name': value['name'], 'min': calMinMaxData['16.00'], 'max': calMinMaxData['17.00'],
                  'current': calMinMaxData['18.00'], 'range': value.range
                });
              } else if (value['name'] === 'IE RATIO') {
                self.dasboardVitalsData.push({
                  'name': value['name'], 'min': '1:2', 'max': '2:1',
                  'current': '2:1', 'range': value.range
                });
              } else if (value.type === 'string') {
                self.dasboardVitalsData.push({
                  'name': value['name'], 'min': calMinMaxData['01.00'], 'max': calMinMaxData['07.00'],
                  'current': calMinMaxData['01.00'], 'range': value.range
                });
              } else {
                const minValue = self.calculateMinMaxVital('min', calMinMaxData);
                const maxValue = self.calculateMinMaxVital('max', calMinMaxData);
                self.dasboardVitalsData.push({
                  'name': value['name'], 'min': (minValue === 0 ? '' : minValue), 'max': (maxValue === 0 ? '' : maxValue),
                  'current': (currentValue === 0 ? '' : currentValue), 'range': value.range
                });
              }
            }
          });
        }
      }
    });
  }

  getAllKeys() {
    const keys = [];
    _.forEach(this.vitalsList, (value) => {
      keys.push(value.name);
    });
    return keys;
  }

  calculateMinMaxVital(type, data) {
    let maxVal = 0;
    let minVal = 0;
    if (type === 'min') {
      minVal = Math.min.apply(null, Object.keys(data).map((key) => {
        return data[key];
      }));
      return minVal;
    } else {
      maxVal = Math.max.apply(null, Object.keys(data).map((key) => {
        return data[key];
      }));
      return maxVal;
    }
  }

  calculateRndomNumber() {
    return Math.round(Math.random() * (150 - 10) + 10) + 10;
  }

  navigate() {
    this.router.navigate(['/emr/patient/icu_vital_graph/',  this.patientId]);
  }

  getColorCode(rangeObj, head) {
    let setColor = "green";
    if (!_.isUndefined(head) && !_.isUndefined(rangeObj) &&
      rangeObj.type === 'string' && (rangeObj.name !== 'BP' || rangeObj.name !== 'IE RATIO')) {
      setColor = 'black';
    } else if (!_.isUndefined(head) && !_.isUndefined(rangeObj) && (rangeObj.name === 'BP' || rangeObj.name === 'IE RATIO')) {
      const val = head;

      const NormalMin = rangeObj['range']['normal'].min;
      const NormalMax = rangeObj['range']['normal'].max;
      const NormalColor = rangeObj['range']['normal'].color;
      const ModrateMin = rangeObj['range']['modrate'].min;
      const ModrateMax = rangeObj['range']['modrate'].max;
      const ModrateColor = rangeObj['range']['modrate'].color;
      const SevereMin = rangeObj['range']['severe'].min;
      const SevereMax = rangeObj['range']['severe'].max;
      const SevereColor = rangeObj['range']['severe'].color;

      if (val === NormalMin || val === NormalMax) {
        setColor = NormalColor;
      } else if (val === ModrateMin) {
        setColor = ModrateColor;
      } else if (val === SevereMin || val === SevereMax) {
        setColor = SevereColor;
      }

    } else if (!_.isUndefined(head) && !_.isUndefined(rangeObj)) {
      const val = head;
      if (_.isUndefined(rangeObj)) {
        return setColor;
      }
      const NormalMin = +rangeObj['range']['normal'].min;
      const NormalMax = +rangeObj['range']['normal'].max;
      const NormalColor = rangeObj['range']['normal'].color;
      const ModrateMin = +rangeObj['range']['modrate'].min;
      const ModrateMax = +rangeObj['range']['modrate'].max;
      const ModrateColor = rangeObj['range']['modrate'].color;
      const SevereMin = +rangeObj['range']['severe'].min;
      const SevereMax = +rangeObj['range']['severe'].max;
      const SevereColor = rangeObj['range']['severe'].color;

      if (val >= NormalMin && val <= NormalMax) {
        setColor = NormalColor;
      } else if (val >= ModrateMin && val <= ModrateMax) {
        setColor = ModrateColor;
      } else if (val >= SevereMin && val <= SevereMax) {
        setColor = SevereColor;
      }
    }
    return setColor;
  }

}

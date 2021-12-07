import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash';
import * as moment from 'moment';
import { IcutempdataService } from './../../../public/services/icutempdata.service';

@Component({
  selector: 'app-icu-vital-sheet',
  templateUrl: './icu-vital-sheet.component.html',
  styleUrls: ['./icu-vital-sheet.component.scss']
})
export class IcuVitalSheetComponent implements OnInit {
  @Input() source: string;

  constructor(
    private route: ActivatedRoute,
    private icutempdataservice: IcutempdataService,
    private router: Router
  ) { }

  date = null;
  now: string;
  currentDate = null;
  currentSelectedDate = null;
  patientId: any;
  timeList: Array<any> = [];

  patientVitals: Array<any> = [];

  editField: string;
  vitalsList: Array<any> = this.icutempdataservice.vitalsList;
  prevPath = '';

  ngOnInit() {
    this.now = moment(new Date()).format('HH.00');
    this.currentDate = moment(new Date()).format('YYYY-MM-DD');
    this.date = new Date();
    this.currentSelectedDate = moment(this.date).format('YYYY-MM-DD');
    this.patientId = this.route.snapshot.paramMap.get('patientId');
    // get extra params
    this.route.queryParams.subscribe(result => {
      this.prevPath = (_.isEmpty(result) || (!_.isEmpty(result) && _.isUndefined(result['from']))) ? '' : result['from'];
    });
    if (_.isUndefined(this.icutempdataservice.icuTempData.vitalsSheetData.length)) {
      this.patientVitals = this.icutempdataservice.icuTempData.vitalsSheetData['data'];
    } else {
      this.patientVitals = this.icutempdataservice.icuTempData.vitalsSheetData;
    }
    const PatientData = _.find(this.patientVitals, patientData => {
      return patientData.patientId.toString() === this.patientId.toString();
    });

    if (this.patientVitals.length === 0) {
      this.icutempdataservice.getVitalsSheetData().subscribe(dt => {
        this.patientVitals = dt.data;
        this.checkDataExist();
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
    //if (_.isUndefined(PatientData)) {
    this.checkDataExist();
    // } else{this.getVitalsData();}

  }

  updateList(id: number, vital: any, head: any, event: any) {
    const self = this;
    if (event === '') {
      const editField = vital[head];
    } else {
      const editField = event.target.value;
      vital[head] = _.trim(editField);
    }

    _.map(self.patientVitals, patientVital => {
      if (self.patientId === patientVital.patientId) {
        _.map(patientVital.dateWiseVitals, dateVital => {
          const SelectedDate = moment(new Date(self.date)).format('YYYY-MM-DD');
          const vitalsDate = moment(new Date(dateVital.date)).format('YYYY-MM-DD');
          if (SelectedDate === vitalsDate) {
            if (_.isUndefined(dateVital.vitalsData[head])) {
              dateVital.vitalsData[head] = {

              };
            }
            dateVital.vitalsData[head][vital.name] = vital[head];
          }
        });
      }
    });
    this.icutempdataservice.setVitalsSheetData(self.patientVitals);
  }

  remove(id: any) {
    this.vitalsList.splice(id, 1);
  }

  add() {
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
        this.getVitalsData();
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
        this.getVitalsData();
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
      this.getVitalsData();
    }

  }

  changeValue(id: number, property: string, event: any) {
    this.editField = event.target.textContent;
  }
  changeDate() {
    this.now = moment(new Date()).format('HH.00');
    this.currentSelectedDate = moment(new Date(this.date)).format('YYYY-MM-DD');
    this.editField = '';
    this.checkDataExist();


    // console.log(moment().subtract(1, 'hours').format('HH'));

  }

  getVitalsData() {

    const self = this;
    const vitalNameKeys = this.getAllKeys();
    _.map(self.patientVitals, o => {
      console.log(o.patientId);
      if (self.patientId === o.patientId) {
        //_.map(o.dateWiseVitals, vital => {
        const SelectedDate = moment(new Date(self.date)).format('YYYY-MM-DD');
        const findVital = _.find(o.dateWiseVitals, findObj => {
          return findObj.date === SelectedDate;
        });
        const vitalsDate = moment(new Date(findVital.date)).format('YYYY-MM-DD');

        if (findVital) {
          //if (SelectedDate === vitalsDate) {
          const vitalTimeKeys = Object.keys(findVital.vitalsData);
          if (vitalTimeKeys.length > 0) {
            _.map(vitalTimeKeys, tk => {
              // const vitalNameKeys = Object.keys(findVital.vitalsData[tk]);
              // const vitalNameKeys = this.getAllKeys();
              _.map(vitalNameKeys, nk => {
                const setObj = _.find(self.vitalsList, dispVitals => {
                  return dispVitals.name === nk;
                });
                if (_.isUndefined(findVital.vitalsData[tk][nk])) {
                  setObj[tk] = '';
                } else {
                  if (tk === self.now) {
                    setObj[tk] = ''; // sagar changed this to set blank value for textbox
                    // setObj[tk] =  findVital.vitalsData[tk][nk];
                  } else {
                    // if (setObj.type === 'string') {
                    //   setObj[tk] = '';
                    // } else {
                    setObj[tk] = findVital.vitalsData[tk][nk]; //!= '' ? findVital.vitalsData[tk][nk] : (Math.round(Math.random() * (150 - 10) + 10) + 10).toString();
                    //}
                  }
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
            _.forEach(vitalTimeKeys, (hValue, hKey) => {
              self.updateList(hKey, value, hValue, '');
            });
          });
          //}
        }
        // else {
        //   o.dateWiseVitals.push(
        //   {'date': SelectedDate,
        //     'vitalsData': {}
        //   });
        //   // _.map(this.timeList, tk => {
        //   //   const vitalNameKeys = Object.keys(findVital.vitalsData[tk]);
        //   //   _.map(vitalNameKeys, nk => {
        //   //     const setObj = _.find(self.vitalsList, dispVitals => {
        //   //             return dispVitals.name == nk;
        //   //           });
        //   //           setObj[tk] = findVital.vitalsData[tk][nk];
        //   //     });
        //   //   });
        // }
        //});
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

  getColorCode(rangeObj, head) {
    let setColor = 'green';
    if (!_.isUndefined(head) && !_.isUndefined(rangeObj) && !_.isUndefined(rangeObj[head]) && rangeObj[head] !== '' &&
      rangeObj.name != 'BP' && rangeObj.type === 'string') {
      setColor = 'black';
    } else if (!_.isUndefined(head) && !_.isUndefined(rangeObj) && !_.isUndefined(rangeObj[head]) && rangeObj[head] !== '' && rangeObj.name === 'BP') {
      const val = rangeObj[head];

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
      } else if (val === ModrateMin || val === ModrateMax) {
        setColor = ModrateColor;
      } else if (val === SevereMin || val === SevereMax) {
        setColor = SevereColor;
      }

    } else if (!_.isUndefined(head) && !_.isUndefined(rangeObj) && !_.isUndefined(rangeObj[head]) && rangeObj[head] !== '' && rangeObj.type !== 'string') {
      const val = +rangeObj[head];
      if (_.isUndefined(rangeObj['range'])) {
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

  navigate(navigateURL) {
    if (navigateURL === 'icu_flow_sheet') {
      this.router.navigate(['/emr/patient/' + navigateURL]);
    } else {
      navigateURL = '/emr/patient/' + navigateURL + '/';
      this.router.navigate([navigateURL, this.patientId]);
    }
  }


}

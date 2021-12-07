import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChartDataSets, ChartOptions } from 'chart.js';
import { Color, Label } from 'ng2-charts';
import { ICUService } from '../../services/icu.service';
import * as _ from 'lodash';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-icu-dashboard',
  templateUrl: './icu-dasboard.component.html',
  styleUrls: ['./icu-dasboard.component.scss']
})
export class IcuDashboardComponent implements OnInit, OnDestroy {

  icu = this;
  vitalData = {
    'pleth': [92, 92, 89,
      94, 90, 90,
      94, 92, 88,
      90, 92, 94,
      86, 92, 90,
      94, 82, 80,
      92, 96, 82,
      84, 92, 94,
      86, 90, 92,
      88, 92, 94,
      90],
    'resp': [8, 15, 18,
      10, 8, 12,
      18, 11, 14,
      18, 23, 19,
      17, 14, 16,
      15, 16, 18,
      14, 10, 16,
      18, 14, 12,
      14, 18, 15,
      10, 18, 12,
      14],
    'cvp': [3, 7, 8,
      5, 6, 4,
      5, 7, 6,
      5, 7, 6,
      5, 8, 6,
      5, 8, 6,
      10, 3, 8,
      7, 6, 5,
      8, 10, 7,
      6, 8, 5,
      10],
    'icp': [10, 14, 8,
      20, 10, 14,
      16, 20, 18,
      14, 8, 10,
      14, 11, 8,
      10, 13, 10,
      8, 9, 11,
      10, 8, 12,
      14, 17, 12,
      8, 9, 14,
      10],
    'pap': [18, 22, 24,
      27, 14, 10,
      14, 18, 20,
      10, 14, 18,
      20, 22, 18,
      16, 12, 14,
      11, 9, 12,
      14, 10, 20,
      17, 18, 22,
      17, 13, 14,
      16],
    'pulse': [70, 74, 78,
      80, 85, 79,
      74, 78, 72,
      80, 74, 72,
      70, 75, 78,
      83, 80, 74,
      70, 72, 76,
      80, 78, 86,
      81, 78, 75,
      80, 76, 70,
      74],
    'systolicPressure': [130, 138, 144,
      150, 156, 160,
      164, 158, 152,
      150, 146, 140,
      134, 128, 130,
      138, 144, 148,
      154, 158, 164,
      156, 152, 150,
      146, 140, 136,
      140, 148, 144,
      150],
    't1': [37, 37.5, 38,
      38.2, 38.8, 39,
      38.5, 38, 38.7,
      38.2, 39, 37,
      37.5, 38, 38.2,
      38.8, 39, 38.5,
      38, 38.7, 38.2,
      39, 38.5, 38,
      38.7, 38.2, 39,
      38.7, 39, 39.5,
      40],

    't2': [37.5, 38, 38.2,
      38.8, 39, 38.3,
      39, 38.7, 38.2,
      39, 38, 37.5,
      38, 38.2, 38.8,
      39, 38.7, 38,
      38.7, 39, 38.7,
      38, 38.7, 38.7,
      39, 38.7, 39.5,
      38, 38.5, 39.2,
      39.5],
    'diastolicPressure': [78, 82, 86,
      90, 88, 92,
      88, 86, 84,
      84, 82, 80,
      80, 78, 76,
      80, 84, 82,
      86, 84, 90,
      88, 86, 80,
      78, 74, 78,
      84, 88, 82,
      80],
    'artSystolic': [156, 160, 154,
      158, 152, 150,
      146, 142, 136,
      130, 134, 138,
      144, 146, 154,
      158, 162, 156,
      152, 150, 146,
      142, 136, 132,
      140, 144, 152,
      160, 164, 162,
      168],
    'artDiastolic': [92, 88, 94,
      88, 84, 82,
      80, 80, 74,
      78, 82, 84,
      82, 88, 84,
      90, 88, 94,
      88, 80, 78,
      76, 82, 88,
      86, 92, 94,
      88, 82, 78,
      84]
  }
  dashboardPatientList = [];
  selectedPatientList;
  vitalValueRanges;

  pageSize = 30;
  updateDataInterval = 60000;
  showPatientDashboard: boolean = false;
  timeOutFunction = [];
  reorderable: any;
  swapColumns: any;
  patientId: any;

  constructor(private ICUServices: ICUService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.patientId = this.route.snapshot.paramMap.get('patientId');
    this.getIPDPatientList().subscribe(res => {
      this.dashboardPatientList.forEach((patient) => {
        patient.criticalVitals = [];
      });

      // let length = this.vitalData.pleth.length;
      // this.vitalValueRanges = this.ICUServices.getVitalParamtersValueRanges();
      // this.prepaireVitalData();
      // let counter = 0;
      // this.showVitalDataOnDashboard(counter, length);
    });
  }

  getIPDPatientList(): Observable<any> {
    return this.ICUServices.getIPDPatientList().pipe(map(res => {
      _.map(res.data, (o) => {
        o.PatientName = o.PatientFirstName + ' ' + o.PatientLastName;
        o.Contact = '-';
        o.AdmittedDate = '-';
        o.ICUDate = '-';
        o.IsSelected = this.patientId == o.PatientId;
      });
      // for(let i = 2; i < 500; i++) {
      //   let temp = res.PatientInfoData[0];
      //   temp.PatientId = 'PID-00' + i;
      //   res.PatientInfoData.push(temp);
      // }
      this.dashboardPatientList = res.PatientInfoData;
    }));
  }

  prepaireVitalData() {
    _.map(this.dashboardPatientList, (patient) => {
      let vitalMasterList = []
      _.map(this.ICUServices.getVitalMasterList(), (vitalKey) => {
        let chartColor = 'blue';
        if (this.vitalValueRanges.hasOwnProperty(vitalKey)) {
          chartColor = this.vitalValueRanges[vitalKey].normal[0].chartColor;
        }
        vitalMasterList.push({ 'key': vitalKey, 'value': '', chartColor: chartColor, 'patientId': patient.patientId });
      });
      patient.vitalMasterList = vitalMasterList;
    });
  }

  showVitalDataOnDashboard(counter, length) {
    _.map(this.dashboardPatientList, (patient) => {
      patient.vitalMasterList.forEach((vital) => {
        let rangeColor = null;
        if (this.vitalData.hasOwnProperty(vital.key)) {
          vital.value = this.vitalData[vital.key][counter];
          let normalRange = this.getVitalRange(vital.key, 'normal', vital.value);
          let moderateRange = this.getVitalRange(vital.key, 'moderate', vital.value);
          let severeRange = this.getVitalRange(vital.key, 'severe', vital.value);
          if (normalRange != null) {
            vital.color = normalRange;
            vital.ColorObj = {
              color: vital.chartColor
            }
          } else if (moderateRange != null) {
            vital.color = moderateRange
            vital.ColorObj = {
              'background-color': '#fdb45d',
              'padding': '3px 8px',
              'color': '#ffffff'
            }
          } else if (severeRange != null) {
            vital.color = severeRange
            vital.ColorObj = {
              'background-color': '#ef5350',
              'padding': '3px 8px',
              'color': '#ffffff'
            }
          }
        }
      });
      let redVital = _.find(patient.vitalMasterList, { color: 'red' });
      let yellowVital = _.find(patient.vitalMasterList, { color: 'yellow' });
      if (redVital) {
        this.captureModerateAndRiskVital(patient, redVital, counter);
      } else if (yellowVital) {
        this.captureModerateAndRiskVital(patient, yellowVital, counter);
      }
    });
    counter++;
    this.timeOutFunction.push(setTimeout(() => {
      if (counter >= length) {
        counter = 0;
      }
      this.showVitalDataOnDashboard(counter, length);
    }, 1000));
  }

  captureModerateAndRiskVital(patient, vital, counter) {
    let displayObject = {
      'patient': patient,
      'displayLabel': '',
      'capturedVital': vital,
      'otherVital': []
    };
    patient.vitalMasterList.forEach((vital) => {
      if (this.vitalData.hasOwnProperty(vital.key)) {
        if (vital.key !== displayObject.capturedVital.key) {
          displayObject.otherVital.push({
            vitalKey: vital.key,
            vitalValue: this.vitalData[vital.key][counter]
          });
        }
      }
    });
    const vitalCaptureDateTime = new Date();
    const displayTime = vitalCaptureDateTime.getDate() + '/' + (vitalCaptureDateTime.getMonth() + 1)
      + '/' + vitalCaptureDateTime.getFullYear() + '-' + vitalCaptureDateTime.getHours() + ':'
      + vitalCaptureDateTime.getMinutes() + ':' + vitalCaptureDateTime.getSeconds();

    displayObject.displayLabel = displayTime + '--' + '[' + vital.key + ']' + ' [' + vital.value + ']';
    patient.criticalVitals.push(displayObject);
    patient.currentCriticalVital = displayObject;
  }
  getVitalRange(vitalKey, range, value) {
    let rangeColor = null;
    if (this.vitalValueRanges[vitalKey].hasOwnProperty(range)) {
      if (this.vitalValueRanges[vitalKey][range].length > 1) {
        this.vitalValueRanges[vitalKey][range].forEach((vitalRange) => {
          if (vitalRange.firstRange.hasOwnProperty('operator')) {
            rangeColor = this.rangeWithOperator(vitalRange, value);
          } else {
            if ((value >= vitalRange.firstRange) && (value <= vitalRange.secondRange)) {
              rangeColor = vitalRange.color;
            }
          }
        })
      } else {
        let vitalRange = this.vitalValueRanges[vitalKey][range][0];
        if (vitalRange.firstRange.hasOwnProperty('operator')) {
          rangeColor = this.rangeWithOperator(this.vitalValueRanges[vitalKey][range][0], value);
        } else if ((value >= vitalRange.firstRange) && (value <= vitalRange.secondRange)) {
          rangeColor = vitalRange.color;
        }
      }
    }
    return rangeColor;
  }

  rangeWithOperator(vitalRange, value) {
    if (vitalRange.firstRange.operator == 'less') {
      if (value < vitalRange.firstRange.value) {
        return vitalRange.color;
      }
    } else if (vitalRange.firstRange.operator == 'greater') {
      if (value > vitalRange.firstRange.value) {
        return vitalRange.color;
      }
    }
    if (vitalRange.hasOwnProperty('secondRange') && vitalRange.secondRange.hasOwnProperty('operator')) {
      if (vitalRange.secondRange.operator == 'less') {
        if (value < vitalRange.secondRange.value) {
          return vitalRange.color;
        }
      } else if (vitalRange.secondRange.operator == 'greater') {
        if (value > vitalRange.firstRange.value) {
          return vitalRange.color;
        }
      }
    }

    return null;
  }

  changeUpdateChartInterval() {
    this.showPatientDashboard = false;
    this.timeOutFunction.push(setTimeout(() => {
      this.showPatientDashboard = true;
    }, 1000));
  }

  goToPatientGraph(flag) {
    const selectedPatient =_.filter(this.dashboardPatientList, (o) => {
      return o.IsSelected == true;
    });
    if (selectedPatient.length == 0){
      alert('Please Select one patient..!!');
    } else if (selectedPatient.length > 1) {
      alert('Please Select only one patient..!!');
    } else {
      this.showPatientDashboard = flag;
    }
    //$state.go('access.patientGraph', { 'vitalData': vitalData, 'selectedPatient': patient });
  }

  ngOnDestroy(): void {
    this.timeOutFunction.forEach(id => clearTimeout(id));
  }

  /** data from net**/
  seriesN = ['Series A'];
  dataN = [
    [92, 92, 89,
      94, 90, 90,
      94, 92, 88,
      90, 92, 94,
      86, 92, 90,
      94, 82, 80,
      92, 96, 82,
      84, 92, 94,
      86, 90, 92,
      88, 92, 94,
      90]

  ];
  colors = [{
    backgroundColor: '#0062ff',
    pointBackgroundColor: '#0085ff',
    pointHoverBackgroundColor: '#0062ff',
    borderColor: '#0075ff',
    pointBorderColor: '#0062ff',
    pointHoverBorderColor: '#0062ff',
    fill: false /* this option hide background-color */
  }];
  datasetOverrideN = [
    {
      label: 'Line chart',
      borderWidth: 1,
      type: 'line'
    }
  ];
  optionsN = {
    scales: {
      yAxes: [
        {
          id: 'y-axis-1',
          type: 'linear',
          display: false,
          position: 'left'
        }
      ]

    }
  };


}

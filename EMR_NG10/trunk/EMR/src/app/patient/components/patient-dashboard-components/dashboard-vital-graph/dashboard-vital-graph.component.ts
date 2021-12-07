import { EncounterPatient } from 'src/app/public/models/encounter-patient.model';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Chart } from 'angular-highcharts';
import { Subject } from 'rxjs';
import { CommonService } from './../../../../public/services/common.service';
import { Router } from '@angular/router';
import { PatientDashboardService } from '../../../services/patient-dashboard.service';
import * as _ from 'lodash';
import * as moment from 'moment';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard-vital-graph',
  templateUrl: './dashboard-vital-graph.component.html',
  styleUrls: ['./dashboard-vital-graph.component.scss']
})
export class DashboardVitalGraphComponent implements OnInit, OnDestroy {
  chart: Chart;
  patientObj: EncounterPatient;
  patientId: any;
  destroy$ = new Subject<any>();
  datetimeAraay = [];
  seriesDateList = [];
  vitalList = [];
  uniqVitalNameList = [];
  selectedItems = [];
  dropdownSettings = {};
  vitalSeriesDateList = [];
  constructor(
    private router: Router,
    private commonService: CommonService,
    private patientdashboardService: PatientDashboardService
  ) { }

  ngOnInit() {
    this.initDropDownList();
    this.getpatientData();
    this.getPatientVitalDetails();
    this.subcriptionOfEvents();
  }
  initDropDownList() {
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'vital_id',
      textField: 'vital_name',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      allowSearchFilter: true
    };
  }
  getPatientVitalDetails() {
    const obj = {
      serviceTypeId: this.patientObj.serviceType.id,
      patientId: this.patientObj.patientData.id,
      visitNo: this.patientObj.visitNo,
    };
    this.patientdashboardService.getVitalDate(obj).subscribe(res => {
      this.vitalList = res;
      if (this.vitalList.length) {
        this.uniqVitalNameList = _.uniqBy(res, 'vital_id');
        _.map(this.uniqVitalNameList, (uv) => {
          const seriesObject = {
            id: uv.vital_id,
            name: uv.vital_unit ? uv.vital_name + '(' + uv.vital_unit + ')' : uv.vital_name, data: [], tooltip: {
              valueDecimals: 2,
              valuePrefix: uv.vital_prefix ? uv.vital_prefix : '',
              valueSuffix: uv.vital_sufix ? uv.vital_sufix : '',
            }
          };
          const filterlist = _.filter(this.vitalList, (v) => v.vital_id === uv.vital_id);
          _.map(filterlist, (v) => {
            seriesObject.data.push(+v.value);
            this.datetimeAraay.push(moment(v.date_time).format('MMM Do HH:mm'));
          });
          this.vitalSeriesDateList.push(seriesObject);
        });
        this.selectedItems = [this.uniqVitalNameList[0]];
        this.seriesDateList.push(this.vitalSeriesDateList[0]);
        this.init();
      } else {
        this.datetimeAraay = [];
        this.seriesDateList = [];
        this.vitalSeriesDateList = [];
        this.selectedItems = [];
      }
    });
  }
  subcriptionOfEvents() {
    this.commonService.$subAddRemoveActivePatientFromList.pipe(takeUntil(this.destroy$)).subscribe((obj: any) => {
      this.getpatientData(obj.data);
      this.datetimeAraay = [];
      this.seriesDateList = [];
      this.vitalSeriesDateList = [];
      this.selectedItems = [];
      this.getPatientVitalDetails();
    });
  }

  getpatientData(patient?) {
    if (patient) {
      this.patientObj = patient;
    } else {
      this.patientObj = this.commonService.getLastActivePatient();
    }
    this.patientId = this.patientObj.patientData.id;
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  init() {
    const chart = new Chart({
      chart: {
        type: 'line',
        height: 36 + '%', // pixel -- percentage (9 / 16 * 100) + '%' // 16:9 ratio
      },
      title: {
        text: ''
      },
      yAxis: {
        title: {
          text: 'Vital Values'
        }
      },
      xAxis: {
        // type: 'datetime',
        categories: this.datetimeAraay
      },
      credits: {
        enabled: false,
      },
      series: this.seriesDateList,
      lang: {
        noData: 'No Data Found'
      },
      noData: {
        style: {
          fontWeight: 'bold',
          fontSize: '15px',
          color: '#303030'
        }
      }
    });
    this.chart = chart;
    // chart.ref$.subscribe(console.log);
  }

  removePoint() {
    this.chart.removePoint(this.chart.ref.series[0].data.length - 1);
  }
  onItemSelect(item: any) {
    console.log(item);
    this.addSerie(item);
  }
  addSerie(vital: any) {
    const findObj = _.find(this.vitalSeriesDateList, (rec) => rec.id === vital.vital_id);
    this.chart.addSeries(findObj, true, true);
  }

  onSelectAll(items: any) {
    this.onDeSelectChartAll(items);
    _.map(items, (v) => {
      this.addSerie(v);
    });
  }

  removeSerie(vital: any) {
    const findIndex = _.findIndex(this.chart.ref.series, (rec) => rec.userOptions.id === vital.vital_id);
    this.chart.ref.series[findIndex].remove(true);
  }

  onDeSelectChartAll(items: any) {
    while (this.chart.ref.series.length > 0) {
      this.chart.ref.series[0].remove(true);
    }
  }
}

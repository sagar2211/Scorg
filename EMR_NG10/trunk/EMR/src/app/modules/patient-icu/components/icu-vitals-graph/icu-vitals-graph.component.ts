import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Chart } from 'angular-highcharts';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommonService } from 'src/app/public/services/common.service';
import { ConsultationService } from 'src/app/public/services/consultation.service';

@Component({
  selector: 'app-icu-vitals-graph',
  templateUrl: './icu-vitals-graph.component.html',
  styleUrls: ['./icu-vitals-graph.component.scss']
})
export class IcuVitalsGraphComponent implements OnInit, OnDestroy {
  selectedDate = null;
  chart: Chart;
  dropdownList = [];
  selectedItems = [];
  dropdownSettings = {};
  patientObj: any;
  patientId: any;
  destroy$ = new Subject<any>();

  constructor(
    private router: Router,
    private consultationService: ConsultationService,
    private commonService: CommonService,
  ) { }

  ngOnInit() {
    this.init();
    this.initDropDownList();
    this.selectedDate = new Date();
    this.getpatientData();
    this.subcriptionOfEvents();
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  initDropDownList() {
    this.dropdownList = [
      { item_id: 1, item_text: 'Temperature' },
      { item_id: 2, item_text: 'Rhythm' },
      { item_id: 3, item_text: 'BP' },
      { item_id: 4, item_text: 'MEAN BP' },
      { item_id: 5, item_text: 'MEAN CVP' },
      { item_id: 6, item_text: 'INOTROPES' },
      { item_id: 7, item_text: 'INOTROPES(2)' },
      { item_id: 8, item_text: 'INOTROPES(3)' },
      { item_id: 9, item_text: 'SEDATION' },
      { item_id: 10, item_text: 'Spontaneous Respiratory Rate' },
      { item_id: 11, item_text: 'SPATURATION/SpO2' },
      { item_id: 12, item_text: 'Ventilator/BIPAP MODE' },
      { item_id: 13, item_text: 'FIO2' },
      { item_id: 14, item_text: 'IPAP' },
      { item_id: 15, item_text: 'EPAP' },
      { item_id: 16, item_text: 'SIMV BREATHS/MIN' },
      { item_id: 17, item_text: 'INSPIRATORY TIDAL VOLUME' },
      { item_id: 18, item_text: 'EXPIRATORY TIDAL VOLUME' },
      { item_id: 19, item_text: 'SET RR' },
      { item_id: 20, item_text: 'EXPIRATORY MINUTE VOLUME' },
      { item_id: 21, item_text: 'IE RATIO' },
      { item_id: 22, item_text: 'PEEP/CPAP(PRESSURE)' },
      { item_id: 23, item_text: 'PRESSURE CONTROL/SUPPORT' },
      { item_id: 24, item_text: 'TRIGGER SENSITIVITY' },
      { item_id: 25, item_text: 'PEAK AIRWAY PRESSURE' },
      { item_id: 26, item_text: 'PLATEAU PRESSURE' },
      { item_id: 27, item_text: 'PH' },
      { item_id: 28, item_text: 'ETCO2/PACO2' },
      { item_id: 29, item_text: 'PAO2' },
      { item_id: 30, item_text: 'HCO2' },
      { item_id: 31, item_text: 'PA02/FIO2' },
      { item_id: 32, item_text: 'BAGGING/SUCTION/PHYSO' },
      { item_id: 33, item_text: 'Patient Position' },
      { item_id: 34, item_text: 'Subglottic Suction' },
      { item_id: 35, item_text: 'EYE response' },
      { item_id: 36, item_text: 'Brain Stem REFLEXES' },
      { item_id: 37, item_text: 'MOTOR RESPONSE' },
      { item_id: 38, item_text: 'RESPIRATION' },
      { item_id: 39, item_text: 'EYE RESPONSE(E)' },
      { item_id: 40, item_text: 'VOCAL RESPONSE(V)' },
      { item_id: 41, item_text: 'MOTOR RESPONSE(M)' },
      { item_id: 42, item_text: 'Right Size' },
      { item_id: 43, item_text: 'Right Reaction' },
      { item_id: 44, item_text: 'Left Size' },
      { item_id: 45, item_text: 'Left Reaction' },
    ];

    this.selectedItems = [
      { item_id: 1, item_text: 'Temperature' },
    ];
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'item_id',
      textField: 'item_text',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      allowSearchFilter: true
    };

  }

  onItemSelect(item: any) {
    console.log(item);
    this.addSerie(item.item_text);
  }
  onSelectAll(items: any) {
    console.log(items);
  }

  changeDate() {
  }

  init() {
    const chart = new Chart({
      chart: {
        type: 'line',
      },
      title: {
        text: 'Vital Chart'
      },
      xAxis: {
        categories: ['8am', '9am', '10am', '11am', '12am', '1pm', '2pm',
          '3pm', '4pm', '5pm', '6pm', '7pm', '8pm', '9pm', '10pm', '11pm', '12pm', '1am', '2am', '3am', '4am', '5am', '6am', '7am']
      },
      credits: {
        enabled: false,
      },
      series: [{
        name: 'Temperature',
        data: [110, 80, 78, 90, 60, 50, 60, 70, 80, 90, 100, 110, 90, 85, 40, 90, 115, 95, 75, 75, 75, 76, 78, 90],
        type: undefined
      }]
    });
    // chart.addPoint(4);

    this.chart = chart;
    // chart.addPoint(5);
    // setTimeout(() => {
    //   chart.addPoint(6);
    // }, 2000);

    chart.ref$.subscribe(console.log);
  }

  addPoint() {
    if (this.chart) {
      this.chart.addPoint(Math.floor(Math.random() * 10));
    } else {
      alert('init chart, first!');
    }
  }

  addSerie(vital) {

    this.chart.addSeries({
      name: vital,
      data: [
        Math.floor(Math.random() * 50),
        Math.floor(Math.random() * 60),
        Math.floor(Math.random() * 70),
        Math.floor(Math.random() * 80),
        Math.floor(Math.random() * 100),
        Math.floor(Math.random() * 10),
        Math.floor(Math.random() * 20),
        Math.floor(Math.random() * 30),
        Math.floor(Math.random() * 40),
        Math.floor(Math.random() * 66),
        Math.floor(Math.random() * 500),
        Math.floor(Math.random() * 200),
        Math.floor(Math.random() * 100),
        Math.floor(Math.random() * 66),
        Math.floor(Math.random() * 22),
        Math.floor(Math.random() * 78),
        Math.floor(Math.random() * 77),
        Math.floor(Math.random() * 99),
        Math.floor(Math.random() * 55),
        Math.floor(Math.random() * 88),
        Math.floor(Math.random() * 200),
      ],
      type: undefined
    }, true, true);
  }

  removePoint() {
    this.chart.removePoint(this.chart.ref.series[0].data.length - 1);
  }

  removeSerie() {
    this.chart.removeSeries(this.chart.ref.series.length - 1);
  }

  navigate(): void {
    this.router.navigate(['/emr/patient/icu/icu_vital_sheet/', this.patientId]);
  }

  getpatientData(patient?) {
    if (patient) {
      this.patientObj = patient;
    } else {
      this.patientObj = this.commonService.getLastActivePatient();
    }
    this.patientId = this.patientObj.patientData.id;
  }

  subcriptionOfEvents() {
    this.commonService.$subAddRemoveActivePatientFromList.pipe(takeUntil(this.destroy$)).subscribe((obj: any) => {
      this.getpatientData(obj.data);
    });
  }

}

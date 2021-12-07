import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ChartDataSets, ChartOptions } from 'chart.js';
import { Color, Label } from 'ng2-charts';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as _ from 'lodash';
import * as moment from 'moment';
import { ActivatedRoute } from '@angular/router';
import { ICUService } from 'src/app/patient/services/icu.service';
import { CommonService } from 'src/app/public/services/common.service';

@Component({
  selector: 'app-live-icu-monitor',
  templateUrl: './live-icu-monitor.component.html',
  styleUrls: ['./live-icu-monitor.component.scss']
})
export class LiveIcuMonitorComponent implements OnInit, OnDestroy {

  graph = this;
  updateChartTimeOutFunction = [];
  getObeservationTimeOutFunction = [];
  @Input() patient: any;
  @Input() updateDataInterval;
  updateGraphInterval = 1000;
  getMonitorDataApiResponseTimeInSec = 0;

  gap = 1; // difference between head and tail of line
  dataLength = 300; // number of dataPoints visible at any point
  //chartDefaultLength = 100; // number of dataPoints visible at any point
  graphData: any;

  patientId: any = 772336;
  patientActiveVitals = {
    hr: '-',
    vpc: '-',
    st2: '-',
    spo2: '-',
    resp: '-',
    t1: '-',
    nibp_sys: '-',
    nibp_dia: '-',
    nibp_mean: '-',
    etco2: '-',
    inco2: '-',
    rr: '-',
    co2: '-'
  };
  graphDateAndTime: any;
  demoMode: boolean = false;
  showChartAfterInit: boolean = false;
  graphChartTypes = [];
  graphChartAllData = [];
  graphChartDataKeyMapping = [
    {
      observation: 'VITAL HR',
      title: 'HR',
      graphType: 'hr',
      cssClass: 'h-vital-hr',
      display: true,
      active: true,
      chartLength: 100,
      chartData: [],
      labelData: [],
      ngChart: {},
      minValue: 70,
      maxValue: 120,
      counter: 0,
      dataIndex: 0,
      stepValue: 1,
      dps: [],
      dataPoints: [],
      color: '#00b400',
      commnicationLost: false
    },
    {
      observation: 'VITAL SpO2',
      title: 'SpO2',
      graphType: 'spo2',
      cssClass: 'h-vital-spO2',
      display: true,
      active: true,
      chartLength: 100,
      chartData: [],
      labelData: [],
      ngChart: {},
      minValue: 70,
      maxValue: 120,
      counter: 0,
      dataIndex: 0,
      stepValue: 1,
      dps: [],
      dataPoints: [],
      color: '#00dcdc',
      commnicationLost: false
    },
    {
      observation: 'VITAL APSEC(RESP)',
      title: 'RESP',
      graphType: 'resp',
      cssClass: 'h-vital-resp',
      display: true,
      active: true,
      chartLength: 100,
      chartData: [],
      labelData: [],
      ngChart: {},
      minValue: 0,
      maxValue: 20,
      counter: 0,
      dataIndex: 0,
      stepValue: 1,
      dps: [],
      dataPoints: [],
      color: '#dcdc00',
      commnicationLost: false
    },
    {
      observation: 'NIBP SYS',
      title: 'SYS',
      graphType: 'nibp_sys',
      cssClass: 'h-vital-nibp-sys',
      display: true,
      active: true,
      chartLength: 100,
      chartData: [],
      labelData: [],
      ngChart: {},
      minValue: 120,
      maxValue: 150,
      counter: 0,
      dataIndex: 0,
      stepValue: 1,
      dps: [],
      dataPoints: [],
      color: '#ff0000',
      commnicationLost: false
    },
    {
      observation: 'NIBP DIAS',
      title: 'DIAS',
      graphType: 'nibp_dia',
      cssClass: 'h-vital-nibp-dia',
      display: true,
      active: true,
      chartLength: 100,
      chartData: [],
      labelData: [],
      ngChart: {},
      minValue: 70,
      maxValue: 90,
      counter: 0,
      dataIndex: 0,
      stepValue: 1,
      dps: [],
      dataPoints: [],
      color: '#ff0000',
      commnicationLost: false
    },
    {
      observation: 'NIBP MEAN',
      title: 'MEAN',
      graphType: 'nibp_mean',
      cssClass: 'h-vital-nibp-mean',
      display: false,
      active: true,
      chartLength: 100,
      chartData: [],
      labelData: [],
      ngChart: {},
      minValue: 80,
      maxValue: 110,
      counter: 0,
      dataIndex: 0,
      stepValue: 1,
      dps: [],
      dataPoints: [],
      color: '#ff0000',
      commnicationLost: false
    },
    {
      observation: 'VITAL ST2',
      title: 'ST2',
      graphType: 'st2',
      cssClass: 'h-vital-st',
      display: true,
      active: true,
      chartLength: 100,
      chartData: [],
      labelData: [],
      ngChart: {},
      minValue: -1.5,
      maxValue: 1.5,
      counter: 0,
      dataIndex: 0,
      stepValue: 1,
      dps: [],
      dataPoints: [],
      color: '#dcdc00',
      commnicationLost: false
    },
    {
      observation: 'VITAL VPC',
      title: 'VPC',
      graphType: 'vpc',
      cssClass: 'h-vital-vpc',
      display: false,
      active: true,
      chartLength: 100,
      chartData: [],
      labelData: [],
      ngChart: {},
      minValue: 0,
      maxValue: 15,
      counter: 0,
      dataIndex: 0,
      stepValue: 1,
      dps: [],
      dataPoints: [],
      color: '#dcdc00',
      commnicationLost: false
    },
    {
      observation: 'VITAL rRESP(imp)',
      title: 'RR',
      graphType: 'rr',
      cssClass: 'h-vital-press',
      display: false,
      active: true,
      chartLength: 100,
      chartData: [],
      labelData: [],
      ngChart: {},
      minValue: 130,
      maxValue: 150,
      counter: 0,
      dataIndex: 0,
      stepValue: 1,
      dps: [],
      dataPoints: [],
      color: '#dcdc00',
      commnicationLost: false
    },
    {
      observation: 'VITAL PRESS(S)',
      title: 'PRESS(S)',
      graphType: 'VITAL PRESS(S)',
      cssClass: 'h-vital-press',
      display: false,
      active: false,
      chartLength: 100,
      chartData: [],
      labelData: [],
      ngChart: {},
      minValue: 130,
      maxValue: 150,
      counter: 0,
      dataIndex: 0,
      stepValue: 1,
      dps: [],
      dataPoints: [],
      color: '#dcdc00',
      commnicationLost: false
    },
  ];

  constructor(
    private ICUServices: ICUService,
    private route: ActivatedRoute,
    private commonService: CommonService
  ) { }

  ngOnInit() {
    if (!this.updateDataInterval) {
      this.updateDataInterval = 60000;
    }
    this.getpatientData();
    this.initComponent();
  }
  initComponent() {
    this.demoMode = false;
    this.graphDateAndTime = this.commonService.getPatientMonitoringDateTime(this.patientId);
    this.updateChartTimeOutFunction = [];
    this.getObeservationTimeOutFunction = [];
    this.graphData = this.ICUServices.getGraphDataList();
    this.initAllGraph(this.patientId);
    if (this.demoMode) {
      this.showChartAfterInit = true;
    } else {
      this.showChartAfterInit = true;
      this.GetPatientMonitorData(this.patientId).subscribe(res => {
        this.loadAllGraph(this.patientId);
      });
    }
  }
  getPatientInfo(patientId): Observable<any> {
    return this.ICUServices.getPatientInfoByPatientId(patientId).pipe(map(res => {
      this.patient = res.PatientInfoData;
      this.patient.PatientName = res.PatientInfoData.PatientFirstName + ' ' + res.PatientInfoData.PatientLastName;
      this.patient.Age = '30';
      this.patient.Contact = '-';
      this.patient.AdmittedDate = '-';
      this.patient.ICUDate = '-';
      return this.patient;
    }));
  }
  getpatientData() {
    if (!this.patient) {
      this.patient = this.commonService.getLastActivePatient();
    }
    this.patientId = this.patient.patientData.id;
  }
  GetPatientMonitorData(patientId): Observable<any> {
    const timeLackInSecond = (this.updateDataInterval / 1000);
    return this.ICUServices.GetPatientMonitorData(patientId, timeLackInSecond).pipe(map(res => {
      _.map(this.graphChartTypes, (chart) => {
        chart.LastDateAndTimeOfObservations = moment(new Date()).add(-timeLackInSecond, 'seconds');
      });
      const PatientVitalsData = this.checkGraphDataLack(patientId, res.PatientVitalsData);
      this.graphChartAllData = PatientVitalsData;
      return this.graphChartAllData;
    }));
  }
  GetPatientMonitorDataByObservations(patientId, graphChartData): void {
    const chartDataByDesc = _.orderBy(graphChartData, ['DateAndTimeOfObservations'], ['desc']);
    const observations = _.uniqBy(chartDataByDesc, 'Observation');
    const observationsFilter = {
      PatientId: patientId,
      ObservationFilter: []
    };
    _.map(observations, (o) => {
      observationsFilter.ObservationFilter.push({
        Observation: o.Observation,
        DateAndTimeOfObservations: o.DateAndTimeOfObservations
      });
    });

    const beforeApiCallTime = new Date();
    this.ICUServices.GetPatientMonitorDataByObservations(observationsFilter).subscribe(res => {
      const afterApiCallTime = new Date();
      this.getMonitorDataApiResponseTimeInSec = moment(afterApiCallTime).diff(moment(beforeApiCallTime));
      const PatientVitalsData = this.checkGraphDataLack(patientId, res.PatientVitalsData);
      this.graphChartAllData = PatientVitalsData;

      // plot Grapgh using ng-chart
      _.map(this.graphChartTypes, (chart) => {
        let chartDataLastIndex = chart.chartDataLastIndex;
        chartDataLastIndex = chartDataLastIndex ? chartDataLastIndex : 0;

        // load initial chart data into graph data
        let chartData = _.filter(PatientVitalsData, (p) => {
          return p.Observation === chart.observation;
        });
        chartData = _.orderBy(chartData, ['DateAndTimeOfObservations'], ['asc']);
        _.map(chartData, (v, k) => {
          chartDataLastIndex++;
          if (chartDataLastIndex > this.dataLength) {
            chartDataLastIndex = 0;
          }
          chart.chartData[chartDataLastIndex] = v.ObservationValueDouble;
          chart.labelData[chartDataLastIndex] = v.DateAndTimeOfObservations;
          chart.chartDataLastIndex = chartDataLastIndex;
          chart.LastDateAndTimeOfObservations = v.DateAndTimeOfObservations;
        });
        if (chartData.length === 0) {
          chart.LastDateAndTimeOfObservations = moment(new Date()).add(-30000, 'seconds');
        }
      });

      // set updatedInterval using api call time diff & check it not less than equal 1 sec..
      // this.updateDataInterval =this.updateDataInterval - this.getMonitorDataApiResponseTimeInSec;
      // updatedInterval = updatedInterval > 1 ? updatedInterval : 1;
      this.getObeservationTimeOutFunction.push(setTimeout(() => {
        this.GetPatientMonitorDataByObservations(patientId, this.graphChartAllData);
      }, this.updateDataInterval));
    });
  }

  initAllGraph(patientId): void {
    this.graphChartTypes = _.filter(this.graphChartDataKeyMapping, (o) => {
      return o.active === true;
    });

    // plot Grapgh using ng-chart
    _.map(this.graphChartTypes, (chart, chartIndex) => {
      // set chartData in loadAllGraphs function...

      // plot graph finally...
      this.plotGraphUsingNgChart(chart.graphType, chartIndex);
    });
  }
  loadAllGraph(patientId): void {
    // plot Grapgh using ng-chart
    _.map(this.graphChartTypes, (chart, chartIndex) => {
      // Clear all chart demo data..
      chart.chartData = [];
      for (let i = 0; i < this.dataLength; i++) {
        chart.chartData.push(null);
        chart.labelData.push(null);
      }

      // load initial chart data into graph data
      let chartData = _.filter(this.graphChartAllData, (p) => {
        return p.Observation === chart.observation;
      });
      chartData = _.orderBy(chartData, ['DateAndTimeOfObservations'], ['asc']);
      _.map(chartData, (v, k) => {
        const value = v.ObservationValueDouble;
        chart.chartData[k] = v.ObservationValueDouble;
        chart.labelData[k] = v.DateAndTimeOfObservations;
        chart.chartDataLastIndex = k;
      });

      if (this.demoMode) {
        this.updateDemoChart(chart.graphType, chartIndex, 1);
      } else {
        this.updateChart(chart.graphType, chartIndex, 1);
      }
    });
    this.updateDataInterval = this.updateDataInterval / 2;
    this.updateChartTimeOutFunction.push(setTimeout(() => {
      this.GetPatientMonitorDataByObservations(patientId, this.graphChartAllData);
    }, this.updateDataInterval));
  }
  plotGraphUsingNgChart(graphType, chartIndex): void {
    // ng-chart object configuration....
    let chart = this.graphChartTypes[chartIndex];
    const lineChartOptions: ChartOptions = {
      title: {
        display: true,
        text: chart.title,
        fontColor: chart.color,
        position: 'right',
        fontSize: 30,
        padding: 10,
      },
      responsive: true,
      maintainAspectRatio: false,
      legend: { display: false },
      animation: { duration: 0 },
      tooltips: {
        mode: 'x-axis'
      },
      scales: {
        gridLines: { display: true, color: 'white' },
        ticks: { fontColor: 'white' },
        yAxes: [{
          id: 'y-axis-1', type: 'linear', ticks: { min: chart.minValue, max: chart.maxValue, fontColor: 'white', display: false },
          gridLines: { display: true },
          display: true
        }],
        xAxes: [{
          gridLines: { display: true }, display: true,
          ticks: { fontColor: 'white', display: false }
        }],
      },
      elements: {
        point: { radius: 0 },
        line: { borderWidth: 3, backgroundColor: '#000000' },
      },
    };
    const lineChartLabels: Label[] = [];
    const lineChartData: ChartDataSets = {
      data: [],
      label: graphType.toUpperCase(),
    };
    const lineChartColors: Color[] = [
      {
        borderColor: chart.color,
        backgroundColor: 'rgba(255, 255, 255, 0)',
      },
    ];

    chart.ngChart = {
      datasets: lineChartData,
      labels: lineChartLabels,
      options: lineChartOptions,
      colors: lineChartColors,
      legend: true,
      chartType: 'line',
      plugins: []
    };

    for (let i = 0; i < chart.chartLength; i++) {
      chart.dps.push({ y: null });
      chart.dataPoints.push(null);
      chart.ngChart.labels.push('');
    }
    chart.ngChart.datasets.data = chart.dataPoints;
    chart.ngChart.lineChartData = [chart.ngChart.datasets];
  }
  updateChart(graphType, chartIndex, count): void {
    let chart = this.graphChartTypes[chartIndex];
    const count1 = count || 1;
    // count is number of times loop runs to generate random dataPoints.
    for (let j = 0; j < count1; j++) {
      const counter = chart.counter;
      const dataIndex = chart.dataIndex;
      if (counter > chart.chartLength) {
        chart.counter = 0;
      }
      if (dataIndex > this.dataLength) {
        chart.dataIndex = 0;
      }
      const vitalValue = chart.chartData[dataIndex];
      this.patientActiveVitals[graphType] = vitalValue === null || vitalValue === undefined ? '-' : vitalValue;
      chart.commnicationLost = vitalValue === null || vitalValue === undefined;
      chart.dataPoints[counter] = vitalValue;
      chart.ngChart.labels[counter] = moment(chart.labelData[dataIndex]).format('HH:mm:ss');
      this.graphDateAndTime[this.patientId] = moment(chart.labelData[dataIndex]).format('hh:mm:ss A');
      chart.chartData[dataIndex] = null;
      chart.dataPoints[counter + this.gap] = null;
      chart.counter += chart.stepValue ? chart.stepValue : 1;
      chart.dataIndex += chart.stepValue ? chart.stepValue : 1;
    }
    chart.ngChart.datasets.data = chart.dataPoints;
    chart.ngChart.lineChartData = [chart.ngChart.datasets];

    this.updateChartTimeOutFunction.push(setTimeout(() => {
      this.updateChart(graphType, chartIndex, count);
    }, this.updateGraphInterval));
  }
  checkGraphDataLack(patientId, PatientVitalsData): any {
    const updatedInterval = this.updateDataInterval / 1000;
    const curreDateTime = moment(new Date()).add(-this.updateDataInterval, 'seconds');
    const chartDataByDesc = _.orderBy(PatientVitalsData, ['DateAndTimeOfObservations'], ['desc']);
    const PatientVitalsDataResponse = [];
    _.map(this.graphChartTypes, (chart) => {
      // check data not coming from api...!!
      const respData = _.find(chartDataByDesc, (v) => { return v.Observation == chart.observation; });
      const LastDateAndTimeOfObservations = chart.LastDateAndTimeOfObservations;
      const ToDateTime = respData ? respData.DateAndTimeOfObservations : curreDateTime;
      let iterrate = moment(moment(ToDateTime)).diff(LastDateAndTimeOfObservations) / 1000;
      iterrate = (iterrate < (updatedInterval - 5)) ? updatedInterval : iterrate;
      for (let i = 1; i < iterrate; i++) {
        const newDt = moment(LastDateAndTimeOfObservations).add(i, 'seconds');
        const newDtString = moment(newDt).format('YYYY-MM-DD HH:mm:ss');
        const observationData = _.find(chartDataByDesc, (v) => {
          const obsDate = moment(v.DateAndTimeOfObservations).format('YYYY-MM-DD HH:mm:ss');
          return v.Observation === chart.observation
            && obsDate === newDtString;
        });
        PatientVitalsDataResponse.push({
          PatientId: patientId,
          Observation: chart.observation,
          ObservationValue: observationData ? observationData.ObservationValue : undefined,
          ObservationValueDouble: observationData ? observationData.ObservationValueDouble : undefined,
          DateAndTimeOfObservations: moment(newDt).toDate()
        });
        chart.LastDateAndTimeOfObservations = moment(newDt).toDate();
      }
    });
    return PatientVitalsDataResponse;
  }

  // Demo Mode Functions.....
  initAllDemoGraph(): void {
    // // ecg1
    // this.plotGraphUsingNgChart('ecg1ChartContainer', 'ECG-I',
    //   this.graphData.ecg1.minValue,
    //   this.graphData.ecg1.maxValue, 'ecg1');

    // // ecg2
    // this.plotGraphUsingNgChart('ecg2ChartContainer', 'ECG-II',
    //   this.graphData.ecg2.minValue,
    //   this.graphData.ecg2.maxValue, 'ecg2');

    // // ecg3
    // this.plotGraphUsingNgChart('ecg3ChartContainer', 'ECG-III',
    //   this.graphData.ecg3.minValue,
    //   this.graphData.ecg3.maxValue, 'ecg3');

    // // avr
    // this.plotGraphUsingNgChart('avrChartContainer', 'aVR',
    //   this.graphData.avr.minValue,
    //   this.graphData.avr.maxValue, 'avr');

    // // avl
    // this.plotGraphUsingNgChart('avlChartContainer', 'aVL',
    //   this.graphData.avl.minValue,
    //   this.graphData.avl.maxValue, 'avl');

    // // avf
    // this.plotGraphUsingNgChart('avfChartContainer', 'aVF',
    //   this.graphData.avf.minValue,
    //   this.graphData.avf.maxValue, 'avf');

    // // vi
    // this.plotGraphUsingNgChart('viChartContainer', 'V1',
    //   this.graphData.vi.minValue,
    //   this.graphData.vi.maxValue, 'vi');

    // // pleth
    // this.plotGraphUsingNgChart('plethChartContainer', 'Pleth',
    //   this.graphData.pleth.minValue,
    //   this.graphData.pleth.maxValue, 'pleth');

    // // resp
    // this.plotGraphUsingNgChart('respChartContainer', 'Resp',
    //   this.graphData.resp.minValue,
    //   this.graphData.resp.maxValue, 'resp');

    // // art
    // this.plotGraphUsingNgChart('artChartContainer', 'Art',
    //   this.graphData.art.minValue,
    //   this.graphData.art.maxValue,
    //   'art');

    // // pap
    // this.plotGraphUsingNgChart('papChartContainer', 'PA',
    //   this.graphData.pap.minValue,
    //   this.graphData.pap.maxValue,
    //   'pap');

    // // cvp
    // this.plotGraphUsingNgChart('cvpChartContainer', 'CVP',
    //   this.graphData.cvp.minValue,
    //   this.graphData.cvp.maxValue,
    //   'cvp');

    // // co2
    // this.plotGraphUsingNgChart('co2ChartContainer', 'CO2',
    //   this.graphData.co2.minValue,
    //   this.graphData.co2.maxValue,
    //   'co2');

    // // AO
    // this.plotGraphUsingNgChart('aoChartContainer', 'AO',
    //   this.graphData.ao.minValue,
    //   this.graphData.ao.maxValue,
    //   'ao');

    // // UAP
    // this.plotGraphUsingNgChart('uapChartContainer', 'UAP',
    //   this.graphData.uap.minValue,
    //   this.graphData.uap.maxValue,
    //   'uap');

    // // BAP
    // this.plotGraphUsingNgChart('bapChartContainer', 'BAP',
    //   this.graphData.bap.minValue,
    //   this.graphData.bap.maxValue,
    //   'bap');

    // // FAP
    // this.plotGraphUsingNgChart('fapChartContainer', 'FAP',
    //   this.graphData.fap.minValue,
    //   this.graphData.fap.maxValue,
    //   'fap');

    // // O2
    // this.plotGraphUsingNgChart('o2ChartContainer', 'O2',
    //   this.graphData.o2.minValue,
    //   this.graphData.o2.maxValue,
    //   'o2');

    // // N2O
    // this.plotGraphUsingNgChart('n2oChartContainer', 'N2O',
    //   this.graphData.n2o.minValue,
    //   this.graphData.n2o.maxValue, 'n2o');

    // // AA
    // this.plotGraphUsingNgChart('aaChartContainer', 'AA',
    //   this.graphData.aa.minValue,
    //   this.graphData.aa.maxValue,
    //   'aa');
  }
  initChartDataPoint(graphType, chartIndex): void {
    let chart = this.graphChartTypes[chartIndex];
    chart.dataPoints = [];
    chart.ngChart.labels = [];
    for (let i = 0; i < chart.chartLength; i++) {
      chart.dps.push({ y: null });
      chart.dataPoints.push(null);
      chart.ngChart.labels.push('');
    }
  }
  getDemoPatientVitalsData(): void {
  }
  updateDemoChart(graphType, chartIndex, count): void {
    const count1 = count || 1;
    let chart = this.graphChartTypes[chartIndex];
    // count is number of times loop runs to generate random dataPoints.
    for (let j = 0; j < count1; j++) {
      this.graphData[graphType].xVal++;
      // this.yVal = this.yVal + Math.round(5 + Math.random() * (-5 - 5));
      const counter = this.graphData[graphType].counter;
      if (counter > chart.chartLength) {
        this.graphData[graphType].counter = 0;
      }
      this.graphData[graphType].dataPoints[this.graphData[graphType].xVal % chart.chartLength] = this.graphData[graphType].chartData[counter];
      this.graphData[graphType].counter += this.graphData[graphType].stepValue ? this.graphData[graphType].stepValue : 4;
      this.graphData[graphType].dataPoints[(this.graphData[graphType].xVal + this.gap) % chart.chartLength] = null;
    }
    this.graphData[graphType].ngChart.datasets.data = this.graphData[graphType].dataPoints;
    this.graphData[graphType].ngChart.lineChartData = [this.graphData[graphType].ngChart.datasets];

    this.updateChartTimeOutFunction.push(setTimeout(() => {
      this.updateDemoChart(graphType, chartIndex, 1);
    }, this.updateGraphInterval));
  }

  ngOnDestroy(): void {
    this.graphDateAndTime[this.patientId] = false;
    this.updateChartTimeOutFunction.forEach(id => clearTimeout(id));
    this.getObeservationTimeOutFunction.forEach(id => clearTimeout(id));
  }


}

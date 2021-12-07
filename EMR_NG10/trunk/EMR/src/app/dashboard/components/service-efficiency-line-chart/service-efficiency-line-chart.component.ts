import { Component, OnInit } from '@angular/core';
import { DashBoardService } from '../../services/dashboard.service';
import * as _ from 'lodash';
import { ChartDataSets, ChartOptions } from 'chart.js';
import { Color, Label } from 'ng2-charts';

@Component({
  selector: 'app-service-efficiency-line-chart',
  templateUrl: './service-efficiency-line-chart.component.html',
  styleUrls: ['./service-efficiency-line-chart.component.scss'],
})
export class ServiceEfficiencyLineChartComponent implements OnInit {
  lineChartData: ChartDataSets[] = [];
  lineChartLabels: Label[] = [];
  lineChartColors: Color[] = [
    {
      borderColor: '#3F51B5',
      backgroundColor: '#3F51B5',
    },
    {
      borderColor: '#11cdef',
      backgroundColor: '#11cdef',
    },
  ];
  lineChartLegend = true;
  lineChartType = 'line';
  lineChartPlugins = [];
  showChart: boolean;
  lineChartOptions: ChartOptions = {
    responsive: true,
    legend: { display: false },
  };

  constructor(
    public dashBoardService: DashBoardService,
  ) { }

  ngOnInit() {
    this.showChart = false;
    this.dashBoardService.getServiceEfficiencyDetails().subscribe(res => {
      if (res.length) {
        this.lineChartOptions.tooltips = {
          mode: 'index',
          intersect: true,
          callbacks: {
            label: function (tooltipItem, data) {
              if (tooltipItem.datasetIndex === 1) {
                return ' Skip Percent:' + res[tooltipItem.index].percent_count;
              } else {
                return ' On Time Sevice:' + res[tooltipItem.index].percent_count + ' / Total Service:' + res[tooltipItem.index].total_count;
              }
            }
          }
        };
        const chartdata = [{
          label: 'On Time Sevice',
          data: []
        },
        {
          label: 'Skip Percent ',
          data: []
        }
        ];
        _.map(res, v => {
          this.lineChartLabels.push(v.hours);
          chartdata[0].data.push(v.efficiency_count);
          chartdata[1].data.push(v.percent_count);
        });
        this.lineChartData = chartdata;
      }
      this.showChart = true;
    });
  }

}

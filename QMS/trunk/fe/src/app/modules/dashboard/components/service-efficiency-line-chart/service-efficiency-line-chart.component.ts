import { Component, OnInit } from '@angular/core';
import { DashBoardService } from '../../services/dashboard.service';
import * as _ from 'lodash';
import { ChartDataSets, ChartOptions } from 'chart.js';
import { Color, Label } from 'ng2-charts';
import { AuthService } from 'src/app/services/auth.service';
import { CommonService } from 'src/app/services/common.service';
import { Constants } from 'src/app/config/constants';

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
  timeFormateKey = '';
  constructor(
    public dashBoardService: DashBoardService,
    private commonService: CommonService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    const userId = +this.authService.getLoggedInUserId();
    this.timeFormateKey = this.authService.getUserInfoFromLocalStorage().timeFormat;
    this.showChart = false;
    this.dashBoardService.getServiceEfficiencyDetails().subscribe(res => {
      if (res.length) {
        this.lineChartOptions.tooltips = {
          mode: 'index',
          intersect: true,
          callbacks: {
            label: function (tooltipItem, data) {
              if (tooltipItem.datasetIndex === 0) {
                return ' On Time Service: ' + res[tooltipItem.index].efficiency_count + ' / Percentage : ' + res[tooltipItem.index].percent_count + '%';
              } else {
                return ' Total Service: ' + res[tooltipItem.index].total_count;
              }
            }
          }
        };
        const chartdata = [{
          label: 'On Time Service',
          data: []
        },
        {
          label: 'Total Service ',
          data: []
        }
        ];
        _.map(res, v => {
          v.hours = _.clone(this.commonService.convertTime(this.timeFormateKey, v.hours));
          this.lineChartLabels.push(v.hours);
          chartdata[0].data.push(v.efficiency_count);
          chartdata[1].data.push(v.total_count);
        });
        this.lineChartData = chartdata;
      }
      this.showChart = true;
    });
  }

}

import { Observable } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3-selection';
import * as d3Scale from 'd3-scale';
import * as d3Array from 'd3-array';
import * as d3Axis from 'd3-axis';
import * as _ from 'lodash';
import { ChartService } from '../../../public/services/chart.service';
import { DashBoardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-admin-dashboard-multiseries-bar-chart',
  templateUrl: './admin-dashboard-multiseries-bar-chart.component.html',
  styleUrls: ['./admin-dashboard-multiseries-bar-chart.component.scss']
})
export class AdminDashboardMultiseriesBarChartComponent implements OnInit {
    // title = '';
    margin = { top: 20, right: 80, bottom: 30, left: 50 };
    width: number;
    height: number;
    multiSeriesBarsvg: any;
    multiSeriesBarData: any;
    g: any;
    x0;
    x1;
    y;
    z;
    keys = [];
  constructor(
   private chartservice: ChartService,
   private dashboardService: DashBoardService
  ) { }

  ngOnInit() {
    this.initMultiSeriesBarSvg();
    this.initMultiSeriesBarAxis();
  }

  private initMultiSeriesBarSvg() {
    this.multiSeriesBarsvg = d3.select('#multiseriesbarchart svg');
    this.width = +this.multiSeriesBarsvg.attr('width') - this.margin.left - this.margin.right;
    this.height = +this.multiSeriesBarsvg.attr('height') - this.margin.top - this.margin.bottom;
    this.g = this.multiSeriesBarsvg.append('g')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');
  }

  initMultiSeriesBarAxis() {
    // this.multiSeriesBarData = this.chartservice.multiSeriesBarChartData;
    const generateData = [];
    this.dashboardService.getAppointmentTypeStats().subscribe(res => {
      if (res) {
        _.map(res, (o) => {
          const sday = this.chartservice.getShortDay(o.day);
          const obj = {
            day: sday,
            values: {
              previlage: o.total_previlage,
              normal: o.total_routine,
              free: o.total_free
            }
          };
          generateData.push(obj);
        });
        // console.log(res);
        this.multiSeriesBarData = generateData;
        Object.keys(this.multiSeriesBarData[0].values).map((d: any) => {
          if (this.keys.indexOf(d) === -1) {
            this.keys.push(d);
          }
        });
        this.x0 = d3Scale.scaleBand().rangeRound([0, this.width]).padding(0.1);
        this.x1 = d3Scale.scaleBand().padding(0.05);
        this.y = d3Scale.scaleLinear().rangeRound([this.height, 0]);
        this.z = d3Scale.scaleOrdinal()
          .range(['#98abc5', '#8a89a6', '#7b6888', '#6b486b', '#a05d56', '#d0743c', '#ff8c00']);
        this.x0.domain(this.multiSeriesBarData.map((d) => d.day));
        this.x1.domain(this.keys).rangeRound([0, this.x0.bandwidth()]);
        const maxDomain = d3Array.max(this.multiSeriesBarData, (d: any) => {
          return d3Array.max(this.keys, (key: any, i: number) => {
            return d.values[key];
          });
        });

        this.y.domain([0, maxDomain + 1]).nice();
        this.drawMultiSeriesBarAxis();
        this.drawMultiSeriesBars();
      }
    });
  }
  private drawMultiSeriesBarAxis() {
    this.multiSeriesBarsvg = this.g.append('svg')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');
  }

  private drawMultiSeriesBars() {
    this.g.append('g')
      .selectAll('g')
      .data(this.multiSeriesBarData)
      .enter().append('g')
      .attr('class', 'bar')
      .attr('transform', (d) => 'translate(' + this.x0(d.day) + ',0)')
      .selectAll('rect')
      .data((d) => this.keys.map((key) => ({ key, value: d.values[key] })))
      .enter().append('rect')
      .attr('x', (d) => this.x1(d.key))
      .attr('y', (d) => this.y(d.value))
      .attr('width', this.x1.bandwidth())
      .attr('height', (d) => this.height - this.y(d.value))
      .attr('fill', (d) => this.z(d.key));

    this.g.append('g')
      .attr('class', 'axis')
      .attr('transform', 'translate(0,' + this.height + ')')
      .call(d3Axis.axisBottom(this.x0));

    this.g.append('g')
      .attr('class', 'y axis')
      .call(d3Axis.axisLeft(this.y).ticks(null, 's'))
      .append('text')
      .attr('x', 2)
      .attr('y', this.y(this.y.ticks().pop()) + 0.5)
      .attr('dy', '0.32em')
      .attr('fill', '#000')
      .attr('font-weight', 'bold')
      .attr('text-anchor', 'start');
      // .text('Population');

    const legend = this.g.append('g')
      .attr('font-family', 'sans-serif')
      .attr('font-size', 10)
      .attr('text-anchor', 'end')
      .selectAll('g')
      .data(this.keys.slice().reverse())
      .enter().append('g')
      .attr('transform', (d, i) => 'translate(0,' + i * 20 + ')');
  }
}

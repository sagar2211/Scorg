import { DashBoardService } from './../../services/dashboard.service';
import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import * as d3 from 'd3-selection';
import * as d3Scale from 'd3-scale';
import * as d3Shape from 'd3-shape';
import * as d3Axis from 'd3-axis';
import * as d3Array from 'd3-array';
import { ChartService } from './../../../../services/chart.service';
import * as _ from 'lodash';

export interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

@Component({
  selector: 'app-admin-dashboard-stacked-bar-chart',
  templateUrl: './admin-dashboard-stacked-bar-chart.component.html',
  styleUrls: ['./admin-dashboard-stacked-bar-chart.component.scss']
})
export class AdminDashboardStackedBarChartComponent implements OnInit {



  title = 'Stacked Bar Chart';

  margin: Margin;

  width: number;
  height: number;

  svgStackBar: any;     // TODO replace all `any` by the right type

  x: any;
  y: any;
  z: any;
  g: any;

  constructor(
    public chartservice: ChartService,
    private dashboardService: DashBoardService
  ) { }
  expectedActualData: any[];
  ngOnInit() {
    this.initMargins();
    this.initSvgStackBar();
    this.expectedActualData = [];
    this.dashboardService.getExpectedVsActualData().subscribe(res => {
      if (res) {
        _.map(res, (o) => {
          const day = this.chartservice.getShortDay(o.day);
          const obj = {
            state: day,
            completed: o.total_completed,
            noshow: o.total_noshow,
            empty: o.total_empty
          };
          this.expectedActualData.push(obj);
        });
        // this.drawSvgStackBarChart(res);
        console.log(res);
        this.drawSvgStackBarChart(this.expectedActualData);
      }
    });
    // this.drawSvgStackBarChart(this.chartservice.SAMPLE_DATA);
  }

  initMargins() {
    this.margin = { top: 20, right: 20, bottom: 30, left: 40 };
  }

  initSvgStackBar() {
    this.svgStackBar = d3.select('#stackbarchart svg');

    this.width = +this.svgStackBar.attr('width') - this.margin.left - this.margin.right;
    this.height = +this.svgStackBar.attr('height') - this.margin.top - this.margin.bottom;
    this.g = this.svgStackBar.append('g').attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');

    this.x = d3Scale.scaleBand()
      .rangeRound([0, this.width])
      .paddingInner(0.4)
      .paddingOuter(0.2)
      .align(0.5);
    this.y = d3Scale.scaleLinear()
      .rangeRound([this.height, 0]);
    this.z = d3Scale.scaleOrdinal()
      .range(['#3F51B5', '#fd7e14', '#adb5bd']); // '#6b486b', '#a05d56', '#d0743c', '#ff8c00'
  }

  drawSvgStackBarChart(data: any[]) {

    const keys = Object.getOwnPropertyNames(data[0]).slice(1);

    data = data.map(v => {
      v.total = keys.map(key => v[key]).reduce((a, b) => a + b, 0);
      return v;
    });
    data.sort((a: any, b: any) => b.total - a.total);

    this.x.domain(data.map((d: any) => d.state));
    this.y.domain([0, d3Array.max(data, (d: any) => d.total)]).nice();
    this.z.domain(keys);



    this.g.append('g')
      .selectAll('g')
      .data(d3Shape.stack().keys(keys)(data))
      .enter().append('g')
      .attr('fill', d => this.z(d.key))
      .selectAll('rect')
      .data(d => d)
      .enter().append('rect')
      .attr('x', d => this.x(d.data.state))
      .attr('y', d => this.y(d[1]))
      .attr('height', d => this.y(d[0]) - this.y(d[1]))
      .attr('width', this.x.bandwidth())
      .on('mouseover', function (d) {
        // const xPosition = d3.mouse(this)[0] - 30;
        // const yPosition = d3.mouse(this)[1] - 50;
        // tooltip.attr('transform', 'translate(' + xPosition + ',' + yPosition + ')');
        tooltip.select('#empty').text('Empty : ' + d.data['empty']);
        tooltip.select('#noshow').text('No Show : ' + d.data['noshow']);
        tooltip.select('#completed').text('Completed : ' + d.data['completed']);
        tooltip.style('display', null);
      })
      .on('mouseout', function () { tooltip.style('display', 'none'); });

    this.g.append('g')
      .attr('class', 'axis')
      .attr('transform', 'translate(0,' + this.height + ')')
      .call(d3Axis.axisBottom(this.x));

    this.g.append('g')
      .attr('class', 'axis')
      .call(d3Axis.axisLeft(this.y).ticks(null, 's'))
      .append('text')
      .attr('x', 2)
      .attr('y', this.y(this.y.ticks().pop()) + 0.5)
      .attr('dy', '0.32em')
      .attr('fill', '#000')
      .attr('font-weight', 'bold')
      .attr('text-anchor', 'start');

    // const legend = this.g.append('g')
    //   .attr('font-family', 'sans-serif')
    //   .attr('font-size', 10)
    //   .attr('text-anchor', 'end')
    //   .selectAll('g')
    //   .data(keys.slice().reverse())
    //   .enter().append('g')
    //   .attr('transform', (d, i) => 'translate(0,' + i * 20 + ')');

    // legend.append('rect')
    //   .attr('x', this.width - 19)
    //   .attr('width', 19)
    //   .attr('height', 19)
    //   .attr('fill', this.z);

    // legend.append('text')
    //   .attr('x', this.width - 24)
    //   .attr('y', 9.5)
    //   .attr('dy', '0.32em')
    //   .text(d => d);

    const tooltip = this.g.append('g')
      .attr('class', 'tooltip')
      .style('display', 'none')
      .style('opacity', 1);

    tooltip.append('rect')
      .attr('width', 90)
      .attr('height', 50)
      .attr('fill', '#eee')

    tooltip.append('text')
      .attr('id', 'empty')
      .attr('x', 40)
      .attr('y', 15)
      .style('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('font-weight', 'normal');

    tooltip.append('text')
      .attr('id', 'noshow')
      .attr('x', 40)
      .attr('y', 30)
      .style('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('font-weight', 'normal');

    tooltip.append('text')
      .attr('id', 'completed')
      .attr('x', 40)
      .attr('y', 45)
      .style('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('font-weight', 'normal');
  }

}

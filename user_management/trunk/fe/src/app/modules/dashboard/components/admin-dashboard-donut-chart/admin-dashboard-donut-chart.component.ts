import { ChartService } from './../../../../services/chart.service';
import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3-selection';
import * as d3Scale from 'd3-scale';
import * as d3Shape from 'd3-shape';
import { DashBoardService } from '../../services/dashboard.service';


@Component({
  selector: 'app-admin-dashboard-donut-chart',
  templateUrl: './admin-dashboard-donut-chart.component.html',
  styleUrls: ['./admin-dashboard-donut-chart.component.scss']
})
export class AdminDashboardDonutChartComponent implements OnInit {
  title = 'Donut Chart';

  private width: number;
  private height: number;

  private svg: any;     // TODO replace all `any` by the right type

  private radius: number;

  private arc: any;
  private pie: any;
  private color: any;

  private g: any;
  constructor(
    public chartservice: ChartService,
    public dashBoardService: DashBoardService,
  ) { }

  ngOnInit() {
    this.dashBoardService.getServiceStatsDetails().subscribe(res => {
      let chartData = [
        { value: 0, key: 'OnTime' },
        { value: 0, key: 'Empty' },
        { value: 0, key: 'Delayed' },
      ];
      if (res) {
        chartData = [
          { value: res.on_time_count, key: 'OnTime' },
          { value: res.empty_count, key: 'Empty' },
          { value: res.delayed_count, key: 'Delayed' },
        ];
      }
      this.initSvg();
      this.drawChart(chartData);
    });

  }

  private initSvg() {
    this.svg = d3.select('#dashboard-donut svg');

    this.width = +this.svg.attr('width');
    this.height = +this.svg.attr('height');
    this.radius = Math.min(this.width, this.height) / 2;

    this.color = d3Scale.scaleOrdinal()
      .range(['#7BD4E9', '#CEC9BB', '#8C82E6']);

    this.arc = d3Shape.arc()
      .outerRadius(this.radius - 10)
      .innerRadius(this.radius - 70);

    this.pie = d3Shape.pie()
      .sort(null)
      .value((d: any) => d.value);

    this.svg = d3.select('svg')
      .append('g')
      .attr('transform', 'translate(' + this.width / 2 + ',' + this.height / 2 + ')');

   
  }

  private drawChart(data: any[]) {
    let g = this.svg.selectAll('.arc')
      .data(this.pie(data))
      .enter().append('g')
      .attr('class', 'arc');

    g.append('path')
      .attr('d', this.arc)
      .style('fill', d => this.color(d.data.value))
      .on('mouseover', function(d) { tooltip.style('display', null); })
      .on('mouseout', function () { tooltip.style('display', 'none'); })
      .on('mousemove', function (d) {
          // const xPosition = d3.mouse(this)[0] - 15;
          // const yPosition = d3.mouse(this)[1] - 25;
          // console.log(d)
          // tooltip.attr('transform', 'translate(' + xPosition + ',' + yPosition + ')');
          // tooltip.select('text').text(d[1]);
          tooltip.select('#empty').text( d.data['key'] + ' : ' + d.data['value']);
          // tooltip.select('#delayed').text('Delayed : ' + d.data['value']);
          // tooltip.select('#ontime').text('On Time : ' + d.data['value']);

      });

    // g.append('text')
    //   .attr('transform', d => 'translate(' + this.arc.centroid(d) + ')')
    //   .attr('dy', '.35em')
    //   .text(d => d.data.value);

    // const tooltip = this.tooltip;
    // d3.selectAll('.arc')
    //   .on('mouseover', (d: any) => {
    //     tooltip.text(d.data.age);
    //     return tooltip.style('visibility', 'visible');
    //   })
    //   .on('mousemove', function (d) {
    //     return tooltip.style('top', (d3.event.pageY - 10) + 'px').style('left', (d3.event.pageX + 10) + 'px');
    //   })
    //   .on('mouseout', function (d) {
    //     return tooltip.style('visibility', 'hidden');
    //   });

    const tooltip = this.svg.append('g')
    .attr('class', 'tooltip')
    .style('display', 'none')
    .style('opacity', 1);

  tooltip.append('rect')
    .attr('width', 90)
    .attr('height', 20)
    .attr('fill', '#eee')

    tooltip.append('text')
    .attr('id','empty')
    .attr('x', 40)
    .attr('y',15)
    .style('text-anchor', 'middle')
    .attr('font-size', '12px')
    .attr('font-weight', 'normal');
  }

}

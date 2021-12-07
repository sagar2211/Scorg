
import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import * as _ from 'lodash';
import * as moment from 'moment';
import { ChartService } from '../../../public/services/chart.service';
import { DashBoardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-admin-dashboard-multiline-chart',
  templateUrl: './admin-dashboard-multiline-chart.component.html',
  styleUrls: ['./admin-dashboard-multiline-chart.component.scss']
})
export class AdminDashboardMultilineChartComponent implements OnInit {
  title = 'Multi-Series Line Chart';

  DashBoardMultileChartdata: any;
  chartDataObject = [];
  svgMultiLineSeries: any;
  margin = {top: 20, right: 80, bottom: 30, left: 50};
  g: any;
  width: number;
  height: number;
  xA;
  yA;
  zA;
  line;
  color;
  constructor(
    public chartservice: ChartService,
    private dashboardService: DashBoardService
  ) { }

  ngOnInit() {
    this.dashboardService.getPatientTurnoutDetails().subscribe(res => {
      if (res) {
        const chartobj = [{
            id: 'appointment',
            values: []
          },
          {
            id: 'completed',
            values: []
          },
          {
            id: 'noshow',
            values: []
          },
        ];
        _.map(res, (o) => {
          const month = moment().month(o.Month).format('M');
          const day = '01';
          const year = o.Year;
          const date = year + '-' + month + '-' + day;
          const appointmentTempObj = {date: new Date(date), temperature: o.ApptCount};
          const completedTempObj = {date: new Date(date), temperature: o.Completed};
          const noSjowTempObj = {date: new Date(date), temperature: o.Absent};

          let appObj = chartobj.find(t => t.id === 'appointment').values;
          appObj.push(appointmentTempObj);
          let compObj =  chartobj.find(t => t.id === 'completed').values;
          compObj.push(completedTempObj);
          let noShowObj = chartobj.find(t => t.id === 'noshow').values;
          noShowObj.push(noSjowTempObj);
          // chartobj.find(t => t.id === 'appointment').values.sort(function compare(a, b) {
          //   const dateA = new Date(a.date);
          //   const dateB = new Date(b.date);
          //   return dateA - dateB;
          //   return moment(new Date(a.date))
          // });
          appObj = _.sortBy(chartobj.find(t => t.id === 'appointment').values, (t) => {
            return moment(t.date).format('YYYY-MM-DD');
          });
          compObj = _.sortBy(chartobj.find(t => t.id === 'completed').values, (t) => {
            return moment(t.date).format('YYYY-MM-DD');
          });
          noShowObj = _.sortBy(chartobj.find(t => t.id === 'noshow').values, (t) => {
            return moment(t.date).format('YYYY-MM-DD');
          });
        });
        this.chartservice.multiSeriesData = chartobj;
        this.DashBoardMultileChartdata = this.chartservice.multiSeriesData.map((v) => v.values.map((a) => a.date ))[0];
        this.initMultileChart();
        this.drawMultileChartAxis();
        this.drawMultileChartPath();
        // console.log(chartobj);


      }
    });

  }

  // ngAfterViewInit() {
  //   setTimeout(() => {

  //   });
  // }

   initMultileChart(): void {
    this.svgMultiLineSeries = d3.select('#multilineserieschart svg');

    this.width = this.svgMultiLineSeries.attr('width') - this.margin.left - this.margin.right;
    this.height = this.svgMultiLineSeries.attr('height') - this.margin.top - this.margin.bottom;

    this.g = this.svgMultiLineSeries.append('g').attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');
    this.color = d3.scaleOrdinal()
    .range(['#11cdef', '#3F51B5', '#fd7e14']);
    this.xA = d3.scaleTime().range([0, this.width]);
    this.yA = d3.scaleLinear().range([this.height, 0]);
    this.zA = d3.scaleOrdinal(d3.schemeCategory10);

    this.line = d3.line()
        // .curve(d3.curveBasis)
        .x( (d: any) => this.xA(d.date) )
        .y( (d: any) => this.yA(d.temperature) )
        .curve(d3.curveMonotoneX); // apply smoothing to the line;

    this.xA.domain(d3.extent(this.DashBoardMultileChartdata, (d: Date) => d ));

    this.yA.domain([
        d3.min(this.chartservice.multiSeriesData, (c) => d3.min(c.values, (d) => d.temperature)),
        d3.max(this.chartservice.multiSeriesData, (c) => d3.max(c.values, (d) => d.temperature))
    ]);

    this.zA.domain(this.chartservice.multiSeriesData.map((c) => c.id));
}

   drawMultileChartAxis(): void {
    this.g.append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', 'translate(0,' + this.height + ')')
      .call(d3.axisBottom(this.xA));

    this.g.append('g')
      .attr('class', 'axis axis--y')
      .call(d3.axisLeft(this.yA))
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 6)
      .attr('dy', '0.71em')
      .attr('fill', '#000');
      // .text('Temperature, ºF');
  }

   drawMultileChartPath(): void {

    const lineOpacity = '0.25';
    const lineOpacityHover = '0.85';
    const otherLinesOpacityHover = '0.1';
    const lineStroke = '1.5px';
    const lineStrokeHover = '2.5px';

    const circleOpacity = '0.85';
    const circleOpacityOnLineHover = '0.25';
    const circleRadius = 5;
    const circleRadiusHover = 8;

    const xAxis = this.xA;
    const yAxis = this.yA;

    const dataArray = this.g.selectAll('.dataArray')
      .data(this.chartservice.multiSeriesData)
      .enter().append('g')
      .attr('class', 'dataArray');

    dataArray.append('path')
      .attr('class', 'line')
      .attr('d', (d) => this.line(d.values))
      .style('stroke', (d, i) => this.color(i))
      .style('fill', 'transparent');

    dataArray.append('text')
      .datum((d) => ({ id: d.id, value: d.values[d.values.length - 1] }))
      .attr('transform', (d) => 'translate(' + this.xA(d.value.date) + ',' + this.yA(d.value.temperature) + ')')
      .attr('x', 3)
      .attr('dy', '0.35em')
      .style('font', '10px sans-serif');
      // .text((d) => d.id);

    dataArray.selectAll('circle-group')
      .data(this.chartservice.multiSeriesData).enter()
      .append('g')
      .style('stroke', (d, i) => this.color(i))
      .style('fill', 'transparent')
      .selectAll('circle')
      .data(d => d.values).enter()
      .append('g')
      .attr('class', 'circle')
      .on('mouseover', function(d) {
        d3.select(this)
          .style('cursor', 'pointer')
          .append('text')
          .attr('class', 'text')
          .text(`${d.temperature}`)
          .attr('x', xAxis(d.date) + 5)
          .attr('y', yAxis(d.temperature) - 10);
          // .style('fill', (d, i) => 'red');
      })
      .on('mouseout', function(d) {
        d3.select(this)
          .style('cursor', 'none')
          // .transition()
          // .duration(duration)
          .selectAll('.text').remove();
      })
      .append('circle')
      .attr('cx', (d: { date: any; }) => this.xA(d.date))
      .attr('cy', (d: { temperature: any; }) => this.yA(d.temperature))
      .attr('r', circleRadius)
      .style('opacity', circleOpacity)
      .on('mouseover', function(d) {
        d3.select(this)
          // .transition()
          // .duration(duration)
          // .style('fill', (d, i) => 'blue')
          .attr('r', circleRadiusHover);
      })
      .on('mouseout', function(d) {
        d3.select(this)
          // .transition()
          // .duration(duration)
          .attr('r', circleRadius);
      });
  }

}

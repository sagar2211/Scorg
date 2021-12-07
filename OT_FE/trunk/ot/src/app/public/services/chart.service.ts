import { Injectable } from '@angular/core';
import * as moment from 'moment';

@Injectable()
export class ChartService {

  donutData: any[] = [
    { value: 70, key: 'OnTime' },
    { value: 50, key: 'Empty' },
    { value: 30, key: 'Delayed' },
  ];

  SAMPLE_DATA: any[] = [
    { state: 'MON', completed: 1000, noshow: 5000, empty: 1000 },
    { state: 'TUE', completed: 1200, noshow: 6000, empty: 4000 },
    { state: 'WED', completed: 5500, noshow: 3500, empty: 5000 },
    { state: 'THU', completed: 1000, noshow: 4400, empty: 6000 },
    { state: 'FRI', completed: 3000, noshow: 1200, empty: 7000 },
    { state: 'SAT', completed: 2500, noshow: 5000, empty: 3000 },
    { state: 'SUN', completed: 2000, noshow: 1500, empty: 1000 },
  ];

  multiSeriesData = [
    {
      id: 'appointment',
      values: [
        { date: new Date('2011-01-10'), temperature: 100 },
        { date: new Date('2011-02-20'), temperature: 58 },
        { date: new Date('2011-03-30'), temperature: 75 },
        { date: new Date('2011-04-10'), temperature: 55 },
        { date: new Date('2011-05-15'), temperature: 99 },
        { date: new Date('2011-06-26'), temperature: 58 },
        { date: new Date('2011-07-17'), temperature: 80 },
        { date: new Date('2011-08-28'), temperature: 61 },
        { date: new Date('2011-09-19'), temperature: 11 },
        { date: new Date('2011-10-08'), temperature: 22 },
        { date: new Date('2011-11-11'), temperature: 50 },
        { date: new Date('2011-12-22'), temperature: 100 },
      ]
    },
    {
      id: 'completed',
      values: [
        { date: new Date('2011-01-01'), temperature: 63 },
        { date: new Date('2011-02-02'), temperature: 58 },
        { date: new Date('2011-03-03'), temperature: 53 },
        { date: new Date('2011-04-04'), temperature: 55 },
        { date: new Date('2011-05-05'), temperature: 64 },
        { date: new Date('2011-06-06'), temperature: 58 },
        { date: new Date('2011-07-07'), temperature: 57 },
        { date: new Date('2011-08-08'), temperature: 61 },
        { date: new Date('2011-09-09'), temperature: 69 },
        { date: new Date('2011-10-10'), temperature: 71 },
        { date: new Date('2011-11-11'), temperature: 68 },
        { date: new Date('2011-12-12'), temperature: 61 },
      ]
    },
    {
      id: 'noshow',
      values: [
        { date: new Date('2011-01-01'), temperature: 46 },
        { date: new Date('2011-02-30'), temperature: 49 },
        { date: new Date('2011-03-01'), temperature: 48 },
        { date: new Date('2011-04-02'), temperature: 60 },
        { date: new Date('2011-05-03'), temperature: 62 },
        { date: new Date('2011-06-04'), temperature: 57 },
        { date: new Date('2011-07-05'), temperature: 44 },
        { date: new Date('2011-08-06'), temperature: 37 },
        { date: new Date('2011-09-07'), temperature: 35 },
        { date: new Date('2011-10-08'), temperature: 37 },
        { date: new Date('2011-11-09'), temperature: 45 },
        { date: new Date('2011-12-10'), temperature: 50 },
      ]
    },
  ];

  serviceEfficiency = [
    {
      id: 'On Time Sevice',
      values: [
        { time: new Date(moment().format('YYYY-MM-DD') + ' ' + '10:00 AM').getTime(), value: 12 },
        { time: new Date(moment().format('YYYY-MM-DD') + ' ' + '11:00 AM').getTime(), value: 18 },
        { time: new Date(moment().format('YYYY-MM-DD') + ' ' + '12:00 PM').getTime(), value: 16 },
        { time: new Date(moment().format('YYYY-MM-DD') + ' ' + '1:00 PM').getTime(), value: 11 },
        { time: new Date(moment().format('YYYY-MM-DD') + ' ' + '2:00 PM').getTime(), value: 9 },
        { time: new Date(moment().format('YYYY-MM-DD') + ' ' + '3:00 PM').getTime(), value: 19 },
        { time: new Date(moment().format('YYYY-MM-DD') + ' ' + '4:00 PM').getTime(), value: 20 },
        { time: new Date(moment().format('YYYY-MM-DD') + ' ' + '5:00 PM').getTime(), value: 14 },
      ]
    },
    {
      id: 'Skip Percentage',
      values: [
        { time: new Date(moment().format('YYYY-MM-DD') + ' ' + '10:00 AM').getTime(), value: 2 },
        { time: new Date(moment().format('YYYY-MM-DD') + ' ' + '11:00 AM').getTime(), value: 5 },
        { time: new Date(moment().format('YYYY-MM-DD') + ' ' + '12:00 PM').getTime(), value: 3 },
        { time: new Date(moment().format('YYYY-MM-DD') + ' ' + '1:00 PM').getTime(), value: 8 },
        { time: new Date(moment().format('YYYY-MM-DD') + ' ' + '2:00 PM').getTime(), value: 2 },
        { time: new Date(moment().format('YYYY-MM-DD') + ' ' + '3:00 PM').getTime(), value: 7 },
        { time: new Date(moment().format('YYYY-MM-DD') + ' ' + '4:00 PM').getTime(), value: 11 },
        { time: new Date(moment().format('YYYY-MM-DD') + ' ' + '5:00 PM').getTime(), value: 9 },
      ]
    },
  ];

  multiSeriesBarChartData = [
    {
      day: 'Mon',
      values: {
        previlage: 8,
        normal: 10,
        free: 1
      }
    },
    {
      day: 'Tue',
      values: {
        previlage: 6,
        normal: 20,
        free: 2
      }
    },
    {
      day: 'Wed',
      values: {
        previlage: 7,
        normal: 5,
        free: 3
      }
    },
    {
      day: 'Thu',
      values: {
        previlage: 4,
        normal: 10,
        free: 4
      }
    },
    {
      day: 'Fri',
      values: {
        previlage: 6,
        normal: 80,
        free: 1
      }
    },
    {
      day: 'Sat',
      values: {
        previlage: 7,
        normal: 45,
        free: 2
      }
    },
    {
      day: 'Sun',
      values: {
        previlage: 8,
        normal: 20,
        free: 3
      }
    }];
  constructor() { }

  getShortDay(day) {
    const upperDay = day;
    const shortDay = upperDay === 'Friday' ? 'FRI' :
      upperDay === 'Saturday' ? 'SAT' :
        upperDay === 'Sunday' ? 'SUN' :
          upperDay === 'Monday' ? 'MON' :
            upperDay === 'Tuesday' ? 'TUE' :
              upperDay === 'Wednesday' ? 'WED' :
                upperDay === 'Thursday' ? 'THU' : '';
    return shortDay;
  }
}

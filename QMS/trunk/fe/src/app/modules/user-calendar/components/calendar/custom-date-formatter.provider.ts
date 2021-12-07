import { CalendarDateFormatter, DateFormatterParams } from 'angular-calendar';
import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';


export class CustomDateFormatter extends CalendarDateFormatter {
  // you can override any of the methods defined in the parent class

  public monthViewColumnHeader({ date, locale }: DateFormatterParams): string {
    return new DatePipe(locale).transform(date, 'EEE', locale);
  }

  public monthViewTitle({ date, locale }: DateFormatterParams): string {
    return new DatePipe(locale).transform(date, 'MMM y', locale);
  }

  public weekViewColumnHeader({ date, locale }: DateFormatterParams): string {
    return new DatePipe(locale).transform(date, 'EEE', locale);
  }

  public weekViewHour({ date, locale }: DateFormatterParams): string {
    const globals = JSON.parse(localStorage.getItem('globals'));
    const timeFormat = globals.timeFormat ? globals.timeFormat : '12_hour';
    if (timeFormat === '24_hour') {
      return new DatePipe(locale).transform(date, 'HH:mm', locale);
    } else {
      return new DatePipe(locale).transform(date, 'hh:mm a', locale);
    }
  }

  public dayViewHour({ date, locale }: DateFormatterParams): any {
    const globals = JSON.parse(localStorage.getItem('globals'));
    const timeFormat = globals.timeFormat ? globals.timeFormat : '12_hour';
    if (timeFormat === '24_hour') {
      return new DatePipe(locale).transform(date, 'HH:mm', locale);
    } else {
      return new DatePipe(locale).transform(date, 'hh:mm a', locale);
    }
  }
}

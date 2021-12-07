import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { DynamicChartService } from './../../../dynamic-chart/dynamic-chart.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import * as _ from 'lodash';

@Component({
  selector: 'app-chart-date-time',
  templateUrl: './chart-date-time.component.html',
  styleUrls: ['./chart-date-time.component.scss']
})
export class ChartDateTimeComponent implements OnInit, OnDestroy {
  chartDateTimeFrm: FormGroup;
  @Input() componentInfo;

  destroy$ = new Subject<any>();

  chartDetailId;
  strictKeywordEnabled;
  isPanelOpen: boolean;

  constructor(
    private fb: FormBuilder,
    private dynamicChartService: DynamicChartService
  ) { }

  ngOnInit() {
    this.chartDetailId = this.componentInfo.chart_detail_id;
    this.strictKeywordEnabled = this.componentInfo.editable_suggestion;
    this.isPanelOpen = (this.componentInfo.activeIdsOfPanels as Array<any>).indexOf('chart_date_time') !== -1 ? true : false;
    this.patchDefaultValue();
    this.getInitialData();

    this.chartDateTimeFrm.valueChanges.subscribe(res => {
      this.dynamicChartService.updateLocalChartData('chart_date_detail', [res], 'update', this.chartDetailId);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  patchDefaultValue(obj?): void {
    this.chartDateTimeFrm = this.fb.group({
      chart_date: [obj ? new Date(obj.chart_date) : null],
      chart_detail_id: [this.chartDetailId]
    });
  }

  // -- get complaints types data
  getInitialData() {
    this.dynamicChartService.getChartDataByKey('chart_date_detail', true, null, this.chartDetailId).pipe(takeUntil(this.destroy$)).subscribe((result: any) => {
      if ((_.isArray(result) && !result.length) || result === null) {
        this.patchDefaultValue();
      } else {
        _.map(result, (x) => {
          this.patchDefaultValue(x);
        });
      }
    });
  }

  menuClicked(event) {
    this.isPanelOpen = event.nextState;
  }


}

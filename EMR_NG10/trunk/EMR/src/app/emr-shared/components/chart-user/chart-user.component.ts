import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { concat, Observable, Subject, of } from 'rxjs';
import { map, distinctUntilChanged, tap, switchMap, catchError, takeUntil } from 'rxjs/operators';
import { DynamicChartService } from './../../../dynamic-chart/dynamic-chart.service';
import { EMRService } from './../../../public/services/emr-service';
import * as _ from 'lodash';

@Component({
  selector: 'app-chart-user',
  templateUrl: './chart-user.component.html',
  styleUrls: ['./chart-user.component.scss']
})
export class ChartUserComponent implements OnInit {
  chartUserForm: FormGroup;
  @Input() componentInfo;

  destroy$ = new Subject<any>();
  doctorList$ = new Observable<any>();
  docListInput$ = new Subject<string>();
  doctorLoading = false;

  chartDetailId: number;
  strictKeywordEnabled;
  isPanelOpen: boolean;

  constructor(
    private emrService: EMRService,
    private fb: FormBuilder,
    private dynamicChartService: DynamicChartService
  ) { }

  ngOnInit() {
    this.chartDetailId = this.componentInfo.chart_detail_id;
    this.strictKeywordEnabled = this.componentInfo.editable_suggestion;
    this.isPanelOpen = (this.componentInfo.activeIdsOfPanels as Array<any>).indexOf('chart_user') !== -1 ? true : false;
    this.patchDefaultValue();
    this.loadDoctorList();
    this.getInitialData();

  }

  patchDefaultValue(data?): void {
    this.chartUserForm = this.fb.group({
      chart_user_id: [data ? data.chart_user_id : null],
      chart_detail_id: [this.chartDetailId],
      user_full_name: [data ? data.user_full_name : '']
    });
  }

  private loadDoctorList(searchTxt?) {
    this.doctorList$ = concat(
      this.getDoctorList(searchTxt), // default items
      this.docListInput$.pipe(
        distinctUntilChanged(),
        tap(() => this.doctorLoading = true),
        switchMap(term => this.getDoctorList(term).pipe(
          catchError(() => of([])), // empty list on error
          tap(() => this.doctorLoading = false)
        ))
      )
    );
  }

  getDoctorList(searchText): Observable<any> {
    const reqParam = {
      search_keyword: searchText,
      dept_id: 0,
      speciality_id: 0,
      role_type_id: 0,
      limit: 100
    };
    return this.emrService.getUsersList(reqParam).pipe(map(res => res));
  }

  // -- get complaints types data
  getInitialData() {
    this.dynamicChartService.getChartDataByKey('chart_user_detail', true, null, this.chartDetailId).pipe(takeUntil(this.destroy$)).subscribe((result: any) => {
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

  onUserSelect(event) {
    this.chartUserForm.patchValue({
      user_full_name: event ? event.user_name : '',
      chart_user_id: event ? event.user_id : ''
    });
    this.dynamicChartService.updateLocalChartData('chart_user_detail', [this.chartUserForm.value], 'update', this.chartDetailId);
  }

}

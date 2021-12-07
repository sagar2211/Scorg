import { DynamicChartService } from './../../../dynamic-chart/dynamic-chart.service';
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Form, FormGroup, FormBuilder } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as moment from 'moment';
import { CommonService } from 'src/app/public/services/common.service';

@Component({
  selector: 'app-followup-date',
  templateUrl: './followup-date.component.html',
  styleUrls: ['./followup-date.component.scss']
})
export class FollowupDateComponent implements OnInit, OnDestroy {
  @Input() public componentInfo: any;
  followupDateFrm: FormGroup;
  destroy$ = new Subject<any>();
  isPanelOpen: boolean;
  chartDetailId: number;
  followUpdateClone = null;
  minDate = new Date();
  constructor(
    private fb: FormBuilder,
    private dynamicChartService: DynamicChartService,
    private commonService: CommonService,
  ) { }

  ngOnInit() {
    this.chartDetailId = this.componentInfo.chart_detail_id;
    this.patchDefaultValue();
    this.getInitialData();
    this.getPrescriptionData();
    this.getpatientData();
    this.isPanelOpen = (this.componentInfo.activeIdsOfPanels as Array<any>).indexOf('followup_date') !== -1 ? true : false;

    this.followupDateFrm.valueChanges.subscribe(res => {
      this.dynamicChartService.updateLocalChartData('followup_date_detail', res, 'update');
    });
    this.dynamicChartService.$getEventFrmSuggestion.subscribe(data => {
      if (data.sectionKeyName === 'prescription') {
        this.getPrescriptionData();
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  getpatientData() {
    let patientObj = this.commonService.getLastActivePatient();
    this.minDate = new Date(patientObj.admissionDate);

  }

  patchDefaultValue() {
    this.followupDateFrm = this.fb.group({
      next_appointment: [null],
      is_calculable: [true],
      chart_detail_id: [this.chartDetailId],
      days: [null]
    });
  }

  // -- get complaints types data
  getInitialData() {
    this.dynamicChartService.getChartDataByKey('followup_date_detail', true, null, this.chartDetailId).pipe(takeUntil(this.destroy$)).subscribe((result: any) => {
      if (result.length === 0) {
        this.patchDefaultValue();
      } else {
        const diff = moment(result[0].next_appointment).diff(moment(), 'days');
        this.followupDateFrm.patchValue({
          next_appointment: moment(result[0].next_appointment).toDate(),
          is_calculable: result[0].is_calculable,
          days: diff ? diff : null
        });
      }
    });
  }

  getPrescriptionData() {
    this.dynamicChartService.getChartDataByKey('prescription_detail', true, null, this.chartDetailId).pipe(takeUntil(this.destroy$)).subscribe((result: any) => {
      if (result.length) {
        const numberArra = result.map(r => +r.days);
        const maxNumber = Math.max(...numberArra);
        const newDate = moment(new Date(), 'DD-MM-YYYY').add(maxNumber, 'days').toDate();
        this.followupDateFrm.patchValue({
          next_appointment: this.followupDateFrm.value.is_calculable ? newDate : this.followupDateFrm.value.next_appointment
        });
        const diff = moment(this.followupDateFrm.value.next_appointment).diff(moment(), 'days');
        this.followupDateFrm.patchValue({
          days: diff ? diff : null
        });
        this.dynamicChartService.updateLocalChartData('followup_date_detail', [this.followupDateFrm.value], 'update', this.chartDetailId);
      }
    });
  }

  panelChange(event) {
    this.isPanelOpen = event.nextState;
  }

  updateDateOrDays(from) {
    if (from === 'days') {
      const formVal = this.followupDateFrm.getRawValue();
      if (formVal.days) {
        const updateDate = moment().add('Days', formVal.days);
        this.followupDateFrm.patchValue({ next_appointment: new Date(updateDate.format('YYYY-MM-DD')) });
      } else {
        this.followupDateFrm.patchValue({
          next_appointment: new Date(),
          days: null
        });
      }
    } else {
      const diff = moment(this.followupDateFrm.value.next_appointment).diff(moment(), 'days');
      this.followupDateFrm.patchValue({
        days: diff ? diff : 0
      });
    }
  }

  openCloseSuggPanel() {
    this.commonService.openSuggesstionPanelOnFixedComponentSearchCallFunction('close');
  }

}

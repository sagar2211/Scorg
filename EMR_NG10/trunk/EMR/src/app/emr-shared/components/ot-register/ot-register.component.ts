import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DynamicChartService } from 'src/app/dynamic-chart/dynamic-chart.service';
import { CommonService } from 'src/app/public/services/common.service';
import { PublicService } from 'src/app/public/services/public.service';
import * as _ from 'lodash';
import { OtregisterService } from 'src/app/public/services/otregister.service';
import * as moment from 'moment';

@Component({
  selector: 'app-ot-register',
  templateUrl: './ot-register.component.html',
  styleUrls: ['./ot-register.component.scss']
})
export class OtRegisterComponent implements OnInit, OnDestroy {
  @Input() public componentInfo: any;
  registerForm: FormGroup;
  isPanelOpen: boolean;
  chartDetailId: number;
  primarySurgeryList = [];
  destroy$ = new Subject<any>();
  patientObj = null;
  patientId = null;
  showmessage = false;
  constructor(
    public publicService: PublicService,
    public commonService: CommonService,
    public dynamicChartService: DynamicChartService,
    public fb: FormBuilder,
    public otregisterService: OtregisterService,
  ) { }

  ngOnInit(): void {
    this.chartDetailId = this.componentInfo.chart_detail_id;
    this.isPanelOpen = (this.componentInfo.activeIdsOfPanels).indexOf(this.componentInfo.section_key) !== -1 ? true : false;

    this.getpatientData();
    this.createForm();
    this.updateValueToObj();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  getpatientData(patient?) {
    if (patient) {
      this.patientObj = patient;
    } else {
      this.patientObj = this.commonService.getLastActivePatient();
    }
    this.patientId = this.patientObj.patientData.id;
  }

  updateValueToObj() {
    this.registerForm.valueChanges.subscribe(res => {
      console.log(res);
      if (res.registerData) {
        res.registerData.chart_detail_id = this.chartDetailId;
        this.dynamicChartService.updateLocalChartData('ot_register_detail', [res.registerData], 'update', this.chartDetailId);
      }
    });
  }

  createForm() {
    this.registerForm = this.fb.group({
      date: new Date(),
      appointment: null,
      registerData: null
      // patientId: [null],
      // patientData: [null],
      // appointmentId: [null],
      // visitNo: [null],
      // serviceTypeId: [null],
      // actualOtDate: [null],
      // actualOtDateMin: [null],
      // actualOtDateMax: [null],
      // actualStartTime: [null],
      // actualEndTime: [null],
      // surgeryLevelId: [null],
      // anaesthesiaTypeId: [null],
      // isReExploration: [false],
      // reExplorationReason: [null],
      // procedureForm: this.fb.array([this.fb.group(this.addProcedureForm(true))]),
      // // surgeon: this.fb.array([this.fb.group(this.addSurgeon(true))]),
      // // anesthetist: this.fb.array([this.fb.group(this.addAnanaesthetist(true))]),
      // // nurse: this.fb.array([this.fb.group(this.addScrubNurse(true))]),
    });
    this.registerForm.get('appointment').disable();
    this.getOtRegisterDataForSelectedDate(new Date());
  }

  getOtRegisterDataForSelectedDate(date) {
    this.registerForm.patchValue(
      { date: date }
    );
    this.primarySurgeryList = [];
    const param = {
      date: date,
      patientId: this.patientId
    }
    this.otregisterService.getPatientOTRegisterByDate(param).subscribe(res => {
      console.log(res);
      if (res && res.data.length > 0) {
        this.primarySurgeryList = res.data;
        this.registerForm.get('appointment').enable();
        this.showmessage = false;
      } else {
        this.registerForm.get('appointment').disable();
        this.showmessage = true;
      }
    });
  }

  getOtDataForAppointment(val) {
    if (val) {
      this.getOtRegisterDataByAppointmentId(val.appointmentId).then(res => {
        if (res) {
          this.registerForm.patchValue({
            registerData: res
          });
        }
      });
    }
  }

  getOtRegisterDataByAppointmentId(aapId) {
    const promise = new Promise((resolve, reject) => {
      this.otregisterService.getOTRegisterByAppointmentId(aapId).subscribe(res => {
        resolve(res.data);
      });
    });
    return promise;
  }

  getInitialData() {
    this.dynamicChartService.getChartDataByKey('ot_register_detail', true, null, this.chartDetailId).pipe(takeUntil(this.destroy$)).subscribe((result: any) => {
      if ((_.isArray(result) && !result.length) || result === null) {
        this.patchDefaultValue();
      } else {
        _.map(result, (x) => {
          this.patchDefaultValue(x);
        });
      }
    });
  }

  patchDefaultValue(val?) {
    if(val){
      console.log(val);
      this.registerForm.patchValue({
        registerData: val
      });
    }
  }

  menuClicked(event: NgbPanelChangeEvent) {
    this.isPanelOpen = event.nextState;
    this.publicService.componentSectionClicked({
      sectionKeyName: 'ot_register'
    });
  }

  openCloseSuggPanel() {
    this.commonService.openSuggesstionPanelOnFixedComponentSearchCallFunction('close');
  }

}

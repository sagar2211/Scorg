import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { EMRService } from './../../../public/services/emr-service';
import { Observable, of, Subject } from 'rxjs';
import { IAlert } from './../../../public/models/AlertMessage';
import { MappingService } from './../../../public/services/mapping.service';
import { PatientChartService } from '../../../patient-chart/patient-chart.service';
import * as _ from 'lodash';
import { Constants } from './../../../config/constants';
import { CommonService } from 'src/app/public/services/common.service';

@Component({
  selector: 'app-suggestion-setting',
  templateUrl: './suggestion-setting.component.html',
  styleUrls: ['./suggestion-setting.component.scss']
})
export class SuggestionSettingComponent implements OnInit, OnDestroy {

  suggestionConfigurationForm: FormGroup;
  isShowManageOrder = false;
  searchText: string;
  suggestionConfigurations: Array<any> = [];
  clonedSuggestionConfigurations: Array<any> = [];
  ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  alertMsg: IAlert;
  isShowSearchFilter = false;
  serviceType$ = new Observable<any>();
  speciality$ = new Observable<any>();
  configPage$ = new Observable<any>();
  submitted = false;
  suggestionTypes = ['SNOMEDCT', 'MASTER', 'NONE'];
  semanticTags = [];
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private mappingService: MappingService,
    private emrService: EMRService,
    private patientChartService: PatientChartService,
    private commonService: CommonService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.commonService.routeChanged(this.route);
    this.searchText = '';
    const specialityParams = {
      search_string: '',
      page_number: 1,
      limit: 100
    };
    this.suggestionConfigurationForm = this.fb.group({
      configPage: ['CHART', Validators.required],
      speciality: [null, Validators.required],
      serviceType: [null, Validators.required]
    });
    this.serviceType$ = this.mappingService.getServiceTypeList();
    this.speciality$ = this.mappingService.getSpecialityList(specialityParams);
    this.serviceType$.subscribe(res => {
      this.suggestionConfigurationForm.patchValue({
        serviceType: res[0].id
      });
      this.getSuggestionConfigurations();
    });
    this.configPage$ = of(['CHART', 'ORDER']);
    this.getSemanticTags();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next(true);
    this.ngUnsubscribe.unsubscribe();
  }

  clearForm(): void {
    this.suggestionConfigurationForm.reset();
  }

  getSuggestionConfigurations(): void {
    const reqParams = {
      search_keyword: this.searchText,
      serviceTypeId: this.suggestionConfigurationForm.value.serviceType,
      specialityId: (this.suggestionConfigurationForm.value.speciality === null) ? 0 : this.suggestionConfigurationForm.value.speciality, configPage: this.suggestionConfigurationForm.value.configPage,
      // serviceTypeId: 1,
      // specialityId: 0,
      // configPage: 'CHART',
    };
    this.patientChartService.GetSuggestionConfiguration(reqParams).subscribe((res: any) => {
      if (res.status_message === 'Success') {
        this.suggestionConfigurations = res.data;
        this.clonedSuggestionConfigurations = _.cloneDeep(this.suggestionConfigurations);
        // this.page.totalElements = res.total_records;
      }
    });
  }

  onServiceTypeChange(event): void {
    this.getSuggestionConfigurations();
  }

  onSpecialityChange(event): void {
    this.getSuggestionConfigurations();
  }

  onConfigPageChange(event): void {
    this.getSuggestionConfigurations();
  }

  action(type, item): void {
    if (type === 'isEnableSnomed') {
      item.enableSnomedCt = !item.enableSnomedCt;
    }
  }

  submitChanges(): void {
    const dirtyRecords = _.filter(this.suggestionConfigurations, (o) => o.isDirty === true);
    if (!dirtyRecords.length) {
      this.alertMsg = {
        message: 'No Change Found',
        messageType: 'danger',
        duration: Constants.ALERT_DURATION
      };
      return;
    }
    const reqParams = {
      search_keyword: this.searchText,
      serviceTypeId: this.suggestionConfigurationForm.value.serviceType,
      specialityId: (this.suggestionConfigurationForm.value.speciality === null) ? 0 : this.suggestionConfigurationForm.value.speciality,
      configPage: this.suggestionConfigurationForm.value.configPage,
      // serviceTypeId: 1,
      // specialityId: 0,
      // configPage: 'CHART',
      componentData: dirtyRecords
    };
    this.patientChartService.SaveSuggestionConfiguration(reqParams).subscribe((res: any) => {
      if (res.status_message === 'Success') {
        _.map(this.suggestionConfigurations, (o) => {
          o.isDirty = false;
        });
        this.clonedSuggestionConfigurations = _.cloneDeep(this.suggestionConfigurations);
        // this.page.totalElements = res.total_records;
        this.alertMsg = {
          message: 'Data Saved Successfully',
          messageType: 'success',
          duration: Constants.ALERT_DURATION
        };
      }
    });
  }

  clearChanges(): void {
    this.suggestionConfigurations = _.cloneDeep(this.clonedSuggestionConfigurations);
  }

  getSemanticTags(): void {
    this.patientChartService.getSymanticTags().subscribe((res: any) => {
      if (res) {
        this.semanticTags = Object.keys(res);
      }
    });
  }
}

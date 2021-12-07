import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { MappingService } from './../../../public/services/mapping.service';
import { Constants } from './../../../config/constants';
import { DualListComponent } from 'angular-dual-listbox';
import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import * as _ from 'lodash';
import { forkJoin, Observable, of, concat, Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { PatientChartService } from './../../patient-chart.service';
import { IAlert } from './../../../public/models/AlertMessage';
import { map, distinctUntilChanged, switchMap, tap, catchError } from 'rxjs/operators';
import { EMRService } from './../../../public/services/emr-service';
import { CommonService } from 'src/app/public/services/common.service';

@Component({
  selector: 'app-patient-menu-builder',
  templateUrl: './patient-menu-builder.component.html',
  styleUrls: ['./patient-menu-builder.component.scss']
})
export class PatientMenuBuilderComponent implements OnInit {
  patientChartForm: FormGroup;
  mode = 'NEW';
  patientChartId: number;
  doctorLoading = false;
  submitted = false;
  selectedSectionKey = '';

  roleList$ = new Observable<any>();
  doctorList$ = new Observable<any>();
  docListInput$ = new Subject<string>();
  serviceType$ = new Observable<any>();
  speciality$ = new Observable<any>();

  allChartLists: Array<any> = [];
  allChartListsCopy: Array<any> = [];
  selectedChartLists: Array<any> = [];
  dualListboxFormat: any = DualListComponent.DEFAULT_FORMAT;
  alertMsg: IAlert;
  roleList: Array<any> = [];
  serviceList: Array<any> = [];
  specialityList: Array<any> = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private patientChartService: PatientChartService,
    private mappingService: MappingService,
    private emrService: EMRService,
    private commonService: CommonService,
  ) { }

  ngOnInit() {
    this.commonService.routeChanged(this.route);
    this.patientChartId = +this.route.snapshot.params.id;
    this.createInitForm();

    this.roleList$ = this.emrService.getUserRoleTypeList().pipe(map((res: any) => {
      this.roleList = res;
      return res;
    }));

    this.serviceType$ = this.mappingService.getServiceTypeList().pipe(map((res: any) => {
      this.serviceList = res;
      return res;
    }));

    const specialityParams = {
      search_string: '',
      page_number: 1,
      limit: 100
    };
    this.speciality$ = this.mappingService.getSpecialityList(specialityParams).pipe(map((res: any) => {
      this.specialityList = res;
      return res;
    }));

    this.loadDoctorList();
    this.patientChartForm.get('selectedSectionType').valueChanges.subscribe(chartType => {
      this.allChartLists = this.dataFilterByChartTypes(this.allChartListsCopy, chartType);
      this.selectedChartLists.forEach((ds: any) => {
        const indx = this.allChartLists.findIndex(s => s.chart_id === ds.chart_id);
        if (indx !== -1) {
          this.allChartLists.splice(indx, 1);
        }
      });
    });

    this.getMasterChartComponentList();
  }

  createInitForm(): void {
    this.patientChartForm = this.fb.group({
      // chartName: ['', Validators.required],
      serviceType: [1, Validators.required],
      speciality: [null, Validators.required],
      role: [null, Validators.required],
      doctor: [null],
      // isFollowUp: [false],
      selectedSectionType: ['']
    });
  }

  getMasterChartComponentList(): void {
    const reqParams = {
      service_type_id: this.patientChartForm.value.serviceType ? this.patientChartForm.value.serviceType : 0,
      speciality_id: this.patientChartForm.value.speciality ? this.patientChartForm.value.speciality : 0,
      role_type_id: this.patientChartForm.value.role ? this.patientChartForm.value.role : 0,
      user_id: this.patientChartForm.value.doctor ? this.patientChartForm.value.doctor : null
    };
    if (this.patientChartForm.invalid) {
      return;
    }
    this.patientChartService.getPatientChartMapping(reqParams).subscribe((res: any) => {
      if (res.status_message === 'Success') {
        this.allChartLists = [...this.allChartListsCopy] = res.data.non_selected_charts;
        this.allChartLists = this.dataFilterByChartTypes(this.allChartListsCopy, this.patientChartForm.value.selectedSectionType);

        this.selectedChartLists = (res.data.selected_charts as Array<any>);
        const fixedc = this.allChartLists.filter(sc => sc.is_mandatory);
        fixedc.forEach((sc: any) => {
          const indx = this.selectedChartLists.findIndex(dc => dc.chart_id === sc.chart_id);
          if (sc.chart_type === 'FIXED_CHART' && (indx === -1)) {
            this.selectedChartLists.push(sc);
            const scIndx = this.allChartLists.findIndex(s => s.chart_id === sc.chart_id);
            if (scIndx !== -1) {
              this.allChartLists.splice(scIndx, 1);
            }
          }
        });
        this.selectedChartLists = _.orderBy(this.selectedChartLists, ['chart_type', 'sequence'], ['desc', 'asc']);

      }
    });
  }

  saveForm(): void {
    this.submitted = true;
    if (this.patientChartForm.invalid) {
      return;
    }
    let count = 1;
    this.selectedChartLists.forEach(res => {
      res.sequence = count;
      count++;
    });

    const reqParams = {
      // chart_id: this.mode === 'NEW' ? 0 : this.patientChartId,
      service_type_id: this.patientChartForm.value.serviceType,
      speciality_id: this.patientChartForm.value.speciality,
      role_type_id: this.patientChartForm.value.role,
      user_id: this.patientChartForm.value.doctor,
      // chart_name: this.patientChartForm.value.chartName,
      // is_followup_chart: this.patientChartForm.value.isFollowUp,
      // is_active: true,
      chart_details: this.selectedChartLists
    };
    this.patientChartService.savePatientChartMapping(reqParams).subscribe((res: any) => {
      if (res.status_message === 'Success') {
        this.alertMsg = {
          message: 'Data saved successfully.',
          messageType: 'success',
          duration: Constants.ALERT_DURATION
        };
        this.clearForm();
        this.router.navigate(['/emr/charts/patient-chart-list']);
      }
    });
  }

  clearForm(): void {
    this.patientChartForm.reset();
    this.selectedChartLists = [];
    this.submitted = false;
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
      speciality_id: this.patientChartForm.value.speciality ? this.patientChartForm.value.speciality : 0,
      role_type_id: this.patientChartForm.value.role ? this.patientChartForm.value.role : 0,
      limit: 100
    };
    return this.emrService.getUsersList(reqParam).pipe(map(res => res));
  }

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      if (!(event.container.data[event.currentIndex]['is_mandatory'])) {
        moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      } else {
        this.alertMsg = {
          message: 'Cannot move chart!',
          messageType: 'danger',
          duration: Constants.ALERT_DURATION
        };
      }
    } else {
      transferArrayItem(event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex);
    }
  }

  onServiceTypeChange(event): void {
    this.getMasterChartComponentList();
  }

  onSpecialityChange(event): void {
    this.getMasterChartComponentList();
    this.loadDoctorList();
    this.patientChartForm.patchValue({
      doctor: null
    });
  }

  onRoleChange(event): void {
    this.getMasterChartComponentList();
    this.loadDoctorList();
    this.patientChartForm.patchValue({
      doctor: null
    });
  }

  onDoctorChange(event): void {
    this.getMasterChartComponentList();
  }

  itemDisable(item): boolean {
    if (item.chart_type === 'FIXED_CHART') {
      return (item.chart_id === 8 || item.chart_id === 12 || item.chart_id === 1 || item.chart_id === 2 || item.chart_id === 3);
    } else {
      return false;
    }

    // return (item.chart_type === 'FIXED_CHART' && item.chart_name);
  }

  dataFilterByChartTypes(filterList, chartType): Array<any> {
    if (chartType) {
      return filterList.filter(f => f.chart_type === chartType);
    } else {
      return [...filterList];
    }
  }

}


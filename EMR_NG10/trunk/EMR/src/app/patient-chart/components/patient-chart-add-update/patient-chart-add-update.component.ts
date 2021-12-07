import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ModifyDataBySectionKeyPipe } from './../../modify-data-by-section-key.pipe';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { MappingService } from './../../../public/services/mapping.service';
import { Constants } from './../../../config/constants';
import { DualListComponent } from 'angular-dual-listbox';
import * as _ from 'lodash';
import { Observable, of, concat, Subject, merge } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { PatientChartService } from './../../patient-chart.service';
import { IAlert } from './../../../public/models/AlertMessage';
import { map, distinctUntilChanged, switchMap, tap, catchError, debounceTime } from 'rxjs/operators';
import { EMRService } from './../../../public/services/emr-service';
import { CommonService } from 'src/app/public/services/common.service';

@Component({
  selector: 'app-patient-chart-add-update',
  templateUrl: './patient-chart-add-update.component.html',
  styleUrls: ['./patient-chart-add-update.component.scss']
})
export class PatientChartAddUpdateComponent implements OnInit {
  patientChartForm: FormGroup;
  mode = 'NEW';
  patientChartId: number;
  doctorLoading = false;
  submitted = false;
  selectedSectionKey = '';
  isSaveDisabled = false;

  roleList$ = new Observable<any>();
  doctorList$ = new Observable<any>();
  docListInput$ = new Subject<string>();
  serviceType$ = new Observable<any>();
  speciality$ = new Observable<any>();

  sourceComponentList: Array<any> = [];
  sourceComponentListCopy: Array<any> = [];
  destinationComponentList: Array<any> = [];
  dualListboxFormat: any = DualListComponent.DEFAULT_FORMAT;
  alertMsg: IAlert;
  roleList: Array<any> = [];
  serviceList: Array<any> = [];
  specialityList: Array<any> = [];
  chartTypeList: Array<any> = [];
  states: any;
  constructor(
    private fb: FormBuilder,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private router: Router,
    private patientChartService: PatientChartService,
    private mappingService: MappingService,
    private modifyDataBySectionKeyPipe: ModifyDataBySectionKeyPipe,
    private emrService: EMRService
  ) { }

  ngOnInit() {
    this.commonService.routeChanged(this.route);
    this.chartTypeList = this.patientChartService.chartTypeList;
    this.patientChartId = +this.route.snapshot.params.id;
    this.createInitForm();

    this.roleList$ = this.emrService.getUserRoleTypeList().pipe(map(res => {
      this.roleList = res;
      return res;
    }));

    this.serviceType$ = this.mappingService.getServiceTypeList().pipe(map(res => {
      this.serviceList = res;
      return res;
    }));

    const specialityParams = {
      search_string: '',
      page_number: 1,
      limit: 100
    };
    this.speciality$ = this.mappingService.getSpecialityList(specialityParams).pipe(map(res => {
      this.specialityList = res;
      return res;
    }));

    this.loadDoctorList();
    this.patientChartForm.get('selectedSectionType').valueChanges.subscribe(sectionType => {
      this.updateComponentList(sectionType);
    });

    if (this.patientChartId === -1) { // -- NEW
      this.mode = 'NEW';
      this.getMasterChartComponentList();
    } else {// - EDIT
      this.mode = 'EDIT';
      this.getPatientChartDetails().subscribe(res => {
        this.getMasterChartComponentList();
      });
    }
  }

  search = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(debounceTime(500), distinctUntilChanged(), tap(() => {
    }));
    return merge(debouncedText$).pipe(
      distinctUntilChanged(),
      switchMap(term => this.patientChartService.GetChartDocumentList(term).pipe(
        map((res: any) => {
          if (res.status_message === 'Success') {
            return res.data;
          } else {
            return [];
          }
        }),
        catchError(() => of([])), // empty list on error
      ))
    );
  }
    // text$.pipe(
    //   debounceTime(200),
    //   distinctUntilChanged(),
    //   map(term => term.length < 2 ? []
    //     : this.states.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
    // )

  updateComponentList(sectionType): void {
    this.sourceComponentList = this.modifyDataBySectionKeyPipe.transform(this.sourceComponentListCopy, sectionType);
    this.destinationComponentList.forEach((ds: any) => {
      const indx = this.sourceComponentList.findIndex(s => s.section_ref_id === ds.section_ref_id);
      if (indx !== -1) {
        this.sourceComponentList.splice(indx, 1);
      }
    });
  }

  createInitForm(): void {
    this.patientChartForm = this.fb.group({
      chartType: ['CONSULTATION_CHART'],
      chartName: ['', Validators.required],
      serviceType: [1, Validators.required],
      speciality: [null],
      role: [null],
      doctor: [null],
      selectedSectionType: ['']
    });
  }

  updateForm(obj): void {
    this.patientChartForm.patchValue({
      chartName: obj.chart_name,
      serviceType: obj.service_type_id,
      speciality: obj.speciality_id,
      role: obj.role_type_id,
      doctor: obj.user_id,
      isFollowUp: obj.is_followup_chart,
    });
  }

  getMasterChartComponentList(): void {
    const serviceTypeId = this.patientChartForm.value.serviceType ? this.patientChartForm.value.serviceType : 0;
    const specialityId = this.patientChartForm.value.speciality ? this.patientChartForm.value.speciality : 0;
    this.patientChartService.getPatientChartComponentList(serviceTypeId, specialityId).subscribe(res => {
      this.sourceComponentList = [...this.sourceComponentListCopy] = res.data;

      this.updateComponentList(this.patientChartForm.value.selectedSectionType);
      // this.destinationComponentList.forEach((ds: any) => {
      //   const indx = this.sourceComponentList.findIndex(s => s.section_ref_id === ds.section_ref_id);
      //   if (indx !== -1) {
      //     this.sourceComponentList.splice(indx, 1);
      //   }
      // });
    });
  }

  getPatientChartDetails(): Observable<any> {
    return this.patientChartService.getPatientChartDetailsById(this.patientChartId).pipe(map((res: any) => {
      if (res.status_message === 'Success') {
        this.updateForm(res.data);
        this.destinationComponentList = res.data.chart_details;
        this.loadDoctorList(res.data.user_name);
        this.alertMsg = {
          message: 'Data loaded successfully.',
          messageType: 'success',
          duration: Constants.ALERT_DURATION
        };
      }
      return res;
    }));
  }

  saveForm(): void {
    this.submitted = true;
    if (this.patientChartForm.invalid) {
      return;
    }
    let count = 1;
    this.destinationComponentList.forEach(res => {
      res.sequence = count;
      count++;
    });

    const reqParams = {
      chart_id: this.mode === 'NEW' ? 0 : this.patientChartId,
      service_type_id: this.patientChartForm.value.serviceType,
      speciality_id: this.patientChartForm.value.speciality,
      role_type_id: this.patientChartForm.value.role,
      user_id: this.patientChartForm.value.doctor,
      chart_name: this.patientChartForm.value.chartName,
      chart_type: this.patientChartForm.value.chartType,
      is_active: true,
      chart_details: this.destinationComponentList
    };
    this.patientChartService.savePatientChart(reqParams).subscribe((res: any) => {
      if (res.status_message === 'Success') {
        this.alertMsg = {
          message: 'Data saved successfully.',
          messageType: 'success',
          duration: Constants.ALERT_DURATION
        };
        this.clearForm();
        this.router.navigate(['/emrSettingsApp/settings/charts/patient-chart-list']);
      }
    });
  }

  clearForm(): void {
    this.patientChartForm.reset({
      isFollowUp: false
    });
    this.destinationComponentList = [];
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
      speciality_id: this.patientChartForm.value.speciality,
      role_type_id: this.patientChartForm.value.role,
      limit: 100
    };

    return this.emrService.getUsersList(reqParam).pipe(map(res => res));
  }

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex);
    }
    this.updateComponentList(this.patientChartForm.value.selectedSectionType);
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
    this.loadDoctorList();
    this.patientChartForm.patchValue({
      doctor: null
    });
  }

  copyComponent(item) {
    const copyItemObj = {...item};
    const indx = this.destinationComponentList.findIndex(s => s.section_ref_id === item.section_ref_id && s.section_name === item.section_name);
    if (indx !== -1) {
      let newSectionName = item.section_name + '_1';
      let isNameExist: any;
      do {
        isNameExist = this.destinationComponentList.find(s => s.section_name === newSectionName);
        if (isNameExist) {
          newSectionName = isNameExist.section_name + '_1';
        }
      } while (isNameExist);
      copyItemObj.section_name = newSectionName;
      this.destinationComponentList.splice((indx + 1), 0, copyItemObj);
    }
  }

  deleteComponent(item) {
    const copyItemObj = {...item};
    const index = this.destinationComponentList.findIndex(s => s.section_ref_id === item.section_ref_id && s.section_name === item.section_name);
    if (index !== -1) {
      this.destinationComponentList.splice(index, 1);
    }
  }

  updateSectionName(item) {
    item.isShowInput = !item.isShowInput;
    this.isSaveDisabled = false;
    const isNameAlreadyExist = this.destinationComponentList.filter(s => s.section_name === item.section_name);
    if (isNameAlreadyExist.length > 1) {
      this.alertMsg = {
        message: 'Section name should not be same!',
        messageType: 'danger',
        duration: Constants.ALERT_DURATION
      };
      item.isShowInput = true;
      this.isSaveDisabled = true;
    }
  }

  getComponentName(nameComp){
    return nameComp.substring(0, nameComp.indexOf('Component'));
  }

}

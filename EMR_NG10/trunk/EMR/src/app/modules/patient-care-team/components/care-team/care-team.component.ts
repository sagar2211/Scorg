import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { map } from 'rxjs/operators';
import * as _ from 'lodash';
import { Constants } from 'src/app/config/constants';
import { takeUntil, distinctUntilChanged, tap, switchMap, catchError } from 'rxjs/operators';
import { Subject, Observable, concat, of } from 'rxjs';
import { EncounterPatient } from 'src/app/public/models/encounter-patient.model';
import { IAlert } from 'src/app/public/models/AlertMessage';
import { CommonService } from 'src/app/public/services/common.service';
import { AuthService } from 'src/app/public/services/auth.service';
import { CareTeamService } from 'src/app/patient/services/care-team-service';
import { CareTeamModel } from 'src/app/patient/models/care-team/care-team-model';

@Component({
  selector: 'app-care-team',
  templateUrl: './care-team.component.html',
  styleUrls: ['./care-team.component.scss']
})
export class CareTeamComponent implements OnInit, OnDestroy {
  patientObj: EncounterPatient;
  userInfo: any;

  submitted = false;
  isPrimary: boolean;
  isDoctorUser: boolean;

  careTeamForm: FormGroup;
  designationList: Array<any> = [];
  doctorLoading = false;
  careTeamList = [];
  departmentList = [];
  specialityList = [];
  alertMsg: IAlert;

  destroy$ = new Subject<any>();
  desgList$ = new Observable<any>();
  doctorList$ = new Observable<any>();
  docListInput$ = new Subject<any>();

  constructor(
    private fb: FormBuilder,
    private commonService: CommonService,
    private authService: AuthService,
    private careTeamService: CareTeamService
  ) { }

  ngOnInit(): void {
    this.isPrimary = false;
    this.isDoctorUser = false;
    this.userInfo = this.authService.getUserInfoFromLocalStorage();
    this.getpatientData();
    this.createInitForm();
    this.getUserDesignationList();
    this.loadUserList();
    this.getCareTeamData();
    this.subcriptionOfEvents();
  }

  createInitForm(): void {
    this.careTeamForm = this.fb.group({
      designation: [null, Validators.required],
      user: [null, Validators.required],
      department: [null],
      speciality: [null],
      isPrimaryDoctor: [false, Validators.required],
      isSaved: false
    });
    this.careTeamForm.get('speciality').disable();
    this.careTeamForm.get('department').disable();
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  getUserDesignationList() {
    this.desgList$ = this.commonService.getUserDesignationList(3).pipe(map(res => {
      this.designationList = _.map(res, (o) => {
        return { id: o.designationId, name: o.designation };
      });
      return this.designationList;
    }));
  }

  private loadUserList(searchTxt?) {
    this.doctorList$ = concat(
      this.getUserList(searchTxt), // default items
      this.docListInput$.pipe(
        distinctUntilChanged(),
        tap(() => this.doctorLoading = true),
        switchMap(term => this.getUserList(term).pipe(
          catchError(() => of([])), // empty list on error
          tap(() => this.doctorLoading = false)
        ))
      )
    );
  }

  getUserList(searchText = ''): Observable<any> {
    const reqParam = {
      search_keyword: searchText,
      dept_id: 0,
      speciality_id: 0,
      role_type_id: 3,
      designation_id: this.careTeamForm.value.designation ? this.careTeamForm.value.designation.id : 0,
      limit: 50
    };
    return this.commonService.getUsersList(reqParam).pipe(map(res => {
      return _.map(res, (o) => {
        return { id: o.user_id, name: (o.title + ' ' + o.user_name) };
      });
    }));
  }

  getUserDetailById(userId: number): Observable<any> {
    return this.commonService.getUserDetailById(userId).pipe(map(res => res));
  }

  onPrimaryDoctorChange(event): void {
    this.isPrimary = event;
  }

  onDesignationChange(event): void {
    this.loadUserList();
    this.careTeamForm.patchValue({
      speciality: null,
      department: null,
      user: null
    });
  }

  onUserChange(event): void {
    this.careTeamForm.patchValue({
      speciality: null,
      department: null
    });
    this.isDoctorUser = false;
    if (this.careTeamForm.value.user == null) {
      return;
    }

    this.getUserDetailById(this.careTeamForm.value.user.id).subscribe((res: any) => {
      this.isDoctorUser = res.speciality_id > 0;
      this.departmentList = [{ id: res.department_id, name: res.department_name }];
      this.specialityList = [{ id: res.speciality_id, name: res.speciality_name }];
      this.careTeamForm.patchValue({
        speciality: this.specialityList[0],
        department: this.departmentList[0]
      });
    });
  }

  saveForm(): void {
    this.submitted = true;
    if (this.careTeamForm.invalid) {
      return;
    }
    // check for primary doctor is already added or not
    if (this.careTeamForm.value.isPrimaryDoctor) {
      const findPrimaryDoctor = _.findIndex(this.careTeamList, d => {
        return d.isPrimaryDoctor === true;
      });
      if (findPrimaryDoctor !== -1) {
        this.notifyAlertMessage({
          msg: 'Primary Doctor Already Added',
          class: 'danger',
        });
        return;
      }
    }

    const findUser = _.findIndex(this.careTeamList, d => {
      return d.userId === this.careTeamForm.value.user.id;
    });
    if (findUser === -1) {
      const careTeamFormData = this.careTeamForm.getRawValue();
      const careTeam = new CareTeamModel();
      careTeam.generateObject({
        isPrimaryDoctor: careTeamFormData.isPrimaryDoctor,
        designationId: careTeamFormData.designation.id,
        designation: careTeamFormData.designation.name,
        userId: careTeamFormData.user.id,
        userName: careTeamFormData.user.name,
        specialityId: careTeamFormData.speciality ? careTeamFormData.speciality.id : null,
        specialityName: careTeamFormData.speciality ? careTeamFormData.speciality.name : null,
        deptId: careTeamFormData.department.id,
        deptName: careTeamFormData.department.name,
        mappingDate: new Date(),
        isSaved: false
      });
      this.careTeamList.push({ ...careTeam });
      this.clearForm();
    } else {
      this.notifyAlertMessage({
        msg: 'Already Added',
        class: 'danger',
      });
    }
  }

  clearForm(): void {
    this.isPrimary = false;
    this.isDoctorUser = false;
    this.careTeamForm.reset();
    this.submitted = false;
    this.careTeamForm.patchValue({
      isPrimaryDoctor: false
    });
  }

  deleteCareTeam(index) {
    this.careTeamList.splice(index, 1);
  }

  getCareTeamData(): void {
    const serviceTypeId = this.patientObj.serviceType.id;
    const patientId = this.patientObj.patientData.id;
    const visitNo = this.patientObj.visitNo;
    this.careTeamService.getCareTeamDetails(serviceTypeId, patientId, visitNo).subscribe((res: any) => {
      this.careTeamList = res;
    });
  }

  saveCareTeamData(): void {
    const serviceTypeId = this.patientObj.serviceType.id;
    const patientId = this.patientObj.patientData.id;
    const visitNo = this.patientObj.visitNo;
    this.careTeamService.SaveCareTeamDetails(serviceTypeId, patientId, visitNo, this.careTeamList).subscribe((res: any) => {
      this.alertMsg = {
        message: res.message,
        messageType: (res.status_message === 'Success' ? 'success' : 'danger'),
        duration: Constants.ALERT_DURATION
      };

      // update is saved flag..
      if (res.status_message === 'Success') {
        _.map(this.careTeamList, (o) => {
          o.isSaved = true;
        });
      }
    });
  }

  notifyAlertMessage(data): void {
    this.alertMsg = {
      message: data.msg,
      messageType: data.class,
      duration: Constants.ALERT_DURATION
    };
  }

  getpatientData(patient?) {
    this.patientObj = null;
    if (patient) {
      this.patientObj = patient;
    } else {
      this.patientObj = this.commonService.getLastActivePatient();
    }
  }

  subcriptionOfEvents() {
    this.commonService.$subAddRemoveActivePatientFromList.pipe(takeUntil(this.destroy$)).subscribe((obj: any) => {
      this.getpatientData(obj.data);
    });
  }

}

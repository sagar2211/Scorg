import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import * as _ from 'lodash';
import { IAlert } from 'src/app/public/models/AlertMessage';
import { AuthService } from 'src/app/public/services/auth.service';
import { PatientService } from 'src/app/public/services/patient.service';
import { CommonService } from 'src/app/public/services/common.service';
import { Router } from '@angular/router';
import { EncounterPatient } from 'src/app/public/models/encounter-patient.model';
import { Constants } from 'src/app/config/constants';
import { Subject, Observable, concat, of } from 'rxjs';
import { debounceTime, takeUntil, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { MappingService } from 'src/app/public/services/mapping.service';
import { ConsentPartialViewComponent } from '../consent-partial-view/consent-partial-view.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-patient-admit-discharge-patient-list',
  templateUrl: './patient-admit-discharge-patient-list.component.html',
  styleUrls: ['./patient-admit-discharge-patient-list.component.scss']
})
export class PatientAdmitDischargePatientListComponent implements OnInit, OnDestroy {
  @Input() loadType = 'admit'; // admit/discharge
  patients: any[] = [];
  clonedPatients: any[] = [];
  wardList: any[] = [];
  // floorNoListDischarge: any[] = [];
  patWardNo = null;
  // dischargePatFloorNo = 'All';
  dischargeDate = new Date();
  userInfo: any = null;
  userId: number;
  alertMsg: IAlert;
  searchString: any = null;
  $destroy: Subject<boolean> = new Subject();
  subject: Subject<string> = new Subject();
  ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  wardList$ = new Observable<any>();
  wardListInput$ = new Subject<any>();
  constructor(
    private authService: AuthService,
    private patientService: PatientService,
    private mappingService: MappingService,
    private commonService: CommonService,
    private router: Router,
    private modalService: NgbModal,
  ) { }

  ngOnInit(): void {
    this.userId = +this.authService.getLoggedInUserId();
    this.userInfo = this.authService.getUserInfoFromLocalStorage();
    this.getPatientData();
    this.loadWardList();
  }

  ngOnDestroy(): void {
    this.$destroy.next(true);
    this.$destroy.unsubscribe();
  }

  subjectFun() {
    this.subject
      .pipe(debounceTime(500), takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.getPatientData();
      });
  }

  filterDischargePatientData() {
    this.patients = _.filter(this.clonedPatients, (o) => {
      const wardNo = (this.patWardNo === 'All') ? o.ward : this.patWardNo;
      // const floorNo = (this.dischargePatFloorNo === 'All') ? o.floor : this.dischargePatFloorNo;
      return (o.ward === wardNo); // && o.floor === floorNo
    });
  }

  updateDischargeDate(val) {
    this.dischargeDate = new Date(val);
    this.getPatientData();
  }

  getPatientData() {
    const param = {
      search_keyword: this.searchString ? this.searchString : '',
      service_type_id: null,
      doctor_id: this.userInfo.user_id,
      floor: null,
      ward: this.patWardNo ? this.patWardNo : null,
      page_number: 1,
      limit: 50,
    };
    if (this.loadType === 'discharge') {
      param['discharge_date'] = this.dischargeDate;
    }
    this.patientService.getAdmittedPatients(param).subscribe((res) => {
      this.patients = res;
      this.clonedPatients = _.cloneDeep(this.patients);
      if (this.patients.length) {
        // filter and extract
        const wardNosDis = [];
        const floorNosDis = [];
        _.map(this.patients, (o) => {
          wardNosDis.push(o.ward);
          floorNosDis.push(o.floor);
        });
        this.wardList = _.uniq(wardNosDis);
        // this.floorNoListDischarge = _.uniq(floorNosDis);
      }
    });
  }

  private loadWardList(searchTxt?) {
    this.wardList$ = concat(
      this.mappingService.getWardListData(searchTxt ? searchTxt : ''), // default items
      this.wardListInput$.pipe(
        distinctUntilChanged(), debounceTime(500), switchMap(term => this.mappingService.getWardListData(term ? term : (searchTxt ? searchTxt : '')).pipe(
          catchError(() => of([]))
        ))));
  }

  navigateToPatient(patient: EncounterPatient) {
    patient.type = patient.serviceType.name.toLowerCase();
    patient.loadFrom = this.loadType !== 'admit' ? 'DISCHARGE_NOTES' : 'IP_NOTES';
    this.commonService.showHideMainMenuFromNavBar(false);
    this.commonService.setActivePatientList(patient, 'add');
    if (this.commonService.getActivePatientList(patient).length <= 5) {
      const obj = {
        type: 'add',
        data: patient,
        sourc: 'doctor_dashboard'
      };
      this.commonService.updateActivePatientList(obj);
      if (this.loadType === 'admit') {
        this.router.navigate(['/emr/patient/dashboard/', patient.patientData.id]);
      } else {
        this.router.navigate(['/dischargeApp/discharge/patient/dashboard/', patient.patientData.id]);
      }
    } else {
      this.displayErrorMsg('Max 5 Patient Allowed', 'danger');
    }
  }

  displayErrorMsg(message: string, messageType: string): void {
    this.alertMsg = { message, messageType, duration: Constants.ALERT_DURATION };
  }

  clearSearch() {
    this.searchString = null;
  }

  onWardChange(event) {

  }

  openPatientConsentPartialView(patient) {
    const patientData = {
      id: patient.patientData.id
    }
    const modalInstance = this.modalService.open(ConsentPartialViewComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false,
        windowClass: 'orders-modal-popup',
      });
    modalInstance.result.then((result) => {
      if (result === 'Ok') {

      }
    });
    modalInstance.componentInstance.patientData = patientData;
  }

}

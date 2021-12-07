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

  diagnosisAry =
    [{
      "icdCode": "R0789-R079",
      "description": "Other chest pain, chest pain unspecified"
    },
    {
      "icdCode": "J069",
      "description": "Acute upper respiratory infection, unspecified"
    },
    {
      "icdCode": "F10-F19",
      "description": "Mental and behavioral disorders due to psychoactive substance use"
    },
    {
      "icdCode": "K529",
      "description": "Noninfective gastroenteritis and colitis, unspecified"
    },
    {
      "icdCode": "S0990XA",
      "description": "Unspecified injury of head, initial encounter"
    },
    {
      "icdCode": "F40-F48",
      "description": "Anxiety, dissociative, stress-related, somatoform and other nonpsychotic mental disorders"
    },
    {
      "icdCode": "M00-M99",
      "description": "Diseases of the musculoskeletal system and connective tissue"
    },
    {
      "icdCode": "R00-R99",
      "description": "Symptoms, signs and abnormal clinical and laboratory findings, not elsewhere classified"
    },
    {
      "icdCode": "S161XXA",
      "description": "Strain of muscle, fascia and tendon at neck level, initial encounter"
    },
    {
      "icdCode": "K0889",
      "description": "Other specified disorders of teeth and supporting structures"
    },
    {
      "icdCode": "S39012A",
      "description": "Strain of muscle, fascia and tendon of lower back, initial encounter"
    }]
  lvlCount = {
    lvl1: null,
    lvl2: null,
    lvl3: null,
    lvl4: null,
    lvl5: null,
  }
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
          o.erStatus = Math.floor(Math.random() * 5) + 1;
          o.diagnosis = this.diagnosisAry[Math.floor(Math.random() * 9) + 1];
          o.timeAgo = this.getTimeAgoValue(o.erStatus);
        });
        this.wardList = _.uniq(wardNosDis);
        this.getllLvlCount();
        this.patients = _.orderBy(this.patients, 'erStatus');
        // this.floorNoListDischarge = _.uniq(floorNosDis);
      }
    });
  }

  getTimeAgoValue(typ) {
    let val = 0;
    if (typ === 1) {
      val = Math.floor(Math.random() * 10) + 1;
    } else if (typ === 2) {
      val = Math.floor(Math.random() * 20) + 1;
    } else if (typ === 3) {
      val = Math.floor(Math.random() * 60) + 1;
    } else if (typ === 4) {
      val = Math.floor(Math.random() * 120) + 1;
    } else if (typ === 5) {
      val = Math.floor(Math.random() * 240) + 1;
    }
    return val;
  }

  getllLvlCount() {
    const lvl1 = this.patients.filter(d => {
      return d.erStatus === 1;
    });
    this.lvlCount.lvl1 = lvl1.length;
    const lvl2 = this.patients.filter(d => {
      return d.erStatus === 2;
    });
    this.lvlCount.lvl2 = lvl2.length;
    const lvl3 = this.patients.filter(d => {
      return d.erStatus === 3;
    });
    this.lvlCount.lvl3 = lvl3.length;
    const lvl4 = this.patients.filter(d => {
      return d.erStatus === 4;
    });
    this.lvlCount.lvl4 = lvl4.length;
    const lvl5 = this.patients.filter(d => {
      return d.erStatus === 5;
    });
    this.lvlCount.lvl5 = lvl5.length;
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
      this.router.navigate(['/emr/patient/dashboard/', patient.patientData.id]);
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

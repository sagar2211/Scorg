import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { PatientService } from 'src/app/public/services/patient.service';
import * as _ from 'lodash';
import { AuthService } from 'src/app/public/services/auth.service';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConsentPartialViewComponent } from '../consent-partial-view/consent-partial-view.component';
import { EncounterPatient } from 'src/app/public/models/encounter-patient.model';
import { CommonService } from 'src/app/public/services/common.service';
import { Router } from '@angular/router';
import { Constants } from 'src/app/config/constants';
import { IAlert } from 'src/app/public/models/AlertMessage';
import { concat, Observable, of, Subject } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { MappingService } from 'src/app/public/services/mapping.service';
import * as moment from 'moment';
@Component({
  selector: 'app-patient-admit-discharge-list',
  templateUrl: './patient-admit-discharge-list.component.html',
  styleUrls: ['./patient-admit-discharge-list.component.scss']
})
export class PatientAdmitDischargeListComponent implements OnInit {
  @ViewChild(DatatableComponent, { static: false }) public table: DatatableComponent;
  @Input() loadType = 'admit'; // admit/discharge
  patients: any[] = [];
  clonedPatients: any[] = [];
  wardList: any[] = [];
  searchString: any = null;
  userInfo: any = null;
  patWardNo: any;
  dischargeDate = new Date();
  alertMsg: IAlert;

  wardList$ = new Observable<any>();
  wardListInput$ = new Subject<any>();
  sortUserList: { sort_order: string, sort_column: string };
  page: {
    size: number, // The number of elements in the page
    totalElements: number, // The total number of elements
    totalPages: number, // The total number of pages
    pageNumber: number, // The current page number
  };
  admittedPatients: any;
  constructor(
    private authService: AuthService,
    private patientService: PatientService,
    private modalService: NgbModal,
    private commonService: CommonService,
    private mappingService: MappingService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.userInfo = this.authService.getUserInfoFromLocalStorage();
    this.defaultObject();
    this.loadWardList();
    this.getAdmittedPatients();
  }

  defaultObject() {
    this.page = { size: 25, totalElements: 0, totalPages: 10, pageNumber: 1 };
    this.sortUserList = { sort_order: 'desc', sort_column: 'patientId' };
    this.searchString = '';
    // this.defaultSearchFilter();
  }

  clearSearch() {
    this.searchString = null;
  }

  private loadWardList(searchTxt?) {
    this.wardList$ = concat(
      this.mappingService.getWardListData(searchTxt ? searchTxt : ''), // default items
      this.wardListInput$.pipe(
        distinctUntilChanged(), debounceTime(500), switchMap(term => this.mappingService.getWardListData(term ? term : (searchTxt ? searchTxt : '')).pipe(
          catchError(() => of([]))
        ))));
  }

  updateDischargeDate(val) {
    this.dischargeDate = new Date(val);
    this.getAdmittedPatients();
  }

  getAdmittedPatients() {
    const param = {
      search_keyword: this.searchString ? this.searchString : '',
      service_type_id: null,
      doctor_id: this.userInfo.user_id,
      floor: null,
      ward_id: this.patWardNo ? this.patWardNo : null,
      discharge_date: this.dischargeDate,
      page_number: 1,
      limit: 50,
    };
    this.patientService.getAdmittedPatients(param).subscribe((res) => {
      this.admittedPatients = res;
      this.clonedPatients = _.cloneDeep(this.admittedPatients);
      if (this.admittedPatients.length) {
        // filter and extract
        const wardNosDis = [];
        const floorNosDis = [];
        _.map(this.admittedPatients, (o) => {
          wardNosDis.push(o.ward);
          floorNosDis.push(o.floor);
        });
        this.wardList = _.uniq(wardNosDis);
      }
    });
  }


  onPageSizeChanged(newPageSize) {
    this.sortUserList = { sort_order: 'desc', sort_column: 'groupId' };
    this.page.size = Number(newPageSize);
    this.page.pageNumber = 1;
    // this.searchByFilter();
  }

  onFooterPage(event): void {
    this.page.pageNumber = event.page;
    // this.searchByFilter();
  }

  onSortChanged(event) {
    if (event.sorts.length > 0) {
      const obj = event.sorts[0];
      this.sortUserList.sort_order = obj.dir;
      this.sortUserList.sort_column = this.getSortColumnName(obj.prop);
      // this.searchByFilter();
    }
  }

  getSortColumnName(clmName) {
    if (clmName === 'id') {
      return 'groupId';
    } else if (clmName === 'name') {
      return 'aliasName';
    } else if (clmName === 'desc') {
      return 'groupDesc';
    } else if (clmName === 'isActive') {
      return 'isActive';
    } else {
      return '';
    }
  }

  onSetPage(pageInfo) {
    this.table.offset = pageInfo.offset - 1;
    // if (this.externalPaging) {
    //   return;
    // }
  }

  onconsentForm(patient) {
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

  navigateToPatient(patient: EncounterPatient) {
    patient.type = patient.serviceType.name.toLowerCase();
    patient.loadFrom = 'DISCHARGE_NOTES';
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

}

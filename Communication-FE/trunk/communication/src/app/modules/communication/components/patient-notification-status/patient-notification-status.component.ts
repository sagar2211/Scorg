
import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { takeUntil, debounceTime, map } from 'rxjs/operators';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { IAlert } from '@qms/qlist-lib/lib/models/common.model';
import { Subject, Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder } from '@angular/forms';
import * as _ from 'lodash';
import * as moment from 'moment';
import { Constants } from 'src/app/config/constants';
import { CommonService } from 'src/app/public/services/common.service';
import { PatientService } from 'src/app/public/services/patient.service';



@Component({
  selector: 'app-patient-notification-status',
  templateUrl: './patient-notification-status.component.html',
  styleUrls: ['./patient-notification-status.component.scss']
})
export class PatientNotificationStatusComponent implements OnInit {

  @ViewChild(DatatableComponent, { static: false }) public table: DatatableComponent;
  alertMsg: IAlert;
  subject: Subject<string> = new Subject();
  ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  pageSize;
  patientList = [];
  page: {
    size: number, // The number of elements in the page
    totalElements: number, // The total number of elements
    totalPages: number, // The total number of pages
    pageNumber: number, // The current page number
  };
  showPatientListFilter = false;
  searchString: string;
  externalPaging: boolean;
  sortUserList: { sort_order: string, sort_column: string };
  isFilterApply: boolean;
  showActivePatient: boolean;
  patientListFilterForm: FormGroup;
  genderList: any;
  bloodGroupList: [] = [];
  notificationstatusList: any;
  constructor(
    private route: ActivatedRoute,
    public modal: NgbActiveModal,
    private commonService: CommonService,
    private patientService: PatientService,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.defaultObject();
    this.pageSize = '15';
    this.commonService.routeChanged(this.route);
    this.subjectFun();
    this.defaultSearchFilter();
    this.getPatientNotificationStatusList();
    this.getGenderList();
    this.getBloodList().subscribe();
  }
  ngOnChanges() {
    this.getPatientNotificationStatusList();
  }
  subjectFun() {
    // -- Subscribe to the subject, which is triggered from search input and when section clicked
    // -- When the debounce time has passed, we call getPatientNotificationStatusList()
    this.subject
      .pipe(debounceTime(500), takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.page.pageNumber = 1;
        this.getPatientNotificationStatusList();
      }
      );
  }
  defaultObject() {
    this.isFilterApply = false;
    this.showActivePatient = true;
    this.page = { size: 15, totalElements: 0, totalPages: 10, pageNumber: 1 };
    this.sortUserList = { sort_order: 'desc', sort_column: 'notification_added_date' };
    this.searchString = '';
    this.externalPaging = true;
  }
  clearSearchFilter() {
    this.searchString = null;
    this.patientListFilterForm.reset();
    this.defaultSearchFilter();
    this.getPatientNotificationStatusList();
  }
  defaultSearchFilter() {
    this.patientListFilterForm = this.fb.group({
      sent_date: '',
      is_send: [],
      pat_uhid: '',
      pat_name: '',
      gender: [],
      blood_group_ids: [],
      age_value: '',
      age_operator: 'greater',
      mobile_no: ''
    });
  }
  getGenderList() {
    this.notificationstatusList = [];
    this.notificationstatusList.push({ id: true, name: 'Send' });
    this.notificationstatusList.push({ id: false, name: 'Un Send' });
    this.genderList = [];
    this.genderList.push({ id: 'male', name: 'Male' });
    this.genderList.push({ id: 'female', name: 'Female' });
    this.genderList.push({ id: 'transgender', name: 'Trans Gender' });
  }
  getBloodList(): Observable<any> {
    return this.patientService.getBloodList().pipe(map(res => {
      this.bloodGroupList = res.BloodGroup_Data;
      return this.bloodGroupList;
    }));
  }
  updateMultiSelectModelValue(e, key) {
    if (_.isEmpty(e)) {
      this.patientListFilterForm.patchValue({ key: [] });
    } else {
      this.patientListFilterForm.patchValue({ key: e });
    }
  }
  searchByFilter() {
    this.page.pageNumber = 1;
    this.getPatientNotificationStatusList();
    this.showSearchFilter();
  }
  showSearchFilter() {
    this.showPatientListFilter = !this.showPatientListFilter;
  }
  setFromObjectData(paramArray) {
    const returnArray = []
    _.map(paramArray, (o) => {
      returnArray.push(o.id);
    });
    return returnArray;
  }

  getPatientNotificationStatusList() {
    const formValue = this.patientListFilterForm.value;
    const getPatientParams = {
      limit: this.page.size,
      current_page: this.page.pageNumber,
      sort_order: this.sortUserList.sort_order,
      sort_column: this.sortUserList.sort_column,
      campaign_name: this.searchString,
      patient_advance_search: {
        pat_uhid: formValue.pat_uhid,
        pat_name: formValue.pat_name,
        mobile_no: formValue.mobile_no,
        gender: formValue.gender ? this.setFromObjectData(formValue.gender) : [],
        blood_group_ids: formValue.blood_group_ids ? this.setFromObjectData(formValue.blood_group_ids) : [],
        age_value: formValue.age_value,
        age_operator: formValue.gender && formValue.age_operator ? formValue.age_operator : '',
        sent_date: formValue.sent_date ? (moment(formValue.sent_date).format(Constants.apiDateFormate)) : '',
        is_sent: formValue.is_send ? this.setFromObjectData(formValue.is_send) : []
      }
    };

    this.patientService.getAllPatientNotificationStatus(getPatientParams).subscribe(res => {
      if (res.status_code === 200) {
        if (res.patient_details.length > 0) {
          this.patientList = res.patient_details;
          this.page.totalElements = res.total_records;
        } else {
          this.patientList = [];
          this.page.totalElements = 0;
        }
      }
    });
  }
  onPageSizeChanged(newPageSize) {
    this.sortUserList = { sort_order: 'desc', sort_column: 'notification_added_date' };
    this.page.size = Number(newPageSize);
    this.page.pageNumber = 1;
    this.getPatientNotificationStatusList();
  }
  onFooterPage(event): void {
    this.page.pageNumber = event.page;
    this.getPatientNotificationStatusList();
  }
  onSortChanged(event) {
    if (event.sorts.length > 0) {
      const obj = event.sorts[0];
      this.sortUserList.sort_order = obj.dir;
      this.sortUserList.sort_column = obj.prop;
      this.getPatientNotificationStatusList();
    }
  }
  onSetPage(pageInfo) {
    this.table.offset = pageInfo.offset - 1;
    if (this.externalPaging) {
      return;
    }
  }
}

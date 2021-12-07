import { Component, OnInit, ViewChild, OnChanges, AfterViewInit } from '@angular/core';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { IAlert } from 'src/app/models/AlertMessage';
import { Subject, Observable } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { debounceTime, takeUntil, map } from 'rxjs/operators';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import * as _ from 'lodash';
import { CommonService } from '../../../../services/common.service';
import { UsersService } from 'src/app/services/users.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Constants } from 'src/app/config/constants';
import { PatientService } from '../../../appointment/services/patient.service';
import * as moment from 'moment';
import { ConfirmationPopupComponent } from 'src/app/components/confirmation-popup/confirmation-popup.component';
import { PermissionsConstants } from 'src/app/shared/constants/PermissionsConstants';
import { NgxPermission } from 'ngx-permissions/lib/model/permission.model';
import { NgxPermissionsService } from 'ngx-permissions';
import { TemplatesService } from 'src/app/modules/qms/services/templates.service';
import { AddPatientComponent } from 'src/app/modules/patient-shared/component/add-patient/add-patient.component';

@Component({
  selector: 'app-patient-list',
  templateUrl: './patient-list.component.html',
  styleUrls: ['./patient-list.component.scss']
})
export class PatientListComponent implements OnInit, OnChanges, AfterViewInit {
  @ViewChild(DatatableComponent, { static: false }) public table: DatatableComponent;
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
  alertMsg: IAlert;
  subject: Subject<string> = new Subject();
  ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  compInstance = this;
  isNgSelectTypeHeadDisabled = false;
  isFilterApply: boolean;
  showActivePatient: boolean;
  datatableBodyElement: any;
  showAddPatientPopup = false;
  $destroy: Subject<boolean> = new Subject();
  patientListFilterForm: FormGroup;
  notify = {
    isPatientSelectAll: false,
    isPatientSelectAllFlag: false,
    selectedPatientIds: [],
    deSelectedPatientIds: [],
    templateName: null,
    selectedPatientCounts: 0
  };
  templateMasterList= [];
  bloodGroupList: [] = [];
  multiSelectObj: { id: string, name: string };
  genderList: any;
  modalService: NgbModal;
  patientEditPermission = false;

  constructor(
    private router: Router,
    private usersService: UsersService,
    private commonService: CommonService,
    private addPatientModalService: NgbModal,
    private route: ActivatedRoute,
    private templatesService: TemplatesService,
    private fb: FormBuilder,
    private patientService: PatientService,
    private confirmationModalService: NgbModal,
    private ngxPermissionsService: NgxPermissionsService
  ) {
    this.modalService = confirmationModalService;
  }

  ngOnInit() {
    this.patientEditPermission = _.isUndefined(this.ngxPermissionsService.getPermission(PermissionsConstants.Update_PatientMaster)) ? true : false;
    this.defaultObject();
    this.pageSize = '15';
    this.subjectFun();
    this.getAllPatientData();
    this.commonService.routeChanged(this.route);
    this.showActivePopup(); // Global Add button
    this.getBulkTemplateCategory().subscribe(res => {
      this.getTemplateMasterList(res).subscribe();
    });
    this.getBloodList().subscribe();
    this.getGenderList();
  }

  ngOnChanges() {
    this.getAllPatientData();
  }

  ngAfterViewInit(): void {
    this.datatableBodyElement = this.table.element.children[0].children[1];
    this.datatableBodyElement.setAttribute('style', 'height:calc(100vh - 200px)');
  }

  defaultObject() {
    this.isFilterApply = false;
    this.showActivePatient = true;
    this.page = { size: 15, totalElements: 0, totalPages: 10, pageNumber: 1 };
    this.sortUserList = { sort_order: 'desc', sort_column: 'pat_uhid' };
    this.searchString = '';
    this.externalPaging = true;
    this.defaultSearchFilter();
  }
  showActivePopup() {
    this.commonService.$addPopupEvent.pipe(takeUntil(this.$destroy)).subscribe(popup => {
      if (popup && popup.redirectFromPage === '/app/qms/patient/patientList') {
        this.showAddPatientPopup = popup.isShowAddPopup;
        this.addEditPatientModal();
      } else {
        this.showAddPatientPopup = false;
      }
      if (popup) {
        this.showPatientListFilter = popup.isShowFilterPopup;
      } else {
        this.showPatientListFilter = false;
      }
    });
  }

  defaultSearchFilter() {
    this.patientListFilterForm = this.fb.group({
      reg_from_date: '',
      reg_to_date: '',
      gender: [],
      blood_group_ids: [],
      age_value: '',
      age_operator: 'greater',
      marital_status: ''
    });
  }
  addEditPatientModal(editObj?): void {
    const modalInstance = this.addPatientModalService.open(AddPatientComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false,
        windowClass: 'custom-modal',
        size: 'xl',
        container: '#homeComponent'
      });
    modalInstance.componentInstance.isModal = true;
    modalInstance.componentInstance.patient_Uhid = editObj.pat_id;
    modalInstance.componentInstance.frmPatientList = true;
    modalInstance.componentInstance.editPatientDetails = editObj;

    modalInstance.componentInstance.addPatModalValues.subscribe((receivedValue) => {
      const isPatientExist = _.findIndex(this.patientList, (p) => p.pat_uhid === receivedValue.pat_uhid);
      if (isPatientExist !== -1)  {
        this.patientList[isPatientExist] = this.fatchPatientEditObject(receivedValue);

      }
    });
  }

  fatchPatientEditObject(editObject) {
    const obj = {
      pat_address : editObject.Pat_address,
      pat_age: editObject.pat_age,
      pat_age_unit: '',
      pat_alternateno: editObject.pat_alternateno,
      pat_bloodgroup: editObject.pat_bloodgroup,
      pat_city: editObject.Pat_city,
      pat_country: editObject.Pat_country,
      pat_dob: editObject.pat_dob,
      pat_emailid: editObject.pat_emailid,
      pat_gender: editObject.pat_gender,
      pat_id: editObject.pat_id,
      pat_isactive: editObject.pat_isactive,
      pat_maritalstatus: editObject.pat_maritalstatus,
      pat_mobileno: editObject.pat_mobileno,
      pat_name: editObject.pat_name,
      pat_nationality: editObject.pat_nationality,
      pat_state: editObject.Pat_state,
      pat_title: editObject.pat_title,
      pat_uhid: editObject.pat_uhid
    };
    return obj;
  }
  subjectFun() {
    // -- Subscribe to the subject, which is triggered from search input and when section clicked
    // -- When the debounce time has passed, we call getActiveScheduleData()
    this.subject
      .pipe(debounceTime(500), takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.page.pageNumber = 1;
        this.getAllPatientData();
      }
      );
  }

  getAllPatientData(isCalledOnPagination?) {
    const param = {
      limit_per_page: this.page.size,
      current_page: this.page.pageNumber,
      sort_order: this.sortUserList.sort_order,
      sort_column: this.sortUserList.sort_column,
      searchString: this.searchString,
      showActivePatient: this.showActivePatient,
      advanced_search: this.getSearchFilterObject()
    };
    console.log(param);

    // Clear selection
    if (isCalledOnPagination === undefined) {
      this.notify.isPatientSelectAll = false;
      this.notify.isPatientSelectAllFlag = false;
      this.notify.selectedPatientIds = [];
      this.notify.deSelectedPatientIds = [];
      this.notify.templateName = null;
      this.notify.selectedPatientCounts = 0;
    }

    this.usersService.getAllPatientList(param).subscribe(res => {
      if (res.listData.length > 0) {
        _.map(res.listData, (o) => {
          o.isChecked = (this.notify.isPatientSelectAllFlag && !_.find(this.notify.deSelectedPatientIds, (patId) => { return patId == o.pat_id; }))
                      || (!this.notify.isPatientSelectAllFlag && _.find(this.notify.selectedPatientIds, (patId) => { return patId == o.pat_id; }));
        });
        this.patientList = res.listData;
        this.page.totalElements = res.totalCount;
      } else {
        this.patientList = [];
        this.page.totalElements = 0;
      }
    });
  }
  getBloodList(): Observable<any> {
    return this.patientService.getBloodList().pipe(map(res => {
      this.bloodGroupList = res.BloodGroup_Data;
      // this.patientRegistrationForm.patchValue({ pat_bloodgrp_id: this.bloodList[0] });
      return this.bloodGroupList;
    }));
  }
  getGenderList() {
    this.genderList = [];
    this.genderList.push({ id: 'male', name: 'Male' });
    this.genderList.push({ id: 'female', name: 'Female' });
    this.genderList.push({ id: 'transgender', name: 'Trans Gender' });
  }

  onPageSizeChanged(newPageSize) {
    this.sortUserList = { sort_order: 'desc', sort_column: 'pat_uhid' };
    this.page.size = Number(newPageSize);
    this.page.pageNumber = 1;
    this.getAllPatientData();
  }
  onFooterPage(event): void {
    this.page.pageNumber = event.page;
    this.getAllPatientData(true);
  }
  onSortChanged(event) {
    if (event.sorts.length > 0) {
      const obj = event.sorts[0];
      this.sortUserList.sort_order = obj.dir;
      this.sortUserList.sort_column = obj.prop;
      this.getAllPatientData();
    }
  }
  onSetPage(pageInfo) {
    this.table.offset = pageInfo.offset - 1;
    if (this.externalPaging) {
      return;
    }
  }

  addNewPatient() {
    // this.datatableBodyElement.setAttribute('style', 'height:calc(100vh - 337px)');
  }
  // editPatientData(data) {
  //   this.commonService.isAddButtonDisable = true;
  //   // this.datatableBodyElement.setAttribute('style', 'height:calc(100vh - 337px)');
  // }

  // Patient Advanced Filter Options
  updateSelectedBloodList(e) {
    if (_.isEmpty(e)) {
      this.patientListFilterForm.patchValue({ blood_group_ids: [] });
    } else {
      this.patientListFilterForm.patchValue({ blood_group_ids: e.selectedVal });
    }
  }
  updateSelectedGenderList(e) {
    if (_.isEmpty(e)) {
      this.patientListFilterForm.patchValue({ gender: [] });
    } else {
      this.patientListFilterForm.patchValue({ gender: e.selectedVal });
    }
  }
  getSearchFilterObject(): object {
    const filterValue = this.patientListFilterForm.value;
    const advanced_search = {
      reg_from_date: filterValue.reg_from_date ? moment(filterValue.reg_from_date).format('MM/DD/YYYY') : '',
      reg_to_date: filterValue.reg_to_date ? moment(filterValue.reg_to_date).format('MM/DD/YYYY') : '',
      gender: filterValue.gender ? _.map(filterValue.gender, (o) => { return o.id; }) : [],
      blood_group_ids: filterValue.blood_group_ids ? _.map(filterValue.blood_group_ids, (o) => { return o.id; }) : [],
      marital_status: filterValue.marital_status,
      age_value: filterValue.age_value ? filterValue.age_value : null,
      age_operator: filterValue.age_operator
    }
    return advanced_search;
  }
  searchByFilter() {
    this.page.pageNumber = 1;
    this.getAllPatientData();
    this.showSearchFilter();
  }
  clearSearchFilter() {
    this.searchString = null;
    this.patientListFilterForm.reset();
    this.defaultSearchFilter();
    this.getAllPatientData();
  }
  showSearchFilter() {
    this.showPatientListFilter = !this.showPatientListFilter;
    this.commonService.setPopupFlag(false, this.showPatientListFilter);
  }
  // showActivePopup() {
  //   this.commonService.$addPopupEvent.subscribe(popup => {
  //     if (popup) {
  //       this.showPatientListFilter = popup.isShowFilterPopup;
  //     } else {
  //       this.showPatientListFilter = false;
  //     }
  //   });
  // }

  // Bulk SMS & Mail Process
  onPatientSelect(checkType: string, patientId, isChecked: boolean) {
    if (checkType === 'select_all') {
      this.notify.selectedPatientIds = [];
      this.notify.deSelectedPatientIds = [];
      this.notify.isPatientSelectAllFlag = this.notify.isPatientSelectAll;
      _.map(this.patientList, (o) => {
        o.isChecked = (this.notify.isPatientSelectAllFlag && !_.find(this.notify.deSelectedPatientIds, (patId) => { return patId == o.pat_id; }))
                      || (!this.notify.isPatientSelectAllFlag && _.find(this.notify.selectedPatientIds, (patId) => { return patId == o.pat_id; }));
      });
      this.notify.selectedPatientCounts = isChecked ? this.page.totalElements : 0;
    } else if (checkType === 'select_patient') {
      if (this.notify.isPatientSelectAllFlag) {
        if (isChecked) {
          _.remove(this.notify.deSelectedPatientIds, (patId) => { return patId == patientId; })
        } else {
          this.notify.deSelectedPatientIds.push(patientId);
        }
        this.notify.isPatientSelectAll = this.notify.deSelectedPatientIds.length === 0;
      } else {
        if (isChecked) {
          this.notify.selectedPatientIds.push(patientId);
        } else {
          _.remove(this.notify.selectedPatientIds, (patId) => { return patId == patientId; })
        }
        this.notify.isPatientSelectAll = this.page.totalElements === this.notify.selectedPatientIds.length;
      }
      this.notify.selectedPatientCounts += isChecked ? 1 : -1;
    }
  }
  getTemplateDetails(event) {
    this.notify.templateName = event ? { id: event.id, name: event.name } : null;
  }
  sendBulkNotificationConfirmationPopup() {
    const modalTitleobj = 'Confirm';
    const modalBodyobj = 'Do you want to send notification for selected patients?';
    const messageDetails = {
      modalTitle: modalTitleobj,
      modalBody: modalBodyobj,
      buttonType: 'yes_no'
    };
    const modalInstance = this.confirmationModalService.open(ConfirmationPopupComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false
      });
    modalInstance.result.then((result) => {
      if (result === 'yes') {
        this.sendBulkNotification();
      }
    }, () => {} );
    modalInstance.componentInstance.messageDetails = messageDetails;
  }
  sendBulkNotification() {
    if (!this.notify.templateName) {
      this.alertMsg = {
        message: 'Please select Template',
          messageType: 'warning',
          duration: Constants.ALERT_DURATION
      };
      return;
    }
    const param = {
      is_active: this.showActivePatient,
      search_text: this.searchString,
      template_id: this.notify.templateName.id,
      is_select_all: this.notify.isPatientSelectAllFlag,
      selected_patient_ids: this.notify.selectedPatientIds,
      deselected_patient_ids: this.notify.deSelectedPatientIds,
      advanced_search: this.getSearchFilterObject()
    }
    this.usersService.SendBulkMailAndSmsToPatient(param).subscribe(res => {
      if (res.status_code === 200) {
        this.alertMsg = {
          message: 'SMS sent successfully.',
            messageType: 'success',
            duration: Constants.ALERT_DURATION
        };
        this.clearBulkNotification();
      } else {
        this.alertMsg = {
          message: res.message,
            messageType: 'warning',
            duration: Constants.ALERT_DURATION
        };
      }
    });
  }
  clearBulkNotification() {
    this.notify.templateName = null;
    this.notify.isPatientSelectAll = false;
    this.onPatientSelect('select_all', '', this.notify.isPatientSelectAll);
  }
  getBulkTemplateCategory(): Observable<any> {
    return this.templatesService.getTemplateCategoryList().pipe(map(res => {
      const indx = _.findIndex(res, (v) => {
        return v.key === 'PROMOTIONAL';
      });
      if (indx !== -1) {
        return res[indx].id;
      } else {
        return -1;
      }
    }));
  }
  getTemplateMasterList(categoryId, clearExistingData?): Observable<any> {
    return this.templatesService.getAllTemplateList(categoryId, clearExistingData).pipe(map(res => {
      this.templateMasterList = res;
      return this.templateMasterList;
    }));
  }

}

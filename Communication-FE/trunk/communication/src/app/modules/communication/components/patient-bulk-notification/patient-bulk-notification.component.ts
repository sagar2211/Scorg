import { Component, OnInit, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { IAlert } from '@qms/qlist-lib/lib/models/common.model';
import { Observable, of, forkJoin } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import * as _ from 'lodash';
import { environment } from 'src/environments/environment';
import { Constants } from 'src/app/config/constants';
import { Entity, Doctor, JointClinic, ServiceProvider } from '@qms/qlist-lib';
import * as moment from 'moment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from 'src/app/public/services/common.service';
import { PatientService } from 'src/app/public/services/patient.service';
import { EntityBasicInfoService } from 'src/app/public/services/entity-basic-info.service';
import { TemplatesService } from '../../services/templates.service';
import { AppointmentService } from '../../services/appointment.service';
import { PatientListNotificationComponent } from '../patient-list-notification/patient-list-notification.component';

@Component({
  selector: 'app-patient-bulk-notification',
  templateUrl: './patient-bulk-notification.component.html',
  styleUrls: ['./patient-bulk-notification.component.scss']
})
export class PatientBulkNotificationComponent implements OnInit {

  @ViewChild('smsEditor', { static: false }) smsEditor: any;
  templateFrm: FormGroup;
  patientFilterForm: FormGroup;
  submitted = false;
  alertMsg: IAlert;
  tagMasterList = [];
  templateCategoryList = [];
  templateMasterList = [];
  caretstartPos = 0;
  caretendPos = 0;
  toggleEdit: boolean = false;
  genderList: any;
  bloodGroupList = [];
  compInstance = this;
  stateList = [];
  cityList = [];
  appointmentStatusArrayList = [];
  queueStatusArrayList = [];
  entityList: Array<Entity> = [];
  doctorList: Array<Doctor> = [];
  jointClinicList: Array<JointClinic> = [];
  serviceProviderList: Array<ServiceProvider> = [];
  patientTypeList: any;
  visitTypeList = [];
  serviceList = [];
  searcParams: any = {};
  currentDate: Date = new Date();
  notificationDate: Date;
  patientListCount: number = -1; // set default value for flag
  isCompleted = false;
  queryOnList = [];
  queryOn: any;
  queryListArray = [];
  modalService: NgbModal;
  minDate: any = { year: new Date().getFullYear(), month: 1, day: 1 };
  simulatorStringValue = '';
  step1Description = '';
  step2Description = '';
  step3Description = '';
  queryByPatientParamList = [];
  queryByEntityParamList = [];
  queryByAppParamList = [];

  durationList = [
    { id: 0, name: 'Custome Date' },
    { id: 1, name: 'Current Month' },
    { id: 3, name: 'Last 3 Month' },
    { id: 6, name: 'Last 6 Month' },
  ];

  constructor(
    private route: ActivatedRoute,
    private commonService: CommonService,
    private fb: FormBuilder,
    private tempalteService: TemplatesService,
    private patientService: PatientService,
    private entityBasicInfoService: EntityBasicInfoService,
    private appointmentService: AppointmentService,
    private modelInstance: NgbModal
  ) {
    this.modalService = modelInstance;
  }

  ngOnInit() {
    const dt = new Date();
    this.minDate = { year: dt.getFullYear(), month: (dt.getMonth() + 1), day: dt.getDate() };
    this.commonService.routeChanged(this.route);
    this.appointmentStatusArrayList = _.clone(Constants.appointmentStausArray);
    this.queueStatusArrayList = _.clone(Constants.queueStausArray);
    this.patientTypeList = ['PRIORITY', 'NORMAL', 'WALKIN'];
    this.defaultTemplateForm();
    this.defaultSearchFilter();
    this.getGenderList();
    const getTemplateList = this.getTemplateTagList();
    const getTemplateCategoryList = this.getTemplateCategoryList();
    const getgetBloodList = this.getBloodList();
    const getdefaultCountry = this.defaultCountryList();
    const serviceList = this.getServiceList();
    forkJoin([getTemplateList, getTemplateCategoryList, getgetBloodList, getdefaultCountry, serviceList]).subscribe(res => {
      this.getVisitType();
      this.getEntityList();
    });
    this.onValueChanges();
  }
  defaultTemplateForm() {
    this.templateFrm = this.fb.group({
      templateCategory: [null],
      templateName: [null],
      smstemplateDetails: ['', Validators.required],
      campaignName: ['', Validators.required]
    });
  }
  // ngOnChanges(changes: SimpleChanges): void {
  //   this.onValueChanges();
  // }

  get templateFrmCntrols() {
    return this.templateFrm.controls;
  }
  getTemplateCategoryList(): Observable<any> {
    return this.tempalteService.getTemplateCategoryList().pipe(map(res => {
      // PROMOTIONAL
      this.templateCategoryList = _.filter(res, (o) => o.key === 'PROMOTIONAL');
      this.onSelectTemplateCategory(this.templateCategoryList[0]);
      return this.templateCategoryList;
    }));
  }

  getTemplateTagList(): Observable<any> {
    return this.tempalteService.getTemplateTagsByCategory().pipe(map(res => {
      return this.tagMasterList = res;
    }));
  }

  onSelectTemplateCategory(event) {
    this.templateFrm.patchValue({
      templateCategory: event ? event : null
    });
    this.templateMasterList = [];
    if (event) {
      this.getTemplateMasterList(event.id).subscribe();
    }
  }

  getTemplateMasterList(categoryId, clearExistingData?): Observable<any> {
    return this.tempalteService.getAllTemplateList(categoryId, clearExistingData, true).pipe(map(res => {
      this.templateMasterList = res;
      _.map(this.templateMasterList, (o) => {
        if (!o.isActive) {
          o.displayname = o.name + ' ( InActive )';
        } else {
          o.displayname = o.name;
        }
      });
      return this.templateMasterList;
    }));
  }

  getTemplateDetails(event): void {
    if (event) {
      this.tempalteService.getTemplateById(event.id).subscribe((res) => {
        if (!_.isEmpty(res)) {
          // res.email = this.addEditTagCloseOnNode(res.email);
          res.templateFor = res.templateFor.toLowerCase().trim();
          this.templateFrm.patchValue({
            templateName: { id: res.id, name: res.name },
            smstemplateDetails: res.sms ? res.sms : ''
          });
          if (!this.templateFrm.value.isMailTemplateActive) {
            this.smsEditor.nativeElement.focus();
          }
        }
      });
    } else {
      this.templateFrm.patchValue({
        templateName: null,
        smstemplateDetails: '',
        campaignName: ''
      });
      this.toggleEdit = false;
    }
  }

  checkNewTemplate(flag) {
    this.toggleEdit = flag ? false : true;
    this.toggleEditAction();
    this.templateFrm.patchValue({
      templateName: null,
      smstemplateDetails: ''
    });
    this.submitted = false;
  }

  toggleEditAction(): void {
    this.toggleEdit = !this.toggleEdit;
  }

  getSMSCaretPos(oField) {
    if (oField.selectionStart || oField.selectionStart === '0') {
      this.caretstartPos = oField.selectionStart;
    }
    this.caretendPos = oField.selectionEnd;
  }

  toAddTag(tagValue, tagId?) {
    tagValue = tagValue + ' ';
    const myField = this.smsEditor.nativeElement;
    myField.focus();
    if (this.caretstartPos !== 0 || this.caretendPos !== 0) {
      myField.value = myField.value.substring(0, this.caretstartPos) + tagValue + myField.value.substring(this.caretendPos, myField.value.length);
      this.smsEditor.nativeElement.setSelectionRange(this.caretendPos + tagValue.length, this.caretstartPos + tagValue.length);
    } else {
      myField.value = myField.value.concat(tagValue);
    }
    this.templateFrm.patchValue({
      smstemplateDetails: myField.value
    });
    this.caretstartPos = 0;
    this.caretendPos = 0;
  }

  patchQueryOnDefaultValue(val?) {
    const form = {
      queryOn: val ? val : null,
      querBy: [this.patchQueryByDefaultValue()]
    };
    this.queryListArray.push(form);
  }
  patchQueryByDefaultValue(val?) {
    const form = {
      queryName: val ? val : null
    };
    return form;
  }

  addQueryBy(index) {
    if (this.queryListArray[index].queryOn && this.queryListArray[index].queryOn.name) {
      this.patchQueryOnDefaultValue();
      const queryName = this.queryListArray[index].queryOn.name;
      _.map(this.queryOnList, (o) => {
        const findoobj = _.find(this.queryListArray, (rec) => {
          return rec.queryOn && rec.queryOn.name === queryName && o.name === queryName;
        });
        if (!_.isUndefined(findoobj)) {
          o.disabled = true;
        }
      });
    }
  }

  deleteQueryBy(index) {
    if (this.queryListArray[index].queryOn) {
      const queryName = _.cloneDeep(this.queryListArray[index].queryOn.name);
      _.map(this.queryOnList, (o) => {
        if (o.name === queryName) {
          o.disabled = false;
        }
      });
    }
    this.queryListArray.splice(index, 1);
    if (this.queryListArray.length <= 0) {
      this.patchQueryOnDefaultValue();
      this.patientFilterForm.reset();
      this.defaultSearchFilter();
    }
  }

  formvalueChangesOnRemove() {

  }

  queryByParamLength(queryByName) {
    return queryByName === 'PATIENT' ? this.queryByPatientParamList.length - 1 : queryByName === 'APPOINTMENT' ? this.queryByAppParamList.length - 1 : 0;
  }

  addQueryOn(parentIndex, index) {
    if (this.queryListArray[parentIndex].querBy[index] && this.queryListArray[parentIndex].querBy[index].queryName) {
      this.queryListArray[parentIndex].querBy.push(this.patchQueryByDefaultValue());
      const parentNodeName = this.queryListArray[parentIndex].queryOn.name;
      const list = parentNodeName === 'PATIENT' ? this.queryByPatientParamList
        : parentNodeName === 'APPOINTMENT' ? this.queryByAppParamList
          : parentNodeName === 'ENTITY' ? this.queryByEntityParamList : [];
      const queryOnName = this.queryListArray[parentIndex].querBy[index].queryName.name;
      const findoobj = _.find(list, (rec) => {
        return rec.name === queryOnName;
      });
      if (!_.isUndefined(findoobj)) {
        findoobj.disabled = true;
      }
    }
  }

  deleteQueryOn(parentIndex, index) {
    if (this.queryListArray[parentIndex].querBy[index]) {
      const parentNodeName = this.queryListArray[parentIndex].queryOn.name;
      const list = parentNodeName === 'PATIENT' ? this.queryByPatientParamList
        : parentNodeName === 'APPOINTMENT' ? this.queryByAppParamList
          : parentNodeName === 'ENTITY' ? this.queryByEntityParamList : [];
      const queryOnName = this.queryListArray[parentIndex].querBy[index].queryName ? this.queryListArray[parentIndex].querBy[index].queryName.name : '';
      _.map(list, (o) => {
        if (o.name === queryOnName) {
          o.disabled = false;
        }
      });
      this.queryListArray[parentIndex].querBy.splice(index, 1);
      if (this.queryListArray[parentIndex].querBy.length <= 0) {
        this.queryListArray[parentIndex].querBy.push(this.patchQueryByDefaultValue());
      }
    }
  }

  defaultSearchFilter() {
    this.patientFilterForm = this.fb.group({
      reg_from_date: '',
      reg_to_date: '',
      gender: [],
      blood_group_ids: [],
      age_value: '',
      age_operator: 'greater',
      marital_status: '',
      country_id: null,
      state_id: null,
      city_id: null,
      pin_code: '',
      lastAppointment_from_date: '',
      lastAppointment_to_date: '',
      entityType: '',
      entityTypeValue: '',
      service_taken_id: [],
      appointment_status_id: null,
      queue_status_id: null,
      visit_type_id: null, // 2,
      patient_type: null, // 'PRIORITY',
      registrationCustomDuration: this.durationList[0],
      lastvisitedCustomDuration: this.durationList[0]
    });
    this.queryListArray = [];
    this.patchQueryOnDefaultValue();
    this.step2Description = '';
    this.step3Description = '';
    this.patientListCount = -1;
    this.queryOnList = [
      { name: 'PATIENT', disabled: false },
      { name: 'PROVIDER', disabled: false },
      { name: 'APPOINTMENT', disabled: false },
      { name: 'SERVICES', disabled: false }
    ];
    this.queryByPatientParamList = [
      { name: 'PATIENT DETAIL', disabled: false },
      { name: 'GEOGRAPHICALY', disabled: false },
      { name: 'REGISTRATION DATE', disabled: false }
    ];
    this.queryByAppParamList = [
      { name: 'APPOINTMENT STATUS', disabled: false },
      { name: 'QUEUE STATUS', disabled: false },
      { name: 'VISIT TYPE', disabled: false },
      { name: 'PATIENT TYPE', disabled: false },
      { name: 'VISITED DURATION', disabled: false }
    ];
  }

  getVisitType(): void {
    this.appointmentService.getVisitType().subscribe((res) => {
      if (res) {
        this.visitTypeList = res;
      }
    });
  }

  getEntityList() {
    this.entityBasicInfoService.getAllEntityList().subscribe((res) => {
      this.entityList = res;
    });
  }

  selectEntity(e) {
    this.patientFilterForm.patchValue({ entityType: e });
    this.updateValuesOnEntityChange(e ? e.key : '');
  }

  updateValuesOnEntityChange(key) {
    if (key === 'service_provider') {
      this.getAllServiceProviderList();
    } else if (key === 'doctor') {
      this.getAllDoctorList().subscribe();
    } else if (key === 'joint_clinic') {
      this.getAllJointClinicList();
    }
  }

  getAllDoctorList(searchKey?: string): Observable<any> {
    const params = {
      limit: environment.limitDataToGetFromServer,
      search_text: searchKey ? searchKey : '',
      id: this.compInstance.patientFilterForm.value.entityType ? this.compInstance.patientFilterForm.value.entityType.id : null,
      key: this.compInstance.patientFilterForm.value.entityType ? this.compInstance.patientFilterForm.value.entityType.key : null,
      specialityId: null
    };
    return this.compInstance.entityBasicInfoService.getAllServiceProviderList(params).pipe(map(res => {
      if (res.length > 0) {
        this.compInstance.doctorList = res;
        return this.compInstance.doctorList = res;
      } else {
        return this.compInstance.doctorList = [];
      }
    }));
  }

  selectValue(e): void {
    this.patientFilterForm.patchValue({ entityTypeValue: e ? e : null });
  }

  getAllJointClinicList(searchKey?, flag?): void {
    const params = {
      limit: environment.limitDataToGetFromServer,
      search_text: searchKey ? searchKey : '',
      id: this.patientFilterForm.value.entityType.id,
      key: this.patientFilterForm.value.entityType.key,
      specialityId: null
    };
    this.entityBasicInfoService.getAllServiceProviderList(params).subscribe(res => {
      if (res.length > 0) {
        this.jointClinicList = res;
      } else {
        this.jointClinicList = [];
        this.alertMsg = {
          message: 'Joint Clinic data not find',
          messageType: 'warning',
          duration: Constants.ALERT_DURATION
        };
      }
    });
  }

  getAllServiceProviderList(searchKey?, flag?) {
    const params = {
      limit: environment.limitDataToGetFromServer,
      search_text: searchKey ? searchKey : null,
      id: this.patientFilterForm.value.entityType ? this.patientFilterForm.value.entityType.id : null,
      key: this.patientFilterForm.value.entityType ? this.patientFilterForm.value.entityType.key : null,
      specialityId: null
    };
    this.entityBasicInfoService.getAllServiceProviderList(params).subscribe(res => {
      if (res.length > 0) {
        this.serviceProviderList = res;
      } else {
        this.serviceProviderList = [];
        this.alertMsg = {
          message: 'no service provider data find',
          messageType: 'warning',
          duration: Constants.ALERT_DURATION
        };
      }
    });
  }

  getServiceList(searchKey?): Observable<any> {
    // if (!this.compInstance.patientFilterForm.value.entityTypeValue) {
    //   return of([]);
    // }
    const param = {
      entity_id: 2, // doctor
      service_provider_id: 11, // entity value id
      search_text: searchKey || '',
      limit: 50
    };
    return this.compInstance.entityBasicInfoService.getServiceListByNameArray(param).pipe(map(res => {
      this.compInstance.serviceList = res;
      return res;
    }));
  }

  getGenderList() {
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

  defaultCountryList(): Observable<any> {
    return this.compInstance.patientService.getCountryList(environment.limitDataToGetFromServer, 'INDIA').pipe(map(res => {
      const defaultCountry = res.countryList.find(country => country.name === 'INDIA');
      this.selectCountry(defaultCountry);
    }),
      catchError(error => [])
    );
  }

  getCountryList(search): Observable<any> {
    const searchString = (!_.isUndefined(search) && search != null) ? search : '';
    return this.compInstance.patientService.getCountryList(environment.limitDataToGetFromServer, searchString).pipe(map(res => {
      return res.countryList;
    }),
      catchError(error => [])
    );
  }

  selectCountry(event) {
    this.patientFilterForm.patchValue({ country_id: event ? event : null });
    this.patientFilterForm.patchValue({ state_id: null });
    this.patientFilterForm.patchValue({ city_id: null });
    this.getStateList('').subscribe();
  }

  getStateList(search): Observable<any> {
    if ((this.compInstance.patientFilterForm.value.country_id != null &&
      !_.isUndefined(this.compInstance.patientFilterForm.value.country_id.id))) {
      const searchString = (!_.isUndefined(search) && search != null) ? search : '';
      const countryId = this.compInstance.patientFilterForm.value.country_id.id;
      return this.compInstance.patientService.getStateList(countryId, environment.limitDataToGetFromServer, searchString).pipe(map(res => {
        this.stateList = res.stateList;
        return res.stateList;
      }),
        catchError(error => [])
      );
    } else {
      return of([]);
    }
  }

  selectState(event) {
    this.patientFilterForm.patchValue({ state_id: event ? event : null });
    this.patientFilterForm.patchValue({ city_id: null });
    this.getCity('').subscribe();
  }

  getCity(search): Observable<any> {
    if ((this.compInstance.patientFilterForm.value.state_id != null &&
      !_.isUndefined(this.compInstance.patientFilterForm.value.state_id.id))) {
      const searchString = (!_.isUndefined(search) && search != null) ? search : '';
      const stateId = this.compInstance.patientFilterForm.value.state_id.id;
      return this.compInstance.patientService.getCityList(stateId, environment.limitDataToGetFromServer, searchString).pipe(map(res => {
        this.cityList = res.cityList;
        return res.cityList;
      }),
        catchError(error => [])
      );
    } else {
      return of([]);
    }
  }

  selectCity(event) {
    this.patientFilterForm.patchValue({ city_id: event ? event : null });
  }

  searchByFilter() {
    const formValue = this.patientFilterForm.value;
    const advancePatientSearch = {
      search_creteria: '',
      is_active: true,
      reg_from_date: formValue.reg_from_date ? (moment(formValue.reg_from_date).format(Constants.apiDateFormate)) : '',
      reg_to_date: formValue.reg_to_date ? (moment(formValue.reg_to_date).format(Constants.apiDateFormate)) : '',
      gender: formValue.gender ? this.setFromObjectData(formValue.gender) : [],
      blood_group_ids: formValue.blood_group_ids ? this.setFromObjectData(formValue.blood_group_ids) : [],
      marital_status: '',
      age_value: formValue.age_value ? formValue.age_value : null,
      age_operator: formValue.age_operator && formValue.age_value ? formValue.age_operator : '',
      country_id: formValue.country_id ? formValue.country_id.id : null,
      state_id: formValue.state_id ? formValue.state_id.id : null,
      city_id: formValue.city_id ? formValue.city_id.id : null,
      pin_code: formValue.pin_code ? formValue.pin_code : ''
    };
    const advanceAppointmentSearch = {
      entity_id: formValue.entityType ? formValue.entityType.id : null,
      entity_value_id: formValue.entityTypeValue ? formValue.entityTypeValue.id : null,
      service_taken_id: formValue.service_taken_id ? this.setFromObjectData(formValue.service_taken_id) : [],
      appointment_status_id: formValue.appointment_status_id ? formValue.appointment_status_id.id : null,
      queue_status_id: formValue.queue_status_id ? formValue.queue_status_id.id : null,
      visit_type_id: formValue.visit_type_id ? formValue.visit_type_id.visitId : null,
      patient_type: formValue.patient_type ? formValue.patient_type : '',
      appointment_from_date: formValue.lastAppointment_from_date ? (moment(formValue.lastAppointment_from_date).format(Constants.apiDateFormate)) : '',
      appointment_to_date: formValue.lastAppointment_to_date ? (moment(formValue.lastAppointment_to_date).format(Constants.apiDateFormate)) : '',
    };
    this.searcParams = {
      advance_patient_search: advancePatientSearch,
      advance_appointment_search: advanceAppointmentSearch
    };
    this.patientService.getFilterPatientCount(this.searcParams).subscribe(res => {
      this.patientListCount = res.status_code === 200 && res.total_records ? res.total_records : -1;
      this.step2Description = this.patientListCount > 0 ? this.patientListCount.toString() : '';
    });
  }

  setFromObjectData(paramArray) {
    const returnArray = []
    _.map(paramArray, (o) => {
      returnArray.push(o.id);
    });
    return returnArray;
  }

  sendNotification() {
    if (this.notificationDate && this.patientListCount > 0) {
      const notificationDate = moment(this.notificationDate).add(1, 'minutes').format('MM/DD/YYYY HH:mm:ss'); // added 1 min
      const sendNotificationParams = {
        patient_advance_search: this.searcParams,
        campaign_name: this.templateFrm.value.campaignName,
        sms_datetime: notificationDate,
        sms_template: this.templateFrm.value.smstemplateDetails,
        email_template: ''
      };
      this.patientService.sendNotificationOnFilterPatients(sendNotificationParams).subscribe(res => {
        if (res.status_code === 200) {
          this.alertMsg = {
            message: 'Sms Send Successfully',
            messageType: 'success',
            duration: Constants.ALERT_DURATION
          };
          this.isCompleted = true;
          this.templateFrm.reset();
          this.defaultTemplateForm();
          this.patientFilterForm.reset();
          this.defaultSearchFilter();
          // this.patientListCount = -1;
          this.notificationDate = null;
          this.step2Description = '';
        }
      });
    } else {
      this.alertMsg = {
        message: 'No search criteria is present or No record is found.',
        messageType: 'danger',
        duration: Constants.ALERT_DURATION
      };
    }
  }

  onDateChange($event) {
    this.step3Description = $event ? (moment($event, 'DD/MM/YYYY HH:mm').format('DD/MM/YYYY HH:mm')) : '';
  }

  onStep1Next(event) {
    this.step1Description = this.templateFrm.value.campaignName ? this.templateFrm.value.campaignName : '';
    this.isCompleted = false;
  }

  onStep2Next(event) {
    this.isCompleted = false;
  }

  onStep3Next(event) {
    this.step3Description = this.notificationDate ? (moment(this.notificationDate).format('DD/MM/YYYY HH:mm')) : '';
    this.isCompleted = false;
  }

  showPatientList() {
    if (this.patientListCount !== 0) {
      const modalInstance = this.modelInstance.open(PatientListNotificationComponent,
        {
          ariaLabelledBy: 'modal-basic-title',
          backdrop: 'static',
          keyboard: false,
          windowClass: 'custom-modal',
          size: 'xl',
          container: '#homeComponent'
        });
      modalInstance.componentInstance.searchParams = this.searcParams;
    }
  }
  onValueChanges(): void {
    this.templateFrm.get('smstemplateDetails').valueChanges.subscribe(val => {
      if (!val) {
        this.step3Description = '';
        this.step2Description = '';
        this.patientFilterForm.reset();
        this.defaultSearchFilter();
        this.patientListCount = -1;
        this.notificationDate = null;
        this.step2Description = '';
      }
      this.replacePattern(val);
    });
    this.templateFrm.get('campaignName').valueChanges.subscribe(val => {
      val = val.trim();
      if (!val) {
        this.templateFrm.get('campaignName').setErrors({ incorrect: true });
        this.step3Description = '';
        this.step1Description = '';
        this.patientFilterForm.reset();
        this.defaultSearchFilter();
        this.patientListCount = -1;
        this.notificationDate = null;
        this.step2Description = '';
      } else {
        this.templateFrm.get('campaignName').setErrors(null);
      }
      this.step1Description = val;
    });
  }
  replacePattern(value) {
    let smsText = _.cloneDeep(value);
    this.simulatorStringValue = '';
    if (smsText) {
      _.map(this.tagMasterList, (o) => {
        switch (o.tag_name) {
          case '#PATIENTNAME#': smsText = _.replace(smsText, /#PATIENTNAME#/g, 'Anirudh Kulkarni'); break;
          case '#PATIENTMOBILENO#': smsText = _.replace(smsText, /#PATIENTMOBILENO#/g, '9000000000'); break;
          case '#PATIENTID#': smsText = _.replace(smsText, /#PATIENTID#/g, '101'); break;
          case '#UHID#': smsText = _.replace(smsText, /#UHID#/g, '2020010101'); break;
          case '#TOKENNO#': smsText = _.replace(smsText, /#TOKENNO#/g, 'TK001'); break;
          case '#ENTITYTYPE#': smsText = _.replace(smsText, /#ENTITYTYPE#/g, 'Doctor'); break;
          case '#APPOINTMENTDATE#': smsText = _.replace(smsText, /#APPOINTMENTDATE#/g, '10/08/2020'); break;
          case '#APPOINTMENTTIME#': smsText = _.replace(smsText, /#APPOINTMENTTIME#/g, '10:00 AM'); break;
          case '#PATIENTADDRESS#': smsText = _.replace(smsText, /#PATIENTADDRESS#/g, 'Pune, MH'); break;
          case '#HOSPITALNAME#': smsText = _.replace(smsText, /#HOSPITALNAME#/g, 'Scorg MultiSpeciality Hospital'); break;
          case '#PATIENGENDER#': smsText = _.replace(smsText, /#PATIENGENDER#/g, 'Male'); break;
          case '#PATIENTAGE#': smsText = _.replace(smsText, /#PATIENTAGE#/g, '35'); break;
          case '#PATIENTEMAIL#': smsText = _.replace(smsText, /#PATIENTEMAIL#/g, 'anirudh@test.com'); break;
          case '#ENTITYNAME#': smsText = _.replace(smsText, /#ENTITYNAME#/g, 'Dr. Sameer'); break;
          case '#DOCTOREMAIL#': smsText = _.replace(smsText, /#DOCTOREMAIL#/g, 'sameer@test.com'); break;
          case '#DOCTORPHONE#': smsText = _.replace(smsText, /#DOCTORPHONE#/g, '9012345678'); break;
          case '#ROOMNO#': smsText = _.replace(smsText, /#ROOMNO#/g, 'OPD-101'); break;
          case '#QUEUEDELAYTIME#': smsText = _.replace(smsText, /#QUEUEDELAYTIME#/g, '10 minutus'); break;
          case '#PATIENTCOMMUNICATIONTIME#': smsText = _.replace(smsText, /#PATIENTCOMMUNICATIONTIME#/g, '30 minutes'); break;
          case '#APPOINTMENTSTATUS#': smsText = _.replace(smsText, /#APPOINTMENTSTATUS#/g, 'CONFIRM'); break;
          case '#APPOINTMENTSTATUSDISPLAYNAME#': smsText = _.replace(smsText, /#APPOINTMENTSTATUSDISPLAYNAME#/g, 'CONFIRM'); break;
        }
      });
      this.simulatorStringValue = smsText;
    }
  }
  durationSelection(event, flag) {
    const value = event.id;
    let startDate = new Date();
    let endDate = new Date();
    switch (value) {
      case 1: // currentMOnth
        startDate = moment().startOf('month').toDate();
        endDate = moment().toDate();
        this.patchDurationValue(flag, startDate, endDate);
        break;
      case 3: // last 3 month
        startDate = moment().subtract(3, 'months').startOf('month').toDate();
        endDate = moment().toDate();
        this.patchDurationValue(flag, startDate, endDate);
        break;
      case 6: // last 6 month
        startDate = moment().subtract(6, 'months').startOf('month').toDate();
        endDate = moment().toDate();
        this.patchDurationValue(flag, startDate, endDate);
        break;
      default:
    }
  }

  patchDurationValue(flag, startDate, endDate) {
    if (flag === 'registerDuration') {
      this.patientFilterForm.patchValue({
        reg_from_date: startDate,
        reg_to_date: endDate
      });
    } else if (flag === 'visitedDuration') {
      this.patientFilterForm.patchValue({
        lastAppointment_from_date: startDate,
        lastAppointment_to_date: endDate
      });
    }
  }
}

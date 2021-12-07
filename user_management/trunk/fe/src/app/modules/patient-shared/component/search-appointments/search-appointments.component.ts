// --mains
import { Component, OnInit, EventEmitter, Output, Input, OnChanges, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import * as _ from 'lodash';
import * as moment from 'moment';
import { catchError, map, takeUntil } from 'rxjs/operators';

// -- services
import { EntitityCommonDataService } from '../../../schedule/services/entitity-common-data.service';
import { EntityBasicInfoService } from '../../../schedule/services/entity-basic-info.service';
import { CommonService } from 'src/app/services/common.service';

// --models
import { Speciality } from 'src/app/modules/schedule/models/speciality.model';
import { IAlert } from '../../../../models/AlertMessage';
import { Doctor } from 'src/app/modules/schedule/models/doctor.model';
import { JointClinic } from '../../../schedule/models/joint-clinic.model';
import { ServiceProvider } from 'src/app/modules/schedule/models/service-provider.model';
import { environment } from '../../../../../environments/environment';
import { Entity } from '../../../schedule/models/entity.model';
import { AppointmentType } from '../../../schedule/models/appointment-type.model';
import { Observable, Subject, forkJoin } from 'rxjs';
import { Constants } from '../../../../config/constants';
import { AuthService } from 'src/app/services/auth.service';
import { AppointmentListModel } from 'src/app/modules/appointment/models/appointment.model';
import { AppointmentHistory } from 'src/app/modules/appointment/models/appointment-history.model';
import { AppointmentService } from 'src/app/modules/appointment/services/appointment.service';

@Component({
  selector: 'app-search-appointments',
  templateUrl: './search-appointments.component.html',
  styleUrls: ['./search-appointments.component.scss']
})
export class SearchAppointmentsComponent implements OnInit, OnChanges, OnDestroy {
  compInstance = this;
  // -- Forms
  searchForm: FormGroup;

  // -- Array vars
  appointmentTypeList: Array<AppointmentType> = [];
  entityList: Array<Entity> = [];
  specialityList: Array<Speciality> = [];
  doctorList: Array<Doctor> = [];
  jointClinicList: Array<JointClinic> = [];
  serviceProviderList: Array<ServiceProvider> = [];
  hoursList: Array<string>;
  appointmentData: Array<AppointmentListModel> = [];

  // -- stings or numbers vars
  alertMsg: IAlert;
  timeFormat: string;
  selectedDateBtn: string;
  submitted = false;
  minDate = new Date();
  entity: any;

  @Output() getAppointmentData = new EventEmitter<any>();
  @Input() followUpDetails: AppointmentHistory;
  @Input() getEntityDataFromPatientHistory: any;
  @Input() public isFromFrontDesk = false;

  $destroy: Subject<boolean> = new Subject();

  constructor(
    private fb: FormBuilder,
    private entityBasicInfoService: EntityBasicInfoService,
    private entityCommonDataService: EntitityCommonDataService,
    private appointmentService: AppointmentService,
    private commonService: CommonService,
    private authService: AuthService,
  ) {
  }

  ngOnInit() {
    this.createForm();
    this.getAllEntityList().subscribe(res => {
      this.patchDefaultValueAsDoctor();
    });
    // this.getTimeFormatKey();
    this.timeFormat = this.authService.getUserInfoFromLocalStorage().timeFormat;
    if (this.timeFormat === '24_hour') {
      this.hoursList = this.entityCommonDataService.createHoursList24HourFormat();
    } else {
      this.hoursList = this.entityCommonDataService.createHoursList12HourFormat();
    }

    if (this.commonService.currentSelectedEntity !== null) { // while redirect from (access_allappointment_view) Manage  All appointment.
      this.getScheduleListBySelectedEntity(this.commonService.currentSelectedEntity);
    } else {
      const startDate = this.commonService.manageAppointmentFilterData && this.commonService.manageAppointmentFilterData.startDate ?
        this.commonService.manageAppointmentFilterData.startDate : 'TODAY';
      if (startDate === 'TODAY') {
        this.onClickDateBtn('TODAY');
      } else {
        this.onDateChange(startDate);
      }
    }
    this.subscribeEvents();
  }

  ngOnDestroy() {
    this.$destroy.next();
    this.$destroy.unsubscribe();
  }

  ngOnChanges(): void {
    if (this.searchForm) {
      if (this.getEntityDataFromPatientHistory && this.getEntityDataFromPatientHistory.isFromPatientAppointmentHistory) {
        this.patchDefaultValue(this.getEntityDataFromPatientHistory);
      } else {
        this.patchDefaultValue(this.followUpDetails);
      }
    }
  }

  createForm() {
    this.searchForm = this.fb.group({
      startDate: [null, Validators.required],
      selectedEntity: [null, Validators.required],
      selectedServiceProvider: [null],
      selectedDoctor: [null],
      selectedSpeciality: [null],
      appointmentType: [null],
      selectedJointClinic: [null],
      startHour: [''],
      selectedService: ['']
      // endHour: ['']
    });
  }

  patchDefaultValueAsDoctor(): void {
    const seentity = this.entityList.find(e => e.key === 'doctor');
    // const doctor = this.doctorList.find(e => e.id === followUpDetails.entityValue[0].entityValueId);
    this.searchForm.patchValue({ selectedEntity: seentity });
    this.getAllDoctorList().subscribe();
    this.getSpecialityList().subscribe();
  }

  patchDefaultValue(followUpDetails: AppointmentHistory): void {
    const seentity = this.entityList.find(e => e.name === followUpDetails.entityName);
    // const doctor = this.doctorList.find(e => e.id === followUpDetails.entityValue[0].entityValueId);
    this.searchForm.patchValue({ selectedEntity: seentity });
    const SelectedEntityValue = {
      id: followUpDetails.entityValue[0].entityValueId, name: followUpDetails.entityValue[0].entityValueName
    };
    this.searchForm.patchValue({
      selectedEntity: seentity,
      selectedDoctor: SelectedEntityValue
    });

    if (seentity.key === 'joint_clinic') {
      this.updateValuesOnEntityChange(seentity.key);
      this.searchForm.patchValue({ selectedJointClinic: SelectedEntityValue });
    } else if (seentity.key === 'service_provider') {
      this.updateValuesOnEntityChange(seentity.key);
      this.searchForm.patchValue({ selectedServiceProvider: SelectedEntityValue });
    } else {
      const SelectedSpecialityValue = {
        id: followUpDetails.entityValue[0].entitySpecialityId, name: followUpDetails.entityValue[0].entitySpecialityName
      };
      this.searchForm.patchValue({ selectedSpeciality: SelectedSpecialityValue });
      this.getAllDoctorList(SelectedEntityValue.name).subscribe(res => {
        //this.getSpecialityList();
        this.selectDoctor(res[0], this.searchForm.get('selectedDoctor'));
      });
      // this.updateValuesOnEntityChange(seentity.key);
    }
    this.getSearhData();
  }

  // -- set validator to endHour control
  // endHourValidator(control): void {
  //   if (control.value && (moment(control.value, 'H:mm').isBefore(moment(this.searchForm.value.startHour, 'H:mm')))) {
  //     control.setErrors({ endHour: true });
  //   } else {
  //     control.setErrors(null);
  //   }
  // }

  // startHourValidator(control) {
  //   if (this.searchForm.value.endHour && (moment(control.value, 'H:mm').isAfter(moment(this.searchForm.value.endHour, 'H:mm')))) {
  //     control.setErrors({ startHour: true });
  //   } else {
  //     control.setErrors(null);
  //   }
  // }

  getAppointmentTypeList(entityId, providerId) {
    if (entityId && providerId) {
      this.appointmentService.getAppointmentTypeByEntity(entityId, providerId)
        .subscribe((res: any) => {
          if (res.length > 0) {
            this.appointmentTypeList = res;
          } else {
            this.appointmentTypeList = [];
          }
        });
    }
  }

  getAllEntityList() : Observable<any>{
    return this.entityBasicInfoService.getAllEntityList().pipe(map(res => {
      if (res.length > 0) {
        this.entityList = res;
      }
      return this.entityList;
    }),
      catchError(error => [])
    );
  }

  selectEntity(e, item) {
    this.clearForm('entity');
    item.patchValue(e);
    this.updateValuesOnEntityChange(e ? e.key : '');
  }

  updateValuesOnEntityChange(key) {
    if (key === 'service_provider') {
      this.getAllServiceProviderList();
    } else if (key === 'doctor') {
      // this.getAllDoctorList().subscribe();
      this.getSpecialityList().subscribe();
    } else if (key === 'joint_clinic') {
      this.getAllJointClinicList();
    }
  }

  getSpecialityList(searchKey?): Observable<any> {
    const params = {
      limit: environment.limitDataToGetFromServer,
      search_string: searchKey ? searchKey : '',
    };
    return this.entityBasicInfoService.getSpecialityListData(params).pipe(map(res => {
      if (res.length > 0) {
        return this.specialityList = res;
      } else {
        this.alertMsg = {
          message: 'no speciality data find',
          messageType: 'warning',
          duration: Constants.ALERT_DURATION
        };
        return this.specialityList = [];
      }
    }));
  }

  selectSepeciality(e, selectedControl): void {
    selectedControl.patchValue(e);
    this.searchForm.patchValue({
      selectedDoctor: typeof e === 'object' ? this.searchForm.value.selectedDoctor === '' ? null : '' : e === undefined ? '' : null,
    });
    this.selectDoctor(this.searchForm.value.selectedDoctor, this.searchForm.get('selectedDoctor'));
    // this.getAppointmentData.emit(this.searchForm.value);
  }

  getAllDoctorList(searchKey?: string): Observable<any> {
    const params = {
      limit: environment.limitDataToGetFromServer,
      search_text: searchKey ? searchKey : '',
      id: this.compInstance.searchForm.value.selectedEntity ? this.compInstance.searchForm.value.selectedEntity.id : null,
      key: this.compInstance.searchForm.value.selectedEntity ? this.compInstance.searchForm.value.selectedEntity.key : null,
      specialityId: this.compInstance.searchForm.value.selectedSpeciality ? this.compInstance.searchForm.value.selectedSpeciality.id : null
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

  selectDoctor(e, selectedControl): void {
    selectedControl.patchValue(e);
    if (e) {
      const indx = _.findIndex(this.specialityList, (s) => +s.id === e.specialityId);
      if (indx !== -1) {
        this.searchForm.get('selectedSpeciality').patchValue(this.specialityList[indx]);
      }
      this.getAppointmentTypeList(this.searchForm.value.selectedEntity ? this.searchForm.value.selectedEntity.id : '', e.id);
      this.getSearhData();
    } else {
      this.appointmentTypeList = [];
      this.searchForm.patchValue({
        appointmentType: ''
      });
      // this.searchForm.patchValue({
      //   selectedSpeciality: ''
      // });
      this.getAppointmentData.emit(this.searchForm.value);
    }
  }

  getAllJointClinicList(searchKey?, flag?): void {
    const params = {
      limit: environment.limitDataToGetFromServer,
      search_text: searchKey ? searchKey : '',
      id: this.searchForm.value.selectedEntity.id,
      key: this.searchForm.value.selectedEntity.key,
      specialityId: null
    };
    this.entityBasicInfoService.getAllServiceProviderList(params).subscribe(res => {
      if (res.length > 0) {
        this.jointClinicList = res;
        if (flag) {
          this.selectJointClinic(res[0], this.searchForm.get('selectedJointClinic'));
        }
        // _.map(res, (val, key) => {
        //   const jointClinic = new JointClinic();
        //   if (jointClinic.isObjectValid(val)) {
        //     jointClinic.generateObject(val);
        //     this.jointClinicList.push(jointClinic);
        //   }
        // });
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

  selectJointClinic(e, selectedControl): void {
    selectedControl.patchValue(e);
    if (e) {
      this.getAppointmentTypeList(this.searchForm.value.selectedEntity ? this.searchForm.value.selectedEntity.id : '', e.id);
      this.getSearhData();
    } else {
      this.appointmentTypeList = [];
      this.searchForm.patchValue({
        appointmentType: ''
      });
      this.getAppointmentData.emit(this.searchForm.value);
    }
  }

  getAllServiceProviderList(searchKey?, flag?) {
    const params = {
      limit: environment.limitDataToGetFromServer,
      search_text: searchKey ? searchKey : null,
      id: this.searchForm.value.selectedEntity ? this.searchForm.value.selectedEntity.id : null,
      key: this.searchForm.value.selectedEntity ? this.searchForm.value.selectedEntity.key : null,
      specialityId: null
    };
    this.entityBasicInfoService.getAllServiceProviderList(params).subscribe(res => {
      if (res.length > 0) {
        this.serviceProviderList = res;
        if (flag) {
          this.selectProvider(res[0], this.searchForm.get('selectedServiceProvider'));
        }
      } else {
        this.serviceProviderList = [];
        this.alertMsg = {
          message: 'no service provider data find',
          messageType: 'warning',
          duration: Constants.ALERT_DURATION
        };
        this.getAppointmentData.emit(this.searchForm.value);
      }
    });
  }

  getSearhData(): void {
    this.submitted = true;
    // this.startHourValidator(this.searchForm.get('startHour'));
    // this.endHourValidator(this.searchForm.get('endHour'));
    if (this.searchForm.status === 'VALID') {
      this.submitted = false;
      // const reqParams = {
      //   entity_id: this.searchForm.value.selectedEntity ? this.searchForm.value.selectedEntity.id : 0,
      //   entity_value_id: this.searchForm.value.selectedEntity.id === 2 ? this.searchForm.value.selectedDoctor ? this.searchForm.value.selectedDoctor.id : 0 :
      //     this.searchForm.value.selectedEntity.id === 3 ?
      //       this.searchForm.value.selectedJointClinic ? this.searchForm.value.selectedJointClinic.id : 0 : 0,
      //   speciality_id: this.searchForm.value.selectedSpeciality ? this.searchForm.value.selectedSpeciality.id : 0, // Optional
      //   service_id: this.searchForm.value.selectedServiceProvider ? this.searchForm.value.selectedServiceProvider.id : 0, // optional
      //   appointment_type_id: this.searchForm.value.appointmentType ? this.searchForm.value.appointmentType.id : 0,
      //   date: moment(this.searchForm.value.startDate).format('MM/DD/YYYY'), // MM/dd/yyyy format required
      //   start_time: this.searchForm.value.startHour, // It will treat always >=. It is optional
      //   selectedEntityType: this.searchForm.value.selectedEntity
      // };
      // this.appointmentComponent.getAppointmentList(reqParams); // call to parent method
      this.getAppointmentData.emit(this.searchForm.value);
    }
  }

  clearForm(callFrom?: string): void {
    this.searchForm.reset({
      startDate: this.searchForm.value.startDate,
      startHour: callFrom === 'entity' ? this.searchForm.value.startHour : '',
      // endHour: this.searchForm.value.endHour
    });
    if (_.isUndefined(callFrom)) {
      this.onClickDateBtn('TODAY');
    }
    this.submitted = false;
    this.getAppointmentData.emit(this.searchForm.value);
  }

  selectProvider(e, selectedControl): void {
    selectedControl.patchValue(e);
    if (e) {
      this.getAppointmentTypeList(this.searchForm.value.selectedEntity ? this.searchForm.value.selectedEntity.id : '', e.id);
      this.getSearhData();
    } else {
      this.appointmentTypeList = [];
      this.searchForm.patchValue({
        appointmentType: ''
      });
    }
  }

  // -- method called when click on date buttons
  onClickDateBtn(value): void {
    this.selectedDateBtn = value;
    switch (value) {
      case 'TODAY':
        this.searchForm.patchValue({
          startDate: new Date(),
          // startHour: this.timeFormat === '24_hour' ? moment().add(1, 'hours').format('H:' + '00') : moment(new Date().getHours()).format('h:mm A'),
          // endHour: this.timeFormat === '24_hour' ? moment().add(1, 'hours').format('H:' + '00') : moment(new Date().getHours()).format('h:mm A')
        });
        break;
      case 'TOMORROW':
        this.searchForm.patchValue({
          startDate: moment(new Date()).add(1, 'days').toDate()
        });
        break;
      case 'NEXT_WEEK':
        this.searchForm.patchValue({
          startDate: (moment().add(1, 'weeks').startOf('isoWeek')).toDate()
        });
        break;
      case 'NEXT_MONTH':
        this.searchForm.patchValue({
          startDate: moment((moment(new Date()).add(1, 'months').format('YYYY-MM-01'))).toDate()
        });
        break;
      default:
    }
    this.getAppointmentData.emit(this.searchForm.value);
  }

  onDateChange($event): void {
    this.searchForm.patchValue({ startDate: $event });
    this.selectedDateBtn = null;
    const selectedDate = moment(moment($event).format('YYYY-MM-DD'));
    const tomorrowDate = moment(new Date()).add(1, 'days').toDate();
    const weekStartDate = moment().add(1, 'weeks').startOf('isoWeek');
    const weekLastDate = moment().add(1, 'weeks').endOf('isoWeek');
    const startOfMonth = moment(moment().startOf('month').format('YYYY-MM-DD hh:mm')).add(1, 'months');
    const endOfMonth = moment(moment().endOf('month').format('YYYY-MM-DD hh:mm')).add(1, 'months');
    if (selectedDate.isSame(moment().format('YYYY-MM-DD'))) {
      this.selectedDateBtn = 'TODAY';
    } else if (selectedDate.isSame(moment(tomorrowDate).format('YYYY-MM-DD'))) {
      this.selectedDateBtn = 'TOMORROW';
    } else if (moment($event).isBetween(weekStartDate, weekLastDate)) {
      this.selectedDateBtn = 'NEXT_WEEK';
    } else if (moment($event).isBetween(startOfMonth, endOfMonth)) {
      this.selectedDateBtn = 'NEXT_MONTH';
    }
    this.getAppointmentData.emit(this.searchForm.value);
  }

  subscribeEvents(): void {
    this.appointmentService.$subClearFormOnBookAppointment.pipe(takeUntil(this.$destroy)).subscribe((res) => {
      if (res) {
        this.clearForm();
      }
    });
  }

  selectAppoitmentType(e, selectedControl): void {
    const entityId = this.searchForm.value.selectedEntity ? this.searchForm.value.selectedEntity.id : 0;
    const eventValId = this.searchForm.value.selectedEntity.id === 2 ? this.searchForm.value.selectedDoctor ?
      this.searchForm.value.selectedDoctor.id : 0 : this.searchForm.value.selectedEntity.id === 3 ?
        this.searchForm.value.selectedJointClinic ? this.searchForm.value.selectedJointClinic.id : 0 : this.searchForm.value.selectedServiceProvider ?
          this.searchForm.value.selectedServiceProvider.id : 0;
    if (e) {
      selectedControl.patchValue(e);
    } else {
      selectedControl.patchValue(null);
    }
    this.getAppointmentTypeList(entityId, eventValId);
    this.getSearhData();
  }

  // added for on change of hour value update slots
  updateFormValueOnHourVal() {
    this.getAppointmentData.emit(this.searchForm.value);
  }
  getScheduleListBySelectedEntity(currentSelectedEntity) {
    this.onDateChange(currentSelectedEntity.selectedDate);
    const entity = {
      id: currentSelectedEntity.providerId,
      key: currentSelectedEntity.providerTypeKey,
      name: currentSelectedEntity.providerTypeName
    };
    this.searchForm.get('selectedEntity').patchValue(entity);
    if (currentSelectedEntity.providerTypeKey === 'service_provider') {
      this.getAllServiceProviderList(currentSelectedEntity.providerName, true);
    } else if (currentSelectedEntity.providerTypeKey === 'doctor') {
      const getSpecialityList = this.getSpecialityList();
      const getAllDoctorList = this.getAllDoctorList(currentSelectedEntity.providerName);
      forkJoin([getAllDoctorList, getSpecialityList]).subscribe(res => {
        if (res[0] && this.doctorList.length) {
          this.selectDoctor(this.doctorList[0], this.searchForm.get('selectedDoctor'));
        }
      });
    } else if (currentSelectedEntity.providerTypeKey === 'joint_clinic') {
      this.getAllJointClinicList(currentSelectedEntity.providerName, true);
    }
  }
}

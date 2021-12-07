import { CommonService } from 'src/app/services/common.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as _ from 'lodash';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { JointClinicModalComponent } from '../joint-clinic-modal/joint-clinic-modal.component';
import { environment } from 'src/environments/environment';
import { Entity } from '../../models/entity.model';
import { ServiceProvider } from '../../models/service-provider.model';
import { Doctor } from '../../models/doctor.model';
import { JointClinic } from '../../models/joint-clinic.model';
import { AppointmentType } from '../../models/appointment-type.model';
import { ScheduleType } from '../../models/schedule-type.model';
import { Speciality } from '../../models/speciality.model';
import { EntityBasicInfoService } from '../../services/entity-basic-info.service';
import { EntitityCommonDataService } from '../../services/entitity-common-data.service';
import { EntityBasicInfo } from '../../models/entity-basic-info.model';
import { IAlert } from 'src/app/models/AlertMessage';
import { Observable, Subject, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { Constants } from 'src/app/config/constants';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-entity-basic-info',
  templateUrl: './entity-basic-info.component.html',
  styleUrls: ['./entity-basic-info.component.scss']
})
export class EntityBasicInfoComponent implements OnInit, OnDestroy {
  entityList: Entity[] = [];
  serviceProviderList: ServiceProvider[] = [];
  doctorList: Doctor[] = [];
  jointClinicList: JointClinic[] = [];
  appointmentTypeList: AppointmentType[] = [];
  scheduleTypelist: ScheduleType[] = [];
  specialityList: Speciality[] = [];
  entityBasicForm: FormGroup;
  alertMsg: IAlert;
  selectedDoctorsForJointClinic: Doctor[] = [];
  summeryVal: any;
  modalService: NgbModal;
  historyData: any;
  compInstance = this;
  destroy$ = new Subject();
  isNgSelectTypeHeadDisabled: boolean;
  disableAddJointClinic: boolean;
  showDataForEditMode: boolean;
  loadForm: boolean;
  currentScheduleMode: string;

  // selectedEntity: Entity;
  // selectedServiceProvider: ServiceProvider;
  // selectedDoctor: Doctor;
  // selectedJointClinic: JointClinic;


  constructor(
    private entityBasicInfoService: EntityBasicInfoService,
    private entityCommonDataService: EntitityCommonDataService,
    private fb: FormBuilder,
    private confirmationModalService: NgbModal,
    private route: ActivatedRoute,
    private commonService: CommonService,
    private authService: AuthService,
  ) {
    this.modalService = confirmationModalService;
  }

  ngOnInit() {
    this.loadForm = false;
    this.showDataForEditMode = false;
    this.getAppointmentTypeList().subscribe(a => {
      this.createForm();
      this.currentScheduleMode = 'add';
      this.disableAddJointClinic = false;
      this.isNgSelectTypeHeadDisabled = false;
      this.historyData = {};
      this.compInstance.entityCommonDataService.setSummeryDataDefault();
      this.entityCommonDataService.timeFormateKey = this.authService.getUserInfoFromLocalStorage().timeFormat;

      if (!(!_.isUndefined(this.route.snapshot.params.entityId) && !_.isUndefined(this.route.snapshot.params.providerId))) {
        this.getAllEntityList().subscribe();
        this.getScheduleTypeList().subscribe();
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
    this.modalService.dismissAll();
  }

  createForm() {
    this.patchDefaultValue();
  }

  patchAppointmentTypeArray() {
    const appointmentTypes = [];
    _.map(this.appointmentTypeList, (v, k) => {
      const appType = {
        name: [v.name],
        id: [v.id],
        isSelected: [false]
      };
      const appointmentType = new AppointmentType();
      if (appointmentType.isObjectValid(v)) {
        appointmentType.generateObject(v);
        appointmentTypes.push(this.fb.group(appointmentType));
      }
    });
    return appointmentTypes;
  }

  patchDefaultValue() {
    const basicForm = {
      formId: [null],
      selectedEntity: [null, Validators.required],
      selectedServiceProvider: [null],
      selectedDoctor: [null],
      selectedSpeciality: [null],
      selectedJointClinic: [null],
      selectedAppointmentTypes: this.fb.array(this.patchAppointmentTypeArray()),
      selectedScheduleType: [null, Validators.required],
      advanceBookingDays: [null, [Validators.required]],
      parallelBookingAllow: [false],
      parallelBookingValue: [null, Validators.max(999)],
      tokenValue: [null, Validators.maxLength(3)]
    };
    const entityBasicInfo = new EntityBasicInfo();
    if (entityBasicInfo.isObjectValid(basicForm)) {
      entityBasicInfo.generateObject(basicForm);
      this.entityBasicForm = this.fb.group(entityBasicInfo);
    }
    if (!_.isUndefined(this.route.snapshot.params.entityId) && !_.isUndefined(this.route.snapshot.params.providerId)) {
      this.showDataForEditMode = true;
      this.generateEditMode();
    }else{
      this.loadForm = true;
    }
  }

  generateEditMode() {
    this.getScheduleTypeList().subscribe(s => {
      this.getAllEntityList().subscribe(d => {
        this.compInstance.entityCommonDataService.globalScheduleMode = 'edit';
        this.currentScheduleMode = 'edit';
        this.isNgSelectTypeHeadDisabled = true;
        const findEntity = _.find(this.entityList, (v) => {
          return v.id === _.toNumber(this.route.snapshot.params.entityId);
        });
        this.entityBasicForm.controls.selectedEntity.setValue(findEntity ? findEntity : null);
        if (findEntity.key === 'doctor') {
          const param = {
            entity_id: findEntity.id,
            entity_data_id: this.route.snapshot.params.providerId
          };
          this.getHistoryData(param)
          // this.getSpecialityListData().subscribe(res => {
          //   this.getAllDoctorList(_.startCase(this.route.snapshot.params.providerName, '_', ' ')).subscribe(res => {
          //     let findData = _.find(this.doctorList, (v) => {
          //       return v.id === _.toNumber(this.route.snapshot.params.providerId);
          //     });
          //     if (_.isUndefined(findData)) {
          //       findData = {
          //         id: this.route.snapshot.params.providerId,
          //         name: _.startCase(this.route.snapshot.params.providerName, '_', ' ')
          //       };
          //     } else {
          //       this.updateSpecilityData(findData.specialityId);
          //     }
          //     this.entityBasicForm.controls.selectedDoctor.setValue(findData);
          //     const param = {
          //       entity_id: findEntity.id,
          //       entity_data_id: findData.id
          //     };
          //     this.getHistoryData(param);
          //   });
          // });
        } else if (findEntity.key === 'joint_clinic') {
         let findData = {
            id: this.route.snapshot.params.providerId,
            name: ''
          };
          this.getSelectJointClinicDoctorsList(findData);
          this.entityBasicForm.controls.selectedJointClinic.setValue(findData);
          const param = {
            entity_id: findEntity.id,
            entity_data_id: findData.id
          };
          this.getHistoryData(param);
          // this.getAllJointClinicList(_.startCase(this.route.snapshot.params.providerName, '_', ' ')).subscribe(res => {
          //   let findData = _.find(this.jointClinicList, (v) => {
          //     return v.id === _.toNumber(this.route.snapshot.params.providerId);
          //   });
          //   if (_.isUndefined(findData)) {
          //     findData = {
          //       id: this.route.snapshot.params.providerId,
          //       name: _.startCase(this.route.snapshot.params.providerName, '_', ' ')
          //     };
          //   }
          //   this.getSelectJointClinicDoctorsList(findData);
          //   this.entityBasicForm.controls.selectedJointClinic.setValue(findData);
          //   const param = {
          //     entity_id: findEntity.id,
          //     entity_data_id: findData.id
          //   };
          //   this.getHistoryData(param);
          //   this.disableAddJointClinic = true;
          // });
        } else if (findEntity.key === 'service_provider') {
          const param = {
            entity_id: findEntity.id,
            entity_data_id: this.route.snapshot.params.providerId
          };
          this.getHistoryData(param);
          // this.getAllServiceProviderList(_.startCase(this.route.snapshot.params.providerName, '_', ' ')).subscribe(res => {
          //   let findData = _.find(this.serviceProviderList, (v) => {
          //     return v.id === _.toNumber(this.route.snapshot.params.providerId);
          //   });
          //   if (_.isUndefined(findData)) {
          //     findData = {
          //       id: this.route.snapshot.params.providerId,
          //       name: _.startCase(this.route.snapshot.params.providerName, '_', ' ')
          //     };
          //   }
          //   this.entityBasicForm.controls.selectedServiceProvider.setValue(findData);
          //   const param = {
          //     entity_id: findEntity.id,
          //     entity_data_id: findData.id
          //   };
          //   this.getHistoryData(param);
          // });
        }
      });
    });
  }

  getAllEntityList(): Observable<any> {
    return this.entityBasicInfoService.getAllEntityList().pipe(map(res => {
      if (res.length > 0) {
        this.entityList = res;
      } else {
        this.alertMsg = {
          message: 'no entity data',
          messageType: 'warning',
          duration: Constants.ALERT_DURATION
        };
      }
      return this.entityList;
    }));
  }

  getAllServiceProviderList(searchKey?): Observable<any> {
    if (_.isUndefined(this.compInstance.entityBasicForm)
      && _.isUndefined(this.compInstance.entityBasicForm.value)
      && _.isUndefined(this.compInstance.entityBasicForm.value.selectedEntity.id)) {
      return of([]);
    }
    const params = {
      limit: environment.limitDataToGetFromServer,
      search_text: searchKey ? searchKey : null,
      id: this.compInstance.entityBasicForm.value.selectedEntity.id,
      key: this.compInstance.entityBasicForm.value.selectedEntity.key,
      specialityId: null
    };
    if (!_.isUndefined(this.compInstance.route.snapshot.params.entityId) && !_.isUndefined(this.compInstance.route.snapshot.params.providerId) && !searchKey) {
      params.search_text = _.startCase(this.compInstance.route.snapshot.params.providerName, '_', ' ');
    }
    return this.compInstance.entityBasicInfoService.getAllServiceProviderList(params).pipe(map(res => {
      this.serviceProviderList = [];
      if (res.length > 0) {
        this.serviceProviderList = res;
      } else {
        this.alertMsg = {
          message: 'no service provider data find',
          messageType: 'warning',
          duration: Constants.ALERT_DURATION
        };
      }
      return this.serviceProviderList;
    }));
  }

  getAllDoctorList(searchKey?): Observable<any> {
    if (_.isUndefined(this.compInstance.entityBasicForm)
      && _.isUndefined(this.compInstance.entityBasicForm.value)
      && _.isUndefined(this.compInstance.entityBasicForm.value.selectedEntity.id)) {
      return of([]);
    }
    const params = {
      limit: environment.limitDataToGetFromServer,
      search_text: searchKey ? searchKey : '',
      id: this.compInstance.entityBasicForm.controls.selectedEntity.value.id,
      key: this.compInstance.entityBasicForm.controls.selectedEntity.value.key,
      specialityId: this.compInstance.entityBasicForm.controls.selectedSpeciality.value ?
        this.compInstance.entityBasicForm.controls.selectedSpeciality.value.id : null
    };
    if (!_.isUndefined(this.compInstance.route.snapshot.params.entityId) && !_.isUndefined(this.compInstance.route.snapshot.params.providerId) && !searchKey) {
      params.search_text = _.startCase(this.compInstance.route.snapshot.params.providerName, '_', ' ');
    }
    return this.compInstance.entityBasicInfoService.getAllServiceProviderList(params).pipe(map(res => {
      this.doctorList = [];
      if (res.length > 0) {
        this.doctorList = res;
      } else {
        this.alertMsg = {
          message: 'no doctor data find',
          messageType: 'warning',
          duration: Constants.ALERT_DURATION
        };
      }
      return this.doctorList;
    }));
  }

  getSpecialityListData(searchKey?): Observable<any> {
    if (_.isUndefined(this.compInstance.entityBasicForm)
      && _.isUndefined(this.compInstance.entityBasicForm.value)
      && _.isUndefined(this.compInstance.entityBasicForm.value.selectedEntity.id)) {
      return of([]);
    }
    const params = {
      limit: environment.limitDataToGetFromServer,
      search_string: searchKey ? searchKey : '',
    };
    return this.compInstance.entityBasicInfoService.getSpecialityListData(params).pipe(map(res => {
      this.specialityList = [];
      if (res.length > 0) {
        this.specialityList = res;
      } else {
        this.alertMsg = {
          message: 'no speciality data find',
          messageType: 'warning',
          duration: Constants.ALERT_DURATION
        };
      }
      return this.specialityList;
    }));
  }

  getSelectJointClinicDoctorsList(item) {
    const param = {
      jointClinicId: item.id
    };
    this.entityBasicInfoService.getSelectJointClinicDoctorsList(param).subscribe(res => {
      this.selectedDoctorsForJointClinic = [];
      if (res) {
        _.map(res.data, (val, key) => {
          const doctor = new Doctor();
          if (doctor.isObjectValid(val)) {
            doctor.generateObject(val);
            this.selectedDoctorsForJointClinic.push(doctor);
          }
        });
      }
    });
  }

  getScheduleTypeList(): Observable<any> {
    return this.entityBasicInfoService.getScheduleTypeList().pipe(map(res => {
      if (res.length > 0) {
        this.scheduleTypelist = res;
      } else {
        this.alertMsg = {
          message: 'no schedule type data',
          messageType: 'warning',
          duration: Constants.ALERT_DURATION
        };
      }
      return this.scheduleTypelist;
    }));
  }

  getAllJointClinicList(searchKey?): Observable<any> {
    if (_.isUndefined(this.compInstance.entityBasicForm)
      && _.isUndefined(this.compInstance.entityBasicForm.value)
      && _.isUndefined(this.compInstance.entityBasicForm.value.selectedEntity.id)) {
      return of([]);
    }
    const params = {
      limit: environment.limitDataToGetFromServer,
      search_text: searchKey ? searchKey : '',
      id: this.compInstance.entityBasicForm.controls.selectedEntity.value.id,
      key: this.compInstance.entityBasicForm.controls.selectedEntity.value.key,
      specialityId: null
    };
    if (!_.isUndefined(this.compInstance.route.snapshot.params.entityId) && !_.isUndefined(this.compInstance.route.snapshot.params.providerId) && !searchKey) {
      params.search_text = _.startCase(this.compInstance.route.snapshot.params.providerName, '_', ' ');
    }
    return this.compInstance.entityBasicInfoService.getAllServiceProviderList(params).pipe(map(res => {
      this.jointClinicList = [];
      if (res.length > 0) {
        this.jointClinicList = res;
      } else {
        this.alertMsg = {
          message: 'Joint Clinic data not find',
          messageType: 'warning',
          duration: Constants.ALERT_DURATION
        };
      }
      return this.jointClinicList;
    }));
  }

  getAppointmentTypeList(searchKey?): Observable<any> {
    const params = {
      limit: environment.limitDataToGetFromServer,
      search_text: searchKey ? searchKey : '',
    };
    return this.entityBasicInfoService.getAppointmentTypeList(params).pipe(map(res => {
      if (res.length > 0) {
        this.appointmentTypeList = res;
      } else {
        this.alertMsg = {
          message: 'no appointment type data',
          messageType: 'warning',
          duration: Constants.ALERT_DURATION
        };
      }
      return this.appointmentTypeList;
    }));
  }

  updateValuesOnEntityChange(key) {
    if (key === 'service_provider') {
      this.getAllServiceProviderList().subscribe();
    } else if (key === 'doctor') {
      this.getAllDoctorList();
      this.getSpecialityListData().subscribe();
    } else if (key === 'joint_clinic') {
      this.getAllJointClinicList().subscribe();
    }
  }

  resetAllDropdown(from?) {
    if (!from) {
      this.entityBasicForm.controls.formId.setValue(null);
      this.entityBasicForm.controls.selectedServiceProvider.setValue(null);
      this.entityBasicForm.controls.selectedDoctor.setValue(null);
      this.entityBasicForm.controls.selectedJointClinic.setValue(null);
    } else if (from === 'joint_clinic') {
      this.entityBasicForm.controls.selectedServiceProvider.setValue(null);
      this.entityBasicForm.controls.selectedDoctor.setValue(null);
      this.entityBasicForm.controls.selectedSpeciality.setValue(null);
    } else if (from === 'doctor') {
      this.entityBasicForm.controls.selectedServiceProvider.setValue(null);
      this.entityBasicForm.controls.selectedDoctor.setValue(null);
    } else if (from === 'service_provider') {
      this.entityBasicForm.controls.selectedJointClinic.setValue(null);
      this.entityBasicForm.controls.selectedDoctor.setValue(null);
      this.entityBasicForm.controls.selectedSpeciality.setValue(null);
    }
    this.entityBasicForm.controls.selectedScheduleType.setValue(null);
    this.entityBasicForm.controls.parallelBookingAllow.setValue(false);
    this.entityBasicForm.controls.parallelBookingValue.setValue(null);
    this.entityBasicForm.controls.tokenValue.setValue(null);
    this.entityBasicForm.controls.advanceBookingDays.setValue(null);
    this.selectedDoctorsForJointClinic = [];
    // tslint:disable-next-line: no-string-literal
    _.map(this.entityBasicForm.controls.selectedAppointmentTypes['controls'], (type) => {
      type.patchValue({ isSelected: false });
      type.enable();
    });
    this.historyData = {};
    this.entityCommonDataService.globalScheduleMode = 'add';
    this.currentScheduleMode = 'add';
    this.entityCommonDataService.getHistoryWhenProviderChange(this.entityBasicForm.valid);
    this.compInstance.entityCommonDataService.setSummeryDataDefault();
    this.saveBasicInfoValue();
  }

  changeEntity() {
    this.updateValuesOnEntityChange(this.entityBasicForm.value.selectedEntity.key);
    this.resetAllDropdown();
  }

  selectEntity(e) {
    if (e === '') {
      return;
    }
    this.resetAllDropdown('service_provider');
    this.resetAllDropdown('joint_clinic');
    const isTrue = typeof e === 'object';
    if (isTrue) {
      this.entityBasicForm.controls.selectedEntity.patchValue({
        id: isTrue ? e.id : '',
        name: isTrue ? e.name : e,
        key: isTrue ? e.key : e,
      });
      this.updateValuesOnEntityChange(e.key);
      this.saveBasicInfoValue();
    } else {
      this.entityBasicForm.controls.selectedEntity.patchValue(null);
      this.resetAllDropdown();
    }
  }

  selectServiceProvider(e) {
    if (e === '') {
      return;
    }
    this.resetAllDropdown('service_provider');
    const isTrue = typeof e === 'object';
    if (isTrue) {
      this.entityBasicForm.controls.selectedServiceProvider.patchValue({
        id: isTrue ? e.id : '',
        name: isTrue ? e.name : e,
      });
      const param = {
        entity_id: this.entityBasicForm.controls.selectedEntity.value.id,
        entity_data_id: e.id
      };
      this.getHistoryData(param);
    } else {
      this.entityBasicForm.controls.selectedServiceProvider.patchValue(null);
      this.getAllServiceProviderList(e);
    }
  }

  selectSepeciality(e) {
    if (e === '') {
      return;
    }
    this.resetAllDropdown();
    const isTrue = typeof e === 'object';
    if (isTrue) {
      this.entityBasicForm.controls.selectedSpeciality.patchValue({
        id: isTrue ? e.id : '',
        name: isTrue ? e.name : e,
      });
      this.entityBasicForm.patchValue({
        selectedDoctor: ''
      });
      this.getAllDoctorList().subscribe();
    } else {
      this.entityBasicForm.controls.selectedSpeciality.patchValue(null);
      this.entityBasicForm.patchValue({
        selectedDoctor: null
      });
      this.getSpecialityListData(e).subscribe();
    }
  }

  updateSpecilityData(id) {
    const findSpeciality = _.find(this.specialityList, (v) => {
      return _.toNumber(v.id) === _.toNumber(id);
    });
    if (findSpeciality) {
      this.entityBasicForm.controls.selectedSpeciality.patchValue(findSpeciality);
    }
  }

  selectDoctor(e) {
    if (e === '') {
      return;
    }
    this.resetAllDropdown('doctor');
    const isTrue = typeof e === 'object';
    if (isTrue) {
      this.entityBasicForm.controls.selectedDoctor.patchValue({
        id: isTrue ? e.id : '',
        name: isTrue ? e.name : e,
      });
      const param = {
        entity_id: this.entityBasicForm.controls.selectedEntity.value.id,
        entity_data_id: e.id
      };
      this.updateSpecilityData(e.specialityId);
      this.getHistoryData(param);
    } else {
      this.entityBasicForm.controls.selectedDoctor.patchValue(null);
      this.entityBasicForm.controls.selectedSpeciality.patchValue(null);
      this.getAllDoctorList(e).subscribe();
    }
  }

  selectScheduleType(e) {
    if (e === '') {
      return;
    }
    const isTrue = typeof e === 'object';
    if (isTrue) {
      this.entityBasicForm.controls.selectedScheduleType.patchValue({
        id: isTrue ? e.id : '',
        name: isTrue ? e.name : e,
      });
    }
    this.saveBasicInfoValue();
  }

  selectJointClinic(e) {
    if (e === '') {
      return;
    }
    this.resetAllDropdown('joint_clinic');
    const isTrue = typeof e === 'object';
    if (isTrue) {
      this.entityBasicForm.controls.selectedJointClinic.patchValue({
        id: isTrue ? e.id : '',
        name: isTrue ? e.name : e,
      });
      this.getSelectJointClinicDoctorsList(e);
      // remove when implement multi select component
      const param = {
        entity_id: this.entityBasicForm.controls.selectedEntity.value.id,
        entity_data_id: e.id
      };
      this.getHistoryData(param);
    } else {
      this.entityBasicForm.controls.selectedJointClinic.patchValue(null);
      this.getAllJointClinicList(e).subscribe();
    }
  }

  saveBasicInfoValue() {
    const val = {
      selectedEntity: this.entityBasicForm.controls.selectedEntity.value,
      selectedProvider: this.entityBasicForm.controls.selectedDoctor.value
        || this.entityBasicForm.controls.selectedServiceProvider.value
        || this.entityBasicForm.controls.selectedJointClinic.value,
      selectedAppointmentTypes: _.map(_.filter(this.entityBasicForm.controls.selectedAppointmentTypes['controls'], (type) => {
        return type.value.isSelected === true;
      }), (val) => {
        return val.value;
      }),
      selectedScheduleType: this.entityBasicForm.controls.selectedScheduleType.value,
      parallelBookingAllow: this.entityBasicForm.controls.parallelBookingAllow.value,
      parallelBookingValue: this.entityBasicForm.controls.parallelBookingValue.value,
      tokenValue: this.entityBasicForm.controls.tokenValue.value,
      timePerPatient: null,
      appointmentTimeSlot: null,
      advanceBookingDays: this.entityBasicForm.controls.advanceBookingDays.value,
      formId: this.entityBasicForm.controls.formId.value,
    };
    this.entityCommonDataService.updateBasicInfoValue(val);
    this.entityCommonDataService.updateServicesListWhenProviderChange(this.historyData);
  }

  addNewJointClinc() {
    const modalInstance = this.modalService.open(JointClinicModalComponent, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      container: '#homeComponent'
    });
    modalInstance.result.then((result) => {
      if (result.mode === 'NEW') {
        this.saveJointClinic(result.data);
      } else {
        this.updateJointClinic(result.data);
      }
    }, () => { });
    if (this.showDataForEditMode){
      (modalInstance.componentInstance as JointClinicModalComponent).selectedClinic = this.historyData.basicInfo.selectedProvider;
    }else{
      (modalInstance.componentInstance as JointClinicModalComponent).selectedClinic = this.entityBasicForm.value.selectedJointClinic;
    }
    (modalInstance.componentInstance as JointClinicModalComponent).selectedClinicDocList = this.selectedDoctorsForJointClinic;
  }

  saveJointClinic(value) {
    const param = {
      clinic_name: value.jointClinicName,
      doctor_ids: value.selectedDoctors.map(val => val.id)
    };
    this.entityBasicInfoService.saveJointClinic(param).subscribe(res => {
      if (res) {
        this.alertMsg = {
          message: res,
          messageType: 'success',
          duration: Constants.ALERT_DURATION
        };
        this.selectedDoctorsForJointClinic = [];
        this.jointClinicList = [];
        this.getAllJointClinicList().subscribe();
      } else {
        this.alertMsg = {
          message: 'somthing went wrong',
          messageType: 'warning',
          duration: Constants.ALERT_DURATION
        };
      }
    });
  }

  updateRequiredForApp(val) {
    this.entityBasicForm.controls.parallelBookingValue.clearValidators();
    this.entityBasicForm.controls.parallelBookingValue.setErrors(null);
    if (val) {
      this.entityBasicForm.controls.parallelBookingValue.setValidators([Validators.required, Validators.max(999)]);
    } else {
      this.entityBasicForm.controls.parallelBookingValue.setValidators([Validators.max(999)]);
    }
    this.saveBasicInfoValue();
  }

  getHistoryData(param) {
    this.entityCommonDataService.getHistoryDataForProvider(param).subscribe(res => {
      this.historyData = {};
      if (!_.isEmpty(res)) {
        this.compInstance.entityCommonDataService.globalScheduleMode = 'edit';
        this.currentScheduleMode = 'edit';
        this.loadForm = true;
        this.entityCommonDataService.getHistoryWhenProviderChange(res);
        this.historyData = res;
        this.updateProvidersValueWhenEdit();
        this.entityBasicForm.controls.formId.setValue(res.basicInfo.formId || null);
        this.entityBasicForm.controls.selectedScheduleType.setValue(res.basicInfo.selectedScheduleType || null);
        this.entityBasicForm.controls.parallelBookingAllow.setValue(res.basicInfo.parallelBookingAllow || false);
        this.entityBasicForm.controls.parallelBookingValue.clearValidators();
        this.entityBasicForm.controls.parallelBookingValue.setErrors(null);
        if (this.entityBasicForm.controls.parallelBookingAllow.value) {
          this.entityBasicForm.controls.parallelBookingValue.setValidators([Validators.required, Validators.max(999)]);
        } else {
          this.entityBasicForm.controls.parallelBookingValue.setValidators([Validators.max(999)]);
        }
        this.entityBasicForm.controls.parallelBookingValue.setValue(res.basicInfo.parallelBookingValue || null);
        this.entityBasicForm.controls.tokenValue.setValue(res.basicInfo.tokenValue || null);
        this.entityBasicForm.controls.advanceBookingDays.setValue(res.basicInfo.advanceBookingDays || null);
        // tslint:disable-next-line: no-string-literal
        _.map(this.entityBasicForm.controls.selectedAppointmentTypes['controls'], (type) => {
          const findData = _.find(res.basicInfo.selectedAppointmentTypes, (f) => {
            return _.toNumber(f.id) === _.toNumber(type.value.id);
          });
          if (findData) {
            type.patchValue({ isSelected: true });
            type.disable();
          }
        });
      } else {
        this.entityCommonDataService.getServicesListDataOnProviderChange(param);
      }
    });
  }

  updateProvidersValueWhenEdit() {
    const findEntity = _.find(this.entityList, (v) => {
      return v.id === this.historyData.basicInfo.selectedEntity.id;
    });
    if (findEntity.key === 'doctor') {
      this.getSpecialityListData().subscribe(res => {
        this.getAllDoctorList(this.historyData.basicInfo.selectedProvider.name).subscribe(res => {
          let findData = _.find(this.doctorList, (v) => {
            return v.id === this.historyData.basicInfo.selectedProvider.id;
          });
          this.updateSpecilityData(findData.specialityId);
          this.entityBasicForm.controls.selectedDoctor.setValue(findData);
          this.saveBasicInfoValue();
        });
      });
    } else if (findEntity.key === 'joint_clinic') {
      this.getAllJointClinicList(this.historyData.basicInfo.selectedProvider.name).subscribe(res => {
        let findData = _.find(this.jointClinicList, (v) => {
          return v.id === this.historyData.basicInfo.selectedProvider.id;;
        });
        this.entityBasicForm.controls.selectedJointClinic.setValue(findData);
        this.saveBasicInfoValue();
      });
    } else if (findEntity.key === 'service_provider') {
      this.getAllServiceProviderList(this.historyData.basicInfo.selectedProvider.name).subscribe(res => {
        let findData = _.find(this.serviceProviderList, (v) => {
          return v.id === this.historyData.basicInfo.selectedProvider.id;
        });
        this.entityBasicForm.controls.selectedServiceProvider.setValue(findData);
        this.saveBasicInfoValue();
      });
    }
  }

  checkFormIsValidOrNot() {
    // let status = false;
    // let msg = '';
    // const formVal = {
    //   selectedEntity: this.entityBasicForm.controls.selectedEntity.value,
    //   selectedProvider: this.entityBasicForm.controls.selectedDoctor.value
    //     || this.entityBasicForm.controls.selectedServiceProvider.value
    //     || this.entityBasicForm.controls.selectedJointClinic.value,
    //   selectedAppointmentTypes: _.filter(this.entityBasicForm.controls.selectedAppointmentTypes.value, (type) => {
    //     return type.isSelected === true;
    //   }),
    //   selectedScheduleType: this.entityBasicForm.controls.selectedScheduleType.value,
    //   parallelBookingAllow: this.entityBasicForm.controls.parallelBookingAllow.value,
    //   parallelBookingValue: this.entityBasicForm.controls.parallelBookingValue.value,
    //   tokenValue: this.entityBasicForm.controls.tokenValue.value,
    //   timePerPatient: null,
    //   appointmentTimeSlot: null,
    //   advanceBookingDays: this.entityBasicForm.controls.advanceBookingDays.value,
    //   formId: this.entityBasicForm.controls.formId.value,
    // };
    // if (!formVal.selectedEntity) {
    //   msg = 'Please Select Entity';
    // } else if (!formVal.selectedProvider) {
    //   msg = 'Please Select Provider';
    // } else if (_.filter(formVal.selectedAppointmentTypes, (v) => v.isSelected === true).length === 0) {
    //   msg = 'Please Select Appointment Type';
    // } else if (!formVal.selectedScheduleType) {
    //   msg = 'Please Select Schedule Type';
    // } else if (!formVal.advanceBookingDays) {
    //   msg = 'Please Fill Advanse Booking Days';
    // } else if (formVal.parallelBookingAllow && !formVal.parallelBookingValue) {
    //   msg = 'Please Fill Provide value for parallel booking';
    // } else {
    //   status = true;
    // }
    // if (!status) {
    //   this.alertMsg = {
    //     message: msg,
    //     messageType: 'warning',
    //     duration: Constants.ALERT_DURATION
    //   };
    // }

    return status;
  }

  subcriptionOfEvents() {
    // this.entityBasicForm.get('selectedEntity').valueChanges.pipe().subscribe(res => {
    //   // this.saveBasicInfoValue();
    //   console.log(res);
    // });
  }

  patchNumberValues(val, key) {
    this.entityBasicForm.get(key).patchValue(val);
    this.saveBasicInfoValue();
  }

  updateJointClinic(data): void {
    const reqParams = {
      Id: this.entityBasicForm.value.selectedJointClinic.id,
      clinic_name: this.showDataForEditMode ? this.historyData.basicInfo.selectedProvider.name : this.entityBasicForm.value.selectedJointClinic.name,
      doctor_ids: data.selectedDoctors.map(val => val.id)
    };
    this.entityBasicInfoService.updateJointClinic(reqParams).subscribe(res => {
      if (res.status_message === 'Success') {
        this.alertMsg = {
          message: res.message,
          messageType: 'success',
          duration: Constants.ALERT_DURATION
        };
        this.selectedDoctorsForJointClinic = data.selectedDoctors;
        this.jointClinicList = [];
        this.getAllJointClinicList();
      } else {
        this.alertMsg = {
          message: 'somthing went wrong',
          messageType: 'warning',
          duration: Constants.ALERT_DURATION
        };
      }
    });
  }

}

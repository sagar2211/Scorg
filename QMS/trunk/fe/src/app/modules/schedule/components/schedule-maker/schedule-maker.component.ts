import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import * as moment from 'moment';
import * as _ from 'lodash';
import { takeUntil, map } from 'rxjs/operators';
import { Subject, Observable, of } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AppointmentType } from '../../models/appointment-type.model';
import { ScheduleMakerService } from '../../services/schedule-maker.service';
import { EntitityCommonDataService } from '../../services/entitity-common-data.service';
import { WeekDays } from '../../models/week-days.model';
import { EntityScheduleAppointmentTime } from '../../models/entity-schedule-appointment-time.model';
import { EntitySchedule } from '../../models/entity-schedule.model';
import { ConfirmationPopupComponent } from 'src/app/components/confirmation-popup/confirmation-popup.component';
import { IAlert } from 'src/app/models/AlertMessage';
import { Router, ActivatedRoute } from '@angular/router';
import { EntityBasicInfoService } from '../../services/entity-basic-info.service';
import { Entity } from '../../models/entity.model';
import { ServiceProvider } from '../../models/service-provider.model';
import { Doctor } from '../../models/doctor.model';
import { JointClinic } from '../../models/joint-clinic.model';
import { CommonService } from '../../../../services/common.service';
import { Constants } from 'src/app/config/constants';
import { AuthService } from 'src/app/services/auth.service';
import { ScheduleHistoryComponent } from '../schedule-history/schedule-history.component';
import { SlideInOutLogAnimation } from 'src/app/config/animations';

@Component({
  selector: 'app-schedule-maker',
  templateUrl: './schedule-maker.component.html',
  styleUrls: ['./schedule-maker.component.scss'],
  animations: [SlideInOutLogAnimation]
})
export class ScheduleMakerComponent implements OnInit, OnDestroy {

  weekDaysArray = [];
  scheduleMakerForm: FormGroup;
  selectedAppointmentTypes: AppointmentType[] = [];
  alertMsg: IAlert;
  minDateForDatePicker: Date = new Date();
  summeryData: any;
  nextButtonDisableStatus = true;
  destroy$ = new Subject();
  modalService: NgbModal;
  timeFormateKey: string;
  historyData: any;
  scheduleDataForEdit: any;
  globalScheduleMode: string;
  selectedEntity: number;
  selectedProvider: number;
  selectedScheduleId: number;
  loadform: boolean;
  loadformEntity: boolean;
  entityList: Entity[] = [];
  serviceProviderList: ServiceProvider[] = [];
  doctorList: Doctor[] = [];
  jointClinicList: JointClinic[] = [];
  compInstance = this;
  entityBasicForm: FormGroup;
  isNgSelectTypeHeadDisabled: boolean;
  endTimeHoursList: Array<string> = [];
  startTimeArray: Array<string> = [];

  lastAppointmentForSchedule = null;
  disableAllFormValForEditMode: string;
  modalInstanceForschedulelog: any;
  startDatePatchVal;
  endDatePatchVal;
  animationState = 'out';
  isShowInstruction = false;
  clearButtonStatus = true;
  isDeleteEnable = false;
  isDeleteEnableForDate = false;

  constructor(
    private scheduleMakerService: ScheduleMakerService,
    private entityCommonDataService: EntitityCommonDataService,
    private fb: FormBuilder,
    private confirmationModalService: NgbModal,
    private router: Router,
    private route: ActivatedRoute,
    private commonService: CommonService,
    private entityBasicInfoService: EntityBasicInfoService,
    private authService: AuthService,

  ) {
    this.modalService = confirmationModalService;
  }

  ngOnInit() {
    this.entityCommonDataService.activeEditTimeScheduleIndex = null;
    this.lastAppointmentForSchedule = null;
    this.globalScheduleMode = 'add';
    this.startDatePatchVal = null;
    this.endDatePatchVal = null;
    this.commonService.routeChanged(this.route);
    this.isNgSelectTypeHeadDisabled = false;
    this.disableAllFormValForEditMode = '';
    this.entityCommonDataService.timeFormateKey = this.authService.getUserInfoFromLocalStorage().timeFormat;
    this.timeFormateKey = this.authService.getUserInfoFromLocalStorage().timeFormat;
    this.loadform = false;
    this.loadformEntity = false;
    if (!_.isEmpty(this.route.snapshot['params'])) {
      this.selectedEntity = this.route.snapshot.params.entityId;
      this.selectedProvider = this.route.snapshot.params.providerId;
      this.selectedScheduleId = this.route.snapshot.params.scheduleId;
    } else {
      this.selectedEntity = null;
      this.selectedProvider = null;
      this.selectedScheduleId = null;
    }
    this.weekDaysArray = this.entityCommonDataService.getWeekDaysArrayList();
    this.historyData = {};
    this.selectedAppointmentTypes = [];
    this.getAllEntityList().subscribe(d => {
      this.createEntityForm();
      if (!_.isEmpty(this.route.snapshot['params'])) {
        this.generateFormData();
      }
    });
    this.subcriptionOfEvents();
    this.commonService.$logSliderOpenClose.pipe(takeUntil(this.destroy$)).subscribe((obj: any) => {
      if (obj === 'open') {
        this.isShowInstruction = true;
        this.animationState = this.isShowInstruction ? 'in' : 'out';
      } else {
        this.isShowInstruction = false;
        this.animationState = 'out';
      }
    });
  }

  createEntityForm() {
    this.patchEntityDefaultValue();
  }

  patchEntityDefaultValue() {
    const basicForm = {
      formId: [null],
      selectedEntity: [null, Validators.required],
      selectedServiceProvider: [null],
      selectedDoctor: [null],
      selectedJointClinic: [null]
    };
    this.entityBasicForm = this.fb.group(basicForm);
    if (!_.isEmpty(this.route.snapshot['params'])) {
      this.generateEditMode();
    } else {
      this.loadformEntity = true;
    }
  }

  generateEditMode() {
    this.isNgSelectTypeHeadDisabled = true;
    const findEntity = _.find(this.entityList, (v) => {
      return v.id === _.toNumber(this.route.snapshot.params.entityId);
    });
    this.entityBasicForm.controls.selectedEntity.setValue(findEntity ? findEntity : null);
    if (findEntity.key === 'doctor') {
      const findData = {
        id: this.route.snapshot.params.providerId,
        name: _.startCase(this.route.snapshot.params.providerName, '_', ' ')
      };
      this.entityBasicForm.controls.selectedDoctor.setValue(findData);
      this.selectedEntity = findEntity.id;
      this.selectedProvider = findData.id;
      this.getHistoryData();
    } else if (findEntity.key === 'joint_clinic') {
      const findData = {
        id: this.route.snapshot.params.providerId,
        name: _.startCase(this.route.snapshot.params.providerName, '_', ' ')
      };
      this.entityBasicForm.controls.selectedJointClinic.setValue(findData);
      this.selectedEntity = findEntity.id;
      this.selectedProvider = findData.id;
      this.getHistoryData();
    } else if (findEntity.key === 'service_provider') {
      const findData = {
        id: this.route.snapshot.params.providerId,
        name: _.startCase(this.route.snapshot.params.providerName, '_', ' ')
      };
      this.entityBasicForm.controls.selectedServiceProvider.setValue(findData);
      this.selectedEntity = findEntity.id;
      this.selectedProvider = findData.id;
      this.getHistoryData();
    }
  }

  generateFormData() {
    if (_.isEmpty(this.historyData)) {
      this.getHistoryData().subscribe(res1 => {
        this.createForm();
      });
    } else {
      this.createForm();
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  getHistoryData(): Observable<any> {
    const param = {
      entity_id: this.selectedEntity,
      entity_data_id: this.selectedProvider
    };
    this.entityCommonDataService.setSummeryDataDefault();
    return this.entityCommonDataService.getHistoryDataForProvider(param).pipe(map(res => {
      this.selectedScheduleId = res.basicInfo.formId;
      this.historyData = res;
      this.loadformEntity = true;
      if (_.isEmpty(this.historyData)) {
        this.loadform = false;
      } else if (!this.loadform) {
        this.selectedAppointmentTypes = [];
        this.loadform = true;
        _.map(res.basicInfo.selectedAppointmentTypes, (v) => {
          v.isSelected = true;
          const appointmentType = new AppointmentType();
          if (appointmentType.isObjectValid(v)) {
            appointmentType.generateObject(v);
            this.selectedAppointmentTypes.push(appointmentType);
          }
        });
      }
      this.scheduleMakerService.getLastAppointmentData(param).subscribe(appData => {
        this.lastAppointmentForSchedule = appData.Last_Appointment;
        if (this.lastAppointmentForSchedule) {
          this.lastAppointmentForSchedule.app_date = new Date(moment(this.lastAppointmentForSchedule.app_date, 'DD/MM/YYYY').format('YYYY/MM/DD'));
        }
      });
    }));
  }

  createForm() {
    this.scheduleMakerForm = this.fb.group({
      scheduleMaker: this.fb.array([])
    });
    const serviceTime = this.historyData.basicInfo.appointmentTimeSlot;
    if (this.timeFormateKey === '12_hour') {
      // if (serviceTime === 30 || serviceTime === 90) {
      this.startTimeArray = this.entityCommonDataService.createHoursList12HourFormat(true);
      // } else {
      //   this.startTimeArray = this.entityCommonDataService.createHoursList12HourFormat(false);
      // }
    }
    if (this.timeFormateKey === '24_hour') {
      // if (serviceTime === 30 || serviceTime === 90) {
      this.startTimeArray = this.entityCommonDataService.createHoursList24HourFormat(true);
      // } else {
      //   this.startTimeArray = this.entityCommonDataService.createHoursList24HourFormat(false);
      // }
    }
    this.patchDefaultValue();
  }

  get scheduleMaker() {
    return this.scheduleMakerForm.get('scheduleMaker') as FormArray;
  }

  patchDefaultWeekDaysArray(array) {
    const daysFormArray = [];
    _.map(array, (v, k) => {
      const daysFormObj = {
        name: [v.name],
        key: [v.key],
        isSelected: [v.isSelected]
      };
      const weekDays = new WeekDays();
      if (weekDays.isObjectValid(daysFormObj)) {
        weekDays.generateObject(daysFormObj);
        daysFormArray.push(this.fb.group(weekDays));
      }
    });
    return daysFormArray;
  }

  patchAppointmentTypeFormDefaultValues(fromGroupVal?) {
    let sTime = '09:00 AM';
    let eTime = '09:00 PM';
    if (this.timeFormateKey === '24_hour') {
      sTime = '09:00';
      eTime = '21:00';
    }
    // this.endTimeHoursList = this.generateHoursList(sTime);
    const appointmentTypeTimeFormObj = {
      appointmentType: [null, Validators.required],
      startTime: [sTime, Validators.required],
      endTime: [eTime, Validators.required],
      selectedDays: this.fb.array(this.patchDefaultWeekDaysArray(this.weekDaysArray)),
      subFormStatus: [true],
      allowAppointments: [false],
      formId: [null],
      endTimeHoursList: [this.generateHoursList(sTime)]
    };
    const entityScheduleAppointmentTime = new EntityScheduleAppointmentTime();
    if (entityScheduleAppointmentTime.isObjectValid(appointmentTypeTimeFormObj)) {
      entityScheduleAppointmentTime.generateObject(appointmentTypeTimeFormObj);
    }
    return entityScheduleAppointmentTime;
  }

  patchDefaultValue(startData?) {
    const aryVal = [this.fb.group(this.patchAppointmentTypeFormDefaultValues())];
    const scheduleForm = {
      startDate: [null, Validators.required],
      endDate: [null],
      appointmentTypeTimeArray: this.fb.array(aryVal),
      weekOffDays: this.fb.array(this.patchDefaultWeekDaysArray(this.weekDaysArray)),
      mainFormStatus: [true],
      formId: [null]
    };
    const entitySchedule = new EntitySchedule();
    if (entitySchedule.isObjectValid(scheduleForm)) {
      entitySchedule.generateObject(scheduleForm);
      this.scheduleMaker.push(this.fb.group(entitySchedule));
    }
  }

  checkDuplicatesValue(arrayData) {
    return _.filter(_.map(arrayData, (o, i) => {
      const eq = _.find(arrayData, (e, ind) => {
        if (i > ind) {
          return _.isEqual(e, o);
        }
      });
      if (eq) {
        o.isDuplicate = true;
        return o;
      } else {
        return o;
      }
    }), (val, key) => {
      return val.isDuplicate === true;
    });
  }

  addNewAppointmentTypeArea(parentIndex: number, childIndex: number) {
    const appointmentTypeTimeFormObj = this.patchAppointmentTypeFormDefaultValues();
    const sm = this.scheduleMaker.at(parentIndex) as FormGroup;
    const appointmentTypeTimeArrayForm = sm.get('appointmentTypeTimeArray') as FormArray;
    if (childIndex) {
      const checkTimeValues = appointmentTypeTimeArrayForm.at(childIndex) as FormGroup;
      const sTime = moment(moment().format('YYYY-MM-DD') + ' ' + checkTimeValues.controls['startTime']['value']);
      const eTime = moment(moment().format('YYYY-MM-DD') + ' ' + checkTimeValues.controls['endTime']['value']);

      if (sTime.isSameOrAfter(eTime)) {
        this.alertMsg = {
          message: 'Please Check Start and EndTime!',
          messageType: 'warning',
          duration: Constants.ALERT_DURATION
        };
        checkTimeValues.controls['subFormStatus'].setValue(true);
        sm.patchValue({ mainFormStatus: true });
        this.checkFormIsValidOrNot();
        return;
      }
    }

    const weekOffDays = _.filter(sm.controls.weekOffDays.value, (v, k) => {
      return v.isSelected === true;
    });

    if (appointmentTypeTimeArrayForm.controls.length > 1) {
      const updatedArray = this.checkDuplicatesValue(appointmentTypeTimeArrayForm.value);
      if (updatedArray.length > 0) {
        this.alertMsg = {
          message: 'Have Duplicate Schedule!',
          messageType: 'warning',
          duration: Constants.ALERT_DURATION
        };
        sm.patchValue({ mainFormStatus: true });
      } else {
        if (weekOffDays.length > 0) {
          const weekDayForm = appointmentTypeTimeFormObj['selectedDays']['controls'];
          _.map(weekDayForm, (v, i) => {
            if (this.checkDayIsWeekOff(weekOffDays, v.value)) {
              v.patchValue({ isSelected: false });
              v.disable();
            }
          });
        }
        appointmentTypeTimeArrayForm.push(this.fb.group(appointmentTypeTimeFormObj));
        this.checkFormIsValidOrNot();
      }
    } else {
      if (weekOffDays.length > 0) {
        const weekDayForm = appointmentTypeTimeFormObj['selectedDays']['controls'];
        _.map(weekDayForm, (v, i) => {
          if (this.checkDayIsWeekOff(weekOffDays, v.value)) {
            v.patchValue({ isSelected: false });
            v.disable();
          }
        });
      }
      appointmentTypeTimeArrayForm.push(this.fb.group(appointmentTypeTimeFormObj));
      this.checkFormIsValidOrNot();
    }
  }

  checkTimeValuesOnChange(parentIndex: number, childIndex: number, time?, type?) {

    const sm = this.scheduleMaker.at(parentIndex) as FormGroup;
    const appointmentTypeTimeArrayForm = sm.get('appointmentTypeTimeArray') as FormArray;

    const checkTimeValues = appointmentTypeTimeArrayForm.at(childIndex) as FormGroup;
    if (time && type && type === 'end_time') {
      if (time === 'Mid Night') {
        time = '11:59 PM'; //'12:00 AM';
        if (this.timeFormateKey === '24_hour') {
          time = '23:59';
        }
      }

      checkTimeValues.controls['endTime'].setValue(time);
    }
    if (time && type && type === 'start_time') {
      checkTimeValues.controls['endTimeHoursList'].setValue(this.generateHoursList(time));
      checkTimeValues.controls['startTime'].setValue(time);
      checkTimeValues.controls['endTime'].setValue(checkTimeValues.value.endTimeHoursList.length > 0 ? checkTimeValues.value.endTimeHoursList[0] : '');
    }
    const sTime = moment(moment().format('YYYY-MM-DD') + ' ' + checkTimeValues.controls['startTime']['value']);
    const eTime = moment(moment().format('YYYY-MM-DD') + ' ' + checkTimeValues.controls['endTime']['value']);

    // const checkAppointmentTimeSlot = moment(sTime).add(this.historyData.basicInfo.appointmentTimeSlot, 'minutes');
    if (sTime.isAfter(eTime)) {
      this.alertMsg = {
        message: 'Please Check Start and EndTime!',
        messageType: 'warning',
        duration: Constants.ALERT_DURATION
      };
      checkTimeValues.controls['subFormStatus'].setValue(true);
      sm.patchValue({ mainFormStatus: true });
      return;
    } else {
      // if (checkAppointmentTimeSlot.isAfter(eTime)) {
      //   this.alertMsg = {
      //     message: 'Please check service time',
      //     messageType: 'warning',
      //     duration: 3000
      //   };
      //   checkTimeValues.controls['subFormStatus'].setValue(true);
      //   sm.patchValue({ mainFormStatus: true });
      //   return;
      // } else {
      checkTimeValues.controls['subFormStatus'].setValue(false);
      // }
    }
    this.checkFormIsValidOrNot();
  }

  deleteAppointmentTypeArea(parentIndex: number, childIndex: number) {

    const sm = this.scheduleMaker.at(parentIndex) as FormGroup;
    const appointmentTypeTimeArrayForm = sm.get('appointmentTypeTimeArray') as FormArray;
    if (appointmentTypeTimeArrayForm) {
      const formValues = appointmentTypeTimeArrayForm.controls[childIndex]['value'];
      if (formValues.formId) {
        const param = {
          title: 'Confirm',
          body: 'Do you want to delete?',
          formDeleteObj: formValues,
          formType: 'appointment_type',
          formIndex: {
            main: parentIndex,
            sub: childIndex
          }
        };
        this.checkConfirmation(param);
        // appointmentTypeTimeArrayForm.removeAt(childIndex);
      } else {
        appointmentTypeTimeArrayForm.removeAt(childIndex);
      }
    }
    if (appointmentTypeTimeArrayForm.controls.length === 0) {
      const appointmentTypeTimeFormObj = this.fb.group(this.patchAppointmentTypeFormDefaultValues());
      appointmentTypeTimeArrayForm.push(appointmentTypeTimeFormObj);
      // check if weekoff selected
      const weekOff = _.filter(sm.value.weekOffDays, (v) => {
        return v.isSelected === true;
      });
      if (weekOff.length > 0) {
        // update in selected day list
        _.map(weekOff, (v) => {
          _.map(appointmentTypeTimeArrayForm.controls, (typeForm, index) => {
            const dayForm = typeForm.controls.selectedDays.controls;
            _.map(dayForm, (d, k) => {
              if (d.value.key === v.key && v.isSelected) {
                d.patchValue({ isSelected: false });
                d.disable();
              } else if (d.value.key === v.key) {
                d.enable();
              }
            });
          });
        })
      }
    }
    this.checkFormIsValidOrNot();
  }

  addNewDateArea(parentIndex: number) {
    const sm = this.scheduleMaker.at(parentIndex) as FormGroup;
    const endDate = sm.get('endDate')['value'];
    if (endDate) {
      this.patchDefaultValue();
    } else {
      this.alertMsg = {
        message: 'Please Select End Date!',
        messageType: 'warning',
        duration: Constants.ALERT_DURATION
      };
    }
    this.checkFormIsValidOrNot();
  }

  deleteSelectedDateArea(index) {
    const formValues = this.scheduleMaker.controls[index]['value'];
    if (formValues.formId) {
      const param = {
        title: 'Confirm',
        body: 'Do you want to delete?',
        formDeleteObj: formValues,
        formType: 'date_area',
        formIndex: {
          main: index,
          sub: null
        }
      };
      this.checkConfirmation(param);
      // this.scheduleMaker.removeAt(index);
    } else {
      this.isDeleteEnableForDate = false;
      this.scheduleMaker.removeAt(index);
    }
    if (this.scheduleMaker.controls.length <= 0) {
      this.patchDefaultValue();
    }
    this.checkFormIsValidOrNot();
  }

  updateDaysValues(array, key, object) {
    let retObj = {};
    if (key === 'none') {
      retObj = {
        name: object.name,
        key: object.key,
        isSelected: false
      };
    } else {
      if (array.includes(key)) {
        retObj = {
          name: object.name,
          key: object.key,
          isSelected: true
        };
      } else {
        retObj = {
          name: object.name,
          key: object.key,
          isSelected: false
        };
      }
    }
    return retObj;
  }

  checkDayIsWeekOff(weekOffDays, checkFor) {
    const checkIndx = _.findIndex(weekOffDays, (v, k) => {
      return v.key === checkFor.key;
    });
    if (checkIndx !== -1) {
      return true;
    } else {
      return false;
    }
  }

  checkForSameTimeScheduleCurrent(parentIndex: number, childIndex: number, dayObj) {
    this.nextButtonDisableStatus = false;
    const sm = this.scheduleMaker.at(parentIndex) as FormGroup;
    const appointmentTypeTimeArrayForm = sm.get('appointmentTypeTimeArray') as FormArray;
    if (appointmentTypeTimeArrayForm.controls.length > 1) {
      const selectedType = appointmentTypeTimeArrayForm.at(childIndex).get('appointmentType')['value'];
      let sTime = appointmentTypeTimeArrayForm.at(childIndex).get('startTime')['value'];
      let eTime = appointmentTypeTimeArrayForm.at(childIndex).get('endTime')['value'];
      sTime = moment(moment().format('YYYY-MM-DD') + ' ' + sTime);
      eTime = moment(moment().format('YYYY-MM-DD') + ' ' + eTime);
      const dayArray = appointmentTypeTimeArrayForm.at(childIndex).get('selectedDays')['controls'];
      let checkExist = false;
      _.map(appointmentTypeTimeArrayForm.controls, (fAry, fKey) => {
        _.map(fAry.get('selectedDays')['controls'], (v, k) => {
          let sTimeLoop = fAry.value.startTime;
          let eTimeLoop = fAry.value.endTime;
          sTimeLoop = moment(moment().format('YYYY-MM-DD') + ' ' + sTimeLoop);
          eTimeLoop = moment(moment().format('YYYY-MM-DD') + ' ' + eTimeLoop);
          if (fKey !== childIndex && v.value.isSelected
            && v.value.key === dayObj.key
            && (((sTime.isBetween(sTimeLoop, eTimeLoop, null, '()'))
              || (eTime.isBetween(sTimeLoop, eTimeLoop, null, '()')))
              || ((sTime.isSame(sTimeLoop)
                || eTime.isSame(eTimeLoop))
              ))) {
            checkExist = true;
          }
        });
      });
      if (checkExist) {
        _.map(dayArray, (v, k) => {
          if (v.value.key === dayObj.key) {
            v.patchValue({ isSelected: false });
            this.alertMsg = {
              message: 'Schedule Already Exist!',
              messageType: 'warning',
              duration: Constants.ALERT_DURATION
            };
            this.nextButtonDisableStatus = true;
          }
        });
      }
    }
    this.checkFormIsValidOrNot();
  }

  checkDaysSelectionForAppType(parentIndex, childIndex) {
    const sm = this.scheduleMaker.at(parentIndex) as FormGroup;
    const appointmentTypeTimeArrayForm = sm.get('appointmentTypeTimeArray') as FormArray;
    let disableDropDown = false;
    if (appointmentTypeTimeArrayForm) {
      _.map(appointmentTypeTimeArrayForm.at(childIndex).get('selectedDays')['controls'], (v, k) => {
        if (v.value.isSelected) {
          disableDropDown = true;
        }
      });
    }
    this.checkFormIsValidOrNot();
    return disableDropDown;
  }

  checkDateVAlues(formValues, formIndex) {
    if (!_.isDate(formValues[formIndex]['startDate'])) {
      this.alertMsg = {
        message: 'Check Start Dates',
        messageType: 'warning',
        duration: Constants.ALERT_DURATION
      };
      return false;
    }
    if (formValues[formIndex]['endDate']) {
      const sDate = moment(moment(formValues[formIndex]['startDate']).format('YYYY/MM/DD'));
      const eDate = moment(moment(formValues[formIndex]['endDate']).format('YYYY/MM/DD'));
      if (sDate.isAfter(eDate)) {
        this.alertMsg = {
          message: 'Check Start, End Dates',
          messageType: 'warning',
          duration: Constants.ALERT_DURATION
        };
        return false;
      } else {
        return true;
      }
    } else {
      return true;
    }
  }

  checkInFutureScheduleEndDateExist(checkDate, startDate) {
    let status = false;
    const scheduledata = _.filter(this.historyData.scheduleData, dt => {
      return (((moment(dt.startDate).isAfter(moment(checkDate)) ||
        moment(dt.endDate).isAfter(moment(checkDate))
      ))
      );
    });
    if (scheduledata.length > 0) {
      const checkData = _.filter(scheduledata, dt => {
        return (moment(checkDate).isBetween(moment(dt.startDate), moment(dt.endDate), null, '[]'));
      });
      if (checkData.length > 0) {
        status = true;
      } else {
        status = false;
      }
    } else {
      status = false;
    }
    const betweenEndDatsSchedule = _.filter(this.historyData.scheduleData, dt => {
      return (((moment(dt.startDate).isBetween(moment(startDate), moment(checkDate), null, '[]'))
        || ((moment(dt.endDate).isBetween(moment(startDate), moment(checkDate), null, '[]')))
      ));
    });
    if (betweenEndDatsSchedule.length > 0) {
      status = true;
    } else {
      status = false;
    }
    return status;
  }

  checkDateExistInOther(parentIndex: number, date, type: string) {
    this.isDeleteEnableForDate = false;
    if (type !== 'end_date') {
      this.patchStartEndDate(parentIndex, 'startDate', date);
    } else {
      this.patchStartEndDate(parentIndex, 'endDate', date);
    }
    const allFormVal = this.scheduleMakerForm.controls;
    // check start date should less then end date
    const returnHere = this.checkDateVAlues(allFormVal.scheduleMaker.value, parentIndex);
    if (!returnHere) {
      return;
    }
    let dateExist = false;
    const cDate = moment(moment(date).format('YYYY-MM-DD'));
    // check in current form
    _.map(allFormVal['scheduleMaker']['controls'], (mForm, pKey) => {
      if (pKey !== parentIndex) {
        const sDate = moment(mForm['value']['startDate']);
        const eDate = mForm['value']['endDate'] ? moment(mForm['value']['endDate']) : sDate;
        if (cDate.isBetween(sDate, eDate, null, '[]')) {
          dateExist = true;
        }
      }
    });
    let messageDisplay = '';
    // check in history if exist
    if (!_.isEmpty(this.historyData) && this.disableAllFormValForEditMode !== 'edit_existing') {
      const scheduleData = this.historyData.scheduleData;
      _.map(scheduleData, (dateVal) => {
        const sDate = moment(dateVal['startDate']);
        const eDate = dateVal['endDate'] ? moment(dateVal['endDate']) : null;
        if (this.globalScheduleMode === 'edit') {
          if (!eDate && moment(cDate).isSameOrAfter(sDate)) {
            dateExist = true;
          } else if (cDate.isBetween(sDate, eDate, null, '[]') && dateVal.formId !== allFormVal['scheduleMaker']['value'][parentIndex].formId) {
            dateExist = true;
          }
        } else {
          if (!eDate && moment(cDate).isSameOrAfter(sDate)) {
            dateExist = true;
          } else if (moment(cDate).isBetween(sDate, eDate, null, '[]')) {
            dateExist = true;
          }
        }
      });
      messageDisplay = 'Date Already Exist!';
    }
    const sDate = allFormVal.scheduleMaker.value[parentIndex].startDate;
    const eDate = allFormVal.scheduleMaker.value[parentIndex].endDate;
    if (type === 'end_date' && !dateExist && this.disableAllFormValForEditMode !== 'edit_existing') {
      dateExist = this.checkInFutureScheduleEndDateExist(date, sDate);
      if (dateExist) {
        messageDisplay = 'Date Overlapped!';
      }
    }
    if (dateExist) {
      this.alertMsg = {
        message: messageDisplay,
        messageType: 'warning',
        duration: Constants.ALERT_DURATION
      };
      if (this.globalScheduleMode === 'edit') {
        const prvDataIndx = _.findIndex(this.historyData.scheduleData, (fv) => {
          return fv.formId === allFormVal['scheduleMaker']['value'][parentIndex].formId;
        });
        if (type !== 'end_date') {
          this.patchStartEndDate(parentIndex, 'startDate', this.historyData.scheduleData[prvDataIndx]['startDate']);
        }
        this.patchStartEndDate(parentIndex, 'endDate', this.historyData.scheduleData[prvDataIndx]['endDate']);
      } else {
        this.startDatePatchVal = this.startDatePatchVal === '' ? null : '';
        this.endDatePatchVal = this.endDatePatchVal === '' ? null : '';
        if (type !== 'end_date') {
          this.patchStartEndDate(parentIndex, 'startDate', this.startDatePatchVal);
        }
        this.patchStartEndDate(parentIndex, 'endDate', this.endDatePatchVal);
      }
    } else {
      this.isDeleteEnableForDate = true;
    }
    this.checkFormIsValidOrNot();
  }

  patchStartEndDate(parentIndex, type, dataUpdate) {
    const allFormVal = this.scheduleMakerForm.controls;
    if (type === 'endDate') {
      allFormVal['scheduleMaker']['controls'][parentIndex].patchValue({ endDate: dataUpdate });
    } else {
      allFormVal['scheduleMaker']['controls'][parentIndex].patchValue({ startDate: dataUpdate });
    }
    allFormVal['scheduleMaker']['controls'][parentIndex].patchValue({ mainFormStatus: true });
  }

  checkDayisSelected(allFormVal) {
    let checkDaySelected = true;
    _.map(allFormVal.scheduleMaker, (dv) => {
      if (checkDaySelected) {
        _.map(dv.appointmentTypeTimeArray, (tv) => {
          const checkDaySelectedCount = _.filter(tv.selectedDays, (dyv) => {
            return dyv.isSelected === true;
          });
          if (checkDaySelectedCount.length === 0) {
            checkDaySelected = false;
          }
        });
      }
    });
    return checkDaySelected;
  }

  checkForFutureSchedule(allFormVal) {
    let status = false;
    const noEndDateData = _.filter(allFormVal.scheduleMaker, (dv) => {
      return !_.isDate(dv.endDate);
    });
    if (noEndDateData.length > 0) {
      // get all schedule which end date is greater then current start date
      const futureSchedule = _.filter(this.historyData.scheduleData, data => {
        return moment(noEndDateData[0].startDate).isSameOrBefore(moment(data.endDate));
      });
      if (futureSchedule.length > 0) {
        status = true;
      }
    }
    return status;
  }

  checkAppointmentType(allFormVal) {
    let appointmentSelected = true;
    _.map(allFormVal.scheduleMaker, (dv) => {
      _.map(dv.appointmentTypeTimeArray, (tv) => {
        if (tv.appointmentType === null) {
          appointmentSelected = false
          return appointmentSelected;
        }
      });
    });
    return appointmentSelected;
  }

  saveScheduleData() {
    const allFormVal = this.scheduleMakerForm.value;
    const checkAllSubFormStatus = _.filter(allFormVal, (subFrmStatus, keyStatus) => {
      return subFrmStatus.mainFormStatus === true;
    });
    if (checkAllSubFormStatus.length > 0) {
      this.alertMsg = {
        message: 'Check Schedule!',
        messageType: 'warning',
        duration: Constants.ALERT_DURATION
      };
      return;
    }
    //check if appointment type is selected
    if (!this.checkAppointmentType(allFormVal)) {
      this.alertMsg = {
        message: "Please Select Appointment Type!",
        messageType: "warning",
        duration: Constants.ALERT_DURATION
      };
      return;
    }


    // check if not selected day in any schedule
    if (!this.checkDayisSelected(allFormVal)) {
      this.alertMsg = {
        message: "Please Select Day!",
        messageType: "warning",
        duration: Constants.ALERT_DURATION
      };
      return;
    }
    console.log("globalMode " + this.globalScheduleMode)
    // check if not selected end date and have future schedule
    if (this.globalScheduleMode === 'add' && !_.isEmpty(this.historyData) && this.historyData.scheduleData.length) {
      const status = this.checkForFutureSchedule(allFormVal);
      if (status) {
        this.alertMsg = {
          message: 'Please Select End date, Already Have Future Schedule!',
          messageType: 'warning',
          duration: Constants.ALERT_DURATION
        };
        return;
      }
    }
    if (this.disableAllFormValForEditMode === 'edit_existing') {
      this.scheduleEndWhenEdit().subscribe(res => {
        if (res) {
          this.saveScheduleDataAfterCheck(allFormVal);
        }
      });
    } else {
      this.saveScheduleDataAfterCheck(allFormVal);
    }

  }

  saveScheduleDataAfterCheck(allFormVal) {

    const saveFormVal = {
      sch_data: this.entityCommonDataService.getTimeScheduleData(
        allFormVal.scheduleMaker
      ),
      ScheduleConfigId: this.selectedScheduleId
    };
    this.scheduleMakerService.saveEditTimeScheduleData(saveFormVal).subscribe(res => {
      if (res) {
        this.entityCommonDataService.setSummeryDataDefault();
        this.alertMsg = {
          message: 'Setting Saved. Appointment slots will be created shortly.',
          messageType: 'success',
          duration: Constants.ALERT_DURATION
        };
        const param = {
          title: 'Confirm',
          body: 'Do you want to map room with this new schedule ?',
          buttonType: 'yes_no',
          formDeleteObj: null,
          formType: 'room_mapping',
          isShowCrossIcon: false,
          formIndex: {
            main: 0,
            sub: null
          }
        };
        this.checkConfirmation(param);
        // setTimeout(() => {
        //   this.backToActiveScheduleList();
        // }, 3000);
      } else {
        this.alertMsg = {
          message: 'Schedule Time is not range of Patient Communication Time!',
          messageType: 'warning',
          duration: Constants.ALERT_DURATION
        };
      }
    });
  }

  scheduleEndWhenEdit(): Observable<any> {
    const param = {
      entity_id: this.selectedEntity,
      entity_value_id: this.selectedProvider
    };
    return this.scheduleMakerService.endAllSchedule(param).pipe(map(res => {
      return res;
    }));
  }

  checkScheduleExistInScheduleData(scheduleArray, index, dayCheck, sData, eDate, dateFormId) {
    let sTime = scheduleArray[index]['startTime'];
    let eTime = scheduleArray[index]['endTime'];
    sTime = moment(moment().format('YYYY-MM-DD') + ' ' + sTime);
    eTime = moment(moment().format('YYYY-MM-DD') + ' ' + eTime);
    let status = false;
    _.map(scheduleArray, (fAry, fKey) => {
      _.map(fAry.selectedDays, (v, k) => {
        let sTimeLoop = fAry.startTime;
        let eTimeLoop = fAry.endTime;
        sTimeLoop = moment(moment().format('YYYY-MM-DD') + ' ' + sTimeLoop);
        eTimeLoop = moment(moment().format('YYYY-MM-DD') + ' ' + eTimeLoop);
        if (fKey !== index && v.isSelected
          && v.key === dayCheck.key
          && (((sTime.isBetween(sTimeLoop, eTimeLoop, null, '()'))
            || (eTime.isBetween(sTimeLoop, eTimeLoop, null, '()')))
            || ((sTime.isSame(sTimeLoop)
              || eTime.isSame(eTimeLoop))
            ))) {
          this.alertMsg = {
            message: 'Time is overlapping..!',
            messageType: 'warning',
            duration: Constants.ALERT_DURATION
          };
          status = true;
        }
      });
    });
    if (!status) {
      // check in saved active schedule
      if (this.historyData.scheduleData.length > 0) {
        const savedActiveSchedule = this.historyData.scheduleData;
        if (savedActiveSchedule.length > 0) {
          status = this.checkScheduleExistInSavedActiveScheduleData(scheduleArray, index, dayCheck, sData, eDate, dateFormId);
        }
      }
    }
    return status;
  }

  checkScheduleExistInSavedActiveScheduleData(scheduleArray, index, dayCheck, sData, eDate, dateFormId?) {
    // check in saved active schedule
    eDate = eDate || moment();
    dateFormId = dateFormId || null;
    let status = false;
    if (this.historyData.scheduleData.length > 0 && this.disableAllFormValForEditMode !== 'edit_existing') {
      const savedActiveSchedule = this.historyData.scheduleData;
      if (this.globalScheduleMode === 'add') {
        _.map(savedActiveSchedule, (activeSche) => {
          const startDate = moment(activeSche.startDate);
          const endDate = activeSche.endDate ? moment(activeSche.endDate) : moment();
          if (startDate.isBetween(sData, eDate, null, '[]') || endDate.isBetween(sData, eDate, null, '[]')) {
            let sTime = scheduleArray[index]['startTime'];
            let eTime = scheduleArray[index]['endTime'];
            const appType = scheduleArray[index]['appointmentType'];
            sTime = moment(moment().format('YYYY-MM-DD') + ' ' + sTime);
            eTime = moment(moment().format('YYYY-MM-DD') + ' ' + eTime);

            _.map(activeSche.appointmentTypeTimeArray, (appTypeData) => {
              let sTimeActive = appTypeData['startTime'];
              let eTimeActive = appTypeData['endTime'];
              const appTypeActive = appTypeData['appointmentType'];
              sTimeActive = moment(moment().format('YYYY-MM-DD') + ' ' + sTimeActive);
              eTimeActive = moment(moment().format('YYYY-MM-DD') + ' ' + eTimeActive);
              const getSelectedDays = _.filter(appTypeData.selectedDays, (d) => {
                return d.isSelected && d.key === dayCheck.key;
              });
              if ((sTime.isBetween(sTimeActive, eTimeActive, null, '[]')
                || eTime.isBetween(sTimeActive, eTimeActive, null, '[]'))
                && _.toNumber(appType.id) === _.toNumber(appTypeActive.id) && getSelectedDays.length === 1) {
                status = false;
              }
            });
          }
        });
      } else {
        const formCheckIndex = _.findIndex(savedActiveSchedule, (fv) => {
          return fv.formId === dateFormId;
        });
        _.map(savedActiveSchedule, (activeSche, activeIndx) => {
          if (activeIndx !== formCheckIndex) {
            const startDate = moment(activeSche.startDate);
            const endDate = activeSche.endDate ? moment(activeSche.endDate) : moment();
            if (startDate.isBetween(sData, eDate, null, '[]') || endDate.isBetween(sData, eDate, null, '[]')) {
              let sTime = scheduleArray[index]['startTime'];
              let eTime = scheduleArray[index]['endTime'];
              const appType = scheduleArray[index]['appointmentType'];
              sTime = moment(moment().format('YYYY-MM-DD') + ' ' + sTime);
              eTime = moment(moment().format('YYYY-MM-DD') + ' ' + eTime);

              _.map(activeSche.appointmentTypeTimeArray, (appTypeData) => {
                let sTimeActive = appTypeData['startTime'];
                let eTimeActive = appTypeData['endTime'];
                const appTypeActive = appTypeData['appointmentType'];
                sTimeActive = moment(moment().format('YYYY-MM-DD') + ' ' + sTimeActive);
                eTimeActive = moment(moment().format('YYYY-MM-DD') + ' ' + eTimeActive);
                const getSelectedDays = _.filter(appTypeData.selectedDays, (d) => {
                  return d.isSelected && d.key === dayCheck.key;
                });
                if ((sTime.isBetween(sTimeActive, eTimeActive, null, '[]')
                  || eTime.isBetween(sTimeActive, eTimeActive, null, '[]'))
                  && _.toNumber(appType.id) === _.toNumber(appTypeActive.id) && getSelectedDays.length === 1) {
                  status = true;
                }
              });
            }
          }
        });
      }
    }
    return status;
  }

  checkFormIsValidOrNot() {
    this.nextButtonDisableStatus = false;
    const allFormVal = this.scheduleMakerForm.controls;
    const mainObjLength = allFormVal['scheduleMaker']['controls'].length;
    const index = allFormVal.scheduleMaker.value[0].appointmentTypeTimeArray.length;
    if (allFormVal.scheduleMaker.value[0].appointmentTypeTimeArray[index - 1].appointmentType !== null) {
      this.isDeleteEnable = true;
    } else {
      this.isDeleteEnable = false;
    }
    _.map(allFormVal['scheduleMaker']['controls'], (mForm, pKey) => {
      const startDate = mForm.controls['startDate'].value ? moment(mForm.controls['startDate'].value) : null;
      const endDate = mForm.controls['endDate'].value ? moment(mForm.controls['endDate'].value) : null;
      const weekOffDays = _.find(mForm.controls['weekOffDays'].value, (v) => {
        return v.isSelected === true;
      });
      const dateFormId = mForm.value.formId;
      const subFormVal = mForm.controls.appointmentTypeTimeArray;
      const subObjLength = subFormVal.controls.length;

      // check in current schedule
      _.map(subFormVal.controls, (sForm, cKey) => {
        const formValues = sForm.controls;
        const selectedDays = formValues.selectedDays.value;
        const checkDaySelection = _.filter(selectedDays, (selVal, selKey) => {
          return selVal.isSelected === true;
        });
        if (subObjLength > 1) {
          _.map(checkDaySelection, (dayCheck, dayKey) => {
            if (this.checkScheduleExistInScheduleData(subFormVal.value, cKey, dayCheck, startDate, endDate, dateFormId)) {
              allFormVal['scheduleMaker']['controls'][pKey].patchValue({ mainFormStatus: true });
              allFormVal['scheduleMaker']['controls'][pKey]['controls']['appointmentTypeTimeArray']['controls'][cKey].patchValue({ subFormStatus: true });
              // this.alertMsg = {
              //   message: 'Schedule Already Exist!',
              //   messageType: 'warning',
              //   duration: Constants.ALERT_DURATION
              // };
              // this.nextButtonDisableStatus = true;
            }
          });
        } else {
          _.map(checkDaySelection, (dayCheck, dayKey) => {
            if (this.checkScheduleExistInSavedActiveScheduleData(subFormVal.value, cKey, dayCheck, startDate, endDate, dateFormId)) {
              allFormVal['scheduleMaker']['controls'][pKey].patchValue({ mainFormStatus: true });
              allFormVal['scheduleMaker']['controls'][pKey]['controls']['appointmentTypeTimeArray']['controls'][cKey].patchValue({ subFormStatus: true });
              // this.alertMsg = {
              //   message: 'Schedule Already Exist!',
              //   messageType: 'warning',
              //   duration: Constants.ALERT_DURATION
              // };
              // this.nextButtonDisableStatus = true;
            }
          });
        }
      });

      _.map(subFormVal.controls, (sForm, cKey) => {
        const formValues = sForm.controls;
        const appointmentType = formValues.appointmentType.value;
        const endTime = formValues.endTime.value;
        const selectedDays = formValues.selectedDays.value;
        const startTime = formValues.startTime.value;
        const checkDaySelection = _.filter(selectedDays, (selVal, selKey) => {
          return selVal.isSelected === true;
        });
        const sTime = moment(moment().format('YYYY-MM-DD') + ' ' + startTime);
        const eTime = moment(moment().format('YYYY-MM-DD') + ' ' + endTime);
        if (checkDaySelection.length > 0 && appointmentType && endTime && startTime && !(sTime.isSameOrAfter(eTime))) {
          sForm.patchValue({ subFormStatus: false });
        } else {
          sForm.patchValue({ subFormStatus: true });
        }
      });
      const checkAllSubFormStatus = _.filter(mForm['value']['appointmentTypeTimeArray'], (subFrmStatus, keyStatus) => {
        return subFrmStatus.subFormStatus === false;
      });
      if (checkAllSubFormStatus.length > 0) {
        mForm.patchValue({ mainFormStatus: false });
      } else {
        mForm.patchValue({ mainFormStatus: true });
      }
      if (!startDate) {
        allFormVal['scheduleMaker']['controls'][pKey].patchValue({ mainFormStatus: true });
      }
    });

    this.clearButtonStatus = !this.checkClearFormStatus();

    // const nextBtnStatus = _.filter(allFormVal['scheduleMaker']['value'], (v, k) => {
    //   return v.mainFormStatus === true;
    // });
    // if (nextBtnStatus.length > 0) {
    //   this.nextButtonDisableStatus = true;
    //   // this.entityCommonDataService.onStepScheduleEnableRulesAndInstructionSteps(false);
    // } else {
    //   this.nextButtonDisableStatus = false;
    //   // this.entityCommonDataService.onStepScheduleEnableRulesAndInstructionSteps(true);
    // }
  }

  saveAndExitScheduleData() {
    this.entityCommonDataService.saveAllEntityData().subscribe(res => {
      if (res) {
        this.alertMsg = {
          message: 'Data Saved!',
          messageType: 'success',
          duration: Constants.ALERT_DURATION
        };
        this.backToActiveScheduleList();
      }
    });
  }

  openConfirmationPoup() {
    const allFormVal = this.scheduleMakerForm.value;
    const checkAllSubFormStatus = _.filter(allFormVal, (subFrmStatus, keyStatus) => {
      return subFrmStatus.mainFormStatus === true;
    });
    if (checkAllSubFormStatus.length > 0) {
      this.alertMsg = {
        message: 'Check Schedule!',
        messageType: 'warning',
        duration: Constants.ALERT_DURATION
      };
    } else {
      // this.entityCommonDataService.updateScheduleDataValue(allFormVal.scheduleMaker);
    }
    const messageDetails = {
      modalTitle: 'Confirm',
      modalBody: 'Do you want to save and exit now!'
    };
    const modalInstance = this.confirmationModalService.open(ConfirmationPopupComponent, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false
    });
    modalInstance.result.then((result) => {
      if (result === 'no') {

      } else {
        this.saveAndExitScheduleData();
      }
    }, (reason) => {

    });
    modalInstance.componentInstance.messageDetails = messageDetails;
  }

  subcriptionOfEvents() {
    // this.updateFormValuesForEdit();
    this.updateSelectedAppointmentTypeOnProviderChange();
    // if performe any operation on time schedule componenet
    this.updateHistoryDataAfterTimeOperation();
  }

  updateAllDaysCheckBoxValForSection(offDay, i: number) {
    const sm = this.scheduleMaker.at(i) as FormGroup;
    const appointmentTypeTimeArrayForm = sm.get('appointmentTypeTimeArray') as FormArray;
    const selectedDayData = _.filter(_.map(appointmentTypeTimeArrayForm.value, (v, k) => {
      const data = _.filter(_.map(v.selectedDays, (d) => {
        return (d.isSelected === true && d.key === offDay.key) ? d.key : null;
      }), (val) => {
        return val != null;
      });
      return data.length > 0 ? data[0] : null;
    }), (cv) => {
      return cv != null;
    });
    if (selectedDayData.length === 0) {
      _.map(appointmentTypeTimeArrayForm.controls, (typeForm, index) => {
        const dayForm = typeForm.controls.selectedDays.controls;
        _.map(dayForm, (d, k) => {
          if (d.value.key === offDay.key && offDay.isSelected) {
            d.patchValue({ isSelected: false });
            d.disable();
          } else if (d.value.key === offDay.key) {
            d.enable();
          }
        });
      });
      this.checkFormIsValidOrNot();
    } else {
      const messageDetails = {
        modalTitle: 'Confirm',
        modalBody: 'Working day is already selected. <br>Do you want to <b>deselect and mark as weekly off?</b>',
        buttonType: 'yes_no'
      };
      const modalInstance = this.confirmationModalService.open(ConfirmationPopupComponent, {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false
      });
      modalInstance.result.then((result) => {
        if (result === 'yes') {
          _.map(appointmentTypeTimeArrayForm.controls, (typeForm, index) => {
            const dayForm = typeForm.controls.selectedDays.controls;
            _.map(dayForm, (d, k) => {
              if (d.value.key === offDay.key && offDay.isSelected) {
                d.patchValue({ isSelected: false });
                d.disable();
              } else if (d.value.key === offDay.key) {
                d.enable();
              }
            });
          });
          this.checkFormIsValidOrNot();
        } else {
          _.map(sm.controls.weekOffDays['controls'], (fVal, key) => {
            if (fVal.value.key === offDay.key) {
              fVal.patchValue({ isSelected: false });
            }
          });
          this.checkFormIsValidOrNot();
        }
      }, (reason) => {
        console.log('asdasdas');
      });
      modalInstance.componentInstance.messageDetails = messageDetails;
    }

  }



  checkConfirmation(modalObj) {
    const messageDetails = {
      modalTitle: modalObj.title,
      modalBody: modalObj.body,
      buttonType: modalObj.buttonType ? modalObj.buttonType : '',
      isShowCrossIcon: modalObj.isShowCrossIcon !== undefined ? modalObj.isShowCrossIcon : true
    };
    const modalInstance = this.confirmationModalService.open(ConfirmationPopupComponent, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false
    });
    modalInstance.result.then((result) => {
      if (modalObj.buttonType === 'yes_no' && modalObj.formType === 'room_mapping') {
        if (result === 'no') {
          this.backToActiveScheduleList();
        } else {
          this.entityBasicInfoService.activeScheduleDataForEdit['routingFlag'] = 'room_mapping';
          this.router.navigate(['/app/qms/entityRoomMap']);
        }
      } else if (result !== 'Ok') {
        return false;
      } else {
        this.isDeleteEnableForDate = false;
        if (modalObj.formType === 'appointment_type') {
          this.deleteAppoitmentTypeAreaAfterConfirm(modalObj);
        } else if (modalObj.formType === 'date_area') {
          this.deleteDateRangeAfterConfirm(modalObj);
        } else if (modalObj.formType === 'edit_appointment') {
          this.disableAllFormValForEditMode = modalObj.formDeleteObj.typeEdit;
          this.entityCommonDataService.activeEditTimeScheduleIndex = modalObj.formDeleteObj.index;
          this.entityCommonDataService.enableDisableEditButtons(this.entityCommonDataService.activeEditTimeScheduleIndex);
          this.scheduleMaker.removeAt(modalObj.formIndex.main);
          if (this.scheduleMaker.controls.length <= 0) {
            this.patchDefaultValue();
          }
          this.editAppointmentDateTimeSchedule(modalObj.formDeleteObj.data);
        } else if (modalObj.formType === 'active_schedule') {
          this.backToActiveScheduleList();
        } else if (modalObj.formType === 'clear_form') {
          this.clearAllFormValues();
        }
      }
    }, (reason) => {
      return false;
    });
    modalInstance.componentInstance.messageDetails = messageDetails;
  }

  deleteAppoitmentTypeAreaAfterConfirm(obj) {
    const formId = obj.formDeleteObj.formId;
    this.entityCommonDataService.deleteAppointmentTypeScheduleData(formId).subscribe(res => {
      this.alertMsg = {
        message: res,
        messageType: 'success',
        duration: Constants.ALERT_DURATION
      };
      if (res) {
        const sm = this.scheduleMaker.at(obj.formIndex) as FormGroup;
        const appointmentTypeTimeArrayForm = sm.get('appointmentTypeTimeArray') as FormArray;
        appointmentTypeTimeArrayForm.removeAt(obj.formSubIndex);
      }
    });
  }

  deleteDateRangeAfterConfirm(obj) {
    const formId = obj.formDeleteObj.formId;
    this.entityCommonDataService.deleteDateRangeScheduleData(formId).subscribe(res => {
      this.alertMsg = {
        message: res,
        messageType: 'success',
        duration: Constants.ALERT_DURATION
      };
      if (res) {
        this.scheduleMaker.removeAt(obj.formIndex);
      }
    });
  }

  updateSelectedAppointmentTypeOnProviderChange() {
    this.entityCommonDataService.$subcBasicInforServiceProviderChangeGetHistory.pipe(takeUntil(this.destroy$)).subscribe(data => {
      this.globalScheduleMode = this.entityCommonDataService.globalScheduleMode;
      this.historyData = {};
      this.selectedAppointmentTypes = [];
      if (!_.isEmpty(this.entityCommonDataService.historyData)) {
        this.historyData = this.entityCommonDataService.historyData;
        if (this.selectedAppointmentTypes.length !== this.historyData.basicInfo.selectedAppointmentTypes.length) {
          this.selectedAppointmentTypes = [];
          _.map(this.historyData.basicInfo.selectedAppointmentTypes, (v) => {
            v.isSelected = true;
            const appointmentType = new AppointmentType();
            if (appointmentType.isObjectValid(v)) {
              appointmentType.generateObject(v);
              this.selectedAppointmentTypes.push(appointmentType);
            }
          });
        }
      }
    });
  }

  updateFormValuesForEdit(data) {
    if (data.key === 'schedule') {
      const allFormVal = this.scheduleMakerForm.controls.scheduleMaker['controls'];
      if (this.entityCommonDataService.scheduleDateTimeScheduleMode === 'add') {
        let checkHaveNewData = false;
        if (allFormVal.length === 1) {
          const formVal = allFormVal[0].value;
          checkHaveNewData = (formVal.formId == null
            && formVal.endDate == null
            && (_.filter(formVal.weekOffDays, (wd) => {
              return wd === true;
            })).length === 0
            && formVal.appointmentTypeTimeArray.length === 1
            && formVal.appointmentTypeTimeArray[0].appointmentType == null
            && (_.filter(formVal.appointmentTypeTimeArray[0].selectedDays, (wd) => {
              return wd === true;
            })).length === 0
            && formVal.appointmentTypeTimeArray[0].allowAppointments === false) ? false : true;
        } else {
          checkHaveNewData = true;
        }
        if (checkHaveNewData) {
          const param = {
            title: 'Confirm',
            body: 'Do you want to continue with selected Schedule?',
            formDeleteObj: data,
            formType: 'edit_appointment',
            formIndex: {
              main: 0,
              sub: null
            }
          };
          this.checkConfirmation(param);
        } else {
          this.globalScheduleMode = 'edit';
          this.disableAllFormValForEditMode = data.typeEdit;
          this.entityCommonDataService.scheduleDateTimeScheduleMode = 'edit';
          this.editAppointmentDateTimeSchedule(data.data);
          this.entityCommonDataService.activeEditTimeScheduleIndex = data.index;
          this.entityCommonDataService.enableDisableEditButtons(this.entityCommonDataService.activeEditTimeScheduleIndex);

        }
      } else {
        const findIndexVal = _.findIndex(allFormVal, (v) => {
          return _.toNumber(v.value.formId) === _.toNumber(data.data.formId);
        });
        if (findIndexVal === -1 && this.globalScheduleMode !== 'edit') {
          this.globalScheduleMode = 'edit';
          this.disableAllFormValForEditMode = data.typeEdit;
          this.entityCommonDataService.scheduleDateTimeScheduleMode = 'edit';
          this.editAppointmentDateTimeSchedule(data.data);

        } else {
          const param = {
            title: 'Confirm',
            body: 'Already Editing Another Time Schedule, do you want to continue?',
            formDeleteObj: data,
            formType: 'edit_appointment',
            formIndex: {
              main: findIndexVal,
              sub: null
            }
          };
          this.checkConfirmation(param);
        }
      }
      if (data.typeEdit === 'add_new') {
        this.nextButtonDisableStatus = true;
      }
    }
  }

  editAppointmentDateTimeSchedule(obj) {
    this.scheduleDataForEdit = obj;
    this.updateFormValues();
  }


  createTimeAppTypeFormForEdit() {
    if (this.selectedAppointmentTypes.length !== this.historyData.basicInfo.selectedAppointmentTypes.length) {
      this.selectedAppointmentTypes = [];
      _.map(this.historyData.basicInfo.selectedAppointmentTypes, (v) => {
        v.isSelected = true;
        const appointmentType = new AppointmentType();
        if (appointmentType.isObjectValid(v)) {
          appointmentType.generateObject(v);
          this.selectedAppointmentTypes.push(appointmentType);
        }
      });
    }
    const appTypeEditArray = [];
    _.map(this.scheduleDataForEdit.appointmentTypeTimeArray, (apptype) => {
      apptype.isSelected = true;
      const fIndex = _.findIndex(this.selectedAppointmentTypes, (v) => {
        return _.toNumber(v.id) === _.toNumber(apptype.appointmentType.id);
      });
      const sTime = this.timeFormateKey === '12_hour' ? moment(moment().format('YYYY-MM-DD') + ' ' + apptype.startTime).format('hh:mm A') :
        moment(moment().format('YYYY-MM-DD') + ' ' + apptype.startTime).format('HH:mm');
      let eTime = this.timeFormateKey === '12_hour' ? moment(moment().format('YYYY-MM-DD') + ' ' + apptype.endTime).format('hh:mm A') :
        moment(moment().format('YYYY-MM-DD') + ' ' + apptype.endTime).format('HH:mm');
      if (eTime === '00:00' || eTime === '12:00 AM') {
        eTime = 'Mid Night';
      }
      const appointmentTypeTimeFormObj = {
        appointmentType: [this.selectedAppointmentTypes[fIndex], Validators.required],
        startTime: [sTime, Validators.required],
        endTime: [eTime, Validators.required],
        selectedDays: this.fb.array(this.patchDefaultWeekDaysArray(apptype.selectedDays)),
        subFormStatus: [false],
        allowAppointments: [apptype.allowAppointments],
        formId: [apptype.formId],
        endTimeHoursList: [this.generateHoursList(apptype.startTime)]
      };
      if (this.disableAllFormValForEditMode === 'edit_existing') {
        appointmentTypeTimeFormObj.formId = [null];
      }
      const entityScheduleAppointmentTime = new EntityScheduleAppointmentTime();
      if (entityScheduleAppointmentTime.isObjectValid(appointmentTypeTimeFormObj)) {
        entityScheduleAppointmentTime.generateObject(appointmentTypeTimeFormObj);
      }
      appTypeEditArray.push(this.fb.group(entityScheduleAppointmentTime));
    });
    return appTypeEditArray;
  }

  updateFormValues() {
    if (this.scheduleMaker.controls.length === 1) {
      const formValues = this.scheduleMaker.controls[0]['value'];
      if (_.toNumber(formValues.formId) === _.toNumber(this.scheduleDataForEdit.formId)) {
        return;
      } else {
        if (formValues.appointmentTypeTimeArray.length === 1) {
          const appointmentTypeTimeArray = formValues.appointmentTypeTimeArray[0];
          if (appointmentTypeTimeArray.appointmentType == null) {
            this.scheduleMaker.removeAt(0);
          }
        }
      }
    }
    const aryVal = this.createTimeAppTypeFormForEdit();
    const scheduleForm = {
      startDate: [new Date(), Validators.required],
      endDate: [null],
      appointmentTypeTimeArray: this.fb.array(aryVal),
      weekOffDays: this.fb.array(this.patchDefaultWeekDaysArray(this.weekDaysArray)),
      mainFormStatus: [true],
      formId: [null]
    };
    if (!_.isEmpty(this.scheduleDataForEdit) && this.disableAllFormValForEditMode === 'add_new') {
      scheduleForm.startDate = [this.scheduleDataForEdit.startDate, Validators.required];
      scheduleForm.endDate = [this.scheduleDataForEdit.endDate];
      scheduleForm.mainFormStatus = [false];
      scheduleForm.formId = [this.scheduleDataForEdit.formId];
      scheduleForm.weekOffDays = this.fb.array(this.patchDefaultWeekDaysArray(this.scheduleDataForEdit.weekOffDays));
    }
    if (!_.isEmpty(this.scheduleDataForEdit) && this.disableAllFormValForEditMode === 'edit_existing') {
      let startSchDate = new Date();
      if (this.lastAppointmentForSchedule) {
        startSchDate = new Date(moment(this.lastAppointmentForSchedule.app_date).add(1, 'day').format('YYYY/MM/DD'));
        if (moment(this.lastAppointmentForSchedule.app_date).isBefore(moment(moment().format('YYYY/MM/DD')))) {
          startSchDate = new Date();
        }
      } else {
        // if (moment().isBefore(moment(this.scheduleDataForEdit.startDate))) {
        //   startSchDate = this.scheduleDataForEdit.startDate;
        // } else {
        //   startSchDate = new Date(moment().add(1, 'day').format('YYYY/MM/DD'));
        // }
        startSchDate = new Date(moment().add(1, 'day').format('YYYY/MM/DD'));
      }
      scheduleForm.startDate = [startSchDate, Validators.required];
      scheduleForm.endDate = [null];
      scheduleForm.mainFormStatus = [false];
      scheduleForm.formId = [null];
      scheduleForm.weekOffDays = this.fb.array(this.patchDefaultWeekDaysArray(this.scheduleDataForEdit.weekOffDays));
    }
    _.map(scheduleForm.appointmentTypeTimeArray.controls, (form) => {
      _.map(form.controls.selectedDays.controls, (days) => {
        const findForDisable = _.find(scheduleForm.weekOffDays.value, (wd) => {
          return wd.key === days.value.key && wd.isSelected === true;
        });
        if (!_.isUndefined(findForDisable)) {
          days.disable();
        }
      });
    });
    const entitySchedule = new EntitySchedule();
    if (entitySchedule.isObjectValid(scheduleForm)) {
      entitySchedule.generateObject(scheduleForm);
      this.scheduleMaker.push(this.fb.group(entitySchedule));
    }
    this.checkFormIsValidOrNot();
  }

  loadActiveScheduleList() {
    const allFormVal = this.scheduleMakerForm.value;
    const checkAllSubFormStatus = _.filter(allFormVal.scheduleMaker, (subFrmStatus, keyStatus) => {
      return subFrmStatus.startDate !== null;
    });
    if (checkAllSubFormStatus.length > 0) {
      const param = {
        title: 'Confirm',
        body: 'You have unsaved schedule, Do you want to continue?',
        formDeleteObj: null,
        formType: 'active_schedule',
        formIndex: {
          main: 0,
          sub: null
        }
      };
      this.checkConfirmation(param);
    } else {
      this.backToActiveScheduleList();
    }
  }

  backToActiveScheduleList() {
    this.entityCommonDataService.historyData = {};
    this.router.navigate(['/app/qms/schedule/activeScheduleList']);
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

  // -- generate end hours against start time
  generateHoursList(startTime): Array<any> {
    const serviceTime = this.historyData.basicInfo.appointmentTimeSlot;
    const temp = [];
    let sTime = startTime;
    let count = 1;
    let currentDate = moment();
    const todayEndTime = moment(moment().format('YYYY-MM-DD') + ' ' + '23:59');
    for (let hour = 0; hour < 23; hour++) {
      const timeFormat = this.timeFormateKey === '24_hour' ? 'HH:mm' : 'hh:mm A';
      const hrs = moment({ hour }).format(timeFormat);
      if ((moment(hrs, timeFormat).isSameOrAfter(moment(sTime, timeFormat)) || moment(sTime, timeFormat).isBefore(moment(todayEndTime))) && count) {
        count = 0;
        // for (let st = hour; st < 23; st++) {
        const test = () => {
          // const endHour = moment(23, ['H']).format(timeFormat);
          // moment('24:00', 'h:mm').isSameOrBefore(moment('23', 'H'))
          sTime = moment(moment(currentDate).format('YYYY-MM-DD') + ' ' + sTime);
          if (moment(sTime).isBefore(todayEndTime)) {
            // if ( moment(endHour, timeFormat).isSameOrAfter(moment(sTime, timeFormat)) ) {
            const t = moment(sTime).add(serviceTime, 'minutes');
            const cTtime = moment(t).format(timeFormat);
            temp.push(cTtime);
            sTime = cTtime;
            currentDate = t;
            test();
          } else {
            return;
          }
        };
        test();
        // const t = moment(sTime, timeFormat).add(serviceTime, 'minutes');
        // const cTtime = moment(t).format(timeFormat);
        // temp.push(cTtime);
        // sTime = cTtime;
        // }
      }
    }
    temp[temp.length - 1] = 'Mid Night';
    return temp;
  }

  updateHistoryDataAfterTimeOperation() {
    this.scheduleMakerService.$subcUpdateHistoryDataAfterUpdateOnTimeSchedule.pipe(takeUntil(this.destroy$)).subscribe(data => {
      if (data) {
        this.getHistoryData().subscribe();
      }
    });
  }

  closeInstruction() {
    this.commonService.openCloselogSlider('close');
  }

  checkClearFormStatus() {
    const allFormVal = this.scheduleMakerForm.controls.scheduleMaker['controls'];
    let checkHaveNewData = false;
    if (allFormVal.length === 1) {
      const formVal = allFormVal[0].value;
      checkHaveNewData = (formVal.formId == null
        && formVal.startDate == null
        && formVal.endDate == null
        && (_.filter(formVal.weekOffDays, (wd) => {
          return wd === true;
        })).length === 0
        && formVal.appointmentTypeTimeArray.length === 1
        && formVal.appointmentTypeTimeArray[0].appointmentType == null
        && (_.filter(formVal.appointmentTypeTimeArray[0].selectedDays, (wd) => {
          return wd === true;
        })).length === 0
        && formVal.appointmentTypeTimeArray[0].allowAppointments === false) ? false : true;
    } else {
      checkHaveNewData = true;
    }
    return checkHaveNewData;
  }

  clearFormValues() {
    const checkHaveNewData = this.checkClearFormStatus();
    if (checkHaveNewData) {
      const param = {
        title: 'Confirm',
        body: 'Do you want to <b>Clear</b> existing data?',
        formDeleteObj: null,
        formType: 'clear_form',
        formIndex: {
          main: 0,
          sub: null
        }
      };
      this.checkConfirmation(param);
    }
  }

  clearAllFormValues() {
    this.scheduleMakerForm = this.fb.group({
      scheduleMaker: this.fb.array([])
    });
    const aryVal = [this.fb.group(this.patchAppointmentTypeFormDefaultValues())];
    const scheduleForm = {
      startDate: [null, Validators.required],
      endDate: [null],
      appointmentTypeTimeArray: this.fb.array(aryVal),
      weekOffDays: this.fb.array(this.patchDefaultWeekDaysArray(this.weekDaysArray)),
      mainFormStatus: [true],
      formId: [null]
    };
    const entitySchedule = new EntitySchedule();
    if (entitySchedule.isObjectValid(scheduleForm)) {
      entitySchedule.generateObject(scheduleForm);
      this.scheduleMaker.push(this.fb.group(entitySchedule));
    }
    this.entityCommonDataService.scheduleDateTimeScheduleMode = 'add';
    this.disableAllFormValForEditMode = '';
    this.globalScheduleMode = 'add';
    this.entityCommonDataService.activeEditTimeScheduleIndex = null;
    this.entityCommonDataService.enableDisableEditButtons(null);
    this.nextButtonDisableStatus = true;
    this.clearButtonStatus = true;
  }

}

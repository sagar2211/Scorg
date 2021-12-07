import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, Validators, FormGroup, FormArray } from '@angular/forms';
import { IAlert } from 'src/app/public/models/AlertMessage';
import { AuthService } from 'src/app/public/services/auth.service';
import { Observable, Subject, concat, of } from 'rxjs';
import { distinctUntilChanged, debounceTime, switchMap, catchError, takeUntil } from 'rxjs/operators';
import { OtScheduleService } from '../../services/ot-schedule.service';
import { PatientService } from 'src/app/public/services/patient.service';
import * as _ from 'lodash';
import * as moment from 'moment';
import { Constants } from 'src/app/config/constants';
import { ConfirmationPopupComponent } from 'src/app/shared/confirmation-popup/confirmation-popup.component';
import { NewPatientAddComponent } from 'src/app/ot module/ot/component/new-patient-add/new-patient-add.component';
import { AddPatientComponent } from 'src/app/ot module/patient/components/add-patient/add-patient.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-ot-patient-appointment-add-update',
  templateUrl: './ot-patient-appointment-add-update.component.html',
  styleUrls: ['./ot-patient-appointment-add-update.component.scss']
})
export class OtPatientAppointmentAddUpdateComponent implements OnInit {
  @Input() addUpdateData: any;

  appointmentForm: FormGroup;
  setAlertMessage: IAlert;
  loadForm: boolean;
  submitted: boolean;
  userId;
  userInfo;
  timeFormateKey;
  timeFormate;
  statusArray = [];
  imgBaseUrl = environment.HIS_Add_PatientCommon_API;

  specialityList$ = new Observable<any>();
  specialityInput$ = new Subject<any>();

  procedureList$ = new Observable<any>();
  procedureInput$ = new Subject<any>();

  surgeonList$ = new Observable<any>();
  surgeonInput$ = new Subject<any>();

  assSurgeonList$ = new Observable<any>();
  assSurgeonInput$ = new Subject<any>();

  scrubNurseList$ = new Observable<any>();
  scrubNurseInput$ = new Subject<any>();

  anaesthetistList$ = new Observable<any>();
  anaesthetistInput$ = new Subject<any>();

  keyword = 'patient_name';
  public patList = [];
  page_number = 1;
  searchPatKey = '';
  subject: Subject<string> = new Subject();
  ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  startTimeArray = [];
  endTimeArray = [];
  startTimeArrayClone = [];
  endTimeArrayClone = [];
  disableDatePicker: boolean;
  minDate = new Date();

  otUsrGrpType = [];
  otUsrGrpName = [];
  lclConstant;
  constructor(
    public modal: NgbActiveModal,
    private fb: FormBuilder,
    private otScheduleService: OtScheduleService,
    private authService: AuthService,
    private patientService: PatientService,
    private modalService: NgbModal,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.defaultSet();
    this.appointmentStatusList().then(res => {
      this.loadSpecialityList();
      this.loadSurgeonList();
      this.loadAnaesthetistList();
      this.loadScrubNurseList();
      this.subjectFun();
      if (this.timeFormateKey === '12_hour') {
        this.timeFormate = 'hh:mm A';
      } else {
        this.timeFormate = 'HH:mm';
      }
      this.createForm();
      const timeData = this.addUpdateData.room;
      const selAppDate = new Date(moment(this.addUpdateData.appointmentDate).format('YYYY/MM/DD'));
      const sTime = moment(this.addUpdateData.appointmentDate).format(this.timeFormate);
      this.generateTimeArray(timeData.startTime, timeData.endTime, selAppDate, sTime);
      if (this.addUpdateData.selectedAppointment) {
        // update appointment
        // this.getRoomData().then();
        this.disableDatePicker = false;
        this.appointmentUpdate();
      }
      this.changeFormTime()
    });
  }

  defaultSet() {
    this.lclConstant = Constants;
    this.otUsrGrpName = Object.keys(Constants.otUserGrpName);
    this.disableDatePicker = true;
    this.loadForm = false;
    this.submitted = false;
    this.userId = +this.authService.getLoggedInUserId();
    this.userInfo = this.authService.getUserInfoFromLocalStorage();
    this.timeFormateKey = this.authService.getUserInfoFromLocalStorage().timeFormat;
    this.otUsrGrpType.push(Constants.otUserGrpType.additional);
    this.otUsrGrpType.push(Constants.otUserGrpType.assistant);
  }

  changeFormTime() {
    // form change detection
    this.appointmentForm.get('endTime').valueChanges.subscribe(endTime => {
      const formVal = this.appointmentForm.getRawValue();
      const appStartTime = moment(moment(formVal.scheduleDateTime).format('YYYY/MM/DD') + ' ' + formVal.startTime);
      const appEndTime = moment(moment(formVal.scheduleDateTime).format('YYYY/MM/DD') + ' ' + formVal.endTime);
      if (appStartTime.isAfter(appEndTime)) {
        this.setAlertMessage = {
          message: 'Start Time must be before End Time',
          messageType: 'danger',
          duration: Constants.ALERT_DURATION
        };
        this.appointmentForm.patchValue({
          endTime: null
        });
      }
    });
  }

  createForm() {
    const formObj = {
      appointmentId: [null],
      roomId: [this.addUpdateData.room.roomId, [Validators.required]],
      scheduleDateTime: [this.addUpdateData.appointmentDate, [Validators.required]],
      startTime: [null, [Validators.required]],
      endTime: [null, [Validators.required]],
      patientId: [null, [Validators.required]],
      specialityId: [null, [Validators.required]],
      procedureId: [null, [Validators.required]],
      appStatusId: [1, [Validators.required]],
      statusData: [null],
      selectedPatient: [null],
      specialityData: [null],
      procedureData: [null],
      note: [null],
      surgeon: this.fb.array([this.fb.group(this.addSurgeon(true))]),
      anesthetist: this.fb.array([this.fb.group(this.addAnanaesthetist(true))]),
      nurse: this.fb.array([this.fb.group(this.addScrubNurse(true))]),
    };
    this.appointmentForm = this.fb.group(formObj);
    this.loadForm = true;
  }

  get getFrmCntrols() {
    return this.appointmentForm.controls;
  }

  appointmentUpdate() {
    const appData = this.addUpdateData.selectedAppointment;
    const sTime = moment(appData.start).format(this.timeFormate);
    const eTime = moment(appData.end).format(this.timeFormate);
    this.appointmentForm.patchValue({
      appointmentId: appData.id,
      startTime: sTime,
      endTime: eTime,
      patientId: appData.meta.patientInfo.patientId,
      specialityId: appData.meta.specialityId,
      procedureId: appData.meta.procedureId,
      selectedPatient: appData.meta.patientInfo,
      note: appData.meta.note,
      appStatusId: appData.meta.statusId,
      statusData: _.clone(_.find(this.statusArray, s => {
        return s.statusId === appData.meta.statusId
      })),
      specialityData: {
        id: appData.meta.specialityId,
        name: appData.meta.specialityName
      },
      procedureData: {
        id: appData.meta.procedureId,
        name: appData.meta.procedureName
      },
      surgeon: [],
      anesthetist: [],
      nurse: [],
    });
    this.updateUserdata('surgeon');
    this.updateUserdata('anesthetist');
    this.updateUserdata('nurse');
    this.loadSpecialityList(appData.meta.specialityName);
    this.otScheduleService.selectedSpecialityId = appData.meta.specialityId;
    this.loadProcedureList(appData.meta.procedureName);
  }

  generateTimeArray(startTimeVal: string, endTimeVal: string, selectedDate: Date, stime?) {
    this.startTimeArray.length = 0;
    this.endTimeArray.length = 0;
    this.startTimeArrayClone.length = 0;
    this.endTimeArrayClone.length = 0;
    const startTime = moment(moment(selectedDate).format('YYYY/MM/DD') + ' ' + startTimeVal);
    const endTime = moment(moment(selectedDate).format('YYYY/MM/DD') + ' ' + endTimeVal);
    const selDate = moment(moment(selectedDate).format('YYYY/MM/DD'));
    let selSTime = null;
    let selTime = null;
    if (stime) {
      selSTime = moment(moment(selectedDate).format('YYYY/MM/DD') + ' ' + stime);
    }
    let addTimeMin = 0;
    let indx = 0;
    let diff = endTime.diff(startTime, 'minutes');
    const currentTime = moment();
    const currentDate = moment(moment().format('YYYY-MM-DD'));
    diff = diff > 0 ? (diff / 30) : 0;
    for (let i = 0; i < diff; i++) {
      const time = startTime.clone().add(addTimeMin, 'minute');
      let disabl = currentTime.isSameOrBefore(time) ? false : true
      disabl = selDate.isSame(currentDate) ? disabl : false;
      const obj = {
        time: time.format(this.timeFormate),
        disabled: disabl,
        index: indx,
      }
      if (stime && time.isSame(selSTime)) {
        selTime = obj;
      }
      this.startTimeArray.push(obj);
      addTimeMin = addTimeMin + 30;
      indx = indx + 1;
    }
    this.endTimeArray = _.cloneDeep(this.startTimeArray);
    this.endTimeArray.splice(0, 1);
    let disablEnd = currentTime.isSameOrBefore(endTime) ? false : true
    disablEnd = selDate.isSame(currentDate) ? disablEnd : false;
    const objEnd = {
      time: endTime.format(this.timeFormate),
      disabled: disablEnd,
      index: null,
    }
    this.endTimeArray.push(objEnd);
    _.map(this.endTimeArray, (v, i) => {
      v.index = i;
    });
    this.startTimeArrayClone = _.cloneDeep(this.startTimeArray);
    this.endTimeArray = _.cloneDeep(this.endTimeArray);
    if (selTime) {
      this.startTimeValueChange(selTime.time);
    }
  }

  updateSelectedDate(val) {
    this.appointmentForm.patchValue({
      scheduleDateTime: new Date(val),
      startTime: null,
      endTime: null
    });
    const timeData = this.addUpdateData.room;
    this.appointmentForm.patchValue({
      statusId: 3,
      statusData: _.clone(_.find(this.statusArray, s => {
        return s.statusId === 3
      })),
    });
    this.generateTimeArray(timeData.startTime, timeData.endTime, val);
  }

  checkHaveAppointment() {
    const promise = new Promise((resolve, reject) => {
      let retVal = false;
      const formVal = this.appointmentForm.getRawValue();
      const appDate = moment(moment(formVal.scheduleDateTime).format('YYYY/MM/DD'));
      const appList = this.addUpdateData.appointmentList;
      const appStartTime = moment(moment(formVal.scheduleDateTime).format('YYYY/MM/DD') + ' ' + formVal.startTime);
      const appEndTime = moment(moment(formVal.scheduleDateTime).format('YYYY/MM/DD') + ' ' + formVal.endTime);
      const selAppDate = moment(moment(this.addUpdateData.appointmentDate).format('YYYY/MM/DD'));
      if (selAppDate.isSame(appDate)) {
        const check = _.find(appList, sa => {
          return moment(moment(sa.start).format('YYYY/MM/DD')).isSame(appDate)
            && (appStartTime.isSame(moment(sa.start))
              || appStartTime.isBetween(moment(sa.start), sa.end, undefined, '[]')
              || appEndTime.isBetween(moment(sa.start), sa.end, undefined, '[]')
              || moment(sa.start).isBetween(appStartTime, appEndTime, undefined, '[]')
              || moment(sa.end).isBetween(appStartTime, appEndTime, undefined, '[]'))
            && sa.id != formVal.appointmentId;
        });
        retVal = check ? true : false;
        resolve(retVal);
      } else {
        // get App list for selected date
        this.getAppointmentListByDate(formVal.roomId, appDate).then(res => {
          if (res) {
            const check = _.find(res, sa => {
              return moment(moment(sa.appointmentDate).format('YYYY/MM/DD')).isSame(appDate)
                && (appStartTime.isSame(moment(moment(sa.appointmentDate).format('YYYY/MM/DD') + ' ' + sa.startTime))
                  && (appStartTime.isBetween(moment(moment(sa.appointmentDate).format('YYYY/MM/DD') + ' ' + sa.startTime),
                    moment(moment(sa.appointmentDate).format('YYYY/MM/DD') + ' ' + sa.endTime), undefined, '[]')))
                || ((appEndTime.isBetween(moment(moment(sa.appointmentDate).format('YYYY/MM/DD') + ' ' + sa.startTime),
                  moment(moment(sa.appointmentDate).format('YYYY/MM/DD') + ' ' + sa.endTime), undefined, '[]')))
                || (moment(moment(sa.appointmentDate).format('YYYY/MM/DD') + ' ' + sa.startTime).isBetween(appStartTime, appEndTime, undefined, '[]'))
                || (moment(moment(sa.appointmentDate).format('YYYY/MM/DD') + ' ' + sa.endTime).isBetween(appStartTime, appEndTime, undefined, '[]'))
                && sa.appointmentId != formVal.appointmentId;
            });
            retVal = check ? true : false;
            resolve(retVal);
          } else {
            resolve(retVal);
          }
        });
      }
    });
    return promise;
  }

  getAppointmentListByDate(roomId, appDate) {
    const promise = new Promise((resolve, reject) => {
      const params = {
        roomId: roomId,
        appointmentDate: new Date(appDate.format('YYYY-MM-DD')),
      };
      return this.otScheduleService.getOTAppointmentListByDate(params).subscribe(res => {
        if (res.length > 0) {
          resolve(res);
        } else {
          resolve([]);
        }
      });
    });
    return promise;
  }

  saveValue() {
    this.submitted = true;
    if (this.appointmentForm.valid && this.submitted) {
      const formVal = this.appointmentForm.getRawValue();
      const main = _.find(formVal.surgeon, ud => {
        return ud.desgKey === Constants.userRoleType.surgeon.key &&
          ud.type === Constants.otUserGrpType.primary &&
          ud.group === Constants.otUserGrpName.surgeon &&
          (ud.userId || ud.userData);
      });
      if (!main) {
        this.setAlertMessage = {
          message: 'Please Add Primary Surgeon',
          messageType: 'danger',
          duration: Constants.ALERT_DURATION
        };
        return;
      }
      const appStartTime = moment(moment(formVal.scheduleDateTime).format('YYYY/MM/DD') + ' ' + formVal.startTime);
      const appEndTime = moment(moment(formVal.scheduleDateTime).format('YYYY/MM/DD') + ' ' + formVal.endTime);
      if (appStartTime.isBefore(appEndTime)) {
        const params = {
          appointmentId: formVal.appointmentId ? formVal.appointmentId : 0,
          roomId: formVal.roomId,
          appointmentDate: new Date(formVal.scheduleDateTime),
          startTime: formVal.startTime,
          endTime: formVal.endTime,
          patientId: formVal.patientId,
          specialityId: formVal.specialityId,
          procedureId: formVal.procedureId,
          note: formVal.note,
          statusId: formVal.appStatusId,
          userData: this.getAlluserListForSave()
        };
        return this.otScheduleService.saveAppointment(params).subscribe(res => {
          if (res) {
            this.setAlertMessage = {
              message: res.message,
              messageType: res.status_code === 400 ? 'danger' : 'success',
              duration: Constants.ALERT_DURATION
            };
            res.status_code === 400 ? null : this.closeModal('yes');
          } else {
            return;
          }
        });
      } else {
        this.setAlertMessage = {
          message: 'Start Time must be before End Time',
          messageType: 'danger',
          duration: Constants.ALERT_DURATION
        };
      }
    } else {
      this.setAlertMessage = {
        message: 'Already Have Appointment',
        messageType: 'danger',
        duration: Constants.ALERT_DURATION
      };
    }
  }

  closeModal(type) {
    this.modal.close(type);
  }

  startTimeValueChange(value) {
    if (value) {
      const indx = _.findIndex(this.endTimeArray, v => {
        return v.time === value && !v.disabled;
      })
      this.appointmentForm.patchValue({
        startTime: value
      });
      if (indx !== -1 && this.endTimeArray.length >= indx) {
        this.appointmentForm.patchValue({
          endTime: this.endTimeArray[indx + 1].time
        });
      }
    } else {
      this.appointmentForm.patchValue({
        startTime: null,
        endTime: null
      });
    }
  }

  endTimeValueChange(value) {
    if (value) {
      this.appointmentForm.patchValue({
        endTime: value
      });
      const startTime = moment(moment('YYYY/MM/DD') + ' ' + this.appointmentForm.value.startTime);
      const endTime = moment(moment('YYYY/MM/DD') + ' ' + this.appointmentForm.value.endTime);
      if (startTime.isSameOrAfter(endTime)) {
        this.appointmentForm.patchValue({
          endTime: null
        });
        this.setAlertMessage = {
          message: 'Start Time Must Before End Time',
          messageType: 'danger',
          duration: Constants.ALERT_DURATION
        };
      }
    } else {
      this.appointmentForm.patchValue({
        endTime: null
      });
    }
  }

  onSpecilityChange(event) {
    if (event) {
      this.appointmentForm.patchValue({
        specialityId: event.id,
        specialityData: event,
      });
      this.otScheduleService.selectedSpecialityId = event.id;
    } else {
      this.appointmentForm.patchValue({
        specialityId: null,
        specialityData: null,
      });
      this.otScheduleService.selectedSpecialityId = null;
    }
    this.loadProcedureList();
  }

  checkSurgeonExist(event) {
    const userList = this.appointmentForm.getRawValue().surgeon;
    const main = _.find(userList, ud => {
      return ud.desgKey === Constants.userRoleType.surgeon.key &&
        ud.group === Constants.otUserGrpName.surgeon &&
        ud.userData !== null && ud.userId === event.userId;
    });
    return main ? true : false;
  }

  checkAssSurgeonExist(event) {
    const userList = this.appointmentForm.getRawValue().surgeon;
    const main = _.find(userList, ud => {
      return ud.desgKey === Constants.userRoleType.assistantSurgeon.key &&
        ud.group === Constants.otUserGrpName.surgeon &&
        ud.userData !== null && ud.userId === event.userId;
    });
    return main ? true : false;
  }

  checkAnaesthetistExist(event) {
    const userList = this.appointmentForm.getRawValue().anesthetist;
    const main = _.find(userList, ud => {
      return ud.desgKey === Constants.userRoleType.anaesthetist.key &&
        ud.group === Constants.otUserGrpName.anaesthetist &&
        ud.userData !== null && ud.userId === event.userId;
    });
    return main ? true : false;
  }

  checkNurseExist(event) {
    const userList = this.appointmentForm.getRawValue().nurse;
    const main = _.find(userList, ud => {
      return ud.desgKey === Constants.userRoleType.scrubNurse.key &&
        ud.group === Constants.otUserGrpName.scrub_nurse &&
        ud.userData !== null && ud.userId === event.userId;
    });
    return main ? true : false;
  }

  onSurgeonChange(event, index) {
    if (event) {
      const checkExist = this.checkSurgeonExist(event);
      if (checkExist) {
        this.appointmentForm.controls['surgeon']['controls'][index].patchValue({
          userId: null,
          userData: null
        });
        this.setAlertMessage = {
          message: 'Already Exist',
          messageType: 'warning',
          duration: Constants.ALERT_DURATION
        };
        return;
      }
      this.appointmentForm.controls['surgeon']['controls'][index].patchValue({
        userId: event.userId,
        userData: event
      });
    } else {
      this.appointmentForm.controls['surgeon']['controls'][index].patchValue({
        userId: null,
        userData: null
      });
    }
  }

  onAssSurgeonChange(event, index) {
    if (event) {
      const checkExist = this.checkAssSurgeonExist(event);
      if (checkExist) {
        this.appointmentForm.controls['surgeon']['controls'][index].patchValue({
          userId: null,
          userData: null
        });
        this.setAlertMessage = {
          message: 'Already Exist',
          messageType: 'warning',
          duration: Constants.ALERT_DURATION
        };
        return;
      }
      this.appointmentForm.controls['surgeon']['controls'][index].patchValue({
        userId: event.userId,
        userData: event
      });
    } else {
      this.appointmentForm.controls['surgeon']['controls'][index].patchValue({
        userId: null,
        userData: null
      });
    }
  }

  onProcedureChange(event) {
    if (event) {
      this.appointmentForm.patchValue({
        procedureId: event.id,
        procedureData: event,
      });
    } else {
      this.appointmentForm.patchValue({
        procedureId: null,
        procedureData: null,
      });
    }
  }

  onAnaesthetistChange(event, index) {
    if (event) {
      const checkExist = this.checkAnaesthetistExist(event);
      if (checkExist) {
        this.appointmentForm.controls['anesthetist']['controls'][index].patchValue({
          userId: null,
          userData: null
        });
        this.setAlertMessage = {
          message: 'Already Exist',
          messageType: 'warning',
          duration: Constants.ALERT_DURATION
        };
        return;
      }
      this.appointmentForm.controls['anesthetist']['controls'][index].patchValue({
        userId: event.userId,
        userData: event
      });
    } else {
      this.appointmentForm.controls['anesthetist']['controls'][index].patchValue({
        userId: null,
        userData: null
      });
    }
  }

  onNurseChange(event, index) {
    if (event) {
      const checkExist = this.checkNurseExist(event);
      if (checkExist) {
        this.appointmentForm.controls['nurse']['controls'][index].patchValue({
          userId: null,
          userData: null
        });
        this.setAlertMessage = {
          message: 'Already Exist',
          messageType: 'warning',
          duration: Constants.ALERT_DURATION
        };
        return;
      }
      this.appointmentForm.controls['nurse']['controls'][index].patchValue({
        userId: event.userId,
        userData: event
      });
    } else {
      this.appointmentForm.controls['nurse']['controls'][index].patchValue({
        userId: null,
        userData: null
      });
    }
  }

  subjectFun() {
    this.subject.pipe(debounceTime(500), takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.getPatientSearchData();
    });
  }

  onChangeSearch(search: string) {
    this.page_number = 1;
    this.patList = [];
    this.searchPatKey = search;
    this.subject.next();
  }

  selectEvent(item) {
    if (item) {
      this.appointmentForm.patchValue({
        patientId: item.patient_id,
        selectedPatient: {
          patientId: item.patient_id,
          patientName: item.patient_name,
          gender: item.gender,
          patImage : item.pat_image,
          age: item.age,
          dob: item.dob,
          mobileNo: item.mobile_no,
          emailId: item.email_id,
          address: item.address
        },
      });
    } else {
      this.appointmentForm.patchValue({
        patientId: null,
        selectedPatient: null,
      });
    }
  }

  onScroll() {
    if (this.patList.length !== 0) {
      this.page_number = this.page_number + 1;
    }
    this.getPatientSearchData();
  }

  closed(event) {
    if (this.searchPatKey !== '') {
      this.onChangeSearch('');
    }
  }

  getPatientSearchData() {
    const params = {
      search_string: this.searchPatKey ? this.searchPatKey : '',
      page_number: this.page_number,
      limit: 5
    };
    return this.patientService.getQuickPatientList(params).subscribe(res => {
      if (res.length > 0) {
        this.patList = _.concat(this.patList, res);
        this.cd.detectChanges();
        return this.patList = _.uniqBy(this.patList, 'patient_id');
        
      } else {
        return;
      }
    });
  }

  private loadSpecialityList(searchTxt?) {
    this.specialityList$ = concat(
      this.otScheduleService.getOTSpecialityList(searchTxt ? searchTxt : ''), // default items
      this.specialityInput$.pipe(
        distinctUntilChanged(),
        debounceTime(500),
        switchMap(term => this.otScheduleService.getOTSpecialityList(term ? term : (searchTxt ? searchTxt : '')).pipe(
          catchError(() => of([]))
        ))
      )
    );
  }

  private loadProcedureList(searchTxt?) {
    this.procedureList$ = concat(
      this.otScheduleService.getOTProcedureList(searchTxt ? searchTxt : ''), // default items
      this.procedureInput$.pipe(
        distinctUntilChanged(),
        debounceTime(500),
        switchMap(term => this.otScheduleService.getOTProcedureList(term ? term : (searchTxt ? searchTxt : '')).pipe(
          catchError(() => of([]))
        ))
      )
    );
  }

  private loadSurgeonList(searchTxt?) {
    this.surgeonList$ = concat(
      this.otScheduleService.getUsersList(searchTxt ? searchTxt : '', Constants.userRoleType.surgeon.key), // default items
      this.surgeonInput$.pipe(
        distinctUntilChanged(),
        debounceTime(500),
        switchMap(term => this.otScheduleService.getUsersList(term ? term : (searchTxt ? searchTxt : ''), Constants.userRoleType.surgeon.key).pipe(
          catchError(() => of([]))
        ))
      )
    );
  }

  private loadAssSurgeonList(searchTxt?) {
    this.assSurgeonList$ = concat(
      this.otScheduleService.getUsersList(searchTxt ? searchTxt : '', Constants.userRoleType.assistantSurgeon.key), // default items
      this.assSurgeonInput$.pipe(
        distinctUntilChanged(),
        debounceTime(500),
        switchMap(term => this.otScheduleService.getUsersList(term ? term : (searchTxt ? searchTxt : ''), Constants.userRoleType.assistantSurgeon.key).pipe(
          catchError(() => of([]))
        ))
      )
    );
  }

  private loadScrubNurseList(searchTxt?) {
    this.scrubNurseList$ = concat(
      this.otScheduleService.getUsersList(searchTxt ? searchTxt : '', Constants.userRoleType.scrubNurse.key), // default items
      this.scrubNurseInput$.pipe(
        distinctUntilChanged(),
        debounceTime(500),
        switchMap(term => this.otScheduleService.getUsersList(term ? term : (searchTxt ? searchTxt : ''), Constants.userRoleType.scrubNurse.key).pipe(
          catchError(() => of([]))
        ))
      )
    );
  }

  private loadAnaesthetistList(searchTxt?) {
    this.anaesthetistList$ = concat(
      this.otScheduleService.getUsersList(searchTxt ? searchTxt : '', Constants.userRoleType.anaesthetist.key), // default items
      this.anaesthetistInput$.pipe(
        distinctUntilChanged(),
        debounceTime(500),
        switchMap(term => this.otScheduleService.getUsersList(term ? term : (searchTxt ? searchTxt : ''), Constants.userRoleType.anaesthetist.key).pipe(
          catchError(() => of([]))
        ))
      )
    );
  }

  deleteData(rowData) {
    const modalTitleobj = 'Delete';
    const modalBodyobj = 'Do you want to delete this Appointment?';
    const messageDetails = {
      modalTitle: modalTitleobj,
      modalBody: modalBodyobj,
      buttonType: 'yes_no'
    };
    const modalInstance = this.modalService.open(ConfirmationPopupComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false
      });
    modalInstance.result.then((result) => {
      if (result === 'yes') {
        this.deleteById(rowData);
      }
    });
    modalInstance.componentInstance.messageDetails = messageDetails;
  }

  deleteById(rowData) {
    this.otScheduleService.deleteOTAppointmentById(rowData.appointmentId).subscribe(res => {
      if (res) {
        this.setAlertMessage = {
          message: 'Appointment Deleted',
          messageType: 'success',
          duration: Constants.ALERT_DURATION
        };
        this.closeModal('yes');
      } else {
        this.setAlertMessage = {
          message: 'Something Went Wrong',
          messageType: 'danger',
          duration: Constants.ALERT_DURATION
        };
      }
    });
  }

  appointmentStatusList() {
    const promise = new Promise((resolve, reject) => {
      this.otScheduleService.getOTAppointmentStatus().subscribe(res => {
        this.statusArray = res;
        resolve(this.statusArray);
      });
    });
    return promise;
  }

  statusChange(sts) {
    if (sts) {
      this.appointmentForm.patchValue({
        appStatusId: sts.statusId,
        statusData: sts,
      });
    } else {
      this.appointmentForm.patchValue({
        appStatusId: 1,
        statusData: _.clone(_.find(this.statusArray, s => {
          return s.statusId === 1
        })),
      });
    }
  }

  addNewRow(type) {
    if (type === 'surgeon') {
      this.appointmentForm.controls[type]['controls'].push(this.fb.group(this.addSurgeon(false)));
    } else if (type === 'anesthetist') {
      this.appointmentForm.controls[type]['controls'].push(this.fb.group(this.addAnanaesthetist(false)));
    } else {
      this.appointmentForm.controls[type]['controls'].push(this.fb.group(this.addScrubNurse(false)));
    }
  }

  getAlluserListForSave() {
    const formVal = this.appointmentForm.getRawValue();
    const usrArray = [];
    _.map(formVal.surgeon, dt => {
      if (dt.type && dt.userId) {
        usrArray.push(_.clone({
          userGroup: dt.group,
          type: dt.type,
          desgKey: dt.desgKey,
          userId: dt.userId,
        }));
      }
    });
    _.map(formVal.anesthetist, dt => {
      if (dt.type && dt.userId) {
        usrArray.push(_.clone({
          userGroup: dt.group,
          type: dt.type,
          desgKey: dt.desgKey,
          userId: dt.userId,
        }));
      }
    });
    _.map(formVal.nurse, dt => {
      if (dt.type && dt.userId) {
        usrArray.push(_.clone({
          userGroup: dt.group,
          type: dt.type,
          desgKey: dt.desgKey,
          userId: dt.userId,
        }));
      }
    });
    return usrArray;
  }

  addSurgeon(isPrimary) {
    const formObj = {
      group: [Constants.otUserGrpName.surgeon],
      type: isPrimary ? [Constants.otUserGrpType.primary] : [null],
      desgKey: isPrimary ? [Constants.userRoleType.surgeon.key] : [null],
      userId: [null],
      userData: [null],
    };
    return formObj;
  }

  addAnanaesthetist(isPrimary) {
    const formObj = {
      group: [Constants.otUserGrpName.anaesthetist],
      type: isPrimary ? [Constants.otUserGrpType.primary] : [null],
      desgKey: [Constants.userRoleType.anaesthetist.key],
      userId: [null],
      userData: [null],
    };
    return formObj;
  }

  addScrubNurse(isPrimary) {
    const formObj = {
      group: [Constants.otUserGrpName.scrub_nurse],
      type: isPrimary ? [Constants.otUserGrpType.primary] : [null],
      desgKey: [Constants.userRoleType.scrubNurse.key],
      userId: [null],
      userData: [null],
    };
    return formObj;
  }

  onGrpTypeChange(type, isPrimary, val, index) {
    if (isPrimary) {
      this.appointmentForm.controls[type]['controls'][index].patchValue({
        type: Constants.otUserGrpType.primary,
        desgKey: type === 'surgeon' ? Constants.userRoleType.surgeon.key
          : (type === 'anesthetist' ? Constants.userRoleType.anaesthetist.key
            : Constants.userRoleType.scrubNurse.key)
      });
      if (type === 'surgeon') {
        this.loadSurgeonList();
      } else if (type === 'anesthetist') {
        this.loadAnaesthetistList();
      } else {
        this.loadScrubNurseList();
      }
    } else if (val) {
      this.appointmentForm.controls[type]['controls'][index].patchValue({
        type: val
      });
      if (type === 'surgeon' && val === Constants.otUserGrpType.assistant) {
        this.appointmentForm.controls[type]['controls'][index].patchValue({
          desgKey: Constants.userRoleType.assistantSurgeon.key
        });
        this.loadAssSurgeonList();
      } else if (type === 'surgeon' && val === Constants.otUserGrpType.additional) {
        this.appointmentForm.controls[type]['controls'][index].patchValue({
          desgKey: Constants.userRoleType.surgeon.key
        });
        this.loadSurgeonList();
      } else if (type === 'anesthetist') {
        this.appointmentForm.controls[type]['controls'][index].patchValue({
          desgKey: Constants.userRoleType.anaesthetist.key
        });
        this.loadAnaesthetistList();
      } else {
        this.appointmentForm.controls[type]['controls'][index].patchValue({
          desgKey: Constants.userRoleType.scrubNurse.key
        });
        this.loadScrubNurseList();
      }
    } else {
      this.appointmentForm.controls[type]['controls'][index].patchValue({
        type: null
      });
    }
  }

  deleteRow(type, j) {
    if (j === 0) {
      return;
    }
    const frm = this.appointmentForm.get(type) as FormArray;
    frm.removeAt(j);
  }

  updateUserdata(type) {
    const userData = this.addUpdateData.selectedAppointment.meta.userData;
    let main;
    let sub = [];
    if (type === 'surgeon') {
      main = _.find(userData, ud => {
        ud.userData = ud;
        return ud.desgKey === Constants.userRoleType.surgeon.key &&
          ud.type === Constants.otUserGrpType.primary &&
          ud.userGroup === Constants.otUserGrpName.surgeon;
      });
      sub = _.filter(userData, ud => {
        ud.userData = ud;
        return ud.type !== Constants.otUserGrpType.primary &&
          ud.userGroup === Constants.otUserGrpName.surgeon;
      });
    } else if (type === 'anesthetist') {
      main = _.find(userData, ud => {
        ud.userData = ud;
        return ud.desgKey === Constants.userRoleType.anaesthetist.key &&
          ud.type === Constants.otUserGrpType.primary &&
          ud.userGroup === Constants.otUserGrpName.anaesthetist;
      });
      sub = _.filter(userData, ud => {
        ud.userData = ud;
        return ud.type !== Constants.otUserGrpType.primary &&
          ud.userGroup === Constants.otUserGrpName.anaesthetist;
      });
    } else {
      main = _.find(userData, ud => {
        ud.userData = ud;
        return ud.desgKey === Constants.userRoleType.scrubNurse.key &&
          ud.type === Constants.otUserGrpType.primary &&
          ud.userGroup === Constants.otUserGrpName.scrub_nurse;
      });
      sub = _.filter(userData, ud => {
        ud.userData = ud;
        return ud.type !== Constants.otUserGrpType.primary &&
          ud.userGroup === Constants.otUserGrpName.scrub_nurse;
      });
    }
    if (main) {
      const frm = this.appointmentForm.controls[type] as FormArray;
      frm.at(0).patchValue(main);
      _.map(sub, (d, i) => {
        this.addNewRow(type);
        frm.at(i + 1).patchValue(d);
      });
    }
  }

  addNewPatient() {
    // const modalTitleobj = 'Delete';
    // const modalBodyobj = 'Do you want to delete this Room?';
    // const messageDetails = {
    //   modalTitle: modalTitleobj,
    //   modalBody: modalBodyobj
    // };
    const modalInstance = this.modalService.open(AddPatientComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false
      });
    modalInstance.result.then((result) => {
      if (result === 'Ok') {
        // this.deleteById(rowData);
      }
    });
    modalInstance.componentInstance.messageDetails = null;
  }

}

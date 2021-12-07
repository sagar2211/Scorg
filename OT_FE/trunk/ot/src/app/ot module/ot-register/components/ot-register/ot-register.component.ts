import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { Observable, Subject, concat, of } from 'rxjs';
import { distinctUntilChanged, debounceTime, switchMap, catchError } from 'rxjs/operators';
import { OtRegisterService } from '../../services/ot-register.service';
import { AuthService } from 'src/app/public/services/auth.service';
import { CommonService } from 'src/app/public/services/common.service';
import { Constants } from 'src/app/config/constants';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash';
import * as moment from 'moment';
import { OtScheduleService } from 'src/app/ot module/ot-schedule/services/ot-schedule.service';
import { IAlert } from 'src/app/public/models/AlertMessage';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NewPatientAddComponent } from 'src/app/ot module/ot/component/new-patient-add/new-patient-add.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-ot-register',
  templateUrl: './ot-register.component.html',
  styleUrls: ['./ot-register.component.scss']
})
export class OtRegisterComponent implements OnInit {
  registerForm: FormGroup;
  userId: any;
  timeFormateKey: string;
  timeFormate: string;
  submitted: boolean = false;
  isAddNew: boolean;
  mainDateDisable: boolean;
  today = new Date();
  dateFormat = 'YYYY-MM-DD';
  startTimeArray = [];
  endTimeArray = [];
  startTimeArrayClone = [];
  endTimeArrayClone = [];
  setAlertMessage: IAlert;

  patientList$ = new Observable<any>();
  patientInput$ = new Subject<any>();
  surgeryLevelList = [];
  anaesthesiaTypeList = [];
  anaesthetistList$ = new Observable<any>();
  anaesthetistInput$ = new Subject<any>();
  surgeonList$ = new Observable<any>();
  surgeonInput$ = new Subject<any>();
  assSurgeonList$ = new Observable<any>();
  assSurgeonInput$ = new Subject<any>();
  scrubNurseList$ = new Observable<any>();
  scrubNurseInput$ = new Subject<any>();

  procedureList$ = new Observable<any>();
  procedureInput$ = new Subject<any>();
  imgBaseUrl = environment.HIS_Add_PatientCommon_API;

  otUsrGrpType = [];
  otUsrGrpName = [];
  lclConstant;
  loadType;
  constructor(
    private otRegisterService: OtRegisterService,
    private otScheduleService: OtScheduleService,
    private commonService: CommonService,
    private authService: AuthService,
    public fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private modalService: NgbModal,
  ) { }

  ngOnInit(): void {
    this.lclConstant = Constants;
    this.otUsrGrpName = Object.keys(Constants.otUserGrpName);
    this.otUsrGrpType.push(Constants.otUserGrpType.additional);
    this.otUsrGrpType.push(Constants.otUserGrpType.assistant);
    this.isAddNew = true;
    this.mainDateDisable = false;
    this.callLoadAPI();
    this.getTimeFormatKey().then(res => {
      this.generateTimeArray(new Date());
      this.createForm();
      const id = +this.route.snapshot.params.id;
      this.loadType = this.route.snapshot.params.type;
      if (id !== -1) {
        this.getOtRegisterDataByAppointmentId(id).then(res => {
          if (res) {
            this.updateOtregisterData(res, true);
          }
        });
      }
    });
    this.commonService.routeChanged(this.route);
  }

  updateOtregisterData(val, fromInit?) {
    this.isAddNew = false;
    this.clearForm();
    val.sTime = moment(moment().format(this.dateFormat) + ' ' + val.startTime).format(this.timeFormate);
    val.eTime = moment(moment().format(this.dateFormat) + ' ' + val.endTime).format(this.timeFormate);
    val.sATime = moment(moment().format(this.dateFormat) + ' ' + val.actualStartTime).format(this.timeFormate);
    val.eATime = moment(moment().format(this.dateFormat) + ' ' + val.actualEndTime).format(this.timeFormate);
    this.registerForm.patchValue({
      date: new Date(val.appointmentDate),
      patientId: val.patientId,
      patientData: {
        appointmentDate: new Date(val.appointmentDate),
        appointmentId: val.appointmentId,
        eTime: val.eTime,
        endTime: val.eTime,
        procedureId: val.procedureDetail[0].procedureId,
        procedureName: val.procedureDetail[0].procedureName,
        roomId: val.roomId,
        roomName: val.roomName,
        sTime: val.sTime,
        specialityId: val.specialityId,
        specialityName: val.specialityName,
        startTime: val.sTime,
        patientInfo: {
          age: val.age,
          dob: val.dob,
          gender: val.gender,
          patientId: val.patientId,
          patientName: val.patientName,
          serviceType: val.serviceType,
          serviceTypeId: val.serviceTypeId,
          patImage: val.patImage,
          visitNo: val.visitNo,
          emailId: val.emailId,
          mobileNo: val.mobileNo,
          resAddress: val.resAddress,
        },
      },
      appointmentId: val.appointmentId,
      visitNo: val.visitNo,
      serviceTypeId: val.serviceTypeId,
      actualStartTime: val.sATime,
      actualEndTime: val.eATime,
      surgeryLevelId: val.surgeryLevelId ? val.surgeryLevelId : null,
      anaesthesiaTypeId: val.anaesthesiaTypeId ? val.anaesthesiaTypeId : null,
      actualOtDate: new Date(val.actualOtDate),
      actualOtDateMin: new Date(val.appointmentDate),
      actualOtDateMax: new Date(moment(val.appointmentDate).add(1, 'days').format(this.dateFormat)),
      isReExploration: val.isReExploration,
      reExplorationReason: val.reExplorationReason,
    });
    this.updateProcedureFormdata(val);
    if (fromInit) {
      this.loadPatientList(val.patientName);
      this.mainDateDisable = true;
      if (this.loadType === 'view') {
        this.registerForm.disable();
      }
    }
  }

  callLoadAPI() {
    this.loadPatientList();
    this.loadAddSurgeonList();
    this.loadAnaesthetistList();
    this.loadAssSurgeonList();
    this.loadScrubNurseList();
    this.loadSurgeryLevelList();
    this.loadAnaesthesiaTypeList();
  }

  onPatientChange(val) {
    if (val) {
      this.getOtRegisterDataByAppointmentId(val.appointmentId).then(res => {
        if (res) {
          this.updateOtregisterData(res);
        } else {
          val.sTime = moment(moment().format(this.dateFormat) + ' ' + val.startTime).format(this.timeFormate);
          val.eTime = moment(moment().format(this.dateFormat) + ' ' + val.endTime).format(this.timeFormate);
          this.registerForm.patchValue({
            patientId: val.patientInfo.patientId,
            appointmentId: val.appointmentId,
            visitNo: val.patientInfo.visitNo,
            serviceTypeId: val.patientInfo.serviceTypeId,
            patientData: val,
            actualStartTime: val.sTime,
            actualEndTime: val.eTime,
            actualOtDate: new Date(val.appointmentDate),
            actualOtDateMin: new Date(val.appointmentDate),
            actualOtDateMax: new Date(moment(val.appointmentDate).add(1, 'days').format(this.dateFormat)),
            surgeryLevelId: val.surgeryLevelId ? val.surgeryLevelId : null,
            anaesthesiaTypeId: val.anaesthesiaTypeId ? val.anaesthesiaTypeId : null,
          });
          this.updateProcedureFormdata(val);
        }
      });
    } else {
      this.clearForm();
      this.callLoadAPI();
    }
  }

  createForm() {
    this.registerForm = this.fb.group({
      date: new Date(),
      patientId: [null],
      patientData: [null],
      appointmentId: [null],
      visitNo: [null],
      serviceTypeId: [null],
      actualOtDate: [null],
      actualOtDateMin: [null],
      actualOtDateMax: [null],
      actualStartTime: [null],
      actualEndTime: [null],
      surgeryLevelId: [null],
      anaesthesiaTypeId: [null],
      isReExploration: [false],
      reExplorationReason: [null],
      procedureForm: this.fb.array([this.fb.group(this.addProcedureForm(true))]),
      // surgeon: this.fb.array([this.fb.group(this.addSurgeon(true))]),
      // anesthetist: this.fb.array([this.fb.group(this.addAnanaesthetist(true))]),
      // nurse: this.fb.array([this.fb.group(this.addScrubNurse(true))]),
    });
    this.otRegisterService.selectedRegisterDate = moment().format(this.dateFormat);
    this.loadPatientList();
  }

  addProcedureForm(isPrimary) {
    const formObj = {
      procedure: null,
      procedureData: null,
      specialityId: null,
      surgeon: this.fb.array([this.fb.group(this.addSurgeon(true))]),
      anesthetist: this.fb.array([this.fb.group(this.addAnanaesthetist(true))]),
      nurse: this.fb.array([this.fb.group(this.addScrubNurse(true))]),
      isPrimary: isPrimary || false,
      isExpand: true
    };
    return formObj;
  }

  expandCollapse(pfi) {
    const frm = this.registerForm.controls['procedureForm'] as FormArray;
    const val = frm.value[pfi].isExpand;
    frm.at(pfi).patchValue({ isExpand: !val });
  }

  clearForm() {
    this.registerForm.patchValue({
      patientId: null,
      patientData: null,
      appointmentId: null,
      visitNo: null,
      serviceTypeId: null,
      actualStartTime: null,
      actualEndTime: null,
      surgeryLevelId: null,
      anaesthesiaTypeId: null,
      actualOtDate: null,
      actualOtDateMin: null,
      actualOtDateMax: null,
      isReExploration: false,
      reExplorationReason: null,
    });
    const procedureForm = this.registerForm.controls['procedureForm'] as FormArray;
    _.map(procedureForm.controls, (pf, pi) => {
      const procedureObj = {
        procedure: null,
        specialityId: null,
        isPrimary: false,
        surgeon: [],
        anesthetist: [],
        nurse: [],
      }
      procedureForm.at(pi).patchValue(procedureObj);
      const surgeonFrm = pf.controls['surgeon'] as FormArray;
      const anesthetistFrm = pf.controls['anesthetist'] as FormArray;
      const nurseFrm = pf.controls['nurse'] as FormArray;
      _.map(surgeonFrm.controls, (f, i) => {
        if (i > 0) {
          surgeonFrm.removeAt(i)
        } else {
          surgeonFrm.at(0).patchValue(this.addSurgeon(true));
        }
      });
      _.map(anesthetistFrm.controls, (f, i) => {
        if (i > 0) {
          anesthetistFrm.removeAt(i)
        } else {
          anesthetistFrm.at(0).patchValue(this.addAnanaesthetist(true));
        }
      });
      _.map(nurseFrm.controls, (f, i) => {
        if (i > 0) {
          nurseFrm.removeAt(i)
        } else {
          nurseFrm.at(0).patchValue(this.addScrubNurse(true));
        }
      });
    });

  }

  addSurgeon(isPrimary) {
    const formObj = {
      group: Constants.otUserGrpName.surgeon,
      type: isPrimary ? Constants.otUserGrpType.primary : null,
      desgKey: isPrimary ? Constants.userRoleType.surgeon.key : null,
      userId: null,
      userData: null,
    };
    return formObj;
  }

  addAnanaesthetist(isPrimary) {
    const formObj = {
      group: Constants.otUserGrpName.anaesthetist,
      type: isPrimary ? Constants.otUserGrpType.primary : null,
      desgKey: Constants.userRoleType.anaesthetist.key,
      userId: null,
      userData: null,
    };
    return formObj;
  }

  addScrubNurse(isPrimary) {
    const formObj = {
      group: Constants.otUserGrpName.scrub_nurse,
      type: isPrimary ? Constants.otUserGrpType.primary : null,
      desgKey: Constants.userRoleType.scrubNurse.key,
      userId: null,
      userData: null,
    };
    return formObj;
  }

  generateTimeArray(seldate) {
    this.startTimeArray.length = 0
    this.endTimeArray.length = 0
    const startTime = moment(moment(seldate).format(this.dateFormat) + ' 00:00:01');
    const endTime = moment(moment(seldate).format(this.dateFormat) + ' 23:59:00');
    const selDate = moment(moment(seldate).format(this.dateFormat));
    let addTimeMin = 0;
    let indx = 0;
    let diff = endTime.diff(startTime, 'minutes');
    const currentTime = moment();
    const currentDate = moment(moment().format(this.dateFormat));
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
  }

  saveValue() {
    this.submitted = true;
    if (this.registerForm.valid && this.submitted) {
      const formVal = this.registerForm.getRawValue();
      const proData = this.getAllProcedureListForSave();
      const param = {
        appointmentId: formVal.appointmentId,
        patientId: formVal.patientId,
        visitNo: formVal.visitNo,
        serviceTypeId: formVal.serviceTypeId,
        actualStartTime: formVal.actualStartTime,
        actualOtDate: formVal.actualOtDate,
        actualEndTime: formVal.actualEndTime,
        surgeryLevelId: formVal.surgeryLevelId,
        anaesthesiaTypeId: formVal.anaesthesiaTypeId,
        isReExploration: formVal.isReExploration,
        reExplorationReason: formVal.isReExploration ? formVal.reExplorationReason : null,
        procedureDetail: proData
      };
      this.otRegisterService.saveOTRegister(param).subscribe(res => {
        if (res.data) {
          this.submitted = false;
          this.setAlertMessage = {
            message: 'Value Updated',
            messageType: 'success',
            duration: Constants.ALERT_DURATION
          };
          setTimeout(() => {
            this.router.navigate(['/otApp/ot/register/list']);
          }, 1000);
        }
      });
    }
  }

  startTimeValueChange(value) {
    if (value) {
      const indx = _.findIndex(this.endTimeArray, v => {
        return v.time === value && !v.disabled;
      })
      this.registerForm.patchValue({
        actualStartTime: value
      });
      if (indx !== -1 && this.endTimeArray.length >= indx) {
        this.registerForm.patchValue({
          actualEndTime: this.endTimeArray[indx + 1].time
        });
      }
    } else {
      this.registerForm.patchValue({
        actualStartTime: null,
        actualEndTime: null
      });
    }
  }

  get getFrmCntrols() {
    return this.registerForm.controls;
  }

  updateDate(val) {
    if (val) {
      this.registerForm.patchValue({ date: val });
      this.otRegisterService.selectedRegisterDate = moment(val).format(this.dateFormat);
      this.loadPatientList();
    } else {
      this.registerForm.patchValue({ date: new Date() });
      this.otRegisterService.selectedRegisterDate = moment().format(this.dateFormat);
      this.loadPatientList();
    }
    this.clearForm();
    this.generateTimeArray(val);
  }

  getTimeFormatKey(): Promise<any> {
    const promise = new Promise((resolve, reject) => {
      this.userId = +this.authService.getLoggedInUserId();
      this.commonService.getQueueSettings(Constants.timeFormateKey, this.userId).subscribe(res => {
        this.timeFormateKey = res.time_format_key;
        if (this.timeFormateKey === '12_hour') {
          this.timeFormate = 'hh:mm A';
        } else {
          this.timeFormate = 'HH:mm';
        }
        resolve(this.timeFormate);
      });
    });
    return promise;
  }

  onSurgeonChange(event, index, pi) {
    const frm = this.registerForm.controls['procedureForm']['controls'][pi].controls['surgeon'] as FormArray;
    if (event) {
      // check sergeon Exist
      let exist = false;
      const frmData = this.registerForm.value;
      frmData.procedureForm.map((d, idx) => {
        if (idx !== pi) {
          d.surgeon.map((srgn, si) => {
            if (srgn.userId === event.userId) {
              exist = true;
            }
          });
        }
      });
      if (exist) {
        this.setAlertMessage = {
          message: 'Surgeon Already Selected',
          messageType: 'danger',
          duration: Constants.ALERT_DURATION
        };
        frm.at(index).patchValue({
          userId: null,
          userData: null
        });
      } else {
        frm.at(index).patchValue({
          userId: event.userId,
          userData: event
        });
      }
    } else {
      frm.at(index).patchValue({
        userId: null,
        userData: null
      });
    }
  }

  onAnaesthetistChange(event, index, pi) {
    const frm = this.registerForm.controls['procedureForm']['controls'][pi].controls['anesthetist'] as FormArray;
    if (event) {
      frm.at(index).patchValue({
        userId: event.userId,
        userData: event
      });
    } else {
      frm.at(index).patchValue({
        userId: null,
        userData: null
      });
    }
  }

  onProcedureChange(event, i) {
    const frm = this.registerForm.controls['procedureForm']['controls'][i];
    if (event) {
      // check procedure exist
      const frmData = this.registerForm.value;
      const indx = frmData.procedureForm.findIndex(d => {
        return d.procedure.id === event.id;
      });
      if (indx === -1) {
        frm.patchValue({
          procedureData: {
            procedureId: event.id,
            procedureName: event.name
          },
        });
      } else {
        this.setAlertMessage = {
          message: 'Procedure Already Selected',
          messageType: 'danger',
          duration: Constants.ALERT_DURATION
        };
        frm.patchValue({
          procedure: null,
          procedureData: null,
        });
        return;
      }
    } else {
      frm.patchValue({
        procedure: null,
      });
    }
  }

  onSurgeryLevelChange(event) {
    if (event) {
      this.registerForm.patchValue({
        surgeryLevelId: event.levelId,
      });
    } else {
      this.registerForm.patchValue({
        surgeryLevelId: null,
      });
    }
  }

  onAnaesthesiaTypeChange(event) {
    if (event) {
      this.registerForm.patchValue({
        anaesthesiaTypeId: event.typeId,
      });
    } else {
      this.registerForm.patchValue({
        anaesthesiaTypeId: null,
      });
    }
  }

  onScrubNurseChange(event, type) {
    if (event) {
      if (type === 'addScrubNurseId') {
        this.registerForm.patchValue({
          addScrubNurseId: event.userId,
        });
      } else {
        this.registerForm.patchValue({
          scrubNurseId: event.userId,
        });
      }
    } else {
      if (type === 'addScrubNurseId') {
        this.registerForm.patchValue({
          addScrubNurseId: null,
        });
      } else {
        this.registerForm.patchValue({
          scrubNurseId: null,
        });
      }
    }
  }

  private loadAddSurgeonList(searchTxt?) {
    this.surgeonList$ = concat(
      this.otScheduleService.getUsersList(searchTxt ? searchTxt : '', Constants.userRoleType.surgeon.key), // default items
      this.surgeonInput$.pipe(
        distinctUntilChanged(), debounceTime(500), switchMap(term => this.otScheduleService.getUsersList(term ? term : (searchTxt ? searchTxt : ''), Constants.userRoleType.surgeon.key).pipe(
          catchError(() => of([]))
        ))));
  }

  private loadAssSurgeonList(searchTxt?) {
    this.assSurgeonList$ = concat(
      this.otScheduleService.getUsersList(searchTxt ? searchTxt : '', Constants.userRoleType.assistantSurgeon.key), // default items
      this.assSurgeonInput$.pipe(
        distinctUntilChanged(),
        debounceTime(500),
        switchMap(term => this.otScheduleService.getUsersList(term ? term : (searchTxt ? searchTxt : ''), Constants.userRoleType.assistantSurgeon.key).pipe(
          catchError(() => of([]))))));
  }

  private loadAnaesthetistList(searchTxt?) {
    this.anaesthetistList$ = concat(
      this.otScheduleService.getUsersList(searchTxt ? searchTxt : '', Constants.userRoleType.anaesthetist.key), // default items
      this.anaesthetistInput$.pipe(
        distinctUntilChanged(),
        debounceTime(500),
        switchMap(term => this.otScheduleService.getUsersList(term ? term : (searchTxt ? searchTxt : ''), Constants.userRoleType.anaesthetist.key).pipe(
          catchError(() => of([]))))));
  }

  private loadScrubNurseList(searchTxt?) {
    this.scrubNurseList$ = concat(
      this.otScheduleService.getUsersList(searchTxt ? searchTxt : '', Constants.userRoleType.scrubNurse.key), // default items
      this.scrubNurseInput$.pipe(
        distinctUntilChanged(),
        debounceTime(500),
        switchMap(term => this.otScheduleService.getUsersList(term ? term : (searchTxt ? searchTxt : ''), Constants.userRoleType.scrubNurse.key).pipe(
          catchError(() => of([]))))));
  }

  private loadPatientList(searchTxt?) {
    this.patientList$ = concat(
      this.otRegisterService.getOTPatientSchedule(searchTxt ? searchTxt : ''), // default items
      this.patientInput$.pipe(
        distinctUntilChanged(),
        debounceTime(500),
        switchMap(term => this.otRegisterService.getOTPatientSchedule(term ? term : (searchTxt ? searchTxt : '')).pipe(
          catchError(() => of([]))))));
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


  loadSurgeryLevelList() {
    this.otRegisterService.getSurgeryLevelList().subscribe(res => {
      this.surgeryLevelList = res.data;
    });
  }

  loadAnaesthesiaTypeList() {
    this.otRegisterService.getAnaesthesiaTypeList().subscribe(res => {
      this.anaesthesiaTypeList = res.data;
    });
  }

  getOtRegisterDataByAppointmentId(aapId) {
    const promise = new Promise((resolve, reject) => {
      this.otRegisterService.getOTRegisterByAppointmentId(aapId).subscribe(res => {
        resolve(res.data);
      });
    });
    return promise;
  }

  addNewPatient() {
    const modalInstance = this.modalService.open(NewPatientAddComponent,
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

  onGrpTypeChange(type, isPrimary, val, index, parIndx) {
    if (isPrimary) {
      // const frm = this.registerForm.controls['procedureForm']['controls'][i].controls[type] as FormArray;
      this.registerForm.controls['procedureForm']['controls'][parIndx]['controls'][type]['controls'][index].patchValue({
        type: Constants.otUserGrpType.primary,
        desgKey: type === 'surgeon' ? Constants.userRoleType.surgeon.key
          : (type === 'anesthetist' ? Constants.userRoleType.anaesthetist.key
            : Constants.userRoleType.scrubNurse.key)
      });
      if (type === 'surgeon') {
        this.loadAddSurgeonList();
      } else if (type === 'anesthetist') {
        this.loadAnaesthetistList();
      } else {
        this.loadScrubNurseList();
      }
    } else if (val) {
      this.registerForm.controls['procedureForm']['controls'][parIndx]['controls'][type]['controls'][index].patchValue({
        type: val
      });
      if (type === 'surgeon' && val === Constants.otUserGrpType.assistant) {
        this.registerForm.controls['procedureForm']['controls'][parIndx]['controls'][type]['controls'][index].patchValue({
          desgKey: Constants.userRoleType.assistantSurgeon.key
        });
        this.loadAssSurgeonList();
      } else if (type === 'surgeon' && val === Constants.otUserGrpType.additional) {
        this.registerForm.controls['procedureForm']['controls'][parIndx]['controls'][type]['controls'][index].patchValue({
          desgKey: Constants.userRoleType.surgeon.key
        });
        this.loadAddSurgeonList();
      } else if (type === 'anesthetist') {
        this.registerForm.controls['procedureForm']['controls'][parIndx]['controls'][type]['controls'][index].patchValue({
          desgKey: Constants.userRoleType.anaesthetist.key
        });
        this.loadAnaesthetistList();
      } else {
        this.registerForm.controls['procedureForm']['controls'][parIndx]['controls'][type]['controls'][index].patchValue({
          desgKey: Constants.userRoleType.scrubNurse.key
        });
        this.loadScrubNurseList();
      }
    } else {
      this.registerForm.controls['procedureForm']['controls'][parIndx]['controls'][type]['controls'][index].patchValue({
        type: null
      });
    }
  }

  onAssSurgeonChange(event, index, pi) {
    const frm = this.registerForm.controls['procedureForm']['controls'][pi].controls['surgeon'] as FormArray;
    if (event) {
      frm.at(index).patchValue({
        userId: event.userId,
        userData: event
      });
    } else {
      frm.at(index).patchValue({
        userId: null,
        userData: null
      });
    }
  }

  addNewRow(type, index) {
    const frm = this.registerForm.controls['procedureForm']['controls'][index]['controls'][type]['controls'];
    if (type === 'surgeon') {
      frm.push(this.fb.group(this.addSurgeon(false)));
    } else if (type === 'anesthetist') {
      frm.push(this.fb.group(this.addAnanaesthetist(false)));
    } else {
      frm.push(this.fb.group(this.addScrubNurse(false)));
    }
  }

  addNewRowProcedure() {
    this.registerForm.controls['procedureForm']['controls'].push(this.fb.group(this.addProcedureForm(false)));
    // patch primary surgery value
    const formIndex = this.registerForm.get('procedureForm')['controls'].length;
    const frm = this.registerForm.controls['procedureForm']['controls'][formIndex - 1];
    const primaryData = this.registerForm.controls['procedureForm']['controls'][0].getRawValue();
    frm.get('surgeon')['controls'][0].patchValue({
      userId: primaryData.surgeon[0].userId,
      userData: primaryData.surgeon[0].userData,
    })
    frm.get('anesthetist')['controls'][0].patchValue({
      userId: primaryData.anesthetist[0].userId,
      userData: primaryData.anesthetist[0].userData,
    })
    frm.get('nurse')['controls'][0].patchValue({
      userId: primaryData.nurse[0].userId,
      userData: primaryData.nurse[0].userData,
    })
    this.loadProcedureList();
  }

  deleteRow(type, j, index) {
    const frm = this.registerForm.controls['procedureForm']['controls'][index]['controls'][type] as FormArray;
    if (j === 0) {
      return;
    }
    frm.removeAt(j);
  }

  deleteRowProcedure(j) {
    if (j === 0) {
      return;
    }
    const frm = this.registerForm.get('procedureForm') as FormArray;
    frm.removeAt(j);
  }

  onNurseChange(event, index) {
    if (event) {
      this.registerForm.controls['nurse']['controls'][index].patchValue({
        userId: event.userId,
        userData: event
      });
    } else {
      this.registerForm.controls['nurse']['controls'][index].patchValue({
        userId: null,
        userData: null
      });
    }
  }

  updateProcedureFormdata(data) {
    const frm = this.registerForm.controls['procedureForm'] as FormArray;
    this.otScheduleService.selectedSpecialityId = data.specialityId;
    _.map(data.procedureDetail, (pd, i) => {
      if (i > 0) {
        frm.push(this.fb.group(this.addProcedureForm(false)));
      }
      const procedureObj = {
        procedure: {
          id: pd.procedureId,
          name: pd.procedureName,
        },
        procedureData: {
          procedureId: pd.procedureId,
          procedureName: pd.procedureName,
        },
        isPrimary: pd.isPrimary,
        isExpand: true,
        surgeon: [],
        anesthetist: [],
        nurse: [],
        specialityId: data.specialityId
      }
      frm.at(i).patchValue(procedureObj);
      this.updateUserdata('surgeon', pd, i);
      this.updateUserdata('anesthetist', pd, i);
      this.updateUserdata('nurse', pd, i);
    });
  }

  updateUserdata(type, data, i) {
    let main;
    const userData = data.userData;
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
      const frm = this.registerForm.controls['procedureForm']['controls'][i].controls[type] as FormArray;
      frm.at(0).patchValue(main);
      _.map(sub, (d, idx) => {
        this.addNewRow(type, i);
        frm.at(idx + 1).patchValue(d);
      });
    }

  }

  getAllProcedureListForSave() {
    const formVal = this.registerForm.getRawValue();
    const pfArray = [];
    _.map(formVal.procedureForm, pf => {
      if (pf.procedureData && pf.procedureData.procedureId) {
        const pfObj = {
          procedureId: pf.procedureData.procedureId,
          isPrimary: pf.isPrimary,
          userData: []
        };
        _.map(pf.surgeon, dt => {
          if (dt.type && dt.userId) {
            pfObj.userData.push(_.clone({
              userGroup: dt.group,
              type: dt.type,
              desgKey: dt.desgKey,
              userId: dt.userId,
            }));
          }
        });
        _.map(pf.anesthetist, dt => {
          if (dt.type && dt.userId) {
            pfObj.userData.push(_.clone({
              userGroup: dt.group,
              type: dt.type,
              desgKey: dt.desgKey,
              userId: dt.userId,
            }));
          }
        });
        _.map(pf.nurse, dt => {
          if (dt.type && dt.userId) {
            pfObj.userData.push(_.clone({
              userGroup: dt.group,
              type: dt.type,
              desgKey: dt.desgKey,
              userId: dt.userId,
            }));
          }
        });
        pfArray.push({ ...pfObj });
      }
    });

    return pfArray;
  }

  loadList() {
    this.router.navigate(['/otApp/ot/register/list']);
  }

}

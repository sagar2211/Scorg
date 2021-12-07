import { Component, ViewChild, enableProdMode, OnInit } from '@angular/core';
import { OtSchedulerService } from '../../services/ot-scheduler.service';
import { PatientData, TheatreData, Data } from '../../modal/ot-scheduler';
import { DxSchedulerComponent } from 'devextreme-angular';
import Query from 'devextreme/data/query';
import notify from 'devextreme/ui/notify';
import * as _ from 'lodash';
import * as moment from 'moment';
import { NgSelectModule, NgOption } from '@ng-select/ng-select';
import { Subscription } from 'rxjs';
import { OtMasterService } from 'src/app/ot module/ot/services/ot-master.service';
import { OtScheduleService } from '../../services/ot-schedule.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OtPatientAppointmentAddUpdateComponent } from '../ot-patient-appointment-add-update/ot-patient-appointment-add-update.component';
import { IAlert } from 'src/app/public/models/AlertMessage';
import { Constants } from 'src/app/config/constants';
import { CommonService } from 'src/app/public/services/common.service';
import { ActivatedRoute } from '@angular/router';
import { promise } from 'selenium-webdriver';
import { AuthService } from 'src/app/public/services/auth.service';

@Component({
  selector: 'app-ot-scheduler',
  templateUrl: './ot-scheduler.component.html',
  styleUrls: ['./ot-scheduler.component.scss']
})
export class OtSchedulerComponent implements OnInit {

  @ViewChild(DxSchedulerComponent, { static: false }) scheduler?: DxSchedulerComponent;
  setAlertMessage: IAlert;

  data = [];
  oprationComplete = [];
  patientsData = [];
  theatreData = [];
  allTheaterId = [];
  selectedTheatreIdsDay = [];
  selectedTheatreIdsWeek = [];
  weekOffArray = [];

  currentTime = new Date();
  currentDate: Date = new Date();
  flag = true;
  otStartTime = Number.POSITIVE_INFINITY;
  otEndTime = Number.NEGATIVE_INFINITY;
  dataSubscription: Subscription;
  otSubscription: Subscription;
  searchString: string = '';
  loadCalendar = false;
  roomData;
  public dayName;
  currentView = "day";
  isdDragable = true;
  indicatorUpdateInterval = 10000;

  constructor(
    private service: OtSchedulerService,
    private otMasterService: OtMasterService,
    private otScheduleService: OtScheduleService,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private modalService: NgbModal
  ) {

  }

  ngOnInit() {
    this.commonService.routeChanged(this.route);
    this.getOTRoomList().then((result) => {
      this.getTimeFormate().then((res) => {
        this.createOTSchedule();
        this.loadCalendar = true;
        this.getOTAppointmentData().then();
      });
    });
  }

  onContentReady(e) {
    setTimeout(() => {
      e.component.scrollTo(new Date());
    }, 100);

  }

  getOTRoomList() {
    let promise = new Promise((resolve, reject) => {
      this.otSubscription = this.otMasterService.getOTRoomBySearchKeyword(this.searchString).subscribe((response) => {
        this.theatreData = [];
        this.allTheaterId = [];
        let dt = moment(this.currentDate, "YYYY-MM-DD")
        this.dayName = dt.format('dddd').toLowerCase();
        if (response.length) {
          _.map(response, (val, key) => {
            const ot = new TheatreData();
            if (val.weekOff[this.dayName]) {
              val.isCurrentDayWeekOff = true;
            }
            ot.generateObject(val)
            this.allTheaterId.push(ot);
          })
        }
        this.theatreData = _.cloneDeep([this.allTheaterId[0]]);
        this.selectedTheatreIdsDay = _.cloneDeep([this.allTheaterId[0].id]);
        this.selectedTheatreIdsWeek = _.cloneDeep(this.allTheaterId[0].id);
        resolve(this.theatreData);
      })
    })
    return promise;
  }

  getTimeFormate() {
    let promise = new Promise((resolve, reject) => {
      const userId = +this.authService.getLoggedInUserId();
      this.commonService.getQueueSettings(Constants.timeFormateKey, userId).subscribe(res => {
        resolve(res);
      });
    })
    return promise;
  }

  getOTAppointmentData() {
    let param = {
      roomId: [],
      fromDate: this.currentDate,
      toDate: this.currentDate
    }
    if (this.currentView === "week") {
      let roomIds = this.selectedTheatreIdsWeek.length > 0 ? this.selectedTheatreIdsWeek : _.map(this.allTheaterId, d => {
        return d.id;
      })
      param.roomId = roomIds;
      param.fromDate = new Date(moment(this.currentDate).startOf("week").format('YYYY-MM-DD'));
      param.toDate = new Date(moment(this.currentDate).endOf("week").format('YYYY-MM-DD'));
    }
    if (this.currentView === "day") {
      let roomIds = this.selectedTheatreIdsDay.length > 0 ? this.selectedTheatreIdsDay : _.map(this.allTheaterId, d => {
        return d.id;
      })
      param.roomId = roomIds;
    }
    let promise = new Promise((resolve, reject) => {
      this.otScheduleService.getOTAppointmentData(param).subscribe((response) => {
        this.data = [];
        if (response.length) {
          _.map(response, (val, key) => {
            const appointmentData = new Data();
            let startTime = moment(val.appointmentDate).format('YYYY-MM-DD') + ' ' + val.startTime;
            let endTime = moment(val.appointmentDate).format('YYYY-MM-DD') + ' ' + val.endTime;
            val.startTime = new Date(startTime);
            val.endTime = new Date(endTime);
            appointmentData.generateObject(val, this.allTheaterId);
            this.data.push(appointmentData);
            
            const patientData = new PatientData();
            patientData.generateObject(val);
            if (patientData)
              this.patientsData.push(patientData);
          })
        }
        resolve(this.data);
      })
    })
    return promise;
  }

  getOTRooms(e, from) {
    if (from === 'day') {
      this.theatreData = e;
      this.getOTAppointmentData();
    } else {
      this.theatreData = [e];
      this.getOTAppointmentData();
    }
  }

  onCellClick(data) {
    if (this.checkHaveWeekOff(data.cellData.groups.theatreId, data.cellData)) {
      return;
    } else if (this.checkOtTiming(data.cellData)) {
      return;
    }
    const appData = this.checkCellHaveAppointment(data.cellData);
    if (appData) {
      return;
    }
    if (moment(data.cellData.endDate).isSameOrBefore(moment())) {
      data.cancel = true;
      let setAlertMessage = {
        message: 'Cannot create or move an appointment/event to disabled time/date regions/week off.!',
        messageType: 'error',
        duration: Constants.ALERT_DURATION
      };
      this.notifyDisableDate(setAlertMessage);
    } else {
      let otData = _.find(this.allTheaterId, d => {
        return d.id === data.cellData.groups.theatreId;
      });
      let obj = this.genObjForAppointment(data.cellData, otData);
      this.openAddAppointmentPopup(data.cellData.startDate, obj)
    }
  }

  checkCellHaveAppointment(cellData) {
    const appData = this.data.find(d => {
      const sDate = moment(d.startDate).add(1, 'second');
      const eDate = moment(d.endDate).subtract(1, 'second');
      return (moment(cellData.startDate).isBetween(moment(sDate), moment(eDate), undefined, '[]')
        || moment(cellData.endDate).isBetween(moment(sDate), moment(eDate), undefined, '[]'))
        && cellData.groups.theatreId === d.theatreId;
    });
    return appData;
  }

  onOptionChange(e: any) {
    if (e.name === "currentDate") {
      this.currentDate = e.value;
      let dt = moment(this.currentDate, "YYYY-MM-DD")
      this.dayName = dt.format('dddd').toLowerCase();
      this.data = [];
      this.patientsData = [];
      this.getOTAppointmentData();
    }
    if (e.name === "currentView") {
      this.currentView = e.value;
      this.getOTRoomList().then(r => {
        this.getOTAppointmentData().then();
      });
    }
  }

  createOTSchedule() {
    let otStartTime = _.minBy(this.theatreData, d => {
      return new Date(moment().format('YYYY-MM-DD') + ' ' + d.startTime);
    }).startTime;
    let otEndTime = _.maxBy(this.theatreData, d => {
      return new Date(moment().format('YYYY-MM-DD') + ' ' + d.endTime);
    }).endTime;
    this.otStartTime = +moment(moment().format('YYYY-MM-DD') + ' ' + otStartTime).format('HH');
    this.otEndTime = +moment(moment().format('YYYY-MM-DD') + ' ' + otEndTime).format('HH');
  }

  onAppointmentUpdating(e: any) {
    let cellData = this.generateCellData(e);
    if (
      // this.checkHaveAppointment(e.newData) ||
      this.checkHaveWeekOff(e.newData.theatreId, e.newData)
      || this.checkOtTiming(cellData)
      || this.checkPassedTiming(cellData)) {
      e.cancel = true;
      return;
    }
    e.newData.colorCode = this.getColorCode(e.newData);
    const formVal = e.newData;
    const params = this.generateObjForUpdateAppointment(formVal);
    e.cancel = this.updateAppointmentOnDrag(params).then(r => {
      return r;
    });
  }

  getColorCode(data) {
    const ot = this.allTheaterId.find(d => {
      return d.id === data.theatreId;
    });
    return ot.colorCode;
  }

  updateAppointmentOnDrag(params) {
    let promise = new Promise((resolve, reject) => {
      this.otScheduleService.saveAppointment(params).subscribe(res => {
        if (res) {
          this.setAlertMessage = {
            message: res.message,
            messageType: res.status_code === 400 ? 'danger' : 'success',
            duration: Constants.ALERT_DURATION
          };
          res.status_code === 400 ? resolve(true) : resolve(false);
        } else {
          resolve(true);
        }
      });
    });
    return promise;
  }

  checkPassedTiming(cellData) {
    const ot = this.allTheaterId.find(d => {
      return d.id === cellData.groups.theatreId
    });
    const dayName = moment(cellData.startDate).format('dddd').toLowerCase();
    if (!ot.weekOff[dayName]) {
      const apmtStartDate = moment(cellData.startDate).format('YYYY-MM-DD');
      const apmtStartTime = moment(cellData.startDate).format('HH:mm:00');
      const currentStartTime = moment(this.currentTime).format('HH:mm:00');
      const currentDate = moment(this.currentTime).format('YYYY-MM-DD');
      if (apmtStartDate < currentDate || (apmtStartDate === currentDate && apmtStartTime < currentStartTime)) {
        return true;
      } else {
        return false;
      }
    } else {
      return true;
    }
  }

  generateCellData(e) {
    let cellData = {
      startDate: e.newData.startDate,
      endDate: e.newData.endDate,
      groups: {
        theatreId: e.newData.theatreId
      }
    }
    return cellData;
  }

  generateObjForUpdateAppointment(formVal) {
    const params = {
      appointmentId: formVal.appointmentId ? formVal.appointmentId : 0,
      roomId: formVal.theatreId,
      appointmentDate: moment(formVal.startDate).format('YYYY-MM-DD'),
      startTime: moment(formVal.startDate).format('HH:mm:00'),
      endTime: moment(formVal.endDate).format('HH:mm:00'),
      patientId: formVal.patientId,
      specialityId: formVal.specialityId,
      procedureId: formVal.procedureId,
      note: formVal.note,
      statusId: formVal.statusId,
      userData: formVal.userData
    };
    return params;
  }

  notifyDisableDate(alertObj) {
    notify(alertObj.message, alertObj.messageType, alertObj.duration);
  }

  checkHaveWeekOff(theatreId, newScheduleData?) {
    const otData = _.find(this.allTheaterId, d => {
      return d.id === theatreId;
    })
    if (this.currentView == "day") {
      if (otData) {
        return otData.isCurrentDayWeekOff;
      } else {
        return false;
      }
    } else {
      let dt = moment(newScheduleData.startDate).format('YYYY-MM-DD');
      let dayName = moment(dt).format('dddd').toLowerCase();
      if (otData.weekOff[dayName] === true) {
        return true;
      } else {
        false;
      }
    }

  }

  checkHaveAppointment(appointmentData: any) {
    let retVal = false;
    const formVal = appointmentData;
    const startDate = moment(formVal.startDate).format('MM/DD/YYYY');
    const selectedDate = moment(this.currentDate).format('MM/DD/YYYY');
    if (moment(startDate).isSame(selectedDate)) {
      const check = _.filter(this.data, function (element) {
        return (formVal.theatreId == element.theatreId &&
          (moment(formVal.startDate).isSame(moment(element.startDate))
            || moment(formVal.startDate).isSame(moment(element.endDate))
            || moment(formVal.endDate).isSame(moment(element.startDate))
            || moment(formVal.endDate).isSame(moment(element.endDate))
            || moment(formVal.startDate).isBetween(element.startDate, element.endDate, undefined, '[]')
            || moment(formVal.endDate).isBetween(element.startDate, element.endDate, undefined, '[]'))
          || formVal.startDate < new Date())
      })
      retVal = check.length > 0 ? true : false;
      if (!retVal) {
        const hours = appointmentData.startDate.getHours();
        retVal = hours <= this.otStartTime && hours > this.otEndTime;
      }
    }
    return retVal;
  }

  onAppointmentClick(data) {
    setTimeout(() => {
      data.component.hideAppointmentTooltip();
    }, 500);

    let appointStartTime = moment(data.appointmentData.startDate).format("HH:mm:ss");
    let appointEndTime = moment(data.appointmentData.endDate).format("HH:mm:ss");
    let otData = _.find(this.allTheaterId, d => {
      return d.id === data.appointmentData.theatreId;
    });
    let patientData = _.find(this.patientsData, d => {
      return d.id === data.appointmentData.patientId;
    });
    let appointmentInfo = _.find(this.data, d => {
      return d.theatreId === data.appointmentData.theatreId
        && moment(d.startDate).format("YYYY-MM-DD") === moment(data.appointmentData.startDate).format("YYYY-MM-DD")
        && moment(d.startDate).format("HH:mm:ss") === appointStartTime
        && moment(d.endDate).format("HH:mm:ss") === appointEndTime;
    })
    let obj = this.genObjForAppointment(data.appointmentData, otData);
    let selectedAppointment = this.genAppointmentObj(data, appointmentInfo, otData, patientData);
    this.openAddAppointmentPopup(data.appointmentData.startDate, obj, selectedAppointment);
  }

  genAppointmentObj(data, appointmentInfo, otData, patientData) {
    let selectedAppointment = {
      "id": appointmentInfo.appointmentId,
      "start": data.appointmentData.startDate,
      "end": data.appointmentData.endDate,
      "meta": {
        "appointmentDate": appointmentInfo.appointmentDate,
        "appointmentId": appointmentInfo.appointmentId,
        "startTime": otData.startTime,
        "endTime": otData.endTime,
        "specialityId": appointmentInfo.specialityId,
        "specialityName": appointmentInfo.specialityName,
        "statusId": appointmentInfo.statusId,
        "statusName": appointmentInfo.statusName,
        "procedureId": appointmentInfo.procedureId,
        "procedureName": appointmentInfo.procedureName,
        "patientInfo": {
          "age": patientData.age,
          "address": patientData.address,
          "patientId": patientData.id,
          "patientName": patientData.patientName,
          "patImage" : patientData.patImage,
          "mobileNo": patientData.mobileNo,
          "gender": patientData.gender,
          "emailId": patientData.email
        },
        "userData": appointmentInfo.userData,
        "note": appointmentInfo.note || null
      }
    }
    return selectedAppointment;
  }

  genObjForAppointment(data, otData) {
    let obj = {
      "appointmentDate": data.startDate,
      "startTime": otData.startTime,
      "endTime": otData.endTime,
      "roomId": otData.id,
      "roomDesc": otData.text,
      "weekOff": otData.weekOff,
    }
    return obj;
  }

  getPatientById(id: any) {
    return Query(this.patientsData).filter(["id", "=", id]).toArray()[0];
  }

  openAddAppointmentPopup(appDateTime, selectedRoom?, data?) {
    const addUpdateData = {
      room: selectedRoom,
      title: data ? 'UPDATE' : 'ADD',
      selectedAppointment: data ? data : null,
      appointmentDate: appDateTime,
      appointmentList: [],
    };

    const modalInstance = this.modalService.open(OtPatientAppointmentAddUpdateComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false,
        windowClass: 'custom-modal add-edit-OT-patient-details',
        container: '#homeComponent',
        size: 'lg'
      });
    modalInstance.result.then((result) => {
      if (result === 'yes') {
        this.setAlertMessage = {
          message: data ? 'OT Rescheduled Successfully' : 'OT Scheduled Successfully',
          messageType: 'success',
          duration: Constants.ALERT_DURATION
        };
        this.getOTAppointmentData();
      } else if (result === 'no') {
      }
    })
    console.log(addUpdateData)
    modalInstance.componentInstance.addUpdateData = addUpdateData;
  }

  isDateTimePassed(cellData) {
    if (moment().isSameOrBefore(moment(cellData.startDate))) {
      return false;
    } else {
      return true;
    }
  }

  onAppointmentAdding(val) {
    console.log('onAppointmentAdding', val);
  }

  checkOtTiming(cellData) {
    const ot = this.allTheaterId.find(d => {
      return d.id === cellData?.groups?.theatreId
    });
    const dayName = moment(cellData.startDate).format('dddd').toLowerCase();
    if (ot && !ot?.weekOff[dayName]) {
      const sTime = moment(moment(moment(moment(cellData?.startDate).format('YYYY-MM-DD') + ' ' + ot.startTime)).format('YYYY-MM-DD HH:mm:ss'));
      const eTime = moment(moment(moment(cellData?.startDate).format('YYYY-MM-DD') + ' ' + ot.endTime).format('YYYY-MM-DD HH:mm:ss'));
      const cellSTime = moment(moment(cellData?.startDate).add('1', 'seconds').format('YYYY-MM-DD HH:mm:ss'));
      const cellETime = moment(moment(cellData?.endDate).subtract('1', 'seconds').format('YYYY-MM-DD HH:mm:ss'));
      if (moment(cellSTime).isBetween(sTime, eTime, undefined, '[]')
        && moment(cellETime).isBetween(sTime, eTime, undefined, '[]')) {
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  }

  onAppointmentRendered(e) {
    var el = e.appointmentElement;
    el.onmouseenter = (args) => {
      // this.isdDragable = !e.appointmentData.disabledDrag;
      setTimeout(() => {
        e.component.showAppointmentTooltip(e.appointmentData, e.appointmentElement, e.targetedAppointmentData);
      }, 300);
    }
    el.onmouseeleave = (args) => {
      // this.isdDragable = true
      setTimeout(() => {
        e.component.hideAppointmentTooltip();
      }, 300);
    }
  }
}

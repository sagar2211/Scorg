import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OtMasterService } from 'src/app/ot module/ot/services/ot-master.service';
import { CommonService } from 'src/app/public/services/common.service';
import { Constants } from 'src/app/config/constants';
import { AuthService } from 'src/app/public/services/auth.service';
import { IAlert } from 'src/app/public/models/AlertMessage';
import * as moment from 'moment';
@Component({
  selector: 'app-ot-room-master',
  templateUrl: './ot-room-master.component.html',
  styleUrls: ['./ot-room-master.component.scss']
})
export class OtRoomMasterComponent implements OnInit {
  @Input() addUpdateData: any;
  otMasterForm: FormGroup;
  loadForm: boolean;
  submitted: boolean;

  isShowCrossIcon = true;
  userId: any;
  timeFormateKey: string;
  timeFormate: string;
  setAlertMessage: IAlert;
  timeArray = [];
  colorList = [];
  showColorDropDown = true;

  constructor(
    public modal: NgbActiveModal,
    private fb: FormBuilder,
    private otMasterService: OtMasterService,
    private commonService: CommonService,
    private authService: AuthService,
  ) { }

  ngOnInit() {
    this.loadForm = false;
    this.submitted = false;
    this.getTimeFormatKey().then(res => {
      this.timeArrayGenrate();
      this.createForm();
      if (this.addUpdateData.data) {
        // update room master
        this.getRoomData().then();
      }
    });
    this.updateColorArray();
  }

  updateColorArray() {
    this.colorList = [
      ['#eeece1', '#ddd9c3', '#c4bd97', '#938953', '#938953'],
      ['#4f81bd', '#dbe5f1', '#b8cce4', '#95b3d7', '#366092'],
      ['#1f497d', '#c6d9f0', '#8db3e2', '#548dd4', '#17365d'],
      ['#c0504d', '#f2dcdb', '#e5b9b7', '#d99694', '#953734'],
      ['#9bbb59', '#ebf1dd', '#d7e3bc', '#c3d69b', '#76923c'],
      ['#8064a2', '#e5e0ec', '#ccc1d9', '#b2a2c7', '#5f497a'],
      ['#4bacc6', '#dbeef3', '#b7dde8', '#92cddc', '#31859b'],
      ['#f79646', '#fdeada', '#fbd5b5', '#fac08f', '#e36c09'],
    ];
    console.log(this.colorList);
  }

  createForm() {
    const formObj = {
      roomId: [null],
      roomDesc: [null, [Validators.required]],
      startTime: [null, [Validators.required]],
      endTime: [null, [Validators.required]],
      color: [null, [Validators.required]],
      monday: [false],
      tuesday: [false],
      wednesday: [false],
      thursday: [false],
      friday: [false],
      saturday: [false],
      sunday: [false],
      isActive: [true, [Validators.required]]
    };
    this.otMasterForm = this.fb.group(formObj);
    this.loadForm = true;
  }

  saveValue() {
    this.submitted = true;
    if (this.otMasterForm.valid && this.submitted) {
      const formVal = this.otMasterForm.getRawValue();
      let startTime = formVal.startTime;
      let endTime = formVal.endTime;
      const startDateTime = moment(moment().format('YYYY-MM-DD') + ' ' + startTime);
      const endDateTime = moment(moment().format('YYYY-MM-DD') + ' ' + endTime);
      if (startDateTime.isSameOrAfter(endDateTime)) {
        this.notifyAlertMessage({
          msg: 'Start time must before end time!',
          class: 'danger',
        });
        return;
      }
      const param = {
        roomId: formVal.roomId ? formVal.roomId : 0,
        roomDesc: formVal.roomDesc,
        startTime: startTime,
        endTime: endTime,
        isActive: formVal.isActive,
        colorCode: formVal.color,
        weekOff: {
          monday: formVal.monday,
          tuesday: formVal.tuesday,
          wednesday: formVal.wednesday,
          thursday: formVal.thursday,
          friday: formVal.friday,
          saturday: formVal.saturday,
          sunday: formVal.sunday
        }
      }
      this.otMasterService.saveOTRoomDetail(param).subscribe(res => {
        if (res) {
            if(res.data){
              this.notifyAlertMessage({
              msg: formVal.roomId ? 'OT Updated!' : 'OT Added!',
              class: 'success',
            });
          } else {
            this.notifyAlertMessage({
              msg: res.message ? res.message :'Something Went Wrong!',
              class: 'danger',
            });
          }
          setTimeout(() => {
            this.closeModal('yes');
          }, 1500);
        }
      });
    }

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

  getRoomData(): Promise<any> {
    const promise = new Promise((resolve, reject) => {
      const id = this.addUpdateData.data.roomId;
      this.otMasterService.getOTRoomDetailById(id).subscribe(res => {
        if (res.data) {
          console.log(res);
          this.otMasterForm.patchValue({
            roomDesc: res.data.roomDesc,
            color: res.data.colorCode,
            roomId: res.data.roomId,
            monday: res.data.weekOff.monday,
            tuesday: res.data.weekOff.tuesday,
            wednesday: res.data.weekOff.wednesday,
            thursday: res.data.weekOff.thursday,
            friday: res.data.weekOff.friday,
            saturday: res.data.weekOff.saturday,
            sunday: res.data.weekOff.sunday,
            noOfDays: res.data.noOfDays,
            slotDuration: res.data.slotDuration,
            isActive: res.data.isActive,
          });
          const startTime = moment(moment().format('YYYY-MM-DD') + ' ' + res.data.startTime);
          const endTime = moment(moment().format('YYYY-MM-DD') + ' ' + res.data.endTime);
          if (this.timeFormateKey === '12_hour') {
            this.otMasterForm.patchValue({
              startTime: startTime.format('hh:mm a'),
              endTime: endTime.format('hh:mm a')
            });
          } else {
            this.otMasterForm.patchValue({
              startTime: startTime.format('HH:mm'),
              endTime: endTime.format('HH:mm')
            });
          }
        }
        resolve(res);
      });
    });
    return promise;
  }

  timeArrayGenrate() {
    if (this.timeFormateKey === '12_hour') {
      this.timeArray = this.genrate12HRtimearray();
    } else {
      for (let i = 0; i < 24; i++) {
        const time = (i < 10 ? '0' + i : i) + ':' + '00';
        const time1 = (i < 10 ? '0' + i : i) + ':' + '30';
        this.timeArray.push(time);
        this.timeArray.push(time1);
      }
    }
  }

  genrate12HRtimearray() {
    const x = 30; //minutes interval
    const times = []; // time array
    let tt = 0; // start time
    const ap = ['AM', 'PM']; // AM-PM

    //loop to increment the time and push results in array
    for (var i = 0; tt < 24 * 60; i++) {
      var hh = Math.floor(tt / 60); // getting hours of day in 0-24 format
      var mm = (tt % 60); // getting minutes of the hour in 0-55 format
      times[i] = ("0" + (hh % 12)).slice(-2) + ':' + ("0" + mm).slice(-2) + ' ' + ap[Math.floor(hh / 12)]; // pushing data in array in [00:00 - 12:00 AM/PM format]
      tt = tt + x;
    }
    return times;
  }

  get getFrmCntrols() {
    return this.otMasterForm.controls;
  }

  onTimeChange(type, from, value) {
    if (!value) {
      this.otMasterForm.patchValue({
        startTimeHr: null,
        startTimeMin: null,
        startAmPm: null,
        endTimeHr: null,
        endTimeMin: null,
        endAmPm: null,
      });
    }
    if (from === 'start') {
      if (type === 'hr') {
        this.otMasterForm.patchValue({
          startTimeHr: value
        });
      } else {
        this.otMasterForm.patchValue({
          startTimeMin: value
        });
      }
    } else {
      if (type === 'hr') {
        this.otMasterForm.patchValue({
          endTimeHr: value
        });
      } else {
        this.otMasterForm.patchValue({
          endTimeMin: value
        });
      }
    }

  }

  onAmPmChange(from, value) {
    if (!value) {
      this.otMasterForm.patchValue({
        startAmPm: null,
        endAmPm: null,
      });
    }
    if (from === 'start') {
      this.otMasterForm.patchValue({
        startAmPm: value
      });
    } else {
      this.otMasterForm.patchValue({
        endAmPm: value
      });
    }
  }

  closeModal(type) {
    this.modal.close(type);
  }

  notifyAlertMessage(data): void {
    this.setAlertMessage = {
      message: data.msg,
      messageType: data.class,
      duration: Constants.ALERT_DURATION
    };
  }


}

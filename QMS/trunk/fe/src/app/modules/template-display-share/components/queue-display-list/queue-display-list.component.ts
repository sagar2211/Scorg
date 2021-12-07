import { CustomEventsService } from './../../../../services/custom-events.service';
import { CommonService } from 'src/app/services/common.service';
import { Component, OnInit, Input } from '@angular/core';
import { IAlert } from 'src/app/models/AlertMessage';
import * as _ from 'lodash';
import { ActivatedRoute } from '@angular/router';
import { Constants } from 'src/app/config/constants';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DisplayListService } from 'src/app/modules/display/services/display-list.service';
import { SignalRSocket } from 'src/app/modules/display/services/signalR.soclets.service';

@Component({
  selector: 'app-queue-display-list',
  templateUrl: './queue-display-list.component.html',
  styleUrls: ['./queue-display-list.component.scss'],
  providers: [DisplayListService]
})
export class QueueDisplayListComponent implements OnInit {
  @Input() source: any;

  alertMsg: IAlert;
  dispalyData: any;
  doctorFieldsMask = [];
  patientFieldsMask = [];
  displayGridTemplate: string;
  displayUserTemplate: string;
  braningSectionVisble: boolean;
  doctorFieldShow = [];
  queueFieldShow = [];
  nextFieldShow = [];
  callingFieldShow = [];
  displayDoctorPatData = [];
  doctorMaskData = [];
  patientMaskData = [];
  displaytemplateNumber = '';

  constructor(
    private displayListService: DisplayListService,
    private route: ActivatedRoute,
    private socket: SignalRSocket,
    private commonService: CommonService,
    private eventsService: CustomEventsService
  ) { }

  ngOnInit() {
    if (this.source && this.source.isPreviewQueueTemplate) {
      this.displaytemplateNumber = this.source.TemplateData.selected_template;
    } else {
      this.displaytemplateNumber = this.route.snapshot.params.templateName;
    }
    this.getAllFieldSettings().subscribe(res => {
      if (this.source && this.source.isPreviewQueueTemplate) {
        const JsonData = this.source.TemplateData.jsonData;
        const displayTemplateType = this.displaytemplateNumber;
        JsonData.next_fields_key = JsonData.next_fields_key ? JsonData.next_fields_key : [];
        this.commonService.setDummyDataVal(JsonData, displayTemplateType);
        this.dispalyData = this.commonService.dispalyDummyData;
        this.getDisplaySetting();
      } else {
        const displayTemplateType = this.displaytemplateNumber;
        const sectionName = this.route.snapshot.params.sectionName;
        this.getDisplayListQueue(sectionName, displayTemplateType);
      }
    });
    this.socket.$changeEvent.subscribe((obj: any) => {
      this.dispalyData = obj.LivePatientQueueData;
      this.getDisplaySetting();
    });
  }

  getDisplayListQueue(sectionName, displayTemplateType) {
    if (displayTemplateType === '9') {
      this.displayListService.getDisplayDataByTemplate(sectionName).subscribe(res => {
        if (res) {
          this.dispalyData = res.LivePatientQueueData;
          this.getDisplaySetting();
        } else {
          this.dispalyData = {};
        }
        this.socket.init(this.route.snapshot.params.sectionName, displayTemplateType);
      });
    } else {
      this.displayListService.getWaitingQueueDisplayList(sectionName).subscribe(res => {
        if (res) {
          this.dispalyData = res.LivePatientQueueData;
          this.getDisplaySetting();
        } else {
          this.dispalyData = {};
        }
        this.socket.init(this.route.snapshot.params.sectionName, displayTemplateType);
      });
    }
  }

  getDisplaySetting() {
    this.displayDoctorPatData = [];
    const jsonData = JSON.parse(this.dispalyData.field_settings);
    this.displayUserTemplate = this.dispalyData.template_type;
    this.displayGridTemplate = jsonData ? jsonData.grid_template_key : null;
    this.braningSectionVisble = jsonData ? jsonData.displayBranding ? jsonData.displayBranding : false : false;
    this.doctorFieldShow = jsonData ? jsonData.doctor_fields_key : false;
    this.queueFieldShow = jsonData ? jsonData.queue_fields_key : false;
    this.nextFieldShow = jsonData ? jsonData.next_fields_key : false;
    this.callingFieldShow = jsonData ? jsonData.calling_fields_key : false;
    this.eventsService.mastDisplayActiveColor = jsonData ? jsonData.activeThemeColor ? jsonData.activeThemeColor : 'option-1' : 'option-1';
    // this.dispalyData.SectionWiseLivePatientQueueData
    if (this.displayUserTemplate === 'display_template_9' && !(this.source && this.source.isPreviewQueueTemplate)) {
      this.generateDoctorQueueDataTemplateWise(this.dispalyData.DoctorWiseLivePatientQueueData);
    } else {
      this.generateDoctorQueueData(this.dispalyData.SectionWiseLivePatientQueueData);
    }
  }

  generateDoctorQueueDataTemplateWise(qData) {
    _.map(qData, (v) => {
      if (!_.isEmpty(v)) {
        let docNameMask = 0;
        let docNameMaskType = null;
        let docSpecilityMask = 0;
        let docSpecilityMaskType = null;
        let docMaskOnWord = false;
        let docSpecilityMaskOnWord = false;
        let patNameMask = 0;
        let patNameMaskType = null;
        let patContactMask = 0;
        let patContactMaskType = null;
        let patMaskOnWord = false;
        if (this.doctorFieldsMask.length > 0) {
          const maskedDataName = this.getMaskData(this.doctorFieldsMask, 'name');
          const maskedDataSpe = this.getMaskData(this.doctorFieldsMask, 'speciality');
          docNameMask = maskedDataName.maskNumber;
          docNameMaskType = maskedDataName.maskType;
          docMaskOnWord = maskedDataName.maskOnWord ;
          docSpecilityMaskType = maskedDataSpe.maskType;
          docSpecilityMask = maskedDataSpe.maskNumber;
          docSpecilityMaskOnWord = maskedDataSpe.maskOnWord;

        }
        if (this.patientFieldsMask.length > 0) {
          const maskedDataName = this.getMaskData(this.patientFieldsMask, 'name');
          const maskedDataCon = this.getMaskData(this.patientFieldsMask, 'contact');
          patNameMask = maskedDataName.maskNumber;
          patNameMaskType = maskedDataName.maskType;
          patContactMaskType = maskedDataCon.maskType;
          patContactMask = maskedDataCon.maskNumber;
          patMaskOnWord = maskedDataName.maskOnWord;
        }
        _.map(v.calling_patient_list, (lst) => {
          lst.full_name = this.replaceStringCharcters(lst.full_name, patNameMaskType, patNameMask, '*', patMaskOnWord);
          lst.mobile_no = this.replaceStringCharcters(lst.mobile_no, patContactMaskType, patContactMask, 'X', patMaskOnWord);
        });
        _.map(v.next_patient_list, (lst) => {
          lst.full_name = this.replaceStringCharcters(lst.full_name, patNameMaskType, patNameMask, '*', patMaskOnWord);
          lst.mobile_no = this.replaceStringCharcters(lst.mobile_no, patContactMaskType, patContactMask, 'X', patMaskOnWord);
        });
        const retData = this.getDisplayPatientList(v);
        const obj = {
          docData: {
            name: v.entity_tag === 'DOCTOR' ? 'Dr. ' + this.replaceStringCharcters(v.entity_value, docNameMaskType, docNameMask, '*', docMaskOnWord)
            : this.replaceStringCharcters(v.entity_value, docNameMaskType, docNameMask, '*', docMaskOnWord),
            specialty: this.replaceStringCharcters(v.specialty, docSpecilityMaskType, docSpecilityMask, '*', docSpecilityMaskOnWord),
            room: v.room_name,
            profile_image: v.image_url,
            doc_queue_status: v.is_pause ? v.status + ' (' + v.pause_minutes + ' Min)' :
            v.is_delay ? v.status + ' (' + v.delay_minutes + ' Min)' : v.status,
            docOpdPauseStatus: v.is_pause ? v.is_pause : false,
            docOpdStopStatus: v.is_stop ? v.is_stop : false ,
            docOpdPauseMinutes : v.pause_minutes ? v.pause_minutes : ''

          },
          next_queue_list: retData.next_queue_list,
          calling_queue_list: retData.calling_queue_list,
          queue_list: retData.queue_list,
          next_queue_patient: retData.next_queue_patient,
          calling_queue_patient: retData.calling_queue_patient,
        };
        this.displayDoctorPatData.push(obj);
      }
    });
    // update data grid wise
    this.updateDataGridWise();
  }

  generateDoctorQueueData(qData) {
    _.map(qData, (v) => {
      if (!_.isEmpty(v.LivePatientQueueData)) {
        let docNameMask = 0;
        let docNameMaskType = null;
        let docSpecilityMask = 0;
        let docSpecilityMaskType = null;
        let docMaskOnWord = false;
        let docSpecilityMaskOnWord = false;
        let patNameMask = 0;
        let patNameMaskType = null;
        let patContactMask = 0;
        let patContactMaskType = null;
        let patMaskOnWord = false;
        if (this.doctorFieldsMask.length > 0) {
          const maskedDataName = this.getMaskData(this.doctorFieldsMask, 'name');
          const maskedDataSpe = this.getMaskData(this.doctorFieldsMask, 'speciality');
          docNameMask = maskedDataName.maskNumber;
          docNameMaskType = maskedDataName.maskType;
          docMaskOnWord = maskedDataName.maskOnWord ;
          docSpecilityMaskType = maskedDataSpe.maskType;
          docSpecilityMask = maskedDataSpe.maskNumber;
          docSpecilityMaskOnWord = maskedDataSpe.maskOnWord;

        }
        if (this.patientFieldsMask.length > 0) {
          const maskedDataName = this.getMaskData(this.patientFieldsMask, 'name');
          const maskedDataCon = this.getMaskData(this.patientFieldsMask, 'contact');
          patNameMask = maskedDataName.maskNumber;
          patNameMaskType = maskedDataName.maskType;
          patContactMaskType = maskedDataCon.maskType;
          patContactMask = maskedDataCon.maskNumber;
          patMaskOnWord = maskedDataName.maskOnWord;
        }
        _.map(v.LivePatientQueueData.calling_patient_list, (lst) => {
          lst.full_name = this.replaceStringCharcters(lst.full_name, patNameMaskType, patNameMask, '*', patMaskOnWord);
          lst.mobile_no = this.replaceStringCharcters(lst.mobile_no, patContactMaskType, patContactMask, 'X', patMaskOnWord);
        });
        _.map(v.LivePatientQueueData.next_patient_list, (lst) => {
          lst.full_name = this.replaceStringCharcters(lst.full_name, patNameMaskType, patNameMask, '*', patMaskOnWord);
          lst.mobile_no = this.replaceStringCharcters(lst.mobile_no, patContactMaskType, patContactMask, 'X', patMaskOnWord);
        });
        const retData = this.getDisplayPatientList(v.LivePatientQueueData);
        const obj = {
          docData: {
            name: v.LivePatientQueueData.entity_tag === 'DOCTOR' ? 'Dr. ' + this.replaceStringCharcters(v.LivePatientQueueData.entity_value, docNameMaskType, docNameMask, '*', docMaskOnWord)
            : this.replaceStringCharcters(v.LivePatientQueueData.entity_value, docNameMaskType, docNameMask, '*', docMaskOnWord),
            specialty: this.replaceStringCharcters(v.LivePatientQueueData.specialty, docSpecilityMaskType, docSpecilityMask, '*', docSpecilityMaskOnWord),
            room: v.room_name,
            profile_image: v.LivePatientQueueData.image_url,
            doc_queue_status: v.LivePatientQueueData.status
          },
          next_queue_list: retData.next_queue_list,
          calling_queue_list: retData.calling_queue_list,
          queue_list: retData.queue_list,
          next_queue_patient: retData.next_queue_patient,
          calling_queue_patient: retData.calling_queue_patient,
        };
        this.displayDoctorPatData.push(obj);
      }
    });
    // update data grid wise
    this.updateDataGridWise();
  }

  updateDataGridWise() {
    const displayDataClone = _.clone(this.displayDoctorPatData);
    this.displayDoctorPatData = [];
    if (displayDataClone.length > 0) {
      if (this.displayGridTemplate === 'grid_template_1' && this.displayUserTemplate !== 'display_template_9') {
        this.displayDoctorPatData.push(displayDataClone[0]);
      }
      if (this.displayGridTemplate === 'grid_template_1' && this.displayUserTemplate === 'display_template_9') {
        this.displayDoctorPatData = displayDataClone;
      } else if (this.displayGridTemplate === 'grid_template_2'
        || this.displayGridTemplate === 'grid_template_3') {
        if (displayDataClone.length > 2) {
          displayDataClone.splice(2);
        }
        this.displayDoctorPatData = displayDataClone;
      } else if (this.displayGridTemplate === 'grid_template_4') {
        if (displayDataClone.length === 4) {
          this.displayDoctorPatData = displayDataClone;
        } else if (displayDataClone.length > 4) {
          _.map(displayDataClone, (v, i) => {
            if (i < 4) {
              this.displayDoctorPatData.push(v);
            }
          });
        } else if (displayDataClone.length < 4) {
          this.displayDoctorPatData = displayDataClone;
          const diff = 4 - this.displayDoctorPatData.length;
          for (let i = 0; i < diff; i++) {
            const obj = {
              docData: {},
              next_queue_list: [],
              calling_queue_list: [],
              queue_list: [],
              next_queue_patient: {},
              calling_queue_patient: {},
            };
            this.displayDoctorPatData.push(obj);
          }
        }
      }
    }
    console.log(this.displayDoctorPatData);
  }

  getMaskData(array, key) {
    const maskedData = {
      maskNumber: 0,
      maskType: null,
      maskOnWord: false
    };
    const findMask = _.findIndex(array, (val) => {
      return val.key === key;
    });
    if (findMask !== -1) {
      maskedData.maskNumber = array[findMask].numberOfCharacter ? array[findMask].numberOfCharacter : 0;
      maskedData.maskType = array[findMask].maskType; // ? 'pre' : 'post';
      maskedData.maskOnWord = array[findMask].isWord;
    }
    return maskedData;
  }

  replaceStringCharcters(text, type, toIndex, replaceChar, isMaskOnWord) {
    let updatedString = '';
    if (toIndex && text) {
      if (type === 'pre') {
        if (isMaskOnWord) {
          const splitStringArray = [];
          const spilitWord = text.split(' ');
          spilitWord.forEach(element => {
            const wordArrayText = Array.from(element);
            for (let i = 0; i < toIndex; i++) {
              if (wordArrayText.length > i) {
                wordArrayText[i] = replaceChar;
              }
            }
            splitStringArray.push(wordArrayText.join(''));
          });
          updatedString = splitStringArray.join(' ');
        } else {
          const arrayText = Array.from(text);
          for (let i = 0; i < toIndex; i++) {
            if (arrayText.length > i) {
              arrayText[i] = replaceChar;
            }
          }
          updatedString = arrayText.join('');
        }
      }
      if (type === 'post') {
        if (isMaskOnWord) {
          const splitStringArray = [];
          const spilitWord = text.split(' ');
          spilitWord.forEach(element => {
            const wordArrayText = Array.from(element);
            for (let i = (wordArrayText.length - 1); i >= (wordArrayText.length - (toIndex)); i--) {
                wordArrayText[i] = replaceChar;
            }
            splitStringArray.push(wordArrayText.join(''));
          });
          updatedString = splitStringArray.join(' ');
        } else {
          const arrayText = Array.from(text);
          for (let i = (arrayText.length - 1); i >= (arrayText.length - (toIndex)); i--) {
            arrayText[i] = replaceChar;
          }
          updatedString = arrayText.join('');
        }
      }
      if (type === 'mid') {
        if (isMaskOnWord) {
          const splitStringArray = [];
          const spilitWord = text.split(' ');
          spilitWord.forEach(element => {
            const wordArrayText = Array.from(element);
            let cnt = 0;
            // const midText = this.extractMiddle(element);
            for (let i = (Math.round(wordArrayText.length / 2) - 1 ); i < wordArrayText.length; i++) {
              if (cnt === toIndex) {
                break;
               }
              wordArrayText[i] = replaceChar;
              cnt++;
             }
            splitStringArray.push(wordArrayText.join(''));
          });
          updatedString = splitStringArray.join(' ');
        } else {
          const arrayText = Array.from(text);
          let cnt = 0;
          for (let i = (Math.round(arrayText.length / 2) - 1 ); i < arrayText.length; i++) {
            if (cnt === toIndex) {
             break;
            }
            arrayText[i] = replaceChar;
            cnt++;
          }
          updatedString = arrayText.join('');
        }

      }
    } else {
      updatedString = text ? text : '';
    }
    return updatedString;
  }

  getDisplayPatientList(patData) {
    const listData = {
      next_queue_list: [],
      calling_queue_list: [],
      queue_list: [],
      next_queue_patient: {},
      calling_queue_patient: {}
    };
    if (this.displayUserTemplate === 'display_template_1' || this.displayUserTemplate === 'display_template_7') {
      listData.calling_queue_patient = patData.calling_patient_list.length > 0 ? patData.calling_patient_list[0] : null;
    } else if (this.displayUserTemplate === 'display_template_2') {
      listData.next_queue_list = patData.next_patient_list;
      listData.calling_queue_patient = patData.calling_patient_list.length > 0 ? patData.calling_patient_list[0] : null;
    } else if (this.displayUserTemplate === 'display_template_3'
      || this.displayUserTemplate === 'display_template_4') {
      const callPatList = _.clone(patData.calling_patient_list);
      const nxtPatList = _.clone(patData.next_patient_list);
      callPatList.map(o => o.type = 'calling');
      nxtPatList.map(o => o.type = 'next');
      listData.queue_list = callPatList.concat(nxtPatList);
    } else if (this.displayUserTemplate === 'display_template_5') {
      listData.next_queue_patient = patData.next_patient_list.length > 0 ? patData.next_patient_list[0] : null;
      listData.calling_queue_patient = patData.calling_patient_list.length > 0 ? patData.calling_patient_list[0] : null;
    } else if (this.displayUserTemplate === 'display_template_6') {
      listData.next_queue_patient = patData.next_patient_list.length > 0 ? patData.next_patient_list[0] : null;
      listData.calling_queue_patient = patData.calling_patient_list.length > 0 ? patData.calling_patient_list[0] : null;
      _.map(patData.calling_patient_list, (l, i) => {
        if (i > 0) {
          l.type = 'calling';
          listData.queue_list.push(l);
        }
      });
      _.map(patData.next_patient_list, (l, i) => {
        if (i > 0) {
          l.type = 'next';
          listData.queue_list.push(l);
        }
      });
    } else if (this.displayUserTemplate === 'display_template_8') {
      listData.calling_queue_list = patData.calling_patient_list;
    }else{
      listData.next_queue_list = patData.next_patient_list;
      listData.calling_queue_list = patData.calling_patient_list;
    }
    return listData;
  }

  checkUserKeyExist(type, key) {
    let data = [];
    if (type === 'doctor') {
      data = this.doctorFieldShow;
    } else if (type === 'queue') {
      data = this.queueFieldShow;
    } else if (type === 'next') {
      data = this.nextFieldShow;
    } else if (type === 'calling') {
      data = this.callingFieldShow;
    }
    return this.checkKeyExist(data, key);
  }

  checkKeyExist(data, key) {
    const findKey = _.findIndex(data, (k) => {
      return k === key;
    });
    if (findKey !== -1) {
      return true;
    } else {
      return false;
    }
  }

  getAllFieldSettings(): Observable<any> {
    const param = [
      {
        'tag_name': Constants.doctorFieldSettingKey,
        'tag_question': null,
      },
      {
        'tag_name': Constants.patientFieldSettingKey,
        'tag_question': null,
      }
    ];
    return this.commonService.getQueueSettingsForMultiple(param, this.displaytemplateNumber).pipe(map((res: any) => {
      _.map(res, (v) => {
        if (v.tag_name.toUpperCase() === Constants.doctorFieldSettingKey.toUpperCase() && v.tag_value) {
          this.doctorFieldsMask = JSON.parse(v.tag_value);
        }
        if (v.tag_name.toUpperCase() === Constants.patientFieldSettingKey.toUpperCase() && v.tag_value) {
          this.patientFieldsMask = JSON.parse(v.tag_value);
        }
      });
      return res;
    })
    );
  }

  extractMiddle(str) {
    let position;
    let length;
    if (str.length % 2 == 1) {
      position = str.length / 2;
      length = 1;
    } else {
      position = str.length / 2 - 1;
      length = 2;
    }
    return str.substring(position, position + length);
  }

}

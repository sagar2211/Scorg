import { Injectable } from '@angular/core';
import * as moment from 'moment';
import * as _ from 'lodash';
import { Subject, Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { WeekDays } from '../models/week-days.model';
import { Room } from '../../qms/models/room.model';
import { Constants } from 'src/app/config/constants';

@Injectable({
  providedIn: 'root'
})
export class EntitityCommonDataService {

  constructor(
    private http: HttpClient
  ) { }

  private getServicesListDataOnProviderSelect = new Subject<any>();
  public $subcGetServicesListDataOnProviderSelect = this.getServicesListDataOnProviderSelect.asObservable();

  private basicInforServiceProviderChange = new Subject<any>();
  public $subcBasicInforServiceProviderChange = this.basicInforServiceProviderChange.asObservable();

  private basicInforServiceProviderChangeGetHistory = new Subject<any>();
  public $subcBasicInforServiceProviderChangeGetHistory = this.basicInforServiceProviderChangeGetHistory.asObservable();

  private enableDisableEditButtonTimeSchedule = new Subject<any>();
  public $subcEnableDisableEditButtonTimeSchedule = this.enableDisableEditButtonTimeSchedule.asObservable();

  private updateServiceInInstruction = new Subject<any>();
  public $subcUpdateServiceInInstruction = this.updateServiceInInstruction.asObservable();

  activeEditTimeScheduleIndex: number = null;
  globalScheduleMode = 'add';
  scheduleDateTimeScheduleMode = 'add';
  scheduleDataSaveStatus = null;
  returnMessage = null;

  historyData: any = {};

  weekDaysArrayList = [
    {
      name: 'Mon',
      key: 'mon',
      isSelected: false,
    },
    {
      name: 'Tue',
      key: 'tue',
      isSelected: false,
    },
    {
      name: 'Wed',
      key: 'wed',
      isSelected: false,
    },
    {
      name: 'Thu',
      key: 'thu',
      isSelected: false,
    },
    {
      name: 'Fri',
      key: 'fri',
      isSelected: false,
    },
    {
      name: 'Sat',
      key: 'sat',
      isSelected: false,
    },
    {
      name: 'Sun',
      key: 'sun',
      isSelected: false,
    }
  ];

  timeFormateKey = '';

  entityScheduleObject = {
    basicInfo: {
      selectedEntity: null,
      selectedProvider: null,
      selectedAppointmentTypes: [],
      selectedScheduleType: null,
      parallelBookingAllow: null,
      parallelBookingValue: null,
      tokenValue: null,
      timePerPatient: null,
      appointmentTimeSlot: null,
      advanceBookingDays: null,
      formId: null
    },
    scheduleData: [],
    rules: {
      formId: null,
      timePerPatient: null,
      appointmentTimeSlot: null,
      serviceForm: []
    },
    instruction: {
      formId: null,
      commonInstructionOperator: null,
      commonInstructionPatient: null,
      sendCommonInstructionToUsers: null,
      sendServiceInstructionToUsers: null,
      serviceForm: []
    }
  };

  updateBasicInfoValue(val) {
    this.entityScheduleObject.basicInfo = val;
  }

  updateEntityRuleValue(val) {
    this.entityScheduleObject.rules = val;
    this.entityScheduleObject.basicInfo.timePerPatient = val.timePerPatient;
    this.entityScheduleObject.basicInfo.appointmentTimeSlot = val.appointmentTimeSlot;
  }

  updateEntityInstructionValue(val) {
    this.entityScheduleObject.instruction = val;
  }

  getAllScheduleObjectForSummery() {
    return this.entityScheduleObject;
  }

  getInstructionData() {
    const insData = {
      ScheduleInstructions_Id: null,
      GeneralInstruc_Patient: null,
      GeneralInstruc_Operator: null,
      GeneralInstruc_SMS_TopLevel: null,
      GeneralInstruc_SMS_ServiceLevel: null,
      ScheduleInstructionsDetail: []
    };
    if (!_.isEmpty(this.entityScheduleObject.instruction)) {
      const serData = [];
      if (this.entityScheduleObject.instruction.serviceForm.length > 0) {
        _.map(this.entityScheduleObject.instruction.serviceForm, (v, k) => {
          if (v.instructionOperator || v.instructionPatient) {
            const obj = {
              ScheduleInstructionsDetail_Id: v.formId || 0,
              Instructions_ServiceId: v.service.id,
              InstructionTo_Patient: v.instructionPatient,
              InstructionTo_Operator: v.instructionOperator
            };
            serData.push(obj);
          }
        });
      }
      insData.GeneralInstruc_Patient = this.entityScheduleObject.instruction.commonInstructionPatient || null;
      insData.GeneralInstruc_Operator = this.entityScheduleObject.instruction.commonInstructionOperator || null;
      insData.ScheduleInstructions_Id = this.entityScheduleObject.instruction.formId || 0;
      insData.GeneralInstruc_SMS_TopLevel = this.entityScheduleObject.instruction.sendCommonInstructionToUsers || false;
      insData.GeneralInstruc_SMS_ServiceLevel = this.entityScheduleObject.instruction.sendServiceInstructionToUsers || false;
      insData.ScheduleInstructionsDetail = serData;
    }
    return insData;
  }

  getRulesData() {
    let ruleObj = {
      ScheduleRule_Id: null,
      Rule_DefTimePer_Patient: null,
      Rule_ApptTimeslot: null,
      ScheduleRuleDetail: []
    };
    if (!_.isEmpty(this.entityScheduleObject.rules)) {
      const timeAry = [];
      if (this.entityScheduleObject.rules.serviceForm.length > 0) {
        _.map(this.entityScheduleObject.rules.serviceForm, (v, k) => {
          if (v.timeSlot || v.maxNum) {
            const timeObj = {
              ScheduleRuleDetail_Id: v.formId || 0,
              Rule_ServiceId: v.id,
              Rule_TimePerPatient: v.timeSlot,
              Rule_MaxNoOfPatient: v.maxNum
            };
            timeAry.push(timeObj);
          }
        });
      }
      ruleObj = {
        ScheduleRule_Id: this.entityScheduleObject.rules.formId || 0,
        Rule_DefTimePer_Patient: this.entityScheduleObject.rules.timePerPatient,
        Rule_ApptTimeslot: this.entityScheduleObject.rules.appointmentTimeSlot,
        ScheduleRuleDetail: timeAry
      };
    }
    return ruleObj;
  }

  getTimeScheduleData(scheduleData) {
    const schData = [];
    _.map(scheduleData, (val, key) => {
      let obj = {
        ScheduleTime_Id: null,
        Scheduling_StartDate: null,
        Scheduling_EndDate: null,
        weekly_off: [],
        ScheduleTimeDetail: [],
      };
      const appTypeSch = [];
      if (val.appointmentTypeTimeArray.length > 0) {
        _.map(val.appointmentTypeTimeArray, (aVal, aKey) => {
          if (!aVal.subFormStatus) {
            const sTime = moment(moment().format('YYYY-MM-DD') + ' ' + aVal.startTime).format('h:mm A');
            let eTime = moment(moment().format('YYYY-MM-DD') + ' ' + aVal.endTime).format('h:mm A');
            if (eTime === '23:59' || eTime === '11:59 PM' || eTime === 'Invalid date') {
              eTime = '12:00 AM';
            }
            const appObj = {
              TimeDetail_AppttypeId: aVal.appointmentType.id,
              TimeDetail_Starttime: sTime,
              TimeDetail_Endtime: eTime,
              Available_Days: _.map(aVal.selectedDays, (v, k) => {
                return {
                  Day: v.key,
                  Selected: v.isSelected
                };
              }),
              TimeDetail_IsallowAppointments: aVal.allowAppointments,
              ScheduleTimeDetail_Id: aVal.formId || 0
            };
            appTypeSch.push(appObj);
          }
        });
      }
      obj = {
        ScheduleTime_Id: val.formId || 0,
        Scheduling_StartDate: moment(val.startDate).format(Constants.apiDateFormate),
        Scheduling_EndDate: val.endDate ? moment(val.endDate).format(Constants.apiDateFormate) : null,
        weekly_off: _.map(val.weekOffDays, (v, k) => {
          return {
            Day: v.key,
            Off: v.isSelected
          };
        }),
        ScheduleTimeDetail: appTypeSch
      };
      if (obj.ScheduleTimeDetail.length > 0) {
        schData.push(obj);
      }
    });
    return schData;
  }

  getEntityObjectForSave() {
    let sendData = {};
    sendData = {
      // send for default object not use at FE
      ScheduleFor_Id: this.entityScheduleObject.basicInfo.formId || 0,
      ScheduleFor_TokenPrefix: 'PREFIX',
      ScheduleFor_Isactive: true,

      ScheduleFor_Entity_Id: this.entityScheduleObject.basicInfo.selectedEntity.id,
      ScheduleFor_Entityvalue_Id: this.entityScheduleObject.basicInfo.selectedProvider.id,
      ScheduleApptypeDetail: _.map(this.entityScheduleObject.basicInfo.selectedAppointmentTypes, (v, k) => {
        return {
          AppointmentType_Id: v.id,
          def_time_per_pat: this.entityScheduleObject.rules.timePerPatient,
          App_time_slot: this.entityScheduleObject.rules.appointmentTimeSlot,
          Apptype_Isactive: true
        };
      }),
      ScheduleFor_Tokentype_Id: this.entityScheduleObject.basicInfo.selectedScheduleType.id,
      ScheduleFor_IsallowBooking: this.entityScheduleObject.basicInfo.parallelBookingAllow,
      ScheduleFor_Maxallowed_Booking: this.entityScheduleObject.basicInfo.parallelBookingValue,
      ScheduleFor_TokenPrefix_Value: this.entityScheduleObject.basicInfo.tokenValue,
      ScheduleFor_DefTimePer_Patient: this.getRuleMasterValueForSchedule('time', this.entityScheduleObject.basicInfo.timePerPatient),
      ScheduleFor_ApptTimeslot: this.getRuleMasterValueForSchedule('slot', this.entityScheduleObject.basicInfo.appointmentTimeSlot),
      ScheduleFor_AdvBookingDays: this.entityScheduleObject.basicInfo.advanceBookingDays,

      ScheduleTimeMain: null, // this.getTimeScheduleData(),
      ScheduleRuleMain: this.getRulesData(),
      ScheduleInstructionsMain: this.getInstructionData()
    };
    return sendData;
  }

  getRuleMasterValueForSchedule(type, val) {
    let returnVal = null;
    if (type === 'time') {
      returnVal = !_.isEmpty(this.entityScheduleObject.rules) ? this.entityScheduleObject.rules.timePerPatient : null;
    } else {
      returnVal = !_.isEmpty(this.entityScheduleObject.rules) ? this.entityScheduleObject.rules.appointmentTimeSlot : null;
    }
    if (_.isEmpty(returnVal) && !_.isEmpty(val)) {
      returnVal = val;
    }
    return returnVal;
  }

  getServicesListDataOnProviderChange(callFrom?) {
    this.getServicesListDataOnProviderSelect.next(callFrom);
  }

  updateServicesListWhenProviderChange(callFrom?) {
    this.basicInforServiceProviderChange.next(callFrom);
  }

  getHistoryWhenProviderChange(callFrom?) {
    this.basicInforServiceProviderChangeGetHistory.next(callFrom);
  }

  enableDisableEditButtons(valIndx) {
    this.enableDisableEditButtonTimeSchedule.next(valIndx);
  }

  updateServiceInInstructionFromRules(services) {
    this.updateServiceInInstruction.next(services);
  }

  getDataForStepByKey(key) {
    return this.entityScheduleObject[key];
  }

  saveAllEntityData(): Observable<any> {
    let obj = {
      status: this.scheduleDataSaveStatus,
      msg: this.returnMessage
    };
    if (!this.scheduleDataIsValidToSave()) {
      obj = {
        status: this.scheduleDataSaveStatus,
        msg: this.returnMessage
      };
      return of(obj);
    }
    if (this.scheduleDataSaveStatus) {
      const param = this.getEntityObjectForSave();
      let reqUrl = environment.baseUrlAppointment;
      if (param['ScheduleFor_Id']) {
        reqUrl = reqUrl + '/ScheduleConfig/editAppointmentSchedule';
        this.returnMessage = "Schedule Updated Successfully";

      } else {
        reqUrl = reqUrl + '/ScheduleConfig/saveAppointmentSchedule';
        this.returnMessage = "Schedule Added Successfully";
      }
      return this.http.post(reqUrl, param).pipe(
        map((res: any) => {
          if (res.status_code === 200 && res.status_message === 'Success' && res.id > 0) {
            obj = {
              status: this.scheduleDataSaveStatus,
              msg: this.returnMessage
            };
            this.globalScheduleMode = 'add';
            this.scheduleDateTimeScheduleMode = 'add';
            this.scheduleDataSaveStatus = null;
            this.historyData = {};
          } else {
            obj = {
              status: false,
              msg: res.message
            };
          }
          return obj;
        })
      );
    }
    // return of(this._entityDummyDataService.getEntityDataArray());
  }


  createHoursList12HourFormat(minute?) {
    const items = [];
    for (let hour = 0; hour < 24; hour++) {
      items.push(moment({ hour }).format('hh:mm A'));
      if (minute) {
        items.push(moment({ hour, minute: 30 }).format('hh:mm A'));
      }
    }
    return items;
  }

  createHoursList24HourFormat(minute?) {
    const items = [];
    for (let hour = 0; hour < 24; hour++) {
      items.push(moment({ hour }).format('HH:mm'));
      if (minute) {
        items.push(moment({ hour, minute: 30 }).format('HH:mm'));
      }
    }
    return items;
  }

  getHistoryDataForProvider(param): Observable<any> {
    const reqUrl = `${environment.baseUrlAppointment}/ScheduleConfig/getAppointmentSchedule?entity_id=${param.entity_id}&entity_data_id=${param.entity_data_id}`;
    return this.http.get(reqUrl).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.status_message === 'Success' && !_.isEmpty(res.scheduled_config_details)) {
          this.historyData = this.generateHistoryData(res.scheduled_config_details);
          this.globalScheduleMode = 'edit';
          return this.historyData;
        } else {
          this.globalScheduleMode = 'add';
          return {};
        }
      })
    );
  }

  getScheduleHistoryDataForProvider(param): Observable<any> {
    const reqUrl = environment.baseUrlAppointment + '/ScheduleConfig/getScheduleTimeWithRoomMapping';
    const reqObj = {
      EntityId: param.entity_id,
      EntityValueId: param.entity_data_id,
      Is_get_outdated_schedules: false,
      schedule_date: param.selected_schedule_date ? param.selected_schedule_date : null
    };
    return this.http.post(reqUrl, reqObj).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.status_message === 'Success' && !_.isEmpty(res.data)) {

          // order by start and end time below code is not required
          // res.data.forEach(element => {
          //   element.ScheduleTimeDetail.sort((a, b) => {
          //     const first: any = new Date('1970/01/01 ' + a.TimeDetail_Starttime);
          //     const second: any = new Date('1970/01/01 ' + b.TimeDetail_Endtime);
          //     const diff: any = first - second;
          //     return diff;
          //   });
          // });
          return this.generateScheduleHistoryDataWithRoom(res.data);
        } else {
          return [];
        }
      })
    );
  }

  getScheduleForDelayNotification(param): Observable<any> {
    const reqUrl = environment.baseUrlAppointment + '/ScheduleConfig/getQueueDelayTimeDetails';
    const reqObj = {
      EntityId: param.entity_id,
      EntityValueId: param.entity_data_id,
      Is_get_outdated_schedules: false,
      schedule_date: param.selected_schedule_date ? param.selected_schedule_date : null
    };
    return this.http.post(reqUrl, reqObj).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.status_message === 'Success' && !_.isEmpty(res.data)) {

          // order by start and end time below code is not required
          // res.data.forEach(element => {
          //   element.ScheduleTimeDetail.sort((a, b) => {
          //     const first: any = new Date('1970/01/01 ' + a.TimeDetail_Starttime);
          //     const second: any = new Date('1970/01/01 ' + b.TimeDetail_Endtime);
          //     const diff: any = first - second;
          //     return diff;
          //   });
          // });
          return this.generateScheduleForDelayNotification(res.data);
        } else {
          return [];
        }
      })
    );
  }

  generateScheduleForDelayNotification(data) {
    const scheduleData = this.generateScheduleHistoryData(data);
    _.map(scheduleData, (time, timeIndex) => {
      _.map(time.appointmentTypeTimeArray, (appTypeByTime, typeIndex) => {
        // check slotdata
        const appData = _.find(data, dt => {
          return dt.ScheduleTime_Id === time.formId;
        });
        const timeData = _.find(appData.ScheduleTimeDetail, ad => {
          return ad.ScheduleTimeDetail_Id === appTypeByTime.formId;
        });
        appTypeByTime.selectedRoomList = timeData ? timeData.room_detials ? timeData.room_detials : [] : [];
        appTypeByTime.selectedRoomList = appTypeByTime.selectedRoomList || [];
        _.map(appTypeByTime.selectedRoomList, (v, i) => {
          const obj = {
            id: v.room_id,
            name: v.room_name,
            location: null,
            isActive: true
          };
          const room = new Room();
          room.generateObject(obj);
          appTypeByTime.selectedRoomList[i] = _.cloneDeep(room);
        });
        // appTypeByTime.roomMapId = timeData.room_mapping_id;
        // appTypeByTime.isFixedRoom = timeData.is_fixed_romm;
        appTypeByTime.configId = appData.Schedule_Config_Id;
        appTypeByTime.isHoliday = timeData.is_Holiday;
      });
    });
    return scheduleData;
  }
  getWeekDaysArrayList() {
    const weekAry = [];
    _.map(this.weekDaysArrayList, (v, k) => {
      const weekDays = new WeekDays();
      if (weekDays.isObjectValid(v)) {
        weekDays.generateObject(v);
        weekAry.push(weekDays);
      }
    });
    return weekAry;
  }

  generateScheduleHistoryData(data) {
    // data = _.sortBy(data, 'ScheduleTime_Id');
    const scheduleData = [];
    data = _.orderBy(data, dt => {
      return (new Date(dt.Scheduling_StartDate));
    });
    _.map(data, (time, timeIndex) => {
      const timeAryObj = {
        formId: time.ScheduleTime_Id,
        startDate: new Date(time.Scheduling_StartDate),
        endDate: time.Scheduling_EndDate ? new Date(time.Scheduling_EndDate) : null,
        appointmentTypeTimeArray: [],
        weekOffDays: [],
        mainFormStatus: false,
        IsUsedInTrans: time.IsUsedInTrans,
        // use this status to show Current/Altered for time schedule list
        NewSlotTime: time.Schedule_Action === 'SCHEDULING' ? false : true // time.NewSlotTime
      };
      _.map(time.Weekly_Off, (days) => {
        const daysObj = {
          name: (_.find(this.weekDaysArrayList, (d) => d.key === days.Day))['name'],
          key: days.Day,
          isSelected: days.Off
        };
        timeAryObj.weekOffDays.push(daysObj);
      });
      time.ScheduleTimeDetail = _.orderBy(time.ScheduleTimeDetail, dt => {
        return new Date('01-01-2020 ') + dt.TimeDetail_Starttime;
      });
      _.map(time.ScheduleTimeDetail, (appTypeByTime) => {
        let sTime = appTypeByTime.TimeDetail_Starttime;
        let eTime = appTypeByTime.TimeDetail_Endtime_ToShow; // appTypeByTime.TimeDetail_Endtime; // change as coming from BE side
        if (this.timeFormateKey === '24_hour') {
          sTime = moment(moment().format('YYYY-MM-DD') + ' ' + sTime).format('HH:mm');
          eTime = moment(moment().format('YYYY-MM-DD') + ' ' + eTime).format('HH:mm');
        } else {
          sTime = moment(moment().format('YYYY-MM-DD') + ' ' + sTime).format('hh:mm A');
          eTime = moment(moment().format('YYYY-MM-DD') + ' ' + eTime).format('hh:mm A');
        }
        const typeObj = {
          formId: appTypeByTime.ScheduleTimeDetail_Id,
          appointmentType: {
            id: appTypeByTime.TimeDetail_AppttypeId,
            name: appTypeByTime.TimeDetail_Appttype,
          },
          startTime: sTime,
          endTime: eTime,
          subFormStatus: false,
          allowAppointments: appTypeByTime.TimeDetail_IsallowAppointments,
          selectedDays: [],
          defaultTimeperPat: appTypeByTime.def_time_per_pat,
          appointmentTimeSlot: appTypeByTime.app_time_slot
        };
        _.map(appTypeByTime.Available_days, (days) => {
          const daysObj = {
            name: (_.find(this.weekDaysArrayList, (d) => {
              return d.key === days.Day;
            })).name,
            key: days.Day,
            isSelected: days.Selected
          };
          typeObj.selectedDays.push(daysObj);
        });
        timeAryObj.appointmentTypeTimeArray.push(typeObj);
      });
      scheduleData.push(timeAryObj);
    });
    return scheduleData;
  }

  generateHistoryBasicInfo(history) {
    const basicInfo = {
      formId: null,
      selectedEntity: {
        id: null,
        name: null,
        key: null
      },
      selectedProvider: {
        id: null,
        name: null
      },
      selectedAppointmentTypes: [],
      selectedScheduleType: {
        id: null,
        name: null
      },
      parallelBookingAllow: null,
      parallelBookingValue: null,
      tokenValue: null,
      timePerPatient: null,
      appointmentTimeSlot: null,
      advanceBookingDays: null,
    };
    basicInfo.selectedEntity = {
      id: history.Schedule.Id,
      name: history.Schedule.Name,
      key: history.Schedule.Alias,
    };
    basicInfo.selectedProvider = {
      id: history.EntityValue.Id,
      name: history.EntityValue.Name,
    };
    _.map(history.ScheduleAppointmentTypeDetails, (appType, appIndex) => {
      const appObj = {
        id: appType.AppointmentType_Id,
        name: appType.AppointmentType,
      };
      basicInfo.selectedAppointmentTypes.push(appObj);
    });
    basicInfo.selectedScheduleType = {
      id: history.TokenType.Id,
      name: history.TokenType.Name,
    };
    basicInfo.parallelBookingAllow = history.Schedule_IsAllowBooking;
    basicInfo.parallelBookingValue = history.Schedule_Maxallowed_Booking;
    basicInfo.tokenValue = history.Schedule_TokenPrefixValue;
    basicInfo.timePerPatient = history.ScheduleRules.Rule_DefTimePer_Patient;
    basicInfo.appointmentTimeSlot = history.ScheduleRules.Rule_ApptTimeslot;
    basicInfo.advanceBookingDays = history.Schedule_AdvanceBookingDays;
    basicInfo.formId = history.Schedule_Id;
    return basicInfo;
  }

  generateHistoryRulesInfo(ScheduleRules) {
    const rules = {
      formId: null,
      ruleId: null,
      timePerPatient: null,
      appointmentTimeSlot: null,
      serviceForm: []
    };
    rules.formId = ScheduleRules ? ScheduleRules.ScheduleRule_Id : null;
    rules.timePerPatient = ScheduleRules ? ScheduleRules.Rule_DefTimePer_Patient : null;
    rules.appointmentTimeSlot = ScheduleRules ? ScheduleRules.Rule_ApptTimeslot : null;
    if (ScheduleRules && ScheduleRules.ScheduleRuleDetail) {
      _.map(ScheduleRules.ScheduleRuleDetail, (ruleSer) => {
        const ruleSerObj = {
          timeSlot: ruleSer.Rule_TimePerPatient,
          maxNum: ruleSer.Rule_MaxNoOfPatient,
          id: ruleSer.Rule_ServiceId,
          name: ruleSer.Rule_ServiceName,
          formId: ruleSer.ScheduleRuleDetail_Id
        };
        rules.serviceForm.push(ruleSerObj);
      });
    }
    return rules;
  }

  generateHistoryInstructionInfo(ScheduleInstructions) {
    const instruction = {
      formId: null,
      commonInstructionOperator: null,
      commonInstructionPatient: null,
      sendCommonInstructionToUsers: null,
      sendServiceInstructionToUsers: null,
      serviceForm: []
    };
    instruction.formId = ScheduleInstructions ? ScheduleInstructions.ScheduleInstructions_Id : null;
    instruction.commonInstructionOperator = ScheduleInstructions
      ? ScheduleInstructions.GeneralInstruction_Operator : null;
    instruction.commonInstructionPatient = ScheduleInstructions
      ? ScheduleInstructions.GeneralInstrucion_Patient : null;
    instruction.sendServiceInstructionToUsers = ScheduleInstructions
      ? ScheduleInstructions.GeneralInstruc_SMS_ServiceLevel : null;
    instruction.sendCommonInstructionToUsers = ScheduleInstructions
      ? ScheduleInstructions.GeneralInstruc_SMS_TopLevel : null;
    if (ScheduleInstructions && ScheduleInstructions.ScheduleInstructionsDetails) {
      _.map(ScheduleInstructions.ScheduleInstructionsDetails, (val) => {
        const insObj = {
          service: {
            id: val.Instructions_ServiceId,
            name: val.Instructions_ServiceName
          },
          instructionPatient: val.InstructionTo_Patient,
          instructionOperator: val.InstructionTo_Operator,
          formId: val.ScheduleInstructionsDetail_Id,
        };
        instruction.serviceForm.push(insObj);
      });
    }
    return instruction;
  }

  generateHistoryData(history) {
    const entityScheduleObject = {
      basicInfo: {
        selectedEntity: null,
        selectedProvider: null,
        selectedAppointmentTypes: [],
        selectedScheduleType: null,
        parallelBookingAllow: null,
        parallelBookingValue: null,
        tokenValue: null,
        timePerPatient: null,
        appointmentTimeSlot: null,
        advanceBookingDays: null,
        formId: null
      },
      scheduleData: [],
      rules: {
        formId: null,
        timePerPatient: null,
        appointmentTimeSlot: null,
        serviceForm: []
      },
      instruction: {
        formId: null,
        commonInstructionOperator: null,
        commonInstructionPatient: null,
        sendCommonInstructionToUsers: null,
        sendServiceInstructionToUsers: null,
        serviceForm: []
      }
    };
    // Baisc Info / step one
    entityScheduleObject.basicInfo = this.generateHistoryBasicInfo(history);
    // Schedule / step two
    entityScheduleObject.scheduleData = this.generateScheduleHistoryData(history['ScheduleTimes']);
    // Rules / step three
    entityScheduleObject.rules = this.generateHistoryRulesInfo(history['ScheduleRules']);
    // Instruction / step Four
    entityScheduleObject.instruction = this.generateHistoryInstructionInfo(history['ScheduleInstructions']);
    this.entityScheduleObject = entityScheduleObject;
    return entityScheduleObject;
  }

  deleteInstructionCommon(formId): Observable<any> {
    const reqUrl = `${environment.baseUrlAppointment}/ScheduleConfig/deleteScheduleInstructionsMain/${formId}`;
    return this.http.delete(reqUrl).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.status_message === 'Success' && !_.isEmpty(res.message)) {
          return res.message;
        }
      })
    );
  }

  deleteInstructionService(formId): Observable<any> {
    const reqUrl = `${environment.baseUrlAppointment}/ScheduleConfig/deleteScheduleInstructionsDetail/${formId}`;
    return this.http.delete(reqUrl).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.status_message === 'Success' && !_.isEmpty(res.message)) {
          return res.message;
        }
      })
    );
  }

  deleteDateRangeScheduleData(formId): Observable<any> {
    const reqUrl = `${environment.baseUrlAppointment}/ScheduleConfig/deleteScheduleTimeMain/${formId}`;
    return this.http.delete(reqUrl).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.status_message === 'Success' && !_.isEmpty(res.message)) {
          return res.message;
        }
      })
    );
  }

  deleteAppointmentTypeScheduleData(formId): Observable<any> {
    const reqUrl = `${environment.baseUrlAppointment}/ScheduleConfig/deleteScheduleTimeDetail/${formId}`;
    return this.http.delete(reqUrl).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.status_message === 'Success' && !_.isEmpty(res.message)) {
          return res.message;
        }
      })
    );
  }

  loadScheduleInactiveHistory(scheduleId): Observable<any> {
    const reqUrl = `${environment.baseUrlAppointment}/ScheduleConfig/getInactiveSchedulingData?schedule_id=${scheduleId}`;
    return this.http.get(reqUrl).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.status_message === 'Success' && !_.isEmpty(res.ScheduleTimes)) {
          return res.ScheduleTimes;
        } else {
          return [];
        }
      })
    );
  }

  setSummeryDataDefault() {
    this.entityScheduleObject = {
      basicInfo: {
        selectedEntity: null,
        selectedProvider: null,
        selectedAppointmentTypes: [],
        selectedScheduleType: null,
        parallelBookingAllow: null,
        parallelBookingValue: null,
        tokenValue: null,
        timePerPatient: null,
        appointmentTimeSlot: null,
        advanceBookingDays: null,
        formId: null
      },
      scheduleData: [],
      rules: {
        formId: null,
        timePerPatient: null,
        appointmentTimeSlot: null,
        serviceForm: []
      },
      instruction: {
        formId: null,
        commonInstructionOperator: null,
        commonInstructionPatient: null,
        sendCommonInstructionToUsers: null,
        sendServiceInstructionToUsers: null,
        serviceForm: []
      }
    };
    this.historyData = {};
    this.timeFormateKey = '';
  }

  scheduleDataIsValidToSave() {
    let status = false;
    let msg = '';
    const firstStep = this.entityScheduleObject.basicInfo;
    const secondStep = this.entityScheduleObject.rules;
    const thirdStep = this.entityScheduleObject.instruction;
    thirdStep.commonInstructionPatient = thirdStep.commonInstructionPatient ? thirdStep.commonInstructionPatient : '';
    thirdStep.commonInstructionOperator = thirdStep.commonInstructionOperator ? thirdStep.commonInstructionOperator : '';
    if (!firstStep.selectedEntity) {
      msg = 'Please Select Entity';
    } else if (!firstStep.selectedProvider) {
      msg = 'Please Select Provider';
    } else if (_.filter(firstStep.selectedAppointmentTypes, (v) => v.isSelected === true).length === 0) {
      msg = 'Please Select Appointment Type';
    } else if (!firstStep.selectedScheduleType) {
      msg = 'Please Select Schedule Type';
    } else if (!firstStep.advanceBookingDays) {
      msg = 'Please Fill Advance Booking Days';
    } else if (firstStep.parallelBookingAllow && !firstStep.parallelBookingValue) {
      msg = 'Please Fill Provide value for parallel booking';
    } else if (!secondStep.timePerPatient) {
      msg = 'Please Select Default Time Per Patient';
    } else if (!secondStep.appointmentTimeSlot) {
      msg = 'Please Select Appointment Time Slot';
    } else if (!_.isEmpty(thirdStep.commonInstructionPatient)
      && thirdStep.commonInstructionPatient.length === 0
      && thirdStep.commonInstructionPatient.length >= 200) {
      msg = 'Please Check Common Instruction for Patient';
    } else if (!_.isEmpty(thirdStep.commonInstructionOperator)
      && thirdStep.commonInstructionOperator.length === 0
      && thirdStep.commonInstructionOperator.length >= 200) {
      msg = 'Please Check Common Instruction for Operator';
    } else if (thirdStep.sendCommonInstructionToUsers
      && (_.isEmpty(thirdStep.commonInstructionPatient)
        && _.isEmpty(thirdStep.commonInstructionOperator))) {
      msg = 'Please Fill Instruction';
    } else if (thirdStep.serviceForm.length > 0 && !this.checkServiceInstructionLength(thirdStep.serviceForm)) {
      msg = 'Please Check Common Instruction for Operator';
    } else if (firstStep.selectedEntity.key === 'service_provider' && secondStep.serviceForm.length === 0) {
      msg = 'Please select services';
    } else {
      status = true;
    }
    this.scheduleDataSaveStatus = status;
    this.returnMessage = msg;
    return status;
  }

  checkServiceInstructionLength(data) {
    let status = true;
    _.map(data, (v) => {
      if (status) {
        if (!_.isEmpty(v.instructionOperator) && !(v.instructionOperator.length > 0 && v.instructionOperator.length <= 200)) {
          status = false;
        }
        if (!_.isEmpty(v.instructionPatient) && !(v.instructionPatient.length > 0 && v.instructionPatient.length <= 200)) {
          status = false;
        }
      }
    });
    return status;
  }

  generateScheduleHistoryDataWithRoom(data) {
    const scheduleData = this.generateScheduleHistoryData(data);
    _.map(scheduleData, (time, timeIndex) => {
      _.map(time.appointmentTypeTimeArray, (appTypeByTime, typeIndex) => {
        // check slotdata
        const appData = _.find(data, dt => {
          return dt.ScheduleTime_Id === time.formId;
        });
        const timeData = _.find(appData.ScheduleTimeDetail, ad => {
          return ad.ScheduleTimeDetail_Id === appTypeByTime.formId;
        });
        appTypeByTime.selectedRoomList = timeData ? timeData.room_detials ? timeData.room_detials : [] : [];
        appTypeByTime.selectedRoomList = appTypeByTime.selectedRoomList || [];
        _.map(appTypeByTime.selectedRoomList, (v, i) => {
          const obj = {
            id: v.room_id,
            name: v.room_name,
            location: null,
            isActive: true
          };
          const room = new Room();
          room.generateObject(obj);
          appTypeByTime.selectedRoomList[i] = _.cloneDeep(room);
        });
        appTypeByTime.roomMapId = timeData.room_mapping_id;
        appTypeByTime.isFixedRoom = timeData.is_fixed_romm;
        appTypeByTime.configId = appData.Schedule_Config_Id;
        appTypeByTime.isHoliday = timeData.is_Holiday;
      });
    });
    return scheduleData;
  }

}

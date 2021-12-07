import { Component, OnInit, Input, OnChanges, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Subject, scheduled } from 'rxjs';
import * as _ from 'lodash';
import { EntitityCommonDataService } from '../../services/entitity-common-data.service';
import { takeUntil } from 'rxjs/operators';
import { NgbModal, NgbTabsetConfig, NgbTabChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationPopupComponent } from 'src/app/components/confirmation-popup/confirmation-popup.component';
import { IAlert } from 'src/app/models/AlertMessage';
import { ScheduleMakerService } from '../../services/schedule-maker.service';
import { CommonService } from 'src/app/services/common.service';
@Component({
  selector: 'app-schedule-summery',
  templateUrl: './schedule-summery.component.html',
  styleUrls: ['./schedule-summery.component.scss']
})
export class ScheduleSummeryComponent implements OnInit, OnChanges, OnDestroy {

  private changeEvent = new Subject<string>();
  summeryData: any = {};
  @Input() summeryDataForDisplay;
  @Input() summeryDataFrom;
  @Output() onEditButtonClick = new EventEmitter<any>();
  readmore = false;
  destroy$ = new Subject();
  historyData: any;
  inactiveHistoryData = [];
  alertMsg: IAlert;
  modalService: NgbModal;
  currentActiveMode: string;
  isAllScheduleHere: boolean;
  pastSchesuleData=[];
  constructor(
    private entityCommonDataService: EntitityCommonDataService,
    private scheduleMakerService: ScheduleMakerService,
    private confirmationModalService: NgbModal,
    private commonService: CommonService,
    config: NgbTabsetConfig
  ) {
    config.justify = 'start';
    config.type = 'tabs';
  }

  ngOnInit() {
    this.summeryData = {};
    this.historyData = {};
    this.isAllScheduleHere = false;
    this.currentActiveMode = this.entityCommonDataService.globalScheduleMode;
    this.createSummeryForSchedule(this.summeryDataForDisplay, this.summeryDataFrom);
    this.changeEvent.subscribe((data) => {
      this.createSummeryForSchedule(this.summeryDataForDisplay, this.summeryDataFrom);
    });
    this.subcriptionOfEvents();
  }

    ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  ngOnChanges() {
    if (this.summeryDataForDisplay && !_.isEmpty(this.summeryDataForDisplay)) {
      this.changeEvent.next(this.summeryDataForDisplay);
    }
  }

  createSummeryForSchedule(data?, where?) {
    this.historyData = data;

    // this.summeryData = this.entityCommonDataService.getAllScheduleObjectForSummery();
    // this.summeryData.basicInfo.panalCollapse = false;
    // this.summeryData.rules.panalCollapse = true;
    // this.summeryData.instruction.panalCollapse = true;
    // _.map(this.summeryData.scheduleData, (v) => {
    //   v.panalCollapse = false;
    // });
  }

  getSelectedDays(array) {
    return _.filter(array, (v) => {
      return v.isSelected === true;
    });
  }

  subcriptionOfEvents() {
    this.entityCommonDataService.$subcBasicInforServiceProviderChangeGetHistory.pipe(takeUntil(this.destroy$)).subscribe(data => {
      this.currentActiveMode = this.entityCommonDataService.globalScheduleMode;
      this.historyData = {};
      if (!_.isEmpty(data)) {
        this.historyData = data;
        this.historyData.basicInfo.panalCollapse = false;
        this.historyData.rules.panalCollapse = true;
        this.historyData.instruction.panalCollapse = true;
        _.map(this.historyData.scheduleData, (v) => {
          v.panalCollapse = false;
        });
      }
    });
    // this.getCurrentHistoryData();
    // this.entityCommonDataService.$subcBasicInforNextStepBtnClick.pipe(takeUntil(this.destroy$)).subscribe(data => {
    //   this.summeryData = {};
    //   this.summeryData = this.entityCommonDataService.getAllScheduleObjectForSummery();
    // });
  }

  checkDataExist(data) {
    if (_.isEmpty(data)) {
      return false;
    } else {
      return true;
    }
  }

  deleteScheduleData(event) {
    const param = {
      title: 'Confirm',
      body: 'Do you want to <b>Delete</b> this Schedule?',
      formDeleteObj: event.data,
      formIndex: event.index,
      formSubIndex: event.subIndex,
      formType: event.key
    };
    this.checkConfirmation(param);
  }

  checkConfirmation(modalObj) {
    const messageDetails = {
      modalTitle: modalObj.title,
      modalBody: modalObj.body
    };
    const modalInstance = this.confirmationModalService.open(ConfirmationPopupComponent, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      container: '#homeComponent'
    });
    modalInstance.result.then((result) => {
      if (result !== 'Ok') {
        return false;
      } else {
        if (modalObj.formType === 'instruction_service') {
          this.deleteInstructionServiceAfterConfirmation(modalObj);
        } else if (modalObj.formType === 'date_range_schedule') {
          this.deleteDateRangeScheduleAfterConfirmation(modalObj);
        } else if (modalObj.formType === 'app_type_schedule') {
          this.deleteAppointmentTypeScheduleAfterConfirmation(modalObj);
        }
      }
    }, (reason) => {
      return false;
    });
    modalInstance.componentInstance.messageDetails = messageDetails;
  }

  deleteInstructionServiceAfterConfirmation(obj) {
    const formId = obj.formDeleteObj.formId;
    this.entityCommonDataService.deleteInstructionService(formId).subscribe(res => {
      this.alertMsg = {
        message: res,
        messageType: 'success',
        duration: 3000
      };
      if (res) {
        this.historyData.instruction.serviceForm.splice(obj.formIndex, 1);
      }
    });
  }

  deleteDateRangeScheduleAfterConfirmation(obj) {
    const formId = obj.formDeleteObj.formId;
    this.entityCommonDataService.deleteDateRangeScheduleData(formId).subscribe(res => {
      this.alertMsg = {
        message: 'Schedule Deleted Successfully!',
        messageType: 'success',
        duration: 3000
      };
      if (res) {
        this.scheduleMakerService.updateAllHistoryData();
      }
    });
  }

  deleteAppointmentTypeScheduleAfterConfirmation(obj) {
    const formId = obj.formDeleteObj.formId;
    this.entityCommonDataService.deleteAppointmentTypeScheduleData(formId).subscribe(res => {
      this.alertMsg = {
        message: res,
        messageType: 'success',
        duration: 3000
      };
      if (res) {
        this.historyData.scheduleData[obj.formIndex].appointmentTypeTimeArray.splice(obj.formSubIndex, 1);
      }
    });
  }

  public beforeChange($event: NgbTabChangeEvent) {
    if ($event.nextId === 'tab-current' && _.isEmpty(this.summeryData) && this.summeryData.basicInfo.selectedEntity == null) {
      // $event.preventDefault();
    }
    if ($event.nextId === 'tab-previous') {
      // this.loadInactiveScheduleData();
    }
  }

  editScheduleData(data) {
    this.onEditButtonClick.emit(data);
    // this.entityCommonDataService.activeScheduleStepOnEditClick(data);
  }

  loadInactiveScheduleData() {
    let scheduleId = 0;
    if (!_.isEmpty(this.historyData)) {
      scheduleId = this.historyData.basicInfo.formId;
    } else if (this.summeryData.basicInfo.selectedEntity != null) {
      scheduleId = this.summeryData.basicInfo.formId;
    }
    if (scheduleId) {
      this.entityCommonDataService.loadScheduleInactiveHistory(scheduleId).subscribe(res => {
        this.inactiveHistoryData = []; // res.length > 0 ? this.entityCommonDataService.generateScheduleHistoryData(res) : [];
      });
    } else {
      this.inactiveHistoryData = [];
    }
  }

  showscheduleHistory() {
    this.commonService.openCloselogSlider('open');
  }

  getMoreScheduleHistory() {
    const param = {
      entity_id: this.historyData.basicInfo.selectedEntity.id,
      entity_value_id: this.historyData.basicInfo.selectedProvider.id,
      is_get_only_active: false
    };
    this.scheduleMakerService.getMoreData(param).subscribe(response => {
      let scheduleHistory = this.entityCommonDataService.generateScheduleHistoryData(response.data);
      scheduleHistory.forEach(schedule=>{
          let index= this.historyData.scheduleData.findIndex(activeSchedule=>activeSchedule.formId == schedule.formId);
          if(index==-1){
            this.pastSchesuleData.push(schedule)
          }
      })
      this.isAllScheduleHere = true;
    })
  }
}

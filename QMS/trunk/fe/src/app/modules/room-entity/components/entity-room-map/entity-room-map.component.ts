import { Component, OnInit, OnChanges } from '@angular/core';
import * as _ from 'lodash';
import { EntitityCommonDataService } from 'src/app/modules/schedule/services/entitity-common-data.service';
import { CommonService } from '../../../../services/common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationPopupComponent } from 'src/app/components/confirmation-popup/confirmation-popup.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { IAlert } from 'src/app/models/AlertMessage';
import { fadeInOut } from 'src/app/config/animations';
import { trigger, transition, useAnimation, state, style, animate } from '@angular/animations';
import { Constants } from 'src/app/config/constants';
import { AuthIntercept } from "../../../../auth/auth.intercept";
import { AuthService } from "../../../../services/auth.service";
import { EntityBasicInfoService } from 'src/app/modules/schedule/services/entity-basic-info.service';
import { RoomMasterService } from 'src/app/modules/qms/services/room-master.service';

@Component({
  selector: 'app-entity-room-map',
  templateUrl: './entity-room-map.component.html',
  styleUrls: ['./entity-room-map.component.scss'],
  animations:
    [
      fadeInOut
    ],
})
export class EntityRoomMapComponent implements OnInit, OnChanges {
  selectedEntityValueData: any;
  entityRoomMapForm: any;
  scheduleList: [] = [];
  disableAllRoomListVal: boolean;
  checkHaveSchedule: boolean;
  modalService: NgbModal;
  loadForm: boolean;
  alertMsg: IAlert;
  editMode: boolean;
  addroomFromSchedule: boolean;
  timeFormatKey = '';

  constructor(
    private entitityCommonDataService: EntitityCommonDataService,
    private roomMasterService: RoomMasterService,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private confirmationModalService: NgbModal,
    private router: Router,
    private authService: AuthService,
    private entityBasicInfoService: EntityBasicInfoService
  ) {
    this.modalService = confirmationModalService;
  }

  ngOnInit() {
    const userId = +this.authService.getLoggedInUserId();
    this.loadForm = false;
    this.editMode = false;
    this.addroomFromSchedule = false;
    this.disableAllRoomListVal = false;
    this.checkHaveSchedule = true;
    this.commonService.routeChanged(this.route);
    this.createForm();
    this.timeFormatKey = this.authService.getUserInfoFromLocalStorage().timeFormat;
  }

  ngOnChanges() {
  }

  createForm() {
    this.patchDefaultValue();
  }

  patchDefaultValue() {
    const form = {
      selectedEntity: null,
      selectedEntityValue: null,
      selectedEntityRoomList: null,
      applyToAllSchedules: false,
      timeScheduleList: []
    };
    this.entityRoomMapForm = form;
    this.loadForm = true;
    this.checkEditStatus();
  }

  checkEditStatus() {
    if (!_.isEmpty(this.route.snapshot['params'])) {
      const entity = {
        id: this.route.snapshot.params.entityId,
        name: _.upperCase(_.startCase(this.route.snapshot.params.entityName, '_', ' ')),
        key: _.lowerCase(_.startCase(this.route.snapshot.params.entityName, '_', ' '))
      };
      const provider = {
        id: this.route.snapshot.params.providerId,
        name: _.startCase(this.route.snapshot.params.providerName, '_', ' ')
      };
      this.editMode = true;
      this.entityRoomMapForm.selectedEntity = entity;
      this.getEntityValue(provider);
    } else if (this.entityBasicInfoService.activeScheduleDataForEdit &&
      this.entityBasicInfoService.activeScheduleDataForEdit['routingFlag'] === 'room_mapping') {
      this.addroomFromSchedule = true;
      this.entityRoomMapForm.selectedEntity = this.entityBasicInfoService.activeScheduleDataForEdit['entity'];
      this.getEntityValue(this.entityBasicInfoService.activeScheduleDataForEdit['provider']);
    }
  }

  getEntityData(val) {
    this.checkHaveSchedule = true;
    this.entityRoomMapForm.selectedEntity = val;
    this.entityRoomMapForm.selectedEntityValue = null;
    this.entityRoomMapForm.selectedEntityRoomList = null;
    this.entityRoomMapForm.applyToAllSchedules = false;
    this.entityRoomMapForm.timeScheduleList = [];
  }

  getEntityValue(val) {
    this.checkHaveSchedule = true;
    this.entityRoomMapForm.selectedEntityValue = val;
    this.entityRoomMapForm.selectedEntityRoomList = null;
    this.entityRoomMapForm.applyToAllSchedules = false;
    this.entityRoomMapForm.timeScheduleList = [];
    if (!val || val === null) { return; }
    const param = {
      entity_id: this.entityRoomMapForm['selectedEntity']['id'],
      entity_data_id: this.entityRoomMapForm['selectedEntityValue']['id']
    };
    this.getHistoryData(param);
  }

  getHistoryData(param) {
    this.entitityCommonDataService.getScheduleHistoryDataForProvider(param).subscribe(res => {
      if (!_.isEmpty(res)) {
        this.scheduleList = res;
        this.generateMappingForTime();
        this.checkHaveSchedule = true;
      } else {
        this.entityRoomMapForm.timeScheduleList = [];
        this.checkHaveSchedule = false;
      }
    });
  }

  generateMappingForTime() {
    let fixedRoom = false;
    let roomval = [];
    _.map(this.scheduleList, (v) => {
      _.map(v.appointmentTypeTimeArray, (cv) => {
        if (cv.isFixedRoom) {
          fixedRoom = true;
          roomval = cv.selectedRoomList;
        }
      });
    });
    this.entityRoomMapForm.applyToAllSchedules = fixedRoom;
    if (fixedRoom) {
      this.entityRoomMapForm.selectedEntityRoomList = roomval;
      this.disableAllRoomListVal = true;
    }
    this.entityRoomMapForm.timeScheduleList = this.scheduleList;
  }

  updateSelectedRoomList(val, parIndx, childIndx) {
    this.entityRoomMapForm.timeScheduleList[parIndx]['appointmentTypeTimeArray'][childIndx].selectedRoomList = val.roomVal;
    console.log(this.entityRoomMapForm);
  }

  updateSelectedRoomListToentity(val) {
    this.entityRoomMapForm.selectedEntityRoomList = val.roomVal;
    if (this.entityRoomMapForm.applyToAllSchedules) {
      this.updateMainRoomValToAll(val.roomVal);
    }
    console.log(this.entityRoomMapForm);
  }

  checkEmpty(val) {
    return _.isEmpty(val) ? true : false;
  }

  updateAllSchedule() {
    if (this.entityRoomMapForm.applyToAllSchedules) {
      this.checkIfAlreadyHaveSelectedRoom();
    } else {
      this.disableAllRoomListVal = false;
    }
  }

  updateMainRoomValToAll(val) {
    _.map(this.entityRoomMapForm.timeScheduleList, (v) => {
      _.map(v.appointmentTypeTimeArray, (cv) => {
        cv.selectedRoomList = val;
      });
    });
    console.log(this.entityRoomMapForm);
  }

  checkIfAlreadyHaveSelectedRoom() {
    let check = true;
    _.map(this.entityRoomMapForm.timeScheduleList, (v) => {
      _.map(v.appointmentTypeTimeArray, (cv) => {
        if (cv.selectedRoomList.length > 0 && check) {
          check = false;
        }
      });
    });
    if (!check) {
      this.openConfirmationPoup();
    } else {
      this.updateMainRoomValToAll(this.entityRoomMapForm.selectedEntityRoomList);
    }
  }

  openConfirmationPoup() {
    const messageDetails = {
      modalTitle: 'Confirm',
      modalBody: 'Already room selected, do you want to overwrite !'
    };
    const modalInstance = this.confirmationModalService.open(ConfirmationPopupComponent, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false
    });
    modalInstance.result.then((result) => {
      if (result === 'no') {
        this.disableAllRoomListVal = false;
        this.entityRoomMapForm.applyToAllSchedules = false;
      } else {
        this.disableAllRoomListVal = true;
        this.updateMainRoomValToAll(this.entityRoomMapForm.selectedEntityRoomList);
      }
    }, (reason) => {

    });
    modalInstance.componentInstance.messageDetails = messageDetails;
  }

  saveEntityRoomData() {
    const param = this.entityRoomMapForm;
    let saveData = true;
    if (this.entityRoomMapForm.selectedEntity === null || this.entityRoomMapForm.selectedEntityValue === null) {
      this.alertMsg = {
        message: 'Please Select Provider',
        messageType: 'warning',
        duration: Constants.ALERT_DURATION
      };
      return;
    }
    _.map(param.timeScheduleList, ts => {
      _.map(ts.appointmentTypeTimeArray, at => {
        if (at.selectedRoomList.length === 0 && saveData) {
          saveData = false;
        }
      });
    });
    if (!saveData) {
      this.alertMsg = {
        message: 'Please Attach Room',
        messageType: 'warning',
        duration: Constants.ALERT_DURATION
      };
      return;
    }
    this.roomMasterService.saveEntityRoomMappingData(param).subscribe(res => {
      if (res.status_code === 200) {
        this.alertMsg = {
          message: (this.editMode) ? 'Mapping Updated Successfully' : 'Mapping Added Successfully',
          messageType: 'success',
          duration: Constants.ALERT_DURATION
        };
        setTimeout(() => {
          this.redirectToRoomList();
        }, 1000);

      } else {
        this.alertMsg = {
          message: res.status_code === 409 ? 'Selected Room(s) mapped to other Entity' : 'Something went wrong',
          messageType: 'warning',
          duration: Constants.ALERT_DURATION
        };
      }
    });
  }

  redirectToRoomList() {
    this.router.navigate(['/app/qms/entityRoom/entityRoomMapList']);
  }

  getTimeByTimeFormatSetting(time) {
    return this.commonService.convertTime(this.timeFormatKey, time);
  }

}

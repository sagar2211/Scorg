import { Component, OnInit, Input, Output, EventEmitter, ViewChild, OnDestroy } from '@angular/core';
import { NgbPopover, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { NgxPermissionsService } from 'ngx-permissions';
import * as moment from 'moment';
import * as _ from 'lodash';
import { QAppointments, QSlotInfoDummy } from '../../models/q-entity-appointment-details';
import { Constants } from './../../../../config/constants';
import { IAlert } from './../../../../models/AlertMessage';
import { ConfirmationPopupComponent } from 'src/app/components/confirmation-popup/confirmation-popup.component';
import { PermissionsConstants } from './../../../../shared/constants/PermissionsConstants';
import { AppointmentBookComponent } from '../../../../shared/components/appointment-book/appointment-book.component';
import { AppointmentListModel } from '../../../appointment/models/appointment.model';
import { AuthService } from '../../../../services/auth.service';
import { CallingConfirmComponent } from './../calling-confirm/calling-confirm.component';
import { DisplayDataByStatusPipe } from './../../pipes/display-data-by-status.pipe';
import { QStatusListByKeyPipe } from './../../../../shared/pipes/q-status-list-by-key.pipe';
import { CommonService } from 'src/app/services/common.service';
import { QueueService } from '../../services/queue.service';

@Component({
  selector: 'app-q-dsiplay-grid-details',
  templateUrl: './q-dsiplay-grid-details.component.html',
  styleUrls: ['./q-dsiplay-grid-details.component.scss'],
  providers: [QStatusListByKeyPipe]
})
export class QDsiplayGridDetailsComponent implements OnInit, OnDestroy {
  @Input() public slotIndx: number;
  @Input() public slot: QSlotInfoDummy;
  @Input() public qStatusList: any;
  @Input() public source: string;
  @Input() public hideActions: boolean;
  @Input() appointmentSlots: Array<QSlotInfoDummy> = [];

  @Output() updateStatus = new EventEmitter<any>();
  @Output() cancelAppntment = new EventEmitter<any>();
  @Output() skipAppointment = new EventEmitter<any>();
  @Output() allSelected = new EventEmitter<any>();
  @Output() selectedAppointmentId = new EventEmitter<any>();
  @Output() selectedPatUhid = new EventEmitter<any>();

  @ViewChild('p', { static: false }) ngbPopover: NgbPopover;
  @ViewChild('inConsultantBtnRef', { static: false }) inConsultationRef: NgbPopover;
  @ViewChild('actionPop', { static: false }) actionPopover: NgbPopover;


  alertMsg: IAlert;
  isMouseHover = false;
  modalService: NgbModal;
  compInstance = this;
  selectedAppointment: QSlotInfoDummy;
  selectRoomIdOfPatient: number;
  modalInstance: NgbModalRef;
  isQueueAllAccess: boolean;
  loggedUserProvidersList: [];
  providerDetails = null;
  userInfo: any = null;
  PermissionsConstantsList: any = [];


  constructor(
    private modal: NgbModal,
    private qStatusListByKeyPipe: QStatusListByKeyPipe,
    private confirmationModalService: NgbModal,
    private displayDataByStatusPipe: DisplayDataByStatusPipe,
    private modelService: NgbModal,
    private authService: AuthService,
    private ngxPermissionsService: NgxPermissionsService,
    private commonService: CommonService,
    private queueService: QueueService,
  ) {
    this.modalService = confirmationModalService;
  }

  ngOnInit() {
    // this.queueAllAccess = PermissionsConstants.View_Queue_AllAccess;
    this.PermissionsConstantsList = PermissionsConstants;
    // const permissions = this.ngxPermissionsService.getPermission(PermissionsConstants.View_Queue_AllAccess);
    // if (permissions && permissions.name) {
    //   this.isQueueAllAccess = true;
    // } else {
    //   this.isQueueAllAccess = false;
    // }
    // this.qStatusList = this.qStatusListByKeyPipe.transform(this.qStatusList, this.source);
    this.userInfo = this.authService.getUserInfoFromLocalStorage();
    this.loggedUserProvidersList = this.userInfo.provider_info;
    this.providerDetails = _.find(this.loggedUserProvidersList, { providerValueId: this.userInfo.user_id });
    this.queueService.$closeNgbPopoverObs.subscribe((res: any) => {
      if (this.slot.appointmentId === res.slot.appointmentId) {
        if (res.compInstance.actionPopover && res.compInstance.actionPopover.isOpen()) {
          res.compInstance.actionPopover.open();
        } else {
          if (res.compInstance.actionPopover) {
            res.compInstance.actionPopover.close();
          }
        }
      } else {
        if (res.compInstance.actionPopover && res.compInstance.actionPopover.isOpen() && this.actionPopover) {
          this.actionPopover.close();
          if (res.compInstance.ngbPopover) {
            res.compInstance.ngbPopover.close();
          }
        }
      }
    });
  }

  ngOnDestroy(): void {
    if (this.modalInstance) {
      this.modalInstance.dismiss();
    }
  }

  onSkip(slot): void {
    this.skipAppointment.next(slot);
  }

  updateAppointentStatus(slot, status, roomId?, isSkip?): void {
    if (+status === 2) {
      this.updateStatus.next({ slot, status, roomId });
    } else if (+status === 3) {
      const modalTitleobj = 'Cancel';
      const modalBodyobj = 'Do you want to cancel?';
      const messageDetails = {
        modalTitle: modalTitleobj,
        modalBody: modalBodyobj
      };
      this.modalInstance = this.confirmationModalService.open(ConfirmationPopupComponent,
        {
          ariaLabelledBy: 'modal-basic-title',
          backdrop: 'static',
          keyboard: false
        });
      this.modalInstance.result.then((result) => {
        if (result === 'Ok') {
          this.updateStatus.next({ slot, status });
        }
      });
      this.modalInstance.componentInstance.messageDetails = messageDetails;
    } else {
      this.updateStatus.next({ slot, status, roomId, isSkip });
    }
  }

  cancelAppointment(slot): void {
    this.cancelAppntment.next(slot);
  }

  isAllSelected(): void {
    this.allSelected.next();
  }
  queueStatusCheck(quesuStatusId, slot?: QSlotInfoDummy) {
    return this.qStatusListByKeyPipe.transform(quesuStatusId, this.source, slot);
  }

  // -- click on nbgPopover
  onPopover(status, currentTemplateRef): void {
    if (this.slot.roomDetails.length) {
      const hadCallingData = this.checkCallingData(status);
      if (this.slot.roomDetails.length === 1 && !hadCallingData) {
        this.updateAppointentStatus(this.slot, status, this.slot.roomDetails[0].roomId);
      } else {
        if (currentTemplateRef.isOpen()) {
          currentTemplateRef.close();
        } else {
          currentTemplateRef.open();
        }
      }
    } else {
      this.alertMsg = {
        message: 'No Rooms available',
        messageType: 'danger',
        duration: Constants.ALERT_DURATION
      };
    }
  }

  checkCallingData(status): boolean {
    const appList = this.displayDataByStatusPipe.transform(this.appointmentSlots, true, ['INCONSULTATION', 'CALLING'], true);
    const queueId = this.slot.queueId;
    const isAvailableinCalling = _.find(appList, (s) => s.queueId === queueId);
    if (!appList.length || isAvailableinCalling !== undefined) {
      this.selectedAppointment = this.slot;
      return false;
    } else if (status === 4 && appList.length < Constants.CALLING_LIMIT) {
      this.selectedAppointment = this.slot;
      return false;
    } else {
      this.selectedAppointment = this.slot;
      return true;
    }
  }

  onRoomSelect(roomId): void {
    this.selectRoomIdOfPatient = roomId;
    this.openCallingPopup();
  }

  openCallingPopup(): void {
    let list = [];
    const appList = this.displayDataByStatusPipe.transform(this.appointmentSlots, true, ['INCONSULTATION', 'CALLING'], true);
    if (!appList.length) {
      this.updateAppointentStatus(this.slot, 2, this.selectRoomIdOfPatient);
      return;
    } else {
      list = appList;
    }

    this.modalInstance = this.modalService.open(CallingConfirmComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false,
        container: '#homeComponent'
      });
    (this.modalInstance.componentInstance as CallingConfirmComponent).appointmentSlots = list;
    (this.modalInstance.componentInstance as CallingConfirmComponent).callingLimit = Constants.CALLING_LIMIT;
    (this.modalInstance.componentInstance as CallingConfirmComponent).selectedAppointment = this.selectedAppointment;
    (this.modalInstance.componentInstance as CallingConfirmComponent).selectRoomIdOfPatient = this.selectRoomIdOfPatient;
    (this.modalInstance.componentInstance as CallingConfirmComponent).updateStatusEvent.subscribe(res => {
      this.updateAppointentStatus(res.item, res.status, res.roomId, res.isSkip);
    });
  }

  onNotesRemarksClick(): void {
    const item: QAppointments = this.slot;
    // item.generateObject(this.slot);
    if (_.isUndefined(this.providerDetails)) {
      this.providerDetails = this.commonService.getCurrentSelectedProvider();
    }
    let appointmentDetails: any = Object.assign(item, {
      entity_id: this.providerDetails.providerId,
      entity_value_id: this.providerDetails.providerValueId,
      entity_value_name: this.providerDetails.providerName
    });
    appointmentDetails.slot_details = appointmentDetails;
    const appList = new AppointmentListModel();
    appList.generateObj(appointmentDetails);
    appointmentDetails = appList;
    appointmentDetails.entity_data = appointmentDetails.entity_data[0];
    appointmentDetails.entity_data.date = new Date();

    const modalInstanceReschedule = this.modelService.open(AppointmentBookComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false,
        size: 'xl',
        container: '#homeComponent'
      });

    const modelInstance = modalInstanceReschedule.componentInstance as AppointmentBookComponent;
    modelInstance.patientData = {
      pat_name: item.patName,
      pat_uhid: item.patUhid,
      pat_gender: item.patGender,
      pat_Age: item.patAge, //  get age with appropriate unit as a string
      pat_mobileno: item.patMobileNo
    };
    modelInstance.selectedAppointementData = appointmentDetails;
    modelInstance.bookingData = item;
    modelInstance.source = 'qlist';
    modalInstanceReschedule.result.then((res) => {
      if (res.patType) {
        this.slot.patType = res.patType;
      }
    }, () => {
    });
  }

  modifyAge(val: string): string {
    let updateString = '';
    if (val) {
      const split = val.split(' ');
      if (split[1] === 'YEARS') {
        updateString = split[0] + ' Yrs';
      } else {
        updateString = split[0] + split[1].charAt(0);
      }
    }
    return updateString;
  }

  onMouseOut(): void {
    this.isMouseHover = false;
  }

  showAppointmentHistory(slot, flag) {
    // const modalInstanceForAppointmentHistory = this.modelService.open(AppointmentHistoryComponent,
    //   {
    //     ariaLabelledBy: 'modal-basic-title',
    //     backdrop: 'static',
    //     keyboard: false,
    //     windowClass: 'custom-modal',
    //     size: 'lg',
    //     container: '#homeComponent'
    //   });
    // modalInstanceForAppointmentHistory.componentInstance.appointmentId = appointmentId;
    if (flag === 'appointmenthistory') {
      this.selectedAppointmentId.next(slot.appointmentId);
    } else {
      this.selectedPatUhid.next(slot);
    }
    this.commonService.openCloselogSlider('open');
  }

  onActionPop(currentTemplateRef): void {
    if (currentTemplateRef.isOpen()) {
      currentTemplateRef.close();
    } else {
      currentTemplateRef.open();
    }
    this.queueService.sendEventOfNgbPopover(this.compInstance);
  }
}

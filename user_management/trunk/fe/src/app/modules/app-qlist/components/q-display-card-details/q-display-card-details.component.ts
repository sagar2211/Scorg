import { NgbPopover, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Component, OnInit, Input, Output, EventEmitter, ViewChild, OnDestroy } from '@angular/core';
import { IAlert } from 'src/app/models/AlertMessage';
import { Constants } from './../../../../config/constants';
import { QStatusListByKeyPipe } from 'src/app/shared/pipes/q-status-list-by-key.pipe';
import { ConfirmationPopupComponent } from 'src/app/components/confirmation-popup/confirmation-popup.component';
import { AppointmentListModel } from '../../../appointment/models/appointment.model';
import { AppointmentBookComponent } from '../../../../shared/components/appointment-book/appointment-book.component';
import { AuthService } from '../../../../services/auth.service';
import * as _ from 'lodash';
import { PermissionsConstants } from './../../../../shared/constants/PermissionsConstants';
import { CommonService } from 'src/app/services/common.service';
import { QAppointments, QSlotInfoDummy } from 'src/app/modules/qms/models/q-entity-appointment-details';
import { QueueService } from 'src/app/modules/qms/services/queue.service';
import { DisplayDataByStatusPipe } from 'src/app/modules/qms/pipes/display-data-by-status.pipe';
import { CallingConfirmComponent } from 'src/app/modules/qms/components/calling-confirm/calling-confirm.component';

@Component({
  selector: 'app-q-display-card-details',
  templateUrl: './q-display-card-details.component.html',
  styleUrls: ['./q-display-card-details.component.scss'],
  providers: [NgbPopover, QStatusListByKeyPipe]
})
export class QDisplayCardDetailsComponent implements OnInit, OnDestroy {
  compInstance = this;
  @ViewChild('roomPopRef', { static: false }) roomNgbPopover: NgbPopover;
  @ViewChild('actionPop', { static: false }) actionPopover: NgbPopover;
  @ViewChild('p', { static: false }) ngbPopover: NgbPopover;

  @Input() public slot: QSlotInfoDummy;
  @Output() cancelAppointment = new EventEmitter<any>();
  @Output() skip = new EventEmitter<any>();
  @Output() updateStatus = new EventEmitter<any>();
  @Input() public source: string;
  @Input() appointmentSlots: Array<QSlotInfoDummy> = [];
  @Output() selectedAppointmentId = new EventEmitter<any>();
  @Output() selectedPatUhid = new EventEmitter<any>();



  alertMsg: IAlert;
  qStatusList: Array<{ id: number, name: string }> = [];
  appTypeColor: string;
  modalService: NgbModal;
  selectedAppointment: QSlotInfoDummy;
  selectRoomIdOfPatient: number;
  modalInstance: NgbModalRef;
  permissions: any;
  userInfo: any = null;
  loggedUserProvidersList: [];
  providerDetails = null;

  constructor(
    private queueService: QueueService,
    private qStatusListByKeyPipe: QStatusListByKeyPipe,
    private confirmationModalService: NgbModal,
    private displayDataByStatusPipe: DisplayDataByStatusPipe,
    private modelService: NgbModal,
    private authService: AuthService,
    private commonService: CommonService
  ) {
    this.modalService = confirmationModalService;
  }

  ngOnInit() {
    this.permissions = PermissionsConstants;
    this.qStatusList = this.queueService.queueStatusList;
    this.appTypeColor = this.setColor();
    this.queueService.$closeNgbPopoverObs.subscribe((res: any) => {
      if (this.slot.appointmentId === res.slot.appointmentId) {
        if (res.compInstance.ngbPopover && res.compInstance.ngbPopover.isOpen()) {
          res.compInstance.ngbPopover.open();
        } else {
          if (res.compInstance.ngbPopover) {
            res.compInstance.ngbPopover.close();
          }
        }
        // -- for room ngbPopover
        if (res.compInstance.roomNgbPopover && res.compInstance.roomNgbPopover.isOpen()) {
          res.compInstance.roomNgbPopover.open();
        } else {
          if (res.compInstance.roomNgbPopover) {
            res.compInstance.roomNgbPopover.close();
          }
        }
        if (res.compInstance.actionPopover && res.compInstance.actionPopover.isOpen()) {
          res.compInstance.actionPopover.open();
        } else {
          if (res.compInstance.actionPopover) {
            res.compInstance.actionPopover.close();
          }
        }
      } else {
        if (res.compInstance.ngbPopover && res.compInstance.ngbPopover.isOpen() && this.ngbPopover) {
          this.ngbPopover.close();
          this.roomNgbPopover.close();
          this.actionPopover.close();
        }
        if (res.compInstance.roomNgbPopover && res.compInstance.roomNgbPopover.isOpen() && this.roomNgbPopover) {
          this.roomNgbPopover.close();
          this.ngbPopover.close();
          if (res.compInstance.ngbPopover) {
            res.compInstance.ngbPopover.close();
          }
        }
        if (res.compInstance.actionPopover && res.compInstance.actionPopover.isOpen() && this.actionPopover) {
          this.actionPopover.close();
          if (res.compInstance.ngbPopover) {
            res.compInstance.ngbPopover.close();
          }
        }
      }
    });

    this.userInfo = this.authService.getUserInfoFromLocalStorage();
    this.loggedUserProvidersList = this.userInfo.provider_info;
    this.providerDetails = _.find(this.loggedUserProvidersList, { providerValueId: this.userInfo.user_id });

  }

  ngOnDestroy(): void {
    if (this.modalInstance) {
      this.modalInstance.dismiss();
    }
  }

  updateAppointentStatus(slot, status, roomId?): void {
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
      this.updateStatus.next({ slot, status, roomId });
    }
  }

  onCancel(list) {
    this.cancelAppointment.next(list);
  }

  onSkip(item) {
    this.skip.next(item);
  }

  // onQueueStatus(event) {
  //   if (this.ngbPopover.isOpen()) {
  //     this.ngbPopover.close();
  //   } else {
  //     this.ngbPopover.open();
  //     if (this.roomNgbPopover) {
  //       this.roomNgbPopover.close();
  //     }
  //   }
  //   this.queueService.sendEventOfNgbPopover(this.compInstance);
  // }

  setColor(): string {
    return Constants.APP_TYPES_COLOR_CODES.get(this.slot.appointmentTypeId);
  }

  onRoomPopover(status, event): void {
    if (this.slot.roomDetails.length) {
      const hadCallingData = this.checkCallingData(status);
      if (this.slot.roomDetails.length === 1 && !hadCallingData) {
        this.updateAppointentStatus(this.slot, status, this.slot.roomDetails[0].roomId);
      } else {
        if (status === 2) {
          if (this.roomNgbPopover.isOpen()) {
            this.roomNgbPopover.close();
          } else {
            this.roomNgbPopover.open();
            if (this.ngbPopover) {
              this.ngbPopover.close();
            }
          }
        } else {
          if (this.ngbPopover.isOpen()) {
            this.ngbPopover.close();
          } else {
            this.ngbPopover.open();
            if (this.roomNgbPopover) {
              this.roomNgbPopover.close();
            }
          }
        }

        this.queueService.sendEventOfNgbPopover(this.compInstance);
      }
    } else {
      this.alertMsg = {
        message: 'No Rooms available',
        messageType: 'danger',
        duration: Constants.ALERT_DURATION
      };
    }
  }

  queueStatusCheck(quesuStatusId) {
    return this.qStatusListByKeyPipe.transform(quesuStatusId, this.source, this.slot);
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
      this.updateAppointentStatus(this.slot, 2, this.slot.roomDetails[0].roomId);
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
      this.updateAppointentStatus(res.item, res.status, res.roomId);
    });
  }

  onNotesRemarksClick(): void {
    const item: QAppointments = this.slot;
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
      pat_Age: item.patAge, // get age with appropriate unit as a string
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
  showAppointmentHistory(slot,flag) {
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

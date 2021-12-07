import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ViewContainerRef, OnChanges, AfterViewInit } from '@angular/core';
import { IAlert } from 'src/app/models/AlertMessage';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { DisplayDataByStatusPipe } from './../../pipes/display-data-by-status.pipe';
import { ConfirmationPopupComponent } from './../../../../components/confirmation-popup/confirmation-popup.component';
import { Constants } from './../../../../config/constants';
import { NgbTabset, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { QueueService } from 'src/app/modules/qms/services/queue.service';
import { QSlotInfoDummy } from '../../models/q-entity-appointment-details';
import * as moment from 'moment';
import { NgxPermissionsService } from 'ngx-permissions';
import { PermissionsConstants } from './../../../../shared/constants/PermissionsConstants';
import { Subject } from 'rxjs';
import { CommonService } from 'src/app/services/common.service';
import { takeUntil } from 'rxjs/operators';
import { SlideInOutLogAnimation } from 'src/app/config/animations';

@Component({
  selector: 'app-q-display-grid-view',
  templateUrl: './q-display-grid-view.component.html',
  styleUrls: ['./q-display-grid-view.component.scss'],
  providers: [DisplayDataByStatusPipe],
  animations: [SlideInOutLogAnimation]

})
export class QDisplayGridViewComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() qSlotList: Array<QSlotInfoDummy>;
  @Input() appointmentSearch: string;
  @Input() isShowEmptySlot: string;
  @Input() hideActions: boolean;
  @Input() public displayTabs: Array<string>;
  @Input() providerDetails: any;
  @Input() isCompLoadFrom: string;
  @Input() public repeatCallingCount = 0;
  @Input() filter: any = [];
  @Input() isShowConfirmedOrTentetive: boolean;
  @Output() cancelApp = new EventEmitter<any>();
  @Output() updateApp = new EventEmitter<any>();
  @Output() skip = new EventEmitter<any>();
  @Output() private updateSequence = new EventEmitter<any>();

  @ViewChild('t', { static: false }) tabRef: NgbTabset;
  @ViewChild(NgbTabset, { static: false }) set content(content: ViewContainerRef) {
    this.tabSet = content;
  }

  selectAll = false;
  showFilterMenus = false;

  selectedAppointmentId = null;
  selectedPatientUhid = null;
  loganimationState = 'out';
  isShowLog = false;
  $destroy: Subject<any> = new Subject<any>();

  private tabSet: any;
  alertMsg: IAlert;
  tabs = [{
    id: 'all', name: 'All', display: false
  }, {
    id: 'queue', name: 'Active Queue', display: false
  }, {
    id: 'inConsultation', name: 'In Consultation', display: false
  }, {
    id: 'skipped', name: 'Skipped', display: false
  }, {
    id: 'complete', name: 'Complete', display: false
  }];

  isDragAndDropHide: boolean;

  constructor(
    private queueService: QueueService,
    private modelService: NgbModal,
    private displayDataByStatusPipe: DisplayDataByStatusPipe,
    private ngxPermissionsService: NgxPermissionsService,
    private commonService: CommonService
  ) { }

  ngOnInit() {
    // const t = this.ngxPermissionsService.getPermission(PermissionsConstants.View_Queue_AllAccess);
    // if (t && t.name) { // if queue has all permissions
    // this.isDragAndDropHide = false;
    // if (this.displayTabs && this.displayTabs.length) {
    //   this.showTabs(this.displayTabs);
    // } else {
    //   // this.isDragAndDropHide = true;
    //   this.showTabs(['all']);
    // }
    this.commonService.$logSliderOpenClose.pipe(takeUntil(this.$destroy)).subscribe((obj: any) => {
      if (obj === 'open') {
        this.isShowLog = true;
        this.loganimationState = this.isShowLog ? 'in' : 'out';
      } else {
        this.selectedAppointmentId = null;
        this.selectedPatientUhid = null;
        this.isShowLog = false;
        this.loganimationState = 'out';
      }
    });
  }

  ngAfterViewInit() {
    if (this.isCompLoadFrom != 'doctorDashboard') {
      setTimeout(() => {
        this.tabRef.select('queue');
      });
    }
  }

  ngOnChanges() {
    this.qSlotList.forEach(q => {
      if (moment(q.slotTime, 'hh:mm A').isAfter(moment(moment().format('hh:mm A'), 'hh:mm A'))) {
        q.isDisabled = false;
      } else {
        q.isDisabled = true;
      }
    });
  }

  trackByFunction = (index, item) => {
    if (!item) { return null; }
    return item.configId || item.patUhid;
  }

  cancelAppointment(event): void {
    this.cancelApp.next(event);
  }

  updateAppointentStatus(event): void {
    this.updateApp.next(event);
  }

  onSkip(event): void {
    this.skip.next(event);
  }

  // -- check/uncheck all checkboxes
  onSelectAll() {
    this.qSlotList.forEach((s) => {
      if (s.isBooked) {
        s.checked = this.selectAll;
      }
    });
    this.showFilterMenus = this.qSlotList.some((item: any) => item.checked === true && item.isBooked);
  }

  isAllSelected() {
    this.selectAll = this.qSlotList.every((item: any) => {
      return item.checked === true;
    });
    this.showFilterMenus = this.qSlotList.some((item: any) => item.checked === true && item.isBooked);
  }

  bulkCancel() {
    let filterList = [];
    const appIds = [];
    const queueStatus = this.tabSet.activeId === 'queue' ? 'NEXT' : this.tabSet.activeId === 'inConsultation' ? 'INCONSULTATION' :
      this.tabSet.activeId === 'skipped' ? 'SKIP' : 'COMPLETE';
    filterList = this.displayDataByStatusPipe.transform(this.qSlotList, true, [queueStatus]);
    filterList = filterList.filter(r => r.checked);
    filterList.forEach((r: QSlotInfoDummy) => {
      if (r.appointmentId) {
        appIds.push(r.appointmentId);
      }
    });

    const reqParams = {
      date: null,
      remarks: '',
      appId: appIds
    };
    if (appIds.length <= 0) {
      this.alertMsg = {
        message: 'Please select booked slots!',
        messageType: 'danger',
        duration: Constants.ALERT_DURATION
      };
      return;
    }

    const modalInstance = this.modelService.open(ConfirmationPopupComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false,
        windowClass: 'custom-modal'
      });
    modalInstance.componentInstance.messageDetails = {
      modalTitle: 'Do you want to cancel?',
      modalBody: 'Selected Appontments are cancelled'
    };
    modalInstance.result.then((res1: any) => {

      this.queueService.cancelBulkAppointments(reqParams).subscribe(res => {
        if (res.status_message === 'Success') {
          filterList.forEach(f => {
            const indx = this.qSlotList.findIndex(s => s.appointmentId === f.appointmentId);
            if (indx !== -1) { this.qSlotList.splice(indx, 1); }
          });
          this.alertMsg = {
            message: res.message,
            messageType: 'success',
            duration: Constants.ALERT_DURATION
          };
        } else {
          this.alertMsg = {
            message: res.message,
            messageType: 'danger',
            duration: Constants.ALERT_DURATION
          };
        }
      });
    }, () => { });

  }

  drop(event: CdkDragDrop<QSlotInfoDummy[]>) {
    if (event.previousContainer === event.container && event.item.data.appointments.length) {
      // const currentTime = moment().format('hh:mm');
      const currIndx = this.qSlotList.findIndex(q => q.slotId === event.container.data[event.currentIndex].slotId);
      const prevIndx = this.qSlotList.findIndex(q => q.slotId === event.container.data[event.previousIndex].slotId);
      const prevData = { ...this.qSlotList[currIndx] } as QSlotInfoDummy;

      if (moment(prevData.slotTime, 'hh:mm A').isAfter(moment(moment().format('hh:mm A'), 'hh:mm A'))) {
        console.log(event.item.data);
        this.updateQueueSequence(event.item.data, prevData);
        // if (currIndx !== -1) {
        //   this.qSlotList[currIndx] = event.item.data;
        // }
        // if (prevIndx !== -1) {
        //   this.qSlotList[prevIndx] = prevData;
        // }
      } else {
        this.alertMsg = {
          message: 'Time already passed so cannot move',
          messageType: 'danger',
          duration: Constants.ALERT_DURATION
        };
      }
      // moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      this.alertMsg = {
        message: 'Cannot move empty slots',
        messageType: 'danger',
        duration: Constants.ALERT_DURATION
      };
    }
  }

  showTabs(displayTabs: Array<any>): void {
    if (displayTabs && displayTabs.length) {
      displayTabs.forEach(dt => {
        const data = this.tabs.find(t => t.id === dt);
        if (data) {
          data.display = true;
        } else {
          data.display = false;
        }
      });
      this.tabs = this.tabs.filter(r => r.display === true);
    }
  }

  updateQueueSequence(fromData: QSlotInfoDummy, toData: QSlotInfoDummy): void {
    this.updateSequence.emit({
      from_slot: fromData.slotId,
      to_slot: toData.slotId
    });
  }
  getselectedAppointment(event): void {
    this.selectedAppointmentId = event;
  }
  getSelectedPatUhId(event): void {
    this.selectedPatientUhid = event;
  }
  closeLogSlider() {
    this.commonService.openCloselogSlider('close');
  }

}

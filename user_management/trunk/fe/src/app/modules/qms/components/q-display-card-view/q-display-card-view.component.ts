import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { QSlotInfoDummy } from '../../models/q-entity-appointment-details';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { NgxPermissionsService } from 'ngx-permissions';
import { PermissionsConstants } from 'src/app/shared/constants/PermissionsConstants';
import { SlideInOutLogAnimation } from 'src/app/config/animations';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-q-display-card-view',
  templateUrl: './q-display-card-view.component.html',
  styleUrls: ['./q-display-card-view.component.scss'],
  animations: [SlideInOutLogAnimation]
})
export class QDisplayCardViewComponent implements OnInit, OnChanges {
  @Input() public qSlotList: Array<QSlotInfoDummy>;
  @Output() updateStatus = new EventEmitter<any>();
  @Output() cancelApp = new EventEmitter<any>();
  @Output() skip = new EventEmitter<any>();
  @Input() public appointmentSearch: string;
  @Input() public repeatCallingCount = 0;
  @Input() isCompLoadFrom: string;
  @Input() providerDetails: any;
  @Input() isShowConfirmedOrTentetive: boolean;
  selectedAppointmentId: any = null;
  loganimationState = 'out';
  isShowLog = false;
  selectedPatientUhid = null;
  $destroy: Subject<any> = new Subject<any>();
  isDragAndDropHide: boolean;
  constructor(
    private ngxPermissionsService: NgxPermissionsService,
    private commonService: CommonService
  ) { }

  ngOnInit() {
    // const t = this.ngxPermissionsService.getPermission(PermissionsConstants.View_Queue_AllAccess);
    // if (t && t.name) { // if queue has all permissions
    //   this.isDragAndDropHide = false;
    // } else {
    //   this.isDragAndDropHide = true;
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

  ngOnChanges() {
  }

  trackByFunction = (index, item) => {
    if (!item) { return null; }
    return item.configId || item.appointmentId;
  }

  drop(event: CdkDragDrop<string[]>, status) {
    this.updateStatus.next({ event: event.item.data, status });
    return;

    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex);
    }
  }

  completDrop(event: CdkDragDrop<string[]>, status) {
    if (event.item.data.queueStatusId === 4) { // -- only inconsultation status
      this.updateStatus.next({ event: event.item.data, status });
    }
  }

  skipDrop(event: CdkDragDrop<string[]>, status) {
    if ((event.item.data.queueStatusId === 1)) { // -- only inconsultation status
      // this.updateStatus.next({ event: event.item.data, status });
      this.updateStatus.next({ event: event.item.data, status, roomId: 0 , isSkip: true });
    }
  }

  queueDrop(event: CdkDragDrop<string[]>, status) {
    if ((event.item.data.queueStatusId === 1) || (event.item.data.queueStatusId === 7)) { // -- only inconsultation status
      // if (event.item.data.queueStatusId === 7) {
      //   this.updateStatus.next({ event: event.item.data, status, roomId: 0 , isSkip: true });
      // } else {
        this.updateStatus.next({ event: event.item.data, status });
      // }
    }
  }

  cancelAppointment(event) {
    this.cancelApp.next(event);
  }

  onSkip($event) {
    this.skip.next($event);
  }

  updateAppStatus(slot, status, roomId?) {
    this.updateStatus.next({ event: slot, status, roomId });
  }
  closeLogSlider() {
    this.commonService.openCloselogSlider('close');
  }
  getselectedAppointment(event): void {
    this.selectedAppointmentId = event;
  }
  getSelectedPatUhId(event): void {
    this.selectedPatientUhid = event;
  }
}

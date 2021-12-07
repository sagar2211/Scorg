import { Directive, ElementRef, Input, OnInit, Output, EventEmitter } from '@angular/core';
import * as moment from 'moment';
import { AppointmentHistory } from './../../modules/appointment/models/appointment-history.model';

@Directive({
  selector: '[appHideStatusBtn]'
})
export class HideStatusBtnDirective implements OnInit {
  element: ElementRef;
  @Input() type: string;
  @Input() item: AppointmentHistory;
  @Output() isShow = new EventEmitter<boolean>();

  constructor(private elementRef: ElementRef) {
    this.element = elementRef;
  }

  ngOnInit() {
    let isTrue = false;
    if (this.type === 'CANCEL') { // -- check condition for CANCEL buttons
      const dateCheck = moment(moment(this.item.appointmentDate).format('YYYY-MM-DD')).isSameOrAfter(moment().format('YYYY-MM-DD'));
      const apptStatus = ((this.item.appointmentStatus === 'TENTATIVE' || this.item['bookingStatus'] === 'TENTATIVE' ||
      this.item.appointmentStatus === 'CONFIRMED' || this.item['bookingStatus'] === 'CONFIRMED' ||
      this.item.appointmentStatus === 'RESCHEDULE' || this.item['bookingStatus'] === 'RESCHEDULE'));
      // return dateCheck && apptStatus;
      isTrue = dateCheck && apptStatus;
    } else if (this.type === 'FOLLOW_UP') { // -- check condition for FOLLOW UP buttons
      const apptStatus = ((this.item.appointmentStatus === 'CONFIRMED' || this.item['bookingStatus'] === 'CONFIRMED') && this.item.queueStatus === 'COMPLETE');
      // return apptStatus;
      isTrue = apptStatus;
    } else if (this.type === 'BOOK') { // -- check condition for book
      const isConfirm = ((this.item.appointmentStatus === 'CONFIRMED' || this.item['bookingStatus'] === 'CONFIRMED') && this.item.queueStatus === 'COMPLETE');
      const isCancel = (this.item.appointmentStatus === 'CANCELLED' || this.item['bookingStatus'] === 'CANCELLED');
      // return isConfirm || isCancel;
      isTrue = isConfirm || isCancel;
    } else if (this.type === 'RESCHEDULE') { // -- check condition for RESCHEDULE buttons
      const apptStatus = ((this.item.appointmentStatus === 'CONFIRMED' || this.item.appointmentStatus === 'TENTATIVE' || this.item['bookingStatus'] === 'CONFIRMED') && this.item.queueStatus !== 'COMPLETE');
      // return apptStatus;
      isTrue = apptStatus;
    } else {
      // return false;
      isTrue = false;
    }
    this.element.nativeElement.style.display = isTrue ? 'inline' : 'none';
    this.isShow.emit(isTrue);
  }

}

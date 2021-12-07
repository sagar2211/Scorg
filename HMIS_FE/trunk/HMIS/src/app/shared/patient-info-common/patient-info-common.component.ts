import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subject } from 'rxjs';
import { PatientEncounterDetailComponent } from '../patient-encounter-detail/patient-encounter-detail.component';
import * as _ from 'lodash';

@Component({
  selector: 'app-patient-info-common',
  templateUrl: './patient-info-common.component.html',
  styleUrls: ['./patient-info-common.component.scss']
})
export class PatientInfoCommonComponent implements OnInit {
  @Input() showPatientSearchBox: boolean;
  @Input() voucherList: Array<any> = [];
  @Input() billingForm: any;
  @Input() patientList$ = new Observable<any>();
  @Input() patientListInput$ = new Subject<any>();
  @Input() isPatientClassChangePage: boolean = false;
  @Input() isViewOnlyBillMode: boolean = false;

  @Output() enableViewOnlyBillModeEvent = new EventEmitter<any>();
  @Output() patientSelectEvent = new EventEmitter<any>();
  @Output() enablePatientSearchEvent = new EventEmitter<any>();
  @Output() getSelectedVoucherEvent = new EventEmitter<any>();
  @Output() redirectToBillPaymentEvent = new EventEmitter<any>();
  @Output() redirectToBillRefundEvent = new EventEmitter<any>();

  constructor(private modalService: NgbModal) { }

  ngOnInit(): void {
  }
  public get allowAddNewBill() {
    return this.voucherList.length > 0 && !(_.find(this.voucherList, (o) => {
      return !o.isSpotBill && o.bookType == this.billingForm?.selectedPatient?.penType;
    }));
  }
  enableViewOnlyBillMode(isViewOnly) {
    this.enableViewOnlyBillModeEvent.next(isViewOnly);
  }
  enablePatientSearch(flag: boolean) {
    this.enablePatientSearchEvent.next(flag);
  }
  onPatientChange($event: any) {
    this.patientSelectEvent.next($event);
  }
  getSelectedVoucher($event: any) {
    this.getSelectedVoucherEvent.next($event);
  }
  redirectToBillPayment($event: any) {
    this.redirectToBillPaymentEvent.next($event);
  }
  redirectToBillRefund($event: any) {
    this.redirectToBillRefundEvent.next($event);
  }
  showPatientEncounterDetail() {
    const modalInstance = this.modalService.open(PatientEncounterDetailComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        keyboard: false,
        size: 'xl',
        container: '#homeComponent',
      });
    modalInstance.componentInstance.patientData = {
      penId: this.billingForm.selectedPatient?.penId
    };
    modalInstance.result.then((res1: any) => {

    }, (reason) => {

    });
  }
}

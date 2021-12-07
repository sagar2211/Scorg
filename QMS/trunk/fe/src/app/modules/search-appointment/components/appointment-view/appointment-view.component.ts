import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Component, OnInit, Input, ViewChild, ViewContainerRef, OnDestroy, Output } from '@angular/core';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-appointment-view',
  templateUrl: './appointment-view.component.html',
  styleUrls: ['./appointment-view.component.scss']
})
export class AppointmentViewComponent implements OnInit, OnDestroy {

  @Input() appointmentParams;
  @Input() public searchRequestParams;
  @Input() public patientInfo;
  @Output() loadComp = new Subject<any>();

  @ViewChild('tab', { static: false }) tabRef: ViewContainerRef;
  @ViewChild('slotView', { static: false }) slotViewRef: ViewContainerRef;

  viewType: string;
  $destroy = new Subject<any>();
  isExpand = false;
  modalInstance: any;

  constructor(
    private ngbModal: NgbModal
  ) { }

  ngOnInit() {
    this.viewType = this.appointmentParams.from;
  }

  ngOnDestroy() {
    this.$destroy.next();
    this.$destroy.unsubscribe();
    if (this.modalInstance) {
      this.ngbModal.dismissAll();
      // this.modalInstance.dismiss();
    }
  }

  loadComponent() {
    this.loadComp.next();
  }

  onExpand(content): void {
    this.isExpand = true;
    this.modalInstance = this.ngbModal.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      size: 'xl',
      keyboard: false,
      windowClass: 'custom-modal',
      container: '#homeComponent'
    }).result.then(() => {
      this.isExpand = false;
    }, () => {
      this.isExpand = false;
    });
  }
}

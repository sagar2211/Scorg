import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { AuthService } from './../../public/services/auth.service';
import { CommonService } from './../../public/services/common.service';
import { DynamicChartService } from './../dynamic-chart.service';
import { AddOrderSetOfChartComponent } from './../add-order-set-of-chart/add-order-set-of-chart.component';
import { Constants } from './../../config/constants';
import { IAlert } from './../../public/models/AlertMessage';
import { ConfirmationPopupComponent } from './../../shared/confirmation-popup/confirmation-popup.component';

@Component({
  selector: 'app-chart-order-set-display',
  templateUrl: './chart-order-set-display.component.html',
  styleUrls: ['./chart-order-set-display.component.scss']
})
export class ChartOrderSetDisplayComponent implements OnInit {
  activeChartData = null;
  orderSetList = [];
  setAlertMessage: IAlert;
  openById = {};

  @Output() applyOrderToChart = new EventEmitter<any>();
  @Input() public chartComponentList;

  constructor(
    private ngbModal: NgbModal,
    private dynamicChartService: DynamicChartService,
    private commonService: CommonService,
    private authService: AuthService,
  ) { }

  ngOnInit() {
    this.activeChartData = this.dynamicChartService.getActiveChartInfo();
    this.getPatientVisitOrdersets();
  }

  getPatientVisitOrdersets(): void {
    const patientData = this.commonService.getLastActivePatient();
    const userInfo = this.authService.getUserInfoFromLocalStorage();
    // console.log(this.activeChartData);
    const reqParams = {
      serviceTypeId: patientData.serviceType.id,
      patientChartId: this.activeChartData.chartId,
      specialityId: userInfo.speciality_id,
      userId: userInfo.user_id,
      searchKeyword: '',
      limit: 50,
      pageNumber: 1
    };
    // return;
    this.dynamicChartService.getPatientVisitOrdersets(reqParams).subscribe(res => {
      if (res.status_message === 'Success') {
        this.orderSetList = res.data;
      }
    });
  }

  addOrderSet(item?, event?) {
    const modalInstance = this.ngbModal.open(AddOrderSetOfChartComponent, {
      ariaLabelledBy: 'modal-basic-title',
      // backdrop: 'static',
      keyboard: false,
      size: 'lg',
      container: '#homeComponent'
    });
    modalInstance.result.then((res) => {
      if (res.mode === 'ADD') {
        this.setAlertMessage = {
          message: 'Order Set Added Successfully...',
          messageType: 'success',
          duration: Constants.ALERT_DURATION
        };
        this.orderSetList.push(res.data);
      } else {
        this.setAlertMessage = {
          message: 'Order Set Updated Successfully...',
          messageType: 'success',
          duration: Constants.ALERT_DURATION
        };
        const indx = this.orderSetList.findIndex(o => o.visitOrdersetId === res.data.visitOrdersetId);
        if (indx !== -1) {
          this.orderSetList[indx] = res.data;
        }
      }
    }, () => { });
    modalInstance.componentInstance.selectedOrderSet = item;
    modalInstance.componentInstance.componentList = this.chartComponentList;
    if (event) {
      event.stopPropagation();
    }
  }

  deletePatientVisitOrderSet(item, event): void {
    event.stopPropagation();
    this.dynamicChartService.deletePatientVisitOrderset(item.visitOrdersetId).subscribe(res => {
      if (res.status_message === 'Success') {
        const indx = this.orderSetList.findIndex(o => o.visitOrdersetId === item.visitOrdersetId);
        if (indx !== -1) {
          this.orderSetList.splice(indx, 1);
          this.setAlertMessage = {
            message: 'Record deleted successfully...',
            messageType: 'success',
            duration: Constants.ALERT_DURATION
          };
        }
      }
    });
  }

  toggleAccordian(event): void {
    this.openById[event.panelId] = event.nextState;
    const data = this.orderSetList.find(o => o.visitOrdersetId === +event.panelId);
    if (event.nextState && data && !data.chartData) {
      this.dynamicChartService.getPatientVisitOrdersetById(data.visitOrdersetId).subscribe(res => {
        if (res.status_message === 'Success') {
          const indx = this.orderSetList.findIndex(o => o.visitOrdersetId === data.visitOrdersetId);
          if (indx !== -1) {
            this.orderSetList[indx] = res.data;
          }
        }
      });
    }
  }

  applyOrderSetToChart({ ...item }, event): void {
    event.stopPropagation();
    const modalBodyobj = 'Do you want to override this order';
    const messageDetails = {
      modalTitle: 'Delete',
      modalBody: modalBodyobj
    };
    const modalInstance = this.ngbModal.open(ConfirmationPopupComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false
      });
    modalInstance.result.then((result) => {
      if (result === 'Ok') {
        const keys = Object.keys(item.chartData);
        keys.forEach(k => {
          this.dynamicChartService.updateLocalChartData(k, item.chartData[k], 'update');
        });
        this.applyOrderToChart.emit();
      }
    });
    modalInstance.componentInstance.messageDetails = messageDetails;
  }

}

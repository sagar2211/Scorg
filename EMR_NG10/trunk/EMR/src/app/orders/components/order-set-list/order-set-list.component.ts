import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { OrderService } from '../../../public/services/order.service';
import { debounceTime, takeUntil } from 'rxjs/operators';
import * as _ from 'lodash';
import { AuthService } from './../../../public/services/auth.service';
import { ConfirmationPopupComponent } from './../../../shared/confirmation-popup/confirmation-popup.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { IAlert } from './../../../public/models/AlertMessage';
import { Subject } from 'rxjs';
import * as moment from 'moment';

@Component({
  selector: 'app-order-set-list',
  templateUrl: './order-set-list.component.html',
  styleUrls: ['./order-set-list.component.scss']
})
export class OrderSetListComponent implements OnInit, OnChanges {

  orderSetList: any[] = [];
  masterCategories: any[] = [];
  activeOrderSetDetails: any;
  @Input() loadOrderSetList = false;
  @Input() serviceType;
  @Output() editOrderSetData = new EventEmitter<any>();
  userId: number;
  alertMsg: IAlert;
  currentSection = 'section1';
  boxShadow = false;
  searchTxt = '';
  subject: Subject<string> = new Subject();
  ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  activeSection = 'User';
  filterSectionArray = ['User', 'Speciality'];
  userInfo: any;

  constructor(
    private orderService: OrderService,
    private authService: AuthService,
    private confirmationModalService: NgbModal,
  ) { }

  ngOnInit() {
    this.userId = +this.authService.getLoggedInUserId();
    const requestParams = {
      serviceTypeId: this.serviceType.id,
    };
    this.orderService.getAllMasterOrderCategories(requestParams).subscribe(res => {
      this.masterCategories = res;
      this.getOrderSetService();
    });
  }

  ngOnChanges() {
    if (this.loadOrderSetList) {
      this.getOrderSetService();
    }
  }

  getOrderSetService() {
    const params = {
      SpecialityId: +this.authService.getUserInfoFromLocalStorage().speciality_id,
      userId: (this.activeSection === 'Department') ? null : this.userId,
      serviceTypeId: this.serviceType ? this.serviceType.id : null,
      Limit: 10,
      page_number: 1
    };
    this.orderService.getOrderSetList(params).subscribe(res => {
      this.orderSetList = res;
    });
  }

  getSetOrderSetDetails(orderSetItem, action) {
    const orderSetDetails = this.activeOrderSetDetails ? (this.activeOrderSetDetails.OredrSetId === orderSetItem.OredrSetId ? this.activeOrderSetDetails : {}) : {};
    if (!_.isEmpty(orderSetDetails)) {
      if (action === 'apply_order_set') { this.applyOrderSet(_.cloneDeep(orderSetDetails)); }
      if (action === 'edit_order_set') { this.editOrderSetMode(_.cloneDeep(orderSetDetails)); }
      return;
    }
    this.orderService.getOrderSetDetailsById(orderSetItem.OredrSetId).subscribe(res => {
      this.activeOrderSetDetails = (res.length) ? res[0] : [];
      const orderStatus = this.orderService.checkOrderStatus(this.userInfo);
      if (res.length) {
        _.forEach(this.masterCategories, (o) => {
          if (o.orderKey === 'medicineOrders') {
            const temp = [];
            this.activeOrderSetDetails.OrderData[o.orderKey].forEach(element => {
              const obj = this.orderService.getOrderObjectModel(o.orderKey);
              element.id = '';
              element.status = orderStatus.status;
              if (orderStatus.approvedBy) {
                element.approvedBy = orderStatus.approvedBy;
              }
              if (obj.isObjectValid(element)) {
                element.medicineObj.startDate = null;
                obj.generateObject(element);
                obj.status = orderStatus.status;
                temp.push(obj);
                if (orderStatus.approvedBy) {
                  obj.approvedBy = orderStatus.approvedBy;
                }
              }
            });
            // this.activeOrderSetDetails.OrderData[o.orderKey] = _.cloneDeep(this.orderService.convertPlainToModelObjects(o.orderKey, 'update', this.activeOrderSetDetails.OrderData[o.orderKey]));
          } else if (o.orderKey === 'otherOrders') {
            _.map(this.activeOrderSetDetails.OrderData['instructionOrders'], (order) => {
              order.id = '';
              order.startDateTime = null;
              order.status = orderStatus.status;
              if (orderStatus.approvedBy) {
                order.approvedBy = orderStatus.approvedBy;
              }
            });
            _.map(this.activeOrderSetDetails.OrderData['serviceOrders'], (order) => {
              order.id = '';
              order.startDateTime = null;
              order.status = orderStatus.status;
              if (orderStatus.approvedBy) {
                order.approvedBy = orderStatus.approvedBy;
              }
            });
          } else {
            _.map(this.activeOrderSetDetails.OrderData[o.orderKey], (order) => {
              order.id = '';
              order.startDateTime = null;
              order.status = orderStatus.status;
              if (orderStatus.approvedBy) {
                order.approvedBy = orderStatus.approvedBy;
              }
            });
          }
        });
        if (action === 'apply_order_set') { this.applyOrderSet(_.cloneDeep(this.activeOrderSetDetails)); }
        if (action === 'edit_order_set') { this.editOrderSetMode(_.cloneDeep(this.activeOrderSetDetails)); }
      }
    });
  }

  applyOrderSet(orderSetDetails) {
    _.forEach(this.masterCategories, (orderCategory) => {
      if (orderCategory.orderKey === 'otherOrders') {
        const otehrOrderData = {
          docInstructionOrder: orderSetDetails.OrderData['instructionOrders'],
          servicesOrder: orderSetDetails.OrderData['serviceOrders']
        };
        otehrOrderData.docInstructionOrder.map(d => {
          d.startDateTime = new Date(moment().format('YYYY/MM/DD hh:mm a'));
          d.order_date = new Date(moment().format('YYYY/MM/DD hh:mm a'));
        });
        otehrOrderData.servicesOrder.map(d => {
          d.startDateTime = new Date(moment().format('YYYY/MM/DD hh:mm a'));
          d.order_date = new Date(moment().format('YYYY/MM/DD hh:mm a'));
        });
        this.orderService.setOrderData(otehrOrderData, 'update', orderCategory.orderKey);
      } else {
        const currentOrderDetails = orderSetDetails.OrderData[orderCategory.orderKey];
        currentOrderDetails.map(d => {
          d.order_date = new Date(moment().format('YYYY/MM/DD hh:mm a'));
          if (!_.isUndefined(d.startDateTime)) {
            d.startDateTime = new Date(moment().format('YYYY/MM/DD hh:mm a'));
          }
          if (!_.isUndefined(d.medicineObj) && !_.isUndefined(d.medicineObj.startDate)) {
            d.medicineObj.startDate = new Date(moment().format('YYYY/MM/DD'));
            d.medicineObj.dose = null;
            d.medicineObj.doseUnit = null;
          }
        })
        this.orderService.setOrderData(currentOrderDetails, 'update', orderCategory.orderKey);
      }
      this.alertMsg = {
        message: 'Order Set Applied Successfully!',
        messageType: 'success',
        duration: 3000
      };
    });
  }

  loadConfirmationPopup(orderSetItem, action) {
    const modalTitleobj = 'Confirmation Required';
    const modalBodyobj = (action === 'delete') ? 'Are you sure you want to delete this order set?' :
      'All existing orders will be overwritten. Are you sure you want to continue?';
    const messageDetails = {
      modalTitle: modalTitleobj,
      modalBody: modalBodyobj
    };
    const modalInstance = this.confirmationModalService.open(ConfirmationPopupComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false
      });
    modalInstance.result.then((result) => {
      if (result === 'Ok') {
        if (action === 'delete') {
          this.deleteOrderSet(orderSetItem.OredrSetId);
        } else {
          this.getSetOrderSetDetails(orderSetItem, action);
        }
      }
      if (result === 'cancel click') {
        return;
      }
    });
    modalInstance.componentInstance.messageDetails = messageDetails;
  }

  editOrderSetMode(orderSetItem) {
    // set each order to local
    _.forEach(this.masterCategories, (o) => {
      if (o.orderKey === 'otherOrders') {
        const otehrOrderData = {
          docInstructionOrder: orderSetItem.OrderData['instructionOrders'],
          servicesOrder: orderSetItem.OrderData['serviceOrders']
        };
        this.orderService.setOrderData(otehrOrderData, 'update', o.orderKey);
      } else {
        this.orderService.setOrderData(orderSetItem.OrderData[o.orderKey], 'update', o.orderKey);
      }
    });
    // set order set edit mode flag on
    const orderSetEditDetail = { orderSetId: orderSetItem.OredrSetId, orderSetName: orderSetItem.OredrSetName };
    this.orderService.setOrderData(orderSetEditDetail, 'update', 'patientOrderSetEditData');
    this.editOrderSetData.emit(orderSetEditDetail);
  }

  scrollTo(section) {
    if (!this.activeOrderSetDetails) { return; }
    document.querySelector('#' + section)
      .scrollIntoView();
    this.onSectionChange(section);
  }

  onSectionChange(sectionId: string) {
    this.currentSection = sectionId;
    this.boxShadow = true;
  }

  subjectFun() {
    // -- Subscribe to the subject, which is triggered from search input and when section clicked
    // -- When the debounce time has passed, we call getActiveScheduleData()
    this.subject
      .pipe(debounceTime(500), takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.getOrderSetService();
      }
      );
  }

  deleteOrderSet(orderSetId) {
    this.orderService.deleteOrderSet(orderSetId).subscribe(res => {
      if (res) {
        // remove item from list
        const index = _.findIndex(this.orderSetList, (obj) => obj.OredrSetId === orderSetId);
        this.orderSetList.splice(index, 1);
        this.clearOrderSetLocalData();
        this.activeOrderSetDetails = undefined;
        this.alertMsg = {
          message: 'Order Set Deleted Successfully!',
          messageType: 'success',
          duration: 3000
        };
      }
    });
  }

  clearOrderSetLocalData() {
    this.orderService.setOrderData(false, 'update', 'patientOrderSetEditData');
    _.forEach(this.masterCategories, (o) => {
      if (o.orderKey === 'otherOrders') {
        const otehrOrderData = {
          docInstructionOrder: [],
          servicesOrder: []
        }
        this.orderService.setOrderData(otehrOrderData, 'update', o.orderKey);
      } else {
        this.orderService.setOrderData([], 'update', o.orderKey);
      }
    });
  }
}

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as _ from 'lodash';
import { OrderService } from '../../../public/services/order.service';
import { ConsultationService } from './../../../public/services/consultation.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationPopupComponent } from './../../../shared/confirmation-popup/confirmation-popup.component';

@Component({
  selector: 'app-order-set-display',
  templateUrl: './order-set-display.component.html',
  styleUrls: ['./order-set-display.component.scss']
})
export class OrderSetDisplayComponent implements OnInit {

  @Input() itemOrder;
  @Input() displayType;
  @Input() masterOrderCategories;
  @Output() openEditOrderPreviewSection = new EventEmitter();
  @Output() editOrderSet = new EventEmitter();
  @Output() deleteFromOrderSet = new EventEmitter();
  @Output() setOrderSetEvent = new EventEmitter();
  constructor(
    public _orderService: OrderService,
    public _consultationService: ConsultationService,
    private confirmationModalService: NgbModal
  ) { }

  ngOnInit() {
  }

  // to open edit order set. Clicked on order set list
  openEditOrderSetPreview(item, setOrderSet?) {
    if (this.itemOrder.isExpanded || this.itemOrder.isDataAvailable) {
      if (!setOrderSet) {
        this.openEditOrderPreviewSection.emit(item);
      } else {
        this.setOrderSetEvent.emit(_.cloneDeep(this.itemOrder));
      }
      return;
    }
    // call to API
    const preview = (!setOrderSet);
    this.getOrderSetDataById(this.itemOrder, preview, setOrderSet);
  }

  // to edit the order set. Clicked on order set preview
  openEditOrderSetSection(orderKey) {
    this.editOrderSet.emit({orderKey, openPopup: false});
  }

  // to open edit popup and edit particular order in selected order set.
  openEditOrderPopup(orderKey, data) {
    this.editOrderSet.emit({orderKey, openPopup: true, data});
  }

  openOrderSetDetails(itemOrder) {
    if (this.itemOrder.isExpanded || itemOrder.isDataAvailable) {
      this.itemOrder.isExpanded = !this.itemOrder.isExpanded;
      return;
    }
    this.getOrderSetDataById(itemOrder);
  }

  // delete order set
  deleteOrderSetById() {
    const obj = {
      index: this.itemOrder.orderSetId,
      deleteType: 'orderSet'
    };
    this.deleteFromOrderSet.emit(obj);
  }

  // delete order in particular order category.
  deleteOrder(orderKey, index, deleteType) {
    // this.itemOrder[orderKey].splice(index, 1);
    const obj = {
      index,
      deleteType,
      orderKey
    };

    this.deleteFromOrderSet.emit(obj);
  }

  // call parent to set given order set into orders
  setOrderSet() {
    this.setOrderSetEvent.emit(_.cloneDeep(this.itemOrder));
  }

  getOrderSetDataById(itemOrder, preview?, setOrderSet?) {
    // call to API to get given order set data.
    const requestParams = {
      orderSetId: itemOrder.orderSetId
    };
    this._orderService.getOrderSetForOrdersById(requestParams).subscribe(res => {
      this.itemOrder = res;
      this.itemOrder.isExpanded = true;
      this.itemOrder.isDataAvailable = true;
      if (preview && preview != false) {
        this.openEditOrderPreviewSection.emit(this.itemOrder);
      }
      if (setOrderSet) {
        this.setOrderSetEvent.emit(_.cloneDeep(this.itemOrder));
      }
    });
  }

  loadConfirmationPopup(type) {
    const modalTitle = (type === 'delete') ? 'Order Set Deletion' : 'Order Set Edit';
    const modalBody = (type === 'delete') ? 'Are you sure you want to delete order set ' + this.itemOrder.ordersetName :
      'Are you sure you want to edit order set ' + this.itemOrder.ordersetName;
    const messageDetails = {
      modalTitle,
      modalBody
    };
    const modalInstance = this.confirmationModalService.open(ConfirmationPopupComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false,
        size: 'sm',
        windowClass: 'custom-modal'
      });
    modalInstance.result.then((result) => {
      if (result === 'Ok') {
        if (type === 'delete') {
          this.deleteOrderSetById();
        }
        if (type === 'edit') {
          this.openEditOrderSetPreview(this.itemOrder);
        }
      }
    });
    modalInstance.componentInstance.messageDetails = messageDetails;
  }
}

import { Component, OnInit, Input, OnChanges, EventEmitter, Output } from '@angular/core';
import { OrderService } from '../../../public/services/order.service';
import * as _ from 'lodash';
import { IOrdersCategory } from '../../../public/models/iorders';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from 'src/app/public/services/common.service';

@Component({
  selector: 'app-orders-display',
  templateUrl: './orders-display.component.html',
  styleUrls: ['./orders-display.component.scss']
})
export class OrdersDisplayComponent implements OnInit, OnChanges {
  @Input() item: any[];
  @Input() source: string;
  @Input() isEdit: boolean;
  @Input() isDelete: boolean;
  @Input() isShowActions: boolean;
  @Input() inputIndex: number;
  @Input() isFromFavSuggestionTemplate = false;
  @Input() isNonOpdConsultationChart = false;
  selectedItem: any;
  loginUserInfo: any;

  @Output() editData = new EventEmitter();
  @Output() deleteData = new EventEmitter<any>();
  @Output() approveOrder = new EventEmitter<any>();
  @Output() selectInvestigationComponentData = new EventEmitter();
  @Output() checkAllPendingValue = new EventEmitter();
  masterCategories: IOrdersCategory[];

  constructor(
    private orderService: OrderService,
    private modalService: NgbModal,
    private commonService: CommonService,
  ) { }

  ngOnInit() {
    // this.loginUserInfo = this._authService.getUserDetailsByKey('userInfo');
    // this.getAllCategories();
    this.orderService.$OrderByEvent.subscribe((res: any) => {
      this.isShowActions = res && res.role_type === 'DOCTOR' ? true : false;
    });
  }


  // getAllCategories() {
  //   this.orderService.getAllMasterOrderCategories().subscribe(res => {
  //     this.masterCategories = res;
  //   });
  // }

  ngOnChanges() {
    this.isShowActions = this.orderService.selectedDoctorForOrder &&
    this.orderService.selectedDoctorForOrder.role_type === 'DOCTOR' ? true : false;
    this.selectedItem = this.item;
  }

  onDeleteClick(selectedItem): void {
    this.openModalPopupSugg(false);
    this.deleteData.emit(selectedItem);
    this.orderService.editOrderData({
      mode: 'delete',
      key: this.source,
      data: selectedItem,
      orderIndex: -1
    });
  }

  getLocalOrderDataIndexByTempId(tempId, key) {
    const orderData = this.orderService.getOrderData(key, true);
    const index = _.findIndex(orderData, (o) => {
      return o.tempId === tempId;
    });
    return index;
  }
  checkBoxChecked(selectedItem) {
    return selectedItem.tempstatus === 'approved' ? true : false;
  }
  changescheckBoxChecked(e, object) {
    object.isDirty = true;
    object.tempstatus = e.target.checked === true ? 'approved' : '';
    this.checkAllPendingValue.emit();
    if (object.id) {
      object.isDirty = e.target.checked;
      this.orderService.sendEvntToParentComp({
        mode: e.target.checked ? 'update' : 'remove',
        source: '',
        status: 'unsaveStatus'
      });
    }
  }

  onEditClick(selectedItem, key): void {
    // const index = this.getLocalOrderDataIndexByTempId(selectedItem.tempId, key);
    // const editData = {
    //   'key': key,
    //   'data': selectedItem,
    //   'orderIndex': index
    // };
    // const selectedCompForEdit = _.find(this.masterCategories, (o) => {
    //   return o.orderKey == key;
    // });
    // if (selectedCompForEdit) {
    //   // load popup here
    //   const modelInstance = this.modalService.open(EditOrderComponent, {
    //     backdrop: 'static',
    //     keyboard: false,
    //     size: 'lg',
    //     windowClass: 'custom-modal edit-order'
    //   });
    //   const editObj = {
    //     selectedCompForEdit: selectedCompForEdit,
    //     editData: editData
    //   };
    //   modelInstance.componentInstance.editObj = editObj;
    // }
    this.openModalPopupSugg(true);
    this.commonService.openSuggesstionPanelOnFixedComponentSearchCallFunction('open');
    this.orderService.loadSuggestionFromOrders.next({ hideSuggestion: true });
    if (this.inputIndex) {
      selectedItem['orderIndex'] = this.inputIndex;
    }
    this.editData.emit(selectedItem);
  }

  openModalPopupSugg(val) {
    if (this.commonService.isTabModeOn) {
      this.commonService.openSuggesstionPanelWhenTabModeOnForComponents(val);
    }
  }


  onInvestigationComponentClick(selectedItem): void {
    this.selectInvestigationComponentData.emit(selectedItem);
  }

  saveOrderAction(selectedItem, key?) {
    if (!selectedItem.orderBy) {
      const obj = {
        message: 'Please Select Doctor to approve',
        messageType: 'warning'
      };
      this.orderService.OrderErrorEvent.next(obj);
      return ;
    }
    selectedItem.status = 'APPROVED';
    const obj = {
      message: 'Successfully Approved',
      messageType: 'success'
    };
    this.orderService.OrderErrorEvent.next(obj);
    this.approveOrder.emit(selectedItem);
  }
}

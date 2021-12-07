import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { OrderService } from '../../../public/services/order.service';
import * as _ from 'lodash';
import { OrderListFilterPipe } from '../../pipes/order-list-filter.pipe';
import { AuthService } from './../../../public/services/auth.service';

@Component({
  selector: 'app-add-edit-order-set',
  templateUrl: './add-edit-order-set.component.html',
  styleUrls: ['./add-edit-order-set.component.scss'],
  providers: [OrderListFilterPipe]
})
export class AddEditOrderSetComponent implements OnInit {

  @Input() masterCategories;
  @Input() serviceType;
  allOrders: any[] = [];
  allOrdersListWithKey = {};
  orderSetDetails = { orderSetName: '', orderSetDescription: '' };
  userId: number;
  userInfo: any;
  ordersCount = 0;
  selectedSection = 'User';
  sectionLevels = ['User', 'Speciality'];
  constructor(public modal: NgbActiveModal,
    private orderService: OrderService,
    private orderListFilterPipe: OrderListFilterPipe,
    private authService: AuthService
  ) {
  }

  ngOnInit() {
    this.userId = +this.authService.getLoggedInUserId();
    this.userInfo = this.authService.getUserInfoFromLocalStorage();
    this.getLocalOrderData();
  }

  getLocalOrderData() {
    let orders: any[] = [];
    _.forEach(this.masterCategories, (o) => {
      let orderData = _.cloneDeep(this.orderService.getOrderData(o.orderKey, true));
      if (o.orderKey === 'otherOrders') {
        const docOrder = this.orderListFilterPipe.transform(orderData.docInstructionOrder, false, false, 'unSaved');
        const serviceOrder = this.orderListFilterPipe.transform(orderData.servicesOrder, false, false, 'unSaved');
        this.allOrdersListWithKey['Doctor Instruction'] = docOrder;
        this.allOrdersListWithKey['Services with Notes'] = serviceOrder;
        orders = orders.concat(docOrder);
        orders = orders.concat(serviceOrder);
      } else {
        orderData = this.orderListFilterPipe.transform(orderData, false, false, 'unSaved');
        orders = orders.concat(orderData);
        this.storeOrderByCategory(o.orderKey, orderData);
      }
      this.ordersCount += orders.length;
      this.allOrders = orders;
    });
  }

  saveOrderSet() {
    const ordersData = {};
    _.forEach(this.masterCategories, (o) => {
      if (o.orderKey === 'otherOrders') {
        _.map(this.allOrdersListWithKey['Doctor Instruction'], (order) => {
          order.id = '0';
        });
        _.map(this.allOrdersListWithKey['Services with Notes'], (order) => {
          order.id = '0';
        });
        ordersData['doctorInstructionOrders'] = this.allOrdersListWithKey['Doctor Instruction'];
        ordersData['doctorServiceOrders'] = this.allOrdersListWithKey['Services with Notes'];
      } else {
        _.map(this.allOrdersListWithKey[o.orderKey], (order) => {
          order.id = '0';
        });
        ordersData[o.orderKey] = this.allOrdersListWithKey[o.orderKey];
      }
    });
    const reqParams = {
      speciality_id: +this.userInfo.speciality_id,
      // deptId: '111',
      orderset_id: '',
      userId: (this.selectedSection === 'User') ? this.userId : null,
      orderset_name: this.orderSetDetails.orderSetName,
      order_desc: this.orderSetDetails.orderSetDescription,
      order_data: ordersData,
      serviceTypeId: this.serviceType ? this.serviceType.id : null
    };
    this.orderService.saveOrderSet(reqParams).subscribe(res => {
      if (res) {
        this.modal.close(true);
      }
    });
  }
  storeOrderByCategory(key, list) {
    if (!(this.allOrdersListWithKey.hasOwnProperty(key))) {
      this.allOrdersListWithKey[key] = list;
    }
  }

  closePopup() {
    this.modal.close(false);
  }

}

import { Component, OnInit, ViewChild, ViewContainerRef, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { OrderService } from '../../../public/services/order.service';
import { OrderListFilterPipe } from '../../pipes/order-list-filter.pipe';
import * as _ from 'lodash';

@Component({
  selector: 'app-review-orders',
  templateUrl: './review-orders.component.html',
  styleUrls: ['./review-orders.component.scss'],
  providers: [OrderListFilterPipe]

})
export class ReviewOrdersComponent implements OnInit {

  @ViewChild('unsavedOrderReviewList', {read: ViewContainerRef, static: true}) unsavedOrderReviewList: ViewContainerRef;
  @Input() compList: any[];
  @Input() masterCategories;
  allOrdersListWithKey = {};
  constructor(
    public activeModal: NgbActiveModal,
    private orderService: OrderService,
    private orderListFilterPipe: OrderListFilterPipe
  ) { }

  ngOnInit(): void {
    // this.loadUnsavedCompList(this.compList);
    this.getLocalOrderData();
  }

  // loadUnsavedCompList(compList) {
  //   const viewContainerRef = this.unsavedOrderReviewList;
  //   viewContainerRef.clear();
  //   compList.forEach(item => {
  //     item['component'] = this.componentsService.getComponentDetailsByKey(item.orderKey)['component']; // -- to get component instance
  //     const componentFactory = this.componentFactoryResolver.resolveComponentFactory(item.component);
  //     const componentRef = viewContainerRef.createComponent(componentFactory);
  //     /* componentRef.instance['activeIds'] = this.activeOrderPanels;
  //     componentRef.instance['filterBy'] = this.filterBy; */
  //     componentRef.instance['orderCatId'] = item.orderId;
  //     componentRef.instance['orderDisplayType'] = 'unsaved';
  //     componentRef.instance['isOpen'] = true;
  //     componentRef.instance['isEdit'] = false;
  //     componentRef.instance['isDelete'] = false;
  //     componentRef.instance['isShowActions'] = false;
  //     componentRef.instance['loadSuggestion'] = false;

  //     const dataObj = {
  //       name: item.orderName,
  //       orderCatId: item.orderId,
  //      /*  filterBy: this.filterBy, */
  //       key: item.orderKey
  //     };
  //     (<IConsultationSectionComponent>componentRef.instance).data = dataObj;
  //   });
  // }

  getLocalOrderData() {
    let orders: any[] = [];
    _.forEach(this.masterCategories, (o) => {
      let orderData = _.cloneDeep(this.orderService.getOrderData(o.orderKey, true));
      if (o.orderKey === 'otherOrders') {
        this.allOrdersListWithKey['Doctor Instruction'] = this.orderListFilterPipe.transform(orderData.docInstructionOrder, false, false, 'unSaved');
        this.allOrdersListWithKey['Services with Notes'] = this.orderListFilterPipe.transform(orderData.servicesOrder, false, false, 'unSaved');
      } else {
        orderData = this.orderListFilterPipe.transform(orderData, false, false, 'unSaved');
        orders = orders.concat(orderData);
        this.storeOrderByCategory(o.orderKey, orderData);
      }
    });
  }
  storeOrderByCategory(key, list) {
    if (!(this.allOrdersListWithKey.hasOwnProperty(key))) {
      this.allOrdersListWithKey[key] = list;
    }
  }

}

import { Pipe, PipeTransform } from '@angular/core';
import * as _ from 'lodash';
import * as moment from 'moment';

@Pipe({
  name: 'orderListFilter',
  pure: false
})
export class OrderListFilterPipe implements PipeTransform {

  transform(items: any, filter?: any, categoryFilter?: boolean, savedUnsavedOrdersFlag?, statusFilter?): any {
    if (items) {
      if (savedUnsavedOrdersFlag !== undefined && savedUnsavedOrdersFlag !== false) {
        const result = [];
        _.forEach(items, (o) => {
          let saved = true;
          saved = !((!(!o.id || o.id === undefined || o.id === '')) || o.isDirty);
          if (!saved && savedUnsavedOrdersFlag === 'unSaved') {
            result.push(o);
          }
          if (saved && savedUnsavedOrdersFlag === 'saved') {
            result.push(o);
          }
        });
        items = result;
      }
      if (!statusFilter && (!filter || categoryFilter === undefined || categoryFilter === null)) {
        return items;
      }
      if (categoryFilter === true) {
        if (_.isArray(filter.orderCategories) && filter.orderCategories.length) {
          items = _.filter(items, (o1) => _.some(filter.orderCategories, (o2) => o2 === o1.categoryKey));
        } else if (_.isString(filter.orderCategories)) {
          let filteredOrderCategories = [];
          // filter by single cagtegory
          filteredOrderCategories = _.filter(items, (o) => (o.categoryKey === filter.orderCategories));
          return filteredOrderCategories;
        } else if(filter && _.isArray(filter.orderStatusList) && filter.orderStatusList.length && _.isObject(filter.orderStatusList[0])){
          let filteredOrderCategories = [];
          filteredOrderCategories = _.filter(items, (o1) => _.some(filter.orderStatusList, (o2) => o2.orderKey === o1.categoryKey));
          return filteredOrderCategories;
        }
      }
      if (filter && _.isArray(filter.orderBy) && filter.orderBy.length) {
        items = _.filter(items, (o1) => _.some(filter.orderBy, (o2) => o2.user_id === o1.order_by.user_id));
      }
      if (filter && _.isArray(filter.approvedBy) && filter.approvedBy.length) {
        items = _.filter(items, (o1) => o1.approved_by && _.some(filter.approvedBy, (o2) => o2.user_id === o1.approved_by.user_id));
      }
      if (filter && filter.approveOrderDate) {
        items = _.filter(items, (o1) => o1.approved_by && moment(moment(o1.approved_by.approved_date).format('YYYY/MM/DD')).isSame(moment(moment(filter.approveOrderDate).format('YYYY/MM/DD'))));
      }
      if (filter && filter.orderDate) {
        items = _.filter(items, (o1) => moment(moment(o1.order_date).format('YYYY/MM/DD')).isSame(moment(moment(filter.orderDate).format('YYYY/MM/DD'))));
      }
      if (filter && _.isArray(filter.orderStatusList) && filter.orderStatusList.length) {
        items = _.filter(items, (o1) => _.some(filter.orderStatusList, (o2) => o2 === o1.status));
      }

      if (statusFilter) {
        let result = [];
        if (statusFilter.userId !== 0) {
          if (statusFilter.status) {
            result = _.filter(items, (o) => o.order_by.user_id === statusFilter.userId && o.status === statusFilter.status);
          } else {
            result = _.filter(items, (o) => (o.order_by.user_id === statusFilter.userId));
          }
        }
        if (statusFilter.userId === 0 && statusFilter.status) {
          result = _.filter(items, (o) => (o.status === statusFilter.status));
        }
        items = result;
      }
      return items;
    }
    return items;
  }

}

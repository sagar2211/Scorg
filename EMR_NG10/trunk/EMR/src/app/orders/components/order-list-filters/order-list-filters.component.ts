import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PatientService } from './../../../public/services/patient.service';
import { OrderService } from '../../../public/services/order.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-order-list-filters',
  templateUrl: './order-list-filters.component.html',
  styleUrls: ['./order-list-filters.component.scss']
})
export class OrderListFiltersComponent implements OnInit {
  @Input() messageDetails: any;
  patientInfo: any;
  orderBySelected: any[] = [];
  approvedBySelected: any[] = [];
  constructor(public modal: NgbActiveModal,
    public orderService: OrderService,
    public patientService: PatientService) { }
  admissionDate = new Date();
  today = new Date();
  orderCategories: any[] = [];
  orderDate: Date;
  approveOrderDate: Date;
  orderStatusList: any[] = [];
  ngOnInit() {
    this.patientInfo = this.patientService.getCurrentAdmittedPatientInfo();
    // this.admissionDate = new Date(this.patientInfo.AdmissionDate);
    this.orderCategories = this.messageDetails.orderCategories;
    this.orderStatusList = this.messageDetails.orderStatusList;
    _.map(this.orderCategories, (o) => o.isSelected = false);
    _.map(this.orderStatusList, (o) => o.isSelected = false);
    if (this.messageDetails.filters.selectedFilter) {
      const selectedFilter = this.messageDetails.filters.selectedFilter;
      this.orderBySelected = selectedFilter.orderBy;
      this.approvedBySelected = selectedFilter.approvedBy;
      this.orderDate = selectedFilter.orderDate;
      this.approveOrderDate = selectedFilter.approveOrderDate;
      // _.map(this.orderCategories, (o) => o.isSelected = o.isSelected ? o.isSelected : false);
      _.map(this.orderStatusList, (o) => {
        o.isSelected = _.some(selectedFilter.orderStatusList, (o2) => o2 === o.status_key);
      });
    }
  }

  selectValueConfirm(type) {
    if (type === 'apply') {
      // prepare and send filter data
      const ordersFiltered = [];
      const statusFiltered = [];
      _.forEach(this.orderCategories, (o) => {
        if (o.isSelected) {
          ordersFiltered.push(o.orderKey);
        }
      });
      _.forEach(this.orderStatusList, (o) => {
        if (o.isSelected) {
          statusFiltered.push(o.status_key);
        }
      });
      const filterData = {
        orderBy: this.orderBySelected,
        approvedBy: this.approvedBySelected,
        orderCategories: ordersFiltered,
        orderDate: this.orderDate,
        approveOrderDate: this.approveOrderDate,
        orderStatusList: statusFiltered
      };
      this.modal.close(filterData);
    } else if (type === 'clear') {
      this.orderBySelected = [];
      this.approvedBySelected = [];
      this.orderDate = null;
      this.approveOrderDate = null;
      this.modal.close(null);
    } else {
      this.modal.dismiss();
    }
  }
}

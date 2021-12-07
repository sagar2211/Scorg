import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {DatatableComponent} from "@swimlane/ngx-datatable";
import {Observable, Subject} from "rxjs";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {debounceTime, map, takeUntil} from "rxjs/operators";
import {Constants} from "../../../../config/constants";
import {AddEditItemSupplierTaxMasterComponent} from '../add-edit-item-supplier-tax-master/add-edit-item-supplier-tax-master.component';
import * as _ from 'lodash';
import {ConfirmationPopupComponent} from "../../../../shared/confirmation-popup/confirmation-popup.component";
import {CommonService} from "../../../../public/services/common.service";
import {PermissionsConstants} from "../../../../config/PermissionsConstants";
import { IAlert } from 'src/app/public/models/AlertMessage';
import { MastersService } from 'src/app/modules/masters/services/masters.service';
import { Supplier } from 'src/app/modules/masters/modals/supplier.model';
@Component({
  selector: 'app-item-supplier-tax-master',
  templateUrl: './item-supplier-tax-master.component.html',
  styleUrls: ['./item-supplier-tax-master.component.scss']
})
export class ItemSupplierTaxMasterComponent implements OnInit {

  @ViewChild(DatatableComponent, { static: false }) public table: DatatableComponent;
  pageSize;
  page: {
    size: number, // The number of elements in the page
    totalElements: number, // The total number of elements
    totalPages: number, // The total number of pages
    pageNumber: number, // The current page number
  };
  searchString: string;
  externalPaging: boolean;
  sortingObject: { sort_order: string, sort_column: string };
  alertMsg: IAlert;
  subject: Subject<string> = new Subject();
  ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  compInstance = this;
  showFilter: boolean;
  isFilterApply: boolean;
  datatableBodyElement: any;
  editPermission: boolean;
  dataList = [];
  setAlertMessage: IAlert;
  showActive: boolean;
  isActiveFilter = true;
  supplierId: number;
  supplierDetails: any;
  showAddPopup = false;
  $destroy: Subject<boolean> = new Subject();
  constpermissionList: any = [];
  constructor(
    private route: ActivatedRoute,
    private mastersService: MastersService,
    private modalService: NgbModal,
    private commonService: CommonService
  ) { }

  ngOnInit(): void {
    this.getSupplierById(+this.route.snapshot.params.id);
    this.defaultObject();
    this.subjectFun();
    this.getListData(this.route.snapshot.params.id);
    this.showActivePopup(this.route.snapshot.params.id);
    this.commonService.routeChanged(this.route);
    this.constpermissionList = PermissionsConstants;
  }

  setSupplierObject(data): void {
    this.supplierDetails = {
      supplierId: data.id,
      supplierName: data.name,
      city: data.city,
      state: data.state,
      country: data.country,
      gstCode: data.gstCode,
    };
  }

  getSupplierById(supplierId) {
    this.mastersService.getSupplierById(supplierId).subscribe(res => {
      if (!_.isEmpty(res)) {
        const supp = new Supplier();
        supp.generateObject(res);
        this.setSupplierObject(supp);
      }
    });
  }

  defaultObject() {
    this.isFilterApply = false;
    this.page = { size: 15, totalElements: 0, totalPages: 10, pageNumber: 1 };
    this.sortingObject = { sort_order: 'desc', sort_column: 'supplierId' };
    this.searchString = '';
    this.externalPaging = true;
    this.showFilter = false;
    this.showActive = true;
  }

  subjectFun() {
    // -- Subscribe to the subject, which is triggered from search input and when section clicked
    // -- When the debounce time has passed, we call getActiveScheduleData()
    this.subject
      .pipe(debounceTime(500), takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
          this.page.pageNumber = 1;
          this.getListData();
        }
      );
  }

  notifyAlertMessage(data): void {
    this.setAlertMessage = {
      message: data.msg,
      messageType: data.class,
      duration: Constants.ALERT_DURATION
    };
  }

  getListData(supplierId?) {
    const params = {
      searchKeyword: this.searchString,
      sortOrder: this.sortingObject.sort_order,
      sortColumn: this.sortingObject.sort_column,
      pageNumber: this.page.pageNumber,
      limit: this.page.size,
      isActive: this.isActiveFilter,
      supplierId: (supplierId) ? supplierId : this.supplierDetails.supplierId
    };
    this.mastersService.GetItemSupplierTaxList(params).subscribe(res => {
      if (res.totalCount > 0) {
        this.dataList = res.data;
        this.page.totalElements = res.totalCount;
      } else {
        this.dataList = [];
        this.page.totalElements = 0;
      }
    });
  }

  onPageSizeChanged (newPageSize) {
    this.sortingObject = { sort_order: 'desc', sort_column: '' };
    this.page.size = Number(newPageSize);
    this.page.pageNumber = 1;
    this.getListData();
  }

  onFooterPage(event): void {
    this.page.pageNumber = event.page;
    this.getListData();
  }

  onSortChanged(event) {
    if (event.sorts.length > 0) {
      const obj = event.sorts[0];
      this.sortingObject.sort_order = obj.dir;
      this.sortingObject.sort_column = obj.prop;
      this.getListData();
    }
  }

  editData(val) {
    this.addUpdateItemSupplierTaxMaster(val);
  }

  onSetPage(pageInfo) {
    this.table.offset = pageInfo.offset - 1;
    if (this.externalPaging) {
      return;
    }
  }

  clearSearch() {
    if (this.searchString) {
      this.getListData();
    }
  }

  addUpdateItemSupplierTaxMaster(data?) {
    if (!this.supplierDetails) {
      this.notifyAlertMessage({
        msg: 'Please Select Supplier',
        class: 'danger',
      });
      return;
    }
    const modalInstance = this.modalService.open(AddEditItemSupplierTaxMasterComponent, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      windowClass: 'custom-modal',
      container: '#homeComponent'
    });
    modalInstance.componentInstance.supplierDetails = this.supplierDetails;
    modalInstance.componentInstance.inputItemSupplierTax = {
      type: data ? 'edit' : 'add',
      data: data ? data : null,
    };
    modalInstance.result.then((result) => {
      if (result) {
        this.notifyAlertMessage({
          msg: 'Details Saved Successfully',
          class: 'success',
        });
        this.getListData();
      }
    });
  }

  getSupplierList(searchKey?): Observable<any> {
    const params = {
      searchKeyword: searchKey ? searchKey : '',
      sortOrder: 'desc',
      sortColumn: 'supplierId',
      pageNumber: 1,
      limit: 50,
      isActive: true
    };
    const supplierList = [];
    return this.compInstance.mastersService.getSupplierList(params).pipe(map((res: any) => {
      _.forEach(res.data, (sup) => {
        const supplierObject = new Supplier();
        supplierObject.generateObject(sup);
        supplierList.push(supplierObject);
      });
      return supplierList;
    }));
  }

  selectSupplier($event) {
    if ($event === undefined || !$event) {
      this.supplierDetails = null;
      return;
    }
    this.setSupplierObject($event);
    this.getListData();
  }

  deleteData(rowData) {
    const modalTitleobj = 'Delete';
    const modalBodyobj = 'Do you want to delete this record?';
    const messageDetails = {
      modalTitle: modalTitleobj,
      modalBody: modalBodyobj
    };
    const modalInstance = this.modalService.open(ConfirmationPopupComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false
      });
    modalInstance.result.then((result) => {
      if (result === 'Ok') {
        this.deleteItemSupplierTaxById(rowData.Id);
      }
    });
    modalInstance.componentInstance.messageDetails = messageDetails;
  }

  deleteItemSupplierTaxById(itemSupplierTaxId) {
    const url = `/Supplier/DeleteItemSupplierTaxById?IstId=${itemSupplierTaxId}`;
    this.mastersService.delete(url).subscribe(res => {
      if (res) {
        this.notifyAlertMessage({
          msg: 'Tax Record Deleted',
          class: 'success',
        });
        this.getListData();
      } else {
        this.notifyAlertMessage({
          msg: 'Something Went Wrong',
          class: 'danger',
        });
      }
    });
  }

  showActivePopup(suppId) {
    this.commonService.$addPopupEvent.pipe(takeUntil(this.$destroy)).subscribe(popup => {
      if (popup && popup.redirectFromPage === `/inventory/masters/suppliers/itemSupplierTaxMaster/${suppId}`) {
        this.showAddPopup = popup.isShowAddPopup;
        this.addUpdateItemSupplierTaxMaster();
      } else {
        this.showAddPopup = false;
      }
      // if (popup) {
      //   this.showPatientListFilter = popup.isShowFilterPopup;
      // } else {
      //   this.showPatientListFilter = false;
      // }
    });
  }
}

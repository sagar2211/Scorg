import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DatatableComponent } from '@swimlane/ngx-datatable';
// import { ItemMasterService } from './../../../services/item-master.service';
import { Component, OnInit, ViewChild, OnDestroy, OnChanges } from '@angular/core';
import { ItemMasterAddUpdateComponent } from '../item-master-add-update/item-master-add-update.component';
import { CommonService } from 'src/app/public/services/common.service';
import { ActivatedRoute } from '@angular/router';
import { NgxPermissionsService } from 'ngx-permissions';
import { PermissionsConstants } from 'src/app/config/PermissionsConstants';
import { IAlert } from 'src/app/public/models/AlertMessage';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil, map } from 'rxjs/operators';
import * as _ from 'lodash';
import { Constants } from 'src/app/config/constants';
import { ConfirmationPopupComponent } from 'src/app/shared/confirmation-popup/confirmation-popup.component';
import { MastersService } from 'src/app/modules/masters/services/masters.service';

@Component({
  selector: 'app-item-master-list',
  templateUrl: './item-master-list.component.html',
  styleUrls: ['./item-master-list.component.scss']
})
export class ItemMasterListComponent implements OnInit, OnDestroy, OnChanges {
  @ViewChild(DatatableComponent, { static: false }) public table: DatatableComponent;
  pageSize;
  itemList = [];
  page: {
    size: number, // The number of elements in the page
    totalElements: number, // The total number of elements
    totalPages: number, // The total number of pages
    pageNumber: number, // The current page number
  };
  searchString: any;
  externalPaging: boolean;
  sortUserList: { sort_order: string, sort_column: string };
  alertMsg: IAlert;
  subject: Subject<string> = new Subject();
  ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  compInstance = this;
  isNgSelectTypeHeadDisabled = false;
  isFilterApply: boolean;
  datatableBodyElement: any;
  editPermission: boolean;
  PermissionConstantList: any = [];
  isActive: boolean;
  showAddPopup = false;
  $destroy: Subject<boolean> = new Subject();
  constructor(
    private commonService: CommonService,
    private route: ActivatedRoute,
    private mastersService: MastersService,
    private ngxPermissionsService: NgxPermissionsService,
    public modalService: NgbModal,
  ) { }

  ngOnInit(): void {
    this.PermissionConstantList = PermissionsConstants;
    this.defaultObject();
    this.pageSize = '15';
    this.subjectFun();
    this.getItemList();
    this.getCacheMasters();
    this.commonService.routeChanged(this.route);
    this.showActivePopup();
  }

  ngOnDestroy(): void {
    this.$destroy.next(true);
    this.$destroy.unsubscribe();
  }

  ngOnChanges() {
    this.getItemList();
  }

  defaultObject() {
    this.isFilterApply = false;
    this.page = { size: 15, totalElements: 0, totalPages: 10, pageNumber: 1 };
    this.sortUserList = { sort_order: 'desc', sort_column: 'itemId' };
    this.searchString = null;
    this.externalPaging = true;
    this.isActive = true;
  }

  subjectFun() {
    // -- Subscribe to the subject, which is triggered from search input and when section clicked
    // -- When the debounce time has passed, we call getActiveScheduleData()
    this.subject
      .pipe(debounceTime(500), takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.page.pageNumber = 1;
        this.getItemList();
      }
      );
  }

  getItemList(): void {
    const reqParams = {
      searchKeyword: this.searchString,
      sortOrder: this.sortUserList.sort_order,
      sortColumn: this.sortUserList.sort_column,
      pageNumber: this.page.pageNumber,
      limit: this.page.size,
      isActive: this.isActive
    };
    this.mastersService.getItemMasterList(reqParams).subscribe(res => {
      if (res.data.length > 0) {
        this.itemList = res.data;
        this.page.totalElements = res.totalCount ? res.totalCount : res.data.length;
      } else {
        this.itemList = [];
        this.page.totalElements = 0;
      }
    });
  }

  clearSearchString(): void {
    this.searchString = null;
    this.getItemList();
  }

  editItemMaster(row): void {
    this.mastersService.getItemMasterDataByID(row.id).subscribe(response => {
      if (response.status_code === 200 && response.status_message === 'Success') {
        this.openPopup(response.data);
      } else {

      }
    });
  }

  addItemMaster(): void {
    this.openPopup(null);
  }

  openPopup(supplier) {
    const supplierDetail = {
      supplierData: supplier,
      type: supplier ? 'edit' : 'add'
    };
    const modalInstance = this.modalService.open(ItemMasterAddUpdateComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false,
        size: 'xl',
        windowClass: 'visit-modal',
        container: '#homeComponent'
      });
    modalInstance.result.then((result) => {
      if (result === 'save') {
        this.alertMsg = {
          message: 'Value Saved Successfully',
          messageType: 'success',
          duration: Constants.ALERT_DURATION
        };
      } else {
        this.alertMsg = {
          message: 'Value Updated Successfully',
          messageType: 'success',
          duration: Constants.ALERT_DURATION
        };
      }
      this.getItemList();
    }, (dis) => {

    });
    modalInstance.componentInstance.supplierData = supplierDetail;
  }

  onPageSizeChanged(newPageSize): void {
    this.sortUserList = { sort_order: 'desc', sort_column: 'itemId' };
    this.page.size = Number(newPageSize);
    this.page.pageNumber = 1;
    this.getItemList();
  }

  onSortChanged(event): void {
    if (event.sorts.length > 0) {
      const obj = event.sorts[0];
      this.sortUserList.sort_order = obj.dir;
      this.sortUserList.sort_column = this.getSortColumnName(obj.prop);
      this.getItemList();
    }
  }

  getSortColumnName(clmName): string {
    if (clmName === 'mainGroup') {
      return 'priGroupDesc';
    } else if (clmName === 'code') {
      return 'itemCode';
    } else if (clmName === 'description') {
      return 'itemDescription';
    } else if (clmName === 'conversionFactor') {
      return 'conversionFactor';
    } else if (clmName === 'saleQty') {
      return 'saleQty';
    } else if (clmName === 'reorderLevel') {
      return 'reorderLevel';
    } else if (clmName === 'vatPurchaseRate') {
      return 'vatPurchaseRate';
    } else if (clmName === 'manufacturer') {
      return 'manufacturerName';
    } else if (clmName === 'subGroup') {
      return 'subGroupDesc';
    } else {
      return '';
    }
  }

  onSetPage(pageInfo) {
    this.table.offset = pageInfo.offset - 1;
    return;
  }

  deleteItem(row) {
    const modalTitleobj = 'Delete';
    const modalBodyobj = 'Do you want to delete this Item Master <span class="font-weight-500"> (' + row.code + ') </span>';
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
        this.mastersService.deleteItemMasterDataById(row.id).subscribe(response => {
          if (response.status_code === 200 && response.status_message === 'Success') {
            this.getItemList();
            this.alertMsg = {
              message: response.message,
              messageType: 'success',
              duration: Constants.ALERT_DURATION
            };
          } else {
            this.alertMsg = {
              message: response.message,
              messageType: 'warning',
              duration: Constants.ALERT_DURATION
            };
          }
        });
      }
    });
    modalInstance.componentInstance.messageDetails = messageDetails;
  }

  updateDataTable() {
    this.getItemList();
  }

  getCacheMasters() {
    const param = {
      searchKeyword: null
    };
    this.mastersService.getItemClassBySearchKeyword(param).subscribe();
    this.mastersService.getUnitMasterList().subscribe();
  }

  onFooterPage(event): void {
    this.page.pageNumber = event.page;
    this.getItemList();
  }

  showActivePopup() {
    this.commonService.$addPopupEvent.pipe(takeUntil(this.$destroy)).subscribe(popup => {
      if (popup && popup.redirectFromPage === '/inventory/masters/item/itemMaster') {
        this.showAddPopup = popup.isShowAddPopup;
        this.openPopup(null);
      } else {
        this.showAddPopup = false;
      }
    });
  }

}

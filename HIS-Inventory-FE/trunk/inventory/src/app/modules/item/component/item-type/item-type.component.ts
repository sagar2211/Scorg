import { Component, OnInit, ViewChild, OnChanges, OnDestroy } from '@angular/core';
import { IAlert } from 'src/app/public/models/AlertMessage';
import { Subject } from 'rxjs';
import { CommonService } from 'src/app/public/services/common.service';
import { ActivatedRoute } from '@angular/router';
import { NgxPermissionsService } from 'ngx-permissions';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PermissionsConstants } from 'src/app/config/PermissionsConstants';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { Constants } from 'src/app/config/constants';
import * as _ from 'lodash';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { ConfirmationPopupComponent } from 'src/app/shared/confirmation-popup/confirmation-popup.component';
import { AddUpdateItemTypeComponent } from '../add-update-item-type/add-update-item-type.component';
import { MastersService } from 'src/app/modules/masters/services/masters.service';

@Component({
  selector: 'app-item-type',
  templateUrl: './item-type.component.html',
  styleUrls: ['./item-type.component.scss']
})
export class ItemTypeComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild(DatatableComponent, { static: false }) public table: DatatableComponent;
  pageSize;
  itemTypeList = [];
  page: {
    size: number, // The number of elements in the page
    totalElements: number, // The total number of elements
    totalPages: number, // The total number of pages
    pageNumber: number, // The current page number
  };
  isActive: boolean;
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
  showAddPopup = false;
  $destroy: Subject<boolean> = new Subject();
  constpermissionList: any = [];

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
    this.gettemTypeMasterData();
    this.commonService.routeChanged(this.route);
    this.showActivePopup();
  }

  ngOnChanges() {
    this.gettemTypeMasterData();
  }

  ngOnDestroy(): void {
    this.$destroy.next(true);
    this.$destroy.unsubscribe();
  }

  defaultObject() {
    this.isFilterApply = false;
    this.page = { size: 15, totalElements: 0, totalPages: 10, pageNumber: 1 };
    this.sortUserList = { sort_order: 'desc', sort_column: 'itemTypeId' };
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
        this.gettemTypeMasterData();
      }
      );
  }

  gettemTypeMasterData() {
    const param = {
      limit: this.page.size,
      pageNumber: this.page.pageNumber,
      sortOrder: this.sortUserList.sort_order,
      sortColumn: this.sortUserList.sort_column,
      searchKeyword: this.searchString,
      isActive: this.isActive
    };
    this.mastersService.getItemTypeList(param).subscribe(res => {
      if (res.data.length > 0) {
        this.itemTypeList = res.data;
        this.page.totalElements = res.totalCount ? res.totalCount : res.data.length;
      } else {
        this.itemTypeList = [];
        this.page.totalElements = 0;
      }
    });
  }

  onPageSizeChanged(newPageSize) {
    this.sortUserList = { sort_order: 'desc', sort_column: 'itemTypeId' };
    this.page.size = Number(newPageSize);
    this.page.pageNumber = 1;
    this.gettemTypeMasterData();
  }

  onFooterPage(event): void {
    this.page.pageNumber = event.page;
    this.gettemTypeMasterData();
  }

  onSortChanged(event) {
    if (event.sorts.length > 0) {
      const obj = event.sorts[0];
      this.sortUserList.sort_order = obj.dir;
      this.sortUserList.sort_column = this.getSortColumnName(obj.prop);
      this.gettemTypeMasterData();
    }
  }

  getSortColumnName(clmName) {
    if (clmName === 'id') {
      return 'itemTypeId';
    } else if (clmName === 'desc') {
      return 'itemTypeDesc';
    } else if (clmName === 'isActive') {
      return 'isActive';
    } else {
      return '';
    }
  }

  onSetPage(pageInfo) {
    this.table.offset = pageInfo.offset - 1;
    if (this.externalPaging) {
      return;
    }
  }

  clearSearchString() {
    this.searchString = null;
    this.gettemTypeMasterData();
  }

  deleteMainGrpMaster(row) {
    const modalTitleobj = 'Delete';
    const modalBodyobj = 'Do you want to delete this Item Type <span class="font-weight-500"> (' + row.desc + ') </span>';
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
        this.mastersService.deleteItemTypeDataById(row.id).subscribe(response => {
          if (response.status_code === 200 && response.status_message === 'Success') {
            this.gettemTypeMasterData();
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

  editMainGrpMaster(row) {
    this.mastersService.getItemTypeDataByID(row.id).subscribe(response => {
      if (response.status_code === 200 && response.status_message === 'Success') {
        this.openPopup(response.data);
      } else {

      }
    });
  }

  addNewValue() {
    this.openPopup(null);
  }

  openPopup(supplier) {
    const supplierDetail = {
      supplierData: supplier,
      type: supplier ? 'edit' : 'add'
    };
    const modalInstance = this.modalService.open(AddUpdateItemTypeComponent,
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
      }
      this.gettemTypeMasterData();
    }, (dis) => {

    });
    modalInstance.componentInstance.supplierData = supplierDetail;
  }

  updateDataTable() {
    this.gettemTypeMasterData();
  }

  showActivePopup() {
    this.commonService.$addPopupEvent.pipe(takeUntil(this.$destroy)).subscribe(popup => {
      if (popup && popup.redirectFromPage === '/inventory/masters/item/itemType') {
        this.showAddPopup = popup.isShowAddPopup;
        this.openPopup(null);
      } else {
        this.showAddPopup = false;
      }
    });
  }

}

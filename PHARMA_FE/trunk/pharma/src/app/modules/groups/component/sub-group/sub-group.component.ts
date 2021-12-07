import { Component, OnInit, ViewChild, OnChanges, OnDestroy } from '@angular/core';
import { DatatableComponent } from '@swimlane/ngx-datatable';
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
import { ConfirmationPopupComponent } from 'src/app/shared/confirmation-popup/confirmation-popup.component';
import { AddUpdateSubGroupComponent } from '../add-update-sub-group/add-update-sub-group.component';
import { MastersService } from 'src/app/modules/masters/services/masters.service';

@Component({
  selector: 'app-sub-group',
  templateUrl: './sub-group.component.html',
  styleUrls: ['./sub-group.component.scss']
})
export class SubGroupComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild(DatatableComponent, { static: false }) public table: DatatableComponent;
  pageSize;
  subGrpList = [];
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
    this.getAllSubGroupMasterData();
    this.commonService.routeChanged(this.route);
    this.showActivePopup();
  }

  ngOnDestroy(): void {
    this.$destroy.next(true);
    this.$destroy.unsubscribe();
  }

  ngOnChanges() {
    this.getAllSubGroupMasterData();
  }

  defaultObject() {
    this.isFilterApply = false;
    this.page = { size: 15, totalElements: 0, totalPages: 10, pageNumber: 1 };
    this.sortUserList = { sort_order: 'desc', sort_column: 'subGroupId' };
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
        this.getAllSubGroupMasterData();
      }
      );
  }

  getAllSubGroupMasterData() {
    const param = {
      limit: this.page.size,
      pageNumber: this.page.pageNumber,
      sortOrder: this.sortUserList.sort_order,
      sortColumn: this.sortUserList.sort_column,
      searchKeyword: this.searchString,
      isActive: this.isActive
    };
    this.mastersService.getSubGroupMasterList(param).subscribe(res => {
      if (res.data.length > 0) {
        this.subGrpList = res.data;
        this.page.totalElements = res.totalCount ? res.totalCount : res.data.length;
      } else {
        this.subGrpList = [];
        this.page.totalElements = 0;
      }
    });
  }

  onPageSizeChanged(newPageSize) {
    this.sortUserList = { sort_order: 'desc', sort_column: 'subGroupId' };
    this.page.size = Number(newPageSize);
    this.page.pageNumber = 1;
    this.getAllSubGroupMasterData();
  }

  onFooterPage(event): void {
    this.page.pageNumber = event.page;
    this.getAllSubGroupMasterData();
  }

  onSortChanged(event) {
    if (event.sorts.length > 0) {
      const obj = event.sorts[0];
      this.sortUserList.sort_order = obj.dir;
      this.sortUserList.sort_column = this.getSortColumnName(obj.prop);
      this.getAllSubGroupMasterData();
    }
  }

  getSortColumnName(clmName) {
    if (clmName === 'id') {
      return 'subGroupId';
    } else if (clmName === 'name') {
      return 'subGroupDesc';
    } else if (clmName === 'mainGroup') {
      return 'groupName';
    } else if (clmName === 'aliasName') {
      return 'aliasName';
    } else if (clmName === 'assetCode') {
      return 'assetCode';
    } else if (clmName === 'depreciationPercent') {
      return 'depreciationPercent';
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
    this.getAllSubGroupMasterData();
  }

  deleteSubGrpMaster(row) {
    const modalTitleobj = 'Delete';
    const modalBodyobj = 'Do you want to delete this Sub Group <span class="font-weight-500"> (' + row.name + ') </span>';
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
        this.mastersService.deleteSubGroupDataById(row.id).subscribe(response => {
          if (response.status_code === 200 && response.status_message === 'Success') {
            this.getAllSubGroupMasterData();
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

  editSubGrpMaster(row) {
    this.mastersService.getSubGroupDataByID(row.id).subscribe(response => {
      if (response.status_code === 200 && response.status_message === 'Success') {
        this.openPopup(response.data);
      } else {

      }
    });
  }

  addNewSupplier() {
    this.openPopup(null);
  }

  openPopup(supplier) {
    const supplierDetail = {
      supplierData: supplier,
      type: supplier ? 'edit' : 'add'
    };
    const modalInstance = this.modalService.open(AddUpdateSubGroupComponent,
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
      this.getAllSubGroupMasterData();
    }, (dis) => {

    });
    modalInstance.componentInstance.supplierData = supplierDetail;
  }

  updateDataTable() {
    this.getAllSubGroupMasterData();
  }

  showActivePopup() {
    this.commonService.$addPopupEvent.pipe(takeUntil(this.$destroy)).subscribe(popup => {
      if (popup && popup.redirectFromPage === '/inventory/masters/groups/subGroup') {
        this.showAddPopup = popup.isShowAddPopup;
        this.openPopup(null);
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

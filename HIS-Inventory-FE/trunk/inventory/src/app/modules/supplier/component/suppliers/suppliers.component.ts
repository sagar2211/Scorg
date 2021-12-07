import { Component, OnInit, ViewChild, OnChanges, OnDestroy } from '@angular/core';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { IAlert } from 'src/app/public/models/AlertMessage';
import { Subject, Observable } from 'rxjs';
import { CommonService } from 'src/app/public/services/common.service';
import { NgxPermissionsService } from 'ngx-permissions';
import { ActivatedRoute, Router } from '@angular/router';
import { PermissionsConstants } from 'src/app/config/PermissionsConstants';
import { debounceTime, takeUntil, map } from 'rxjs/operators';
import * as _ from 'lodash';
import { Constants } from 'src/app/config/constants';
import { AddEditSupplierComponent } from '../add-edit-supplier/add-edit-supplier.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationPopupComponent } from 'src/app/shared/confirmation-popup/confirmation-popup.component';
import { GstCode } from 'src/app/modules/masters/modals/gstcode';
import { MastersService } from 'src/app/modules/masters/services/masters.service';

@Component({
  selector: 'app-suppliers',
  templateUrl: './suppliers.component.html',
  styleUrls: ['./suppliers.component.scss']
})
export class SuppliersComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild(DatatableComponent, { static: false }) public table: DatatableComponent;
  pageSize;
  supplierList = [];
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
  gstCodeList: GstCode[] = [];
  loadTable: boolean;
  showAddPopup = false;
  $destroy: Subject<boolean> = new Subject();
  constructor(
    private commonService: CommonService,
    private route: ActivatedRoute,
    private mastersService: MastersService,
    private ngxPermissionsService: NgxPermissionsService,
    public modalService: NgbModal,
    public router: Router
  ) { }

  ngOnInit(): void {
    this.loadTable = false;
    this.getGstCodeList().subscribe(res => {
      this.PermissionConstantList = PermissionsConstants;
      this.defaultObject();
      this.pageSize = '15';
      this.subjectFun();
      this.getAllSupplierMasterData();
      this.commonService.routeChanged(this.route);
    });
    this.showActivePopup();
  }

  ngOnDestroy(): void {
    this.$destroy.next(true);
    this.$destroy.unsubscribe();
  }

  ngOnChanges() {
    // this.getAllSupplierMasterData();
  }

  defaultObject() {
    this.isFilterApply = false;
    this.page = { size: 15, totalElements: 0, totalPages: 10, pageNumber: 1 };
    this.sortUserList = { sort_order: 'desc', sort_column: 'supplierId' };
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
        this.getAllSupplierMasterData();
      }
      );
  }

  getAllSupplierMasterData() {
    const param = {
      limit: this.page.size,
      pageNumber: this.page.pageNumber,
      sortOrder: this.sortUserList.sort_order,
      sortColumn: this.sortUserList.sort_column,
      searchKeyword: this.searchString,
      isActive: this.isActive
    };
    this.mastersService.getSupplierList(param).subscribe(res => {
      if (res.data.length > 0) {
        _.map(res.data, dt => {
          const gst = dt.gstCode ? _.find(this.gstCodeList, v => v.gstCode === dt.gstCode) : null;
          dt.gstCode = gst ? gst.description : null;
        });
        this.supplierList = res.data;
        this.page.totalElements = res.totalCount;
      } else {
        this.supplierList = [];
        this.page.totalElements = 0;
      }
      this.loadTable = true;
    });
  }

  onPageSizeChanged(newPageSize) {
    this.sortUserList = { sort_order: 'desc', sort_column: 'supplierId' };
    this.page.size = Number(newPageSize);
    this.page.pageNumber = 1;
    this.getAllSupplierMasterData();
  }

  onFooterPage(event): void {
    this.page.pageNumber = event.page;
    this.getAllSupplierMasterData();
  }

  onSortChanged(event) {
    if (event.sorts.length > 0) {
      const obj = event.sorts[0];
      this.sortUserList.sort_order = obj.dir;
      this.sortUserList.sort_column = this.getSortColumnName(obj.prop);
      this.getAllSupplierMasterData();
    }
  }

  getSortColumnName(clmName) {
    if (clmName === 'id') {
      return 'supplierId';
    } else if (clmName === 'name') {
      return 'supplierName';
    } else if (clmName === 'address') {
      return 'address';
    } else if (clmName === 'gstCode') {
      return 'gstCode';
    } else if (clmName === 'registrationNo') {
      return 'registrationNo';
    } else if (clmName === 'isActive') {
      return 'isActive';
    } else {
      return clmName;
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
    this.getAllSupplierMasterData();
  }

  deleteSupplierMaster(row) {
    const modalTitleobj = 'Delete';
    const modalBodyobj = 'Do you want to delete this Supplier <span class="font-weight-500"> (' + row.name + ') </span>';
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
        this.mastersService.deleteSupplierById(row.id).subscribe(response => {
          if (response.status_code === 200 && response.status_message === 'Success') {
            this.getAllSupplierMasterData();
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

  editSupplierMaster(row) {
    this.mastersService.getSupplierDataByID(row.id).subscribe(response => {
      if (response.status_code === 200 && response.status_message === 'Success') {
        this.openSupplierPopup(response.data);
      } else {
        // console.log(response);
      }
    });
  }

  addNewSupplier() {
    this.openSupplierPopup(null);
  }

  openSupplierPopup(supplier) {
    const supplierDetail = {
      supplierData: supplier,
      type: supplier ? 'edit' : 'add'
    };
    const modalInstance = this.modalService.open(AddEditSupplierComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false,
        size: 'xl',
        windowClass: 'visit-modal',
        container: '#homeComponent'
      });
    modalInstance.result.then((result) => {
      if (result.status === 'save') {
        this.alertMsg = {
          message: result.data.message,
          messageType: 'success',
          duration: Constants.ALERT_DURATION
        };
      }
      this.getAllSupplierMasterData();
    }, (dis) => {

    });
    modalInstance.componentInstance.supplierData = supplierDetail;
  }

  updateDataTable() {
    this.getAllSupplierMasterData();
  }

  getGstCodeList(): Observable<any> {
    return this.mastersService.getGSTCodeList().pipe(map(res => {
      this.gstCodeList = res;
      return this.gstCodeList;
    }));
  }

  redirectToSupplierTaxMapping(supplier): void {
    this.router.navigate([`/inventory/masters/suppliers/itemSupplierTaxMaster/${supplier.id}`]);
  }

  showActivePopup() {
    this.commonService.$addPopupEvent.pipe(takeUntil(this.$destroy)).subscribe(popup => {
      if (popup && popup.redirectFromPage === '/inventory/masters/suppliers/list') {
        this.showAddPopup = popup.isShowAddPopup;
        this.openSupplierPopup(null);
      } else {
        this.showAddPopup = false;
      }
    });
  }

}

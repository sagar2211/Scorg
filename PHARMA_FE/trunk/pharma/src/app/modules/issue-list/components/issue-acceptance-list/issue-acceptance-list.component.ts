import {Component, OnInit, ViewChild, OnDestroy} from '@angular/core';
import {DatatableComponent} from "@swimlane/ngx-datatable";
import {IAlert} from "../../../../public/models/AlertMessage";
import {Subject} from "rxjs";
import {MastersService} from "../../../masters/services/masters.service";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {CommonService} from "../../../../public/services/common.service";
import {ActivatedRoute, Router} from "@angular/router";
import {debounceTime, takeUntil} from "rxjs/operators";
import {Constants} from "../../../../config/constants";
import { IssueService } from '../../../issue/services/issue.service';
import {FormGroup} from "@angular/forms";
import {AuthService} from "../../../../public/services/auth.service";
import * as moment from "moment";
import {PermissionsConstants} from "../../../../config/PermissionsConstants";

@Component({
  selector: 'app-issue-acceptance-list',
  templateUrl: './issue-acceptance-list.component.html',
  styleUrls: ['./issue-acceptance-list.component.scss']
})
export class IssueAcceptanceListComponent implements OnInit, OnDestroy {
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
  showAddPopup = false;
  $destroy: Subject<boolean> = new Subject();
  purchaseFilterForm: FormGroup;
  startDate = new Date();
  endDate = new Date();
  status = 'All';
  statusValues = ['All', 'Accepted', 'Partially Accepted', 'Open'];
  loggedInUserInfo: any;
  constpermissionList: any = [];
  constructor(
    private mastersService: MastersService,
    private modalService: NgbModal,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private issueService: IssueService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.loggedInUserInfo = this.authService.getUserInfoFromLocalStorage();
    this.defaultObject();
    this.setDefaultFilterValues();
    this.subjectFun();
    this.getListData();
    this.showActivePopup();
    this.commonService.routeChanged(this.route);
    this.constpermissionList = PermissionsConstants;
  }

  ngOnDestroy(): void {
    this.$destroy.next(true);
    this.$destroy.unsubscribe();
  }

  defaultObject() {
    this.isFilterApply = false;
    this.page = { size: 15, totalElements: 0, totalPages: 10, pageNumber: 1 };
    this.sortingObject = { sort_order: 'desc', sort_column: 'consumptionNo' };
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

  getListData() {
    const params = {
      searchKeyword: this.searchString,
      sortOrder: this.sortingObject.sort_order,
      sortColumn: this.sortingObject.sort_column,
      indentStoreId: this.loggedInUserInfo.storeId,
      indentDeptId: this.loggedInUserInfo.dept_id,
      fromDate: moment(this.startDate).format('YYYY-MM-DD'),
      toDate: moment(this.endDate).format('YYYY-MM-DD'),
      pageNumber: this.page.pageNumber,
      status: this.status,
      limit: this.page.size,
    };
    this.issueService.getIssueAcceptanceList(params).subscribe(res => {
      if (res.totalCount > 0) {
        this.dataList = res.data;
        this.page.totalElements = res.totalCount;
      } else {
        this.dataList = [];
        this.page.totalElements = 0;
      }
    });
  }

  onPageSizeChanged(newPageSize) {
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

  // deleteData(rowData) {
  //   const modalTitleobj = 'Delete';
  //   const modalBodyobj = 'Do you want to delete Manufacturer <span class="font-weight-500">' + rowData.name + '</span>';
  //   const messageDetails = {
  //     modalTitle: modalTitleobj,
  //     modalBody: modalBodyobj
  //   };
  //   const modalInstance = this.modalService.open(ConfirmationPopupComponent,
  //     {
  //       ariaLabelledBy: 'modal-basic-title',
  //       backdrop: 'static',
  //       keyboard: false
  //     });
  //   modalInstance.result.then((result) => {
  //     if (result === 'Ok') {
  //       this.deleteManufacturerById(rowData.id);
  //     }
  //   });
  //   modalInstance.componentInstance.messageDetails = messageDetails;
  // }

  onSetPage(pageInfo): void{
    this.table.offset = pageInfo.offset - 1;
    if (this.externalPaging) {
      return;
    }
  }

  redirectToAcceptPage(row): void {
    this.router.navigate([`/inventory/issue/acceptIssue/${row.issueId}`]);
  }

  redirectToAcceptIssuePage(row): void {
    this.router.navigate([`/inventory/issue/acceptIssue/${row.issueId}`]);
  }

  clearSearch(): void {
    if (this.searchString) {
      this.getListData();
    }
  }

  // addUpdateManufacturer(data?) {
  //   const modalInstance = this.modalService.open(AddEditManufacturerComponent, {
  //     ariaLabelledBy: 'modal-basic-title',
  //     backdrop: 'static',
  //     keyboard: false,
  //     windowClass: 'custom-modal',
  //     container: '#homeComponent'
  //   });
  //   modalInstance.componentInstance.manufacturerData = {
  //     type: data ? 'edit' : 'add',
  //     data: data ? data : null,
  //   };
  //   modalInstance.result.then((result) => {
  //     if (result) {
  //       this.notifyAlertMessage({
  //         msg: 'Details Saved Successfully',
  //         class: 'success',
  //       });
  //       this.getListData();
  //     }
  //   });
  // }

  // deleteManufacturerById(manId) {
  //   const url = `/Master/DeleteManufacturerMasterById?manufacturerId=${manId}`;
  //   this.mastersService.delete(url).subscribe(res => {
  //     if (res) {
  //       this.notifyAlertMessage({
  //         msg: 'Manufacture Record Deleted',
  //         class: 'success',
  //       });
  //       this.getListData();
  //     } else {
  //       this.notifyAlertMessage({
  //         msg: 'Something Went Wrong',
  //         class: 'danger',
  //       });
  //     }
  //   });
  // }

  showActivePopup() {
    this.commonService.$addPopupEvent.pipe(takeUntil(this.$destroy)).subscribe(popup => {
      if (popup && popup.redirectFromPage === '/inventory/issue/issueAcceptanceList') {
        this.showAddPopup = popup.isShowAddPopup;
        // this.addUpdateManufacturer();
      } else {
        this.showAddPopup = false;
      }
      if (popup) {
        this.showFilter = true;
      } else {
        this.showFilter = false;
      }
    });
  }

  setDefaultFilterValues() {
    this.startDate = new Date(moment().startOf('month').format('YYYY-MM-DD hh:mm'));
    this.endDate = new Date(moment().format('YYYY-MM-DD hh:mm'));
  }

  activeInactiveFilter() {
    this.showFilter = !this.showFilter;
  }

}

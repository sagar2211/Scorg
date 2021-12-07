import {Component, OnInit, ViewChild, Input} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {DatatableComponent} from "@swimlane/ngx-datatable";
import {IAlert} from "src/app/public/models/AlertMessage";
import {Subject} from "rxjs";
import {debounceTime, takeUntil} from "rxjs/operators";
import {TransactionsService} from "src/app/modules/transactions/services/transactions.service";
import {Constants} from "src/app/config/constants";

@Component({
  selector: 'app-audit-logs',
  templateUrl: './audit-logs.component.html',
  styleUrls: ['./audit-logs.component.scss']
})
export class AuditLogsComponent implements OnInit {
  @ViewChild(DatatableComponent, { static: false }) public table: DatatableComponent;
  @Input() inputData: {stageId: any, referenceId: any};
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
  subject: Subject<string> = new Subject();
  ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  compInstance = this;
  showFilter: boolean;
  isFilterApply: boolean;
  dataList = [];
  setAlertMessage: IAlert;
  showActive: boolean;
  isActiveFilter = true;
  $destroy: Subject<boolean> = new Subject();
  constpermissionList: any = [];
  logTypes: any[] = [];
  selectedLogType: any;
  constructor(
    public modal: NgbActiveModal,
    public transactionService: TransactionsService
  ) { }

  ngOnInit(): void {
    this.defaultObject();
    this.subjectFun();
    this.logTypes = Constants.logTypes;
    this.selectedLogType = this.logTypes[0];
    this.getListData();
  }

  defaultObject(): void{
    this.isFilterApply = false;
    this.page = { size: 15, totalElements: 0, totalPages: 10, pageNumber: 1 };
    this.sortingObject = { sort_order: 'desc', sort_column: 'taxId' };
    this.searchString = '';
    this.externalPaging = true;
    this.showFilter = false;
    this.showActive = true;
  }

  subjectFun(): void{
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

  getListData(): void{
    const params = {
      searchKeyword: this.searchString,
      // sortOrder: this.sortingObject.sort_order,
      // sortColumn: this.sortingObject.sort_column,
      pageNumber: this.page.pageNumber,
      limit: this.page.size,
      logTypeId: this.selectedLogType.Id,
      stageId: this.inputData.stageId,
      referenceId: this.inputData.referenceId,
      userId: '0',
    };
    this.transactionService.GetAuditLog(params).subscribe(res => {
      if (res.totalCount > 0) {
        this.dataList = res.data;
        this.page.totalElements = res.totalCount;
      } else {
        this.dataList = [];
        this.page.totalElements = 0;
      }
    });
  }

  onPageSizeChanged(newPageSize): void{
    this.sortingObject = { sort_order: 'desc', sort_column: '' };
    this.page.size = Number(newPageSize);
    this.page.pageNumber = 1;
    this.getListData();
  }

  onFooterPage(event): void {
    this.page.pageNumber = event.page;
    this.getListData();
  }

  onSortChanged(event): void{
    if (event.sorts.length > 0) {
      const obj = event.sorts[0];
      this.sortingObject.sort_order = obj.dir;
      this.sortingObject.sort_column = obj.prop;
      this.getListData();
    }
  }

  onSetPage(pageInfo): void{
    this.table.offset = pageInfo.offset - 1;
    if (this.externalPaging) {
      return;
    }
  }

  clearSearch(): void{
    if (this.searchString) {
      this.getListData();
    }
  }

  closePopup(): void {
    this.modal.close(false);
  }

}

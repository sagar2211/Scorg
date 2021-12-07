import { Component, OnInit, ViewChild, OnChanges, OnDestroy } from '@angular/core';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { IAlert } from 'src/app/public/models/AlertMessage';
import { Subject } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { debounceTime, takeUntil, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { StockService } from 'src/app/modules/masters/services/stock.service';
import { MastersService } from 'src/app/modules/masters/services/masters.service';
import { Constants } from 'src/app/config/constants';
import { NgSelectModule, NgOption } from '@ng-select/ng-select';
import { AuthService } from "../../../public/services/auth.service";
import { ConfirmationPopupComponent } from 'src/app/shared/confirmation-popup/confirmation-popup.component';

@Component({
  selector: 'app-stock',
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.scss']
})
export class StockComponent implements OnInit {
  
  @ViewChild(DatatableComponent, { static: false }) public table: DatatableComponent;
  
  pageSize;
  page: {
    size: number, // The number of elements in the page
    totalElements: number, // The total number of elements
    totalPages: number, // The total number of pages
    pageNumber: number, // The current page number
  };
  searchString: any;
  isItemValModify = false;
  selectedStore:any;
  externalPaging: boolean;
  constantsVal = Constants;
  sortUserList: { sort_order: string, sort_column: string, storeName : string };
  alertMsg: IAlert;
  subject: Subject<string> = new Subject();
  ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  isFilterApply: boolean;
  isActive: boolean;
  loadTable: boolean;
  $destroy: Subject<boolean> = new Subject();
  storeType: string;
  stockList = [];
  storeList: any[];
  submitted = false;
  qtyArray = [];
  selectedStoreId = 0;
  constructor(
    private stockService: StockService,
    public router: Router,
    private mastersService : MastersService,
    private authService : AuthService,
    private modalService : NgbModal
  ) { }

  ngOnInit(): void {
    this.loadTable = false;
    this.defaultObject();
    this.subjectFun();
    this.pageSize = '15';
    this.getAllStockData();
    this.getAllStoreData();
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
    this.sortUserList = { sort_order: 'desc', sort_column: 'itemId', storeName : '' };
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
        this.getAllStockData();
      }
      );
  }

  getAllStoreData() {
    let userId = this.authService.getLoggedInUserId();
    const param = {
      userId : userId,
      searchKeyword: "",
      sortOrder: "asc",
      sortColumn: "storeName",
      pageNumber: 1,
      limit: 50,
      isActive: true,
    };
    this.mastersService.getStoreMasterList(param).subscribe(res => {
      if (res.data.length > 0) {
        this.storeList = res.data;
      } else {
        this.storeList = [];
      }
      this.loadTable = true;
    });
  }

  getAllStockData() {
    const param = {
      storeId: this.selectedStoreId,
      limit: this.page.size,
      pageNumber: this.page.pageNumber,
      sortOrder: this.sortUserList.sort_order,
      sortColumn: this.sortUserList.sort_column,
      searchKeyword: this.searchString,
      isActive: this.isActive
    };

    this.stockService.getStockList(param).subscribe(res => {
      if (res.data.length > 0) {
        this.stockList = res.data;
        this.page.totalElements = res.totalCount;
      } else {
        this.stockList = [];
        this.page.totalElements = 0;
      }
      this.loadTable = true;
    });
  }

  onPageSizeChanged(newPageSize) {
    this.sortUserList = { sort_order: 'desc', sort_column: 'itemId', storeName : '' };
    this.page.size = Number(newPageSize);
    this.page.pageNumber = 1;
    this.getAllStockData();
  }

  onFooterPage(event): void {
    this.page.pageNumber = event.page;
    this.getAllStockData();
  }

  onSortChanged(event) {
    if (event.sorts.length > 0) {
      const obj = event.sorts[0];
      this.sortUserList.sort_order = obj.dir;
      this.sortUserList.sort_column = this.getSortColumnName(obj.prop);
      this.getAllStockData();
    }
  }

  getSortColumnName(clmName) {
    if (clmName === 'itemId') {
      return 'itemId';
    } else if (clmName === 'itemCode') {
      return 'itemCode';
    } else if (clmName === 'itemName') {
      return 'itemName';
    } else if (clmName === 'reorderLevelQty') {
      return 'reorderLevelQty';
    } else if (clmName === 'balanceQty') {
      return 'balanceQty';
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
    this.getAllStockData();
  }

  updateDataTable() {
    this.getAllStockData();
  }

  changeStoreType(){
    console.log(this.selectedStore)
    this.selectedStoreId = this.selectedStore.id;
    this.getAllStockData();
  }

  updateQty(data,index){
    this.isItemValModify = true;
    var arrLength = this.qtyArray.length;
    let obj = {}
    obj = {
      "itemId" : data.itemId,
      "reorderLevelQty" : data.reorderLevelQty,
      "itemCode" : data.itemCode
    }

    if(arrLength > 0){
      this.qtyArray.filter((item,index) => {
        if(item.itemId === data.itemId){
          this.qtyArray[index]["reorderLevelQty"] = data.reorderLevelQty;
        }
        if(arrLength == index+1 && item.itemId !== data.itemId)
        this.qtyArray.push(obj);
      });
    } else {
      this.qtyArray.push(obj);
    }
  }

  saveUpdateQuantity() {
      this.stockService.saveItemReorderLevel(this.qtyArray).subscribe(res => {
        if (res) {
          this.isItemValModify = false;
          this.alertMsg = {
            message: 'Value Updated Successfully',
            messageType: 'success',
            duration: Constants.ALERT_DURATION
          };
          this.getAllStockData();
        }
      });
  }

  openConfirmPopup(msg) {
    const modalTitleobj = 'Confirm';
    const modalBodyobj = msg;
    const messageDetails = {
      modalTitle: modalTitleobj,
      modalBody: modalBodyobj,
      buttonType: 'yes_no'
    };
    const modalInstance = this.modalService.open(ConfirmationPopupComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false
      });
    modalInstance.result.then((result) => {
      if (result === 'yes') {
        this.saveUpdateQuantity();
      } else {
        this.isItemValModify = false;
        this.getAllStockData();
      }
    });
    modalInstance.componentInstance.messageDetails = messageDetails;
  }

  submitQty(){
    if(this.isItemValModify){
      const msg = 'Do you want to save Reorder quantity?';
      this.openConfirmPopup(msg);
    }
  }
}


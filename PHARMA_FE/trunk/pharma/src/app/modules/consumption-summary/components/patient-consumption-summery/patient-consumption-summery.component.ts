import { Component, OnInit, ViewChild } from '@angular/core';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { IAlert } from 'src/app/public/models/AlertMessage';
import {Subject, Observable, concat, of} from 'rxjs';
import { IssueService } from 'src/app/modules/issue/services/issue.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from 'src/app/public/services/common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/public/services/auth.service';
import { PermissionsConstants } from 'src/app/config/PermissionsConstants';
import { catchError, debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs/operators';
import { Constants } from 'src/app/config/constants';
import { environment } from 'src/environments/environment';
import { AuditLogsComponent } from 'src/app/shared/audit-logs/audit-logs.component';
import * as moment from 'moment';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MastersService } from 'src/app/modules/masters/services/masters.service';

@Component({
  selector: 'app-patient-consumption-summery',
  templateUrl: './patient-consumption-summery.component.html',
  styleUrls: ['./patient-consumption-summery.component.scss']
})
export class PatientConsumptionSummeryComponent implements OnInit {
  @ViewChild(DatatableComponent, { static: false }) public table: DatatableComponent;
  patientListFilterForm: FormGroup;
  itemList$ = new Observable<any>();
  itemListInput$ = new Subject<any>();
  pageSize;
  page: {
    size: number, // The number of elements in the page
    totalElements: number, // The total number of elements
    totalPages: number, // The total number of pages
    pageNumber: number, // The current page number
  };
  searchString: string = null;
  externalPaging: boolean;
  sortingObject: { sort_order: string, sort_column: string };
  alertMsg: IAlert;
  subject: Subject<string> = new Subject();
  ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  userId: number;
  fromDate: Date = new Date(moment().format('YYYY-MM-01'));
  toDate: Date = new Date();
  storeId: number;
  patientIssueList = [];
  constpermissionList: any = [];
  printData = null;
  showPatientListFilter = false;

  searchCategory = [
    {
      id : 1,
      name : 'Voucher Number'
    },
    {
      id : 2,
      name : 'Patient Id'
    },
    {
      id : 3,
      name : 'Patient Name'
    },
    {
      id : 4,
      name : 'Mobile Number'
    }
  ]
  saleType = [
    {
      id : 1,
      name : 'Hospital Sale'
    },
    {
      id : 2,
      name : 'Counter Sale'
    }
  ]

  hospSalePatientType = [
    {
      id : 1,
      name : 'OP'
    },
    {
      id : 2,
      name : 'IP'
    },
    {
      id : 3,
      name : 'Indent'
    },
    {
      id : 4,
      name : 'All'
    }
  ]

  counterSalePatientType = [
    {
      id : 1,
      name : 'Patient'
    },
    {
      id : 2,
      name : 'Debtor'
    },
    {
      id : 3,
      name : 'All'
    }
  ]

  voucherType = [
    {
      id : 1,
      name : 'Cash'
    },
    {
      id : 2,
      name : 'Credit'
    }
  ]
  patientType = [];
  searchKey = 'Voucher Number';

  constructor(
    private issueService: IssueService,
    private modalService: NgbModal,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private fb: FormBuilder,
    private masterService : MastersService
  ) {}

  onGridReady(params) {
    console.log(params);
  }

  cellEditingStopped(params) {
    console.log(params);
  }

  ngOnInit(): void {
    this.defaultObject();
    this.userId = this.authService.getLoggedInUserId();
    this.externalPaging = true;
    this.storeId = this.authService.getLoginStoreId();
    this.selectSale();
    this.createSearchForm();
    this.subjectFun();
    this.showActivePopup();
    this.getPatientIssueList();
    this.loadItemList();
    this.commonService.routeChanged(this.route);
    this.constpermissionList = PermissionsConstants;
  }

  defaultObject() {
    this.page = { size: 15, totalElements: 0, totalPages: 10, pageNumber: 1 };
    this.sortingObject = { sort_order: 'desc', sort_column: 'consumptionNo' };
  }

  createSearchForm() {
    const formObj = {
      fromDate: [this.fromDate],
      toDate: [this.toDate],
      saleType: [null],
      patientType: [null],
      voucherType: [null],
      itemName:[null],
      pageNumber: [1],
      limit: [10],
      searchKeyword : this.searchString,
      searchKey : this.searchKey,
      sortOrder: ['asc'],
      sortColumn: ['patientName'],
      isActive : [true],
      storeId: this.storeId
    };
    this.patientListFilterForm = this.fb.group(formObj);
  }

  subjectFun(): void {
    this.subject.pipe(debounceTime(500), takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.page.pageNumber = 1;
      this.getPatientIssueList();
    });
  }

  notifyAlertMessage(data): void {
    this.alertMsg = {
      message: data.msg,
      messageType: data.class,
      duration: Constants.ALERT_DURATION
    };
  }

  private loadItemList(searchTxt?): void {
    this.itemList$ = concat(
      this.masterService.getItemBySearchKeyword(searchTxt ? searchTxt : ''), // default items
      this.itemListInput$.pipe(
        distinctUntilChanged(),
        debounceTime(500),
        switchMap(term => this.masterService.getItemBySearchKeyword(term ? term : (searchTxt ? searchTxt : '')).pipe(
          catchError(() => of([]))
        ))
      )
    );
  }

  getPatientIssueList(): void {
    const params = {
      fromDate: moment(this.fromDate).format('YYYY-MM-DD'),
      toDate: moment(this.toDate).format('YYYY-MM-DD'),
      saleType: this.patientListFilterForm.value.saleType ? this.patientListFilterForm.value.saleType.name.replace(/ /g, "") : null,
      patientType: this.patientListFilterForm.value.patientType ? this.patientListFilterForm.value.patientType.name : null,
      voucherType: this.patientListFilterForm.value.voucherType ? this.patientListFilterForm.value.voucherType.name : null,
      itemId: this.patientListFilterForm.value.itemId ? this.patientListFilterForm.value.itemId : 0,
      pageNumber: this.page.pageNumber,
      limit: this.page.size,
      searchKeyword : this.searchString,
      searchKey : this.searchKey,
      sortOrder: this.sortingObject.sort_order,
      sortColumn: this.sortingObject.sort_column,
      storeId: this.storeId,
      isActive : true
    };

    this.issueService.getPatientIssueList(params).subscribe(res => {
      if (res.status_message === 'Success') {
        this.patientIssueList = [...res.data];
        this.page.totalElements = res.total_records;
      } else {
        this.patientIssueList = [];
        this.page.totalElements = 0;
      }
    });
  }

  onPageSizeChanged(newPageSize): void {
    this.sortingObject = { sort_order: 'desc', sort_column: '' };
    this.page.size = Number(newPageSize);
    this.page.pageNumber = 1;
    this.getPatientIssueList();
  }

  onFooterPage(event): void {
    this.page.pageNumber = event.page;
    this.getPatientIssueList();
  }

  onSortChanged(event): void {
    if (event.sorts.length > 0) {
      const obj = event.sorts[0];
      this.sortingObject.sort_order = obj.dir;
      this.sortingObject.sort_column = this.getSortColumnName(obj.prop);
      this.getPatientIssueList();
    }
  }

  getSortColumnName(clmName): string {
    if (clmName === 'consumptionId') {
      return 'consumptionNo';
    } else {
      return clmName;
    }
  }

  onSetPage(pageInfo): any {
    this.table.offset = pageInfo.offset - 1;
    if (this.externalPaging) {
      return;
    }
  }

  clearSearch(): void {
    if (this.searchString) {
      this.searchString = null;
      this.getPatientIssueList();
    }
  }

  onEdit(row): void {
    this.router.navigate(['/inventory/issue/patient/allsale/', row.consumptionId]);
    // this.router.navigate(['/inventory/issue/sale/salereturn/', row.consumptionId]);
  }

  getPrintData(data) {
    const url = environment.REPORT_API + 'Report/PatientConsumptionPrint/?auth_token=' + this.authService.getAuthToken() + '&consumptionId=' + data.consumptionId;
    this.printData = { url: url, returnType: false };
  }

  showAuditLog(row): void {
    const modalInstance = this.modalService.open(AuditLogsComponent, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      size: 'xl',
      container: '#homeComponent'
    });
    modalInstance.componentInstance.inputData = {
      stageId: Constants.auditLogStageConstants.PatientStoreIssue,
      referenceId: row.consumptionId
    };
    modalInstance.result.then((result) => {
    });
  }

  showActivePopup() {
    this.commonService.$addPopupEvent.pipe(takeUntil(this.ngUnsubscribe)).subscribe(popup => {
      if (popup && popup.redirectFromPage === '/inventory/issue/patient/consumptionSummary') {
        this.router.navigate(['/inventory/issue/patient/consumption/-1']);
      }
    });
  }

  selectSale(evt?){
    if(evt){
      if(evt.id === 1) {
        this.patientType = this.hospSalePatientType;
      } else if(evt.id === 2) {
        this.patientType = this.counterSalePatientType;
      } else {
        this.patientType = [];
      }
    } else {
      this.patientType = [];
    }
    
  }

  selectPatientType(evt){

  }

  searchByFilter(){
    this.getPatientIssueList();
  }

  clearSearchFilter(){
    this.patientListFilterForm.reset();
    this.getPatientIssueList();
  }

  showSearchFilter() {
    this.showPatientListFilter = !this.showPatientListFilter;
    this.getPatientIssueList();
  }

  clearSearchString(): void {
    this.searchString = null;
    this.getPatientIssueList();
  }

  selectSearchKey(evt){
    this.patientListFilterForm.patchValue({
      searchKey : this.searchKey = evt.name
    })
  }

}

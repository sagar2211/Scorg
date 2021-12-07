import { Component, OnInit, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import * as _ from 'lodash';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { IAlert } from '@qms/qlist-lib/lib/models/common.model';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-refer-pateint-list',
  templateUrl: './refer-pateint-list.component.html',
  styleUrls: ['./refer-pateint-list.component.scss']
})
export class ReferPateintListComponent implements OnInit {
  @ViewChild(DatatableComponent, { static: false }) public table: DatatableComponent;
  isFilterApply: boolean;
  searchString: string;
  externalPaging: boolean;
  mappingUserData = [];
  page: {
    size: number, // The number of elements in the page
    totalElements: number, // The total number of elements
    totalPages: number, // The total number of pages
    pageNumber: number, // The current page number
  };
  subject: Subject<string> = new Subject();
  ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  sortUserList: { sort_order: string, sort_column: string };
  referPatientList = [];
  pageSize;
  datatableBodyElement: any;
  alertMsg: IAlert;
  PermissionsConstantsList: any = [];
  constructor(
    private route: ActivatedRoute,
    private commonService: CommonService

  ) { }

  ngOnInit() {
    this.pageSize = 15;
    this.defaultObject();
    this.subjectFun();
    this.commonService.routeChanged(this.route);
    this.getreferPatientList();
  }
  subjectFun() {
    // -- Subscribe to the subject, which is triggered from search input and when section clicked
    // -- When the debounce time has passed, we call getActiveScheduleData()
    this.subject
      .pipe(debounceTime(500), takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.page.pageNumber = 1;
        this.getreferPatientList();
      }
      );
  }

  defaultObject() {
    this.isFilterApply = false;
    this.page = { size: 15, totalElements: 0, totalPages: 10, pageNumber: 1 };
    this.searchString = '';
    this.externalPaging = true;
    this.sortUserList = { sort_order: 'desc', sort_column: 'REFER_DATE' };
  }
  clearSearchString() {
    this.searchString = '';
    this.getreferPatientList();
  }
  onPageSizeChanged(newPageSize) {
    this.sortUserList = { sort_order: 'desc', sort_column: 'REFER_DATE' };
    this.page.size = Number(newPageSize);
    this.page.pageNumber = 1;
    this.getreferPatientList();
  }
  onSortChanged(event) {
    if (event.sorts.length > 0) {
      const obj = event.sorts[0];
      this.sortUserList.sort_order = obj.dir;
      this.sortUserList.sort_column = obj.prop;
      this.getreferPatientList();
    }
  }
  onSetPage(pageInfo) {
    this.table.offset = pageInfo.offset - 1;
    if (this.externalPaging) {
      return;
    }
  }
  onFooterPage(event): void {
    this.page.pageNumber = event.page;
    this.getreferPatientList();
  }

  getreferPatientList() {
    const params = {
      search_keyword: this.searchString ? this.searchString : '',
      service_type_id: 0,
      patient_id: '',
      visit_no: '',
      refer_entity_type: 'ALL',
      refer_entity_value_id: 0,
      is_active: true,
      sort_column: _.toUpper(this.sortUserList.sort_column),
      sort_order: this.sortUserList.sort_order,
      page_number: this.page.pageNumber,
      limit: this.page.size
    };
    this.commonService.getReferPatientList(params).subscribe(res => {
      if (res.data.length) {
        this.referPatientList = res.data;
      } else {
        this.referPatientList = [];
      }
      this.page.totalElements = res.total_records;
      // return res;
    });
  }

}

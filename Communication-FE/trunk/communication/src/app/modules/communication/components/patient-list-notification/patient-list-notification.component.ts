import { Component, OnInit, OnChanges, Input, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { IAlert } from '@qms/qlist-lib/lib/models/common.model';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { PatientService } from 'src/app/public/services/patient.service';

@Component({
  selector: 'app-patient-list-notification',
  templateUrl: './patient-list-notification.component.html',
  styleUrls: ['./patient-list-notification.component.scss']
})
export class PatientListNotificationComponent implements OnInit {
  @ViewChild(DatatableComponent, { static: false }) public table: DatatableComponent;
  alertMsg: IAlert;
  subject: Subject<string> = new Subject();
  ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  pageSize;
  patientList = [];
  page: {
    size: number, // The number of elements in the page
    totalElements: number, // The total number of elements
    totalPages: number, // The total number of pages
    pageNumber: number, // The current page number
  };
  showPatientListFilter = false;
  searchString: string;
  externalPaging: boolean;
  sortUserList: { sort_order: string, sort_column: string };
  isFilterApply: boolean;
  showActivePatient: boolean;

  @Input() searchParams: any;

  constructor(
    public modal: NgbActiveModal,
    private patientService: PatientService,
  ) { }

  ngOnInit() {
    this.defaultObject();
    this.pageSize = '15';
    this.subjectFun();
    this.getPatientList();
  }
  ngOnChanges() {
    this.getPatientList();
  }
  subjectFun() {
    // -- Subscribe to the subject, which is triggered from search input and when section clicked
    // -- When the debounce time has passed, we call getPatientList()
    this.subject
      .pipe(debounceTime(500), takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.page.pageNumber = 1;
        this.getPatientList();
      }
      );
  }
  defaultObject() {
    this.isFilterApply = false;
    this.showActivePatient = true;
    this.page = { size: 15, totalElements: 0, totalPages: 10, pageNumber: 1 };
    this.sortUserList = { sort_order: 'desc', sort_column: 'pat_uhid' };
    this.searchString = '';
    this.externalPaging = true;
  }
  clearSearchFilter() {
    this.searchString = null;
    this.getPatientList();
  }
  getPatientList() {
    const getPatientParams = {
      patient_advance_search: this.searchParams,
      limit: this.page.size,
      current_page: this.page.pageNumber,
      sort_order: this.sortUserList.sort_order,
      sort_column: this.sortUserList.sort_column,
      search_text: this.searchString,
    };

    this.patientService.getFilterPatientList(getPatientParams).subscribe(res => {
      if (res.status_code === 200) {
        if (res.patient_details.length > 0) {
          this.patientList = res.patient_details;
          this.page.totalElements = res.total_records;
        } else {
          this.patientList = [];
          this.page.totalElements = 0;
        }
      }
    });
  }
  onPageSizeChanged(newPageSize) {
    this.sortUserList = { sort_order: 'desc', sort_column: 'pat_uhid' };
    this.page.size = Number(newPageSize);
    this.page.pageNumber = 1;
    this.getPatientList();
  }
  onFooterPage(event): void {
    this.page.pageNumber = event.page;
    this.getPatientList();
  }
  onSortChanged(event) {
    if (event.sorts.length > 0) {
      const obj = event.sorts[0];
      this.sortUserList.sort_order = obj.dir;
      this.sortUserList.sort_column = obj.prop;
      this.getPatientList();
    }
  }
  onSetPage(pageInfo) {
    this.table.offset = pageInfo.offset - 1;
    if (this.externalPaging) {
      return;
    }
  }
}

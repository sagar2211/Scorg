import { Component, OnInit, ViewChild } from '@angular/core';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { FormBuilder, FormGroup } from '@angular/forms';
import * as _ from 'lodash';
import * as moment from 'moment';
import { Observable, of, Subject } from 'rxjs';
import { takeUntil, debounceTime, map, catchError } from 'rxjs/operators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';
import { Constants } from 'src/app/config/constants';
import { NgxPermissionsService } from 'ngx-permissions';
import { Page } from 'src/app/public/models/page';
import { DoctorMappingService } from 'src/app/public/services/doctor-mapping.service';
import { UsersService } from 'src/app/public/services/users.service';
import { CommonService } from 'src/app/public/services/common.service';
import { PermissionsConstants } from 'src/app/config/PermissionsConstants';
import { DoctorMappingEditComponent } from '../doctor-mapping-edit/doctor-mapping-edit.component';

@Component({
  selector: 'app-mapped-doctor-list',
  templateUrl: './mapped-doctor-list.component.html',
  styleUrls: ['./mapped-doctor-list.component.scss']
})
export class MappedDoctorListComponent implements OnInit {
  @ViewChild(DatatableComponent, { static: false }) public table: DatatableComponent;
  page = new Page();
  // page: { size: number; totalElements: number; totalPages?: number; pageNumber: number; };
  sortDoctorMappingList: { sort_order: string; sort_column: string; };
  subject: Subject<string> = new Subject();
  ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  doctorMappingFilterForm: FormGroup;
  doctorMappingList: any[] = [];
  doctorList: any[] = [];
  mappaedDoctorList: any[] = [];
  globalSearchBY: string;
  externalPaging: true;
  showFilter = false;
  isActive = false;
  filterDoctorList: any[];
  // tslint:disable-next-line: variable-name
  _modalService: NgbModal;
  editpermission: boolean = false;

  constructor(
    private doctorMappingService: DoctorMappingService,
    private fb: FormBuilder,
    private userService: UsersService,
    private editModalService: NgbModal,
    private commonService: CommonService,
    private ngxPermissionsService: NgxPermissionsService,
    private route: ActivatedRoute) {
      this._modalService =  editModalService;
    }

  ngOnInit() {
    this.commonService.routeChanged(this.route);
    this.editpermission = _.isUndefined(this.ngxPermissionsService.getPermission(PermissionsConstants.Update_Doctor_Mapping)) ? true : false;

    this.defaultObject();
    this.getDoctorMapplingList();
    this.getDoctorList();
    this.subjectFun();
    this.showActivePopup(); // Global filter button
  }
  defaultObject(): void {
    this.globalSearchBY = '';
    this.page = { size: 15, totalElements: 0, totalPages: 10, pageNumber: 1 };
    this.sortDoctorMappingList = { sort_order: 'asc', sort_column: 'user_name' };
    this.doctorMappingFilterForm = this.fb.group({
      doctorDetails: null,
      mappedDoctorDetails: null,
      fromDate: null,
      toDate: null,
      status: ''
    });
  }
  // doctorMap() {
  //   this.router.navigate(['/userMenus/doctormapping'] );
  // }

  subjectFun() {
    // -- Subscribe to the subject, which is triggered from search input and when section clicked
    // -- When the debounce time has passed, we call getDoctorMapplingList()
    this.subject
      .pipe(debounceTime(500), takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.page.pageNumber = 1;
        this.getDoctorMapplingList();
      }
      );
  }
  getDoctorMapplingList(): void {
    const obj = {
      limit_per_page: this.page.size,
      current_page: this.page.pageNumber,
      sort_order: this.sortDoctorMappingList.sort_order,
      sort_column: this.sortDoctorMappingList.sort_column,
      search_by: this.globalSearchBY === '' ? null : this.globalSearchBY,
      searchCondition: {
        user_id: this.doctorMappingFilterForm.value.doctorDetails === null ||
          this.doctorMappingFilterForm.value.doctorDetails.id === '' ||
          // tslint:disable-next-line: max-line-length
          typeof this.doctorMappingFilterForm.value.doctorDetails.id === 'undefined' ? null : this.doctorMappingFilterForm.value.doctorDetails.id,
        mapped_user_id: this.doctorMappingFilterForm.value.mappedDoctorDetails === null ||
          this.doctorMappingFilterForm.value.mappedDoctorDetails.id === '' ||
          // tslint:disable-next-line: max-line-length
          typeof this.doctorMappingFilterForm.value.mappedDoctorDetails.id === 'undefined' ? null : this.doctorMappingFilterForm.value.mappedDoctorDetails.id,
        status: this.doctorMappingFilterForm.value.status === null ||
          this.doctorMappingFilterForm.value.status === '' ? 'all' : this.doctorMappingFilterForm.value.status,
        mapping_from_date: this.doctorMappingFilterForm.value.fromDate === null ? null :
          (moment(this.doctorMappingFilterForm.value.fromDate).format(Constants.apiDateFormate)),
        mapping_to_date: this.doctorMappingFilterForm.value.toDate === null ? null :
          (moment(this.doctorMappingFilterForm.value.toDate).format(Constants.apiDateFormate)),
      }
    };
    this.doctorMappingService.getDoctorMappingList(obj).subscribe(res => {
      this.doctorMappingList = res.doctor_mapping_list;
      this.page.totalElements = res.total_records;
    });
  }

  onPageSizeChanged(newPageSize): void {
    this.sortDoctorMappingList = { sort_order: 'asc', sort_column: 'user_name' };
    this.page.size = Number(newPageSize);
    this.page.pageNumber = 1;
    this.getDoctorMapplingList();
  }

  onSortChanged(event): void {
    if (event.sorts.length > 0) {
      const obj = event.sorts[0];
      this.sortDoctorMappingList.sort_order = obj.dir;
      this.sortDoctorMappingList.sort_column =  obj.prop === 'mapdoctorName' ? 'mapped_user_name' : 'user_name';
      this.getDoctorMapplingList();
    }
  }
  onSetPage(pageInfo): void {
    this.table.offset = pageInfo.offset - 1;
    if (this.externalPaging) {
      return;
    }
  }

  onPageChanged(event) {
    this.page.pageNumber = event.page;
    this.getDoctorMapplingList();
  }

  getDoctorList(): void {
    this.doctorMappingService.getDoctors().subscribe(res => {
      this.filterDoctorList = _.sortBy(res.doctorList, 'name', 'asc');
      this.doctorList = this.filterDoctorList;
      this.mappaedDoctorList = this.filterDoctorList;
    },
      catchError(error => [])
    );
  }

  onSelectDoctorList() {
    const docDetails = this.doctorMappingFilterForm.value.doctorDetails != null ? this.doctorMappingFilterForm.value.doctorDetails :
      this.doctorMappingFilterForm.value.mappedDoctorDetails != null ? this.doctorMappingFilterForm.value.mappedDoctorDetails : null;
    if (docDetails != null) {
      this.mappaedDoctorList = _.filter(this.filterDoctorList, (doc) => doc.id !== docDetails.id);
    }
  }
  onSelectMappedDoctorList() {
    const mappedDocDetails = this.doctorMappingFilterForm.value.mappedDoctorDetails != null ?
      this.doctorMappingFilterForm.value.mappedDoctorDetails :
      // tslint:disable-next-line: max-line-length
      this.doctorMappingFilterForm.value.doctorDetails != null ? this.doctorMappingFilterForm.value.doctorDetails : null;
    if (mappedDocDetails != null) {
      this.doctorList = _.filter(this.filterDoctorList, (mdoc) => mdoc.id !== mappedDocDetails.id);
    }
  }

  onSerchByFilter() {
    this.showSearchFilter();
    this.page.pageNumber = 1;
    this.getDoctorMapplingList();
  }
  editDoctorMappingBYID(row, mappedRow) {
    const rowData = {
      Id: row.id,
      selectedDoc_Id: row.doctorId,
      selectedDoc_Name: row.doctorName,
      mapdoctorName: mappedRow.mapdoctorName,
      mappedId: mappedRow.mappedId,
      mapdoctorId: mappedRow.mapdoctorId,
      fromDate:  mappedRow.fromDate,
      toDate:  mappedRow.toDate,
      isActive: mappedRow.isActive
    };
    const modalInstance = this.editModalService.open(DoctorMappingEditComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false,
        windowClass: 'custom-modal'
      });
    modalInstance.componentInstance.mappingData = rowData;
    modalInstance.componentInstance.editedModalValues.subscribe((receivedValue) => {
      mappedRow.fromDate = receivedValue.fromDate;
      mappedRow.toDate = receivedValue.todate;
      mappedRow.isActive = receivedValue.isActive;
    });
  }

  onClearFilterData() {
    this.globalSearchBY = '';
    this.doctorMappingFilterForm.reset();
    this.doctorMappingFilterForm.patchValue({
      doctorDetails: null,
      mappedDoctorDetails: null,
      fromDate: null,
      toDate: null,
      status: ''
    });
    this.sortDoctorMappingList = { sort_order: 'asc', sort_column: 'user_name' };
    this.getDoctorMapplingList();
  }

  showSearchFilter() {
    this.showFilter = !this.showFilter;
    this.commonService.setPopupFlag(false, this.showFilter);
  }
  showActivePopup() {
    this.commonService.$addPopupEvent.subscribe(popup => {
      if (popup) {
        // this.addEditDiv = popup.isShowAddPopup;
        this.showFilter = popup.isShowFilterPopup;
      } else {
        // this.addEditDiv = false;
        this.showFilter = false;
      }
    });
  }
  // tslint:disable-next-line: use-lifecycle-interface
  ngOnDestroy() {
    this.ngUnsubscribe.next(true);
    this.ngUnsubscribe.unsubscribe();
  }


}

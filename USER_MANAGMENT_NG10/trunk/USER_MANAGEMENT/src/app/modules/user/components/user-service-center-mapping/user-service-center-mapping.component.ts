import { Component, OnInit, ViewChild } from '@angular/core';
import { UsersService } from 'src/app/public/services/users.service';
import * as _ from 'lodash';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { PermissionsConstants } from 'src/app/config/PermissionsConstants';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { IAlert } from 'src/app/public/models/AlertMessage';
import { ServiceCenterAddUpdateMappingComponent } from '../service-center-add-update-mapping/service-center-add-update-mapping.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Constants } from 'src/app/config/constants';

@Component({
  selector: 'app-user-service-center-mapping',
  templateUrl: './user-service-center-mapping.component.html',
  styleUrls: ['./user-service-center-mapping.component.scss']
})
export class UserServiceCenterMappingComponent implements OnInit {
  @ViewChild(DatatableComponent, { static: false }) public table: DatatableComponent;
  page: {
    size: number, // The number of elements in the page
    totalElements: number, // The total number of elements
    totalPages: number, // The total number of pages
    pageNumber: number, // The current page number
  };
  alertMsg: IAlert;
  searchString: any;
  sortUserList: { sort_order: string, sort_column: string };
  pageSize;
  serviceCenterData: any;
  externalPaging: boolean;
  isActive: boolean;
  PermissionConstantList: typeof PermissionsConstants;
  subject: Subject<string> = new Subject();
  ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(
    public userServices: UsersService,
    public modalService: NgbModal,
  ) { }

  ngOnInit(): void {
    this.PermissionConstantList = PermissionsConstants;
    this.defaultObject();
    this.pageSize = '15';
    this.subjectFun();
    this.getUserServiceCenterMappingList();
  }

  defaultObject() {
    this.page = { size: 15, totalElements: 0, totalPages: 10, pageNumber: 1 };
    this.sortUserList = { sort_order: 'desc', sort_column: 'userId' };
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
        this.getUserServiceCenterMappingList();
      }
      );
  }

  onSortChanged(event) {
    if (event.sorts.length > 0) {
      const obj = event.sorts[0];
      this.sortUserList.sort_order = obj.dir;
      this.sortUserList.sort_column = this.getSortColumnName(obj.prop);
      this.getUserServiceCenterMappingList();
    }
  }

  getSortColumnName(clmName) {
    return clmName;
  }

  onSetPage(pageInfo) {
    this.table.offset = pageInfo.offset - 1;
    if (this.externalPaging) {
      return;
    }
  }

  onPageSizeChanged(newPageSize) {
    this.sortUserList = { sort_order: 'desc', sort_column: 'userId' };
    this.page.size = Number(newPageSize);
    this.page.pageNumber = 1;
    this.getUserServiceCenterMappingList();
  }

  updateDataTable() {
    this.getUserServiceCenterMappingList();
  }

  clearSearchString() {
    this.searchString = null;
    this.getUserServiceCenterMappingList();
  }

  getUserServiceCenterMappingList(){
    const param = {
      limit: this.page.size,
      pageNumber: this.page.pageNumber,
      sortOrder: this.sortUserList.sort_order,
      sortColumn: this.sortUserList.sort_column,
      searchKeyword: this.searchString,
    };
    this.userServices.getUserServiceMappingList(param).subscribe((response)=>{
        if(response){
          this.serviceCenterData = response;
        } else {
          this.serviceCenterData = [];
        }
    })
  }

  onEditorPreparing(evt){

  }

  editMapping(row) {
    const obj = {
      user_id: row.userId,
      user_name: row.userName
    };
    this.openPopup(obj);
  }

  openPopup(val) {
    const detail = {
      data: val,
      type: val ? 'edit' : 'add'
    };
    const modalInstance = this.modalService.open(ServiceCenterAddUpdateMappingComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false,
        windowClass: 'custom-modal',
        container: '#homeComponent'
      });
    modalInstance.result.then((result) => {
      if (result === 'save') {
        this.alertMsg = {
          message: 'Value Saved Successfully',
          messageType: 'success',
          duration: Constants.ALERT_DURATION
        };
        this.getUserServiceCenterMappingList();
      }
    }, (dis) => {

    });
    modalInstance.componentInstance.popupDetails = detail;
  }

  showHideAddSectionPopOver(){
    const data = ''
    this.openPopup(data);
  }
}

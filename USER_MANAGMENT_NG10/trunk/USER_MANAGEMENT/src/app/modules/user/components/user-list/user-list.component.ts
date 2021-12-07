import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';
import { NgbModal, NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { map, catchError, debounceTime, takeUntil } from 'rxjs/operators';
import { Observable, Subject, of } from 'rxjs';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import * as moment from 'moment';
import { ActivatedRoute } from '@angular/router';
import { IAlert } from 'src/app/public/models/AlertMessage';
import { FormBuilder, FormGroup } from '@angular/forms';
import { RoleType } from 'src/app/public/models/roletype';
import { Roles } from 'src/app/public/models/roles';
import { Department } from 'src/app/public/models/department';
import { Applicationlist } from 'src/app/public/models/applicationlist';
import { UsersService } from 'src/app/public/services/users.service';
import { AuthService } from 'src/app/public/services/auth.service';
import { CommonService } from 'src/app/public/services/common.service';
import { PermissionsConstants } from 'src/app/config/PermissionsConstants';
import { Constants } from 'src/app/config/constants';
import { ConfirmationPopupComponent } from 'src/app/shared/confirmation-popup/confirmation-popup.component';
import { ResetPasswordComponent } from '../reset-password/reset-password.component';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {
  @Output() currentRoute: EventEmitter<ActivatedRoute> = new EventEmitter();
  @ViewChild(DatatableComponent, { static: false }) public table: DatatableComponent;
  sortUserList: { sort_order: string, sort_column: string };
  subject: Subject<string> = new Subject();
  ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  usersList: any[] = [];
  reorderable = true;
  swapColumns = false;
  showUserListFilter = false;
  externalPaging = true;
  alertMsg: IAlert;
  isScrolled = false;
  page: {
    size: number, // The number of elements in the page
    totalElements: number, // The total number of elements
    totalPages: number, // The total number of pages
    pageNumber: number, // The current page number
  };
  searchFromMinDate: Date;
  searchToMinDate: Date;
  userListFilterForm: FormGroup;
  globalSearchBY: string;
  compInstance = this;
  editPageData = {};
  rolesTypeList: RoleType[] = [];
  rolesTypeListMaster: RoleType[] = [];
  primaryRolesList: Roles[] = [];
  departmentmasteList: Department[] = [];
  pageSize;
  isUserLoggedIn;
  // tslint:disable-next-line: variable-name
  _modalService: NgbModal;
  PermissionsConstantsList: any = [];
  ngbPopover: NgbPopover;
  applications: Array<Applicationlist> = [];
  constructor(
    public userServices: UsersService,
    private confirmationModalService: NgbModal,
    public authService: AuthService,
    public fb: FormBuilder,
    private route: ActivatedRoute,
    private commonService: CommonService
  ) {
    this._modalService = confirmationModalService;
  }

  ngOnInit() {
    this.defaultObject();
    this.searchFromMinDate = new Date();
    this.searchToMinDate = new Date();
    this.pageSize = '15';
    // this.currentRoute.emit(this.route);
    this.commonService.routeChanged(this.route);
    this.PermissionsConstantsList = PermissionsConstants;
    const pageObject = this.userServices.getEditedPageObject();
    if (pageObject) {
      // this.page.pageNumber = pageObject.pageNumber
      this.userServices.setEditedPageObject(pageObject);
    } else {
      this.page = JSON.parse(this.route.snapshot.params.data);
      this.userServices.setEditedPageObject({ size: 15, totalElements: 0, totalPages: 10, pageNumber: 1 });
    }
    this.getApplicationMaster();
    this.getRoleTypes().subscribe();
    this.getDeprtmentMaster().subscribe();
    if (this.commonService.userListTempParams) { // fetch search details
      this.page.size = this.commonService.userListTempParams.param.limit_per_page;
      this.page.pageNumber = this.commonService.userListTempParams.param.current_page;
      this.sortUserList.sort_order = this.commonService.userListTempParams.param.sort_order;
      this.sortUserList.sort_column = this.commonService.userListTempParams.param.sort_column;
      this.globalSearchBY = this.commonService.userListTempParams.param.global_search;
      this.userListFilterForm.patchValue({
        application: this.commonService.userListTempParams.formValue.application,
        role_type: this.commonService.userListTempParams.formValue.role_type,
        status: this.commonService.userListTempParams.formValue.status,
        from_date: this.commonService.userListTempParams.formValue.from_date,
        to_date: this.commonService.userListTempParams.formValue.to_date,
        primary_role: this.commonService.userListTempParams.formValue.primary_role,
        department: this.commonService.userListTempParams.formValue.department
      });
    } else {
      this.commonService.userListTempParams = null;
    }
    this.getUserList();
    this.subjectFun();
    this.showActivePopup(); // Global filter button
  }
  defaultObject(): void {
    this.page = { size: 15, totalElements: 0, totalPages: 10, pageNumber: 1 };
    this.sortUserList = { sort_order: 'asc', sort_column: 'name' };
    this.globalSearchBY = '';
    this.userListFilterForm = this.fb.group({
      application: [null],
      role_type: [null],
      status: '',
      from_date: '',
      to_date: '',
      primary_role: [null],
      department: [null]
    });
  }
  subjectFun() {
    // -- Subscribe to the subject, which is triggered from search input and when section clicked
    // -- When the debounce time has passed, we call getUserList()
    this.subject
      .pipe(debounceTime(500), takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.page.pageNumber = 1;
        this.getUserList();
      }
      );
  }
  getUserList(tempobj?) {
    const obj = {
      limit_per_page: this.page.size,
      current_page: this.page.pageNumber,
      sort_order: this.sortUserList.sort_order,
      sort_column: this.sortUserList.sort_column,
      global_search: this.globalSearchBY === '' ? null : this.globalSearchBY,
      searchCondition: {
        application_id: this.userListFilterForm.value.application === null || this.userListFilterForm.value.application.id === '' ||
          typeof this.userListFilterForm.value.application.id === 'undefined' ? null : this.userListFilterForm.value.application.id,
        role_type_id: this.userListFilterForm.value.role_type === null || this.userListFilterForm.value.role_type.id === '' ||
          typeof this.userListFilterForm.value.role_type.id === 'undefined' ? null : this.userListFilterForm.value.role_type.id,
        status: this.userListFilterForm.value.status === '' ? null : this.userListFilterForm.value.status,
        from_date: this.userListFilterForm.value.from_date === '' ? null :
          (moment(this.userListFilterForm.value.from_date).format(Constants.apiDateFormate)),
        to_date: this.userListFilterForm.value.to_date === '' ? null :
          (moment(this.userListFilterForm.value.to_date).format(Constants.apiDateFormate)),
        primary_role_id: this.userListFilterForm.value.role_type === null || this.userListFilterForm.value.primary_role === null ||
          this.userListFilterForm.value.primary_role.id === '' ||
          typeof this.userListFilterForm.value.primary_role.id === 'undefined' ?
          null : this.userListFilterForm.value.primary_role.id,
        department_id: this.userListFilterForm.value.department === null ||
          this.userListFilterForm.value.department.id === '' ||
          typeof this.userListFilterForm.value.department.id === 'undefined' ?
          null : this.userListFilterForm.value.department.id,
      }
    };
    const params = tempobj ? tempobj : obj;
    this.userServices.getUserList(params).subscribe(result => {
      this.commonService.userListTempParams = {
        param: params,
        formValue: this.userListFilterForm.value
      };
      this.usersList = result.user_list;
      this.page.totalElements = result.total_records;
    });
  }

  onSetPage(pageInfo) {
    this.table.offset = pageInfo.offset - 1;
    if (this.externalPaging) {
      return;
    }
  }
  onPageSizeChanged(newPageSize) {
    this.sortUserList = { sort_order: 'asc', sort_column: 'name' };
    this.page.size = Number(newPageSize);
    this.page.pageNumber = 1;
    this.getUserList();
  }
  onSortChanged(event) {
    if (event.sorts.length > 0) {
      const obj = event.sorts[0];
      this.sortUserList.sort_order = obj.dir;
      this.sortUserList.sort_column = obj.prop;
      this.getUserList();
    }
  }
  showSearchFilter() {
    this.showUserListFilter = !this.showUserListFilter;
    this.commonService.setPopupFlag(false, this.showUserListFilter);
  }
  editUserBYID(row) {
    const pageData = this.page;
    this.userServices.setEditedPageObject(pageData);
  }

  loadConfirmationPopup(userData, type) {
    const modalTitleobj = (type === 'delete') ? 'Delete' : (type === 'fLogout') ? 'Force Logout' :
      (userData.status === 'Active' ? 'Inactive' : 'Active');
    const modalBodyobj = (type === 'delete') ? 'Do you want to delete this user <span class="font-weight-500">(' + userData.name + ') </span>' :
      (type === 'Force Logout') ? 'Do you want to logged out this user <span class="font-weight-500">(' + userData.name + ')</span>' :
        'Do you want to change the user status <span class="font-weight-500">(' + userData.name + ')</span>';
    const messageDetails = {
      modalTitle: modalTitleobj,
      modalBody: modalBodyobj
    };
    const modalInstance = this.confirmationModalService.open(ConfirmationPopupComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false
      });
    modalInstance.result.then((result) => {
      if (result === 'Ok') {
        if (type === 'delete') {
          this.deleteUserById(userData);
        }
        if (type === 'fLogout') {
          this.forcelogout(userData);
        }
        if (type === 'active') {
          this.updateUserStatus(userData);
        }
      }
    });
    modalInstance.componentInstance.messageDetails = messageDetails;
  }

  deleteUserById(row): void {
    this.userServices.deleteUserById(row.user_id).subscribe(result => {
      if (result.status_message === 'Success') {
        _.map(this.usersList, (user) => {
          if (user.user_id === result.id) {
            user.status = 'Deleted';
            user.is_deleted = true;
          }
        });
        this.alertMsg = {
          message: 'User deleted Successfully.',
          messageType: 'success',
          duration: 3000
        };
      } else {
        this.alertMsg = {
          message: 'Something went Wrong',
          messageType: 'danger',
          duration: 3000
        };
      }
    }, error => {
      console.log(`Error while delete User ${error}`);
    });
  }

  forcelogout(row): void {
    const obj = {
      user_id: row.user_id
    };
    this.authService.forceLogout(obj).subscribe(result => {
      if (result.status_message === 'Success') {
        this.alertMsg = {
          message: 'User logged out Successfully.',
          messageType: 'success',
          duration: 3000
        };
      } else {
        this.alertMsg = {
          message: 'Something went Wrong',
          messageType: 'danger',
          duration: 3000
        };
      }
    }, error => {
      console.log(`Error while force logout ${error}`);
    });
  }

  resetPassword(userData): void {
    const modalInstance = this.confirmationModalService.open(ResetPasswordComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false,
        windowClass: 'custom-modal'
      });
    modalInstance.componentInstance.userData = userData;
  }
  getRoleTypes(): Observable<any> {
    // const searchString = (!_.isUndefined(searchkey) && searchkey != null) ? searchkey : '';
    return this.compInstance.userServices.getRoleTypes().pipe(map(res => {
      this.rolesTypeList = res.role_types;
      this.rolesTypeListMaster = [...this.rolesTypeList]
      // this.rolesTypeList = this.compInstance.globalSearchData.transform(this.rolesTypeList, searchString);
      return this.rolesTypeList;
    }),
      catchError(error => [])
    );
  }
  getPrimaryRoles(primaryFlag?): Observable<any> {
    // const searchString = (!_.isUndefined(searchSt) && searchSt != null) ? searchSt : '';
    const params = {
      type: (primaryFlag !== false && this.compInstance.userListFilterForm.value.role_type != null &&
        !_.isUndefined(this.compInstance.userListFilterForm.value.role_type.id))
        ? this.compInstance.userListFilterForm.value.role_type.id : 0,
      isPrimary: primaryFlag === false ? primaryFlag : true
    };
    if (params.isPrimary && (this.compInstance.userListFilterForm.value.role_type == null
      || _.isUndefined(this.compInstance.userListFilterForm.value.role_type.id))) {
      return of([]);
    } else {
      return this.compInstance.userServices.getPrimaryRoles(params).pipe(map(res => {
        this.primaryRolesList = res.Roles;
        // this.primaryRolesList = this.compInstance.globalSearchData.transform(this.primaryRolesList, searchString);
        return this.primaryRolesList;
      }),
        catchError(error => [])
      );
    }
  }

  getDeprtmentMaster(): Observable<any> {
    // const searchString = (!_.isUndefined(searchKey) && searchKey != null) ? searchKey : '';
    return this.compInstance.userServices.getDepartment().pipe(map(res => {
      this.departmentmasteList = res.Departments;
      // this.departmentmasteList = this.compInstance.globalSearchData.transform(this.departmentmasteList, searchString);
      return this.departmentmasteList;
    }),
      catchError(error => [])
    );
  }

  getApplicationMaster() {
    this.userServices.getApplicationList().subscribe(res => {
      this.applications = res.applications;
    }, error => {
      console.log(`Something went wrong ${error}`);
    });
  }

  selectApplication(event) {
    this.userListFilterForm.patchValue({ application: event ? event : null });
    this.rolesTypeList = this.rolesTypeListMaster.filter(r => r.application_id === event.id);
  }
  selectRoleType(event) {
    this.userListFilterForm.patchValue({ role_type: event ? event : null });
    this.userListFilterForm.patchValue({ primary_role: null });
    this.getPrimaryRoles('').subscribe();
  }
  selectPrimaryRole(event) {
    this.userListFilterForm.patchValue({ primary_role: event ? event : null });
  }
  selectDepartment(event) {
    this.userListFilterForm.patchValue({ department: event ? event : null });
  }
  clearForm() {
    this.globalSearchBY = '';
    this.userListFilterForm.reset();
    this.userListFilterForm.patchValue({
      application: '',
      role_type: '',
      status: '',
      from_date: '',
      to_date: '',
      primary_role: '',
      department: ''
    });
    this.sortUserList = { sort_order: 'asc', sort_column: 'name' };
    this.page.size = 15;
    this.pageSize = '15';
    this.page.pageNumber = 1;
    this.getUserList();
    this.commonService.userListTempParams = null;
    // this.showSearchFilter();
  }
  onFooterPage(event): void {
    this.page.pageNumber = event.page;
    this.getUserList();
  }

  updateUserStatus(row): void {
    const obj = {
      user_id: row.user_id,
      is_active: row.status === 'Inactive' ? true : false
    };
    this.userServices.userStatusActiveOrDeactive(obj).subscribe(result => {
      if (result.status_message === 'Success') {
        _.map(this.usersList, (user) => {
          if (user.user_id === row.user_id) {
            user.status = row.status === 'Inactive' ? 'Active' : 'Inactive';
            user.is_active = row.status === 'Inactive' ? true : false;
          }
        });
        this.alertMsg = {
          message: 'User Status Changed Successfully.',
          messageType: 'success',
          duration: 3000
        };
      } else {
        this.alertMsg = {
          message: result.message,
          messageType: 'danger',
          duration: 3000
        };
      }
    }, error => {
      console.log(`Error while update user status ${error}`);
    });
  }

  searchByFilter(): void {
    this.page.pageNumber = 1;
    this.showSearchFilter();
    this.getUserList();
  }
  getIsUserLogged(row, ele?: NgbPopover) {
    if (ele) {
      this.ngbPopover = ele;
    }
    this.userServices.isUserLoggedIn(row.user_id).subscribe(res => {
      if (res.status_message === 'Success') {
        this.isUserLoggedIn = res.message === 'Yes' ? true : false;
      }
    });
  }
  showActivePopup() {
    this.commonService.$addPopupEvent.subscribe(popup => {
      if (popup) {
        // this.addEditDiv = popup.isShowAddPopup;
        this.showUserListFilter = popup.isShowFilterPopup;
      } else {
        // this.addEditDiv = false;
        this.showUserListFilter = false;
      }
    });
  }

  // tslint:disable-next-line: use-lifecycle-interface
  ngOnDestroy() {
    this.ngUnsubscribe.next(true);
    this.ngUnsubscribe.unsubscribe();
  }
  onScrollForPopOver(): void {
    if (this.ngbPopover) {
      this.ngbPopover.close();
    }
  }

}



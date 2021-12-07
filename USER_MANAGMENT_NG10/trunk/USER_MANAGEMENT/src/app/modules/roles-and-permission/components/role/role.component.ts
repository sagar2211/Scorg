import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import * as _ from 'lodash';
import { Subject, Observable, of } from 'rxjs';
import { map, catchError, takeUntil } from 'rxjs/operators';
import { fadeInOut } from 'src/app/config/animations';
import { PermissionsConstants } from 'src/app/config/PermissionsConstants';
import { IAlert } from 'src/app/public/models/AlertMessage';
import { Applicationlist } from 'src/app/public/models/applicationlist';
import { Roles } from 'src/app/public/models/roles';
import { RoleType } from 'src/app/public/models/roletype';
import { CommonService } from 'src/app/public/services/common.service';
import { UsersService } from 'src/app/public/services/users.service';
import { ConfirmationPopupComponent } from 'src/app/shared/confirmation-popup/confirmation-popup.component';

@Component({
  selector: 'app-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.scss'],
  animations: [
    fadeInOut
  ],
})
export class RoleComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(DatatableComponent, { static: false }) public table: DatatableComponent;
  alertMsg: IAlert;
  destroy$ = new Subject();
  sortUserList: { sort_order: string, sort_colum: string };
  page: {
    size: number, // The number of elements in the page
    totalElements: number, // The total number of elements
    totalPages: number, // The total number of pages
    pageNumber: number, // The current page number
  };
  createRoleForm: FormGroup;
  isApplicationDisabled = false;
  submitted = false;
  compInstance = this;
  roleTypeMasterList: RoleType[] = [];
  rolesTypeList: RoleType[] = [];
  applicationList: Applicationlist[] = [];
  editUserId: '';
  // reSizeCoulmnWidth = 300;
  swapColumns = false;
  roleList: any[] = [];
  externalPaging = true;
  addEditDiv = false;
  modalService: NgbModal;
  datatableBodyElement: any;
  tempEditedObject = {
    roleName: ''
  };
  showRoleFilter = false;
  roleListFilterForm: FormGroup;
  primaryRolesList: Roles[] = [];
  constpermissionList: any = [];
  constructor(
    public userService: UsersService,
    public router: Router,
    private confirmationModalService: NgbModal,
    public fb: FormBuilder,
    private route: ActivatedRoute,
    private commonService: CommonService
  ) {
    this.modalService = confirmationModalService;
  }

  ngOnInit() {
    this.constpermissionList = PermissionsConstants;
    this.commonService.routeChanged(this.route);
    this.defaultObject();
    this.getRoleTypes().subscribe();
    this.getApplications().subscribe();
    this.getRoleList();
    this.showActivePopup();
    //this.getApplicationMaster();
  }

  ngAfterViewInit(): void {
    this.datatableBodyElement = this.table.element.children[0].children[1];
    this.datatableBodyElement.setAttribute('style', 'height:calc(100vh - 200px)');
  }

  defaultObject(): void {
    this.page = { size: 15, totalElements: 0, totalPages: 10, pageNumber: 1 };
    this.sortUserList = { sort_order: 'asc', sort_colum: 'role_type_name' };
    this.createRoleForm = this.fb.group({
      role_id: [''],
      role_type: [null, Validators.required],
      role_name: ['', Validators.required],
      role_is_primary: [false],
      is_active: [true],
      application: [null, Validators.required]
    });

    this.roleListFilterForm = this.fb.group({
      application: [null],
      role_type: [null],
      role: [null],
      status: '',
    });
  }
  onSetPage(pageInfo) {
    this.table.offset = pageInfo.offset;
    if (this.externalPaging) {
      return;
    }
  }

  getApplications(): Observable<any> {
    return this.userService.getApplicationList().pipe(map(res => {
      this.applicationList = res.applications;
      return this.applicationList;
    }),
      catchError(error => [])
    );
  }

  getRoleTypes(): Observable<any> {
    return this.compInstance.userService.getRoleTypes().pipe(map(res => {
      this.roleTypeMasterList = res.role_types;
      return this.roleTypeMasterList;
    }),
      catchError(error => [])
    );
  }

  getPrimaryRoles(): Observable<any> {
    const params = {
      type: (this.compInstance.roleListFilterForm.value.role_type != null &&
        !_.isUndefined(this.compInstance.roleListFilterForm.value.role_type.id))
        ? this.compInstance.roleListFilterForm.value.role_type.id : 0,
      isPrimary: true
    };
    if (this.compInstance.roleListFilterForm.value.role_type == null
      || _.isUndefined(this.compInstance.roleListFilterForm.value.role_type.id)) {
      return of([]);
    } else {
      return this.compInstance.userService.getPrimaryRoles(params).pipe(map(res => {
        this.primaryRolesList = res.Roles;
        return this.primaryRolesList;
      }),
        catchError(error => [])
      );
    }
  }

  selectRoleType(event) {
    this.createRoleForm.patchValue({ role_type: event ? event : null });
  }
  selectApplication(event) {
    this.createRoleForm.patchValue({
      application: event ? event : null,
      role_id: null,
      role_type: null,
      role_name: null,
      role_is_primary: false,
      is_active: true,
    });
    this.rolesTypeList = _.filter(this.roleTypeMasterList, (o) => o.application_id === event.id);
  }

  selectRoleName(event) {
    this.roleListFilterForm.patchValue({ role: event ? event : '' });
  }

  get roleFrmCntrols() {
    return this.createRoleForm.controls;
  }

  getRoleList(): void {
    this.userService.getRoleMasterList().subscribe(res => {
      this.page.totalElements = res.length;
      this.roleList = res;
    });
  }
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }
  onFooterPage(event): void {
    this.page.pageNumber = event.page;
    // this.roleList = [];
    // this.roleList = _.take(this.userService.roleMasterList, (this.page.size));
  }
  onPageSizeChanged(newPageSize) {
    this.sortUserList = { sort_order: 'asc', sort_colum: 'role_type_name' };
    this.page.size = Number(newPageSize);
    this.page.pageNumber = 1;
    // this.roleList = [];
    // this.roleList = _.take(this.userService.roleMasterList, (this.page.size));
  }

  AddUpdateRole(): void {
    this.submitted = true;
    if (this.createRoleForm.valid && this.submitted) {
      const object = {
        id: this.createRoleForm.value.role_id ? this.createRoleForm.value.role_id : 0,
        role_name: this.createRoleForm.value.role_name,
        role_is_primary: this.createRoleForm.value.role_is_primary,
        role_type_id: this.createRoleForm.value.role_type.id,
        role_type_name: this.createRoleForm.value.role_type.name,
        is_active: this.createRoleForm.value.is_active,
        role_application_id: this.createRoleForm.value.application.id,
        application_name: this.createRoleForm.value.application.name,
      };
      this.userService.createRole(object).pipe(takeUntil(this.destroy$)).subscribe(res => {
        if (res.status_code === 200) {
          // const index = _.findIndex(this.roleList, (rec) => rec.role_id === this.createRoleForm.value.role_id);
          this.roleList = [...res.masterRoelList];
          this.page.totalElements = this.roleList.length;
          this.isApplicationDisabled = false;
          this.tempEditedObject.roleName = '';
          this.datatableBodyElement.setAttribute('style', 'height:calc(100vh - 200px)');
          this.alertMsg = {
            message: this.createRoleForm.value.role_id ? 'Role Updated Successfully.' : 'Role Created Successfully.',
            messageType: 'success',
            duration: 3000
          };
          this.cancel();
        }
      });
    }
  }

  addTableBodyHeight(): void {
    this.tempEditedObject.roleName = '';
    this.isApplicationDisabled = false;
    this.datatableBodyElement.setAttribute('style', 'height:calc(100vh - 315px)');
  }

  cancel(): void {
    this.createRoleForm.reset({});
    this.createRoleForm = this.fb.group({
      role_id: [''],
      role_type: [null, Validators.required],
      role_name: ['', Validators.required],
      role_is_primary: [false],
      application: [null, Validators.required],
      is_active: [true]
    });
    this.submitted = false;
    this.addEditDiv = false;
    this.editUserId = '';
    this.isApplicationDisabled = false;
    this.tempEditedObject.roleName = '';
    this.commonService.setPopupFlag(this.addEditDiv, false);
    this.datatableBodyElement.setAttribute('style', 'height:calc(100vh - 200px)');
  }

  editRole(editObject): void {
    this.editUserId = editObject.id;
    this.isApplicationDisabled = true;
    this.datatableBodyElement.setAttribute('style', 'height:calc(100vh - 315px)');
    this.createRoleForm.patchValue({
      role_id: editObject.id,
      role_type: { id: editObject.type_id, name: editObject.type_name },
      role_name: editObject.name,
      role_is_primary: editObject.isPrimary,
      is_active: editObject.is_active,
      application : { id: editObject.application_id, name: editObject.application_name }
    // role_application_id:editObject.role_application_id
    });
    this.tempEditedObject.roleName = editObject.name;
    this.commonService.isAddButtonDisable = true;
  }

  deleteConfirmationPopup(rowData) {
    const modalTitleobj = 'Delete';
    const modalBodyobj = 'Do you want to delete this Role <span class="font-weight-500">(' + rowData.name + ') </span>';
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
        this.deleteRoleById(rowData);
      }
    });
    modalInstance.componentInstance.messageDetails = messageDetails;
  }

  deleteRoleById(rowData): void {
    this.userService.deleteRoleById(rowData.id).subscribe(res => {
      if (res.status_code === 200) {
        this.roleList = [...res.masterRoelList];
        this.page.totalElements = this.roleList.length;
        this.alertMsg = {
          message: 'Role Deleted SuccessFully',
          messageType: 'success',
          duration: 3000
        };
      } else if (res.status_code === 500) {
        this.alertMsg = {
          message: 'Role is already in use, can\'t be deleted',
          messageType: 'danger',
          duration: 3000
        };
      }
    });
  }

  // redirectToRolePermission(row): void {
  //   this.router.navigate(['./../managePermissions', row.id]);
  // }

  updateFilter(event) {
    const val = event.target.value.toLowerCase().trim();
    let temp = [];
    // filter our data
    if (val) {
      temp = _.filter(this.userService.roleMasterList, (d) =>
        d.name.toLowerCase().trim().indexOf(val) !== -1 || d.type_name.toLowerCase().trim().indexOf(val) !== -1 || !val
      );
      // update the rows
      this.roleList = [...temp];
    } else {
      this.getRoleList();
    }
    // Whenever the filter changes, always go back to the first page
    this.table.offset = 0;
  }

  isRoleNameExist(application, roleName): void {
    const trimroleName = roleName.value.trim();
    if (trimroleName === '') { // set validate if role name is "".
      this.createRoleForm.patchValue({
        role_name: trimroleName
      });
    }
    if (roleName.value && this.tempEditedObject.roleName !== roleName.value) {
      this.userService.isExistRoleName(application.value.id, roleName.value).subscribe(res => {
        if (res.message === 'Yes') {
          this.createRoleForm.get('role_name').setErrors({ incorrect: true });
        } else {
          this.createRoleForm.get('role_name').setErrors(null);
        }
      });
    }
  }

  showSearchFilter() {
    this.showRoleFilter = !this.showRoleFilter;
    if (this.commonService.ConstantNav.isShowAddPopup) {
      this.commonService.setPopupFlag(true, this.showRoleFilter);
    } else {
      this.commonService.setPopupFlag(false, this.showRoleFilter);
    }
  }
  selectFilterApplication(event) {
    this.roleListFilterForm.patchValue({ role_type: null });
    this.roleListFilterForm.patchValue({role: null});
    this.rolesTypeList = _.filter(this.roleTypeMasterList, (o) => o.application_id === event.id);
  }
  selectFilterRoleType(event) {
    this.roleListFilterForm.patchValue({ role_type: event ? event : null });
    this.roleListFilterForm.patchValue({role: null});
    this.getPrimaryRoles().subscribe();
  }
  customeRoleFilter() {
    let tempRoleFilterList = [];
    const applicationId = this.roleListFilterForm.value.application ?
      this.roleListFilterForm.value.application.id : 0;
    const roleTypeId = this.roleListFilterForm.value.role_type ?
      this.roleListFilterForm.value.role_type.id : '';
    const primaryroleId = this.roleListFilterForm.value.role ?
      this.roleListFilterForm.value.role.id : '';
    const isActive = this.roleListFilterForm.value.status ?
      this.roleListFilterForm.value.status.toLowerCase() : this.roleListFilterForm.value.status;

    if (applicationId === 0 && roleTypeId === '' && primaryroleId === '' && isActive === '') {
      this.roleList = [...this.userService.roleMasterList];
    } else {
      if (applicationId !== 0) {
        tempRoleFilterList = _.filter(this.userService.roleMasterList, (d) => d.application_id === applicationId);
      }
      if (roleTypeId !== '') {
        tempRoleFilterList = _.filter(this.userService.roleMasterList, (d) =>
          (d.type_id.toString().indexOf(roleTypeId.toString()) !== -1));
      }
      if (primaryroleId !== '') {
        const tempList = tempRoleFilterList.length ? tempRoleFilterList : this.userService.roleMasterList;
        tempRoleFilterList = _.filter(tempList, (d) =>
          (d.id.toString().indexOf(primaryroleId.toString()) !== -1));
      }
      if (isActive !== '') {
        const tempList = tempRoleFilterList.length ? tempRoleFilterList : this.userService.roleMasterList;
        tempRoleFilterList = _.filter(tempList, (d) =>
          (d.is_active.toString().toLowerCase().indexOf(isActive) !== -1));
      }
      this.roleList = [...tempRoleFilterList];
      this.showRoleFilter = false;
    }
    this.table.offset = 0;
  }

  clearSearchFilter(): void {
    this.roleListFilterForm.reset();
    this.roleListFilterForm = this.fb.group({
      role_type: '',
      status: '',
      role: '',
    });
    this.getRoleList();
    this.table.offset = 0;
  }

  showActivePopup() {
    this.commonService.$addPopupEvent.subscribe(popup => {
      if (popup) {
        this.addEditDiv = popup.isShowAddPopup;
        this.showRoleFilter = popup.isShowFilterPopup;
        if (popup.isShowAddPopup) {
          this.addTableBodyHeight();
        } else {
          this.datatableBodyElement.setAttribute('style', 'height:calc(100vh - 200px)');
        }
      } else {
        this.addEditDiv = false;
        this.showRoleFilter = false;
      }
    });
  }
}

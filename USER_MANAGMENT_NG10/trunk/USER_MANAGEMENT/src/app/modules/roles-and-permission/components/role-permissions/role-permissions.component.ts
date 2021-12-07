import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DualListComponent } from 'angular-dual-listbox';
import * as _ from 'lodash';
import { forkJoin, Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { IAlert } from 'src/app/public/models/AlertMessage';
import { Applicationlist } from 'src/app/public/models/applicationlist';
import { ModuleMasterList } from 'src/app/public/models/module-master';
import { Permission } from 'src/app/public/models/permission';
import { RolePermission } from 'src/app/public/models/role-permission';
import { Roles } from 'src/app/public/models/roles';
import { RoleType } from 'src/app/public/models/roletype';
import { CommonService } from 'src/app/public/services/common.service';
import { UsersService } from 'src/app/public/services/users.service';
import { ConfirmationPopupComponent } from 'src/app/shared/confirmation-popup/confirmation-popup.component';

@Component({
  selector: 'app-role-permissions',
  templateUrl: './role-permissions.component.html',
  styleUrls: ['./role-permissions.component.scss']
})
export class RolePermissionsComponent implements OnInit {

  sourcePermissions: Array<Permission> = [];
  permissionMaster: Array<Permission> = [];
  roleMasterList: any = [];
  roleTypes: Array<RoleType> = [];
  appRoleTypes: Array<RoleType> = [];
  roles: Array<Roles> = [];
  applications: Array<Applicationlist> = [];
  modules: Array<ModuleMasterList> = [];
  rolePermissions: Array<RolePermission> = [];
  origionalDestinationPermission: Array<Permission> = [];
  destinationPermissions: Array<Permission> = [];
  tempDestination: Array<Permission> = [];
  dualListboxFormat: any = DualListComponent.DEFAULT_FORMAT;
  selectedRole: Roles = null;
  selectedRoleType: RoleType = null;
  alertMsg: IAlert;
  name: string;
  id: string;
  compInstance = this;
  modalService: NgbModal;
  selectedRoleName: string;
  selectedApplication: any;
  selectedModule: any;
  isDisabled = true;
  selectedRoleId;
  events: Event[] = [];

  constructor(
    private userService: UsersService,
    private confirmationModalService: NgbModal,
    private route: ActivatedRoute,
    private commonService: CommonService
  ) {
    this.modalService = confirmationModalService;
  }

  ngOnInit() {
    this.commonService.routeChanged(this.route);
    this.selectedRoleId = this.route.snapshot.params.id;
    this.name = 'name';
    this.id = 'id';
    const applicationFork = this.getApplicationMaster();
    //const moduleFork = this.getModuleMaster();
    const roleTypesFork = this.getRoleTypes();
    const permissionsFork = this.getMasterPermissions(-1);
    const rolesFork = this.getRoleMasterList();
    forkJoin([applicationFork, roleTypesFork, permissionsFork, rolesFork]).subscribe(res => {
      if (this.selectedRoleId) {
        this.getRolesDataOnInit();
      }
    });
  }

  getRolesDataOnInit() {
    if (this.selectedRoleId) {
      const roleId = Number(this.selectedRoleId);
      this.selectedRole = _.find(this.roleMasterList, (role: Roles) => {
        return role.id === roleId;
      });

      this.selectedApplication = _.find(this.applications, (o) => o.id === this.selectedRole.application_id);
      this.selectedRoleType = _.find(this.roleTypes, (roletype: RoleType) => {
        return roletype.id === this.selectedRole.type_id;
      });
      this.filterPermissionByAppID(this.selectedApplication);
      this.filterRoleTypeByAppID(this.selectedApplication);
      this.filterRolesByRoleType(this.selectedRoleType);
    }
    else {
      this.selectedRole = null;
      this.selectedRoleName = null;
    }
    this.setRole(this.selectedRole);
  }

  getApplicationMaster(): Observable<any> {
    return this.userService.getApplicationList().pipe(map(res => {
      this.applications = res.applications;
      return this.applications;
    }));
  }
  getModuleMaster(): Observable<any> {
    return this.userService.getModuleList().pipe(map(res => {
      this.modules = res.data;
      return this.modules;
    }));
  }
  getRoleTypes(): Observable<any> {
    return this.compInstance.userService.getRoleTypes().pipe(map(res => {
      this.roleTypes = res.role_types;
      return this.roleTypes;
    }),
      catchError(error => [])
    );
  }
  getRoleMasterList(): Observable<any> {
    return this.compInstance.userService.getRoleMasterList().pipe(map(res => {
      this.roleMasterList = _.sortBy(_.filter(res, (o) => o.is_active === true), 'name', 'asc');
      return this.roleMasterList;
    }),
      catchError(error => [])
    );
  }
  getMasterPermissions(roleid: number): Observable<any>  {
    return this.userService.getMasterPermissions(roleid).pipe(map(res => {
      this.permissionMaster = [...res.permissionMaster];
      return this.permissionMaster;
    }));
  }

  onApplicationChange($eventApplication) {
    console.log(JSON.stringify($eventApplication));
    this.filterPermissionByAppID($eventApplication);
    this.filterRoleTypeByAppID($eventApplication);
    this.selectedRoleType = null;
    this.selectedRoleName = null;
    this.onClear();
  }

  onClearApplication() {
    console.log('Application cleared');
  }

  filterPermissionByAppID(application: Applicationlist) {
    this.sourcePermissions = application ? _.filter(this.permissionMaster, { application_id: application.id }) : [];
  }
  filterRoleTypeByAppID(application: Applicationlist) {
    this.appRoleTypes = application ? _.filter(this.roleTypes, { application_id: application.id }) : [];
  }
  filterRolesByRoleType(filterbyRoleType?) {
      this.roles = _.filter(this.roleMasterList, (o) => {
        return o.application_id === this.selectedApplication.id
        && o.type_id === filterbyRoleType.id;
      });
      if (this.selectedRoleId) {
        const roleId = Number(this.selectedRoleId);
        this.selectedRole = _.find(this.roles, (role: Roles) => {
          return role.id === roleId;
        });

        this.selectedRoleType = _.find(this.roleTypes, (roletype: RoleType) => {
          return roletype.id === this.selectedRole.type_id;
        });
      }
      else {
        this.selectedRole = null;
        this.selectedRoleName = null;
      }
      this.setRole(this.selectedRole);
  }

  setRole(selectedRole: Roles) {
    if (selectedRole && typeof selectedRole === 'object') {
      this.isDisabled = false;
      this.setModelName(selectedRole);
      this.getAssingnedPermissionsByRoleId(selectedRole.id);
    } else {
      this.selectedRole = null;
      this.origionalDestinationPermission = [];
      this.destinationPermissions = [];
    }
  }

  getAssingnedPermissionsByRoleId(roleId: number) {
    this.userService.getAssingnedPermissionsByRoleId(roleId).subscribe(res => {
      this.origionalDestinationPermission = [...res.permissions];
      this.destinationPermissions = res.permissions;
    }, error => {
      console.log(`Problem while fetching permssions`);
    });
  }

  checkIfDestinationArrayIsChanged(): boolean {
    const isChanged = _.differenceWith(this.destinationPermissions, this.origionalDestinationPermission, _.isEqual);
    return isChanged.length > 0 ? true : false;
  }

  loadConfirmationPopup(newRole, previousRole) {
    const modalTitleobj = 'Change Detected';
    const modalBodyobj = 'You will lose the changes, do you want to continue ?';
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
        this.setRole(newRole);
      }
      if (result === 'cancel click') {
        this.setModelName(previousRole);
      }
    });
    modalInstance.componentInstance.messageDetails = messageDetails;
  }

  setModelName(role) {
    setTimeout(() => {
      this.selectedRole = role;
      this.selectedRoleName = role.name;
    });
  }

  onClear() {
    if (this.checkIfDestinationArrayIsChanged()) {
      this.loadConfirmationPopup(null, this.selectedRole);
    } else {
      this.isDisabled = true;
      this.setRole(null);
    }
  }

  onChange($event) {
    if (this.checkIfDestinationArrayIsChanged()) {
      this.loadConfirmationPopup($event, this.selectedRole);
    } else {
      this.setRole($event);
    }
  }

  onRoleTypeChange($event) {
    if ($event) {
      this.filterRolesByRoleType($event);
    } else {
      this.selectedRoleType = null;
      this.selectedRoleName = null;
      this.onClear();
    }

  }


  savePermissions() {
    this.userService.saveRolePermissions(this.selectedRole.id, this.destinationPermissions).subscribe(res => {
      if (res.status_message === 'Success') {
        this.origionalDestinationPermission = [...this.destinationPermissions];
        this.alertMsg = {
          message: 'Permissions saved Successfully.',
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
      // this.destinationPermissions = res.permissions;
    }, error => {
      console.log(`Error while saving Role Permissions ${error}`);
    });
  }

}

import { Provider } from './../shared/models/provider';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, Subject, Subscriber } from 'rxjs';
import { RoleType } from '../models/roletype';
import { DoctorCodes } from '../models/doctor-codes';
import { Applicationlist } from '../models/applicationlist';
import { Roles } from '../models/roles';
import { Specialities } from '../shared/models/specialities';
import { User } from '../models/user';
import { environment } from 'src/environments/environment';
import { map, filter } from 'rxjs/operators';
import { Department } from '../models/department';
import * as _ from 'lodash';
import { Permission } from '../models/permission';
import { PermissionsConstants } from 'src/app/shared/constants/PermissionsConstants';
import { AuthService } from './auth.service';
import { Designation } from '../models/designation.modal';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  isFromProfileEdit = false;
  isFromProfileEditSubject = new Subject<any>();
  public $subcIsFromProfileEditSubject = this.isFromProfileEditSubject.asObservable();
  titleMaster: any = null;
  roleTypeListMaster: any = [];
  docCodeListMaster: any = [];
  masterUserList: any[] = [];
  masterSpecialities: any[] = [];
  applicationListMaster: any[] = [];
  departmentMaster: any[] = [];
  specialitiesMaster: any[] = [];
  primaryRolesmaster: any[] = [];
  primaryRolesmasterCnt: any = null;
  roleMasterList: any[] = [];
  roleMasterByRoleType: any[] = [];
  permissionMaster: Array<Permission> = [];
  rolePermission: any;
  private userNavBarSubject = new Subject<any>();
  editedPageObject = { size: 15, totalElements: 0, totalPages: 10, pageNumber: 1 };
  userPermission: string[];
  assigenedApplication: any[] = [];

  public masterUserDetails: { userDetails?: any, userImage?: any } = {
    userDetails: null,
    userImage: null
  };
  public providerDetails = [{ userId: null, providers: Array<Provider>() }];

  constructor(
    private http: HttpClient,
    private authService: AuthService) { }

  sendCollapseValue(value: boolean) {
    this.userNavBarSubject.next({ collapseValue: value });
  }

  getCollapseValue(): Observable<any> {
    return this.userNavBarSubject.asObservable();
  }

  setEditedPageObject(value: any) {
    this.editedPageObject = value;
  }

  getEditedPageObject() {
    return this.editedPageObject;
  }

  getAssignedApplications(userId): Observable<any> {
    const url = environment.baseUrl + `/UserRegistration/getAssignedApplications?userid=${userId}`;
    if (this.assigenedApplication.length) {
      return of(this.assigenedApplication);
    } else  {
      return this.http.get(url).pipe(
        map((res: any) => {
          this.assigenedApplication = res['app_details'];
          const globals = JSON.parse(localStorage.getItem('globals'));
          globals.assigenedApplication = res['app_details'];
          localStorage.setItem('globals', JSON.stringify(globals));
          return res['app_details'];
        })
      );
    }
  }
  getUserList(param: any): Observable<any> {
    const reqUrl = environment.baseUrl + '/UserRegistration/getUserList';
    const userRegistModel = new User();
    const users: Array<User> = [];
    return this.http.post(reqUrl, param).pipe(
      map((res: any) => {
        if (res.user_list.length > 0) {
          res.user_list.forEach((obj, index) => {
            // check if object is valid. If valid generate.
            if (userRegistModel.isObjectValid(obj)) {
              // generate new object.
              userRegistModel.generateObject(obj);
              users.push(Object.assign({}, userRegistModel));
            }
          });
        }
        res.user_list = users;
        return res;
      })
    );
  }


  createUser(param: any): Observable<any> {
    const reqUrl = environment.baseUrl + '/UserRegistration/saveUser';
    const userRegistModel = new User();
    return this.http.post(reqUrl, param).pipe(
      map((res: any) => {
        return res;
      })
    );
  }
  updateUser(param: any): Observable<any> {
    const reqUrl = environment.baseUrl + '/UserRegistration/editUser';
    const userRegistModel = new User();
    return this.http.put(reqUrl, param).pipe(
      map((res: any) => {
        return res;
      })
    );
  }
  saveUserImage(param: any): Observable<any> {
    const reqUrl = environment.baseUrl + '/UserRegistration/SaveUserImage';
    return this.http.post(reqUrl, param).pipe(
      map((res: any) => {
        return res;
      })
    );
  }
  getUserImageById(userId, loginUser?): Observable<any> {
    const reqUrl = environment.baseUrl + '/UserRegistration/GetUserImage/' + userId;
    if (this.masterUserDetails && this.masterUserDetails.userImage && loginUser) {
      return of(this.masterUserDetails.userImage);
    }
    return this.http.get(reqUrl).pipe(
      map((res: any) => {
        if (loginUser) {
          this.masterUserDetails['userImage'] = res;
        }
        return res;
      })
    );
  }

  getSpecialities(param: any): Observable<any> {
    const reqUrl = environment.baseUrl + '/HISView/getSpecialties';
    const specialitiesModel = new Specialities();
    const specialitiesList: Array<Specialities> = [];
    return this.http.post(reqUrl, param).pipe(
      map((res: any) => {
        if (res.specialties === null) {
          res.specialties = [];
          return res;
        } else {
          res.specialties.forEach((obj, index) => {
            if (specialitiesModel.isObjectValid(obj)) {
              specialitiesModel.generateObject(obj);
              specialitiesList.push(Object.assign({}, specialitiesModel));
            }
          });
          this.specialitiesMaster = res;
          res.specialties = specialitiesList;
          return res;
        }
      })
    );
  }

  getPrimaryRoles(param: any): Observable<any> {
    // const reqUrl = environment.baseUrl + '/RoleMaster/getAllRoles';
    const reqUrl = `${environment.baseUrl}/RoleMaster/getRoles?type=${param.type}&&isPrimary=${param.isPrimary}`;
    const primaryRoleModel = new Roles();
    const primaryRoleList: Array<Roles> = [];
    if (this.primaryRolesmasterCnt !== null && !param.isPrimary) {
      return of(this.primaryRolesmaster);
    }
    return this.http.get(reqUrl).pipe(
      map((res: any) => {
        res.Roles.forEach((obj, index) => {
          if (primaryRoleModel.isObjectValid(obj)) {
            primaryRoleModel.generateObject(obj);
            primaryRoleList.push(Object.assign({}, primaryRoleModel));
          }
        });
        res.Roles = primaryRoleList;
        if (!param.isPrimary) {
          this.primaryRolesmaster = res;
          this.primaryRolesmasterCnt = res.Roles.length;
        }
        return res;
      })
    );
  }

  getTitles(): Observable<any> {
    const reqUrl = environment.baseUrl + '/TitleMaster/getTitles';
    if (this.titleMaster) {
      return of(this.titleMaster);
    } else {
      return this.http.get(reqUrl).pipe(
        map((res: any) => {
          this.titleMaster = res;
          return res;
        })
      );
    }
  }

  getApplicationList(): Observable<any> {
    const reqUrl = environment.baseUrl + '/UserRegistration/getApplicationList';
    const applicationModel = new Applicationlist();
    const applicationList: Array<Applicationlist> = [];
    if (this.applicationListMaster.length) {
      return of(this.applicationListMaster[0]);
    } else {
      return this.http.get(reqUrl).pipe(
        map((res: any) => {
          res.applications.forEach((obj, index) => {
            if (applicationModel.isObjectValid(obj)) {
              applicationModel.generateObject(obj);
              applicationList.push(Object.assign({}, applicationModel));
            }
          });
          res.applications = applicationList;
          this.applicationListMaster.push(res);
          return res;
        })
      );
    }
  }
  getRoleTypes(): Observable<any> {
    const reqUrl = environment.baseUrl + '/RoleMaster/getRoleTypes ';
    const roleTypeModel = new RoleType();
    const roleTypeList: Array<RoleType> = [];
    if (this.roleTypeListMaster.length) {
      return of(this.roleTypeListMaster[0]);
    } else {
      return this.http.get(reqUrl).pipe(
        map((res: any) => {
          res.role_types.forEach((obj, index) => {
            if (roleTypeModel.isObjectValid(obj)) {
              roleTypeModel.generateObject(obj);
              roleTypeList.push(Object.assign({}, roleTypeModel));
            }
          });
          res.role_types = roleTypeList;
          this.roleTypeListMaster.push(res);
          return res;
        })
      );
    }
  }
  getDoctorCodes(): Observable<any> {
    const reqUrl = environment.baseUrl + '/UserRegistration/getDoctorCodes';
    const docCodesModel = new DoctorCodes();
    const docCodeList: Array<DoctorCodes> = [];
    if (this.docCodeListMaster.length) {
      return of(this.docCodeListMaster[0]);
    } else {
      return this.http.get(reqUrl).pipe(
        map((res: any) => {
          res.doctor_codes.forEach((obj, index) => {
            if (docCodesModel.isObjectValid(obj)) {
              docCodesModel.generateObject(obj);
              docCodeList.push(Object.assign({}, docCodesModel));
            }
          });
          res.doctor_codes = docCodeList;
          this.docCodeListMaster.push(res);
          return res;
        })
      );
    }
  }

  getUserDataById(userId, loginUser?): Observable<any> {
    const appId = this.authService.getAppIdByAppKey('qms');
    const reqUrl = environment.baseUrl + '/UserRegistration/getUserById/' + userId + '/' + appId;
    if (this.masterUserDetails && this.masterUserDetails.userDetails && loginUser) {
      return of(this.masterUserDetails.userDetails);
    }
    return this.http.get(reqUrl).pipe(
      map((res: any) => {
        if (loginUser) {
          this.masterUserDetails['userDetails'] = res;
        }
        return res;
      })
    );
  }

  getDepartment(): Observable<any> {
    const reqUrl = environment.baseUrl + '/HisView/getDepartment';
    const departmentModel = new Department();
    const departmentList: Array<Department> = [];
    if (this.departmentMaster.length) {
      return of(this.departmentMaster[0]);
    } else {
      return this.http.get(reqUrl).pipe(
        map((res: any) => {
          res.Departments.forEach((obj, index) => {
            if (departmentModel.isObjectValid(obj)) {
              departmentModel.generateObject(obj);
              departmentList.push(Object.assign({}, departmentModel));
            }
          });
          res.Departments = departmentList;
          this.departmentMaster.push(res);
          return res;
        })
      );
    }
  }

  deleteUserById(userId): Observable<any> {
    const params = {
      user_id: userId
    };
    const reqUrl = environment.baseUrl + '/UserRegistration/deleteUser';
    return this.http.put(reqUrl, params).pipe(
      map((res: any) => {
        return res;
      })
    );
  }
  isExistLogin(param): Observable<any> {
    const reqUrl = `${environment.baseUrl}/UserIdentity/checkLoginId?login_name=${param}`;
    return this.http.get(reqUrl);
  }

  isExistEmail(param): Observable<any> {
    const reqUrl = `${environment.baseUrl}/UserIdentity/checkDuplicateEmail?email_id=${param}`;
    return this.http.get(reqUrl);
  }

  isExistPhoneNumebr(param): Observable<any> {
    const reqUrl = `${environment.baseUrl}/UserIdentity/checkDuplicateMobile?mobile_no=${param}`;
    return this.http.get(reqUrl);
  }
  getRoleMasterList(): Observable<any> {
    const reqUrl = environment.baseUrl + '/RoleMaster/getRoleList';
    const roleMastertModel = new Roles();
    const rolesMasterList: Array<Roles> = [];
    return this.http.get(reqUrl).pipe(
      map((res: any) => {
        res.allRolesDetails.forEach((obj, index) => {
          if (roleMastertModel.isObjectValid(obj)) {
            roleMastertModel.generateObject(obj);
            rolesMasterList.push(Object.assign({}, roleMastertModel));
          }
        });
        this.roleMasterList = rolesMasterList;
        return this.roleMasterList;
      })
    );
  }

  getRoleListByType(roleTypeId): Observable<any> {
    const reqUrl = ` ${environment.baseUrl}/RoleMaster/getAllRolesByType?role_type_id=${roleTypeId}`;
    const roleMastertModel = new Roles();
    const rolesMasterList: Array<Roles> = [];
    if (this.roleMasterByRoleType.length) {
      return of(this.roleMasterByRoleType);
    } else {
      return this.http.get(reqUrl).pipe(
        map((res: any) => {
          res.roles.forEach((obj, index) => {
            if (roleMastertModel.isObjectValid(obj)) {
              roleMastertModel.generateObject(obj);
              rolesMasterList.push(Object.assign({}, roleMastertModel));
            }
          });
          res.rolesList = rolesMasterList;
          this.roleMasterByRoleType = res;
          return res;
        })
      );
    }
  }

  getMasterPermissions(roleId: number): Observable<any> {
    const reqUrl = ` ${environment.baseUrl}/RolePermission/getUnAssignedPermissionByRoleId?roleId=-1`;
    if (this.permissionMaster.length > 0) {
      const res = { permissionMaster: [] };
      res.permissionMaster = this.permissionMaster;
      return of(res);
    } else {
      return this.http.get(reqUrl).pipe(
        map((res: any) => {
          _.forEach(res.UnAssignedRoles, (perm) => {
            const permission = new Permission();
            permission.generateObj(perm);
            this.permissionMaster.push(permission);
          });
          res.permissionMaster = this.permissionMaster;
          return res;
        })
      );
    }
  }

  getAssingnedPermissionsByRoleId(roleId: number): Observable<any> {
    const reqUrl = ` ${environment.baseUrl}/RolePermission/getAssignedPermissionByRoleId?role_id=${roleId}`;
    const permissions: Array<Permission> = [];
    return this.http.get(reqUrl).pipe(
      map((res: any) => {
        _.forEach(res.AssignedRoles, (perm) => {
          const permission = new Permission();
          permission.generateObj(perm);
          permissions.push(permission);
        });
        res.permissions = permissions;
        return res;
      })
    );
    // this.rolePermission = this.generateRolePermissions(roleId);
    // return of(this.rolePermission);
  }

  GetAssignedRolePermissionsByUserId_Promise(userId: number) {
    this.userPermission = [];
    return new Promise((resolve, reject) => {
      this.GetAssignedRolePermissionsByUserId(userId).subscribe(result => {
        resolve(this.userPermission);
      });
    });
  }

  GetAssignedRolePermissionsByUserId(userId: number): Observable<any> {
    const appId = this.authService.getAppIdByAppKey('qms');
    const reqUrl = ` ${environment.baseUrl}/RolePermission/GetAssignedRolePermissionsByUserId/${userId}/${appId}`;
    const permissions: Array<Permission> = [];
    return this.http.get(reqUrl).pipe(
      map((res: any) => {
        if (res.status_code == 200) {
          _.forEach(res.AssignedRoles.assigned_Permissions, (perm) => {
            const permission = new Permission();
            permission.generateObj(perm);
            permissions.push(permission);
          });
          _.forEach(res.AssignedRoles.additional_privilages, (perm) => {
            const permission = new Permission();
            permission.generateObj(perm);
            permissions.push(permission);
          });
        }
        let permissionKey = _.map(permissions, (o) => { return o.name });
        permissionKey.push(PermissionsConstants.USER_MGMT_MENU);
        permissionKey.push(PermissionsConstants.QMS_APP_MENU);
        permissionKey.push(PermissionsConstants.DEVLOPMENT_PERMISSION);
        this.userPermission = permissionKey;
        return permissions;
      })
    );
    // this.rolePermission = this.generateRolePermissions(roleId);
    // return of(this.rolePermission);
  }

  // generateRolePermissions(roleId): RolePermission {
  //   const rolePermission: RolePermission = new RolePermission();
  //   const permissions: Array<Permission> = new Array<Permission>();
  //   let j;
  //   for (j = 1; j < 3; j++) {
  //     const permission: Permission = new Permission();
  //     permission.id = j;
  //     permission.application_id = 1;
  //     permission.name = `Permission role ${roleId} permission ${j}`;
  //     permissions.push(permission);
  //   }
  //   rolePermission.id = roleId;
  //   rolePermission.permission = permissions;
  //   return rolePermission;
  // }

  // generateMasterPermissions(): Array<Permission> {
  //   const permissions: Array<Permission> = new Array<Permission>();
  //   let j;
  //   for (j = 11; j < 70; j++) {
  //     const permission: Permission = new Permission();
  //     permission.id = j;
  //     permission.application_id = Math.floor(j / 10);
  //     permission.name = `Permission role permission ${j}`;
  //     permissions.push(permission);
  //   }
  //   return permissions;
  // }

  createRole(param: any): Observable<any> {
    const reqUrl = environment.baseUrl + '/RoleMaster/saveRole';
    const roleMastertModel = new Roles();
    const newobject = {
      role_id: param.id ? param.id : 0,
      role_name: param.role_name,
      role_is_primary: param.role_is_primary,
      role_type_id: param.role_type_id,
      role_type_name: param.role_type_name,
      is_active: param.is_active,
      is_used: '',
      role_application_id:param.role_application_id
    };
    return this.http.post(reqUrl, param).pipe(
      map((res: any) => {
        const index = _.findIndex(this.roleMasterList, (rec) => rec.id === param.id);
        if (roleMastertModel.isObjectValid(newobject)) {
          if (index !== -1) {
            newobject.is_used = this.roleMasterList[index].is_used;
            roleMastertModel.generateObject(newobject);
            this.roleMasterList[index] = roleMastertModel;
          } else {
            roleMastertModel.generateObject(newobject);
            roleMastertModel.id = res.id;
            this.roleMasterList.push(Object.assign({}, roleMastertModel));
          }
          res.masterRoelList = this.roleMasterList;
          return res;
        }
      })
    );
  }

  isExistRoleName(param): Observable<any> {
    const reqUrl = environment.baseUrl + '/UserIdentity/checkDuplicateRoleName';
    const paramVaue = { role_name: param };
    return this.http.post(reqUrl, paramVaue).pipe(map((res: any) => {
      return res;
    })
    );
  }

  deleteRoleById(roleId): Observable<any> {
    const reqUrl = environment.baseUrl + '/RoleMaster/deleteRole/' + roleId;
    return this.http.delete(reqUrl).pipe(
      map((res: any) => {
        if (res.status_code === 200) {
          const index = _.findIndex(this.roleMasterList, (rec) => rec.id === roleId);
          if (index !== -1) {
            this.roleMasterList.splice(index, 1);
          }
        }
        res.masterRoelList = this.roleMasterList;
        return res;
      })
    );
  }
  userStatusActiveOrDeactive(param: any): Observable<any> {
    const reqUrl = environment.baseUrl + '/UserIdentity/activeOrDeactiveUser/';
    return this.http.put(reqUrl, param).pipe(
      map((res: any) => {
        return res;
      })
    );
  }
  saveRolePermissions(roleId: number, permissions: Array<Permission>) {
    const reqUrl = environment.baseUrl + '/RolePermission/saveRolePermissions';
    const userRegistModel = new User();
    const param = {
      role_id: roleId,
      role_permissions: []
    };
    _.forEach(permissions, (per: Permission) => {
      const permission = { permission_id: per.id, application_id: per.application_id };
      param.role_permissions.push(permission);
    });
    return this.http.post(reqUrl, param).pipe(
      map((res: any) => {
        return res;
      })
    );
  }
  isUserLoggedIn(userId): Observable<any> {
    const params = {
      user_id: userId
    };
    const reqUrl = environment.baseUrl + '/UserIdentity/checkLoggedInUser';
    return this.http.post(reqUrl, params).pipe(
      map((res: any) => {
        return res;
      })
    );
  }

  fromProfileUserEditFlag(flag: boolean, userId: number) {
    const obj = { isFromProfileEdit: flag, user_id: userId }
    this.isFromProfileEdit = flag;
    this.isFromProfileEditSubject.next(obj);
  }

  getProfileUserEditFlag(): Observable<any> {
    return this.isFromProfileEditSubject.asObservable();
  }

  getAllPatientList(param): Observable<any> {
    const reqUrl = environment.baseUrlAppointment + '/Patient/getPatientAllList';
    const obj = {
      limit: param.limit_per_page,
      current_page: param.current_page,
      is_active: param.showActivePatient,
      sort_order: param.sort_order,
      sort_column: param.sort_column,
      search_text: param.searchString,
      advanced_search: param.advanced_search
    };
    return this.http.post(reqUrl, obj).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.patient_details.length > 0) {
          return { listData: res.patient_details, totalCount: res.total_records };
        } else {
          return { listData: [], totalCount: 0 };
        }
      })
    );
  }
  SendBulkMailAndSmsToPatient(param): Observable<any> {
    const reqUrl = environment.baseUrlAppointment + '/Patient/SendBulkMailAndSmsToPatient';
    const obj = {
      is_active: param.is_active,
      search_text: param.search_text,
      template_id: param.template_id,
      is_select_all: param.is_select_all,
      selected_patient_ids: param.selected_patient_ids,
      deselected_patient_ids: param.deselected_patient_ids,
      advanced_search: param.advanced_search
    };
    return this.http.post(reqUrl, obj).pipe(
      map((res: any) => {
        return res;
      })
    );
  }

  getProviderDetailsByEntity(entiyId, entityValueId): Observable<any> {
    const params = {
      entity_id: entiyId,
      entity_value_id: entityValueId
    };
    const reqUrl = environment.baseUrl + '/userIdentity/getProviderDetailsByConfig';
    const userProviders = this.providerDetails.find(res => res.userId === entityValueId);
    if (userProviders && userProviders.providers.length > 0) {
      return of(userProviders.providers);
    }
    return this.http.post(reqUrl, params).pipe(
      map((res: any) => {
        const objUserProvider = {
          userId: entityValueId,
          providers: Array<Provider>()
        };
        if (res.provider_details.length > 0) {
          res.provider_details.forEach((obj) => {
            const objProvider = {
              providerId: obj.entity_id,
              providerTypeName: obj.entity_name,
              providerType: obj.entity_alias,
              providerValueId: obj.entity_value_id,
              providerName: obj.entity_value_name
            };
            objUserProvider.providers.push(objProvider);
          });
        }
        this.providerDetails.push(objUserProvider);
        return objUserProvider.providers;
      })
    );
  }

  getUserDesignation(param: any): Observable<any> {
    // const reqUrl = environment.baseUrl + '/RoleMaster/getAllRoles';
    const reqUrl = `${environment.baseUrl}/RoleMaster/getUserDesignationList?role_id=${param.type}`;
    const designation = new Designation();
    const designationList: Array<Designation> = [];
    return this.http.get(reqUrl).pipe(
      map((res: any) => {
        res.userDesg.forEach((obj, index) => {
          designation.generateObject(obj);
          designationList.push(Object.assign({}, designation));
        });
        res.userDesg = designationList;
        return res;
      })
    );
  }

}

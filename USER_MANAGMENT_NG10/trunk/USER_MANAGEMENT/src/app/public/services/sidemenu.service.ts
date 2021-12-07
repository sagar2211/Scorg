
import { Injectable, Output, EventEmitter } from '@angular/core';
import { PermissionsConstants } from 'src/app/config/PermissionsConstants';

@Injectable({
  providedIn: 'root'
})
export class SideMenuService {

  constructor(
  ) { }

  sideMenuList = [
    {
      linkKey: 'users',
      name: 'Users',
      isActive: false,
      cssClass: 'icon-queue',
      title: 'Queue',
      permission: [PermissionsConstants.View_UserMaster,
      PermissionsConstants.Add_UserMaster,
      PermissionsConstants.View_Mapped_Doctor_List],
      children: [
        {
          linkKey: 'userList',
          name: 'User List',
          isActive: false,
          isFavourite: false,
          cssClass: 'icon-list',
          isVisible: true,
          permission: PermissionsConstants.View_UserMaster
        },
        {
          linkKey: 'userRegistration',
          name: 'User Registration',
          cssClass: 'icon-registration',
          title: 'User Registration',
          isVisible: true,
          permission: PermissionsConstants.Add_UserMaster
        },
        {
          linkKey: 'userServiceCenterMapping',
          name: 'User Service Center Mapping',
          cssClass: 'icon-registration',
          title: 'User Service Center Mapping',
          isVisible: true,
          permission: PermissionsConstants.Add_UserMaster
        },
        {
          linkKey: 'casePaperValidity',
          name: 'Case Paper Validity',
          cssClass: 'icon-registration',
          title: 'Case Paper Validity',
          isVisible: true,
          permission: PermissionsConstants.Add_UserMaster
        },
        {
          linkKey: 'mapping/mappeddoctorlist',
          name: 'Doctor Mappings',
          isActive: false,
          isFavourite: false,
          cssClass: 'icon-user-md',
          isVisible: true,
          permission: PermissionsConstants.View_Mapped_Doctor_List
        },
        {
          linkKey: 'mapping/doctormapping',
          name: 'Add new mapping',
          isActive: false,
          isFavourite: false,
          cssClass: 'icon-front-desk',
          isVisible: false,
          permission: PermissionsConstants.Add_Doctor_Mapping
        },
        // {
        //   linkKey: 'sectionList',
        //   name: 'Front Desk Entity Mappings',
        //   isActive: false,
        //   isFavourite: false,
        //   cssClass: 'icon-front-desk'
        // },
      ]
    },
    {
      linkKey: 'roles',
      name: 'Roles',
      isActive: false,
      cssClass: 'icon-address-card',
      title: 'Roles',
      permission: [PermissionsConstants.View_RoleMaster,
      PermissionsConstants.View_RolePermission],
      children: [
        {
          linkKey: 'roleAndPermission/role',
          name: 'Role List',
          isActive: false,
          isFavourite: false,
          cssClass: 'icon-list',
          isVisible: true,
          permission: PermissionsConstants.View_RoleMaster
        },
        {
          linkKey: 'roleAndPermission/managePermissions',
          name: 'Permissions',
          isActive: false,
          isFavourite: false,
          cssClass: 'icon-lock',
          isVisible: true,
          permission: PermissionsConstants.View_RolePermission
        },
      ]
    },
    {
      linkKey: 'certificateApp',
      name: 'Templates',
      isActive: false,
      cssClass: 'icon-address-card',
      title: 'Templates',
      permission: [PermissionsConstants.View_RoleMaster,
      PermissionsConstants.View_RolePermission],
      children: [
        {
          linkKey: 'certificateApp/templates',
          name: 'Templates',
          isActive: false,
          isFavourite: false,
          cssClass: 'icon-list',
          isVisible: true,
          permission: PermissionsConstants.View_RoleMaster
        },
      ]
    }

  ];
}

import { Directive, AfterViewInit, ElementRef, OnInit, Input, Renderer2, SimpleChanges, OnChanges } from '@angular/core';
import { NgxPermissionsService } from 'ngx-permissions';
import { PermissionsConstants } from '../constants/PermissionsConstants';
import * as _ from 'lodash';


@Directive({
  selector: '[appSohwhideElementOnPermission]'
})
export class SohwhideElementOnPermissionDirective implements OnInit, OnChanges {
  @Input() currentActiveUrl: string;
  @Input() typeOfButton: string;
  constructor(
    private element: ElementRef,
    private renderer: Renderer2,
    private ngxPermissionsService: NgxPermissionsService
  ) { }

  ngOnInit() {
    this.isPermisionExist();
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.currentActiveUrl) {
      this.isPermisionExist();
    }
  }
  isPermisionExist() {
    if (this.currentActiveUrl === 'searchAppointment' || this.currentActiveUrl === 'patientList') { // add patient
      this.AddRemoveElementStyle(this.ngxPermissionsService.getPermission(PermissionsConstants.Add_PatientMaster));
    } else if (this.currentActiveUrl === 'role') { // add role
      this.AddRemoveElementStyle(this.ngxPermissionsService.getPermission(PermissionsConstants.Add_RoleMaster));
    } else if (this.currentActiveUrl === 'qList') { // qlist
      if (this.typeOfButton === 'dropdown-toggle') {
        this.element.nativeElement.disabled = _.isUndefined(this.ngxPermissionsService.getPermission(PermissionsConstants.Queue_Extend_Hour)) &&
          _.isUndefined(this.ngxPermissionsService.getPermission(PermissionsConstants.Queue_Print)) &&
          _.isUndefined(this.ngxPermissionsService.getPermission(PermissionsConstants.Queue_Delay_Notification)) ? true : false;
      } else if (this.typeOfButton === 'Add') {
        this.element.nativeElement.disabled = _.isUndefined(this.ngxPermissionsService.getPermission(PermissionsConstants.Queue_Book_Appointment))
      }
    } else if (this.currentActiveUrl === 'entitySettings' && _.isUndefined(this.ngxPermissionsService.getPermission(PermissionsConstants.Manage_Calendar_addblockSetting)) &&
      _.isUndefined(this.ngxPermissionsService.getPermission(PermissionsConstants.Manage_Calendar_addholidaySetting))) {
      this.element.nativeElement.style.display = 'none';
    } else if (this.currentActiveUrl === 'userList') {
      this.AddRemoveElementStyle(this.ngxPermissionsService.getPermission(PermissionsConstants.Add_UserMaster));
    } else if (this.currentActiveUrl === 'mappeddoctorlist') {
      this.AddRemoveElementStyle(this.ngxPermissionsService.getPermission(PermissionsConstants.Add_Doctor_Mapping));
    } else if (this.currentActiveUrl === 'frontDeskentityMapping') {
      this.AddRemoveElementStyle(this.ngxPermissionsService.getPermission(PermissionsConstants.Add_Front_Desk_Entity_Mapping));
    } else if (this.currentActiveUrl === 'activeScheduleList') {
      this.AddRemoveElementStyle(this.ngxPermissionsService.getPermission(PermissionsConstants.Add_Schedule));
    } else if (this.currentActiveUrl === 'updateTimeSchedule') {
      this.element.nativeElement.disabled = _.isUndefined(this.ngxPermissionsService.getPermission(PermissionsConstants.Schedule_Time_Delete)) &&
        _.isUndefined(this.ngxPermissionsService.getPermission(PermissionsConstants.Schedule_Time_Extend)) &&
        _.isUndefined(this.ngxPermissionsService.getPermission(PermissionsConstants.Schedule_Time_End)) &&
        _.isUndefined(this.ngxPermissionsService.getPermission(PermissionsConstants.Schedule_Time_Add_New_Time_Slot)) &&
        _.isUndefined(this.ngxPermissionsService.getPermission(PermissionsConstants.Schedule_Time_Edit))
        ? true : false;
    } else if (this.currentActiveUrl === 'templateMapping') {
      this.AddRemoveElementStyle(this.ngxPermissionsService.getPermission(PermissionsConstants.Add_Template_Mapping));
      // if(this.typeOfButton === 'Edit') {
      //   this.element.nativeElement.disabled = _.isUndefined(this.ngxPermissionsService.getPermission(PermissionsConstants.Update_Template_Mapping));
      // }
    } else if (this.currentActiveUrl === 'templates') {
      this.AddRemoveElementStyle(this.ngxPermissionsService.getPermission(PermissionsConstants.Add_Templates));
    } else if (this.currentActiveUrl === 'sectionList') {
      this.AddRemoveElementStyle(this.ngxPermissionsService.getPermission(PermissionsConstants.Add_Section_Master));
    } else if (this.currentActiveUrl === 'roomSectionMapList') {
      this.AddRemoveElementStyle(this.ngxPermissionsService.getPermission(PermissionsConstants.Add_Room_Section_Mapping));
    } else if (this.currentActiveUrl === 'roomList') {
      this.AddRemoveElementStyle(this.ngxPermissionsService.getPermission(PermissionsConstants.Add_Room_Master));
    } else if (this.currentActiveUrl === 'entityRoomMapList') {
      this.AddRemoveElementStyle(this.ngxPermissionsService.getPermission(PermissionsConstants.Add_Room_Entity_Mapping));
    } else if (this.currentActiveUrl === 'locationList') {
      this.AddRemoveElementStyle(this.ngxPermissionsService.getPermission(PermissionsConstants.Location_Master_Add));
    }
  }
  AddRemoveElementStyle(permissions) {
    this.element.nativeElement.style.display = permissions && permissions.name ? 'inline-block' : 'none';
  }
}

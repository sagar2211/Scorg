import { Component, OnInit } from '@angular/core';
import { IAlert } from 'src/app/models/AlertMessage';
import { CommonService } from 'src/app/services/common.service';
import { PermissionsConstants } from 'src/app/shared/constants/PermissionsConstants';
import * as _ from 'lodash';
@Component({
  selector: 'app-appointment-status-display-name.component',
  templateUrl: './appointment-status-display-name.component.html',
  styleUrls: ['./appointment-status-display-name.component.scss']
})
export class AppointmentStatusDisplayNameComponent implements OnInit{
  alertMsg: IAlert;
  appointmentStatusList:any=[];
  PermissionsConstantsList = PermissionsConstants;
  updateStatusName=[];
  constructor(
    private commonService:CommonService
  ) {   }

  ngOnInit() {
    this.getAppointmentStatusDisplayNameSetting();
  }


  storeUpdatedData(id,name){
    let statusObject ={};
    let presentFlag:boolean=false;
    statusObject['status_id']=id;
    statusObject['display_name']=name;
    if(this.updateStatusName.length>0){
      this.updateStatusName.forEach(status=>{
        if(status.status_id == id){
          status.display_name= name;
          presentFlag=true;
        } 
      })
    } else {
      this.updateStatusName.push(statusObject);
    }
    if(presentFlag==false && this.updateStatusName.length>0){
      this.updateStatusName.push(statusObject);
    }
  }

  updateAppointmentStatusDisplayNameSetting(){
    if(this.updateStatusName.length>0) {
    this.updateStatusName = _.uniq(this.updateStatusName, function(p){ return p.status_id; });
    this.commonService.updateAppointmentStatusDisplayNameSetting(this.updateStatusName).subscribe(res=>{
      if (res != null && res === 'Success') {
        this.alertMsg = {
          message: 'Appointment Status Display Name Updated successfully.',
          messageType: 'success',
          duration: 3000
        };
      } else {
        this.alertMsg = {
          message: 'Somthing went wrong!',
          messageType: 'danger',
          duration: 3000
        };
      
      }
    })
  }
  }

  getAppointmentStatusDisplayNameSetting(){
    this.commonService.getAppointmentStatusDisplayNameSetting().subscribe(response=>{
      if(response){
        this.appointmentStatusList = response.AppointmentStatusMaster_Data;
      }
    })
  }
}

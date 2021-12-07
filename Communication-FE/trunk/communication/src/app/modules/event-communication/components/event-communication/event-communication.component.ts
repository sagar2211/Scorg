import { Component, OnInit, ViewChild } from "@angular/core";
import { DatatableComponent } from "@swimlane/ngx-datatable";
import { ActivatedRoute } from '@angular/router';
import { IAlert } from 'src/app/public/models/AlertMessage';
import { TemplatesService } from 'src/app/modules/communication/services/templates.service';
import { CommonService } from 'src/app/public/services/common.service';
import { PermissionsConstants } from 'src/app/config/PermissionsConstants';
import * as _ from 'lodash';

@Component({
  selector: "app-event-communication",
  templateUrl: "./event-communication.component.html",
  styleUrls: ["./event-communication.component.scss"]
})
export class EventCommunicationComponent implements OnInit {
  @ViewChild(DatatableComponent, { static: false })
  public table: DatatableComponent;
  template = [];
  email_ids: number[] = [];
  sms_ids: number[] = [];
  whatsApp_ids: number[] = [];
  notification_ids: number[] = [];
  objectArray = [];
  id: number;
  pageSize: number;
  externalPaging: boolean;
  alertMsg: IAlert;
  permissionDetails: any = [];
  applicationsData: any;
  applicationId = 1;
  eventUserType: any;
  eventId: any;
  eventUserTypeId: any;
  eventData: any;
  eventCategoryName: any;
  originalEventArray: any;
  templateData: any;
  updatedArray = [];
  eventDataClone: any;

  constructor(
    private tempalteService: TemplatesService,
    private commonService: CommonService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.commonService.routeChanged(this.route);
    this.permissionDetails = PermissionsConstants;
    this.loadApplicationData();
  }

  loadApplicationData() {
    const param = {
      SearchKeyword: ''
    }
    this.commonService.getApplicationData(param).subscribe((response) => {
      this.applicationsData = response;
    })
  }

  getUserTypeData(evt?) {
    this.template = [];
    const param = {
      eventCategoryId: evt ? evt.eventCategoryId : 0
    };
    this.tempalteService.getEventUserListByCategoryId(param).subscribe(result => {
      this.eventUserType = result;
    });
  }

  changeTemplate(field, event, categoryIndx, i){
    if(event){
      this.eventData[0].catData[categoryIndx].userData[i].templateId = event.template_id;
      this.eventData[0].catData[categoryIndx].userData[i].template_isactive = event.template_isactive;
    } else {
      this.eventData[0].catData[categoryIndx].userData[i].templateId = 0;
      this.eventData[0].catData[categoryIndx].userData[i].template_isactive = false;
      this.eventData[0].catData[categoryIndx].userData[i].isSendEmail = false;
      this.eventData[0].catData[categoryIndx].userData[i].isSendSms = false;
      this.eventData[0].catData[categoryIndx].userData[i].isSendWhatsapp = false;
    }
    this.updateArray();
  }

  catchSms(eventStatus, categoryIndx, i) {
    this.eventData[0].catData[categoryIndx].userData[i].isSendSms = eventStatus;
    this.updateArray();
  }

  catchWhatsApp(eventStatus, categoryIndx, i) {
    this.eventData[0].catData[categoryIndx].userData[i].isSendWhatsapp = eventStatus;
    this.updateArray();
  }

  catchEmail(eventStatus, categoryIndx, i) {
    this.eventData[0].catData[categoryIndx].userData[i].isSendEmail = eventStatus;
    this.updateArray();
  }

  catchNotification(eventStatus, categoryIndx, i) {
    this.eventData[0].catData[categoryIndx].userData[i].isSendNotification = eventStatus;
    this.updateArray();
  }

  updateArray() {
    this.updatedArray = [];
    _.map(this.eventData,itr=>{
      _.map(itr.catData,itr2=>{
        _.map(itr2.userData,loop=>{
          const obj ={
            categoryId: loop.categoryId,
            recepientTypeId: loop.userTypeId,
            eventId: loop.eventId,
            isSendSms: loop.isSendSms,
            isSendEmail: loop.isSendEmail,
            isSendWhatsapp: loop.isSendWhatsapp,
            isSendNotification: loop.isSendNotification,
            templateId: loop.templateId ? loop.templateId : null,
            template_isactive: loop.template_isactive
          }
          this.updatedArray.push(obj);
        })
      })
    })
  }

  updateObject() {
    const chkIndx = this.objectArray.findIndex(d => {
      return d.category_id === this.id;
    });
    const object = {
      category_id: this.eventId,//this.id,
      email_active_eventid: [...this.email_ids],
      sms_active_eventid: [...this.sms_ids],
      whatsapp_active_eventid: [...this.whatsApp_ids],
      notification_active_eventid: [...this.notification_ids],
    };
    if (chkIndx === -1) {
      this.objectArray.push(object);
    } else {
      this.objectArray[chkIndx] = object;
    }
  }

  

  onEventChange(evt) {
    if(evt){
      this.eventId=evt.eventCategoryId;
      this.eventUserTypeId = null;
      this.eventData = null;
      this.eventCategoryName = evt.eventCategoryName;
      this.getUserTypeData(evt);
      this.getEventTemplateByCategoryId();
      const param = {
        category_id: this.eventId,
        eventUserTypeId: this.eventUserTypeId ? this.eventUserTypeId : 0,
        eventCategoryName : this.eventCategoryName
      }
      this.getEventByUserTypeId(param);
    } else {
      this.eventUserTypeId = null;
      this.eventData = null;
    }
    
  }

  onEventUserTypeChange(evt) {
    if(evt){
      const param = {
        category_id: this.eventId,
        eventUserTypeId: this.eventUserTypeId
      }
      this.getEventByUserTypeId(param)
    } else {
      this.eventUserTypeId = null;
      const param = {
        category_id: this.eventId,
        eventUserTypeId: this.eventUserTypeId ? this.eventUserTypeId : 0
      }
      this.getEventByUserTypeId(param)
    }
    
  }

  getEventTemplateByCategoryId(){
    const param = {
      categoryId: this.eventId
    }
    this.tempalteService.getEventTemplateByCategoryId(param).subscribe((response)=>{
      this.templateData = response;
    })
  }

  getEventByUserTypeId(param) {
    this.tempalteService.getEventByUserTypeId(param).subscribe(response => {
      this.originalEventArray = response;
      const categoryWiseList = _.groupBy(response, 'categoryName');
      const eventData = [];
      _.map(categoryWiseList, (catVal, catKey) => {
        var catObj = { category_name: catKey, catData: [] };
        var userTypeGrp = _.groupBy(catVal, 'userTypeName');
        _.map(userTypeGrp, (userTypeVal, userTypeKey) => {
          _.map(userTypeVal,itration=>{
            itration.template_isactive = false;
            if(itration.templateId === 0){
              itration.templateId = null;
            }
          })
          var obj1 = {
            userTypeId : userTypeVal[0].userTypeId,
            userTypeName: userTypeKey,
            userData: userTypeVal
          }
          catObj.catData.push(obj1);
        });
        eventData.push(catObj);
        
      })
      this.eventData = eventData;
      this.eventDataClone = _.cloneDeep(eventData);
      this.filteredData(param);
      
      if(this.eventId){
        this.updateArray();
        this.updateObject();
      }
      
    });
  }

  filteredData(param){
    if(param.eventUserTypeId !== 0){
      const data =_.map(this.eventDataClone,itr=>{
        const filteredData = _.filter(itr.catData,itration=>{
          return param.eventUserTypeId === itration.userTypeId;
        })
        this.eventData[0].catData = _.cloneDeep(filteredData);
      })
    } else {
      this.eventData = this.eventDataClone;
    }
   
  }


  updateData() {
    // _.map(this.)
    this.tempalteService
      .updateEventCommunicationFlag(this.updatedArray)
      .subscribe(res => {
        if (res.status_code === 200) {
          // this.objectArray = [];
          
          this.alertMsg = {
            message: " Setting Updated Successfully.",
            messageType: "success",
            duration: 3000
          };
          // this.getUserTypeData();
        }
      });
  }
}

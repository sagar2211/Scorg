import { Injectable } from '@angular/core';
import * as moment from 'moment';
import * as _ from 'lodash';
import { Subject, Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Room } from '../models/room.model';
import { Section } from '../models/section.model';

@Injectable({
  providedIn: 'root'
})
export class RoomMasterService {

  constructor(
    private http: HttpClient,
  ) { }

  getAllRoomMasterList(param): Observable<any> {
    const reqUrl = environment.baseUrlAppointment + '/QueueMaster/getRoomMasterList';
    const obj = {
      limit: param.limit_per_page,
      current_page: param.current_page,
      search_text: param.searchString,
      sort_order: param.sort_order,
      sort_column: param.sort_column,
      is_active: param.showActiveRoom
    };
    return this.http.post(reqUrl, obj).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.roomMasterList.length > 0) {
          const data = [];
          _.map(res.roomMasterList, (val, key) => {
            data.push(this.generateRoomModel(val));
          });
          return { roomData: data, totalCount: res.total_records };
        } else {
          return { roomData: [], totalCount: 0 };
        }
      })
    );
  }

  getAllRoomSectionMappingList(param): Observable<any> {
    const reqUrl = environment.baseUrlAppointment + '/QueueMaster/getRoomSectionMappingList';
    const obj = {
      limit_per_page: param.limit_per_page,
      current_page: param.current_page,
      search_by: param.searchString,
      sort_order: param.sort_order,
      sort_column: param.sort_column,
      searchCondition: {
        room_Id: 0
      }
    };
    return this.http.post(reqUrl, obj).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.status_message === 'Success' && res.room_SectionMapping_Details.length > 0) {
          const data = [];
          _.map(res.room_SectionMapping_Details, (val, key) => {
            data.push(this.generateRoomSectiondata(val));
          });
          return { mapData: data, totalCount: res.total_records };
        } else {
          return { mapData: [], totalCount: 0 };
        }
      })
    );
  }

  saveRoomMasterData(param): Observable<any> {
    let reqUrl = environment.baseUrlAppointment + '/QueueMaster/saveRoomMaster';
    let method = 'post';
    const obj = {
      room_name: param.name,
      room_location_id: param.location.id,
      room_isactive: true
    };
    if (param.id) {
      obj['room_id'] = param.id;
      method = 'put';
      reqUrl = environment.baseUrlAppointment + '/QueueMaster/editRoomMaster';
    }
    return this.http[method](reqUrl, obj).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.status_message === 'Success') {
          return res.message;
        } else {
          return false;
        }
      })
    );
  }

  getRoomSectionMasterAllList(param): Observable<any> {
    const reqUrl = environment.baseUrlAppointment + '/QueueMaster/getRoomSectionMasterAllList';
    const obj = {
      Limit: param.limit_per_page,
      current_page: param.current_page,
      search_text: param.searchString,
      sort_Order: param.sort_order,
      Sort_Column: param.sort_column,
      is_active: param.showActiveRoom
    };
    return this.http.post(reqUrl, obj).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.roomSectionMasterList.length > 0) {
          // const data = [];
          // _.map(res.roomSectionMasterList, (val, key) => {
          //   data.push(this.generateSectionModel(val));
          // });
          return { sectionData: res.roomSectionMasterList, totalCount: res.total_records };
        } else {
          return { sectionData: [], totalCount: 0 };
        }
      })
    );
  }

  getAllSectionMaster(param): Observable<any> {
    const reqUrl = environment.baseUrlAppointment + '/QueueMaster/getRoomSectionMasterList';
    const reqParam = {
      limit: param.limit,
      search_text: param.search_text || undefined,
    };
    return this.http.post(reqUrl, reqParam).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.status_message === 'Success' && res.RoomSectionMasterList.length > 0) {
          const data = [];
          _.map(res.RoomSectionMasterList, (val, key) => {
            data.push(this.generateSectionModel(val));
          });
          return data;
        } else {
          return [];
        }
      })
    );
  }

  getAllRoomMaster(param): Observable<any> {
    const reqUrl = environment.baseUrlAppointment + '/QueueMaster/getRoomMasterData';
    const reqParam = {
      limit: param.limit,
      search_text: param.search_text || undefined,
    };
    return this.http.post(reqUrl, reqParam).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.roomMasterList.length > 0) {
          const data = [];
          _.map(res.roomMasterList, (val, key) => {
            data.push(this.generateRoomModel(val));
          });
          return data;
        } else {
          return [];
        }
      })
    );
  }

  generateSectionModel(val) {
    const section = new Section();
    if (section.isObjectValid(val)) {
      section.generateObject(val);
      return section;
    }
  }

  generateRoomModel(val) {
    const room = new Room();
    if (room.isObjectValid(val)) {
      room.generateObject(val);
      return room;
    }
  }

  getRoomSectionMappingData(id, sectionId): Observable<any> {
    const reqUrl = `${environment.baseUrlAppointment}/QueueMaster/getRoomSectionMappingData?Id=${id}&room_section_id=${sectionId}`;
    return this.http.get(reqUrl).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.RoomSectionMappingDetails) {
          return this.generateRoomSectionMasterObj(res.RoomSectionMappingDetails);
        } else {
          return {};
        }
      })
    );
  }

  generateRoomSectionMasterObj(val) {
    const returnobj = {
      formId: val.rsm_id || null,
      sectionName: val.section_name || null,
      sectionId: val.room_section_id || null,
      roomData: []
    };
    _.map(val.roomdata, (v) => {
      returnobj.roomData.push(this.generateRoomModel(v));
    });
    return returnobj;
  }

  saveRoomSectionMapping(param): Observable<any> {
    const reqUrl = environment.baseUrlAppointment + '/QueueMaster/addEditRoomSectionMapping';
    const saveData = [];
    _.map(param, (v) => {
      saveData.push(this.generateSaveMapScRoomList(v));
    });
    return this.http.post(reqUrl, saveData).pipe(
      map((res: any) => {
        if (res.status_code === 200) {
          return true;
        } else {
          return false;
        }
      })
    );
  }

  generateSaveMapScRoomList(val) {
    return {
      id: val.formId ? val.formId : 0,
      section_id: val.section.id,
      room_id: _.map(val.roomList, (v) => {
        return v.id;
      })
    };
  }

  // generateEditMapScRoomList(val) {
  //   return {
  //     Id: val.formId,
  //     section_id: val.section.id,
  //     room_data: _.map(val.roomList, (v) => {
  //       return {v.id};
  //     })
  //   };
  // }

  saveRoomSectionMasterData(param): Observable<any> {
    let reqUrl = environment.baseUrlAppointment + '/QueueMaster/saveRoomSectionMaster';
    let method = 'post';
    const obj = {
      rsm_name: param.name,
      rsm_remark: param.remark,
      rsm_isactive: param.isActive,
      rsm_displaytype: null,
      rsm_displayip: null,
      rsm_templatetype: param.selected_template,
      rsm_fieldsetting_json: JSON.stringify(param.jsonData)
    };
    if (param.id) {
      obj['rsm_id'] = param.id;
      method = 'put';
      reqUrl = environment.baseUrlAppointment + '/QueueMaster/editRoomSectionMaster';
    }
    return this.http[method](reqUrl, obj).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.status_message === 'Success') {
          return true;
        } else {
          return false;
        }
      })
    );
  }

  getRoomSectionMasterDataById(id): Observable<any> {
    const reqUrl = `${environment.baseUrlAppointment}/QueueMaster/getRoomSectionMasterDataById?Rsm_Id=${id}`;
    return this.http.get(reqUrl).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.status_message === 'Success') {
          return res.RoomSectionMasterData;
        } else {
          return false;
        }
      })
    );
  }

  generateRoomSectiondata(val) {
    const obj = {
      map_id: val.rsm_id,
      id: val.room_section_id,
      name: val.section_name,
      roomData: []
    };
    _.map(val.roomdata, (v) => {
      obj.roomData.push({ id: v.room_id, name: v.room_name, isActive: v.room_isactive });
    });
    return obj;
  }

  saveEntityRoomMappingData(param): Observable<any> {
    const reqParam = this.generateReqParamForEntityRoomMap(param);
    const reqUrl = environment.baseUrlAppointment + '/QueueMaster/saveEntityRoomMapping';
    return this.http.post(reqUrl, reqParam).pipe(
      map((res: any) => {
        // if (res.status_code === 200 && res.status_message === 'Success') {
          return res;
        // } else {
        //   return false;
        // }
      })
    );
  }

  generateReqParamForEntityRoomMap(param) {
    const saveArray = [];
    const obj = {
      main_id: null,
      config_id: null,
      time_main_id: null,
      time_detail_id: null,
      remarks: null,
      app_type_id: null,
      is_fixed_room: null,
      rooms: []
    };
    console.log(param);
    _.map(param.timeScheduleList, (val) => {
      _.map(val.appointmentTypeTimeArray, (time) => {
        obj.main_id = time.roomMapId;
        obj.config_id = time.configId;
        obj.time_main_id = val.formId;
        obj.time_detail_id = time.formId;
        obj.remarks = null;
        obj.app_type_id = time.appointmentType.id;
        obj.is_fixed_room = param.applyToAllSchedules;
        obj.rooms = _.map(time.selectedRoomList, (room) => {
          return room.id;
        });
        saveArray.push(_.cloneDeep(obj));
      });
    });
    return saveArray;
  }

  getRoomEntityMapList(param): Observable<any> {
    const reqUrl = environment.baseUrlAppointment + '/QueueMaster/getEntityRoomMappingList';
    const obj = {
      limit_per_page: param.limit_per_page,
      current_page: param.current_page,
      global_search_by: param.searchString,
      sort_order: param.sort_order,
      sort_column: param.sort_column
    };
    return this.http.post(reqUrl, obj).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.data.length > 0) {
          return { mapData: res.data, totalCount: res.total_records };
        } else {
          return { mapData: [], totalCount: 0 };
        }
      })
    );
  }

  deleteRoomMaster(roomId): Observable<any>{
    let url = environment.baseUrlAppointment + `/QueueMaster/deleteRoom/${roomId}`
    return this.http.delete(url).pipe(map((response:any)=>{
     return response;
    }))
  }

  deleteSectionMaster(sectionId):Observable<any>{
    let url = environment.baseUrlAppointment + `/QueueMaster/deleteRoomSection/${sectionId}`
    return this.http.delete(url).pipe(map((response:any)=>{
     return response;
    }))
  }

  deleteRoomSectionMapping(mapId):Observable<any>{
    let url = environment.baseUrlAppointment+`/QueueMaster/deleteRoomSectionMapping/${mapId}`;
  return this.http.delete(url).pipe(map((response:any)=>{
     return response;
    }))
  }

  deleteRoomEntityMapping(param):Observable<any>{
    let url = environment.baseUrlAppointment+`/QueueMaster/deleteEntityRoomMapping`;
    return this.http.post(url,param).pipe(map((response:any)=>{
       return response;
      }))
  }

}

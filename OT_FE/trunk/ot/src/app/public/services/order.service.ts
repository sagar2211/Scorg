import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, Subject, forkJoin } from 'rxjs';
import { map, flatMap, switchMap } from 'rxjs/operators';
import * as _ from 'lodash';
import { LabOrders } from '../models/lab-order';
import { InvestigationComponentMaster } from '../models/investigation-component-master.model';
import { RadiologyOrder } from './../models/radiology-orders';
import { DietOrder } from './../models/diet-order';
import { NursingOrder } from './../models/nursing-order';
import { MedicineOrders } from './../models/medicine-orders';
import { IOrdersCategory } from './../models/iorders';
import { ConsultationService } from './../services/consultation.service';
import * as moment from 'moment';
import { Constants } from './../../config/constants';
import { CommonService } from './../services/common.service';
import { isArray } from 'highcharts';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  masterPriorityList: any[] = [];
  masterRecurringList: any[] = [];
  masterActionLists: any[] = [];
  masterLabSpecimenList: any[] = [];
  masterDiatOrderList: any[] = [];
  masterNursingOrdersList: any[] = [];
  masterOrderCategories: any[] = [];
  masterOrderSetList: any[] = [];
  masterOrderStatusList: any[] = [];
  orderSetLocalData: any[] = [];
  isOrderSetDataPopulated = false;
  selectedDoctorForOrder: any;
  dummyDoctorInfoOrderList = [
    { id: 9, name: 'Blood Glucose – Fingerstick', suggestion_flag: 'user_fav', is_favourite: '0', instructions: '', action: '', use_count: '0' },
    {
      id: 6, name: 'Maintain bowel elimination.', suggestion_flag: 'user_fav', is_favourite: '0', instructions: '', action: '', use_count: '0'
    }, { id: 3, name: 'Monitor heart rate.', suggestion_flag: 'user_fav', is_favourite: '0', instructions: '', action: '', use_count: '0' },
    { id: 1, name: 'Monitor respirations for signs of fatigue & impending failure.', suggestion_flag: 'user_fav', is_favourite: '0', instructions: '', action: '', use_count: '0' },
    { id: 10, name: 'Notify Provider if temperature greater than 101 F', suggestion_flag: 'others', is_favourite: '0', instructions: '', action: '', use_count: '0' },
    { id: 7, name: 'Provide frequent range of motion exercises.', suggestion_flag: 'others', is_favourite: '0', instructions: '', action: '', use_count: '0' },
    { id: 8, name: 'Reposition patient every 2 hours in bed.', suggestion_flag: 'others', is_favourite: '0', instructions: '', action: '', use_count: '0' },
    { id: 12, name: 'Sleep pattern control', suggestion_flag: 'others', is_favourite: '0', instructions: '', action: '', use_count: '0' },
    { id: 13, name: 'VNUR', suggestion_flag: 'others', is_favourite: '0', instructions: '', action: '', use_count: '0' }];

  private onOrderFilterClick = new Subject<any>();
  public $subcFilteredEvnt = this.onOrderFilterClick.asObservable();

  private sendChildDtToParentOrd = new Subject<any>();
  public $subcGetChildData = this.sendChildDtToParentOrd.asObservable();

  private onOrderEditClick = new Subject<any>();
  public $subcEditEvent = this.onOrderEditClick.asObservable();
  // private setOrders = new Subject<any>();
  // public $getOrders = this.setOrders.asObservable();

  isOrderCategoryDataPopulated: Array<any> = []; // -- all populated objects are stored by patient ipd against

  public loadSuggestionFromOrders = new Subject<any>();
  public $subLoadSuggestionFromOrders = this.loadSuggestionFromOrders.asObservable();

  sideMenuOrderEvents: Subject<any> = new Subject<any>();
  public $sideMenuOrderEvents = this.sideMenuOrderEvents.asObservable();

  OrderEvent: Subject<any> = new Subject<any>();
  public $OrderEvent = this.OrderEvent.asObservable();

  OrderErrorEvent: Subject<any> = new Subject<any>();
  public $OrderErrorEvent = this.OrderErrorEvent.asObservable();

  OrderByEvent: Subject<any> = new Subject<any>();
  public $OrderByEvent = this.OrderByEvent.asObservable();

  OrderSaveButtonEnableDisable: Subject<any> = new Subject<any>();
  public $OrderSaveButtonEnableDisable = this.OrderSaveButtonEnableDisable.asObservable();

  orderSequence = 0;

  constructor(
    private http: HttpClient,
    private _consultationService: ConsultationService,
    private commonService: CommonService
  ) { }

  getPriorityList(): Observable<any> {
    const reqUrl = environment.STATIC_JSON_URL + 'orders.json';
    if (this.masterPriorityList.length) {
      return of(this.masterPriorityList);
    }
    return this.http.get(reqUrl).pipe(
      map((r: any) => {
        this.masterPriorityList = r.priorityList;
        return r.priorityList;
      })
    );
  }

  getRecurringList(): Observable<any> {
    const reqUrl = environment.STATIC_JSON_URL + 'orders.json';
    if (this.masterRecurringList.length) {
      return of(this.masterRecurringList);
    }
    return this.http.get(reqUrl).pipe(
      map((res: any) => {
        this.masterRecurringList = res.recurringList;
        return res.recurringList;
      })
    );
  }

  getActionLists(): Observable<any> {
    const reqUrl = environment.STATIC_JSON_URL + 'orders.json';
    return this.http.get(reqUrl).pipe(
      map((res: any) => {
        this.masterActionLists = res.actionsList;
        return res.actionsList;
      })
    );
  }

  getLabSpecimenList(): Observable<any> {
    const reqUrl = environment.STATIC_JSON_URL + 'orders.json';
    if (this.masterLabSpecimenList.length) {
      return of(this.masterLabSpecimenList);
    }
    return this.http.get(reqUrl).pipe(
      map((res: any) => {
        this.masterLabSpecimenList = res.labSpecimenList;
        return res.labSpecimenList;
      })
    );
  }

  setOrderData(formData: any, mode: String, orderName: String, indx?: Number, validateOrdObjs?: Boolean): void {
    // if (orderName == 'medicineOrders' && mode == 'add') {
    //   formData['startDateTime'] = new Date(formData['startDateTime']);
    // }
    const patientId = this.commonService.getLastActivePatient().patientData.id;
    formData = validateOrdObjs ? this.convertPlainToModelObjects(orderName, mode, formData) : formData;
    let orderData;
    if (mode === 'add' || mode === 'update') {
      orderData = this._consultationService.setConsultationFormData(patientId, orderName, formData, mode, false, true);
    } else {
      // delete mode
      orderData = this._consultationService.getConsultationFormDataByKey(patientId, orderName, true);
      orderData.splice(indx, 1);
      orderData = this._consultationService.getConsultationFormDataByKey(patientId, orderName, true);
    }
    this.OrderSaveButtonEnableDisable.next();
  }

  // get this LOCAL data to load initial form values.
  getOrderData(orderKey, returnNonObservable?) {
    const patientData = this.commonService.getLastActivePatient();
    const patientId = patientData.patientData.id;
    const visitNo = patientData.visitNo;
    let orderData = this._consultationService.getConsultationFormDataByKey(patientId, orderKey, true);
    if (orderData == false) {
      orderData = orderData == false ? (orderKey == 'otherOrders' ? { docInstructionOrder: [], servicesOrder: [] } : [])  : orderData;
      orderData = this._consultationService.setConsultationFormData(patientId, orderKey, orderData, 'update', false, true);
      orderData = this._consultationService.getConsultationFormDataByKey(patientId, orderKey, true);
    }
    const requestParams = {
      serviceTypeId: patientData.serviceType.id,
    };
    if (orderData && orderData.length) {
      return (returnNonObservable) ? orderData : of(orderData);
    } else {
      const populatedObjects = this.getPopulatedObjHistory(visitNo);
      if ((populatedObjects[orderKey] === false) || (_.isEmpty(populatedObjects))) {
        return this.getCategoryOrdersByCatId(orderKey, requestParams).pipe(switchMap(res => {
          const data = res;
          return (returnNonObservable) ? data : of(data);
          // return this.http.get(reqUrl).pipe(
          //   map((res: any) => {
          //     return this.filterData(res.compTypeData);
          //   })
          // );
          // CALL TO API
          // return (returnNonObservable) ? orderData : of(orderData);
          // const defaultObj = _.cloneDeep(defaultLabTestData);
          // return of(this._consultationService.setConsultationFormData(patientId, 'labOrders', defaultObj));
        }));
      } else {
        return (returnNonObservable) ? orderData : of(orderData);
      }
    }
  }

  getAllOrderData() {
    const patientId = this.commonService.getLastActivePatient().patientData.id;
    const patIpdId = this._consultationService.getPatientObj('visitNo');
    const orderData = this._consultationService.getAllConsultationFormData(patientId);
    // if (orderData && orderData.length) {
    //   return (returnNonObservable) ? orderData : of(orderData);
    // } else {
    //   const populatedObjects = this.getPopulatedObjHistory(patIpdId);
    //   if ((populatedObjects[orderKey] == false) || (_.isEmpty(populatedObjects))) {
    //     return this.getCategoryOrdersByCatId(orderKey).pipe(switchMap(res => {
    //       const data = res;
    //       return (returnNonObservable) ? data : of(data);
    //       // return this.http.get(reqUrl).pipe(
    //       //   map((res: any) => {
    //       //     return this.filterData(res.compTypeData);
    //       //   })
    //       // );
    //       // CALL TO API
    //       // return (returnNonObservable) ? orderData : of(orderData);
    //       // const defaultObj = _.cloneDeep(defaultLabTestData);
    //       // return of(this._consultationService.setConsultationFormData(patientId, 'labOrders', defaultObj));
    //     }));
    //   } else {
    //     return (returnNonObservable) ? orderData : of(orderData);
    //   }
    // }
    return orderData;
  }
  // OLD - EMR
  // getDiatOrderList(): Observable<any> {
  //   const reqUrl = environment.STATIC_JSON_URL + 'orders.json';
  //   if (this.masterDiatOrderList.length) {
  //     return of(this.masterDiatOrderList);
  //   }
  //   return this.http.get(reqUrl).pipe(
  //     map((res: any) => {
  //       this.masterDiatOrderList = res.diatOrdersList;
  //       return res.diatOrdersList;
  //     })
  //   );
  // }

  // NEW - QMS
  getDiatOrderList(searchTxt: string, serviceTypeId: number, specialityId: number, userId: number, skipIndex: number, limit: number): Observable<any> {
    const reqParams = {
      search_keyword: searchTxt,
      service_type_id: serviceTypeId,
      speciality_id: specialityId,
      user_id: userId,
      skip_index: skipIndex, limit
    };
    const reqUrl = environment.dashboardBaseURL + '/DietMaster/GetDietSuggestionList';
    return this.http.post(reqUrl, reqParams).pipe(map((r: any) => {
      const result = r.data;
      _.map(result, (val, key) => {
        val.is_favourite = '0';
        val.instructions = '';
        val.action = '';
        val.use_count = '0';
      });
      return result;
    })
    );
  }

  // NEW - QMS
  getMasterNursingOrders(searchTxt: string, serviceTypeId: number, specialityId: number, userId: number, skipIndex: number, limit: number): Observable<any> {
    const reqParams = {
      search_keyword: searchTxt,
      service_type_id: serviceTypeId,
      speciality_id: specialityId,
      user_id: userId,
      skip_index: skipIndex,
      limit
    };
    const reqUrl = environment.dashboardBaseURL + '/NursingMaster/GetNursingSuggestionList';
    return this.http.post(reqUrl, reqParams).pipe(map((r: any) => {
      const result = r.data;
      _.map(result, (val, key) => {
        val.is_favourite = '0';
        val.instructions = '';
        val.action = '';
        val.use_count = '0';
      });
      return result;
    })
    );
  }

  saveAllOrders(data): Observable<any> {
    const reqUrl = environment.dashboardBaseURL + '/Order/SaveOrders';
    return this.http.post(reqUrl, data);
  }

  addRemoveUnsavedCounts(outputVar, event, orderKey, arrName, status) {
    outputVar.emit({
      event,
      orderKey,
      arrName,
      status
    });
  }

  // -- Get All MAster categories
  getAllMasterOrderCategories(requestParams): Observable<Array<IOrdersCategory>> {
    if (this.masterOrderCategories.length) {
      return of(this.masterOrderCategories);
    }
    const reqUrl = environment.dashboardBaseURL + '/OrderCategoryMaster/getOrderCategoriesMaster?serviceTypeId=' + requestParams.serviceTypeId;
    return this.http.get(reqUrl).pipe(
      map((res: any) => {
        _.forEach(res.data, (o) => {
          o.display = (o.display === 'Y');
        });
        this.masterOrderCategories = res.data;
        return this.masterOrderCategories;
      })
    );
  }

  setFilteredValue(filteredType: { filterBy: string, activeIds: string[], mode: string }) {
    this.onOrderFilterClick.next(filteredType);
  }

  sendEvntToParentComp(childData) {
    this.sendChildDtToParentOrd.next(childData);
  }

  saveOrdersByCategory(reqParams): Observable<any> {
    const reqParam = { ...reqParams };
    reqParam.ipdId = this._consultationService.getPatientObj('visitNo');
    reqParam.docid = Constants.EMR_IPD_USER_DETAILS.docId;
    const reqUrl = environment.EMR_BaseURL + '/ipd/saveOrders';
    return this.http.post(reqUrl, reqParam);
  }

  getOrderDetailsByIpdId(requestParams, skipObjectMerge?): Observable<any> {
    const reqUrl = environment.dashboardBaseURL + '/Order/GetOrders';
    return this.http.post(reqUrl, requestParams).pipe(
      map((res: any) => {
        // set orders details data.
        const result = res.data;
        const orderKeys = Object.keys(result);
        const tempObj = this.getPopulatedObjHistory(requestParams.ipdId);
        _.forEach(orderKeys, (key) => {
          if (!tempObj.hasOwnProperty(key) && !skipObjectMerge) {
            tempObj.patIpdId = requestParams.ipdId;
            tempObj[key] = true;
            if (!result[key].length) {
              // this.setOrderData([], 'update', key);
            } else {
              _.forEach(result[key], (obj, k) => {
                if (key !== 'medicineOrders') {
                  result[key][k].orderDate = obj.order_date;
                  result[key][k].orderBy = (obj.order_by) ? { userId: obj.order_by.user_id, userName: obj.order_by.user_name } : { userId: 0, userName: null };
                  result[key][k].approvedBy = (obj.approved_by) ? { userId: obj.approved_by.user_id, userName: obj.approved_by.user_name } : { userId: 0, userName: null };
                  delete obj.order_date;
                  delete obj.order_by;
                  delete obj.approved_by;
                }
                // this.setOrderData(obj, 'add', key, null, (key == 'medicineOrders') ? true : false);
              });
            }
          }
        });

        if (requestParams.orderCategoryId) {
          return result[requestParams.orderCategoryKey];
        }
        return result;
      })
    );
  }

  getOrderObjectByOrderKey(orderKey, orderData, onLoad?) {
    const orderObj = this.getOrderObjectModel(orderKey);
    if (!orderObj) {
      return null;
    }
    if (orderObj.isObjectValid(orderData)) {
      orderObj.generateObject(orderData, onLoad);
      return orderObj;
    } else {
      return null;
    }
  }

  generateOrderObjectByOrderKey(orderKey, orderData, onLoad?) {
    const orderObj = this.getOrderObjectModel(orderKey);
    if (!orderObj) {
      return null;
    }
    orderObj.generateObject(orderData, onLoad);
    return orderObj;
  }

  getOrderObjectModel(orderKey) {
    let obj;
    if (orderKey === 'medicineOrders') {
      obj = new MedicineOrders();
    } else if (orderKey === 'labOrders') {
      obj = new LabOrders();
    } else if (orderKey === 'radiologyOrders') {
      obj = new RadiologyOrder();
    } else if (orderKey === 'nursingOrders') {
      obj = new NursingOrder();
    } else if (orderKey === 'dietOrders') {
      obj = new DietOrder();
    } else {
      obj = false;
    }
    return obj;
  }

  getOrderSetData(): Observable<any> {
    // const reqUrl = environment.STATIC_JSON_URL + 'order-set.json';
    // check in local object to get order set
    // const localOrderSetData = this.getOrderData('ordersOrderSet', true);
    const localOrderSetData = this.getOrderSetLocalData();
    if (this.isOrderSetDataPopulated && localOrderSetData && _.isArray(localOrderSetData)) {
      return of(localOrderSetData);
    }
    const requestParams = {
      docId: Constants.EMR_IPD_USER_DETAILS.docId
    };
    return this.getOrderSetForOrdersById(requestParams);
    // other wise call api, save in local and return.
  }

  editOrderData(filteredType: { mode: string, key: string, data: any, orderIndex: number }) {
    this.onOrderEditClick.next(filteredType);
  }

  getComponentListForSelectedInvestigation(param): Observable<any> {
    const reqUrl = environment.EMR_BaseURL + '/ipd/getInvestigationOrderComponentData';
    return this.http.post(reqUrl, param).pipe(
      map((res: any) => {
        let resultDataUpdated = [];
        if (res.data.length) {
          _.map(res.data, v => {
            v.isSelected = true;
            v.parameterData = v.parameter_data ? JSON.parse(v.parameter_data) : null;
            const _InvestigationComponentMaster = new InvestigationComponentMaster();
            if (_InvestigationComponentMaster.isObjectValid(v)) {
              _InvestigationComponentMaster.generateObject(v);
              resultDataUpdated.push(_.cloneDeep(_InvestigationComponentMaster));
            }
          });
        }
        resultDataUpdated = _.sortBy(resultDataUpdated, 'parameterName');
        return resultDataUpdated;
      })
    );
  }

  // -- check if all orders objects are valid or invalid
  convertPlainToModelObjects(key: String, mode: String, value: any) {
    const obj = this.getOrderObjectModel(key);
    if (mode === 'add') { // --add
      if (obj.isObjectValid(value)) {
        obj.generateObject(value);
        return obj;
      } else {
        return null;
      }
    } else { // -- update
      const temp = [];
      value.forEach(element => {
        if (obj.isObjectValid(element)) {
          obj.generateObject(element);
          temp.push(obj);
        }
      });
      return temp;
    }
  }

  editOrderSetData(filteredType: { mode: string, key: string, data: any, orderIndex: number }) {
    this.onOrderEditClick.next(filteredType);
  }

  saveOrdersOrderSet(orderSetData) {
    const requestParams = {
      // ipdId: this._consultationService.getPatientObj('visitNo'),
      docId: Constants.EMR_IPD_USER_DETAILS.docId,
      orderSetDetails: orderSetData
    };
    const reqUrl = environment.EMR_BaseURL + '/ipd/SaveOrderSetForOrderById';
    // const postData = this.setOrderSetDataByDirtyData(orderSetData, 'getDirtyRecords');
    // call API to send data
    return this.http.post(reqUrl, requestParams).pipe(map((res: any) => {
      if (res.apistatus === 1 && res.data) {
        const isNewOrderSet = (orderSetData.orderSetId === '');
        orderSetData.orderSetId = res.data.orderSetId;
        // mark all dirty orders of this order set to false.
        const updatedOrderSetData = this.setOrderSetDataByDirtyData(orderSetData, 'markDirtyFalse');
        if (isNewOrderSet) {
          // this.setOrderData(updatedOrderSetData, 'add', 'ordersOrderSet');
          this.setOrderSetLocalData(updatedOrderSetData, 'add');
        } else {
          // update existing data
          // const orderSetLocalData = this.getOrderData('ordersOrderSet', true);
          const orderSetLocalData = this.getOrderSetLocalData();
          const activeOrderSetLocalIndex = _.findIndex(orderSetLocalData, (o) => {
            return o.orderSetId === orderSetData.orderSetId;
          });
          orderSetLocalData[activeOrderSetLocalIndex] = _.cloneDeep(orderSetData);
          // this.setOrderData(orderSetLocalData, 'update', 'ordersOrderSet');
          this.setOrderSetLocalData(orderSetLocalData, 'update');
        }
      }
    })
    );
  }

  setOrderSetDataByDirtyData(orderSetObj, action) {
    const orderSetPostData = _.cloneDeep(orderSetObj);
    _.map(orderSetPostData, (o, key) => {
      if (_.isArray(o)) {
        _.forEach(o, (orderObj, i) => {
          if (action === 'getDirtyRecords') {
            if (!orderObj.isDirty) {
              orderSetPostData[key].splice(i, 1);
            }
          }
          if (action === 'markDirtyFalse') {
            if (orderObj.isDirty) {
              orderSetPostData[key][i].isDirty = false;
            }
          }
          if (action === 'markDirtyTrue') {
            orderSetPostData[key][i].isDirty = true;
          }
        });
      }
    });
    return orderSetPostData;
  }

  getOrderSetForOrdersById(requestParams) {
    if (_.isUndefined(requestParams.docId)) {
      requestParams.docId = Constants.EMR_IPD_USER_DETAILS.docId;
    }
    const reqUrl = environment.EMR_BaseURL + '/ipd/getOrderSetForOrdersById';
    return this.http.post(reqUrl, requestParams).pipe(
      map((res: any) => {
        if (res.data.status === '1' && !_.isUndefined(res.data.orderSetDetails)) {
          if (!_.isUndefined(requestParams.orderSetId)) {
            // const localOsData = this.getOrderData('ordersOrderSet', true);
            const localOsData = this.getOrderSetLocalData();
            const index = _.findIndex(localOsData, (o) => {
              return o.orderSetId === requestParams.orderSetId;
            });
            if (index !== -1) {
              // update local array
              localOsData[index] = res.data.orderSetDetails;
              // this.setOrderData(localOsData, 'update', 'ordersOrderSet');
              this.setOrderSetLocalData(localOsData, 'update');
            }
            this.isOrderSetDataPopulated = true;
            return res.data.orderSetDetails;
          } else {
            // set local data
            // this.setOrderData(res.data['orderSetDetails'], 'update', 'ordersOrderSet');
            this.setOrderSetLocalData(res.data.orderSetDetails, 'update');
            this.isOrderSetDataPopulated = true;
            return res.data.orderSetDetails;
          }
        }
      })
    );
  }

  // deleteOrderSet(orderSetId) {
  //   const reqUrl = environment.EMR_BaseURL + '/ipd/deleteOrderSetForOrdersById/' + orderSetId;
  //   return this.http.get(reqUrl).pipe(
  //     map((res: any) => {
  //       if (res.data && !_.isUndefined(res.data.delete_status) && res.data.delete_status == 1) {
  //         // delete from local
  //         // const localOrderSetData = this.getOrderData('ordersOrderSet', true);
  //         const localOrderSetData = this.getOrderSetLocalData();
  //         const index = _.findIndex(localOrderSetData, (o) => {
  //           return o.orderSetId == orderSetId;
  //         });
  //         // this.setOrderData('', 'delete', 'ordersOrderSet', index);
  //         this.setOrderSetLocalData('', 'delete', index);
  //         return true;
  //       }
  //       return false;
  //     })
  //   );
  // }

  setOrderSetLocalData(data, action, index?) {
    if (action === 'update') {
      this.orderSetLocalData = data;
    }
    if (action === 'add') {
      this.orderSetLocalData = [data].concat(this.orderSetLocalData);
    }
    if (action === 'delete') {
      this.orderSetLocalData.splice(index, 1);
    }
  }

  getOrderSetLocalData() {
    return this.orderSetLocalData;
  }

  // -- Get order details by category Id
  getCategoryOrdersByCatId(orderkey: String, requestParams: any): Observable<any> {
    return this.getAllMasterOrderCategories(requestParams).pipe(flatMap(masterData => {
      const index = _.findIndex(masterData, (obj) => obj.orderKey === orderkey);
      if (index !== -1) {
        const reqParams = {
          ipdId: this._consultationService.getPatientObj('visitNo'),
          orderCategoryId: masterData[index].orderId,
          orderCategoryKey: masterData[index].orderKey
        };
        return this.getOrderDetailsByIpdId(reqParams).pipe(map((orderData: any) => {
          return this.convertPlainToModelObjects(orderkey, 'update', orderData);
        }));
      }
    }));
  }

  // -- Get all populated objects
  getPopulatedObjHistory(ipdId): any {
    let tempObj = {};
    const findDt = _.find(this.isOrderCategoryDataPopulated, (dt) => dt.patIpdId === ipdId);
    if (findDt === undefined) {
      this.isOrderCategoryDataPopulated.push({ patIpdId: ipdId });
      tempObj = this.isOrderCategoryDataPopulated[this.isOrderCategoryDataPopulated.length - 1];
    } else {
      tempObj = findDt;
    }
    return tempObj;
  }

  generateHours(): any[] {
    const hours = [8, 14, 22];
    const hoursList = [];
    _.forEach(hours, (o) => {
      const t = moment(o, 'hour').format('hh:mm A');
      const obj = {
        time: t,
        isActive: false
      };
      hoursList.push(obj);
    });
    return hoursList;
  }

  orderMenuEvent(data) {
    this.sideMenuOrderEvents.next(data);
  }

  getOrderFavTemplates(reqParams, orderKey): Observable<any> {
    let reqUrl = '';
    if (orderKey === 'medicineOrders') {
      reqUrl = environment.dashboardBaseURL + '/medicine/GetMedicineOrderFreqUsedList';
      return this.http.post(reqUrl, reqParams).pipe(map((r: any) => {
        return _.cloneDeep(this.generateOrderModel('medicineOrders', r.data));
      })
      );
    }
    let url = '';
    switch (orderKey) {
      case 'labOrders':
        url = '/InvetigationMaster/GetLabOrderFreqUsedList';
        break;
      case 'radiologyOrders':
        url = '/InvetigationMaster/GetRadioLogyOrderFreqUsedList';
        break;
      case 'dietOrders':
        url = '/DietMaster/GetDietOrderFreqUsedList';
        break;
      case 'nursingOrders':
        url = '/NursingMaster/GetNursingOrderFreqUsedList';
        break;
      case 'otherOrders':
        url = '/DoctorInstruction/GetDoctorInstructionFreqUsedList';
        break;
    }
    reqUrl = environment.dashboardBaseURL + url;
    return this.http.post(reqUrl, reqParams).pipe(map((res: any) => {
      if (res.status_code === 200 && res.status_message === 'Success' && res.data.length > 0) {
        return res.data;
      } else {
        return [];
      }
    })
    );
  }

  // -- check if all orders objects are valid or invalid
  generateOrderModel(key: string, orders: any) {
    const temp = [];
    orders.forEach(element => {
      const obj = this.getOrderObjectModel(key);
      if (obj.isObjectValid(element)) {
        obj.generateObject(element);
        temp.push(obj);
      }
    });
    return temp;
  }

  SaveOrderAction(params): Observable<any> {
    const reqUrl = environment.dashboardBaseURL + '/Order/SaveOrderAction';
    return this.http.post(reqUrl, params).pipe(map((res: any) => {
      if (res.status_code === 200 && res.status_message === 'Success') {
        return res.data;
      } else {
        return false;
      }
    })
    );
  }

  getOrderStatusMaster(): Observable<any> {
    if (this.masterOrderStatusList.length) {
      return of(this.masterOrderStatusList);
    }
    const reqUrl = environment.dashboardBaseURL + '/Order/GetOrderStatusList';
    return this.http.get(reqUrl).pipe(map((res: any) => {
      if (res.status_code === 200 && res.status_message === 'Success' && res.data.length > 0) {
        this.masterOrderStatusList = res.data;
        return res.data;
      }
    })
    );
  }

  getOrderStatusKeyByStatusName(orderStatusName) {
    const orderStatusDetailsObj = _.find(this.masterOrderStatusList, (o) => o.status === orderStatusName);
    return (orderStatusDetailsObj) ? orderStatusDetailsObj.status_key : '';
  }

  getOrderSetList(params): Observable<any> {
    const reqUrl = environment.dashboardBaseURL + '/Order/GetOrderset ';
    return this.http.post(reqUrl, params).pipe(map((res: any) => {
      return res.data;
    })
    );
  }

  getOrderSetDetailsById(orderSetId): Observable<any> {
    const reqUrl = environment.dashboardBaseURL + '/Order/GetOrdersetdetailsById?order_set_id=' + orderSetId;
    return this.http.get(reqUrl).pipe(map((res: any) => {
      return res.data;
    })
    );
  }

  saveOrderSet(reqParams): Observable<any> {
    const reqUrl = environment.dashboardBaseURL + '/Order/SaveOrderset';
    return this.http.post(reqUrl, reqParams).pipe(map((res: any) => {
      return res.status_code === 200 && res.status_message === 'Success';
    })
    );
  }

  deleteOrderSet(orderSetId): Observable<any> {
    const reqUrl = environment.dashboardBaseURL + '/Order/DeleteOrderset?order_set_id=' + orderSetId;
    return this.http.get(reqUrl).pipe(map((res: any) => {
      return res.status_code === 200 && res.status_message === 'Success';
    })
    );
  }

  getOrderInstructions(reqParams, orderKey): Observable<any> {
    let url = '';
    let reqUrl = '';
    switch (orderKey) {
      case 'medicineOrders':
        url = '/Medicine/GetMedicineOrderInstructionList';
        break;
      case 'labOrders':
        url = '/InvetigationMaster/GetLabOrderInstructionList';
        break;
      case 'radiologyOrders':
        url = '/InvetigationMaster/GetRadiologyOrderInstructionList';
        break;
      case 'dietOrders':
        url = '/DietMaster/GetDietOrderInstructionList';
        break;
      case 'otherOrders_doctorInstruction':
        url = '/DoctorInstruction/GetDoctorInstructionsCommentList';
        break;
      case 'otherOrders_doctorService':
        url = '/DoctorInstruction/GetDoctorServicesCommentList';
        break;
      case 'labOrdersRequisition':
        url = '/InvetigationMaster/GetLabOrderRequisitionList';
        break;
      case 'radiologyOrderRequisition':
        url = '/InvetigationMaster/GetRadiologyOrderRequisitionList';
        break;
    }

    reqUrl = environment.dashboardBaseURL + url;
    return this.http.post(reqUrl, reqParams).pipe(map((res: any) => {
      if (res.status_code === 200 && res.status_message === 'Success' && res.data.length > 0) {
        return res.data;
      } else {
        return [];
      }
    }));
  }

  saveDietMaster(reqParams): Observable<any> {
    const reqUrl = environment.dashboardBaseURL + '/DietMaster/SaveDietMaster';
    return this.http.post(reqUrl, reqParams);
  }
  savedctorInstructionMaster(reqParams): Observable<any> {
    const reqUrl = environment.dashboardBaseURL + '/DoctorInstruction/SaveDoctorInstructionMaster';
    return this.http.post(reqUrl, reqParams);
  }

  saveNursingMaster(reqParams): Observable<any> {
    const reqUrl = environment.dashboardBaseURL + '/NursingMaster/SaveNursingMaster';
    return this.http.post(reqUrl, reqParams);
  }

  getotherrderDoctorInstList(searchTxt: string, serviceTypeId: number, specialityId: number, userId: number, skipIndex: number, limit: number): Observable<any> {
    const reqParams = {
      search_keyword: (searchTxt) ? searchTxt : '',
      service_type: serviceTypeId,
      speciality_id: specialityId,
      user_id: userId,
      skip_index: skipIndex,
      limit
    };
    const reqUrl = environment.dashboardBaseURL + '/DoctorInstruction/GetDoctorInstructionSuggestionList';
    return this.http.post(reqUrl, reqParams).pipe(map((r: any) => {

      const result = r.data;
      _.map(result, (val, key) => {
        val.is_favourite = '0';
        val.instructions = '';
        val.action = '';
        val.use_count = '0';
      });
      return result;
    })
    );
  }

  getotherrderServicesList(searchTxt: string, serviceTypeId: number, specialityId: number, userId: number, pagenumber: number, limit: number): Observable<any> {
    const reqParams = {
      search_string: (searchTxt) ? searchTxt : '',
      page_number: pagenumber,
      limit
    };
    const reqUrl = environment.dashboardBaseURL + '/HISView/GetServiceList';
    return this.http.post(reqUrl, reqParams).pipe(map((r: any) => {
      const result = r.data;
      _.map(result, (val, key) => {
        val.is_favourite = '0';
        val.instructions = '';
        val.action = '';
        val.use_count = '0';
      });
      return result;
    })
    );
  }

  getCareTeamUserList(reqParams): Observable<any> {
    const reqUrl = environment.dashboardBaseURL + '/CareTeam/GetCareTeamUserList';
    return this.http.post(reqUrl, reqParams);
  }

  saveNursingOrderUserFav(reqParams): Observable<any> {
    const reqUrl = environment.dashboardBaseURL + '/NursingMaster/SaveNursingUserFavorites';
    return this.http.post(reqUrl, reqParams).pipe(map((res: any) => {
      if (res.status_message === 'Success') {
        return true;
      }
      return false;
    }));
  }

  saveDietOrderUserFav(reqParams): Observable<any> {
    const reqUrl = environment.dashboardBaseURL + '/DietMaster/SaveDietUserFavorites';
    return this.http.post(reqUrl, reqParams).pipe(map((res: any) => {
      if (res.status_message === 'Success') {
        return true;
      }
      return false;
    }));
  }
  saveOtherOrderUserFav(reqParams): Observable<any> {
    const reqUrl = environment.dashboardBaseURL + '/DoctorInstruction/SaveDoctorInstructionUserFavorites';
    return this.http.post(reqUrl, reqParams).pipe(map((res: any) => {
      if (res.status_message === 'Success') {
        return true;
      }
      return false;
    }));
  }

  checkPatientOrderStatus(reqParams): Observable<any> {
    const reqUrl = environment.dashboardBaseURL + '/Order/CheckPatientOrderStatus';
    return this.http.post(reqUrl, reqParams).pipe(map((res: any) => {
      if (res.status_message === 'Success') {
        return res.data;
      }
      return false;
    }));
  }

  getOrderSuggestionList(requestParams): Observable<any> {
    const reqUrl = environment.dashboardBaseURL + '/Order/GetOrderSuggestionList?searchKeyword=' + requestParams;
    return this.http.get(reqUrl).pipe(
      map((res: any) => {
        return res.data;
      })
    );
  }

  setOrderSequence(seq) {
    this.orderSequence = _.clone(seq);
  }

  getOrderSequence() {
    return this.orderSequence;
  }
}

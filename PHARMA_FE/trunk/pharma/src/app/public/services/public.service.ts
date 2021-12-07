
import { catchError, map, retry } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Observable, of, Subject, throwError } from 'rxjs';
import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import * as moment from 'moment';
import { environment } from 'src/environments/environment';
import { IMedicineTypes } from '../models/iprescription';
import { AuthService } from '../../public/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class PublicService {
  private componentSectionClickedSub = new Subject<any>();
  public $compSectionClicked = this.componentSectionClickedSub.asObservable();

  private updateValuFrmSuggToCompnentSub = new Subject<any>();
  public listenEventFromSuggList = this.updateValuFrmSuggToCompnentSub.asObservable();

  private updateOrderBy = new Subject<any>();
  public $updateOrderBy = this.updateOrderBy.asObservable();

  // -- patient profile
  private patientProfileEvent = new Subject<any>();
  public $subPatProfileEvent = this.patientProfileEvent.asObservable();

  // --ipd header
  private patDetailsInIPDHeader = new Subject<any>();
  public $patDetailsInIPDHeaderEvent = this.patDetailsInIPDHeader.asObservable();

  // -- on user change
  public sendUserChangeEvent = new Subject<any>();
  public $getUserChangeEvent = this.sendUserChangeEvent.asObservable();

  public rightPanelSetting = {
    suggestionIsShow: false,
    suggestionPin: false,
    // showLoader: false,
    opdSuggestActiveTab: '',
    // opdHeadsIsShow: false,
    // opdHeadsPin: false,
    showMiniSuggestion: false,
    showSuggestion: true
  };
  public patDashboardLeftMenuSetting = { isShowMiniBar: false };

  masterOfMedicineDetails: any[] = [];
  masterMedicineTypes: IMedicineTypes[] = [];
  masterMediceNameList: any[] = [];
  instructionsMaster = {
    english: [],
    hindi: [],
    marathi: []
  };
  dose_view_type: any = 2;
  activeFormId: number;
  masterCopyOfOpdFormList: any[] = [];
  investigationHeadMaster: any[] = [];
  masterDoctorSettings: any[] = [];
  careTeamUserList: any[] = [];
  referUserList: any[] = [];
  deptData: any[] = [];
  intakeOutputReportData = {
    chartData: null,
    startDate: null,
    endDate: null,
    isApiData: false,
    isPopulated: false,
    hospitalPatId: null,
    ipdId: null,
    selectedChartId: null
  };
  nursingNoteData = [];

  masterImageAnnotationList: Array<any> = [];
  allIpdDataByKeys: any;

  public readonly pageAccessListByRole: Array<any> = [{
    roleId: 1, // -- doctor,
    stateKey: 'orders',
    isAdd: true,
    isUpdate: true,
    isDelete: true,
    isView: true
  }, {
    roleId: 2, // -- nursing,
    stateKey: 'orders',
    isAdd: true,
    isUpdate: true,
    isDelete: true,
    isView: false
  }, {
    roleId: 2, // -- nursing,
    stateKey: 'diagnosis',
    isAdd: true,
    isUpdate: true,
    isDelete: true,
    isView: false
  }];

  constructor(
    private http: HttpClient, private authService: AuthService) {
  }

  // -- get all medicineTypes  -- /medicine/medicine_types
  getMasterMedicineTypes(): Observable<IMedicineTypes[]> {
    const reqUrl = environment.dashboardBaseURL + '/MedicineTypeMaster/GetMedicineTypeList';
    if (this.masterMedicineTypes.length) {
      return of(this.masterMedicineTypes);
    }
    return this.http.get(reqUrl).pipe(
      map((res: any) => {
        const formattedResult = [];
        _.forEach(res.Medicine_Type_List, (medType) => {
          const medicineType = new IMedicineTypes();
          medicineType.generateObject(medType);
          formattedResult.push(medicineType);
        });
        this.masterMedicineTypes = formattedResult;
        return this.masterMedicineTypes;
      })
    );
  }

  // -- get all medicine name by medicine type
  getMedicineNamesByMedType(reqParams): Observable<any> {
    const reqUrl = environment.dashboardBaseURL + '/medicine/GetMedicineList';
    return this.http.post(reqUrl, reqParams).pipe(
      map((res: any) => {
        return res.Medicine_Data_List;
      })
    );
  }

  getGoogleWindowObject(): Observable<any> {
    return of(window).pipe(retry(2));
  }

  setMasterObjectMedicines(updateRecord): Observable<any> {
    const idx = _.findIndex(this.masterMediceNameList, function (o) {
      return o.id === updateRecord.id;
    });
    if (idx === -1) {
      this.masterMediceNameList.push(updateRecord);
    } else {
      this.masterMediceNameList.splice(idx, 1, updateRecord);
    }
    return of(this.masterMediceNameList);
  }

  setMasterObjectInstructionsList(updateRecord, languageId): Observable<any> {
    let instructionsList;
    instructionsList = this.instructionsMaster;
    let idx;
    if (languageId === '101' && this.instructionsMaster.english !== null) {
      idx = _.findIndex(this.instructionsMaster.english, function (o) {
        return o.instructions_en === updateRecord;
      });
      if (idx === -1) {
        this.instructionsMaster.english.push({ 'instructions_en': updateRecord });
      }
    } else if (languageId === '102' && this.instructionsMaster.hindi !== null) {
      idx = _.findIndex(this.instructionsMaster.hindi, function (o) {
        return o.instructions_hindi === updateRecord;
      });
      if (idx === -1) {
        this.instructionsMaster.hindi.push({ 'instructions_hindi': updateRecord });
      }
    } else if (languageId === '103' && this.instructionsMaster.marathi !== null) {
      idx = _.findIndex(this.instructionsMaster.marathi, function (o) {
        return o.instructions_marathi === updateRecord;
      });
      if (idx === -1) {
        this.instructionsMaster.marathi.push({ 'instructions_marathi': updateRecord });
      }
    }
    return of(this.masterMediceNameList);
  }

  // --set dose_view_type
  setDoseViewType($event): void {
    this.dose_view_type = $event;
  }

  getDoseViewType(): Observable<any> {
    return of(this.dose_view_type);
  }

  // -- Get user setting
  getDoctorSettings(docId: number, key: string): Observable<any> {
    const params = {
      doc_id: docId,
      label_key: key
    };
    const reqUrl = environment.EMR_BaseURL + '/pageSetting/getDoctorSettings';
    const valueExist = this.isExistDoctorSettingsByKey(this.masterDoctorSettings, docId, key);
    if (valueExist) {
      return of(valueExist);
    }
    return this.http.post(reqUrl, params).pipe(
      map((res: any) => {
        let labValue = '';
        if (!_.isUndefined(res.data.data[0])) {
          labValue = res.data.data[0].label_value != '' ? JSON.parse(res.data.data[0].label_value) : '';
        } else {
          labValue = '';
        }
        this.setMasterDoctorSettingsByKey(this.masterDoctorSettings, docId, key, labValue);
        return labValue;
      })
    );
  }

  // --set doctor setting by key local for performance
  setMasterDoctorSettingsByKey(masterDoctorSettings, docId, labelKey, labelValue) {
    const findIndex = _.findIndex(masterDoctorSettings, m => m.userId == docId && m.labelKey == labelKey);
    if (findIndex == -1) {
      masterDoctorSettings.push({
        userId: docId,
        labelValue: labelValue,
        labelKey: labelKey
      });
    } else {
      masterDoctorSettings[findIndex].labelValue = labelValue;
    }
  }

  // -- check whether doctor setting is exist by label key
  isExistDoctorSettingsByKey(masterDoctorSettings, docId, labelKey) {
    const indx = _.findIndex(masterDoctorSettings, mds => mds.userId == docId && mds.labelKey == labelKey);
    return indx == -1 ? '' : masterDoctorSettings[indx].labelValue;
  }

  // --Save Doctor setting
  saveDoctorSettings(docId: number, labelKey: string, labelVal: string): Observable<any> {
    const params = { doc_id: docId, label_key: labelKey, label_value: labelVal };
    const reqUrl = environment.EMR_BaseURL + '/pageSetting/saveDoctorSettings';
    return this.http.post(reqUrl, params).pipe(
      map(res => {
        this.setMasterDoctorSettingsByKey(this.masterDoctorSettings, docId, labelKey, labelVal);
        return res;
      })
    );
  }

  getObjectValues(obj) {
    return Object.keys(obj).map(function (key) {
      return obj[key];
    });
  }

  // event listner of section clicked
  componentSectionClicked(sectionDetailsObj) {
    this.componentSectionClickedSub.next(sectionDetailsObj);
  }

  clickOnSuggestionList(sectionData) {
    this.updateValuFrmSuggToCompnentSub.next(sectionData);
  }

  setupdateByValueOnOrder(obj) {
    this.updateOrderBy.next(obj);
  }

  setActiveFormId(id) {
    this.activeFormId = id;
  }

  // set form details to master objects
  setOpdFormDetails(formData) {
    const indx = _.findIndex(this.masterCopyOfOpdFormList, x => x.formId == formData.formId);
    if (indx != -1) {
      this.masterCopyOfOpdFormList[indx] = formData;
    } else {
      this.masterCopyOfOpdFormList.push(formData);
    }
  }

  // get form data from master object by id
  getOpdFormDetailsById(formId) {
    const indx = _.findIndex(this.masterCopyOfOpdFormList, x => x.formId == formId);
    return this.masterCopyOfOpdFormList[indx];
  }

  getOpdFormList(): Observable<any> {
    return of(this.masterCopyOfOpdFormList);
  }

  getActiveFormId(): number {
    return this.activeFormId;
  }

  // /Masterdata/getInvestigationSuggestionOnLoad.
  // OLD - EMR
  // getInvestigationSuggestionListOnLoad(investigation_type, page_no, limit): Observable<any> {
  //   const params = {
  //     investigation_type: investigation_type,
  //     page_no: +page_no || 1,
  //     limit: limit
  //   };
  //   const reqUrl = environment.EMR_BaseURL + '/Masterdata/getInvestigationSuggestionOnLoad';
  //   return this.http.post(reqUrl, params).pipe(map((r: any) => {
  //     // map name from label value
  //     const result = r.data;
  //     _.map(result['favourites'], (val, key) => { val.name = val.label; });
  //     _.map(result['frequently_used'], (val, key) => { val.name = val.label; });
  //     _.map(result['others'], (val, key) => { val.name = val.label; });
  //     return { data: result, search_text: '', page_no: params.page_no };
  //   })
  //   );
  // }

  // NEW - QMS
  getInvestigationSuggestionListOnLoad(investigationtype, limits, keyword?, specialityId?, userId?, skipIndex?): Observable<any> {
    keyword = (keyword) ? keyword : '';
    const reqParams = {
      search_keyword: keyword,
      investigation_type: investigationtype,
      service_type_id: 1, // 1 for IPD
      speciality_id: specialityId,
      user_id: userId,
      skip_index: skipIndex,
      limit: limits
    };
    const reqUrl = environment.dashboardBaseURL + '/InvetigationMaster/GetInvestigationSuggestionList';
    return this.http.post(reqUrl, reqParams).pipe(map((r: any) => {

      const resultOther = r.data;
      _.map(resultOther, (val, key) => {
        val.is_favourite = '0';
        val.default_comment = '';
        val.use_count = '0';
        val.use_count_cardiac = '0';
        val.investigation_head_id = val.InvestigationHeadID;
        val.name = val.label;
        val.isFav = val.suggestion_flag && val.suggestion_flag === 'user_fav' ? true : false;
      });
      const result = {
        favourites: [],
        frequently_used: [],
        others: resultOther
      };
      return { data: result, search_text: '', page_no: 1 };
    })
    );
  }

  // -- /Masterdata/getInvestigationDataByLimit
  // -- for Radiology, labtest
  getInvestigationWithPaginationByType(investType: string, pageNo: number, limits: number, searchTxt: string, strictMatch, isFavourite, maxUseCount): Observable<any> {
    const params = {
      investigation_type: investType,
      page_no: +pageNo || 1,
      limit: limits,
      search_text: searchTxt || '',
      strict_match: !_.isUndefined(strictMatch) ? strictMatch : 0,
      is_favourite: !_.isUndefined(isFavourite) ? isFavourite : -1,
      max_use_count: !_.isUndefined(maxUseCount) ? maxUseCount : 0
    };
    const reqUrl = environment.EMR_BaseURL + '/Masterdata/getInvestigationDataByLimit';
    return this.http.post(reqUrl, params).pipe(map((result: any) => {
      const res = result.data;
      _.map(res, (val, key) => { val.name = val.label; });
      return { data: res, search_text: params.search_text, page_no: params.page_no };
    })
    );
  }

  // medicine/getMedicineSuggestionOnLoad -- for prescription
  // OLD - EMR
  // getMedicineSuggestionListOnLoad(page_no, limit): Observable<any> {
  //   const reqUrl = environment.EMR_BaseURL + '/medicine/getMedicineSuggestionOnLoad';
  //   const params = {
  //     page_no: +page_no || 1,
  //     limit: limit
  //   };
  //   return this.http.post(reqUrl, params).pipe(map((res: any) => {
  //     const result = res.data;
  //     _.map(result.favourites, (val, key) => {
  //       val.name = val.Name;
  //     });
  //     _.map(result.others, (val, key) => {
  //       val.name = val.Name;
  //     });
  //     _.map(result.frequently_used, (val, key) => {
  //       val.name = val.Name;
  //     });
  //     return { data: result, search_text: '', page_no: params.page_no };
  //   }));
  // }

  // NEW - QMS
  getMedicineSuggestionListOnLoad(limit, keyword, serviceTypeId, specialityId, userId, chartId?: any, skipindex?): Observable<any> {
    keyword = (keyword) ? keyword : '';
    const reqParams = {
      search_keyword: keyword,
      service_type_id: serviceTypeId,
      speciality_id: specialityId,
      user_id: userId,
      chart_id: chartId,
      skip_index: skipindex,
      limit
    };
    const reqUrl = `${environment.dashboardBaseURL}/medicine/GetMedicineSuggestionList`;
    return this.http.post(reqUrl, reqParams).pipe(map((res: any) => {
      const resultOther = res.data;
      _.map(resultOther, (val, key) => {
        val.is_favourite = '0';
        val.use_count = '0';
        val.genric_name = null;
        val.Price = null;
        val.instructions = '';
        val.instructions_hindi = '';
        val.instructions_marathi = '';
        val.isFav = val.suggestion_flag && val.suggestion_flag === 'user_fav' ? true : false;
      });
      const result = {
        favourites: [],
        frequently_used: [],
        others: resultOther
      };
      return { data: result, search_text: '', page_no: 1 };
    }));
  }

  // /medicine/getMedicineDataByLimit
  getMedicinesAllWithPagination(medicineType, page_no: number, limit: number, searchText: string, strictMatch?, is_favourite?: number, get_instruction?, max_use_count?: number): Observable<any> {
    const params = {
      medicine_type: +medicineType || '',
      page_no: +page_no || 1,
      limit: limit,
      search_text: searchText || '',
      strict_match: !_.isUndefined(strictMatch) ? strictMatch : 0,
      is_favourite: !_.isUndefined(is_favourite) ? is_favourite : -1,
      get_instruction: !_.isUndefined(get_instruction) ? get_instruction : 0,
      max_use_count: !_.isUndefined(max_use_count) ? max_use_count : 0
    };
    const reqUrl = environment.EMR_BaseURL + '/medicine/getMedicineDataByLimit';
    return this.http.post(reqUrl, params).pipe(map((res: any) => {
      const result = res.data;
      _.map(result, (val, key) => {
        val.name = val.Name;
      });
      return { medicine_data: result, total_count: result.length + result.length, search_text: params.search_text, page_no: params.page_no };
    }), catchError(
      (error) => {
        return throwError('error');
      }
    ));
  }

  getInvestigationHeads(): Observable<any> {
    const reqUrl = environment.EMR_BaseURL + '/patient/getInvestigationHeads';
    if (this.investigationHeadMaster.length) {
      return of(this.investigationHeadMaster);
    }
    return this.http.get(reqUrl).pipe(
      map((res: any) => {
        return this.investigationHeadMaster = res;
      })
    );
  }

  saveInvestigationDetails(params, type?): Observable<any> {
    const reqUrl = environment.EMR_BaseURL + '/patient/saveInvestigationDetails';
    return this.http.post(reqUrl, params);
  }

  updateFavourite(params): Observable<any> {
    const reqUrl = environment.EMR_BaseURL + '/patient/updateFavourite';
    return this.http.post(reqUrl, params);
  }

  // --Fire event from IpdPatProfileHeaderComponent
  sendProfileEvnt(flag: boolean) {
    this.patientProfileEvent.next(flag);
  }

  // -- convert local date format to UTC date format
  convertLocalDateToUTCString(date: Date): string {
    return date.toUTCString();
  }

  // -- convert UTC date format to local date format
  convertUTCStringToLocalDate(date: Date): Date {
    return (new Date(date));
  }

  //   convertUTCDateToLocalDate: function (date) {
  //     return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(),  date.getHours(), date.getMinutes(), date.getSeconds()));
  // }

  // convertLocalDatetoUTCDate: function(date){
  //   return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),  date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
  // }

  getAllLocationAndUsers(hospital_id): Observable<any> {
    // const reqUrl = environment.EMR_BaseURL + 'Masterdata/getDoctorAndLocationByHospital/' + hospital_id;
    // return this.http.get(reqUrl).pipe(
    //   map((res: any) => {
    //     return res;
    //   })
    // );
    const doctorList = [
      {
        id: 1,
        name: 'Reena Bisht'
      },
      {
        id: 2,
        name: 'Rajendra Kotgire'
      },
      {
        id: 3,
        name: 'Anirudh Kulkarni'
      },
      {
        id: 4,
        name: 'Ravi Das Gupta'
      },
      {
        id: 5,
        name: 'Irafn Khan'
      },
      {
        id: 6,
        name: 'Himanshu Pahariya'
      }
    ];
    return of(doctorList);
  }

  updateCareTeamUserList(val) {
    this.careTeamUserList = val;
  }

  getCareTeamUserList() {
    return of(this.careTeamUserList);
  }

  updateReferUserList(val) {
    this.referUserList = val;
  }

  getReferUserList() {
    return of(this.referUserList);
  }

  updateTransferData(val) {
    this.deptData = val;
  }

  getTransferData() {
    return of(this.deptData);
  }

  updateIntakeOutputreport(val) {
    this.intakeOutputReportData = {
      chartData: null,
      startDate: null,
      endDate: null,
      isApiData: false,
      isPopulated: false,
      hospitalPatId: null,
      ipdId: null,
      selectedChartId: null
    };
    this.intakeOutputReportData = val;
  }

  updateIntakeOutputChart(val) {
    this.intakeOutputReportData.chartData = '';
    this.intakeOutputReportData.chartData = _.cloneDeep(val);
  }

  getIntakeOutputreport(param) {
    if (param['hospital_pat_id'] == this.intakeOutputReportData.hospitalPatId && param['ipd_id'] == this.intakeOutputReportData.ipdId) {
      return this.intakeOutputReportData;
    } else {
      this.intakeOutputReportData = {
        chartData: null,
        startDate: null,
        endDate: null,
        isApiData: false,
        isPopulated: false,
        hospitalPatId: null,
        ipdId: null,
        selectedChartId: null
      };
      return this.intakeOutputReportData;
    }
  }

  calculateHoursByTime(freq, freqStartTime): any {
    const list = [];
    freq = +freq;
    const spit = 24 / freq;
    if (freq <= 4) {
      let temp = freqStartTime;
      for (let i = 0; i < freq; i++) {
        list.push(moment(temp, 'hh:mm A').add(spit, 'hours').format('hh:mm A'));
        temp = moment(temp, 'hh:mm A').add(spit, 'hours').format('hh:mm A');
      }
    }
    return list;
  }

  // event listner of section clicked
  toggleShowPatientHeader(obj) {
    this.patDetailsInIPDHeader.next(obj);
  }

  getAnnotationImage(reqParams): Observable<any> {
    const req = {
      docId: reqParams.userId,
      patientId: reqParams.patientId,
      ipdId: reqParams.ipdId,
      fileName: ''
    };
    const reqUrl = environment.EMR_BaseURL + '/ipd/getImageAnnotations';
    return this.http.post(reqUrl, req).pipe(map((res: any) => {
      // this.setIpdDataBy(this.allIpdDataByKeys, 'imageAnnotation' res.data, req.patientId, req.ipdId);
      return res.data;
    }));
  }

  // setIpdDataBy(localVar, key, data, patId, ipdId) {
  //   const indx = _.findIndex(localVar, (l) => l.patientId == patId && l.ipdId == ipdId && l.key == key);
  //   if (indx !== -1) {
  //     localVar[indx].data = data;
  //   } else {
  //     localVar.push({
  //       patientId: patId,
  //       ipdId: ipdId,
  //       key: key,
  //       data: data
  //     });
  //   }
  // }

  getPagePermissions(key): any {
    const permissionList = this.pageAccessListByRole;
    const userData = this.authService.getUserDetailsByKey('defualt_role');
    const i = permissionList.findIndex((p: any) => p.stateKey === key && +p.roleId === +userData.role_id);
    if (i !== -1) {
      return { ...permissionList[i] };
    } else {
      return null;
    }
  }

  setNursingData(object) {
    const isExistData = _.find(this.nursingNoteData, o => {
      return +o.userId === +object.userId;
    });
    if (isExistData) {
      isExistData.nursingNoteDetails = object.nursingNoteDetails;
    } else {
      this.nursingNoteData.push(object);
    }
  }

  getNursingcareDetails(id) {
    const isExistData = _.find(this.nursingNoteData, o => {
      return +o.userId === +id;
    });
    return isExistData ? isExistData : [];
  }

  // -- get all medicine name by medicine type
  getMedicinesBySearchKeyword(searchKeyword): Observable<any> {
    const reqUrl = environment.dashboardBaseURL + '/Medicine/GetMedicineBySearchKeyword?Keyword=' + searchKeyword;
    return this.http.get(reqUrl).pipe(
      map((res: any) => {
        if (res.status_message === 'Success') {
          return res.Medicine_Data;
        }
        return [];
      })
    );
  }

  savePatientTransfer(param): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/PatientTransfer/PatientTransfer`;
    return this.http.post(reqUrl, param).pipe(
      map((res: any) => {
        return res;
        // if (res.status_message === 'Success' && res.data === true) {
        //   return res;
        // } else {
        //   return null;
        // }
      }));
  }
  getPatientTransferList(param): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/PatientTransfer/GetPatientTransferList`;
    return this.http.post(reqUrl, param).pipe(
      map((res: any) => {
       if (res.status_message === 'Success' && res.data.length !== 0) {
          return res.data;
        } else {
          return [];
        }
      }));
  }
}

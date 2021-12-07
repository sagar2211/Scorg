import { Component, OnInit, OnDestroy, Input, SimpleChanges, OnChanges } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { debounceTime, takeUntil, map } from 'rxjs/operators';
import { Observable, of, Subject, forkJoin } from 'rxjs';
import { DynamicChartService } from './../dynamic-chart.service';
import * as _ from 'lodash';
import { environment } from 'src/environments/environment';
import { Constants } from 'src/app/config/constants';
import { PatientChartService } from '../../patient-chart/patient-chart.service';
import { SuggestionPanel } from './../../public/models/suggestion-panel.modal';
import { IAlert } from './../../public/models/AlertMessage';
import { ComponentsService } from './../../public/services/components.service';
import { PublicService } from './../../public/services/public.service';
import { InvestigationService } from './../../public/services/investigation.service';
import { AuthService } from './../../public/services/auth.service';
import { PrescriptionService } from './../../public/services/prescription.service';
import { Advice } from './../../public/models/advice';
import { CommonService } from './../../public/services/common.service';
import { AddSuggestionMasterComponent } from './../../emr-shared/components/add-suggestion-master/add-suggestion-master.component';
import { ComplaintsService } from './../../public/services/complaints.service';
import { DiagnosisService } from './../../public/services/diagnosis.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-chart-suggestion-panel',
  templateUrl: './chart-suggestion-panel.component.html',
  styleUrls: ['./chart-suggestion-panel.component.scss']
})
export class ChartSuggestionPanelComponent implements OnInit, OnDestroy, OnChanges {
  @Input() suggestionDisplayList: Array<any> = [];
  copyOfSuggestionDisplayList: Array<any> = [];

  oldActiveSuggestListKey: string;
  searchKeyword = '';
  activeSuggestListKey = '';
  userInfo: any;
  patientObj: any;
  userId: number;
  chartId: number;
  examLabelData: any;
  oldExamLebelData: any;
  setAlertMessage: IAlert;
  activeComponentChartDetailId = 0;

  medicineTypes = [];
  medicineItemType = [
    {
      id: 1,
      name: "Desirable"
    },
    {
      id: 2,
      name: "Essential"
    },
    {
      id: 1,
      name: "Vital"
    }
  ]
  selectedMedicineItemType = this.medicineItemType[0];
  selectedMedicineType = null;
  @Input() suggestionPanelSettings: SuggestionPanel;

  @Input() selectedSectionDetails = null;

  // -- subject or observables
  $searchTypeHead: Subject<string> = new Subject();
  $destroy: Subject<boolean> = new Subject<boolean>();

  constructor(
    private activeRoute: ActivatedRoute,
    private dynamicChartService: DynamicChartService,
    private publicService: PublicService,
    private componentsService: ComponentsService,
    private investigationService: InvestigationService,
    private patientChartService: PatientChartService,
    private prescriptionService: PrescriptionService,
    private authService: AuthService,
    private commonService: CommonService,
    private diagnosisService: DiagnosisService,
    private complaintService: ComplaintsService,
    public modalService: NgbModal
  ) { }

  ngOnInit() {
    this.activeRoute.params.subscribe(routeParams => {
      if (routeParams.token) {
        this.initCall(routeParams.chartId);
      } else {
        this.initCall(null);
      }
    });
    this.subjectFun();
  }

  ngOnDestroy() {
    this.$destroy.next(true);
    this.$destroy.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.suggestionDisplayList) {
      if (!this.suggestionDisplayList.length) {
        this.selectedSectionDetails = null;
      }
    }
  }

  initCall(chartId) {
    this.chartId = chartId || this.dynamicChartService.getActiveChartInfo().chartId;
    this.userInfo = this.authService.getUserInfoFromLocalStorage();
    this.getpatientData();
    this.userId = +this.authService.getLoggedInUserId();
    this.getAllMedicineTypes().subscribe();
    this.dynamicChartService.$getEventFrmComponentSection.subscribe(data => {
      this.initialLoadData(data);
    });
  }

  initialLoadData(x) {
    this.activeComponentChartDetailId = x.componentData.chartDetailId;
    if (x.sectionKeyName === 'examination_label') {
      this.examLabelData = x.examLabelData;
    }
    // if (x.sectionKeyName === 'examination_label' ? (!this.oldExamLebelData || (this.oldExamLebelData.headId !== this.examLabelData.headId))
    if (x.sectionKeyName === 'examination_label' ? true
      : this.oldActiveSuggestListKey !== x.sectionKeyName) {
      this.oldExamLebelData = this.examLabelData;
      this.searchKeyword = '';
      this.activeSuggestListKey = x.sectionKeyName;
      this.oldActiveSuggestListKey = x.sectionKeyName;
      this.getComponentDetails(x);
    } else {
      // this.getComponentDetails(x);
      this.updateSuggestionDataByAction(x);
    }
  }

  onClickSuggestionData(item): void {
    item.isChecked = true;
    this.dynamicChartService.sendEventToComponentSection.next({
      sectionKeyName: this.activeSuggestListKey,
      componentData: { chartDetailId: this.activeComponentChartDetailId },
      selectedSuggestion: item,
      action: 'ADD'
    });
  }

  subjectFun(): void {
    this.$searchTypeHead.pipe(debounceTime(500), takeUntil(this.$destroy))
      .subscribe(() => {
        const chartKey = this.componentsService.getChartKeyBySectionKey(this.selectedSectionDetails.key);
        this.dynamicChartService.getChartDataByKey(chartKey, true).subscribe(res => {
          this.loadMoreWithQueryFromServer({ action: 'UPDATE', sectionKeyName: this.selectedSectionDetails.key, selectedData: res });
        });
      });

    this.commonService.$openSuggesstionPanelOnFixedComponentSearchAlways.pipe(debounceTime(500), takeUntil(this.$destroy))
      .subscribe((res) => {
        // console.log(res);
        if (this.suggestionPanelSettings) {
          this.suggestionPanelSettings.isPin = res === 'open' ? false : true;
        } else {
          this.suggestionPanelSettings = {
            suggestionIsShow: true,
            isPin: res === 'open' ? false : true,
          };
        }
        this.commonService.updatePinUnpinForChart(this.suggestionPanelSettings);
        // this.commonService.SaveQueueSettings(Constants.SUGGESTION_PANEL_SETTING, JSON.stringify(this.suggestionPanelSettings), this.userId).subscribe();
      });
  }

  loadMoreWithQueryFromServer(sectionDetailsObj?) {
    const forkJoins = [];
    if (this.activeSuggestListKey === 'prescription') {
      forkJoins.push(this.getAllMedicineList());
    } else if (this.activeSuggestListKey === 'lab_investigation') {
      forkJoins.push(this.getAllInvestigation(Constants.labInvestigationKey));
    } else if (this.activeSuggestListKey === 'investigation') {
      forkJoins.push(this.getAllInvestigation(null));
    } else if (this.activeSuggestListKey === 'radiology_investigation') {
      forkJoins.push(this.getAllInvestigation(Constants.radioInvestigationKey));
    } else if (this.activeSuggestListKey === 'examination_label') {
      forkJoins.push(this.getExamLabelSuggestionList());
    } else if (this.activeSuggestListKey === 'diagnosis') {
      forkJoins.push(this.getDiagnosisList());
    } else if (this.activeSuggestListKey === 'complaints') {
      forkJoins.push(this.getComplaintsList());
    } else if (this.activeSuggestListKey === 'advice') {
      forkJoins.push(this.getAdviceList());
    }
    forkJoin(forkJoins).subscribe((res: Array<any>) => {
      // this.suggestionDisplayList = [...this.copyOfSuggestionDisplayList] = res[0];
      this.suggestionDisplayList = res[0];
      if (sectionDetailsObj) {
        this.updateSuggestionDataByAction(sectionDetailsObj);
      }
    });
  }

  getComponentDetails(sectionDetailsObj) {
    this.selectedSectionDetails = _.cloneDeep(this.componentsService.getComponentDetailsByKey(sectionDetailsObj.sectionKeyName));
    this.selectedSectionDetails = this.selectedSectionDetails.data ? this.selectedSectionDetails.data : this.selectedSectionDetails;
    if (sectionDetailsObj.hasOwnProperty('sectionName')) {
      if (sectionDetailsObj.sectionName !== '') {
        this.selectedSectionDetails.name = sectionDetailsObj.sectionName;
      }
    }
    if (sectionDetailsObj.hasOwnProperty('componentData')) {
      this.selectedSectionDetails.componentData = sectionDetailsObj.componentData;
    }
    if (sectionDetailsObj.action === 'ADD') { // -- ADD
      this.updateSuggestionDataByAction(sectionDetailsObj);
    } else if (sectionDetailsObj.action === 'SEARCH') {
      // console.log(sectionDetailsObj, 'afdaydais');
    } else { // -- UPDATE
      this.loadMoreWithQueryFromServer(sectionDetailsObj);
    }
  }

  // -- get prescription medicines
  getAllMedicineList(): Observable<any> {
    const pageNo = 1;
    const limit = 100;
    const strictMatch = 0;
    const medicineType = '';
    return this.publicService.getMedicineSuggestionListOnLoad(limit, this.searchKeyword, 0, 0, this.userId, this.chartId).pipe(map((response: any) => {
      return response.data.others;
    })
    );
  }

  getAllInvestigation(type): Observable<any> {
    const param = {
      search_keyword: this.searchKeyword ? this.searchKeyword : '',
      investigation_type: type,
      service_type_id: this.patientObj ? this.patientObj.serviceType.id : 0,
      speciality_id: this.userInfo.speciality_id,
      user_id: this.userId,
      chart_id: this.chartId,
      skip_index: 0,
      limit: environment.limitDataToGetFromServer
    };
    return this.investigationService.getInvestigationSuggestionList(param).pipe(map((response: any) => {
      this.suggestionDisplayList = response;
      return response;
    })
    );
  }

  getExamLabelSuggestionList(): Observable<any> {
    const reqParams = {
      exam_head_id: this.examLabelData.headId,
      search_keyword: this.searchKeyword ? this.searchKeyword : null,
      // service_type_id: this.patientObj ? this.patientObj.serviceType.id : 0,
      service_type_id: 2,
      // speciality_id: this.userInfo.speciality_id,
      speciality_id: 1,
      user_id: this.userId,
      chart_id: this.chartId,
      skip_index: 0,
      limit: 50
    };
    return this.patientChartService.GetExaminationSuggestionList(reqParams).pipe(map((response: any) => {
      this.suggestionDisplayList = _.cloneDeep(response);
      return response;
    })
    );
  }

  updateSuggestionDataByAction(selectedSectionData: { sectionKeyName: string, action?: string, selectedData?: any, componentData?: any }): void {
    const sectionData = selectedSectionData.selectedData;
    let suggestionListIdProp = '';
    let selectedSectionDataProp = '';

    switch (this.activeSuggestListKey) {
      case 'prescription':
        suggestionListIdProp = 'id';
        selectedSectionDataProp = 'id';
        break;
      case 'lab_investigation':
        suggestionListIdProp = 'id';
        selectedSectionDataProp = 'id';
        break;
      case 'radiology_investigation':
        suggestionListIdProp = 'id';
        selectedSectionDataProp = 'id';
        break;
      case 'investigation':
        suggestionListIdProp = 'id';
        selectedSectionDataProp = 'id';
        break;
      case 'examination_label':
        suggestionListIdProp = 'id';
        selectedSectionDataProp = 'id';
        break;
      case 'diagnosis':
        suggestionListIdProp = 'id';
        selectedSectionDataProp = 'diagnosis_id';
        break;
      case 'complaints':
        suggestionListIdProp = 'id';
        selectedSectionDataProp = 'complaint_id';
        break;
    }

    switch (selectedSectionData.action) {
      case 'ADD': // Object. called when item is removed from component.
        const findData = this.suggestionDisplayList.find(dt => +dt[suggestionListIdProp] === +sectionData[selectedSectionDataProp]);
        if (findData) {
          findData.isChecked = false;
        }
        break;
      case 'UPDATE': // Array. called when items are added to component or component is loaded initially. Sugegestion isCheked flag updated.
        if (sectionData) {
          sectionData.forEach(element => {
            const data = this.suggestionDisplayList.find(dt => +dt[suggestionListIdProp] === +element[selectedSectionDataProp]);
            if (data) {
              data.isChecked = true;
            }
          });
        }
        break;
      case 'SEARCH': // Array. called when items are added to component or component is loaded initially. Sugegestion isCheked flag updated.
        this.searchKeyword = selectedSectionData.selectedData;
        this.$searchTypeHead.next();
        break;
    }
  }

  checkKeyExist(key) {
    const arrayFixedCompListKey = [
      'prescription',
      'complaints',
      'diagnosis',
      'lab_investigation',
      'radiology_investigation',
      'investigation'
    ];
    return arrayFixedCompListKey.includes(key) ? true : false;
  }

  getAdviceList(): Observable<any> {
    const reqParams = {
      search_keyword: this.searchKeyword ? this.searchKeyword : '',
      service_type_id: this.patientObj ? this.patientObj.serviceType.id : 0,
      langauge_id: +this.selectedSectionDetails.componentData.languageId,
      speciality_id: this.userInfo.speciality_id,
      user_id: this.userId,
      chart_id: this.chartId,
      skip_index: 0,
      limit: 10
    };
    return this.prescriptionService.getAdviceTemplateSuggestionList(reqParams).pipe(map(res => {
      const adviceSuggestion = [];
      _.forEach(res, (o) => {
        const adviceObj = new Advice();
        if (adviceObj.isObjectValid(o)) {
          adviceObj.generateObject(o);
          adviceSuggestion.push(adviceObj);
        }
      });
      return adviceSuggestion;
    }));
  }

  getpatientData(patient?) {
    if (patient) {
      this.patientObj = patient;
    } else {
      this.patientObj = this.commonService.getLastActivePatient();
    }
  }


  getDiagnosisList(): Observable<any> {
    const obj = {
      limit: 100,
      search_keyword: this.searchKeyword,
      service_type_id: this.patientObj ? this.patientObj.serviceType.id : 0,
      speciality_id: this.userInfo.speciality_id,
      user_id: this.userId,
      chart_id: this.chartId,
      skip_index: 0,
    };
    return this.diagnosisService.getDiagnosisSuggestionList(obj).pipe(map((response: any) => {
      // if (response.diagnosis_data.length) {
      this.suggestionDisplayList = response.diagnosis_data;
      return response.diagnosis_data;
      // }
    })
    );
  }

  getComplaintsList(): Observable<any> {
    const obj = {
      limit: 100,
      search_keyword: this.searchKeyword,
      service_type_id: this.patientObj ? this.patientObj.serviceType.id : 0,
      speciality_id: this.userInfo.speciality_id,
      user_id: this.userId,
      chart_id: this.chartId,
      skip_index: 0,
    };
    return this.complaintService.getComplaintsSuggestionList(obj).pipe(map((response: any) => {
      // if (response.complaint_data.length) {
      _.map(response.complaint_data, comp => {
        comp.isFav = comp.suggestion_flag === 'user_fav' ? true : false;
      });
      this.suggestionDisplayList = response.complaint_data;
      return response.complaint_data;
      // }
    })
    );
  }

  onClickPinUnpin(): void {
    if (this.suggestionPanelSettings) {
      this.suggestionPanelSettings.isPin = !this.suggestionPanelSettings.isPin;
    } else {
      this.suggestionPanelSettings = {
        suggestionIsShow: true,
        isPin: true,
      };
    }
    this.commonService.updatePinUnpinForChart(this.suggestionPanelSettings);
    this.commonService.SaveQueueSettings(Constants.SUGGESTION_PANEL_SETTING, JSON.stringify(this.suggestionPanelSettings), this.userId).subscribe();
  }

  savefavSuggesstion(item, index) {
    switch (this.activeSuggestListKey) {
      case 'prescription':
        this.savePrescriptionFav(item, index);
        break;
      case 'lab_investigation':
        this.saveInvestigationFav(item, index);
        break;
      case 'radiology_investigation':
        this.saveInvestigationFav(item, index);
        break;
      case 'investigation':
        this.saveInvestigationFav(item, index);
        break;
      case 'examination_label':
        // this.saveInvestigationFav(item, index);
        break;
      case 'diagnosis':
        this.saveDiagnosisFav(item, index);
        break;
      case 'complaints':
        this.saveComplaintFav(item, index);
        break;
      case 'advice':
        this.saveAdviceFav(item, index);
        break;
    }
  }

  notifyAlertMessage(data): void {
    this.setAlertMessage = {
      message: data.msg,
      messageType: data.class,
      duration: Constants.ALERT_DURATION
    };
  }

  saveAdviceFav(item, index) {
    const param = [{
      advice_id: item.id,
      service_type_id: this.patientObj && this.patientObj.serviceType ? this.patientObj.serviceType.id : 0,
      speciality_id: this.userInfo.speciality_id,
      user_id: this.userId,
      chart_id: this.chartId,
      is_favorite: !item.isFav,
    }];
    this.patientChartService.saveAdviceFav(param).subscribe(res => {
      if (res) {
        this.suggestionDisplayList[index].isFav = !item.isFav;
        this.updateArraySequence(index, this.suggestionDisplayList[index].isFav);
        this.notifyAlertMessage({
          msg: 'Favourite Updated!',
          class: 'success',
        });
      }
    });
  }

  saveComplaintFav(item, index) {
    const param = [{
      complaint_id: item.id,
      service_type_id: this.patientObj && this.patientObj.serviceType ? this.patientObj.serviceType.id : 0,
      speciality_id: this.userInfo.speciality_id,
      user_id: this.userId,
      chart_id: this.chartId,
      is_favorite: !item.isFav,
    }];
    this.patientChartService.saveComplaintFav(param).subscribe(res => {
      if (res) {
        this.suggestionDisplayList[index].isFav = !item.isFav;
        this.updateArraySequence(index, this.suggestionDisplayList[index].isFav);
        this.notifyAlertMessage({
          msg: 'Favourite Updated!',
          class: 'success',
        });
      }
    });
  }

  saveDiagnosisFav(item, index) {
    const param = [{
      diagnosis_id: item.id,
      service_type_id: this.patientObj && this.patientObj.serviceType ? this.patientObj.serviceType.id : 0,
      speciality_id: this.userInfo.speciality_id,
      user_id: this.userId,
      chart_id: this.chartId,
      is_favorite: !item.isFav,
    }];
    this.patientChartService.saveDiagnosisFav(param).subscribe(res => {
      if (res) {
        this.suggestionDisplayList[index].isFav = !item.isFav;
        this.updateArraySequence(index, this.suggestionDisplayList[index].isFav);
        this.notifyAlertMessage({
          msg: 'Favourite Updated!',
          class: 'success',
        });
      }
    });
  }

  saveInvestigationFav(item, index) {
    const param = [{
      investigation_id: item.id,
      service_type_id: this.patientObj && this.patientObj.serviceType ? this.patientObj.serviceType.id : 0,
      speciality_id: this.userInfo.speciality_id,
      user_id: this.userId,
      chart_id: this.chartId,
      is_favorite: !item.isFav,
    }];
    this.patientChartService.saveInvestigationFav(param).subscribe(res => {
      if (res) {
        this.suggestionDisplayList[index].isFav = !item.isFav;
        this.updateArraySequence(index, this.suggestionDisplayList[index].isFav);
        this.notifyAlertMessage({
          msg: 'Favourite Updated!',
          class: 'success',
        });
      }
    });
  }

  savePrescriptionFav(item, index) {
    const param = [{
      medicine_id: item.id,
      service_type_id: this.patientObj && this.patientObj.serviceType ? this.patientObj.serviceType.id : 0,
      speciality_id: this.userInfo.speciality_id,
      user_id: this.userId,
      chart_id: this.chartId,
      is_favorite: !item.isFav,
    }];
    this.patientChartService.savePrescriptionFav(param).subscribe(res => {
      if (res) {
        this.suggestionDisplayList[index].isFav = !item.isFav;
        this.updateArraySequence(index, this.suggestionDisplayList[index].isFav);
        this.notifyAlertMessage({
          msg: 'Favourite Updated!',
          class: 'success',
        });
      }
    });
  }

  updateArraySequence(index, fav) {
    const listArray = [];
    if (fav) {
      listArray.push(this.suggestionDisplayList[index]);
      _.map(this.suggestionDisplayList, (sugg, i) => {
        if (i !== index) {
          listArray.push(sugg);
        }
      });
      this.suggestionDisplayList = _.cloneDeep(listArray);
    } else {
      _.map(this.suggestionDisplayList, (sugg, i) => {
        if (i !== index) {
          listArray.push(sugg);
        }
      });
      listArray.push(this.suggestionDisplayList[index]);
      this.suggestionDisplayList = _.cloneDeep(listArray);
    }
  }

  addMasterDataFromSuggestion(): void {
    const modelInstancePopup = this.modalService.open(AddSuggestionMasterComponent, {
      backdrop: 'static',
      keyboard: false,
      windowClass: 'custom-modal',
      size: 'sm'
    });
    modelInstancePopup.componentInstance.masterName = this.selectedSectionDetails.name;
    modelInstancePopup.componentInstance.placeHolderName = 'Add new ' + this.selectedSectionDetails.name;
    modelInstancePopup.componentInstance.selectedText = this.searchKeyword;
    modelInstancePopup.componentInstance.newSuggNameEvent.subscribe((e: any) => {
      this.saveMasterData(e);
    });
    modelInstancePopup.result.then(result => {
    });
  }

  saveMasterData(event) {
    if (this.activeSuggestListKey === 'diagnosis') {
      this.diagnosisService.addDiagnosisData(event).subscribe((res: any) => {
        if (res.status_message === 'Success') {
          this.savedSuccess(res);
          const tempSuggestionObj = {
            IsActive: true,
            description: null,
            id: res.uhid,
            isFav: false,
            isIcd: false,
            name: event
          };
          this.$searchTypeHead.next();
        } else {
          this.savedFailure(res);
        }
      });
    } else if (this.activeSuggestListKey === 'complaints') {
      this.complaintService.addComplaintData(event).subscribe((res: any) => {
        if (res.status_message === 'Success') {
          this.savedSuccess(res);
          const tempSuggestionObj = {
            complaintName: event,
            id: res.uhid,
            isFav: false,
            is_active: true,
            name: event,
            suggestion_flag: 'others'
          };
          this.$searchTypeHead.next();
        } else {
          this.savedFailure(res);
        }
      });
    }
  }

  checkKeyForAddMaster(key) {
    const arrayFixedCompListKey = [
      'complaints',
      'diagnosis',
    ];
    return arrayFixedCompListKey.includes(key) ? true : false;
  }

  savedSuccess(res) {
    this.setAlertMessage = {
      message: this.selectedSectionDetails.name + ' saved Successfully.',
      messageType: 'success',
      duration: Constants.ALERT_DURATION
    };
  }
  savedFailure(res) {
    this.setAlertMessage = {
      message: this.selectedSectionDetails.name + ' not saved..',
      messageType: 'danger',
      duration: Constants.ALERT_DURATION
    };
  }

  addMedicine() {
    if (this.searchKeyword
      && this.selectedMedicineItemType
      && this.selectedMedicineItemType.id
      && this.selectedMedicineType
      && this.selectedMedicineType.id
    ) {
      const param = {
        itemDescription: this.searchKeyword,
        categoryId: this.selectedMedicineItemType.id,
        medicineType: this.selectedMedicineType.id
      }
      this.prescriptionService.addNewMedicine(param).subscribe((response) => {
        const param = {
          id: response.itemId,
          name: response.itemDescription,
          MedicineTypeID: this.selectedMedicineType.id,
          Price: null,
          generic_name: null,
          genric_name: null,
          instructions: "",
          instructions_hindi: "",
          instructions_marathi: "",
          isFav: false,
          is_favourite: "0",
          suggestion_flag: "others",
          use_count: "0",
          type: "new_added_suggestion"
        }

        this.onClickSuggestionData(param);
      })
    } else if (!this.selectedMedicineItemType) {
      this.setAlertMessage = {
        message: "Please Select Item Type",
        messageType: 'danger',
        duration: Constants.ALERT_DURATION
      };
    } else if (!this.selectedMedicineType) {
      this.setAlertMessage = {
        message: "Please Select Medicine Type",
        messageType: 'danger',
        duration: Constants.ALERT_DURATION
      };
    }
  }

  getAllMedicineTypes(): Observable<any> {
    return this.publicService.getMasterMedicineTypes().pipe(map(res => {
      this.medicineTypes = res;
    }));
  }

}

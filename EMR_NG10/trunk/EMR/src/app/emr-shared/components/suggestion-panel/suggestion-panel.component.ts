import { Component, OnInit, OnDestroy, Output, EventEmitter, Input, ViewEncapsulation, OnChanges } from '@angular/core';
import * as _ from 'lodash';
import { debounceTime, map, takeUntil } from 'rxjs/operators';
import { forkJoin, of, Subject, Observable } from 'rxjs';
import { AuthService } from './../../../public/services/auth.service';
import { OrderService } from './../../../public/services/order.service';
import { ConsultationService } from './../../../public/services/consultation.service';
import { ExaminationLabelsService } from './../../../public/services/examination-labels.service';
import { DiagnosisService } from './../../../public/services/diagnosis.service';
import { ComplaintsService } from './../../../public/services/complaints.service';
import { RadiologyTestService } from './../../../public/services/radiology-test.service';
import { LabTestService } from './../../../public/services/lab-test.service';
import { ComponentsService } from './../../../public/services/components.service';
import { PublicService } from './../../../public/services/public.service';
import { MedicineOrders } from './../../../public/models/medicine-orders';
import { NursingOrder } from './../../../public/models/nursing-order';
import { DietOrder } from './../../../public/models/diet-order';
import { DoctorInformationOrder, OtherServicesOrder } from './../../../public/models/doctor-information-order';
import { PatientChartService } from './../../../patient-chart/patient-chart.service';

@Component({
  selector: 'app-suggestion-panel',
  templateUrl: './suggestion-panel.component.html',
  styleUrls: ['./suggestion-panel.component.scss']
})
export class SuggestionPanelComponent implements OnInit, OnDestroy, OnChanges {
  showSuggestion: boolean;
  selectedSectionDetails: any;
  activeSuggestListKey: string;
  searchKeyword = '';
  oldActiveSuggestListKey: string;

  maxUseCount: any;
  maxUseCountBackend = 0;
  maxpPrcentage = 70;

  showLoader: boolean;
  busyFav = true;
  busyOther = true;
  busyFreqUse = true;
  isFreqUse: boolean;
  isUseOther: boolean;
  isUseFav: boolean;
  allowCheckbox = true;
  isFaq: boolean;
  complaintList: any = [];
  tagsList: any = [];
  lazyLoadingFavList = [];
  lazyLoadingOtherList = [];
  lazyLoadingFrequentlyUseList = [];
  faqData: any = {};
  rightPanelSetting: any;
  lastUseCount: any;
  searchFaqSubSectionText = '';
  masterScrollLoadingOption = {
    favPageNo: 1,
    otherPageNo: 1,
    freqUsePageNo: 1,
    favResultExists: true,
    otherResultExists: true,
    ['freqUseResultExists']: true,
    limit: 50, searchKeyword: ''
  };
  scrollLoadingOption: any = this.ngCopy(this.masterScrollLoadingOption);
  historyLimit = 0;

  subject: Subject<string> = new Subject();
  ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  activeTagHeadKey = '';
  nursingOrders: any[] = [];
  dietOrders: any[] = [];
  doctorInstruOrderList: any[] = [];
  otherServiceOrderList: any[] = [];
  modelpopupName: boolean;
  patProfileIsOpen: string;
  ordersOrderSetId: number;
  @Input() public suggestionPanelSettings: any;
  @Output() suggestionPanelEvent = new EventEmitter<any>();
  @Output() selectedComponetEve = new EventEmitter<any>();
  @Input() isOnload: boolean;
  @Input() showInputSearchBox: boolean;
  @Input() showHeading: boolean;
  @Input() isFrom;
  @Input() showCombinedList: boolean;
  @Output() closeOrderSetSuggestionSection = new EventEmitter<any>();
  // model instances
  nursingOrderInst = new NursingOrder();
  dietOrderInst = new DietOrder();
  orderSetDetails: any;
  departmentPersonalFlag: false;
  userInfo: any;
  servicePageNo: number = 1;;

  constructor(
    private publicService: PublicService,
    private componentsService: ComponentsService,
    private complaintsService: ComplaintsService,
    private labTestService: LabTestService,
    private radiologyTestService: RadiologyTestService,
    private diagnosisService: DiagnosisService,
    private examinationLabelService: ExaminationLabelsService,
    private consultationService: ConsultationService,
    private ordersService: OrderService,
    private authService: AuthService,
    private patientChartService: PatientChartService
  ) { }

  ngOnInit() {
    this.userInfo = this.authService.getUserInfoFromLocalStorage();
    if (_.isUndefined(this.showHeading)) {
      this.showHeading = true;
    }
    this.showSuggestion = true;
    this.showInputSearchBox = false;
    this.rightPanelSetting = this.publicService.rightPanelSetting;
    this.ordersOrderSetId = null;
    if (this.isOnload) {
      // this.loadAllMaster().subscribe(res => {
      this.initialLoadData(this.isFrom);
      // });
    } else {
      // this.loadAllMaster().subscribe();
      // -- subscribe if any component section is clicked
      this.publicService.$compSectionClicked.pipe(takeUntil(this.ngUnsubscribe)).subscribe(componentSec => {
        // this.loadOrderMaster().subscribe(res => {
        this.initialLoadData(componentSec);
        // });
      });
    }

    this.subjectFun(); // subscribe the subject with debounceTime
    this.subcribeEvents();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next(true);
    this.ngUnsubscribe.unsubscribe();
  }

  ngOnChanges() {
  }
  initialLoadData(compSec) {
    this.showLoader = true;
    if (compSec.sectionKeyName === 'faq_section') {
      this.faqData = compSec;
      this.isFaq = true;
      this.showLoader = false;
      this.activeSuggestListKey = compSec.sectionKeyName;
      this.oldActiveSuggestListKey = compSec.sectionKeyName;
      this.suggestionPanelSettings.opdSuggestActiveTab = compSec.sectionKeyName;
      this.lazyLoadingFavList = [];
      this.lazyLoadingOtherList = [];
      this.lazyLoadingFrequentlyUseList = [];
      this.selectedSectionDetails = this.componentsService.getComponentDetailsByKey(this.activeSuggestListKey);
      this.selectedSectionDetails = this.selectedSectionDetails.data;
      this.suggestionPanelSettings.suggestionIsShow = true;
    } else {
      this.isFaq = false;
      if (this.oldActiveSuggestListKey !== compSec.sectionKeyName) {
        const sectionKeyName = (compSec.sectionName === 'Other' && compSec.subSectionKeyName) ? compSec.subSectionKeyName : compSec.sectionKeyName;
        this.searchKeyword = '';
        this.modelpopupName = compSec.modelpopup === 'OrdersPopup' ? true : false;
        this.activeSuggestListKey = sectionKeyName;
        this.oldActiveSuggestListKey = sectionKeyName;
        this.suggestionPanelSettings.opdSuggestActiveTab = sectionKeyName;
        if (!_.isUndefined(compSec['sourceKey']) && compSec['sourceKey'] === 'ordersOrderSet') {
          this.ordersOrderSetId = compSec['ordersOrderSetId'];
          this.orderSetDetails = compSec;
        } else {
          this.ordersOrderSetId = null;
          this.orderSetDetails = null;
        }
        this.getComponentDetails(compSec);
        this.suggestionPanelSettings.suggestionIsShow = true;
      } else {
        if ((this.activeSuggestListKey === compSec.sectionKeyName)) {
          if (this.activeSuggestListKey === 'tagList') {
            this.activeSuggestListKey = compSec.sectionKeyName;
            this.suggestionPanelSettings.opdSuggestActiveTab = compSec.sectionKeyName;
            this.activeTagHeadKey = compSec.tagHeadKey;
            this.allowCheckbox = compSec.allowCheckbox;
            this.searchKeyword = compSec.searchKeyword;
            this.getComponentDetails(compSec);
          } else {
            if (!_.isUndefined(compSec['sourceKey']) && compSec['sourceKey'] === 'ordersOrderSet') {
              this.ordersOrderSetId = compSec['ordersOrderSetId'];
              this.orderSetDetails = compSec;
            } else {
              this.ordersOrderSetId = null;
              this.orderSetDetails = null;
            }
            // this.mergeSuggestionWithOpdList(this.lazyLoadingFavList, 1, true);
            // this.mergeSuggestionWithOpdList(this.lazyLoadingFrequentlyUseList, 2, true);
            this.mergeSuggestionWithOpdList(_.cloneDeep(this.lazyLoadingOtherList), 0, true);
            this.showLoader = false;
            return;
          }
        }
      }
    }
  }

  subjectFun() {
    // -- Subscribe to the subject, which is triggered from search input and when section clicked
    // -- When the debounce time has passed, we call loadMoreWithQueryFromServer()
    this.subject
      .pipe(debounceTime(500), takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.loadMoreWithQueryFromServer();
      }
      );
  }

  getComponentDetails(sectionDetailsObj) {
    this.selectedSectionDetails = _.cloneDeep(this.componentsService.getComponentDetailsByKey(sectionDetailsObj.sectionKeyName));
    this.selectedSectionDetails = this.selectedSectionDetails.data;
    if (sectionDetailsObj.hasOwnProperty('sectionName')) {
      if (sectionDetailsObj.sectionName !== '') {
        this.selectedSectionDetails.name = sectionDetailsObj.sectionName === 'Other' && sectionDetailsObj.subSectionKeyName
          ? sectionDetailsObj.subSectionKeyName : sectionDetailsObj.sectionName;
      }
    }
    this.loadMoreWithQueryFromServer();
  }

  loadMoreWithQueryFromServer() {
    const forkJoins = [];
    this.maxUseCount = 0;
    this.maxUseCountBackend = 0;
    this.maxpPrcentage = 70;
    this.showLoader = true;
    this.busyFav = true;
    this.busyOther = true;
    this.lazyLoadingFavList = [];
    this.lazyLoadingOtherList = [];
    this.lazyLoadingFrequentlyUseList = [];
    this.scrollLoadingOption = this.ngCopy(this.masterScrollLoadingOption);
    this.scrollLoadingOption['searchKeyword'] = this.searchKeyword || '';

    // load medicine data with pagination
    if (false) {
    //if (this.scrollLoadingOption['searchKeyword'] === '') {
      if (this.activeSuggestListKey === 'prescription') {
        forkJoins.push(this.getMedicineSuggestionListOnLoad(false));
      } else if (this.activeSuggestListKey === 'medicineOrders') {
        forkJoins.push(this.getMedicineSuggestionListOnLoad(false));
      } else if (this.activeSuggestListKey === 'cardiac_investigations'
        || this.activeSuggestListKey === 'labOrders' || this.activeSuggestListKey === 'lab_test' || this.activeSuggestListKey === 'radiology_test'
        || this.activeSuggestListKey === 'radiologyOrders') {
        forkJoins.push(this.getInvestigationSuggestionListOnLoad(false));
      } else if (this.activeSuggestListKey === 'dietOrders') {
        forkJoins.push(this.getAllDietOrders(false));
      } else if (this.activeSuggestListKey === 'nursingOrders') {
        forkJoins.push(this.getAllNursingOrders(false));
      } else if (this.activeSuggestListKey === 'Doctor Instruction') {
        forkJoins.push(this.getAllDoctorInfoOrderList(false));
      } else if (this.activeSuggestListKey === 'Services with Notes') {
        forkJoins.push(this.getAllServicesListForOtherOrder(false));
      }
      // else {
      //   forkJoins.push(this.loadMoreFavAndOther(1, true));
      //   forkJoins.push(this.loadMoreFavAndOther(0, true));
      //   forkJoins.push(this.loadMoreFavAndOther(2, true));
      // }
      forkJoin(forkJoins).subscribe(() => {
        this.busyFav = false;
        this.busyOther = false;
        this.showLoader = false;
        // def.resolve('both list loaded');
      });
    } else {
      this.loadMoreFavAndOther(true);
    }
  }

  loadMoreFavAndOther(skipMerge) {
    const forkJoins = [];
    if (this.activeSuggestListKey === 'medicineOrders') {
      forkJoins.push(this.getMedicineSuggestionListOnLoad(skipMerge));
    } else if (this.activeSuggestListKey === 'lab_test' || this.activeSuggestListKey === 'radiology_test' || this.activeSuggestListKey === 'labOrders'
      || this.activeSuggestListKey === 'cardiac_investigations' || this.activeSuggestListKey === 'radiologyOrders') {
      forkJoins.push(this.getInvestigationSuggestionListOnLoad(skipMerge));
    } else if (this.activeSuggestListKey === 'nursingOrders') {
      forkJoins.push(this.getAllNursingOrders(skipMerge));
    } else if (this.activeSuggestListKey === 'dietOrders') {
      forkJoins.push(this.getAllDietOrders(skipMerge));
    } else if (this.activeSuggestListKey === 'Doctor Instruction') {
      forkJoins.push(this.getAllDoctorInfoOrderList(skipMerge));
    } else if (this.activeSuggestListKey === 'Services with Notes') {
      forkJoins.push(this.getAllServicesListForOtherOrder(skipMerge));
    }
    forkJoin(forkJoins).subscribe(() => {
      this.busyFav = false;
      this.busyOther = false;
      this.showLoader = false;
      // def.resolve('both list loaded');
    });
  }

  filterSuggestionList(list, isFavourite) {
    const pageNo = ((isFavourite === 1 || isFavourite === -1) ? this.scrollLoadingOption['favPageNo'] :
      (isFavourite === 2) ? this.scrollLoadingOption['freqUsePageNo'] : this.scrollLoadingOption['otherPageNo']);
    const limit = this.scrollLoadingOption['limit'];
    const searchKeyword = this.scrollLoadingOption['searchKeyword'];
    let filterList;

    if ((isFavourite === 1 || isFavourite === -1)) {
      filterList = _.filter(list, (o) => {
        return typeof o.name === 'string' && o.name.toLowerCase().indexOf(searchKeyword.toLowerCase()) > -1
          && o.is_favourite === (isFavourite === -1 ? o.is_favourite : isFavourite);
      });
    } else if (isFavourite === 0) {
      filterList = _.filter(list, (o) => {
        return typeof o.name === 'string' && o.name.toLowerCase().indexOf(searchKeyword.toLowerCase()) > -1
          && o.is_favourite === isFavourite
          && (o.use_count < this.maxUseCount || (this.maxUseCount === 0 && o.use_count === 0));
      });
    } else if (isFavourite === 2) {
      filterList = _.filter(list, (o) => {
        return typeof o.name === 'string' && o.name.toLowerCase().indexOf(searchKeyword.toLowerCase()) > -1
          && o.is_favourite === 0
          && o.use_count > this.maxUseCount;
      });
    }
    // filter data for pagination
    const splitFrom = ((pageNo * limit) - (limit - 1)) > filterList.length ? filterList.length : (((pageNo * limit) - (limit - 1)) - 1);
    const splitTo = splitFrom === filterList.length ? filterList.length : limit;
    const response = filterList.splice(splitFrom, splitTo);

    if ((isFavourite === 1 || isFavourite === -1)) {
      if (response.length === limit) {
        this.scrollLoadingOption['favPageNo']++;
      }
      this.scrollLoadingOption['favResultExists'] = (response.length === limit);
    } else if (isFavourite === 0) {
      if (response.length === limit) {
        this.scrollLoadingOption['otherPageNo']++;
      }
      this.scrollLoadingOption['otherResultExists'] = (response.length === limit);
    } else if (isFavourite === 2) {
      if (response.length === limit) {
        this.scrollLoadingOption['freqUsePageNo']++;
      }
      this.scrollLoadingOption['freqUseResultExists'] = (response.length === limit);
    }
    return response;
  }

  mergeSuggestionWithOpdList(list, isFavourite, skipMerging?) { // for delete isFavourite pass '' and for lazyloading pass 0
    _.map(list, (data) => {
      data.is_favourite = (data.is_favourite === 1) ? 1 : 0;
      data.checked = false;
    });

    // tslint:disable-next-line: one-variable-per-declaration
    let opdInputs: any = [], filterListKey = '', filterOpdKey = '', filterKeyObj = '';
    let opdTagInputs = {};
    const patientId = this.consultationService.getPatientObj('patientId');

    if (this.activeSuggestListKey === 'complaints') {
      filterListKey = 'id';
      filterOpdKey = 'id';
      // this.complaintsService.getComplaintTypeData().subscribe(x => opdInputs = x);
      opdInputs = this.consultationService.getConsultationFormDataByKey(patientId, 'complaints');
    } else if (this.activeSuggestListKey === 'diagnosis') {
      filterListKey = 'id';
      filterOpdKey = 'id';
      this.diagnosisService.getDiagnosisData().subscribe(x => opdInputs = x);
    } else if (this.activeSuggestListKey === 'tagList' && this.allowCheckbox) {
      filterListKey = 'tag_key';
      filterOpdKey = 'tagKey';
      opdTagInputs = this.examinationLabelService.getAllTagModules();
    } else if (this.activeSuggestListKey === 'tagList' && !this.allowCheckbox) {
      filterListKey = 'tag_name';
      filterOpdKey = 'tagName';
      opdTagInputs = this.examinationLabelService.getAllTagModules();
    } else if (this.activeSuggestListKey === 'prescription') {
      filterListKey = 'id';
      filterOpdKey = 'medicineId';
      opdInputs = this.consultationService.getConsultationFormDataByKey(patientId, 'patPrescriptions');
    } else if (this.activeSuggestListKey === 'medicineOrders') {
      filterListKey = 'id';
      filterOpdKey = 'id';
      filterKeyObj = 'medicineObj';
      // this.consultationService.getConsultationFormDataByKey(patientId, 'medicineOrders', true)
      opdInputs = (this.ordersOrderSetId === null) ? this.ordersService.getOrderData('medicineOrders', true) :
        this.getOpdInputsFromOrdersOrderSet(patientId);
    } else if (this.activeSuggestListKey === 'labOrders') {
      filterListKey = 'id';
      filterOpdKey = 'id';
      filterKeyObj = 'labInvestigationObj';
      opdInputs = (this.ordersOrderSetId === null) ? this.ordersService.getOrderData('labOrders', true) :
        this.getOpdInputsFromOrdersOrderSet(patientId);

    } else if (this.activeSuggestListKey === 'lab_test') {
      filterListKey = 'id';
      filterOpdKey = 'id';
      this.labTestService.getLabTestFormData().subscribe(x => opdInputs = x);

    } else if (this.activeSuggestListKey === 'cardiac_investigations') {
      filterListKey = 'id';
      filterOpdKey = 'id';
      // opdInputs = OpdService.getOpdObject("investigationCardiacInputs");
    } else if (this.activeSuggestListKey === 'radiologyOrders') {
      filterListKey = 'id';
      filterOpdKey = 'id';
      filterKeyObj = 'radioInvestigationObj';
      opdInputs = (this.ordersOrderSetId === null) ? this.ordersService.getOrderData('radiologyOrders', true) : this.getOpdInputsFromOrdersOrderSet(patientId);
    } else if (this.activeSuggestListKey === 'radiology_test') {
      filterListKey = 'id';
      filterOpdKey = 'id';
      this.radiologyTestService.getRadiologyTestData().subscribe(x => opdInputs = x);

    } else if (this.activeSuggestListKey === 'procedures') {
      filterListKey = 'id';
      filterOpdKey = 'id';
      // opdInputs = OpdService.getOpdObject("procedureInputs");
    } else if (this.activeSuggestListKey === 'primaryCheckUpList') {
      filterListKey = 'checkup_reason_id';
      filterOpdKey = 'checkup_reason_id';
      // opdInputs = OpdService.getOpdObject("primary_checkup_opd");
    } else if (this.activeSuggestListKey === 'nursingOrders') {
      filterListKey = 'nursingId';
      filterOpdKey = 'nursingId';
      opdInputs = (this.ordersOrderSetId === null) ? this.ordersService.getOrderData('nursingOrders', true) : this.getOpdInputsFromOrdersOrderSet(patientId);
    } else if (this.activeSuggestListKey === 'dietOrders') {
      filterListKey = 'dietId';
      filterOpdKey = 'dietId';
      opdInputs = (this.ordersOrderSetId === null) ? this.ordersService.getOrderData('dietOrders', true) : this.getOpdInputsFromOrdersOrderSet(patientId);
    } else if (this.activeSuggestListKey === 'Doctor Instruction') {
      filterListKey = 'instructionId';
      filterOpdKey = 'instructionId';
      opdInputs = (this.ordersOrderSetId === null) ? this.ordersService.getOrderData('otherOrders', true) : this.getOpdInputsFromOrdersOrderSet(patientId);
      opdInputs = opdInputs ? opdInputs.docInstructionOrder : [];
    } else if (this.activeSuggestListKey === 'Services with Notes') {
      filterListKey = 'serviceId';
      filterOpdKey = 'serviceId';
      opdInputs = (this.ordersOrderSetId === null) ? this.ordersService.getOrderData('otherOrders', true) : this.getOpdInputsFromOrdersOrderSet(patientId);
      opdInputs = opdInputs ? opdInputs.servicesOrder : [];
    }
    // opd selected data
    if (this.activeSuggestListKey === 'tagList') {
      _.map(opdTagInputs[this.activeTagHeadKey], (input) => {
        const idx = _.findIndex(list, (obj) => obj[filterListKey] === input[filterOpdKey]);
        if (idx !== -1) {
          list[idx].checked = true;
        }
      });
    } else {
      _.map(opdInputs, (input) => {
        const idx = _.findIndex(list, (obj) => obj[filterListKey] === (filterKeyObj ? input[filterKeyObj][filterOpdKey] : input[filterOpdKey]));
        if (idx !== -1 && !this.modelpopupName) {
          list[idx].checked = true;
          // list[idx].isDisabled = !input.isDirty ? true : false;
        } else if (idx !== -1 && this.modelpopupName) { // condition for orders suggestion
          list[idx].checked = (!input.id || input.id === '' || input.id === undefined);
        }
      });
    }
    this.lazyLoadingOtherList = skipMerging ? [] : this.lazyLoadingOtherList; // for lazyloading merge with local object
    this.lazyLoadingOtherList = this.lazyLoadingOtherList.concat(list);
    this.busyOther = false;
    // this.setSuggetionViewAsPerList();
  }


  setSuggetionViewAsPerList() {
    if (!_.isUndefined(this.lazyLoadingFrequentlyUseList) && this.lazyLoadingFrequentlyUseList.length > 0) {
      this.isFreqUse = true;
      this.isUseFav = this.lazyLoadingFavList.length > 0 ? true : false;
      if (!this.isUseFav) {
        this.isUseOther = this.lazyLoadingOtherList.length > 0 ? true : false;
      } else {
        this.isUseOther = false;
      }
    } else {
      this.isFreqUse = false;
      this.isUseFav = this.lazyLoadingFavList.length > 0 ? true : false;
      this.isUseOther = this.lazyLoadingOtherList.length > 0 ? true : false;
    }
  }

  // loadOrderMaster(): Observable<any> {
  //   const forkJoins = [];
  //   // forkJoins.push(this.getAllNursingOrders());
  //   // forkJoins.push(this.getAllDietOrders());
  //   forkJoins.push(this.getAllDoctorInfoOrderList());
  //   return forkJoin(forkJoins).pipe(map(() => {
  //     this.showLoader = false;
  //   }));
  // }

  hideHistory() {
    this.historyLimit = 0;
    // this.showPrescriptionHistory = false;
  }

  ngCopy(obj): Object {
    return _.cloneDeep(obj);
  }

  // -- click on suggestion list checkboxes
  onSelectSuggestionList(suggestObject) {
    if (this.ordersService.selectedDoctorForOrder) {
      suggestObject.checked = !suggestObject.checked;
      const patientId = this.consultationService.getPatientObj('patientId');
      if (this.activeSuggestListKey === 'complaints') {
        const complaintsInputs = this.consultationService.getConsultationFormDataByKey(patientId, 'complaints');
        const index = _.findIndex(complaintsInputs, (o) => o.id === suggestObject.id);
        if (index === -1 && suggestObject.checked) {
          const compObject = {};
          compObject['name'] = suggestObject.name;
          compObject['id'] = suggestObject.id;
          this.publicService.clickOnSuggestionList({ // -- send event to complaints to update the data
            key: this.activeSuggestListKey,
            data: compObject,
            type: 'add'
          });
        } else if (index !== -1 && !suggestObject.checked) {
          this.publicService.clickOnSuggestionList({ // -- send event to complaints to delete the data
            key: this.activeSuggestListKey,
            data: index,
            type: 'delete'
          });
        }
      } else if (this.activeSuggestListKey === 'lab_test') {
        this.labTestService.getLabTestFormData().subscribe(x => {
          const investigationInputs = x;
          const index = _.findIndex(investigationInputs, (o) => o.id === suggestObject.id);
          if (index === -1 && suggestObject.checked) {
            const investObject: any = Object.assign(this.labTestService.defaultLabTestObj, suggestObject);
            this.publicService.clickOnSuggestionList({ // -- send event to radiology component to update the data
              key: this.activeSuggestListKey, data: investObject, type: 'add'
            });
          } else if (index !== -1 && !suggestObject.checked) {
            this.publicService.clickOnSuggestionList({ // -- send event to radiology component to update the data
              key: this.activeSuggestListKey, data: index, type: 'delete'
            });
          }
          if (investigationInputs.length === 0) {
            const investObject = this.ngCopy(this.labTestService.defaultLabTestObj);
            this.labTestService.setLabTestData(investObject, 'add');
          }
        });
      } else if (this.activeSuggestListKey === 'radiology_test') {
        this.radiologyTestService.getRadiologyTestData().subscribe(x => {
          const investigationInputs = x;
          const index = _.findIndex(investigationInputs, (o) => o.id === suggestObject.id);
          if (index === -1 && suggestObject.checked) {
            const investObject: any = Object.assign(this.radiologyTestService.defaultRadiologyTestObj, suggestObject);
            this.publicService.clickOnSuggestionList({ // -- send event to radiology component to update the data
              key: this.activeSuggestListKey, data: investObject, type: 'add'
            });
          } else if (index !== -1 && !suggestObject.checked) {
            this.publicService.clickOnSuggestionList({ // -- send event to radiology component to update the data
              key: this.activeSuggestListKey, data: index, type: 'delete'
            });
          }
          if (investigationInputs.length === 0) {
            const investObject = this.ngCopy(this.radiologyTestService.defaultRadiologyTestObj);
            this.radiologyTestService.setRadiologyTestData(investObject, 'add');
          }
        });
      } else if (this.activeSuggestListKey === 'labOrders') {
        const investigationInputs = (this.ordersOrderSetId === null) ? this.ordersService.getOrderData('labOrders', true) : this.getOpdInputsFromOrdersOrderSet(patientId);
        let index = _.findIndex(investigationInputs, (o) => o.labInvestigationObj.id === suggestObject.id);
        const keys = (this.ordersOrderSetId === null) ? this.activeSuggestListKey : this.orderSetDetails.sourceKey;
        if ((index === -1 || this.modelpopupName) && suggestObject.checked) {
          const investObject: any = Object.assign(this.labTestService.defaultLabTestObj, suggestObject);
          this.publicService.clickOnSuggestionList({ // -- send event to radiology component to update the data
            key: keys, data: investObject, type: 'add'
          });
        } else if (index !== -1 && !suggestObject.checked) {
          if (this.modelpopupName) {
            index = _.findIndex(investigationInputs, (o) => o.labInvestigationObj.id === suggestObject.id && o.status === 'approvelPending');
          }
          this.publicService.clickOnSuggestionList({ // -- send event to radiology component to update the data
            key: keys, data: index, type: 'delete'
          });
        }
      } else if (this.activeSuggestListKey === 'radiologyOrders') {
        const ordersData = (this.ordersOrderSetId === null) ? this.ordersService.getOrderData('radiologyOrders', true) : this.getOpdInputsFromOrdersOrderSet(patientId);
        const investigationInputs = _.cloneDeep(ordersData);
        const keys = (this.ordersOrderSetId === null) ? this.activeSuggestListKey : this.orderSetDetails.sourceKey;
        let index = _.findIndex(investigationInputs, (o) => o.radioInvestigationObj.id === suggestObject.id);
        if ((index === -1 || this.modelpopupName) && suggestObject.checked) {
          const investObject: any = Object.assign(this.radiologyTestService.defaultRadiologyTestObj, suggestObject);
          this.publicService.clickOnSuggestionList({ // -- send event to radiology component to update the data
            key: keys, data: investObject, type: 'add'
          });
        } else if (index !== -1 && !suggestObject.checked) {
          if (this.modelpopupName) {
            index = _.findIndex(investigationInputs, (o) => o.radioInvestigationObj.id === suggestObject.id && o.status === 'approvelPending');
          }
          this.publicService.clickOnSuggestionList({ // -- send event to radiology component to update the data
            key: keys, data: index, type: 'delete'
          });
        }
      } else if (this.activeSuggestListKey === 'prescription') {
        let uncheckedObject = {};
        const selectedMedicineList: any[] = [];
        const index = _.findIndex(selectedMedicineList, (o) => o.id === suggestObject.id);
        if (index === -1 && suggestObject.checked) {
          const medicineObject: any = {};
          medicineObject.typeId = suggestObject.MedicineTypeID;
          medicineObject.name = suggestObject.name;
          medicineObject.genricName = suggestObject.genric_name ? suggestObject.genric_name : null;
          medicineObject.id = suggestObject.id;
          medicineObject.is_favourite = suggestObject.is_favourite;
          selectedMedicineList.push(medicineObject);
          this.publicService.clickOnSuggestionList({ // -- send event to diagnosis to update the data
            key: this.activeSuggestListKey,
            data: selectedMedicineList,
            type: 'add'
          });
        } else if (index !== -1 && !suggestObject.checked) {
          selectedMedicineList.splice(index, 1);
        }
        if (!suggestObject.checked) {
          uncheckedObject = suggestObject;
          this.publicService.clickOnSuggestionList({ // -- send event to diagnosis to update the data
            key: this.activeSuggestListKey,
            data: uncheckedObject,
            type: 'delete'
          });
        }
      } else if (this.activeSuggestListKey === 'medicineOrders') {
        const ordesData = (this.ordersOrderSetId === null) ? this.ordersService.getOrderData('medicineOrders', true) :
          this.getOpdInputsFromOrdersOrderSet(patientId);
        const medicineOrdersList: MedicineOrders[] = _.cloneDeep(ordesData);
        const keys = (this.ordersOrderSetId === null) ? this.activeSuggestListKey : this.orderSetDetails.sourceKey;
        let indx = _.findIndex(medicineOrdersList, (o) => o.medicineObj.id === suggestObject.id);
        if ((indx === -1 || this.modelpopupName) && suggestObject.checked) {
          this.publicService.clickOnSuggestionList({ // -- send event to medicine orders component to update the data
            key: keys, data: suggestObject, type: 'add'
          });
        } else if (indx !== -1 && !suggestObject.checked) {
          if (this.modelpopupName) {
            indx = _.findIndex(medicineOrdersList, (o) => o.medicineObj.id === suggestObject.id && o.status === 'approvelPending');
          }
          this.publicService.clickOnSuggestionList({ // -- send event to medicine orders component to update the data
            key: keys, data: indx, type: 'delete'
          });
        }
      } else if (this.activeSuggestListKey === 'nursingOrders') {
        const ordersData = (this.ordersOrderSetId === null) ? this.ordersService.getOrderData('nursingOrders', true) : this.getOpdInputsFromOrdersOrderSet(patientId);
        const investigationInputs = _.cloneDeep(ordersData);
        const keys = (this.ordersOrderSetId === null) ? this.activeSuggestListKey : this.orderSetDetails.sourceKey;
        let index = _.findIndex(investigationInputs, (o) => o.nursingId === suggestObject.nursingId);
        if ((index === -1 || this.modelpopupName) && suggestObject.checked) {
          this.publicService.clickOnSuggestionList({ // -- send event to nursing orders component to update the data
            key: keys, data: suggestObject, type: 'add'
          });
        } else if (index !== -1 && !suggestObject.checked) {
          if (this.modelpopupName) {
            index = _.findIndex(investigationInputs, (o) => o.nursingId === suggestObject.nursingId && o.status === 'approvelPending');
          }
          this.publicService.clickOnSuggestionList({ // -- send event to nursing orders component to update the data
            key: keys, data: index, type: 'delete'
          });
        }

      } else if (this.activeSuggestListKey === 'dietOrders') {
        const ordersData = (this.ordersOrderSetId === null) ? this.ordersService.getOrderData('dietOrders', true) : this.getOpdInputsFromOrdersOrderSet(patientId);
        const investigationInputs = _.cloneDeep(ordersData);
        let index = _.findIndex(investigationInputs, (o) => o.dietId === suggestObject.dietId);
        const keys = (this.ordersOrderSetId === null) ? this.activeSuggestListKey : this.orderSetDetails.sourceKey;
        if ((index === -1 || this.modelpopupName) && suggestObject.checked) {
          this.publicService.clickOnSuggestionList({ // -- send event to diet orders component to update the data
            key: keys, data: suggestObject, type: 'add'
          });
        } else if (index !== -1 && !suggestObject.checked) {
          if (this.modelpopupName) {
            index = _.findIndex(investigationInputs, (o) => o.dietId === suggestObject.dietId && o.status === 'approvelPending');
          }
          this.publicService.clickOnSuggestionList({ // -- send event to diet orders component to update the data
            key: keys, data: index, type: 'delete'
          });
        }
      } else if (this.activeSuggestListKey === 'Doctor Instruction') {
        const ordersData = (this.ordersOrderSetId === null) ? this.ordersService.getOrderData('otherOrders', true) : this.getOpdInputsFromOrdersOrderSet(patientId);
        const OthersOrder = _.cloneDeep(ordersData);
        let index = _.findIndex(OthersOrder, (o) => o.id === suggestObject.id);
        const keys = (this.ordersOrderSetId === null) ? this.activeSuggestListKey : this.orderSetDetails.sourceKey;
        if ((index === -1 || this.modelpopupName) && suggestObject.checked) {
          this.publicService.clickOnSuggestionList({ // -- send event to other orders component to update the data
            key: keys, data: suggestObject, type: 'add'
          });
        } else if (index !== -1 && !suggestObject.checked) {
          if (this.modelpopupName) {
            index = _.findIndex(OthersOrder, (o) => o.dietId === suggestObject.dietId && o.status === 'approvelPending');
          }
          this.publicService.clickOnSuggestionList({ // -- send event to other orders component to update the data
            key: keys, data: index, type: 'delete'
          });
        }
      } else if (this.activeSuggestListKey === 'Services with Notes') {
        const ordersData = (this.ordersOrderSetId === null) ? this.ordersService.getOrderData('otherOrders', true) : this.getOpdInputsFromOrdersOrderSet(patientId);
        const OthersOrder = _.cloneDeep(ordersData);
        let index = _.findIndex(OthersOrder, (o) => o.id === suggestObject.id);
        const keys = (this.ordersOrderSetId === null) ? this.activeSuggestListKey : this.orderSetDetails.sourceKey;
        if ((index === -1 || this.modelpopupName) && suggestObject.checked) {
          this.publicService.clickOnSuggestionList({ // -- send event to other orders component to update the data
            key: keys, data: suggestObject, type: 'add'
          });
        } else if (index !== -1 && !suggestObject.checked) {
          if (this.modelpopupName) {
            index = _.findIndex(OthersOrder, (o) => o.dietId === suggestObject.dietId && o.status === 'approvelPending');
          }
          this.publicService.clickOnSuggestionList({ // -- send event to other orders component to update the data
            key: keys, data: index, type: 'delete'
          });
        }
      }
    } else {
      const obj = {
        message: 'Please Select Doctor',
        messageType: 'warning'
      };
      this.ordersService.OrderErrorEvent.next(obj);
    }
  }

  getInvestigationSuggestionListOnLoad(skipMerge?): Observable<any> {
    // let returnData;
    const pageNo = 1;
    const limit = this.scrollLoadingOption.limit;
    const searchKeyword = this.scrollLoadingOption.searchKeyword || '';
    const investigationtype = (this.activeSuggestListKey === 'cardiac_investigations') ? 'cardiac'
      : (this.activeSuggestListKey === 'labOrders' || this.activeSuggestListKey === 'lab_test') ? 'Lab'
        : (this.activeSuggestListKey === 'radiologyOrders' || this.activeSuggestListKey === 'radiology_test') ? 'Radiology' : 'cardiac';
    const apiCallFor = this.activeSuggestListKey;
    const skipIndex = this.lazyLoadingOtherList.length;

    return this.publicService.getInvestigationSuggestionListOnLoad(investigationtype, limit, searchKeyword, this.userInfo.speciality_id, +this.userInfo.user_id, skipIndex).pipe(map((res: any) => {
      if ((this.activeSuggestListKey === 'cardiac_investigations' || this.activeSuggestListKey === 'labOrders' || this.activeSuggestListKey === 'radiologyOrders'
        || this.activeSuggestListKey === 'lab_test' || this.activeSuggestListKey === 'radiology_test')
        && apiCallFor === this.activeSuggestListKey) {
        const result = res;

        // clear all list
        if (skipMerge) {
          this.lazyLoadingFavList = [];
          this.lazyLoadingOtherList = [];
          this.lazyLoadingFrequentlyUseList = [];
        }

        // manage fav list data
        // if (result.data['favourites'].length === limit) {
        //   this.scrollLoadingOption['favPageNo'] = 2;
        // }
        // this.scrollLoadingOption['favResultExists'] = (result.data['favourites'].length === limit);
        // this.mergeSuggestionWithOpdList(result.data['favourites'], 1);

        // manage other list data
        if (result.data['others'].length === limit) {
          this.scrollLoadingOption['otherPageNo'] = 2;
        }
        this.scrollLoadingOption['otherResultExists'] = (result.data['others'].length === limit);
        this.mergeSuggestionWithOpdList(result.data.others, 0, skipMerge);

        // manage freq used list data
        // if (result.data['frequently_used'].length === limit) {
        //   this.scrollLoadingOption['freqUsePageNo'] = 2;
        // }
        // this.scrollLoadingOption['freqUseResultExists'] = (result.data['frequently_used'].length === limit);
        // this.mergeSuggestionWithOpdList(result.data['frequently_used'], 2);
        // returnData = result.data;

        // if (this.activeSuggestListKey === 'lab_test' || this.activeSuggestListKey === 'radiology_test') {
        //   const investigationDataFav = [];
        //   _.map(res.data.favourites, (val) => {
        //     const _InvestigationMaster = new InvestigationMaster();
        //     if (_InvestigationMaster.isObjectValid(val)) {
        //       _InvestigationMaster.generateObject(val);
        //       investigationDataFav.push(_.cloneDeep(_InvestigationMaster));
        //     }
        //   });
        //   res.data.favourites = _.cloneDeep(investigationDataFav);
        //   const investigationDataFreq = [];
        //   _.map(res.data.frequently_used, (val) => {
        //     const _InvestigationMaster = new InvestigationMaster();
        //     if (_InvestigationMaster.isObjectValid(val)) {
        //       _InvestigationMaster.generateObject(val);
        //       investigationDataFreq.push(_.cloneDeep(_InvestigationMaster));
        //     }
        //   });
        //   res.data.frequently_used = _.cloneDeep(investigationDataFreq);
        //   const investigationDataOtr = [];
        //   _.map(res.data.others, (val) => {
        //     const _InvestigationMaster = new InvestigationMaster();
        //     if (_InvestigationMaster.isObjectValid(val)) {
        //       _InvestigationMaster.generateObject(val);
        //       investigationDataOtr.push(_.cloneDeep(_InvestigationMaster));
        //     }
        //   });
        //   res.data.others = _.cloneDeep(investigationDataOtr);
        // }
      }
      return res.data.others;
    }));
    // return of(returnData);
  }

  getAllInvestigationList(isFavourite, maxUseCount): Observable<any> {
    // var deferred = $q.defer();
    let pageNo = ((isFavourite === 1 || isFavourite === -1) ? this.scrollLoadingOption['favPageNo'] :
      (isFavourite === 2) ? this.scrollLoadingOption['freqUsePageNo'] : this.scrollLoadingOption['otherPageNo']);
    const limit = this.scrollLoadingOption['limit'];
    const searchKeyword = this.scrollLoadingOption['searchKeyword'];
    const strictMatch = 0;
    const investigation_type = (this.activeSuggestListKey === 'cardiac_investigations') ? 'cardiac'
      : (this.activeSuggestListKey === 'labOrders' || this.activeSuggestListKey === 'lab_test') ? 'Lab'
        : (this.activeSuggestListKey === 'radiologyOrders' || this.activeSuggestListKey === 'radiology_test') ? 'Radiology' : 'cardiac';
    const apiCallFor = this.activeSuggestListKey;
    pageNo = +pageNo || 1;
    isFavourite = searchKeyword !== '' ? -1 : isFavourite;

    return this.publicService.getInvestigationWithPaginationByType(investigation_type, pageNo, limit, searchKeyword, strictMatch, isFavourite, maxUseCount).pipe(
      map((response: any) => {
        if ((this.activeSuggestListKey === 'cardiac_investigations' || this.activeSuggestListKey === 'labOrders' || this.activeSuggestListKey === 'radiologyOrders'
          || this.activeSuggestListKey === 'lab_test' || this.activeSuggestListKey === 'radiology_test')
          && apiCallFor === this.activeSuggestListKey) {
          if (pageNo === 1 && response.search_text !== '') {
            this.lazyLoadingFavList = [];
            this.lazyLoadingOtherList = [];
            this.lazyLoadingFrequentlyUseList = [];
          }

          if (isFavourite === 1 || isFavourite === -1) {
            if (response.data.length === limit) {
              this.scrollLoadingOption['favPageNo'] = response.page_no + 1;
            }
            this.scrollLoadingOption['favResultExists'] = (response.data.length === limit);
          } else if (isFavourite === 0) {
            if (response.data.length === limit) {
              this.scrollLoadingOption['otherPageNo'] = response.page_no + 1;
            }
            this.scrollLoadingOption['otherResultExists'] = (response.data.length === limit);
          } else if (isFavourite === 2) {
            if (response.data.length === limit) {
              this.scrollLoadingOption['freqUsePageNo'] = response.page_no + 1;
            }
            this.scrollLoadingOption['freqUseResultExists'] = (response.data.length === limit);
          }
        } else {
          response.data = [];
        }
        return response.data;
      })
    );
  }

  getMedicineSuggestionListOnLoad(skipMerge?) {
    const pageNo = 1;
    const limit = this.scrollLoadingOption['limit'];
    const searchKeyword = this.scrollLoadingOption.searchKeyword || '';
    const skipIndex = this.lazyLoadingOtherList.length;

    return this.publicService.getMedicineSuggestionListOnLoad(limit, searchKeyword, 1, this.userInfo.speciality_id, +this.userInfo.user_id, 0, skipIndex).pipe(map((response: any) => {
      if ((this.activeSuggestListKey === 'prescription')
        || (this.activeSuggestListKey === 'medicineOrders')
      ) {
        // clear all list
        if (skipMerge) {
          this.lazyLoadingFavList = [];
          this.lazyLoadingOtherList = [];
          this.lazyLoadingFrequentlyUseList = [];
        }
        if (response.data.others.length === limit) {
          this.scrollLoadingOption['otherPageNo'] = 2;
        }
        this.scrollLoadingOption['otherResultExists'] = (response.data.others.length === limit);
        this.mergeSuggestionWithOpdList(response.data.others, 0, skipMerge);
      }

      return response.data.others;
    })
    );
  }

  // getAllMedicineList(isFavourite, maxUseCount): Observable<any> {
  //   let pageNo = ((isFavourite === 1 || isFavourite === -1) ? this.scrollLoadingOption.favPageNo :
  //     (isFavourite === 2) ? this.scrollLoadingOption.freqUsePageNo : this.scrollLoadingOption.otherPageNo);
  //   const limit = this.scrollLoadingOption.limit;
  //   const searchKeyword = this.scrollLoadingOption.searchKeyword || '';
  //   pageNo = +pageNo || 1;
  //   isFavourite = searchKeyword !== '' ? -1 : isFavourite;

  //   return this.publicService.getMedicineSuggestionListOnLoad(limit, searchKeyword, 0, 0, 2).pipe(
  //     map(response => {
  //       if ((this.activeSuggestListKey === 'prescription' && this.scrollLoadingOption.searchKeyword === response.search_text)
  //         || (this.activeSuggestListKey === 'medicineOrders' && this.scrollLoadingOption.searchKeyword === response.search_text)
  //       ) {
  //         if (pageNo === 1 && response.search_text !== '') {
  //           this.lazyLoadingFavList = [];
  //           this.lazyLoadingOtherList = [];
  //           this.lazyLoadingFrequentlyUseList = [];
  //         }

  //         if (isFavourite === 1 || isFavourite === -1) {
  //           if (response.medicine_data.length === limit) {
  //             this.scrollLoadingOption.favPageNo = response.page_no + 1;
  //           }
  //           this.scrollLoadingOption.favResultExists = (response.medicine_data.length === limit);
  //         } else if (isFavourite === 0) {
  //           if (response.medicine_data.length === limit) {
  //             this.scrollLoadingOption.otherPageNo = response.page_no + 1;
  //           }
  //           this.scrollLoadingOption.otherResultExists = (response.medicine_data.length === limit);
  //         } else if (isFavourite === 2) {
  //           if (response.medicine_data.length === limit) {
  //             this.scrollLoadingOption.freqUsePageNo = response.page_no + 1;
  //           }
  //           this.scrollLoadingOption.freqUseResultExists = (response.medicine_data.length === limit);
  //         }
  //       } else {
  //         response.medicine_data = [];
  //       }
  //       return response.medicine_data;
  //     })
  //   );
  // }

  onSelectFaqSuggestionList(selectedItem): void {
    const obj: { key: string, source_key: string } = { key: '', source_key: '' };
    obj['key'] = 'category_id_' + selectedItem.category_id;
    obj['source_key'] = 'faq_category';
    this.selectedComponetEve.emit(obj);
  }

  onScrollDown($event) {
    // console.log($event);
  }

  onClickSuggestionPanel(val) {
    this.suggestionPanelEvent.emit(val);
  }

  getAllNursingOrders(skipMerge?): Observable<any> {
    const searchKeyword = this.scrollLoadingOption.searchKeyword || '';
    const limit = this.scrollLoadingOption.limit;
    const skipindex = this.lazyLoadingOtherList.length;
    return this.ordersService.getMasterNursingOrders(searchKeyword, 1, this.userInfo.speciality_id, +this.userInfo.user_id, skipindex, limit).pipe(takeUntil(this.ngUnsubscribe),
      map((x: any)=> {
        this.nursingOrders = [];
        x.forEach(element => {
          const obj = { ...element };
          obj['nursingId'] = element['id'];
          obj['id'] = '';
          if (this.nursingOrderInst.isObjectValid(obj)) {
            // generate new object and push in nursing orders.
            this.nursingOrderInst.generateObject(obj);
            this.nursingOrders.push(_.cloneDeep(this.nursingOrderInst));
          }
        });
        if (skipMerge) {
          this.lazyLoadingFavList = [];
          this.lazyLoadingOtherList = [];
          this.lazyLoadingFrequentlyUseList = [];
        }
        if (this.nursingOrders.length === limit) {
          this.scrollLoadingOption['otherPageNo'] = 2;
        }
        this.scrollLoadingOption['otherResultExists'] = (this.nursingOrders.length === limit);
        this.mergeSuggestionWithOpdList(this.nursingOrders, 0, skipMerge);
        return this.nursingOrders;
      })
    );
  }

  getAllDietOrders(skipMerge?): Observable<any> {
    const searchKeyword = this.scrollLoadingOption.searchKeyword || '';
    const limit = this.scrollLoadingOption.limit;
    const skipindex = this.lazyLoadingOtherList.length;
    return this.ordersService.getDiatOrderList(searchKeyword, 1, this.userInfo.speciality_id, +this.userInfo.user_id, skipindex, limit).pipe(takeUntil(this.ngUnsubscribe),
      map((x: any) => {
        this.dietOrders = [];
        x.forEach(element => {
          const obj = { ...element };
          obj['dietId'] = element['id'];
          obj['id'] = '';
          if (this.dietOrderInst.isObjectValid(obj)) {
            this.dietOrderInst.generateObject(obj);
            this.dietOrders.push(_.cloneDeep(this.dietOrderInst));
          }
        });
        if (this.dietOrders.length === limit) {
          this.scrollLoadingOption['otherPageNo'] = 2;
        }
        this.scrollLoadingOption['otherResultExists'] = (this.dietOrders.length === limit);
        if (skipMerge) {
          this.lazyLoadingFavList = [];
          this.lazyLoadingOtherList = [];
          this.lazyLoadingFrequentlyUseList = [];
        }
        this.mergeSuggestionWithOpdList(this.dietOrders, 0, skipMerge);
        return this.dietOrders;
      })
    );
  }

  getAllDoctorInfoOrderList(skipMerge?): Observable<any> {
    const searchKeyword = this.scrollLoadingOption.searchKeyword || '';
    const skipindex = this.lazyLoadingOtherList.length;
    return this.ordersService.getotherrderDoctorInstList(searchKeyword, 1, this.userInfo.speciality_id,
      +this.userInfo.user_id, skipindex, this.scrollLoadingOption.limit).pipe(takeUntil(this.ngUnsubscribe),
        map((res: any) => {
          this.doctorInstruOrderList = [];
          res.forEach(element => {
            const doctorInfoOrder = new DoctorInformationOrder();
            const obj: any = _.cloneDeep(element);
            obj['instructionId'] = element['id'];
            obj['id'] = '';
            if (doctorInfoOrder.isObjectValid(obj)) {
              doctorInfoOrder.generateObject(obj);
              this.doctorInstruOrderList.push(_.cloneDeep(doctorInfoOrder));
            }
          });
          if (skipMerge) {
            this.lazyLoadingFavList = [];
            this.lazyLoadingOtherList = [];
            this.lazyLoadingFrequentlyUseList = [];
          }
          this.mergeSuggestionWithOpdList(this.doctorInstruOrderList, 0, skipMerge);
          return this.doctorInstruOrderList;
        })
      );
  }
  getAllServicesListForOtherOrder(skipMerge?): Observable<any> {
    const searchKeyword = this.scrollLoadingOption.searchKeyword || '';
    this.servicePageNo = skipMerge ? 1 : this.servicePageNo + 1;
    return this.ordersService.getotherrderServicesList(searchKeyword, 1, this.userInfo.speciality_id,
      +this.userInfo.user_id, this.servicePageNo, this.scrollLoadingOption.limit).pipe(takeUntil(this.ngUnsubscribe),
        map((res: any) => {
          this.otherServiceOrderList = [];
          res.forEach(element => {
            const doctorInfoOrder = new OtherServicesOrder();
            const obj: any = _.cloneDeep(element);
            obj['serviceId'] = element['service_id'];
            obj['id'] = '';
            if (doctorInfoOrder.isObjectValid(obj)) {
              doctorInfoOrder.generateObject(obj);
              this.otherServiceOrderList.push(_.cloneDeep(doctorInfoOrder));
            }
          });
          if (skipMerge) {
            this.lazyLoadingFavList = [];
            this.lazyLoadingOtherList = [];
            this.lazyLoadingFrequentlyUseList = [];
          }
          this.mergeSuggestionWithOpdList(this.otherServiceOrderList, 0, skipMerge);
          return this.otherServiceOrderList;
        })
      );
  }

  toggleSelectedSection(data, index) {
    _.map(data, function (o, i) {
      o.checked = (i === index);
    });
  }

  getOpdInputsFromOrdersOrderSet(patientId) {
    if (this.orderSetDetails.ordersOrderSetData !== null) {
      return this.orderSetDetails.ordersOrderSetData[this.activeSuggestListKey];
    }
    // const allLocalOrderSetData = this.consultationService.getConsultationFormDataByKey(patientId, this.orderSetDetails.sourceKey, true);
    const allLocalOrderSetData = this.ordersService.getOrderSetLocalData();
    if (allLocalOrderSetData && _.isArray(allLocalOrderSetData) && allLocalOrderSetData.length) {
      const activeOrderSetData = _.find(allLocalOrderSetData, (o) => o.orderSetId === this.ordersOrderSetId);
      if (activeOrderSetData) {
        return activeOrderSetData[this.activeSuggestListKey];
      }
    }
    return [];
  }

  subcribeEvents() {
    this.publicService.$subPatProfileEvent.pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.patProfileIsOpen = res;
    });
  }

  closeOrderSetSuggestion() {
    this.closeOrderSetSuggestionSection.emit(true);
  }

  closeOrderSuggestions() {
    this.ordersService.loadSuggestionFromOrders.next({ hideSuggestion: true });
  }

  showHideSearchInputBox() {
    this.showInputSearchBox = !this.showInputSearchBox;
  }

  // save suggestion favourite
  savefavSuggesstion(item, index) {
    switch (this.activeSuggestListKey) {
      case 'radiologyOrders':
        this.saveInvestigationUserFav(item);
        break;
      case 'labOrders':
        this.saveInvestigationUserFav(item);
        break;
      case 'medicineOrders':
        this.saveMedicineOrderUserFav(item);
        break;
      case 'nursingOrders':
        this.saveNursingOrderFav(item);
        break;
      case 'dietOrders':
        this.savedietOrderFav(item);
        break;
      case 'Doctor Instruction':
        this.saveotherOrderFav(item, index);
        break;
    }
  }
  saveMedicineOrderUserFav(item) {
    const param = [{
      medicine_id: item.id,
      service_type_id: 1,
      speciality_id: this.userInfo.speciality_id,
      user_id: +this.userInfo.user_id,
      is_favorite: !item.isFav,
    }];
    this.patientChartService.savePrescriptionFav(param).subscribe(res => {
      if (res) {
        item.isFav = !item.isFav;
        this.lazyLoadingOtherList = _.sortBy(this.lazyLoadingOtherList, (o) => {
          return !o.isFav;
        });
      }
    });
  }
  saveInvestigationUserFav(item) { // radio,lab fav save
    const param = [{
      investigation_id: item.id,
      service_type_id: 1,
      speciality_id: this.userInfo.speciality_id,
      user_id: +this.userInfo.user_id,
      is_favorite: !item.isFav,
    }];
    this.patientChartService.saveInvestigationFav(param).subscribe(res => {
      if (res) {
        item.isFav = !item.isFav;
        this.lazyLoadingOtherList = _.sortBy(this.lazyLoadingOtherList, (o) => {
          return !o.isFav;
        });
      }
    });
  }
  saveNursingOrderFav(item) {
    const param = [{
      nursing_id: item.nursingId,
      service_type_id: 1,
      speciality_id: this.userInfo.speciality_id,
      user_id: +this.userInfo.user_id,
      is_favorite: !item.isFav,
    }];
    this.ordersService.saveNursingOrderUserFav(param).subscribe(res => {
      if (res) {
        item.isFav = !item.isFav;
        this.lazyLoadingOtherList = _.sortBy(this.lazyLoadingOtherList, (o) => {
          return !o.isFav;
        });
      }
    });
  }
  savedietOrderFav(item) {
    const param = [{
      diet_id: item.dietId,
      service_type_id: 1,
      speciality_id: this.userInfo.speciality_id,
      user_id: +this.userInfo.user_id,
      is_favorite: !item.isFav,
    }];
    this.ordersService.saveDietOrderUserFav(param).subscribe(res => {
      if (res) {
        item.isFav = !item.isFav;
        this.lazyLoadingOtherList = _.sortBy(this.lazyLoadingOtherList, (o) => {
          return !o.isFav;
        });
      }
    });
  }
  saveotherOrderFav(item, index) {
    const param = [{
      doc_instruction_id: item.instructionId,
      service_type_id: 1,
      speciality_id: this.userInfo.speciality_id,
      user_id: +this.userInfo.user_id,
      is_favorite: !item.isFav,
    }];
    this.ordersService.saveOtherOrderUserFav(param).subscribe(res => {
      if (res) {
        item.isFav = !item.isFav;
        this.lazyLoadingOtherList = _.sortBy(this.lazyLoadingOtherList, (o) => {
          return !o.isFav;
        });
      }
    });
  }
  // end of save suggestion
}


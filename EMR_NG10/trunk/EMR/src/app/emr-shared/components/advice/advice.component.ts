import { DynamicChartService } from './../../../dynamic-chart/dynamic-chart.service';
import { AfterViewInit, Component, Input, OnInit, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { PrescriptionService } from './../../../public/services/prescription.service';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as _ from 'lodash';
import { NgbModal, NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from './../../../public/services/auth.service';
import { Advice } from './../../../public/models/advice';
import { IAlert } from './../../../public/models/AlertMessage';
import { Constants } from './../../../config/constants';
import { CommonService } from '../../../public/services/common.service';
import { NgForm } from '@angular/forms';
import { TranslateLangService } from '../../../public/services/translate-lang.service';
// import {TributeOptions} from 'tributejs';
// import {NgxTributeDirective} from 'ngx-tribute';

interface TributeValue {
  key: string;
  value: string;
}

declare const google: any;

@Component({
  selector: 'app-advice',
  templateUrl: './advice.component.html',
  styleUrls: ['./advice.component.scss']
})
export class AdviceComponent implements OnInit, AfterViewInit, OnChanges {
  // @ViewChild('tributeDirective', {static: true}) tributeDirectiveInComponent: NgxTributeDirective<TributeValue>;
  // options: TributeOptions<TributeValue>;
  // showInput = true; // On showInput = false, the tribute container gets cleaned up.
  // formControlValue = '';
  // collectionArray = [];
  // termsArray: any;

  loadSuggestion = true;
  compInstance = this;
  languageList: any[] = [];
  selectedLanguage: { name: string, id: string };
  selectedAdviceTemplate: { transId: any, id: string, name: string, description: string, conceptData: any } = { transId: '', id: '', name: '', description: '', conceptData: [] };
  adviceTemplateList: any[] = [];
  showAddTemplateButton = false;
  showEditTemplateButton = false;
  private ngUnsubscribe = new Subject();
  googleTransControl: any;
  isTranslationEnabled = true;
  transIds = ['translateAdvice1'];
  userId: number;
  userInfo: any;
  chartId: number;
  patientObj: any;
  templateIds: any[] = [];
  @Input() alertMessage: IAlert;
  formChangesSubscription: any;
  @Input() public componentInfo: any;
  isPanelOpen: boolean;
  chartDetailId: number;
  parentTextChanged = false;
  constructor(
    private prescriptionService: PrescriptionService,
    private modalService: NgbModal,
    private authService: AuthService,
    private translateService: TranslateLangService,
    private commonService: CommonService,
    private dynamicChartService: DynamicChartService
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    // console.log(this.componentInfo);
  }
  ngOnInit() {
    // this.options = {
    //   trigger: '#',
    //   lookup: 'value',
    //   autocompleteMode: true,
    //   noMatchTemplate: null,
    //   values: (text, cb) => {
    //     this.getSnowedCTSuggestions(cb, text);
    //   },
    // };

    this.chartDetailId = this.componentInfo.chart_detail_id;
    this.chartId = this.dynamicChartService.getActiveChartInfo().chartId;
    this.userId = +this.authService.getLoggedInUserId();
    this.userInfo = this.authService.getUserInfoFromLocalStorage();
    this.isPanelOpen = (this.componentInfo.activeIdsOfPanels as Array<any>).indexOf('advice') !== -1 ? true : false;
    this.getpatientData();
    this.getLanguageList();
    this.dynamicChartService.$getEventFrmSuggestion.subscribe(data => {
      if (data.sectionKeyName === 'advice' && data.componentData.chartDetailId === this.chartDetailId) {
        this.onTemplateSelect(data.selectedSuggestion);
      }
    });
  }

  ngAfterViewInit() { }

  getAdviceData() {
    this.dynamicChartService.getChartDataByKey('advice_detail', true, null, this.chartDetailId).subscribe(res => {
      this.templateIds = [];
      if (res !== null && res.length && this.isValidData(res[0])) {
        this.templateIds = res[0].template_ids;
        this.setDefaultAdviceTemplate(res[0]);
      } else {
        this.setDefaultAdviceTemplate();
      }
    });
  }

  onLanguageChange(): void {
    if (this.selectedLanguage) {
      this.setLang(this.selectedLanguage);
      // this.initTransliterationAPI();
    } else {
      this.selectedLanguage = this.languageList[0];
    }
    this.openSuggestionPanel();
    this.prepareDataForSave();
  }

  getLanguageList(): Observable<any> {
    const obs = this.compInstance.prescriptionService.getLanguageList();
    obs.subscribe(res => {
      _.map(res, (val) => {
        this.compInstance.languageList.push(val);
      });
      this.selectedLanguage = this.compInstance.languageList[0];
      this.compInstance.prescriptionService.setLanguageDetails(this.compInstance.languageList[0]);
      this.compInstance.setLang(this.compInstance.languageList[0]);
      this.getAdviceSugegstionTemplateList();
      // this.initTransliterationAPI();
      this.getAdviceData();
    });
    return obs;
  }

  // --set the selected language to achive i18n or translate the language ex:en to hi
  setLang(lang: { name: string; id: string }) {
    if (lang.id === '1') {
      this.translateService.use('en', 'advice').pipe(takeUntil(this.ngUnsubscribe)).subscribe();
    } else if (lang.id === '2') {
      this.translateService.use('hi', 'advice').pipe(takeUntil(this.ngUnsubscribe)).subscribe();
    } else {
      this.translateService.use('mr', 'advice').pipe(takeUntil(this.ngUnsubscribe)).subscribe();
    }
  }

  getAdviceSugegstionTemplateList(searchKey?) {
    const reqParams = {
      search_keyword: (searchKey) ? searchKey : '',
      service_type_id: this.patientObj ? this.patientObj.serviceType.id : 0,
      speciality_id: this.userInfo.speciality_id,
      user_id: this.userId,
      chart_id: this.chartId,
      skip_index: 0,
      limit: 10
    };
    this.compInstance.prescriptionService.getAdviceTemplateSuggestionList(reqParams).subscribe(res => {
      const adviceSuggestion = [];
      _.forEach(res, (o) => {
        const adviceObj = new Advice();
        if (adviceObj.isObjectValid(o)) {
          adviceObj.generateObject(o);
          adviceSuggestion.push(adviceObj);
        }
      });
      this.adviceTemplateList = adviceSuggestion;
    });
  }

  onTemplateSelect(template) {
    const prevDescription = this.selectedAdviceTemplate.description;
    const conceptDataArray = this.selectedAdviceTemplate.conceptData;
    this.selectedAdviceTemplate = _.cloneDeep(template);
    this.selectedAdviceTemplate.conceptData = conceptDataArray;
    if (prevDescription.length) {
      this.selectedAdviceTemplate.description = prevDescription + '\n\n' + this.selectedAdviceTemplate.description;
      this.parentTextChanged = true;
      if (this.templateIds.length) {
        this.templateIds.push(this.selectedAdviceTemplate.id);
      }
    } else {
      this.parentTextChanged = true;
      this.templateIds.push(this.selectedAdviceTemplate.id);
    }
    this.manageSaveTemplateOptions();
    setTimeout(() => {
      this.parentTextChanged = false;
    }, 100)
  }

  setDefaultAdviceTemplate(res?) {
    // snowmed ct data
    let concentDataArray = [];
    if (res && !_.isUndefined(res.conceptData) && res.conceptData !== null) {
      if (res.conceptData.length) {
        concentDataArray = JSON.parse(res.conceptData);
      }
    }
    this.selectedAdviceTemplate = {
      transId: (res) ? res.tran_id : null,
      id: '',
      name: '',
      description: (res && res.advice !== null) ? res.advice : '',
      conceptData: concentDataArray
    };
  }

  manageSaveTemplateOptions() {
    // this.showAddTemplateButton = (this.selectedAdviceTemplate.id === '' && this.selectedAdviceTemplate.description.length > 0);
    // this.showEditTemplateButton = (this.selectedAdviceTemplate.id !== '' && this.selectedAdviceTemplate.description.length > 0);
    this.selectedAdviceTemplate.id = '';
    this.selectedAdviceTemplate.name = '';
    this.showAddTemplateButton = this.selectedAdviceTemplate.description.length > 0;
    this.prepareDataForSave();
  }

  openPopup(object): void {
    const modelInstance = this.modalService.open(object, {
      backdrop: 'static',
      keyboard: false,
      windowClass: 'custom-modal modal-md'
    });
    modelInstance.result.then(result => {
      this.saveAdviceTemplate();
    }, reason => {
    });
  }

  saveAdviceTemplate() {
    const reqParams = {
      advice_id: (this.selectedAdviceTemplate.id === '') ? 0 : this.selectedAdviceTemplate.id,
      template_name: this.selectedAdviceTemplate.name,
      description: this.selectedAdviceTemplate.description
    };
    this.prescriptionService.saveAdviceTemplate(reqParams).subscribe(res => {
      if (res && res.data) {
        reqParams.advice_id = res;
        const adviceObj = new Advice();
        adviceObj.generateObject(reqParams);
        this.adviceTemplateList.push(adviceObj);
        this.alertMessage = {
          message: 'Template Saved Successfully',
          messageType: 'success',
          duration: Constants.ALERT_DURATION
        };
      }
    });
  }

  // -- call the google transliteration function
  initTransliterationAPI() {
    if (!this.googleTransControl) {
      this.initTransliteration();
    }
    if (this.googleTransControl.isTransliterationEnabled() && this.selectedLanguage.id === '1') {
      this.googleTransControl.toggleTransliteration();
    } else if (!this.googleTransControl.isTransliterationEnabled() && this.selectedLanguage.id != '1') {
      this.googleTransControl.toggleTransliteration();
    }
  }

  // --load the google translatitaration for language change
  initTransliteration() {
    const options = {
      sourceLanguage: google.elements.transliteration.LanguageCode.ENGLISH,
      destinationLanguage: [google.elements.transliteration.LanguageCode.MARATHI, google.elements.transliteration.LanguageCode.HINDI],
      transliterationEnabled: true
    };
    if (this.selectedLanguage.id === '2') {
      options.destinationLanguage = [google.elements.transliteration.LanguageCode.HINDI];
    } else if (this.selectedLanguage.id === '3') {
      options.destinationLanguage = [google.elements.transliteration.LanguageCode.MARATHI];
    } else if (this.selectedLanguage.id === '1') {
      options.transliterationEnabled = false;
    }

    this.googleTransControl = new google.elements.transliteration.TransliterationControl(options);
    this.googleTransControl.addEventListener(google.elements.transliteration.TransliterationControl.EventType.STATE_CHANGED,
      this.transliterateStateChangeHandler);
    setTimeout(() => {
      this.googleTransControl.makeTransliteratable(this.transIds);
    }, 500);
  }

  transliterateStateChangeHandler(e) {
    this.isTranslationEnabled = e.transliterationEnabled;
  }

  openSuggestionPanel(componentInfo?): void {
    this.dynamicChartService.sendEventToParentChartContainer.next({ source: 'other_component', content: { prescriptionDetails: null } });
    setTimeout(() => {
      // console.log(this.componentInfo);
      this.dynamicChartService.sendEventToSuggestion.next({
        sectionKeyName: 'advice',
        componentData: { languageId: this.selectedLanguage.id, chartDetailId: this.chartDetailId }
      });
    });
  }

  getpatientData(patient?) {
    if (patient) {
      this.patientObj = patient;
    } else {
      this.patientObj = this.commonService.getLastActivePatient();
    }
  }

  clearActions() {
    this.setDefaultAdviceTemplate();
    this.manageSaveTemplateOptions();
    this.openSuggestionPanel();
    this.templateIds = [];
    this.parentTextChanged = true;
  }

  prepareDataForSave() {
    const adviceDetails = {
      tran_id: this.selectedAdviceTemplate.transId,
      language_id: this.selectedLanguage.id,
      advice: this.selectedAdviceTemplate.description,
      template_ids: this.templateIds,
      chart_detail_id: this.chartDetailId,
      conceptData: JSON.stringify(this.selectedAdviceTemplate.conceptData)
    };
    this.dynamicChartService.updateLocalChartData('advice_detail', [adviceDetails], 'update', this.chartDetailId);
  }

  isValidData(result) {
    if (result === null) {
      return false;
    }
    return (result.hasOwnProperty('tran_id') && result.hasOwnProperty('language_id') && result.hasOwnProperty('advice'));
  }

  public beforeChange($event: NgbPanelChangeEvent) {

    if ($event.panelId === 'advice') {
      $event.preventDefault();
    }
  }

  setLanguageTranslationId() {
    if (this.googleTransControl === undefined || this.googleTransControl === null || !this.googleTransControl) { return; }
    const findId = _.findIndex(this.transIds, (o) => o === 'translateAdvice2');
    if (findId === -1) {
      this.googleTransControl.makeTransliteratable(['translateAdvice2']);
      this.transIds.push('translateAdvice2');
    }
    this.initTransliterationAPI();
  }

  panelChange(event): void {
    this.isPanelOpen = event.nextState;
  }

  // formatTerms(cb) {
  //   const collectionArr = [];
  //   _.forEach(this.termsArray.items, (o) => {
  //     const collectionObj = {
  //       key: o.conceptId,
  //       value: o.pt.term
  //     };
  //     collectionArr.push(collectionObj);
  //   });
  //   this.collectionArray = collectionArr;
  //   cb(this.collectionArray);
  // }
  //
  // getSnowedCTSuggestions(cb, text?) {
  //   if (text.length < 2) {return;}
  //   this.commonService.getSnowedCTData(text).subscribe(res => {
  //     if (res) {
  //       this.termsArray = res;
  //       this.formatTerms(cb);
  //     }
  //   });
  // }

  processAction($event) {
    this.parentTextChanged = false;
    if ($event.action === 'model_changes') {
      this.openModalPopupSugg(true);
      this.selectedAdviceTemplate.description = $event.data;
      this.manageSaveTemplateOptions();
    } else if ($event.action === 'keyup') {
      this.openModalPopupSugg(true);
      this.templateIds = [];
      this.manageSaveTemplateOptions();
    } else if ($event.action === 'focus') {
      this.openModalPopupSugg(true);
      this.openSuggestionPanel();
    } else if ($event.action === 'snomed_item_selected') {
      if ($event.data !== undefined) {
        this.openModalPopupSugg(true);
        this.selectedAdviceTemplate.conceptData.push($event.data);
      }
      this.prepareDataForSave();
    } else if ($event.action === 'snomed_item_removed') {
      this.openModalPopupSugg(false);
      _.remove(this.selectedAdviceTemplate.conceptData, (keyword) => {
        return keyword.key === $event.data.key;
      });
      this.prepareDataForSave();
    }
  }

  openModalPopupSugg(val) {
    if (this.commonService.isTabModeOn) {
      this.commonService.openSuggesstionPanelWhenTabModeOnForComponents(val);
    }
  }

  openSuggPanel() {
    this.commonService.openSuggesstionPanelOnFixedComponentSearchCallFunction('open');
  }
}

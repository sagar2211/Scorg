import { ConfirmationPopupComponent } from './../../shared/confirmation-popup/confirmation-popup.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AutoSaveConfirmationComponent } from './../auto-save-confirmation/auto-save-confirmation.component';
import { IChartComponentSections } from './../../public/models/iConsultationSectionComponent';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, ViewChild, ViewContainerRef, ComponentFactoryResolver, OnDestroy } from '@angular/core';
import { PatientChartService } from './../../patient-chart/patient-chart.service';
import { ComponentsService } from './../../public/services/components.service';
import * as _ from 'lodash';
import { CommonService } from './../../public/services/common.service';
import { AuthService } from './../../public/services/auth.service';
import { Constants } from 'src/app/config/constants';
import { DynamicChartService } from '../dynamic-chart.service';
import { SlideInOutAnimation } from './../../config/animations';
import { forkJoin, interval, Subject, Observable, of } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';
import { ExaminationLabelsService } from './../../public/services/examination-labels.service';
import { IAlert } from './../../public/models/AlertMessage';
import { SuggestionPanel } from './../../public/models/suggestion-panel.modal';
import * as moment from 'moment';
import { EncounterPatient } from 'src/app/public/models/encounter-patient.model';
import { UsersService } from 'src/app/public/services/users.service';
import { NgxPermissionsService } from 'ngx-permissions';
import { PatientService } from 'src/app/public/services/patient.service';

@Component({
  selector: 'app-dynamic-chart',
  templateUrl: './dynamic-chart.component.html',
  styleUrls: ['./dynamic-chart.component.scss'],
  animations: [SlideInOutAnimation]
})
export class DynamicChartComponent implements OnInit, OnDestroy {
  @ViewChild('chartCompRef', { read: ViewContainerRef, static: true }) chartCompRef: ViewContainerRef;

  patientId: any;
  chartId: number;
  chartComponentList: Array<any> = [];
  patientObj: EncounterPatient;
  userInfo: any;
  isOpenSuggestionPanel = true;
  suggestionPanelSettings: SuggestionPanel = null;
  animationState = 'out';
  popupLoaded = false;
  faqSectionComponentSection: any;
  scoreTemplateSection: any;
  userId: number;
  destroy$ = new Subject();
  setAlertMessage: IAlert;
  isRoute;
  printChartDataFlag: boolean;
  printChartData: any;
  selectedSectionDetails: any;
  prescriptionDetails: any;
  suggestionOverlappingInput = false;
  isOpenOrderset = false;
  suggestionList = [];
  chartType: string;
  isTabModeOn: boolean = false;
  showSuggPanelInModel: boolean = false;
  isPartialLoad = false;
  isOpenHistory = false;
  loadSuggSection = false;
  constructor(
    private activeRoute: ActivatedRoute,
    private patientChartService: PatientChartService,
    private componentsService: ComponentsService,
    private componentFactoryResolver: ComponentFactoryResolver,
    private commonService: CommonService,
    private authService: AuthService,
    private dynamicChartService: DynamicChartService,
    private examinationLabelsService: ExaminationLabelsService,
    private router: Router,
    private confirmationModalService: NgbModal,
    private userService: UsersService,
    private permissionsService: NgxPermissionsService,
    private patientService: PatientService,
  ) { }

  ngOnInit() {
    this.loadSuggSection = false;
    this.printChartDataFlag = false;
    this.isTabModeOn = this.commonService.isTabModeOn;
    this.activeRoute.params.subscribe(routeParams => {
      if (routeParams.token) {
        this.isPartialLoad = true;
        this.authService.partialPageToken = routeParams.token;
        const token = routeParams.token;
        this.patientId = routeParams.patientId;
        this.loginThroghSSO(token).then(res1 => {
          if (res1) {
            this.getPatientData().then(res => {
              this.userInfo = this.authService.getUserInfoFromLocalStorage();
              this.userId = +this.authService.getLoggedInUserId();
              this.getConsultationPatientChart(routeParams.chartId).then(res1 => {
                this.initCall(routeParams);
              })
            });
          }
        });
      } else {
        if (this.patientChartService.consultationPatientChartMenuList.length > 0) {
          this.initCall(routeParams);
        } else {
          this.getpatientData();
          this.userInfo = this.authService.getUserInfoFromLocalStorage();
          this.userId = +this.authService.getLoggedInUserId();
          this.getConsultationPatientAllChart().then(res1 => {
            this.initCall(routeParams);
          });
        }
      }
    });
    this.subscriptionOfEvents();
  }

  getConsultationPatientAllChart() {
    const promise = new Promise((resolve, reject) => {
      const serviceTypeId = this.patientObj ? this.patientObj.serviceType.id : 0;
      const chartGrp = this.patientObj.loadFrom || ((serviceTypeId === Constants.ServiceType.IPD || serviceTypeId === Constants.ServiceType.ER) ? 'IP_NOTES' : '');
      const req = {
        service_type_id: serviceTypeId,
        speciality_id: this.userInfo.speciality_id,
        role_type_id: this.userInfo.roletype_id,
        user_id: this.userInfo.user_id,
        chart_group: chartGrp,
        is_discharge_chart: this.patientObj.dischargeDate ? true : false,
        is_followup_chart: this.patientObj.isFollowupPatient || false,
        is_view_only: this.patientObj.isViewOnlyPat ? this.patientObj.isViewOnlyPat : false
      };
      this.patientChartService.getConsultationPatientChart(req).subscribe(res => {
        resolve(true);
      });
    });
    return promise;
  }

  getConsultationPatientChart(chartId) {
    const promise = new Promise((resolve, reject) => {
      this.patientChartService.getPatientChartComponentsById(chartId).subscribe(res => {
        const chartData = {
          chart_id: chartId,
          chart_name: null,
          chart_type: 'CONSULTATION_CHART',
          is_followup_chart: false,
          sequence: 1,
          chart_details: res.data
        }
        this.patientChartService.consultationPatientChartMenuList.push({ ...chartData });
        resolve(res);
      });
    });
    return promise;
  }

  getPatientData() {
    const promise = new Promise((resolve, reject) => {
      this.patientService.getPatientActiveVisitDetail(this.patientId).subscribe(res => {
        this.patientObj = res[0];
        this.commonService.setActivePatientList(res[0], 'add');
        resolve(true);
      });
    });
    return promise;
  }

  loginThroghSSO(token) {
    const promise = new Promise((resolve, reject) => {
      this.authService.loginThroghSSO(token, 'emr').subscribe(res => {
        if (res.status_message === 'Success') {
          const userObject = res.data;
          this.commonService.storeKeyValues = [];
          this.commonService.userListTempParams = null;
          this.commonService.getScheduleDataParams = null;
          this.userService.masterUserDetails = {};
          this.authService.redirectUrl = null;
          // store login info to local storage
          this.authService.storeLoginInfo(userObject);
          this.assignRoleAndRedirect(userObject);
          resolve(true);
        } else if (res) {
          resolve(false);
        }
      });
    });
    return promise;
  }

  assignRoleAndRedirect(userObject): void {
    this.userService.GetAssignedRolePermissionsByUserId(userObject.id)
      .subscribe((result) => {
        const userPermission = this.userService.userPermission;
        this.permissionsService.loadPermissions(userPermission);
        // this.redirectTo();
      });
  }

  subscriptionOfEvents() {
    this.dynamicChartService.$getEventFromChildComponent.subscribe(data => {
      this.scoreTemplateSection = undefined;
      this.faqSectionComponentSection = undefined;
      if (data.source === 'faqSection') {
        this.popupLoaded = data.content.openPopup;
        if (this.popupLoaded) {
          this.faqSectionComponentSection = data.content.faqComponentInstance;
        }
      }
      if (data.source === 'scoreTemplate') {
        this.popupLoaded = data.content.openPopup;
        if (this.popupLoaded) {
          this.scoreTemplateSection = data.content.scoreComponentInstance;
        }
      }
      if (data.source === 'prescription') {
        if (data.content.prescriptionDetails && data.content.prescriptionDetails !== null) {
          this.prescriptionDetails = data.content.prescriptionDetails;
          this.suggestionOverlappingInput = true;
        } else {
          this.prescriptionDetails = null;
          this.suggestionOverlappingInput = false;
        }
      }
      if (data.source === 'other_component') {
        this.prescriptionDetails = null;
        this.suggestionOverlappingInput = false;
        this.isOpenSuggestionPanel = true;
        this.isOpenOrderset = false;
      }
    });

    this.commonService.$suggPinUnpinForCharts.pipe(takeUntil(this.destroy$)).subscribe((obj: any) => {
      this.suggestionPanelSettings = obj;
    });

    const secondsCounter = interval(60000);
    secondsCounter.pipe(takeUntil(this.destroy$)).subscribe(n => {
      this.dynamicChartService.autoSaveChartData().subscribe();
      if (this.dynamicChartService.activeChartInfo.serviceType.id === 2) {
        const inConsultation = 4;
        this.updateAppointmentQueueStatus(inConsultation).subscribe();
      }
    });
    this.commonService.$openSuggesstionPanelWhenTabModeOn.subscribe(data => {
      this.showSuggPanelInModel = data ? true : false;
    });
  }

  initCall(routeParams) {
    this.suggestionList = [];
    this.selectedSectionDetails = null;
    this.chartId = +routeParams.chartId;
    this.setActiveChartInfo();
    let getFaqFork = of([]);
    let getExaminationFork = of([]);
    // find if list contains faq templates
    const faqTemplateIds = this.getIdArray('CUSTOM_TEMPLATES');
    const exmHeadid = this.getIdArray('EXAMINATION_HEADS');
    if (faqTemplateIds.length) {
      // call template list and get data
      getFaqFork = this.getFaqTemplates(faqTemplateIds);
    }
    if (exmHeadid.length) {
      // call template list and get data
      getExaminationFork = this.getExamination(exmHeadid);
    }
    const getQueueSettingFork = this.commonService.getQueueSettings(Constants.SUGGESTION_PANEL_SETTING, this.userId);
    const getPatientChartDataFork = this.getPatientChartData();
    forkJoin([getFaqFork, getExaminationFork, getQueueSettingFork, getPatientChartDataFork]).subscribe((res: any) => {
      this.suggestionPanelSettings = {
        suggestionIsShow: true,
        isPin: true,
      };
      if (res[2]) {
        this.suggestionPanelSettings = res[2];
      }
      this.loadChartComponents();
    });
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  loadChartComponents(): void {
    this.isOpenOrderset = false;
    this.isOpenHistory = false;
    this.isOpenSuggestionPanel = true;
    const viewContainerRef = this.chartCompRef;
    viewContainerRef.clear();
    // put chart Date time and chart user component on top
    let compList = [];
    const chartDateComponent = _.filter(this.chartComponentList, d => {
      return d.section_type === 'CONSULTATION_SECTION' && d.section_key === 'chart_date_time';
    });
    const chartUserComponent = _.filter(this.chartComponentList, d => {
      return d.section_type === 'CONSULTATION_SECTION' && d.section_key === 'chart_user';
    });
    compList = chartDateComponent.concat(chartUserComponent);
    _.map(this.chartComponentList, d => {
      if (d.section_type === 'CONSULTATION_SECTION' && d.section_key === 'chart_date_time') {
      } else if (d.section_type === 'CONSULTATION_SECTION' && d.section_key === 'chart_user') {
      } else {
        compList.push(d);
      }
    });
    compList.forEach((item: any, i: number) => {
      const sectionKey = this.getParentSectionKey(item);
      item.component = this.componentsService.getComponentDetailsByKey(sectionKey)['component'];
      if (!item.component) { return; }
      const componentFactory = this.componentFactoryResolver.resolveComponentFactory(
        item.component
      );
      const componentRef = viewContainerRef.createComponent(componentFactory);
      // const dataObj = {
      //   name: item.section_name,
      //   key: item.section_key,
      //   activeIdsOfPanels: i === 0 ? ['item.section_key'] : []
      // };
      item.activeIdsOfPanels = [item.section_key]; //i === 0 ? [item.section_key] : [];
      (componentRef.instance as IChartComponentSections).componentInfo = { ...item };
      if (sectionKey === 'faq_section') {
        // get template ids
        (componentRef.instance as IChartComponentSections)['faqSectionDisplaySetting'] = 'openForm'; // unClubbed
        (componentRef.instance as IChartComponentSections)['templateId'] = item.section_ref_id;
        (componentRef.instance as IChartComponentSections).componentInfo = item;
        this.suggestionPanelSettings = {
          suggestionIsShow: true,
          isPin: true,
        };
      } else if (sectionKey === 'examination_label') {
        // get template ids
        (componentRef.instance as IChartComponentSections)['exminationHeadId'] = item.section_ref_id;
        (componentRef.instance as IChartComponentSections).componentInfo = item;
      } else if (sectionKey === 'lab_investigation') {
        (componentRef.instance as IChartComponentSections)['invesigationType'] = Constants.labInvestigationKey;
        // (componentRef.instance as IChartComponentSections)['investigationData'] = [];
      } else if (sectionKey === 'radiology_investigation') {
        (componentRef.instance as IChartComponentSections)['invesigationType'] = Constants.radioInvestigationKey;
        // (componentRef.instance as IChartComponentSections)['investigationData'] = [];
      } else if (sectionKey === 'investigation') {
        (componentRef.instance as IChartComponentSections)['invesigationType'] = Constants.investigationKey;
        // (componentRef.instance as IChartComponentSections)['investigationData'] = [];
      } else if (sectionKey === 'vitals') {
        (componentRef.instance as IChartComponentSections)['serviceTypeId'] = this.patientObj.serviceType.id;
        (componentRef.instance as IChartComponentSections)['specialtyId'] = this.userInfo.speciality_id;
        // (componentRef.instance as IChartComponentSections)['vitalListSet'] = [];
      } else if (sectionKey === 'prescription') {
        (componentRef.instance as IChartComponentSections)['serviceTypeName'] = this.patientObj.serviceType.name;
        (componentRef.instance as IChartComponentSections)['chartType'] = this.chartType;
      }
    });
  }

  getParentSectionKey(item) {
    if (item.section_type === 'CUSTOM_TEMPLATES') { return 'faq_section'; }
    if (item.section_type === 'EXAMINATION_HEADS') { return 'examination_label'; }
    if (item.section_type === 'SCORE_TEMPLATES') { return 'score_template'; }
    return item.section_key;
  }

  getIdArray(key) {
    const ids = [];
    _.forEach(this.chartComponentList, (comp) => {
      if (comp.section_type === key) {
        ids.push(comp.section_ref_id);
      }
    });
    return ids;
  }

  getFaqTemplates(templateIds): Observable<any> {
    const params = {
      template_ids: templateIds,
    };
    return this.patientChartService.getFaqSectionTemplateList(params).pipe(map(res => res));
  }

  getExamination(ids): Observable<any> {
    return this.examinationLabelsService.getExaminationLabelDetailListData(ids).pipe(map(res => res));
  }

  getpatientData(patient?) {
    if (patient) {
      this.patientObj = patient;
    } else {
      this.patientObj = this.commonService.getLastActivePatient();
    }
    this.patientId = this.patientObj.patientData.id;
    if (this.patientObj.serviceType.name === 'op') {
      this.printChartDataFlag = true;
    }
  }

  setActiveChartInfo() {
    this.getpatientData();
    this.userInfo = this.authService.getUserInfoFromLocalStorage();
    this.userId = +this.authService.getLoggedInUserId();
    // set active chart info in service
    let chartInfo = {
      chartId: this.chartId,
      serviceTypeId: this.patientObj.serviceType.id,
      patientId: this.patientId,
      visitNo: this.patientObj.visitNo,
      userId: this.userId,
      // admissionDate: (this.patientObj as IpdPatient).admissionDate,
      patientName: this.patientObj.patientData.name,
    };
    chartInfo = Object.assign(chartInfo, this.patientObj);
    this.dynamicChartService.setActiveChartInfo(chartInfo);
    const chartDetails = this.patientChartService.getChartDetailsByChartId(this.chartId);
    this.chartComponentList = chartDetails.chart_details;
    this.chartType = chartDetails.chart_type;
    this.loadSuggSection = true;
  }

  getChartKeys() {
    const allChartKeys = this.componentsService.getComponentChartKeys();
    const activeChartKeys = [];
    _.map(this.chartComponentList, (o) => {
      const sectionKey = this.getParentSectionKey(o);
      const index = _.findIndex(allChartKeys, (ck) => ck.componentKey === sectionKey);
      if (index !== -1) {
        activeChartKeys.push(allChartKeys[index].chartKey);
      }
    });
    return activeChartKeys;
  }

  getPatientChartData(): Observable<any> {
    const activeChartKeys = this.getChartKeys();
    return this.dynamicChartService.getPatientChartData(activeChartKeys);
  }

  callAutoSave() {
    this.dynamicChartService.autoSaveChartData().subscribe();
  }

  previewChart() {
    this.printChartData = null;
    const cartData = this.dynamicChartService.getActiveChartParamData(false, []);
    this.printChartData = {
      patientData: this.patientObj,
      chartData: cartData,
      chartComponent: this.patientChartService.getChartDetailsByChartId(this.chartId)
    };
  }

  saveChartData() {
    this.dynamicChartService.saveChartData().subscribe(res => {
      if (res.status) {
        this.getPatientChartData();
        this.printChartData = null;
        this.printChartData = {
          patientData: this.patientObj,
          chartData: res.data,
          chartComponent: this.patientChartService.getChartDetailsByChartId(this.chartId)
        };
        this.notifyAlertMessage({
          msg: 'Chart Saved!',
          class: 'success',
        });
        if (this.dynamicChartService.activeChartInfo.serviceType.id === 2) {
          this.confirmationForCompleteConsultation();
        }
      } else {
        this.notifyAlertMessage({
          msg: 'Something Went Wrong!',
          class: 'danger',
        });
      }
    });
  }

  // Status update for in consultation and complete added by Vishal k
  updateAppointmentQueueStatus(status): Observable<any> {
    let isCall = false;
    const objPat = this.dynamicChartService.activeChartInfo.serviceType.id === 2 ? this.dynamicChartService.activeChartInfo : null;
    const reqParam = {
      queue_main_id: objPat.queueId,
      status_id: status,
      cater_room_id: objPat.caterRoomId,
      mark_as_skip: false,
      next_patient_queueid: 0
    };
    if (objPat &&
      (status === 4 && objPat.queueStatusId === 1 || objPat.queueStatusId === 2) ||
      (status === 5 && objPat.queueStatusId === 4 || objPat.queueStatusId === 1 || objPat.queueStatusId === 2)) {
      const roomMapIds = [objPat.roomMappingId];
      const cDate = moment().format(Constants.apiDateFormate);
      return this.dynamicChartService.getCheckInCheckOutStatus(roomMapIds, cDate).pipe(map((result: any) => {
        if (result.CheckinStatus) {
          this.dynamicChartService.updateAppointmentQueueStatus(reqParam).subscribe(res => {
            objPat.queueStatusId = res ? status : objPat.queueStatusId;
            this.dynamicChartService.activeChartInfo.queueStatusId = objPat.queueStatusId;
            return isCall = true;
          });
        } else {
          return this.dynamicChartService.checknInDoctor(roomMapIds[0]).pipe(map((checkinRes: any) => {
            if (checkinRes.status_message === 'Success') {
              return this.dynamicChartService.updateAppointmentQueueStatus(reqParam).subscribe(res => {
                objPat.queueStatusId = res ? status : objPat.queueStatusId;
                this.dynamicChartService.activeChartInfo.queueStatusId = objPat.queueStatusId;
                return isCall = true;
              });
            }
          }));
        }
      }));
    }
  }

  confirmationForCompleteConsultation(): void {
    const messageDetails = {
      modalTitle: 'Confirm',
      modalBody: 'Do you want to complete consultation?',
      buttonType: 'yes_no',
    };
    const confirmModalInstance = this.confirmationModalService.open(ConfirmationPopupComponent, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false
    });
    confirmModalInstance.componentInstance.messageDetails = messageDetails;
    confirmModalInstance.result.then((result) => {
      if (result === 'yes') {
        const complete = 5; // consultion complete
        this.updateAppointmentQueueStatus(complete).subscribe();
        // this.dynamicChartService.updateAppointmentQueueStatus(reqParam).subscribe(res => {
        //   objPat.queueStatusId = res ? 5 : objPat.queueStatusId;
        // });
      }
    });
  }

  notifyAlertMessage(data): void {
    this.setAlertMessage = {
      message: data.msg,
      messageType: data.class,
      duration: Constants.ALERT_DURATION
    };
  }

  canDeactivate(nextState) {
    if (!this.isRoute) {
      const modalInstance = this.confirmationModalService.open(AutoSaveConfirmationComponent, {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false
      });
      modalInstance.result.then((result) => {
        if (result === 'saveDraft') {
          this.dynamicChartService.autoSaveChartData().subscribe();
          this.router.navigate([nextState.url]);
          this.isRoute = true;
          return true;
        } else if (result === 'discard') {
          this.router.navigate([nextState.url]);
          this.isRoute = true;
          return true;
        }
      }, () => {
        this.isRoute = false;
        return false;
      });
    }
    return this.isRoute ? this.isRoute : false;
  }

  onClickEvent(from): void {
    this.suggestionPanelSettings = {
      suggestionIsShow: false,
      isPin: false,
    };
    this.commonService.openSuggesstionPanelOnFixedComponentSearchCallFunction('open');
    setTimeout(() => {
      this.showSuggPanelInModel = true;
      this.isOpenOrderset = from === 'order' ? !this.isOpenOrderset : false;
      this.isOpenHistory = from === 'history' ? !this.isOpenHistory : false;
      this.isOpenSuggestionPanel = (this.isOpenOrderset || this.isOpenHistory) ? false : true;
      this.prescriptionDetails = null;
      this.suggestionOverlappingInput = false;
    });
  }
}


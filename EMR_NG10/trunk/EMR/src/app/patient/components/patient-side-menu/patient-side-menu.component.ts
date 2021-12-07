
import { Component, OnInit, OnDestroy, OnChanges } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import * as _ from 'lodash';
import { takeUntil, map } from 'rxjs/operators';
import { Subject, Observable, Subscriber } from 'rxjs';
import { PatientService } from './../../../public/services/patient.service';
import { PatientChartService } from './../../../patient-chart/patient-chart.service';
import { Constants } from './../../../config/constants';
import { CommonService } from './../../../public/services/common.service';
import { AuthService } from './../../../public/services/auth.service';
import { IAlert } from './../../../public/models/AlertMessage';
import { MenuItems } from './../../../config/menu-item';
import { EncounterPatient } from 'src/app/public/models/encounter-patient.model';

@Component({
  selector: 'app-patient-side-menu',
  templateUrl: './patient-side-menu.component.html',
  styleUrls: ['./patient-side-menu.component.scss'],
  providers: [MenuItems]
})
export class PatientSideMenuComponent implements OnInit, OnDestroy, OnChanges {
  sideBarArray = [];
  sideBarOrdersArray = [];
  userInfo: any;
  settingKey = '';
  favouriteMenusList: Array<any> = [];
  destroy$ = new Subject<any>();
  showHideIconLabel: boolean;
  patientObj: EncounterPatient;
  patientId: any;
  typeOfRoute: string;
  toggleOrderExpandCollapse = false;
  toggleAddOrderExpandCollapse = false;
  consultationPatientChartMenuList: Array<any> = [];
  alertMsg: IAlert;
  ipChartGroup = 'IP_NOTES';
  isShowChartGroup: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private commonService: CommonService,
    private patientChartService: PatientChartService,
    private menuItems: MenuItems,
    private patientService: PatientService
  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // this.checkCurrentActive();
      }
    });
  }

  ngOnInit() {
    this.typeOfRoute = 'ipd';
    this.showHideIconLabel = false;
    this.settingKey = Constants.DEFAULT_LANDING_PAGE;
    this.userInfo = this.authService.getUserInfoFromLocalStorage();
    this.commonService.getQueueSettings(this.settingKey, this.userInfo.user_id).subscribe(res => {
      if (res) {
        this.favouriteMenusList = res;
        this.favouriteMenusList.forEach((fav: any) => {
          const i = this.sideBarArray.findIndex(r => r.linkKey === fav.parentMenu && fav.masterModule === 'emr');
          if (i !== -1) {
            this.sideBarArray[i].children.forEach(e => {
              const childKey = fav.favouriteRouteUrl.split('/')[fav.favouriteRouteUrl.split('/').length - 1];
              const localKey = e.linkKey.split('/')[e.linkKey.split('/').length - 1];
              if (localKey === childKey) {
                e.isFavourite = true;
              } else {
                e.isFavourite = false;
              }
            });
          }
        });
      }
    });
    this.getpatientData();
    this.subcriptionOfEvents();
    this.patientService.$listenInputs.subscribe(inputData => {
      if (inputData.source === 'order') {
        this.onOrderMenuClick(inputData.data.orderName);
      }
    });

    // hide show ip chart group filter..
    const serviceTypeId = this.patientObj ? this.patientObj.serviceType.id : 0;
    this.isShowChartGroup = (serviceTypeId === Constants.ServiceType.IPD || serviceTypeId === Constants.ServiceType.ER) && !this.patientObj.isViewOnlyPat;
    this.ipChartGroup = this.patientObj.loadFrom ? this.patientObj.loadFrom : 'IP_NOTES';
    if (this.ipChartGroup === 'DISCHARGE_NOTES') {
      this.isShowChartGroup = false;
    }
  }

  ngOnChanges() {

  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  updateActivePatientData(url?) {
    this.patientObj.lastActiveUrl = url || this.router.url;
    const patient = _.cloneDeep(this.patientObj);
    this.commonService.updateActivePatientDataList(patient);
    const splitUrl = this.router.url.split('/')[4];
    if (this.isShowChartGroup) {
      if (this.patientObj.lastActiveUrl.includes('dischargeApp/discharge')) {
        this.isShowChartGroup = false;
      } else if (this.patientObj.lastActiveUrl.includes('nursingApp/nursing')) {
        this.isShowChartGroup = false;
      }
    }
    if (url) {
      // console.log(url, this.sideBarArray);
    } else {
      _.map(this.sideBarArray, (v) => {
        v.isActive = false;
        const localKey = v.linkKey.split('/')[1];
        if (this.patientObj.lastActiveUrl.indexOf(v.linkKey) !== -1) {
          v.isActive = true;
          return;
        }
        // else if (splitUrl === localKey && (localKey !== 'opd')) {
        //   v.isActive = true;
        //   return;
        // }
      });
    }

  }

  checkCurrentActive() {
    this.updateActivePatientData();
    let spiltCoutnt = 0;
    // if (this.router.url.includes('qms/schedule')) {
    //   spiltCoutnt = this.route.snapshot._urlSegment.segments.length - 4;
    // }
    spiltCoutnt = (Object.keys(this.route.snapshot.firstChild.params).length === 0 ?
      Object.keys(this.route.snapshot.firstChild.queryParams).length :
      Object.keys(this.route.snapshot.firstChild.params).length) + 1;

    const isAnyParentActive = !!(_.find(this.sideBarArray, (o) => o.isActive === true));
    const splitUrl = this.router.url.split('/')[4];
    _.map(this.sideBarArray, (v) => {
      const localKey = v.linkKey.split('/')[1];
      v.isActive = false;
      if (this.commonService.isPatientOpenFromNursingRoute) {
        if (this.commonService.patientNursingRoute.indexOf('patient/service-order') !== -1 && v.linkKey.indexOf('patient/service-order') !== -1 && v.sectionKey === 'service_order') {
          v.isActive = true;
          this.commonService.isPatientOpenFromNursingRoute = false;
          this.commonService.patientNursingRoute = null;
          return;
        } else if (this.commonService.patientNursingRoute.indexOf('patient/orders') !== -1 && v.linkKey.indexOf('patient/orders') !== -1 && v.sectionKey === 'orders') {
          this.toggleOrderExpandCollapse = true;
          this.onOrderMenuClick('orders_list');
          this.commonService.isPatientOpenFromNursingRoute = false;
          this.commonService.patientNursingRoute = null;
          return;
        }
      } else {
        if (this.router.url.indexOf(v.linkKey) !== -1) {
          v.isActive = true;
          return;
        }
        // else if (splitUrl === localKey && (localKey !== 'opd')) {
        //   v.isActive = true;
        //   return;
        // }
      }
      // else {
      //   const index = (localKey === 'pacs') ? 1 : 2;
      //   const splitUrl1 = this.router.url.split('/')[5];
      //   const localKey1 = v.linkKey.split('/')[index];
      //   v.isActive = splitUrl1 === localKey1;
      // }
    });
  }

  updateParentActive(index) {
    _.map(this.sideBarArray, (v) => {
      v.isActive = false;
    });
    this.sideBarArray[index].isActive = true;
  }

  saveFavourite(parentItem, childItem, $event): void {
    $event.stopPropagation();
    parentItem.children.forEach(c => {
      c.isFavourite = false;
    });
    childItem.isFavourite = true;
    const indx = this.favouriteMenusList.findIndex(f => f.parentMenu === parentItem.linkKey && f.masterModule === 'emr');

    const key = this.authService.getActiveAppKey();
    const appKey = key === 'EMR' ? 'emr' : (key === 'NURSING' ? 'nursing' : 'discharge');
    if (indx !== -1) {
      if (appKey === 'emr') {
        this.favouriteMenusList[indx].favouriteRouteUrl = 'emr/' + childItem.linkKey;
      } else if (appKey === 'nursing') {
        this.favouriteMenusList[indx].favouriteRouteUrl = 'nursingApp/nursing/' + childItem.linkKey;
      } else if (appKey === 'discharge') {
        this.favouriteMenusList[indx].favouriteRouteUrl = 'dischargeApp/discharge/' + childItem.linkKey;
      }
    } else {
      this.favouriteMenusList.push({
        masterModule: appKey,
        parentMenu: parentItem.linkKey,
        favouriteRouteUrl: appKey === 'emr' ? 'emr/' + childItem.linkKey : (appKey === 'nursing' ? 'nursingApp/nursing/' + childItem.linkKey : 'dischargeApp/discharge/' + childItem.linkKey)
      });
    }
    this.commonService.SaveQueueSettings(this.settingKey, JSON.stringify(this.favouriteMenusList), this.userInfo.user_id).subscribe();
  }

  onMenuClick(parentUrl, index?): void {
    if (index !== undefined) {
      _.map(this.sideBarArray, (o, k) => {
        o.isActive = false;
      });
      this.sideBarArray[index].isActive = true;
      _.map(this.sideBarOrdersArray, (o, k) => {
        o.isActive = false;
      });
    }
    this.showHidePatientMenu();
    const key = this.authService.getActiveAppKey();
    const appKey = key === 'EMR' ? 'emr' : (key === 'NURSING' ? 'nursing' : 'discharge');
    let url = null;
    if (appKey === 'emr') {
      url = '/emr/' + parentUrl.linkKey;
    } else if (appKey === 'nursing') {
      url = '/nursingApp/nursing/' + parentUrl.linkKey;
    } else if (appKey === 'discharge') {
      url = '/dischargeApp/discharge/' + parentUrl.linkKey;
    }
    this.updateActivePatientData(url);
    this.router.navigate([url]);
  }

  onOrderMenuClick(menuKey): void {
    _.map(this.sideBarArray, (o, k) => {
      o.isActive = false;
    });
    let linkKey = '';
    _.map(this.sideBarOrdersArray, (o, k) => {
      o.isActive = false;
      if (o.sectionKey === menuKey) {
        linkKey = o.linkKey;
        o.isActive = true;
      }
    });
    if (linkKey !== '') {
      this.showHidePatientMenu();
      const key = this.authService.getActiveAppKey();
      const appKey = key === 'EMR' ? 'emr' : (key === 'NURSING' ? 'nursing' : 'discharge');
      let url = null;
      if (appKey === 'emr') {
        url = '/emr/' + linkKey;
      } else if (appKey === 'nursing') {
        url = '/nursingApp/nursing/' + linkKey;
      } else if (appKey === 'discharge') {
        url = '/dischargeApp/discharge/' + linkKey;
      }
      this.updateActivePatientData(url);
      this.router.navigate([url]);
    }
  }

  showHidePatientMenu() {
    // this.showHideIconLabel = !this.showHideIconLabel;
    this.commonService.showHidePatientMenuToSortInfoComp();
  }

  subcriptionOfEvents() {
    this.commonService.$subAddRemoveActivePatientFromList.pipe(takeUntil(this.destroy$)).subscribe((obj: any) => {
      this.getpatientData(obj.data);
    });
    this.commonService.$patientMenushowHide.pipe(takeUntil(this.destroy$)).subscribe(data => {
      this.showHideIconLabel = !this.showHideIconLabel;
    });
    this.commonService.$showHidePatientMenuToSortInfo.pipe(takeUntil(this.destroy$)).subscribe((obj: any) => {
      this.showHideIconLabel = !this.showHideIconLabel;
    });
  }

  getpatientData(patient?) {
    if (patient) {
      this.patientObj = patient;
    } else {
      this.patientObj = this.commonService.getLastActivePatient() as EncounterPatient;
    }
    this.patientId = this.patientObj.patientData.id;
    this.ipChartGroup = this.patientObj.loadFrom ? this.patientObj.loadFrom : 'IP_NOTES';
    this.getConsultationPatientChart().subscribe(res => {
      this.getPatientSideMenuData();
      if (this.ipChartGroup === 'DISCHARGE_NOTES') {
        this.isShowChartGroup = false;
      }
      if (!this.commonService.isPatientOpenFromNursingRoute && 'discharge' !== _.toLower(this.authService.getActiveAppKey())) {
        this.onChartGroupChange();
      } else {
        this.checkCurrentActive();
      }
    });
  }

  onChartGroupChange(): void {
    const activeSelectedMenu = _.find(this.sideBarArray, (o) => o.isActive === true);
    this.getConsultationPatientChart().subscribe(res => {
      this.getPatientSideMenuData();
      if (!this.commonService.isPatientOpenFromNursingRoute) {
        // Check old selected menu is available in new chart list then select the same else show dashboard
        const prevSelectedMenuExists = activeSelectedMenu ? _.find(this.sideBarArray, (o) => o.linkKey === activeSelectedMenu.linkKey) : null;
        if (prevSelectedMenuExists && activeSelectedMenu) {
          this.updateActivePatientData();
        } else {
          this.onMenuClick(this.sideBarArray[0], 0);
        }
      }
    });
  }

  // -- get patient chart by service type
  getConsultationPatientChart(): Observable<any> {
    const serviceTypeId = this.patientObj ? this.patientObj.serviceType.id : 0;
    this.patientObj.isViewOnlyPat ? this.patientObj.isViewOnlyPat : false
    const req = {
      service_type_id: this.patientObj.isViewOnlyPat ? Constants.ServiceType.OPD : serviceTypeId,
      speciality_id: this.userInfo.speciality_id,
      role_type_id: this.userInfo.roletype_id,
      user_id: this.userInfo.user_id,
      chart_group: (serviceTypeId === Constants.ServiceType.IPD || serviceTypeId === Constants.ServiceType.ER) ? this.ipChartGroup : '',
      is_discharge_chart: this.patientObj.dischargeDate ? true : false,
      is_followup_chart: this.patientObj.isFollowupPatient || false,
      is_view_only: this.patientObj.isViewOnlyPat ? this.patientObj.isViewOnlyPat : false
    };
    return this.patientChartService.getConsultationPatientChart(req).pipe(map((res: any) => {
      if (res.length) {
        this.consultationPatientChartMenuList = res;
      } else {
        this.alertMsg = {
          duration: Constants.ALERT_DURATION,
          message: 'No charts available!',
          messageType: 'danger'
        };
      }
    }));
  }

  getPatientSideMenuData() {
    this.sideBarOrdersArray = [];
    this.sideBarArray = [];

    this.sideBarOrdersArray = this.patientService.getOrdersMenuList(this.patientId);
    // -- for patient charts menus
    this.consultationPatientChartMenuList.forEach(c => {
      if (c.chart_type === 'FIXED_CHART') {
        // if (c.chart_details[0].section_key === 'ipd_diagnosis') {
        const menuData = this.menuItems.getMenusDetailsByKey(c.chart_details[0].section_key);
        if (menuData) {
          menuData.name = c.chart_name;
          menuData.linkKey = `${menuData.linkKey}/${this.patientId}`;
          this.sideBarArray.push(menuData);
        }
      } else {
        this.sideBarArray.push({
          linkKey: `patient/dynamic-chart/${this.patientId}/${c.chart_id}`,
          name: c.chart_name,
          isActive: false,
          cssClass: 'icon-emr-progress-notes',
          permission: [],
          children: []
        });
      }
    });
    // set active patient menu by matching route url
    // this.checkCurrentActive();
  }

  getIsActive(key: string) {
    const obj = (_.find(this.sideBarOrdersArray, (o) => o.sectionKey === key));
    return obj.isActive;
  }

  isActiveMenus(item): boolean {
    if (item.sectionKey === 'discharge_summary') {
      return this.patientObj.dischargeDate ? true : false;
    } else {
      return true;
    }
  }
}

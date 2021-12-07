import { IAlert } from '../../../public/models/AlertMessage';
import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from '../../../public/services/common.service';
import { QueueSlots } from '@qms/qlist-lib';
import { AuthService } from '../../../public/services/auth.service';
import { PatientService } from '../../../public/services/patient.service';
import { UsersService } from '../../../public/services/users.service';
import { DashBoardService } from './../../services/dashboard.service';
import { environment } from 'src/environments/environment';
import { PermissionsConstants } from '../../../config/PermissionsConstants';
import { Constants } from 'src/app/config/constants';
import * as _ from 'lodash';
import { EncounterPatient } from 'src/app/public/models/encounter-patient.model';

@Component({
  selector: 'app-nurse-dashboard',
  templateUrl: './nurse-dashboard.component.html',
  styleUrls: ['./nurse-dashboard.component.scss'],
  providers: [DashBoardService]
})
export class NurseDashboardComponent implements OnInit {

  providerDetails = null;
  userInfo: any = null;
  userId: number;
  loggedUserProvidersList = [];
  startDate: Date;
  timeFormateKey = '';
  $destroy: Subject<boolean> = new Subject();
  qSlotList: Array<QueueSlots> = [];
  isShowSlot = false;
  hideActions: true;
  filter = ['NEXT', 'CALLING', 'INCONSULTATION', 'SKIP', 'COMPLETE'];
  isClicked = 'all';
  alertMsg: IAlert;
  permissionConstList: any = [];
  admittedPatients: any[] = [];
  clonedAdmittedPatients: any[] = [];
  wardNoList: any[] = [];
  floorNoList: any[] = [];
  isNurse = false;
  appointmentsCntStatus = {
    total_app: 0,
    total_ConfirmedApp: 0,
    total_TentitiveApp: 0,
    total_FollowPatient: 0,
    total_NewPatient: 0
  };
  baseUrlQms: any;
  displayTypeQlist: string;
  isShowEmptySlotQlist: boolean;
  admittedPatWardNo = 'All';
  admittedPatFloorNo = 'All';
  imageUrl: string;
  favoriteTabView = '';
  activeTab = '';
  @ViewChild('tab', { static: true }) tab: any;
  modalRef: any;
  PermissionsConstantsListforLib: any = [];

  constructor(
    private route: ActivatedRoute,
    private commonService: CommonService,
    private authService: AuthService,
    private router: Router,
    private patientService: PatientService,
    private userService: UsersService
  ) { }

  ngOnInit() {
    this.imageUrl = './assets/img/profile.svg';
    this.baseUrlQms = environment;
    this.displayTypeQlist = 'grid';
    this.isShowEmptySlotQlist = true;
    this.startDate = new Date();
    this.permissionConstList = PermissionsConstants;
    this.commonService.routeChanged(this.route);
    this.userId = +this.authService.getLoggedInUserId();
    this.userInfo = this.authService.getUserInfoFromLocalStorage();
    this.isNurse = _.toLower(this.userInfo.role_type) !== 'nurse' ? false : true;
    this.loggedUserProvidersList = this.userInfo.provider_info;
    this.PermissionsConstantsListforLib = this.commonService.getuserpermissionForlib();
    this.providerDetails = _.find(this.loggedUserProvidersList, { providerValueId: this.userInfo.user_id });
    this.getUserData();
    this.getDocDashboardFavTabSettings();
  }
  ngAfterViewInit() {
    this.tab.activeId = this.activeTab;
  }

  navigateTo(param1, pram2) {

  }

  getUserData() {
    this.userService.getUserImageById(this.userId, true).subscribe(imageResult => {
      if (imageResult.status_code === 200 && imageResult.userImageDetail && imageResult.userImageDetail.userImagePath != null) {
        this.showProfileImage(imageResult.userImageDetail, this.userId);
      }
    });
  }

  showProfileImage(ImageData, userId) {
    if (ImageData != null && ImageData.userImagePath !== '#') {
      this.imageUrl = null;
      this.imageUrl = ImageData.userImagePath + '?time=' + new Date().getTime();
    }
  }

  displayErrorMsg(message: string, messageType: string): void {
    this.alertMsg = { message, messageType, duration: Constants.ALERT_DURATION };
  }

  updateApptCntStatus(apptCntStatusObj) {
    this.appointmentsCntStatus = apptCntStatusObj;
  }

  switchNgBTab(id: string) {
    this.tab.activeId = id;
  }

  loadData($event) {
    this.activeTab = $event.nextId;
    if ($event.nextId === 'admitted') {
      // load admitted patient data
      this.getAdmittedPatientData();
    }
  }

  getAdmittedPatientData() {
    const param = {
      search_keyword: '',
      service_type_id: null,
      doctor_id: this.userInfo.user_id,
      floor: null,
      ward: null,
      page_number: 1,
      limit: 50
    };
    this.patientService.getAdmittedPatients(param).subscribe((res) => {
      this.admittedPatients = res;
      this.clonedAdmittedPatients = _.cloneDeep(this.admittedPatients);
      if (this.admittedPatients.length) {
        // filter and extract
        const wardNos = [];
        const floorNos = [];
        _.map(this.admittedPatients, (o) => {
          wardNos.push(o.ward);
          floorNos.push(o.floor);
        });
        this.wardNoList = _.uniq(wardNos);
        this.floorNoList = _.uniq(floorNos);
      }
    });
  }

  filterAdmittedPatientData() {
    this.admittedPatients = _.filter(this.clonedAdmittedPatients, (o) => {
      const wardNo = (this.admittedPatWardNo === 'All') ? o.ward : this.admittedPatWardNo;
      const floorNo = (this.admittedPatFloorNo === 'All') ? o.floor : this.admittedPatFloorNo;
      return (o.ward === wardNo && o.floor === floorNo);
    });
  }

  navigateToPatient(patient: EncounterPatient) {
    patient.type = patient.serviceType.name.toLowerCase();
    patient.loadFrom = '-1';
    this.commonService.setActivePatientList(patient, 'add');
    if (this.commonService.getActivePatientList(patient).length <= 5) {
      const obj = {
        type: 'add',
        data: patient,
        sourc: 'doctor_dashboard'
      };
      this.commonService.updateActivePatientList(obj);
      this.router.navigate(['/emr/patient/dashboard/', patient.patientData.id]);

    } else {
      this.displayErrorMsg('Max 5 Patient Allowed', 'danger');
    }
  }

  setViewFavorite(viewName) {
    const setFavViewObj = {
      favTabView: viewName,
    };
    const queSettingObj = JSON.stringify(setFavViewObj);
    const userId = this.userId;
    this.commonService.SaveQueueSettings(Constants.EMR_DOC_DASHBOARD_FAV_TAB_SETTING, queSettingObj, userId).subscribe((res) => {
      if (res != null && res === 'Success') {
        this.favoriteTabView = viewName;
      }
    });
  }

  getDocDashboardFavTabSettings() {
    const userId = this.userId;
    this.commonService.getQueueSettings(Constants.EMR_DOC_DASHBOARD_FAV_TAB_SETTING, userId).subscribe(res => {
      this.activeTab = (res && res.favTabView) ? res.favTabView : 'admitted';
      this.favoriteTabView = (res && res.favTabView) ? res.favTabView : '';
      // this.switchNgBTab(this.activeTab);
      if (this.activeTab === 'admitted') {
        this.getAdmittedPatientData();
      }
    });
  }

}



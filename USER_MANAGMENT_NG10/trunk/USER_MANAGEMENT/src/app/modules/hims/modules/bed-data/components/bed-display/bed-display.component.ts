import { Component, OnInit } from '@angular/core';
import { Observable, Subject, concat, of } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/public/services/auth.service';
import { BedService } from 'src/app/modules/hims/services/bed.service';
import { distinctUntilChanged, debounceTime, switchMap, catchError } from 'rxjs/operators';
import * as _ from 'lodash';
import { PatientService } from 'src/app/modules/consent/services/patient.service';
import { environment } from 'src/environments/environment';
import { UsersService } from 'src/app/public/services/users.service';
import { CommonService } from 'src/app/public/services/common.service';
import { NgxPermissionsService } from 'ngx-permissions';

@Component({
  selector: 'app-bed-display',
  templateUrl: './bed-display.component.html',
  styleUrls: ['./bed-display.component.scss']
})
export class BedDisplayComponent implements OnInit {

  loadPage: boolean;
  bedDisplayData = [];

  level1list$ = new Observable<any>();
  level1Input$ = new Subject<any>();

  level2list$ = new Observable<any>();
  level2Input$ = new Subject<any>();

  level3list$ = new Observable<any>();
  level3Input$ = new Subject<any>();

  level4list$ = new Observable<any>();
  level4Input$ = new Subject<any>();

  level5list$ = new Observable<any>();
  level5Input$ = new Subject<any>();

  patientList$ = new Observable<any>();
  patientInput$ = new Subject<any>();

  bedChargelist = [];
  bedCategorylist = [];
  bedTypelist = [];
  bedClasslist = [];
  bedStatusArray = [
    {
      name: 'All',
      key: 'All'
    },
    {
      name: 'Occupied',
      key: 'O'
    },
    {
      name: 'Vaccant',
      key: 'V'
    },
    {
      name: 'Reserved',
      key: 'R'
    },
    {
      name: 'Booked',
      key: 'B'
    },
    {
      name: 'Maintenance/Blocked Bed',
      key: 'M'
    },
  ];

  filterObj = {
    level1: null,
    level1Data: null,
    level1View: false,
    level1Config: null,
    level2: null,
    level2Data: null,
    level2View: false,
    level2Config: null,
    level3: null,
    level3Data: null,
    level3View: false,
    level3Config: null,
    level4: null,
    level4Data: null,
    level4View: false,
    level4Config: null,
    level5: null,
    level5Data: null,
    level5View: false,
    level5Config: null,

    patientId: null,
    patientData: null,
    bedCharge: null,
    bedChargeData: null,
    bedCategory: null,
    bedCategoryData: null,
    bedType: null,
    bedTypeData: null,
    bedClass: null,
    bedClassData: null,
    date: new Date(),
    showAvailableBed: false,
    genderId: 0,
    genderData: {
      name: 'All',
      id: 0,
    },
    bedStatus: this.bedStatusArray[0].key,
    bedStatusData: this.bedStatusArray[0]
  }
  loadSource;
  isPartialLink: boolean;

  gendarArray = [
    {
      name: 'All',
      id: 0,
    },
    {
      name: 'Male',
      id: 1,
    },
    {
      name: 'Female',
      id: 2,
    }
  ]
  constructor(
    private router: Router,
    private authService: AuthService,
    private activeRoute: ActivatedRoute,
    private bedService: BedService,
    private patientService: PatientService,
    private userService: UsersService,
    private commonService: CommonService,
    private permissionsService: NgxPermissionsService,
  ) { }

  ngOnInit(): void {
    this.loadPage = false;
    this.bedService.levelParentId = 0;

    this.isPartialLink = this.router.url.indexOf('bedDisplay') !== -1;
    if (this.isPartialLink) {
      this.authService.partialPageToken = this.activeRoute.snapshot.params.id;
      this.loadSource = this.activeRoute.snapshot.params.source || 'ENCOUNTER';
      const token = this.activeRoute.snapshot.params.userTokan;
      this.loginThroghSSO(token).then(res => {
        this.getLevelCofiguration().then(res => {
          if (res) {
            this.loadDefaultApi();
            this.loadPage = true;
          }
        });
      })
    } else {
      this.getLevelCofiguration().then(res => {
        if (res) {
          this.loadDefaultApi();
          this.loadPage = true;
        }
      });
    }
  }

  loadDefaultApi() {
    this.getLevel1Data();
    this.getPatientSearchData();
    this.getBedTypeData();
    this.getBedchargeData();
    this.getBedClassData();
    this.getBedCategoryData();
    this.getOccupiedBedDetail().then();
  }

  loginThroghSSO(token) {
    const promise = new Promise((resolve, reject) => {
      this.authService.loginThroghSSO(token).subscribe(res => {
        if (res.status_message === 'Success') {
          // console.log('Success', res);
          // localStorage.setItem('globals', JSON.stringify(res.data));
          const userObject = res.data;
          this.commonService.storeKeyValues = [];
          this.commonService.userListTempParams = null;
          this.commonService.getScheduleDataParams = null;
          this.userService.masterUserDetails = {};
          this.authService.redirectUrl = null;
          // store login info to local storage
          this.authService.storeLoginInfo(userObject);
          this.assignRoleAndRedirect(userObject);
          // this.router.navigate(['/app/user/userList']);
          resolve(true);
        } else if (res) {
          let loginPageUrl = environment.SSO_LOGIN_URL;
          loginPageUrl = environment.production && loginPageUrl ? loginPageUrl : window.location.origin;
          window.open(loginPageUrl, '_self');
          resolve(true);
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

  getLevelCofiguration() {
    const promise = new Promise((resolve, reject) => {
      this.bedService.getLevelCofiguration().subscribe(res => {
        if (res.length > 0) {
          _.map(res, dt => {
            this.filterObj['level' + dt.levelId + 'View'] = true;
            this.filterObj['level' + dt.levelId + 'Config'] = dt;
          });
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
    return promise;
  }

  onLevelChange(val, lvl) {
    if (val) {
      this.filterObj['level' + lvl + 'Data'] = val;
      this.filterObj['level' + lvl] = val.levelDataId;
    } else {
      this.filterObj['level' + lvl + 'Data'] = null;
      this.filterObj['level' + lvl] = null;
    }
    this.updateLevelParentId(val, lvl);
  }

  updateLevelParentId(val, lvl) {
    if (val) {
      this.bedService.levelParentId = val.levelDataId;
    }
    for (let i = (+lvl + 1); i <= 5; i++) {
      this.filterObj['level' + i + 'Data'] = null;
      this.filterObj['level' + i] = null;
    }
    if (lvl === 1 && val && this.filterObj.level2View) {
      this.bedService.levelParentId = this.filterObj.level1Data.levelDataId;
      this.getLevel2Data();
    } else if (lvl === 2 && val && this.filterObj.level3View) {
      this.bedService.levelParentId = this.filterObj.level2Data.levelDataId;
      this.getLevel3Data();
    } else if (lvl === 3 && val && this.filterObj.level4View) {
      this.bedService.levelParentId = this.filterObj.level3Data.levelDataId;
      this.getLevel4Data();
    } else if (lvl === 4 && val && this.filterObj.level5View) {
      this.bedService.levelParentId = this.filterObj.level4Data.levelDataId;
      this.getLevel5Data();
    } else if (lvl === 1 && !val && this.filterObj.level1View) {
      this.bedService.levelParentId = 0;
      this.getLevel1Data();
    } else if (lvl === 2 && !val && this.filterObj.level2View) {
      this.bedService.levelParentId = this.filterObj.level1Data.levelDataId;
      this.getLevel2Data();
    } else if (lvl === 3 && !val && this.filterObj.level3View) {
      this.bedService.levelParentId = this.filterObj.level2Data.levelDataId;
      this.getLevel3Data();
    } else if (lvl === 4 && !val && this.filterObj.level4View) {
      this.bedService.levelParentId = this.filterObj.level3Data.levelDataId;
      this.getLevel4Data();
    } else if (lvl === 5 && !val && this.filterObj.level5View) {
      this.bedService.levelParentId = this.filterObj.level4Data.levelDataId;
      this.getLevel4Data();
    }
  }

  onGendarChange(val) {
    if (val) {
      this.filterObj.genderId = val.id;
      this.filterObj.genderData = val;
    } else {
      this.filterObj.genderId = 0;
      this.filterObj.genderData = {
        name: 'All',
        id: 0,
      };
    }
  }

  onBedChargeChange(val) {
    if (val) {
      this.filterObj.bedCharge = val.bedChargeId;
      this.filterObj.bedChargeData = val;
    } else {
      this.filterObj.bedCharge = null;
      this.filterObj.bedChargeData = null;
    }
  }

  onBedCategoryChange(val) {
    if (val) {
      this.filterObj.bedCategory = val.bedCategoryId;
      this.filterObj.bedCategoryData = val;
    } else {
      this.filterObj.bedCategory = null;
      this.filterObj.bedCategoryData = null;
    }
  }

  onBedTypeChange(val) {
    if (val) {
      this.filterObj.bedType = val.bedTypeId;
      this.filterObj.bedTypeData = val;
    } else {
      this.filterObj.bedType = null;
      this.filterObj.bedTypeData = null;
    }
  }

  onBedStatusChange(val) {
    if (val) {
      this.filterObj.bedStatus = val.key;
      this.filterObj.bedStatusData = val;
    } else {
      this.filterObj.bedStatus = this.bedStatusArray[0].key;
      this.filterObj.bedStatusData = this.bedStatusArray[0];
    }
  }

  onBedClassChange(val) {
    if (val) {
      this.filterObj.bedClass = val.bedClassId;
      this.filterObj.bedClassData = val;
    } else {
      this.filterObj.bedClass = null;
      this.filterObj.bedClassData = null;
    }
  }

  onPatientChange(val) {
    if (val) {
      this.filterObj.patientId = val.patientId;
      this.filterObj.patientData = val;
    } else {
      this.filterObj.patientId = null;
      this.filterObj.patientData = null;
    }
  }

  updateSelectedDate(val) {
    this.filterObj.date = val;
  }

  loadBedFilterData() {
    this.getOccupiedBedDetail().then(res => {

    });
  }

  getOccupiedBedDetail() {
    const promise = new Promise((resolve, reject) => {
      const param = {
        levelDataId: this.bedService.levelParentId,
        bedChargeId: this.filterObj.bedCharge ? this.filterObj.bedCharge : 0,
        bedCategoryId: this.filterObj.bedCategory ? this.filterObj.bedCategory : 0,
        bedTypeId: this.filterObj.bedType ? [this.filterObj.bedType] : [],
        bedClassId: this.filterObj.bedClass ? this.filterObj.bedClass : 0,
        genderId: this.filterObj.genderId ? this.filterObj.genderId : 0,
        status: this.filterObj.bedStatus ? this.filterObj.bedStatus : 'All',
        date: this.filterObj.date ? this.filterObj.date : new Date(),
        showAvailableBed: this.filterObj.showAvailableBed,
      }
      this.bedService.getBedOccupiedList(param).subscribe(res => {
        resolve(this.updateBedDisplayData(res));
      });
    });
    return promise;
  }

  updateBedDisplayData(data) {
    this.bedDisplayData = [];
    _.map(data, d => {
      d.wardWiseData = [];
      const grpData = _.groupBy(d.bedData, 'bedInfo');
      _.map(grpData, (gd, gk) => {
        const obj = {
          wardName: gk,
          wardBed: gd,
        };
        d.wardWiseData = d.wardWiseData.concat(obj);
      });
    });
    console.log(data);
    return this.bedDisplayData = data;
  }

  getBedTypeData() {
    this.bedService.getBedTypeList().subscribe(res => {
      if (res.length > 0) {
        this.bedTypelist = res;
      } else {
        this.bedTypelist = [];
      }
    });
  }

  getBedClassData() {
    this.bedService.getBedClassList().subscribe(res => {
      if (res.length > 0) {
        this.bedClasslist = res;
      } else {
        this.bedClasslist = [];
      }
    });
  }

  getBedCategoryData() {
    this.bedService.getBedCategoryList().subscribe(res => {
      if (res.length > 0) {
        this.bedCategorylist = res;
      } else {
        this.bedCategorylist = [];
      }
    });
  }

  getBedchargeData() {
    this.bedService.getBedChargesList().subscribe(res => {
      if (res.length > 0) {
        this.bedChargelist = res;
      } else {
        this.bedChargelist = [];
      }
    });
  }

  getLevel1Data(searchTxt?) {
    this.level1list$ = concat(
      this.bedService.getLevelData(searchTxt ? searchTxt : ''), // default items
      this.level1Input$.pipe(
        distinctUntilChanged(),
        debounceTime(500),
        switchMap(term => this.bedService.getLevelData(term ? term : (searchTxt ? searchTxt : '')).pipe(
          catchError(() => of([]))
        ))
      )
    );
  }

  getLevel2Data(searchTxt?) {
    this.level2list$ = concat(
      this.bedService.getLevelData(searchTxt ? searchTxt : ''), // default items
      this.level2Input$.pipe(
        distinctUntilChanged(),
        debounceTime(500),
        switchMap(term => this.bedService.getLevelData(term ? term : (searchTxt ? searchTxt : '')).pipe(
          catchError(() => of([]))
        ))
      )
    );
  }

  getLevel3Data(searchTxt?) {
    this.level3list$ = concat(
      this.bedService.getLevelData(searchTxt ? searchTxt : ''), // default items
      this.level3Input$.pipe(
        distinctUntilChanged(),
        debounceTime(500),
        switchMap(term => this.bedService.getLevelData(term ? term : (searchTxt ? searchTxt : '')).pipe(
          catchError(() => of([]))
        ))
      )
    );
  }

  getLevel4Data(searchTxt?) {
    this.level4list$ = concat(
      this.bedService.getLevelData(searchTxt ? searchTxt : ''), // default items
      this.level4Input$.pipe(
        distinctUntilChanged(),
        debounceTime(500),
        switchMap(term => this.bedService.getLevelData(term ? term : (searchTxt ? searchTxt : '')).pipe(
          catchError(() => of([]))
        ))
      )
    );
  }

  getLevel5Data(searchTxt?) {
    this.level5list$ = concat(
      this.bedService.getLevelData(searchTxt ? searchTxt : ''), // default items
      this.level5Input$.pipe(
        distinctUntilChanged(),
        debounceTime(500),
        switchMap(term => this.bedService.getLevelData(term ? term : (searchTxt ? searchTxt : '')).pipe(
          catchError(() => of([]))
        ))
      )
    );
  }

  getPatientSearchData(searchTxt?) {
    this.patientList$ = concat(
      this.patientService.getQuickPatientList(searchTxt ? searchTxt : ''), // default items
      this.patientInput$.pipe(
        distinctUntilChanged(),
        debounceTime(500),
        switchMap(term => this.patientService.getQuickPatientList(term ? term : (searchTxt ? searchTxt : '')).pipe(
          catchError(() => of([]))
        ))
      )
    );
  }

}

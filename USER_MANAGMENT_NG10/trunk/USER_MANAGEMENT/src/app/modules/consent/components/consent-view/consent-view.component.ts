import { Component, OnInit } from '@angular/core';
import { Subject, of, Observable, concat } from 'rxjs';
import { debounceTime, takeUntil, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import * as _ from 'lodash';
import * as moment from 'moment';
import { PatientService } from '../../services/patient.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/public/services/auth.service';
import { CommonService } from 'src/app/public/services/common.service';
import { UsersService } from 'src/app/public/services/users.service';
import { environment } from 'src/environments/environment';
import { NgxPermissionsService } from 'ngx-permissions';
import { IAlert } from 'src/app/public/models/AlertMessage';
import { Constants } from 'src/app/config/constants';
import * as printJS from 'print-js';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationPopupComponent } from 'src/app/shared/confirmation-popup/confirmation-popup.component';

@Component({
  selector: 'app-consent-view',
  templateUrl: './consent-view.component.html',
  styleUrls: ['./consent-view.component.scss']
})
export class ConsentViewComponent implements OnInit {

  setAlertMessage: IAlert;
  patientId;
  patientData;
  languageId;
  language;
  loadSource;
  isPartialLink: boolean;
  showPatientSearch: boolean;
  patientList$ = new Observable<any>();
  patientInput$ = new Subject<any>();
  consentSelected = [];
  printData = null;
  languageListArray = [];
  formType;
  typeListArray = [];
  formListAllType = [];
  favouriteIds : any;
  favouriteListArray = [];
  properties = this;
  loadPage = false;

  isFav = false;
  favName = null;
  favId: any;
  overrideFavList = false;
  formListAllTypeClone: any[];
  constructor(
    private patientService: PatientService,
    private router: Router,
    private authService: AuthService,
    private activeRoute: ActivatedRoute,
    private commonService: CommonService,
    private userService: UsersService,
    private permissionsService: NgxPermissionsService,
    private confirmationModalService: NgbModal,
  ) { }

  ngOnInit(): void {
    debugger;
    this.loadPage = false;
    this.showPatientSearch = true;
    this.isPartialLink = this.router.url.indexOf('partialConsentFrom') !== -1;
    this.commonService.routeChanged(this.activeRoute);
    console.log('ConsentViewComponent:ngOnInit, isPartialLink:' + this.isPartialLink);
    if (this.isPartialLink) {
      console.log('ConsentViewComponent:isPartialLink');
      this.authService.partialPageToken = this.activeRoute.snapshot.params.userTokan;
      this.loadSource = this.activeRoute.snapshot.params.source || 'NURSING FORM';
      const token = this.activeRoute.snapshot.params.userTokan;
      this.patientId = this.activeRoute.snapshot.params.patientId;
      this.loginThroghSSO(token).then(res1 => {
        console.log('ConsentViewComponent:loginThroghSSO', res1);
        if (res1) {
          this.getPatientData().then(res => {
            this.loadPage = true;
            this.language = null;
            this.formType = null;
            this.loadDefaultData();
          });
        } else {

        }
      });
    } else {
      this.patientData = null;
      this.loadPage = true;
      this.language = null;
      this.formType = null;
      this.loadDefaultData();
    }
  }

  loadDefaultData() {
    this.getPatientSearchData();
    this.getLanguageList();
    this.getTypeList();
    this.getFavouriteData();
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
          // let loginPageUrl = environment.SSO_LOGIN_URL;
          // loginPageUrl = environment.production && loginPageUrl ? loginPageUrl : window.location.origin;
          // window.open(loginPageUrl, '_self');
          resolve(false);
        }
      });
    });
    return promise;
  }

  getPatientData() {
    const promise = new Promise((resolve, reject) => {
      this.patientService.getPatientActiveVisitDetail(this.patientId).subscribe(res => {
        this.patientData = {
          admissionDate: res[0].admissionDate,
          age: res[0].patientData.age,
          bedNo: res[0].bed,
          dob: res[0].patientData.dob,
          doctorId: res[0].doctorId,
          doctorName: res[0].doctorName,
          encounterId: res[0].encounterId ? res[0].encounterId : null,
          gender: res[0].patientData.gender,
          patientId: res[0].patientData.id,
          patientName: res[0].patientData.name,
          visitNo: res[0].visitNo,
          visitType: res[0].type,
        }
        this.showPatientSearch = false;
        // if (this.language && this.language.id && this.formType?.length) {
        //   this.getFormListList();
        // }
        resolve(true);
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

  onPatientChange(val) {
    if (val) {
      this.patientData = val;
    } else {
      this.patientData = null;
    }
    this.showPatientSearch = false;
    if (this.language && this.language.id && this.formType?.length) {
      this.getFormListList();
    }
  }

  searchPatientDropdown() {
    this.showPatientSearch = true;
  }

  onLanguageChange(val, from?, indx?) {
    if (val) {
      if (from === 'main') {
        this.language = val;
      } else {
        this.formListAllType[indx].languageId = val.id;
      }
    } else {
      if (from === 'main') {
        this.language = null;
      } else {
        this.formListAllType[indx].languageId = null;
      }
    }
    if (from === 'main' && this.language && this.language.id && this.formType?.length > 0) {
      this.getFormListList();
    }
  }

  onTypeChange(val) {
    if (val.length > 0) {
      this.formType = _.map(val,itr=>{
        return itr.id;
      })
    } else {
      this.formType = null;
    }
    if (this.language && this.language.id && this.formType?.length) {
      this.getFormListList();
    }
  }

  getLanguageList() {
    this.patientService.getLanguageList().subscribe(res => {
      if (res.length > 0) {
        this.languageListArray = _.orderBy(res, 'name', 'asc');
        const find = _.findIndex(this.languageListArray, d => {
          return d.name === 'ENGLISH';
        });
        if (find !== -1) {
          this.languageId = this.languageListArray[find].id;
          this.language = this.languageListArray[find];
        }
      }
    });
  }

  getTypeList() {
    if (this.typeListArray.length === 0) {
      this.patientService.getTypeList().subscribe(res => {
        if (res.length > 0) {
          this.typeListArray = res;
        }
      });
    }
  }

  getFormListList() {
    const promise = new Promise((resolve, reject) => {
      const param = {
        patientId: this.patientData.patientId,
        encounterId: this.patientData.encounterId,
        module: this.loadSource || 'NURSING FORM',
        languageId: this.language && this.language.id ? this.language.id : null,
        category: this.formType ? this.formType : []
      };
      this.patientService.getConsentFormList(param).subscribe(res => {
        if (res.length > 0) {
          const data = _.map(res, d => {
            d.languageId = null;
            d.printCount = 0;
            const find = _.find(d.reportLanguage, lg => {
              return lg.languageId === this.languageId;
            });
            if (find) {
              d.languageId = this.languageId;
            } else if (d.reportLanguage.length === 1) {
              d.languageId = d.reportLanguage[0].languageId;
              d.printCount = d.reportLanguage[0].printCount;
            } else {
              d.languageId = null;
            }
            d.isSelected = false;
            return d;
          });
          this.formListAllType = [...data];
          this.formListAllTypeClone = _.cloneDeep(this.formListAllType);

        } else {
          this.formListAllType = [];
          this.formListAllTypeClone = _.cloneDeep(this.formListAllType);
        }
      });
    });
    return promise;
  }

  printSelectedForms(val?, from?) {
    if (val && from) {
      this.getPrintForm(val, from);
    } else {
      this.getPrintForm();
    }
  }

  getPrintForm(val?, from?) {
    if(this.isFav && (this.favName === "" || this.favName === undefined)){
      this.notifyAlertMessage({
        msg: "Please enter favourite name",
        class: 'danger',
      });
      return
    }
    const param = {
      isFavorite: this.isFav,
      favoriteId: this.favId ? this.favId : 0,
      favoriteName:this.favName,
      languageId: this.languageId,
      module: this.loadSource || 'NURSING FORM',
      categoryList: [],
      formList : []
    };

    const categoryObj = {
      categoryId : null
    }

    _.map(this.formType,itr=>[
      categoryObj.categoryId = itr,
      param.categoryList.push(_.cloneDeep(categoryObj))
    ])

    const obj = {
      patientId: this.patientData.patientId,
      encounterId: this.patientData.encounterId,
      module: this.loadSource || 'NURSING FORM',
      languageId: this.language && this.language.id ? this.language.id : null,
      formId: []
    };
    if (val && from) {
      obj.formId = val.formId;
      obj.languageId = val.languageId;
      param.formList.push(obj);
    } else {
      _.map(this.formListAllType, list => {
        if (list.isSelected) {
          obj.languageId = list.languageId;
          obj.formId = list.formId;
          param.formList.push(_.cloneDeep(obj));
        }
      });
    }
    if (param.formList.length === 0) {
      this.setAlertMessage = {
        message: 'Please Select Value',
        messageType: 'danger',
        duration: Constants.ALERT_DURATION
      };
      return;
    }
    this.patientService.printConsentForm(param).subscribe(res => {
      if (res.reportUrl) {
        this.getPrintData(res.reportUrl.replace('#token#', this.authService.getAuthToken()));
        // var pdfFile = new Blob([res], {
        //   type: "application/pdf"
        // });
        // var pdfUrl = URL.createObjectURL(pdfFile);
        // // window.open(pdfUrl);
        // printJS({
        //   printable: pdfUrl,
        //   type: 'pdf',
        //   showModal: true,
        //   properties: this.properties
        // });
        // this.properties['showPatientSearch'] = true;
        // this.properties['patientData'] = null;
        // this.properties['patientId'] = null;
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

  getPrintData(url) {
    this.printData = { url: url, returnType: true };
    // const param = {
    //   header: '',
    //   body: '<table class=\"MsoNormalTable\" border=\"1\" cellspacing=\"0\" cellpadding=\"0\">&#10; <tbody><tr>&#10;  <td width=\"735\" colspan=\"3\" valign=\"top\">&#10;  <p class=\"TableParagraph\"><b><u><span>Hospital On-boarding Form for Online Registration System (ORS)</span></u></b><b><span></span></b></p>&#10;  </td>&#10; </tr>&#10; <tr>&#10;  <td width=\"43\" valign=\"top\">&#10;  <p class=\"TableParagraph\" align=\"center\">1</p>&#10;  </td>&#10;  <td width=\"253\" valign=\"top\">&#10;  <p class=\"TableParagraph\">Name of Hospital</p>&#10;  </td>&#10;  <td width=\"438\" valign=\"top\">&#10;  <p class=\"TableParagraph\"><span>&#160; &#160;</span></p>&#10;  </td>&#10; </tr>&#10; <tr>&#10;  <td width=\"43\" valign=\"top\">&#10;  <p class=\"TableParagraph\" align=\"center\">2</p>&#10;  </td>&#10;  <td width=\"253\" valign=\"top\">&#10;  <p class=\"TableParagraph\">Hospital Type</p>&#10;  </td>&#10;  <td width=\"438\" valign=\"top\">&#10;  <p class=\"TableParagraph\">[ ] PHC [ ] CHC [ ] District Hospital [&#10;  ]Medical College</p>&#10;  </td>&#10; </tr>&#10; <tr>&#10;  <td width=\"43\" valign=\"top\">&#10;  <p class=\"TableParagraph\" align=\"center\">3</p>&#10;  </td>&#10;  <td width=\"253\" valign=\"top\">&#10;  <p class=\"TableParagraph\">Government</p>&#10;  </td>&#10;  <td width=\"438\" valign=\"top\">&#10;  <p class=\"TableParagraph\">[&#160; ] Central&#160;&#10;  [&#160;&#160; ]&#160; State&#160;&#160;&#10;  [&#160;&#160; ] Autonomous Body [ ]&#10;  Society [ ]<span> </span>Cooperative</p>&#10;  </td>&#10; </tr>&#10; <tr>&#10;  <td width=\"43\" valign=\"top\">&#10;  <p class=\"TableParagraph\"><span>&#160;</span></p>&#10;  <p class=\"TableParagraph\" align=\"center\">4</p>&#10;  </td>&#10;  <td width=\"253\" valign=\"top\">&#10;  <p class=\"TableParagraph\"><span>&#160;</span></p>&#10;  <p class=\"TableParagraph\">Address of Hospital</p>&#10;  </td>&#10;  <td width=\"438\" valign=\"top\">&#10;  <p class=\"TableParagraph\"><span>&#160;</span></p>&#10;  </td>&#10; </tr>&#10; <tr>&#10;  <td width=\"43\" valign=\"top\">&#10;  <p class=\"TableParagraph\" align=\"center\">5</p>&#10;  </td>&#10;  <td width=\"253\" valign=\"top\">&#10;  <p class=\"TableParagraph\">District in which Hospital&#10;  Located</p>&#10;  </td>&#10;  <td width=\"438\" valign=\"top\">&#10;  <p class=\"TableParagraph\"><span>&#160;</span></p>&#10;  </td>&#10; </tr>&#10; <tr>&#10;  <td width=\"43\" valign=\"top\">&#10;  <p class=\"TableParagraph\" align=\"center\">6</p>&#10;  </td>&#10;  <td width=\"253\" valign=\"top\">&#10;  <p class=\"TableParagraph\">State in which Hospital&#10;  Located</p>&#10;  </td>&#10;  <td width=\"438\" valign=\"top\">&#10;  <p class=\"TableParagraph\"><span>&#160;</span></p>&#10;  </td>&#10; </tr>&#10; <tr>&#10;  <td width=\"43\" valign=\"top\">&#10;  <p class=\"TableParagraph\" align=\"center\">7</p>&#10;  </td>&#10;  <td width=\"253\" valign=\"top\">&#10;  <p class=\"TableParagraph\">Website of Hospital</p>&#10;  </td>&#10;  <td width=\"438\" valign=\"top\">&#10;  <p class=\"TableParagraph\">http://</p>&#10;  </td>&#10; </tr>&#10; <tr>&#10;  <td width=\"43\" valign=\"top\">&#10;  <p class=\"TableParagraph\" align=\"center\">8</p>&#10;  </td>&#10;  <td width=\"253\" valign=\"top\">&#10;  <p class=\"TableParagraph\">HMIS Solution deployed</p>&#10;  </td>&#10;  <td width=\"438\" valign=\"top\">&#10;  <p class=\"TableParagraph\">[ ] Yes [ ] No</p>&#10;  </td>&#10; </tr>&#10; <tr>&#10;  <td width=\"43\" valign=\"top\">&#10;  <p class=\"TableParagraph\">8.1</p>&#10;  </td>&#10;  <td width=\"253\" valign=\"top\">&#10;  <p class=\"TableParagraph\">If yes, Name of the Product</p>&#10;  </td>&#10;  <td width=\"438\" valign=\"top\">&#10;  <p class=\"TableParagraph\"><span>&#160;</span></p>&#10;  </td>&#10; </tr>&#10; <tr>&#10;  <td width=\"43\" valign=\"top\">&#10;  <p class=\"TableParagraph\">8.2</p>&#10;  </td>&#10;  <td width=\"253\" valign=\"top\">&#10;  <p class=\"TableParagraph\">Name&#10;  of the Organization, who</p>&#10;  <p class=\"TableParagraph\">developed&#10;  HMIS Solution</p>&#10;  </td>&#10;  <td width=\"438\" valign=\"top\">&#10;  <p class=\"TableParagraph\"><span>&#160;</span></p>&#10;  </td>&#10; </tr>&#10; <tr>&#10;  <td width=\"43\" valign=\"top\">&#10;  <p class=\"TableParagraph\" align=\"center\">9</p>&#10;  </td>&#10;  <td width=\"253\" valign=\"top\">&#10;  <p class=\"TableParagraph\">Average&#10;  Number of OPD Registrations</p>&#10;  <p class=\"TableParagraph\">per&#10;  day</p>&#10;  </td>&#10;  <td width=\"438\" valign=\"top\">&#10;  <p class=\"TableParagraph\"><span>&#160;</span></p>&#10;  </td>&#10; </tr>&#10; <tr>&#10;  <td width=\"43\" valign=\"top\">&#10;  <p class=\"TableParagraph\">10</p>&#10;  </td>&#10;  <td width=\"253\" valign=\"top\">&#10;  <p class=\"TableParagraph\">Number of Doctors in the&#10;  Hospital</p>&#10;  </td>&#10;  <td width=\"438\" valign=\"top\">&#10;  <p class=\"TableParagraph\"><span>&#160;</span></p>&#10;  </td>&#10; </tr>&#10; <tr>&#10;  <td width=\"43\" valign=\"top\">&#10;  <p class=\"TableParagraph\">11</p>&#10;  </td>&#10;  <td width=\"253\" valign=\"top\">&#10;  <p class=\"TableParagraph\">Nodal Officer Details</p>&#10;  </td>&#10;  <td width=\"438\" valign=\"top\">&#10;  <p class=\"TableParagraph\"><span>&#160;</span></p>&#10;  </td>&#10; </tr>&#10; <tr>&#10;  <td width=\"43\" valign=\"top\">&#10;  <p class=\"TableParagraph\">11.1</p>&#10;  </td>&#10;  <td width=\"253\" valign=\"top\">&#10;  <p class=\"TableParagraph\">Name</p>&#10;  </td>&#10;  <td width=\"438\" valign=\"top\">&#10;  <p class=\"TableParagraph\"><span>&#160;</span></p>&#10;  </td>&#10; </tr>&#10; <tr>&#10;  <td width=\"43\" valign=\"top\">&#10;  <p class=\"TableParagraph\">11.2</p>&#10;  </td>&#10;  <td width=\"253\" valign=\"top\">&#10;  <p class=\"TableParagraph\">Designation</p>&#10;  </td>&#10;  <td width=\"438\" valign=\"top\">&#10;  <p class=\"TableParagraph\"><span>&#160;</span></p>&#10;  </td>&#10; </tr>&#10; <tr>&#10;  <td width=\"43\" valign=\"top\">&#10;  <p class=\"TableParagraph\">11.3</p>&#10;  </td>&#10;  <td width=\"253\" valign=\"top\">&#10;  <p class=\"TableParagraph\">Mobile Number</p>&#10;  </td>&#10;  <td width=\"438\" valign=\"top\">&#10;  <p class=\"TableParagraph\"><span>&#160;</span></p>&#10;  </td>&#10; </tr>&#10; <tr>&#10;  <td width=\"43\" valign=\"top\">&#10;  <p class=\"TableParagraph\">11.4</p>&#10;  </td>&#10;  <td width=\"253\" valign=\"top\">&#10;  <p class=\"TableParagraph\">Land Line Number</p>&#10;  </td>&#10;  <td width=\"438\" valign=\"top\">&#10;  <p class=\"TableParagraph\"><span>&#160;</span></p>&#10;  </td>&#10; </tr>&#10; <tr>&#10;  <td width=\"43\" valign=\"top\">&#10;  <p class=\"TableParagraph\">11.5</p>&#10;  </td>&#10;  <td width=\"253\" valign=\"top\">&#10;  <p class=\"TableParagraph\">E-mail Address</p>&#10;  </td>&#10;  <td width=\"438\" valign=\"top\">&#10;  <p class=\"TableParagraph\"><span>&#160;</span></p>&#10;  </td>&#10; </tr>&#10;</tbody></table>&#10;&#10;<p class=\"MsoBodyText\"><span>&#160;</span></p>&#10;&#10;<p class=\"MsoBodyText\"><span>&#160;</span></p>&#10;&#10;<p class=\"MsoBodyText\">I&#10;hereby, agree to pay SMS charges (approximate 3-4 paisa per SMS) as per the&#10;NIC/NICSI rates for SMS being sent to beneficiaries/Patients as and when asked&#10;for by NIC/NICSI.</p>&#10;&#10;<p class=\"MsoBodyText\">&#160;</p>&#10;&#10;<p class=\"MsoBodyText\">&#160;</p>&#10;&#10;<p class=\"MsoBodyText\"><span>&#160;</span></p>&#10;&#10;<p class=\"MsoBodyText\">&#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; Signature of&#10;Hospital Head Name of Hospital Head</p>&#10;&#10;<p class=\"MsoBodyText\"><span>&#160;</span></p>&#10;&#10;<p class=\"MsoBodyText\">&#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160;Date</p>&#10;&#10;<p class=\"MsoBodyText\"><span>&#160;</span></p>&#10;&#10;<p class=\"MsoBodyText\">&#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160; &#160;(Seal of Hospital Head)<span>&#160;</span></p>',
    //   footer: ''
    // };
    // this.patientService.getPrintContent(param).subscribe(res => {
    //   if (res) {
    //     // console.log(res);
    //     var pdfFile = new Blob([res], {
    //       type: "application/pdf"
    //     });
    //     var pdfUrl = URL.createObjectURL(pdfFile);
    //     // window.open(pdfUrl);
    //     printJS({
    //       printable: pdfUrl,
    //       type: 'pdf',
    //       showModal: true,
    //       properties: this.properties
    //     });
    //     this.properties['showPatientSearch'] = true;
    //     this.properties['patientData'] = null;
    //     this.properties['patientId'] = null;
    //   }
    // });
  }

  getFavouriteData(){
    const param = {
      module: "NURSING FORM",
      userId: this.authService.getLoggedInUserId(),
    }
    this.patientService.GetPrintFormFavorites(param).subscribe(res => {
      this.favouriteListArray = res;
    })
  }

  onFavouriteCheckChange(){
    if(!this.isFav){
      this.favName = "";
    }
  }

  onFavouriteChange(evt){
    if(evt){
      this.favName = evt.fav_name;
      const selectCount = _.countBy(this.formListAllType,itr=>{
        return itr.isSelected === true;
      })
      if(selectCount.true > 0){
        const modalTitleobj = 'Confirmation';
        const modalBodyobj = 'Do you want to overwrite selected list.';
        const messageDetails = {
          modalTitle: modalTitleobj,
          modalBody: modalBodyobj
        };
        const modalInstance = this.confirmationModalService.open(ConfirmationPopupComponent,
          {
            ariaLabelledBy: 'modal-basic-title',
            backdrop: 'static',
            keyboard: false
          });
        modalInstance.result.then((result) => {
          if (result === 'Ok') {
            // for add category type
            this.formType = [];
            const form_category_ids = evt.form_category_ids;
            _.map(form_category_ids,itr=>{
              _.map(this.typeListArray,itr1=>{
                if(itr.form_category_id === itr1.id){
                  this.formType.push(itr1.id)
                }
              })
            })
            // for add checked form
            this.formListAllType = _.cloneDeep(this.formListAllTypeClone);
            _.map(evt.formList,itr1=>{
              _.map(this.formListAllType,itr2=>{
                if(itr1.formId === itr2.formId){
                  itr2.isSelected = true;
                }
              })
            })
          }
        }, (reason) => {

        });
        modalInstance.componentInstance.messageDetails = messageDetails;
      } else {
        // for add category type
        this.formType = [];
        const form_category_ids = evt.form_category_ids;
        _.map(form_category_ids,itr=>{
          _.map(this.typeListArray,itr1=>{
            if(itr.form_category_id === itr1.id){
              this.formType.push(itr1.id)
            }
          })
        })
        // for add checked form
        this.formListAllType = _.cloneDeep(this.formListAllTypeClone);
        _.map(evt.formList,itr1=>{
          _.map(this.formListAllType,itr2=>{
            if(itr1.formId === itr2.formId){
              itr2.isSelected = true;
            }
          })
        })
      }
    } else {
      this.formListAllType = _.cloneDeep(this.formListAllTypeClone);
    }
  }

}

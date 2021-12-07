import { environment } from 'src/environments/environment';
import { UsersService } from './../public/services/users.service';
import * as _ from 'lodash';
import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { AuthService } from './../public/services/auth.service';
import { CommonService } from './../public/services/common.service';
import { IAlert } from './../public/models/AlertMessage';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subject, forkJoin, of } from 'rxjs';
import { map, catchError, takeUntil } from 'rxjs/operators';
import { PermissionsConstants } from './../config/PermissionsConstants';
import { MappingService } from '../public/services/mapping.service';
import { Constants } from '../config/constants';
import { ChangeNursingStationPopupComponent } from '../emr-shared/components/change-nursing-station-popup/change-nursing-station-popup.component';
import { DefaultLandingSelectionComponent } from '../default-landing-selection/default-landing-selection.component';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
})
export class UserProfileComponent implements OnInit, OnDestroy {
  alertMsg: IAlert;
  // tslint:disable-next-line: variable-name
  _modalService: NgbModal;
  userId;
  userName;
  imageUrl: any = './assets/img/profile.svg';
  defaultImageUrl: any = './assets/img/profile.svg';
  userObjDetail: any;
  isFromProfileEdit: boolean;
  titleList = [];
  titleName = '';
  permissionConstList: any = [];
  $destroy = new Subject<any>();
  userInfo = null;
  providerDetails = null;
  isFrontDeskUser = false;
  @Input() isLogOutFlag = false;
  @Input() isAutoLogoutFlag = false;
  nursingStationName: any;
  stationArray: Array<any> = [];
  nursingStation: any;
  stationArrayFiltered: Array<any> = [];
  selectedNursingStation;

  constructor(
    private userService: UsersService,
    private authService: AuthService,
    private router: Router,
    private commonService: CommonService,
    private mappingService: MappingService,
    private modalService: NgbModal
  ) {
  }

  ngOnInit(): void {
    this.imageUrl = this.defaultImageUrl;
    this.permissionConstList = PermissionsConstants;

    this.userId = this.authService.getLoggedInUserId();
    const userInfo = this.authService.getUserInfoFromLocalStorage();
    this.GetUserStoreMappingByUserId();
    this.nursingStation = {
      nursingStationId: userInfo.nursingStationId,
      nursingStationName: userInfo.nursingStationName
    };
    this.selectedNursingStation = userInfo.nursingStationName;
    this.nursingStationName = userInfo?.nursingStationName;
    this.isFrontDeskUser = userInfo.role_type === 'FRONTDESK' ? true : false;
    this.userName = this.authService.getUserInfoFromLocalStorage().user_name;
    this.providerDetails = _.find(this.providerDetails, (o) => o.providerValueId === this.userInfo.user_id && o.providerType === this.userInfo.role_type);

    // this.getTitleList().subscribe(res => {
    this.userService.getUserDataById(this.userId, true).subscribe(result => {
      this.showProfileDetails(result.userdetail);
    });
    // });
    this.userService.getUserImageById(this.userId, true).subscribe(imageResult => {
      if (imageResult.status_code === 200 && imageResult.userImageDetail && imageResult.userImageDetail.userImagePath != null) {
        this.showProfileImage(imageResult.userImageDetail, this.userId);
      }
    });
    if (this.isLogOutFlag) { // after session out logout
      this.logout();
    } else if (this.isAutoLogoutFlag) {
      this.goToLogout();
    }

    const sub = this.commonService.$changeEvent.pipe(takeUntil(this.$destroy)).subscribe((obj: any) => {
      if (obj.isFrom !== 'sidebar') {
        this.ngOnInit();
        sub.unsubscribe();
      }
    });

  }

  ngOnDestroy() {
    this.$destroy.next(true);
    this.$destroy.unsubscribe();
  }

  getTitleList(): Observable<any> {
    return this.userService.getTitles().pipe(map((res: any) => {
      this.titleList = res.titles;
      return this.titleList;
    }),
      catchError(error => [])
    );
  }

  GetUserStoreMappingByUserId(): void {
    this.mappingService.getNusringStationMappingByUserId(this.userId).subscribe(res => {
      if (res) {
        this.stationArray = res;
      }
    });
  }

  changeStore(): void {
    if (this.nursingStation.nursingStationId === this.selectedNursingStation.nursingStationId) {
      this.alertMsg = {
        message: 'This Store Is Already Selected!',
        messageType: 'danger',
        duration: Constants.ALERT_DURATION
      };
      return;
    } else {
      this.nursingStation = _.cloneDeep(this.selectedNursingStation);
      this.authService.setNursingStationDetails(this.nursingStation);
      this.alertMsg = {
        message: 'Nursing Station Changed Successfully!',
        messageType: 'success',
        duration: Constants.ALERT_DURATION
      };
      window.location.reload();
    }
  }

  showProfileDetails(userDetails) {
    if (userDetails != null && !_.isUndefined(userDetails)) {
      let key = this.authService.getActiveAppKey();
      if (key.toLowerCase() === 'emr') {
        key = 'DOCTOR DESK';
      } else if (key.toLowerCase() === 'emr-settings') {
        key = 'EMR SETTINGS';
      } else if (key.toLowerCase() === 'nursing') {
        key = 'NURSING';
      } else if (key.toLowerCase() === 'discharge') {
        key = 'DISCHARGE';
      }
      // this.getTitleList().subscribe(res => {
      this.userObjDetail = {
        id: userDetails.id,
        title: userDetails.title_id,
        first_name: userDetails.first_name,
        middle_name: userDetails.middle_name ? userDetails.middle_name : '',
        last_name: userDetails.last_name,
        email_address: userDetails.email,
        login_id: userDetails.user_id,
        mobile_no: userDetails.mobile_number,
        alternate_mobile_no: userDetails.alternate_number,
        role_type: { id: userDetails.role_type.role_type_id, role_type: userDetails.role_type.role_name },
        primary_role: { id: userDetails.primary_role.primary_role_id, name: userDetails.primary_role.primary_role_name },
        speciality: userDetails.specialty ?
          { id: userDetails.specialty.speciality_id.toString(), name: userDetails.specialty.specialty_name } : '',
        department: { id: userDetails.department.department_id, name: userDetails.department.department_name },
        is_active: userDetails.is_active,
        user_gender: userDetails.user_gender === 'FEMALE' ? 'female' : userDetails.user_gender === 'MALE' ? 'male' : 'transgender',
        services_user: userDetails.services_user ? userDetails.services_user.split(',') : [],
        education: userDetails.education,
        experience: userDetails.experience,
        aboutUser: userDetails.about_user,
        landingPage: _.find(userDetails.application_detail, d => {
          return d && d.application && d.application.name === key;
        }),
        userData: userDetails
      };
      this.userName = this.userObjDetail.first_name + ' ' + this.userObjDetail.middle_name + ' ' + this.userObjDetail.last_name;
      // const titleObject = _.find(this.titleList, (rec) => rec.title_id == userDetails.title_id);
      this.titleName = userDetails.title_name;
      // this.getPrimaryRoles('').subscribe();
      // this.tempEditedObject = {
      //   tempEmail: userDetails.email ? userDetails.email : '',
      //   tempMobileNumber: userDetails.mobile_number ? userDetails.mobile_number : '',
      //   tempUserId: userDetails.user_id
      // };
      const tempsecRoleConfirmedRoles = [];
      _.forEach(userDetails.additional_roles, (o, k) => {
        const obj = {
          id: o
        };
        tempsecRoleConfirmedRoles.push(obj);
      });
      const tempassignedDoctors = [];
      _.forEach(userDetails.assigned_doctors, (o, k) => {
        const obj = {
          code: o.toString()
        };
        tempassignedDoctors.push(obj);
      });
      // this.secondaryRoleConfirmed = tempsecRoleConfirmedRoles;
      // this.docAssignmentConfirmed = tempassignedDoctors;
      // get application details
      // _.forEach(this.userRegistrationFrm.value.application_assigmentlist, (o, k) => {
      //   const obj = _.find(userDetails.applications, (rec) => rec === o.id);
      //   if (!_.isUndefined(obj)) {
      //     o.checked = true;
      //     (this.userRegistrationFrm.get('application_assigmentlist') as FormArray).at(k).patchValue(o);
      //   }
      // });
      // });
    }
  }

  updateLandingPage() {
    let key = this.authService.getActiveAppKey();
    if (key.toLowerCase() === 'emr') {
      key = 'DOCTOR DESK';
    } else if (key.toLowerCase() === 'emr-settings') {
      key = 'EMR SETTINGS';
    } else if (key.toLowerCase() === 'nursing') {
      key = 'NURSING';
    } else if (key.toLowerCase() === 'discharge') {
      key = 'DISCHARGE';
    }
    const appData = _.find(this.userObjDetail.userData.application_detail, d => {
      return d.application.name === key;
    });
    const modalInstance = this.modalService.open(DefaultLandingSelectionComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false,
        windowClass: 'custom-modal',
        size: 'sm'
      });
    modalInstance.result.then((result) => {
      if (result.type === 'save') {
        this.alertMsg = {
          message: result.data.message,
          messageType: 'success',
          duration: 3000
        };
      }
    });
    modalInstance.componentInstance.appId = appData && appData.application && appData.application.id ? appData.application.id : null;
    modalInstance.componentInstance.userId = this.userObjDetail.id;
    modalInstance.componentInstance.selectedPermission = this.userObjDetail.landingPage && this.userObjDetail.landingPage.primary_permission ? this.userObjDetail.landingPage.primary_permission : null;
  }

  showProfileImage(ImageData, userId) {
    if (ImageData != null && ImageData.userImagePath !== '#') {
      this.imageUrl = null;
      this.imageUrl = ImageData.userImagePath + '?time=' + new Date().getTime();
    }
  }

  profileEdit() {
    this.isFromProfileEdit = true;
    const currUrl = this.router.url; // currentUrlTree.toString();
    const editUserProfileUrl = '/app/user/userRegistration/' + this.userId;
    if (currUrl !== editUserProfileUrl) {
      this.userService.fromProfileUserEditFlag(this.isFromProfileEdit, this.userId);
      this.router.navigate(['/app/user/userRegistration', this.userId]);
      this.closeUserprofile();
      this.commonService.setpreviousUrl(this.router.url);
    }
  }

  closeUserprofile(): void {
    this.commonService.toggle('Profile');
  }

  logout(): void {
    this.goToLogout();
  }

  goToLogout(): void {
    this.commonService.toggle('Profile');
    this.authService.logout().subscribe(res => {
      if (res.status_message === 'Success') {
        this.userService.masterUserDetails = {};
        this.authService.redirectUrl = null;
        this.commonService.clearUserSessionData();
      }
    }, error1 => {
      this.alertMsg = {
        message: 'Something went wrong',
        messageType: 'danger',
        duration: 3000
      };
    });
  }

  changePasswordModal(): void {
    // const modalInstance = this.changePasswordModalService.open(ChangePasswordComponent,
    //   {
    //     ariaLabelledBy: 'modal-basic-title',
    //     backdrop: 'static',
    //     keyboard: false,
    //     windowClass: 'custom-modal',
    //     size: 'sm'
    //   });

    // modalInstance.componentInstance.isFromProfile = true;
  }

  // -- Open pending actions popup
  // openPendingActionPopup(appointmentList): void {
  //   const modalInstance = this._modalService.open(CallingConfirmLibComponent,
  //     {
  //       ariaLabelledBy: 'modal-basic-title',
  //       backdrop: 'static',
  //       keyboard: false,
  //       size: 'lg',
  //       windowClass: 'calling-confirm',
  //       container: '#homeComponent'
  //     });
  //   modalInstance.result.then((res1: any) => {
  //     this.goToLogout();
  //   }, () => { });
  //   (modalInstance.componentInstance as CallingConfirmLibComponent).appointmentSlots = appointmentList;
  //   (modalInstance.componentInstance as CallingConfirmLibComponent).callingLimit = this.pendingActionCallingLimit;
  //   (modalInstance.componentInstance as CallingConfirmLibComponent).source = 'logout';
  //   (modalInstance.componentInstance as CallingConfirmLibComponent).timeFormateKey = this.timeFormateKey;
  //   (modalInstance.componentInstance as CallingConfirmLibComponent).loginUserDetails = this.authService.getUserInfoFromLocalStorage();
  //   (modalInstance.componentInstance as CallingConfirmLibComponent).environmentDetails = environment;
  //   (modalInstance.componentInstance as CallingConfirmLibComponent).permissionsOnActions = this.qmsQlistLibService.getpermissionList(this.commonService.getuserpermissionForlib());
  //   (modalInstance.componentInstance as CallingConfirmLibComponent).updateStatusEvent.subscribe(res => {
  //     this.updateAppointentStatus(res.item, res.status, res.roomId, res.isSkip);
  //   });
  // }

  // getQueueAppointmentSlots(provider): Observable<any> {
  //   let entityId;
  //   let id;
  //   let entityValueId;
  //   let providerType = '';
  //   const includeEmptySlots = false;
  //   const currentProviderDetails = provider;
  //   // if (localStorage.getItem('selectedProviders') !== 'undefined') {
  //   //   currentProviderDetails = JSON.parse(localStorage.getItem('selectedProviders'));
  //   // }
  //   // const currentProviderDetails = JSON.parse(localStorage.getItem('selectedProviders'));
  //   // const currentProviderDetails = this.qmsQlistLibService.getCurrentSelectedProvider();

  //   if (currentProviderDetails) {
  //     providerType = currentProviderDetails.providerType;
  //     id = currentProviderDetails.providerValueId ? currentProviderDetails.providerValueId : this.userId;
  //     entityValueId = +currentProviderDetails.providerValueId;
  //     entityId = +currentProviderDetails.providerId;
  //   }
  //   if (entityValueId && entityId) {
  //     return this.queueService.getEntityAppointmentBookingBySequence(id, entityId, entityValueId, new Date(), providerType, includeEmptySlots).pipe(
  //       takeUntil(this.$destroy)).pipe(map((res: Array<any>) => {
  //         this.qSlotList = [];
  //         if (res.length) {
  //           this.qSlotList = this.qmsQlistLibService.convertAppointmentDataToFlatList(res[0].slotsDetails, this.timeFormateKey);
  //         } else {
  //           this.qSlotList = [];
  //         }
  //         return this.qSlotList;
  //       })
  //       );
  //   } else {
  //     return of(this.qSlotList = []);
  //   }
  // }

  // getQueueAppointmentSlotsCopy(provider): Observable<any> {
  //   let entityId;
  //   let id;
  //   let entityValueId;
  //   let providerType = '';
  //   const includeEmptySlots = false;
  //   let currentProviderDetails;
  //   if (localStorage.getItem('selectedProviders') !== 'undefined') {
  //     currentProviderDetails = JSON.parse(localStorage.getItem('selectedProviders'));
  //   }
  //   // const currentProviderDetails = JSON.parse(localStorage.getItem('selectedProviders'));
  //   // const currentProviderDetails = this.qmsQlistLibService.getCurrentSelectedProvider();
  //   // let id;

  //   if (currentProviderDetails) {
  //     providerType = currentProviderDetails.providerType;
  //     id = currentProviderDetails.providerValueId ? currentProviderDetails.providerValueId : this.userId;
  //     entityValueId = +currentProviderDetails.providerValueId;
  //     entityId = +currentProviderDetails.providerId;
  //   }
  //   if (entityValueId && entityId) {
  //     return this.queueService.getEntityAppointmentBookingBySequence(id, entityId, entityValueId, new Date(), providerType, includeEmptySlots).pipe(
  //       takeUntil(this.$destroy)).pipe(map((res: Array<QAppointmentDetails>) => {
  //         if (res.length) {
  //           this.qSlotList = [];
  //           this.qSlotList = this.qmsQlistLibService.convertAppointmentDataToFlatList(res[0].slotsDetails, this.timeFormateKey);
  //         } else {
  //           this.qSlotList = [];
  //         }
  //         return this.qSlotList;
  //       })
  //       );
  //   } else {
  //     return of(this.qSlotList = []);
  //   }
  // }

  // getCheckInCheckOutStatusByUserId(): Observable<any> {
  //   // let id;
  //   // if (localStorage.getItem('selectedProviders') !== 'undefined') {
  //   //   const currentProviderDetails = JSON.parse(localStorage.getItem('selectedProviders'));
  //   //   if (currentProviderDetails) {
  //   //     id = currentProviderDetails.providerValueId ? currentProviderDetails.providerValueId : this.userId;
  //   //   }
  //   // }
  //   const reqParams = {
  //     // user_id: id ? id : this.userId
  //     user_id: this.userId
  //   };
  //   return this.queueService.getCheckInCheckOutStatusByUserId(reqParams).pipe(map((res: any) => {
  //     const req = (res.OPDStatus as Array<any>);
  //     if (req && req.length) {
  //       const isTrue = req.some(r => r.opd_details.some((e: any) => {
  //         return (e.opd_checkin_status && (!e.opd_checkout_status) && e.opd_is_resume) || (e.opd_checkin_status && (!e.opd_checkout_status) && e.opd_is_pause);
  //       }));
  //       return isTrue;
  //     } else {
  //       return false;
  //     }
  //   }));
  // }

  // updateAppointentStatus(item: QSlotInfoDummy, status, roomId?, isSkip?: boolean): void {
  //   let nextPatientQueueId = 0;
  //   if (status === 2) { // -- send next queue id when calling patient
  //     const slotIndx = this.qSlotList.findIndex(l => l.appointmentId === item.appointmentId);
  //     const data = this.nextValidAppointment(slotIndx + 1); // -- it gives next validate appointment
  //     if (data) {
  //       nextPatientQueueId = data.item.queueId;
  //     }
  //     item.skippedCount = item.skippedCount === undefined ? 0 : item.skippedCount;
  //     if (item.skippedCount <= this.repeatCallingCount) { // -- data interchange
  //       item.skippedCount = +item.skippedCount + 1;
  //       isSkip = false;
  //     } else {
  //       item.skippedCount = 0;
  //       isSkip = true;
  //     }
  //   }

  //   const reqParams = {
  //     queue_main_id: item.queueId,
  //     status_id: +status, // -- CALLING,
  //     cater_room_id: (+status === 2) ? roomId : 0,
  //     mark_as_skip: (status === 7) ? isSkip : false,
  //     next_patient_queueid: (+status === 2) ? nextPatientQueueId : 0,
  //   };

  //   this.queueService.updateAppointmentQueue(reqParams).subscribe((res: any) => {
  //     if (res.status_message === 'Success') {
  //       // item.queueStatusId = +status;
  //       // if (status === 2) {
  //       //   item.skippedCount = isSkip ? 0 : item.skippedCount;
  //       //   // item.queueStatus = isSkip ? this.qStatusList[this.qStatusList.findIndex(r => r.id === 7)].name : item.queueStatus;
  //       //   // this.qStatusList[this.qStatusList.findIndex(r => r.id === +status)].name : item.queueStatus : this.qStatusList[this.qStatusList.findIndex(r => r.id === +status)].name;
  //       // } else {
  //       //   item.queueStatus = (status === 7) ? isSkip ?
  //       //   this.qStatusList[this.qStatusList.findIndex(r => r.id === +status)].name : item.queueStatus : this.qStatusList[this.qStatusList.findIndex(r => r.id === +status)].name;
  //       // }
  //       // this.alertMsg = {
  //       //   message: 'Status updated succesfully',
  //       //   messageType: 'success',
  //       //   duration: Constant.ALERT_DURATION_MID
  //       // };
  //     } else {
  //       // this.openSchedulePopup();
  //     }
  //   });
  // }

  // nextValidAppointment(indx): { i: number, item: QSlotInfoDummy } {
  //   let temp = {
  //     i: 0,
  //     item: null
  //   };
  //   if (this.qSlotList[indx].queueStatus === 'NEXT') {
  //     temp = {
  //       i: indx,
  //       item: this.qSlotList[indx]
  //     };
  //     return temp;
  //   } else {
  //     for (let j = indx; j <= this.qSlotList.length; j++) {
  //       if (this.qSlotList[j] && this.qSlotList[j].queueStatus === 'NEXT') {
  //         temp = {
  //           i: j,
  //           item: this.qSlotList[j]
  //         };
  //         return temp;
  //       }
  //     }
  //   }
  // }

  // checkProvidersAppointments(providerDt, initialLoad): void {
  //   const filterData = this.providerDetails.filter(p => !p.isLoad);
  //   if (filterData.length) {
  //     const provider = providerDt ? { ...providerDt } : filterData[0];
  //     initialLoad = false;
  //     providerDt = null;
  //     this.getQueueAppointmentSlots(provider).subscribe(res1 => {
  //       provider.isLoad = true;
  //       const appList = this.displayDataByStatusPipe.transform(this.qSlotList, true, ['INCONSULTATION', 'CALLING', 'SKIP'], true);
  //       if (appList.length) {
  //         localStorage.setItem('selectedProviders', JSON.stringify(provider));
  //         this.openPendingActionPopup(appList);
  //       } else {
  //         this.checkProvidersAppointments(null, false);
  //       }
  //     });
  //   } else {
  //     this.goToLogout();
  //   }
  // }


  openPopup(): void {
    this.commonService.isOpen = false;
    const modifyStoresArray = [];
    _.forEach(this.stationArray, (o) => {
      if (o.nursingStationId !== this.nursingStation.nursingStationId) {
        modifyStoresArray.push(o);
      }
      this.stationArrayFiltered = modifyStoresArray;
    });
    const modelInstance = this.modalService.open(ChangeNursingStationPopupComponent, {
      backdrop: 'static',
      keyboard: false,
      windowClass: 'custom-modal modal-md',
      size: 'lg modal-dialog-centered',
    });
    modelInstance.result.then(result => {
    }, reason => {
    });
    modelInstance.componentInstance.stationArrayFiltered = this.stationArrayFiltered;
  }

}

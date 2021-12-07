import { Subject } from 'rxjs';
import { Component, OnInit, OnDestroy, Output, OnChanges } from '@angular/core';
import * as moment from 'moment';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from '../../../../services/common.service';
import { takeUntil } from 'rxjs/operators';
import { Constants } from 'src/app/config/constants';
import * as _ from 'lodash';
import { SlideInOutAnimation, SlideInOutLogAnimation } from 'src/app/config/animations';
import { AuthService } from 'src/app/services/auth.service';
import { GetAppointmentListByEntity } from 'src/app/models/all-api-service-request.model';
import { AppointmentListModel } from 'src/app/modules/appointment/models/appointment.model';
import { AppointmentService } from 'src/app/modules/appointment/services/appointment.service';

@Component({
  selector: 'app-appointment',
  templateUrl: './appointment.component.html',
  styleUrls: ['./appointment.component.scss'],
  animations: [SlideInOutAnimation]
})
export class AppointmentComponent implements OnInit, OnDestroy {
  availableAppointmentSlotsList: Array<AppointmentListModel> = [];
  searchRequestParams = null;
  patientInfo: any;
  serviceProviderDetailsData: any;
  searchDataByPatientHistory: any;
  // loadedComponentInstance: any;
  // appointmentTab = true;
  // @ViewChild('searchContainer', { read: ViewContainerRef, static: false }) searchContainer: ViewContainerRef;

  isShowAvailableComp = false;
  isShowAppointmentViewComp = false;
  appointmentParams: any;
  followUpDetails: any = null;
  isShowInstruction = false;
  timeFormateKey = '';
  $destroy = new Subject<boolean>();
  clearSectionOnBookAppointment: boolean;
  animationState = 'out';
  loganimationState = 'out';
  providerInforequestParams: {};
  selectedAppointmentDetailsId: any = null;
  isShowLog = false;
  advanceBookingDays = 0;

  constructor(
    private appointmentService: AppointmentService,
    private route: ActivatedRoute,
    private commonService: CommonService,
    private authService: AuthService,
  ) { }

  ngOnInit() {
    this.getTimeFormatKey();
    this.commonService.routeChanged(this.route);
    this.commonService.$subInstructionSliderOpenClose.pipe(takeUntil(this.$destroy)).subscribe((obj: any) => {
      if (obj === 'open') {
        this.isShowInstruction = true;
        this.animationState = this.isShowInstruction ? 'in' : 'out';
      } else {
        this.isShowInstruction = false;
        this.animationState = 'out';
      }
    });
    this.commonService.$logSliderOpenClose.pipe(takeUntil(this.$destroy)).subscribe((obj: any) => {
      if (obj === 'open') {
        this.isShowLog = true;
        this.loganimationState = this.isShowLog ? 'in' : 'out';
      } else {
        this.selectedAppointmentDetailsId = null;
        this.isShowLog = false;
        this.loganimationState = 'out';
      }
    });
    this.clearSectionOnBookAppointment = false;
  }

  ngOnDestroy() {
    this.$destroy.next(true);
    this.$destroy.unsubscribe();
  }

  getTimeFormatKey() {
    this.timeFormateKey = this.authService.getUserInfoFromLocalStorage().timeFormat;
  }

  convertTime(timeVal) {
    let updateTimeVal = null;
    if (this.timeFormateKey === '12_hour' && timeVal) {
      updateTimeVal = moment(moment().format('YYYY-MM-DD') + ' ' + timeVal).format('hh:mm A');
    } else if (this.timeFormateKey === '24_hour' && timeVal) {
      updateTimeVal = moment(moment().format('YYYY-MM-DD') + ' ' + timeVal).format('HH:mm');
    }
    return updateTimeVal;
  }

  // -- Called from search appointment component for data
  getAppointmentList($event): void {
    // Added for when clear below section should also clear
    let eventValId = 0;
    const specialityId = $event.selectedSpeciality ? $event.selectedSpeciality.id : 0;
    if (!_.isEmpty($event.selectedEntity)) {
      eventValId = $event.selectedEntity.id === 2 ? $event.selectedDoctor ?
        $event.selectedDoctor.id : 0 : $event.selectedEntity.id === 3 ?
          $event.selectedJointClinic ? $event.selectedJointClinic.id : 0 : $event.selectedServiceProvider ?
            $event.selectedServiceProvider.id : 0;
    }

    if (_.isEmpty($event.selectedEntity) && !eventValId) {
      this.isShowAvailableComp = false;
      this.isShowAppointmentViewComp = false;
      return;
    } else if (!_.isEmpty($event.selectedEntity) && $event.selectedEntity.id === 2 && !specialityId) {
      this.isShowAvailableComp = false;
      this.isShowAppointmentViewComp = false;
      return;
    } else if (!_.isEmpty($event.selectedEntity) && !specialityId && !eventValId) {
      this.isShowAvailableComp = false;
      this.isShowAppointmentViewComp = false;
      return;
    }
    // Added for when clear below section should also clear
    const reqParams = {
      entity_id: $event.selectedEntity ? $event.selectedEntity.id : 0,
      entity_value_id: eventValId,
      speciality_id: $event.selectedSpeciality ? +$event.selectedSpeciality.id : 0, // Optional
      service_id: $event.selectedService ? $event.selectedService.id : 0, // optional
      appointment_type_id: $event.appointmentType ? $event.appointmentType.id : 0,
      date: moment($event.startDate).format('MM/DD/YYYY'), // MM/dd/yyyy format required
      start_time: $event.startHour
    };

    this.searchRequestParams = { ...reqParams, ...$event };
    this.getAppointmentListAPI(reqParams); // Fetch appointment list data

    // call to API to display rules, instructions and service provider info if service provider is selected.
    this.providerInforequestParams = { ...reqParams };
  }
  setServiceProviderDetailsData(event) {
    this.serviceProviderDetailsData = event.data;
  }

  // loadComponentCopy(initialLoad?: boolean) {
  //   if (!initialLoad) { // -- if initload false then load appointment list and load that component
  //     this.getAppointmentListAPI(this.searchRequestParams);
  //     return;
  //   }

  //   this.appointmentTab = true;
  //   const viewContainerRef = this.searchContainer;
  //   viewContainerRef.clear();
  //   const componentFactory = this.componentFactoryResolver.resolveComponentFactory(AvailableAppointmentDisplayComponent);
  //   const componentRef = this.loadedComponentInstance = viewContainerRef.createComponent(componentFactory);
  //   componentRef.instance.displayList = this.availableAppointmentSlotsList;
  //   componentRef.instance.selectedPatient = this.patientInfo;
  //   componentRef.instance.selectedView.subscribe(res => {
  //     this.appointmentTab = false;
  //     viewContainerRef.clear();
  //     const cf = this.componentFactoryResolver.resolveComponentFactory(AppointmentViewComponent);
  //     const cr = this.loadedComponentInstance = viewContainerRef.createComponent(cf);
  //     cr.instance.appointmentParams = res;
  //     cr.instance.searchRequestParams = this.searchRequestParams;
  //     setTimeout(() => {
  //       this.appointmentService.setPatientInfo(this.patientInfo);
  //     });
  //   });
  // }

  loadComponent() {
    this.getAppointmentListAPI(this.searchRequestParams);
  }

  getPatientInfo($event) {
    this.patientInfo = $event;
  }

  getAppointmentListAPI({ ...reqParams }) {
    this.appointmentService.getAppointmentListByEntity(reqParams as GetAppointmentListByEntity).subscribe((res: any) => {
      _.map(res.appointment_List, (pv) => {
        _.map(pv.entity_data, (cv) => {
          cv.start_time = _.clone(this.convertTime(cv.start_time));
          cv.end_time = _.clone(this.convertTime(cv.end_time));
          _.map(cv.slot_data, (sv) => {
            sv.slotTime = _.clone(this.convertTime(sv.slotTime));
          });
        });
      });
      this.availableAppointmentSlotsList = res.appointment_List;
      this.advanceBookingDays = res.advanceBookingDays;
      // this.loadComponent(true);
      this.isShowAvailableComp = true;
      this.isShowAppointmentViewComp = false;
    });
  }

  // -- recieve event when clicl on slot or calender view
  getSelectedViewEvent($event) {
    if ($event.from === 'book') {
      this.loadComponent();
      return;
    }
    this.appointmentParams = $event;
    this.isShowAppointmentViewComp = true;
    this.isShowAvailableComp = false;
  }

  recieveFollowUpDetails(event): void {
    this.followUpDetails = event;
  }

  receiveAppointmentSearchEntity(event): void {
    this.searchDataByPatientHistory = event;
  }

  isOpenInstructionBar() {
    // this.commonService.toggle('instruction', 'sidebar');
  }

  clearAllSectionOnBookAppointment(val: boolean) {
    this.appointmentService.clearAllFormsValue(val);
  }

  closeInstruction() {
    this.commonService.openCloseInstruction('close');
  }
  closeLogSlider() {
    this.commonService.openCloselogSlider('close');
  }
  getselectedAppointment(event): void {
    this.selectedAppointmentDetailsId = event;
  }

}

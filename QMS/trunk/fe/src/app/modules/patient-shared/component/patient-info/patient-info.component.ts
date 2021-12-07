import { Router, ActivatedRoute, Event, NavigationEnd } from '@angular/router';
import { CommonService } from './../../../../services/common.service';
import { Component, OnInit, OnDestroy, Output, EventEmitter, Input } from '@angular/core';
import { Observable, Subject, of } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import * as _ from 'lodash';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxPermissionsService } from 'ngx-permissions';
import { PermissionsConstants } from 'src/app/shared/constants/PermissionsConstants';
import { AppointmentService } from 'src/app/modules/appointment/services/appointment.service';
import { AddPatientComponent } from 'src/app/modules/patient-shared/component/add-patient/add-patient.component';

@Component({
  selector: 'app-patient-info',
  templateUrl: './patient-info.component.html',
  styleUrls: ['./patient-info.component.scss'],
})
export class PatientInfoComponent implements OnInit, OnDestroy {
  compInstance = this;
  patienInfo: any = {};
  tempList = [];
  currentConstants;
  showAddPatientPopup = false;
  permissions: any  = {};
  $destroy: Subject<boolean> = new Subject();
  // tslint:disable-next-line: variable-name
  _modalService: NgbModal;
  searchString = '';
  @Output() patientInfo = new EventEmitter<any>();

  constructor(
    private appointmentService: AppointmentService,
    private addPatientModalService: NgbModal,
    private commonService: CommonService,
    public router: Router,
    private ngxPermissionsService: NgxPermissionsService
    ) {
    this._modalService = addPatientModalService;
  }

  ngOnInit() {
    this.subscribeEvents();
    this.showActivePopup(); // Global Add button
    this.permissions = this.ngxPermissionsService.getPermission(PermissionsConstants.Add_PatientMaster);

  }

  ngOnDestroy() {
    this.$destroy.next();
    this.$destroy.unsubscribe();
    this._modalService.dismissAll();
  }

  getPatientList(searchText): Observable<any> {
    this.compInstance.searchString = searchText;
    if (searchText && searchText.length > 2) {
      return this.compInstance.appointmentService.getPatientList(30, searchText).pipe(map(pd => {
        // if (pd.Patient_Data == null && pd.message === 'No records found' && this.compInstance.permissions && this.compInstance.permissions.name) {
        //   return [{ isAddNew: true }];
        // }
        // pd.Patient_Data = pd.Patient_Data == null ? [] : pd.Patient_Data;
        // pd.Patient_Data.unshift({searchString: searchText, isAddNew: true});
        return pd.Patient_Data;
      }));
    } else {
      return of([]);
    }
  }

  onSelectPatient($event): void {
    // if ($event && $event.isAddNew) {
    //   this.addPatientModal($event);
    //   this.patienInfo = {};
    // } else
    if ($event === 'AddPatient') {
      this.addPatientModal(this.searchString);
    } else {
      this.searchString = '';
      this.appointmentService.setPatientInfo($event); // -- send event
    }
  }

  addPatientModal(event?): void {
    const modalInstance = this.addPatientModalService.open(AddPatientComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false,
        windowClass: 'custom-modal',
        size: 'xl',
        container: '#homeComponent'
      });
    modalInstance.componentInstance.isModal = true;
    modalInstance.componentInstance.newPatientDetails = event ? event : '';
    modalInstance.componentInstance.addPatModalValues.subscribe((receivedValue) => {
      if (receivedValue.checkDefualtSelect) {
        this.getPatientList(receivedValue.pat_uhid).subscribe(res => {
          this.onSelectPatient(res[0]);
          // this.patienInfo = res[0];
        });
      } else {
        this.onSelectPatient(null);
      }
    });
  }

  subscribeEvents(): void {
    this.appointmentService.$patientInfo.pipe(takeUntil(this.$destroy)).subscribe(res => {
      this.patienInfo = res;
      this.patientInfo.emit(res);
    });
    this.appointmentService.$subClearFormOnBookAppointment.pipe(takeUntil(this.$destroy)).subscribe((res) => {
      if (res) {
        this.patienInfo = {};
        this.appointmentService.setPatientInfo(null);
      }
    });
  }
  showActivePopup() {
    this.commonService.$addPopupEvent.pipe(takeUntil(this.$destroy)).subscribe(popup => {
      if (popup && popup.redirectFromPage === '/appointmentApp/appointments/searchAppointment') {
        this.showAddPatientPopup = popup.isShowAddPopup;
        this.addPatientModal();
      } else {
        this.showAddPatientPopup = false;
      }
    });
  }

}

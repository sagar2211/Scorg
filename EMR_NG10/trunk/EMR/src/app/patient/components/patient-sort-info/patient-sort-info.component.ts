import { EncounterPatient } from 'src/app/public/models/encounter-patient.model';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonService } from './../../../public/services/common.service';
import { Subject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import * as _ from 'lodash';
import * as moment from 'moment';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from 'src/app/public/services/auth.service';

@Component({
  selector: 'app-patient-sort-info',
  templateUrl: './patient-sort-info.component.html',
  styleUrls: ['./patient-sort-info.component.scss']
})
export class PatientSortInfoComponent implements OnInit, OnDestroy {
  toggleExpandPatInfo = false;
  $destroy = new Subject<any>();
  patientId: any;
  patientObj: any;
  graphDateAndTime: any;
  currentUrl: any;
  showHideIconLabel: boolean;
  appointmentDate: string;
  loadAs = 'emr';

  constructor(
    private commonService: CommonService,
    private route: ActivatedRoute,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.loadAs = this.authService.getActiveAppKey() === 'EMR' ? 'emr' : 'nursing';
    this.showHideIconLabel = false;
    this.currentUrl = this.route.url;
    this.getpatientData();
    this.subcriptionEvents();
  }

  ngOnDestroy() {
    this.$destroy.next(true);
    this.$destroy.unsubscribe();
  }

  getpatientData(patient?) {
    if (patient) {
      this.patientObj = patient;
    } else {
      this.patientObj = this.commonService.getLastActivePatient();
    }
    this.patientId = this.patientObj.patientData.id;
    this.graphDateAndTime = this.commonService.getPatientMonitoringDateTime(this.patientId);
    
    const fromDate = moment(this.patientObj.admissionDate).format("YYYY-MM-DD")
    var given = moment(fromDate, "YYYY-MM-DD");
    var current = moment().startOf('day');
    this.patientObj.admitDays = moment.duration(current.diff(given)).asDays();
    if (this.patientObj.type === 'op') {
      const date = moment(this.patientObj.admissionDate);
      if (date.isValid()) {
        this.appointmentDate = moment(this.patientObj.admissionDate).format('DD/MM/YYYY H:mm A');
      }
    }
  }

  getDifferenceInDays(date1, date2) {
    const diffInMs = Math.abs(date2 - date1);
    return diffInMs / (1000 * 60 * 60 * 24);
  }

  showHidePatientMenu() {
    this.showHideIconLabel = !this.showHideIconLabel;
    this.commonService.showHidePatientMenu();
  }

  subcriptionEvents() {
    this.commonService.$subAddRemoveActivePatientFromList.pipe(takeUntil(this.$destroy)).subscribe((obj: any) => {
      this.getpatientData(obj.data);
    });
    this.commonService.$showHidePatientMenuToSortInfo.pipe(takeUntil(this.$destroy)).subscribe((obj: any) => {
      this.showHideIconLabel = !this.showHideIconLabel;
    });
  }
}

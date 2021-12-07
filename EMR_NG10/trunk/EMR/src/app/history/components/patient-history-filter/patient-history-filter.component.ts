import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { MappingService } from '../../../public/services/mapping.service';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import * as _ from 'lodash';
import * as moment from 'moment';
import { IAlert } from '@qms/qlist-lib/lib/models/common.model';
import { Constants } from 'src/app/config/constants';
import { HistoryService } from '../../history.service';

@Component({
  selector: 'app-patient-history-filter',
  templateUrl: './patient-history-filter.component.html',
  styleUrls: ['./patient-history-filter.component.scss']
})
export class PatientHistoryFilterComponent implements OnInit {
  @Input() messageDetails: any;

  servicesTypeList: any;
  documentTypeList: any;
  startDate: any;
  endDate: any;
  loadPoup: boolean;
  todayDate = moment().toDate();
  setAlertMessage: IAlert;
  constructor(
    public modal: NgbActiveModal,
    public mappingService: MappingService,
    public historyService: HistoryService,
  ) { }

  ngOnInit() {
    this.loadPoup = false;
    const serviceType = this.getAllServiceTypeList();
    const documentType = this.getAllDocumentTypeList(this.messageDetails.patientObj.patientData.id);
    forkJoin([serviceType, documentType]).subscribe(res => {
      this.servicesTypeList = _.map(res[0], (d) => { d.isChecked = false; return d; });
      this.documentTypeList = _.map(res[1], (d) => { d.isChecked = false; return d; });
      this.startDate = moment().toDate();
      this.endDate = moment().toDate();
      this.loadPoup = true;
      const filter = this.historyService.getPatientHistoryFilter(this.messageDetails.patientObj.patientData.id);
      if (filter) {
        this.startDate = filter.startDate ? filter.startDate : moment().toDate();
        this.endDate = filter.endDate ? filter.endDate : moment().toDate();
        if (filter.serviceType.length > 0) {
          _.map(filter.serviceType, (d) => {
            const indxService = _.findIndex(this.servicesTypeList, st => {
              return st.id === d.id;
            });
            if (indxService !== -1) {
              this.servicesTypeList[indxService].isChecked = true;
            }
          });
        }
        if (filter.docType.length > 0) {
          _.map(filter.docType, (d) => {
            const indxDoc = _.findIndex(this.documentTypeList, dt => {
              return dt.id === d.id;
            });
            if (indxDoc !== -1) {
              this.documentTypeList[indxDoc].isChecked = true;
            }
          });
        }
      }
    });
  }

  clearAllSelection() {
    this.servicesTypeList = _.map(this.servicesTypeList, (d) => { d.isChecked = false; return d; });
    this.documentTypeList = _.map(this.documentTypeList, (d) => { d.isChecked = false; return d; });
    this.startDate = moment().toDate();
    this.endDate = moment().toDate();
  }

  applyFilterValue() {
    const selectedServiceType = _.filter(this.servicesTypeList, d => { return d.isChecked === true; });
    const selectedDocTypeType = _.filter(this.documentTypeList, d => { return d.isChecked === true; });
    let startDate = this.startDate;
    let endDate = this.endDate;
    if (moment(this.startDate).isAfter(moment(this.endDate))) {
      this.notifyAlertMessage({
        msg: 'Please Check Date Range',
        class: 'danger',
      });
      return;
    }
    let isAllTodayDate = false;
    if (moment(moment(this.startDate).format('YYYY-MM-DD')).isSame(moment(moment().format('YYYY-MM-DD')))
      && moment(moment(this.endDate).format('YYYY-MM-DD')).isSame(moment(moment().format('YYYY-MM-DD')))) {
      startDate = null;
      endDate = null;
      isAllTodayDate = true;
    }
    if (selectedServiceType.length === 0 && selectedDocTypeType.length === 0 && isAllTodayDate) {
      this.notifyAlertMessage({
        msg: 'Please Select Value',
        class: 'danger',
      });
      return;
    }
    const param = {
      serviceType: selectedServiceType,
      docType: selectedDocTypeType,
      startDate: startDate ? startDate : null,
      endDate: endDate ? endDate : null
    };
    this.historyService.setPatientHistoryFilter(this.messageDetails.patientObj.patientData.id, param);
    this.modal.close('Ok');
  }

  selectValueConfirm(typ) {
    this.modal.close('cancle');
  }

  getAllServiceTypeList(): Observable<any> {
    return this.mappingService.getServiceTypeList().pipe(map(res => {
      return res;
    }));
  }

  getAllDocumentTypeList(patientId): Observable<any> {
    return this.mappingService.getPatientDocumentTypeList(patientId).pipe(map(res => {
      return res;
    }));
  }

  getDateValue(date, type) {
    this[type] = date;
  }

  notifyAlertMessage(data): void {
    this.setAlertMessage = {
      message: data.msg,
      messageType: data.class,
      duration: Constants.ALERT_DURATION
    };
  }

}

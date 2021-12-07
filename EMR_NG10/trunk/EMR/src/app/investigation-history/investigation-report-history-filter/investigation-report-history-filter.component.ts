import { Component, OnInit, Input } from '@angular/core';
import { IAlert } from 'src/app/public/models/AlertMessage';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { MappingService } from 'src/app/public/services/mapping.service';
import { HistoryService } from 'src/app/history/history.service';
import { forkJoin, Observable } from 'rxjs';
import { Constants } from 'src/app/config/constants';
import * as _ from 'lodash';
import * as moment from 'moment';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-investigation-report-history-filter',
  templateUrl: './investigation-report-history-filter.component.html',
  styleUrls: ['./investigation-report-history-filter.component.scss']
})
export class InvestigationReportHistoryFilterComponent implements OnInit {
  @Input() messageDetails: any;

  servicesTypeList: any;
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
    forkJoin([serviceType]).subscribe(res => {
      this.servicesTypeList = _.map(res[0], (d) => { d.isChecked = false; return d; });
      this.startDate = moment().toDate();
      this.endDate = moment().toDate();
      this.loadPoup = true;
      const filter = this.historyService.getPatientInvestigationHistoryFilter(this.messageDetails.patientObj.patientData.id);
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
      }
    });
  }

  clearAllSelection() {
    this.servicesTypeList = _.map(this.servicesTypeList, (d) => { d.isChecked = false; return d; });
    this.startDate = moment().toDate();
    this.endDate = moment().toDate();
  }

  applyFilterValue() {
    const selectedServiceType = _.filter(this.servicesTypeList, d => { return d.isChecked === true; });
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
    const param = {
      serviceType: selectedServiceType,
      startDate: startDate ? startDate : null,
      endDate: endDate ? endDate : null
    };
    this.historyService.setPatientInvestigationHistoryFilter(this.messageDetails.patientObj.patientData.id, param);
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

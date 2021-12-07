import { HistoryService } from './../../history.service';
import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'lodash';
import * as moment from 'moment';
import { ConsultationHistoryService } from './../../../public/services/consultation-history.service';
import { PatientChartService } from '../../../patient-chart/patient-chart.service';
import { of } from 'rxjs';

@Component({
  selector: 'app-visit-history-filter',
  templateUrl: './visit-history-filter.component.html',
  styleUrls: ['./visit-history-filter.component.scss']
})
export class VisitHistoryFilterComponent implements OnInit {
  @Input() messageDetails: any;

  careTeamList = [];
  dateArray = [];
  sectionListArray = [];
  dateFormate = 'YYYY-MM-DD';

  constructor(
    public modal: NgbActiveModal,
    public consultationHistoryService: ConsultationHistoryService,
    public patientChartService: PatientChartService,
    public historyService: HistoryService
  ) { }

  ngOnInit() {
    this.getVisitDateList();
    this.getCareTeamList();
    this.getComponentList();
  }

  getVisitDateList() {
    const param = {
      service_type_id: this.messageDetails.patientObj.serviceType.id,
      patient_id: this.messageDetails.patientObj.patientData.id
    };
    this.consultationHistoryService.getAllPatientVisitDates(param).subscribe(res => {
      const arrayData = _.map(res, d => {
        return { isChecked: false, date: d };
      });
      if (this.messageDetails.appliedFilter && this.messageDetails.appliedFilter.chartDateArray.length > 0) {
        _.map(arrayData, dt => {
          const chkIndx = _.findIndex(this.messageDetails.appliedFilter.chartDateArray, chrt => {
            return moment(chrt.date).format(this.dateFormate) === moment(dt.date).format(this.dateFormate);
          });
          if (chkIndx !== -1) {
            dt.isChecked = true;
          }
        });
      }
      this.dateArray = _.cloneDeep(arrayData);
    });
  }

  getCareTeamList() {
    const param = {
      service_type_id: this.messageDetails.patientObj.serviceType.id,
      patient_id: this.messageDetails.patientObj.patientData.id
    };
    this.consultationHistoryService.getAllPatientCareTeam(param).subscribe(res => {
      const arrayData = res;
      // const arrayData = _.map(res, d => {
      //   return { isChecked: false, user: d };
      // });
      if (this.messageDetails.appliedFilter && this.messageDetails.appliedFilter.careTeamList.length > 0) {
        _.map(arrayData, dt => {
          const chkIndx = _.findIndex(this.messageDetails.appliedFilter.careTeamList, tm => {
            return tm.user_id === dt.user_id;
          });
          if (chkIndx !== -1) {
            dt.isChecked = true;
          }
        });
      }
      this.careTeamList = _.cloneDeep(arrayData);
    });
  }

  getComponentList() {
    const data = this.consultationHistoryService.getHistorDataByKey(this.messageDetails.patientObj.patientData.id, 'componentList', false);
    if (data && data.length > 0) {
      this.updateComponentData(data);
      return of(data);
    } else {
      const req = {
        service_type_id: this.messageDetails.patientObj.serviceType.id,
        patient_id: this.messageDetails.patientObj.patientData.id
      };
      this.patientChartService.getPatientVisitSections(req).subscribe((res: any) => {
        if (res.status_message === 'Success' && res.data.length) {
          this.consultationHistoryService.setHistoryPatientData(this.messageDetails.patientObj.patientData.id, 'componentList', res.data);
          this.updateComponentData(res.data);
          return res.data;
        }
      });

      // this.patientChartService.getPatientChartComponentList(this.messageDetails.patientObj.serviceType.id, 0).subscribe(res => {
      //   this.consultationHistoryService.setHistoryPatientData(this.messageDetails.patientObj.patientData.id, 'componentList', res.data);
      //   this.updateComponentData(res.data);
      //   return res.data;
      // });
    }
  }

  updateComponentData(res) {
    const arrayData = res;
    // const arrayData = _.map(res, d => {
    //   return { isChecked: false, section: d };
    // });
    if (this.messageDetails.appliedFilter && this.messageDetails.appliedFilter.componentList.length > 0) {
      _.map(arrayData, dt => {
        const chkIndx = _.findIndex(this.messageDetails.appliedFilter.componentList, cm => {
          return cm.section_key ===  dt.section_key && cm.section_name ===  dt.section_name
            && cm.section_type ===  dt.section_type;
        });
        dt.isChecked = chkIndx !== -1;
      });
    }
    this.sectionListArray = _.cloneDeep(arrayData);
  }

  clearAllSelection() {
    _.map(this.careTeamList, lst => {
      lst.isChecked = false;
    });
    _.map(this.dateArray, lst => {
      lst.isChecked = false;
    });
    _.map(this.sectionListArray, lst => {
      lst.isChecked = false;
    });
  }

  applyFilterValue() {
    const filterObj = {
      patientId: this.messageDetails.patientObj.patientData.id,
      type: this.messageDetails.type,
      chartDateArray: _.filter(this.dateArray, lst => {
        return lst.isChecked;
      }),
      careTeamList: _.filter(this.careTeamList, lst => {
        return lst.isChecked;
      }),
      componentList: _.filter(this.sectionListArray, lst => {
        return lst.isChecked;
      }),
    };
    this.consultationHistoryService.setActiveFilterDataById(filterObj);
    // this.historyService.sendFilterDataEvent(filterObj);
    this.modal.close('Ok');
  }

  selectValueConfirm(typ) {
    this.modal.close('cancle');
  }

}

import { DischargeSummaryService } from './../discharge-summary.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Component, OnInit, Input } from '@angular/core';
import { of } from 'rxjs';
import * as _ from 'lodash';
import * as moment from 'moment';
import { EncounterPatient } from 'src/app/public/models/encounter-patient.model';

@Component({
  selector: 'app-discharge-summary-filter',
  templateUrl: './discharge-summary-filter.component.html',
  styleUrls: ['./discharge-summary-filter.component.scss']
})
export class DischargeSummaryFilterComponent implements OnInit {

  @Input() messageDetails: any;
  patientObj: EncounterPatient;
  careTeamList = [];
  dateArray = [];
  sectionListArray = [];
  dateFormate = 'YYYY-MM-DD';
  chartList = [];
  dsTemplateList: any[] = [];
  showOrderList = [
    { value: 'dietOrders', label: 'Diet Orders', isChecked: false, isShow: true },
    { value: 'instructionOrders', label: 'Instruction Orders', isChecked: false, isShow: true },
    { value: 'labOrders', label: 'Lab Orders', isChecked: false, isShow: true },
    { value: 'medicineOrders', label: 'Medicine Orders', isChecked: false, isShow: true },
    { value: 'nursingOrders', label: 'Nursing Orders', isChecked: false, isShow: true },
    { value: 'radiologyOrders', label: 'Radiology Orders', isChecked: false, isShow: true },
    { value: 'serviceOrders', label: 'Service Orders', isChecked: false, isShow: true },
  ];

  showOptionList = [
    { value: 'date', label: 'Date', isChecked: false, isShow: true },
    { value: 'user', label: 'User', isChecked: false, isShow: true },
  ];

  showTemplateSearchBox = false;
  showDateSearchBox = false;
  showUserSearchBox = false;
  showChartsSearchBox = false;
  showComponentsSearchBox = false;
  showListSearchBox = false;
  showOrdersSearchBox = false;

  templateSearchBox = null;
  dateSearchBox = null;
  userSearchBox = null;
  chartsSearchBox = null;
  componentsSearchBox = null;
  listSearchBox = null;

  constructor(
    public modal: NgbActiveModal,
    public dischargeSummaryService: DischargeSummaryService,
  ) { }

  ngOnInit() {
    this.patientObj = this.messageDetails.patientObj;
    this.getVisitDateList();
    this.getCareTeamList();
    this.getChartList();
    this.getComponentList();
    if (this.messageDetails.appliedFilter && this.messageDetails.appliedFilter.showOrderList.length > 0) {
      _.map(this.showOrderList, dt => {
        const chkIndx = _.findIndex(this.messageDetails.appliedFilter.showOrderList, chrt => {
          return chrt.value === dt.value;
        });
        if (chkIndx !== -1) {
          dt.isChecked = true;
        }
      });
    }
    if (this.messageDetails.appliedFilter && this.messageDetails.appliedFilter.showOptionList.length > 0) {
      _.map(this.showOptionList, dt => {
        const chkIndx = _.findIndex(this.messageDetails.appliedFilter.showOptionList, chrt => {
          return chrt.value === dt.value;
        });
        if (chkIndx !== -1) {
          dt.isChecked = true;
        }
      });
    }
    this.getDischargeSummaryTemplates();
  }

  getVisitDateList() {
    const param = {
      service_type_id: this.patientObj.serviceType.id,
      patient_id: this.patientObj.patientData.id,
      visit_no: this.patientObj.visitNo
    };
    this.dischargeSummaryService.getVisitDates(param).subscribe(res => {
      const arrayData = _.map(res, d => {
        return { isChecked: false, date: d, isShow: true };
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
      service_type_id: this.patientObj.serviceType.id,
      patient_id: this.patientObj.patientData.id,
      visit_no: this.patientObj.visitNo
    };
    this.dischargeSummaryService.getAllPatientCareTeam(param).subscribe(res => {
      const arrayData = _.map(res, d => {
        return { isChecked: false, user: d, isShow: true };
      });
      if (this.messageDetails.appliedFilter && this.messageDetails.appliedFilter.careTeamList.length > 0) {
        _.map(arrayData, dt => {
          const chkIndx = _.findIndex(this.messageDetails.appliedFilter.careTeamList, tm => {
            return tm.user.user_id === dt.user.user_id;
          });
          if (chkIndx !== -1) {
            dt.isChecked = true;
          }
        });
      }
      this.careTeamList = _.cloneDeep(arrayData);
    });
  }

  getChartList() {
    const param = {
      service_type_id: this.patientObj.serviceType.id,
      patient_id: this.patientObj.patientData.id,
      visit_no: this.patientObj.visitNo,
    };
    this.dischargeSummaryService.getPatientChartList(param).subscribe(res => {
      const arrayData = _.map(res, d => {
        return { isChecked: false, chart: d, isShow: true };
      });
      if (this.messageDetails.appliedFilter && this.messageDetails.appliedFilter.filteredChartList.length > 0) {
        _.map(arrayData, dt => {
          const chkIndx = _.findIndex(this.messageDetails.appliedFilter.filteredChartList, chrt => {
            return chrt.chart.patient_chart_id === dt.chart.patient_chart_id;
          });
          if (chkIndx !== -1) {
            dt.isChecked = true;
          }
        });
      }
      this.chartList = _.cloneDeep(arrayData);
    });
  }

  getComponentList() {
    const data = this.dischargeSummaryService.getDischargeSummaryFilterList(this.patientObj.patientData.id, 'componentList', false);
    if (data && data.length > 0) {
      this.updateComponentData(data);
      return of(data);
    } else {
      this.dischargeSummaryService.getPatientChartComponentList(this.patientObj.patientData.id, this.patientObj.serviceType.id, this.patientObj.visitNo, 0).subscribe(res => {
        this.dischargeSummaryService.setHistoryPatientData(this.patientObj.patientData.id, 'componentList', res);
        this.updateComponentData(res);
        return res.data;
      });
    }
  }

  updateComponentData(res) {
    const arrayData = _.map(res, d => {
      return { isChecked: false, section: d, isShow: true };
    });
    if (this.messageDetails.appliedFilter && this.messageDetails.appliedFilter.componentList.length > 0) {
      _.map(arrayData, dt => {
        const chkIndx = _.findIndex(this.messageDetails.appliedFilter.componentList, cm => {
          return _.intersectionWith(cm.section.chart_detail_ids, dt.section.chart_detail_ids, _.isEqual).length ? true : false;
          //return cm.section.section_ref_id === dt.section.section_ref_id;
        });
        if (chkIndx !== -1) {
          dt.isChecked = true;
        }
      });
    }
    this.sectionListArray = _.cloneDeep(arrayData);
  }

  clearAllSelection(clearTemplates?) {
    _.map(this.careTeamList, lst => {
      lst.isChecked = false;
    });
    _.map(this.dateArray, lst => {
      lst.isChecked = false;
    });
    _.map(this.sectionListArray, lst => {
      lst.isChecked = false;
    });
    _.map(this.chartList, lst => {
      lst.isChecked = false;
    });
    _.map(this.showOrderList, lst => {
      lst.isChecked = false;
    });
    if (clearTemplates) {
      _.map(this.dsTemplateList, lst => {
        lst.isChecked = false;
      });
    }
  }

  applyFilterValue() {
    const filterObj = {
      patientId: this.patientObj.patientData.id,
      type: this.messageDetails.type,
      chartDateArray: _.filter(this.dateArray, lst => {
        return lst.isChecked;
      }),
      careTeamList: _.filter(this.careTeamList, lst => {
        return lst.isChecked;
      }),
      filteredChartList: _.filter(this.chartList, lst => {
        return lst.isChecked;
      }),
      componentList: _.filter(this.sectionListArray, lst => {
        return lst.isChecked;
      }),
      showOptionList: _.filter(this.showOptionList, lst => {
        return lst.isChecked;
      }),
      showOrderList: _.filter(this.showOrderList, lst => {
        return lst.isChecked;
      }),
    };
    // return all components if nothing is selected
    // filterObj.componentList = (!filterObj.componentList.length) ? this.sectionListArray : filterObj.componentList;
    this.dischargeSummaryService.setActiveFilterDataById(filterObj);
    this.modal.close('Ok');
  }

  selectValueConfirm(typ) {
    this.modal.close('cancle');
  }

  getDischargeSummaryTemplates() {
    const param = {
      service_type_id: this.patientObj.serviceType.id,
      patient_id: this.patientObj.patientData.id,
      visit_no: this.patientObj.visitNo
    };
    this.dischargeSummaryService.getDischargeSummaryTemplates(param).subscribe(res => {
      if (res.status_message === 'Success') {
        if (res.data && res.data.length) {
          _.forEach(res.data, (template) => {
            template.isChecked = false;
            template.isShow = true;
            this.dsTemplateList.push(template);
          });
        }
      }
    });
  }

  applyDsTemplate(item) {
    item.isChecked = !item.isChecked;
    let mergedCharts = [];
    let mergedComponents = [];
    this.clearAllSelection(false);
    _.forEach(this.dsTemplateList, (template) => {
      if (!template.isChecked) {
        return;
      }
      _.forEach(template.chartIds, (cId) => {
        mergedCharts.push(cId);
      });
      _.forEach(template.components, (component) => {
        mergedComponents.push(component);
      });
      // remove duplicates
      mergedComponents = _.uniqWith(mergedComponents, _.isEqual);
      mergedCharts = _.uniq(mergedCharts);
      this.clearAllSelection(false);
      // tick charts
      _.map(this.chartList, lst => {
        const isExist = _.findIndex(mergedCharts, (chart) => chart === lst.chart.patient_chart_id);
        lst.isChecked = (isExist !== -1);
      });
      // tick components
      _.map(this.sectionListArray, lst => {
        const isExist = _.findIndex(mergedComponents, (comp) => {
          return (_.isEqual(lst.section.chart_detail_ids, comp.chartDetailIds) && lst.section.section_name === comp.sectionName);
        });
        lst.isChecked = (isExist !== -1);
      });
    });
  }

  showHideSearchBox(type) {
    this[type] = !this[type];
    if (type === 'showTemplateSearchBox' && !this[type]) {
      _.map(this.dsTemplateList, d => {
        d.isShow = true;
      });
    } else if (type === 'showDateSearchBox' && !this[type]) {
      _.map(this.dateArray, d => {
        d.isShow = true;
      });
    } else if (type === 'showUserSearchBox' && !this[type]) {
      _.map(this.careTeamList, d => {
        d.isShow = true;
      });
    } else if (type === 'showChartsSearchBox' && !this[type]) {
      _.map(this.chartList, d => {
        d.isShow = true;
      });
    } else if (type === 'showComponentsSearchBox' && !this[type]) {
      _.map(this.sectionListArray, d => {
        d.isShow = true;
      });
    } else if (type === 'showListSearchBox' && !this[type]) {
      _.map(this.showOptionList, d => {
        d.isShow = true;
      });
    } else if (type === 'showOrderList' && !this[type]) {
      _.map(this.showOptionList, d => {
        d.isShow = true;
      });
    }
  }

  updateList(srch, type) {
    const serchStrn = _.toUpper(srch);
    if (type === 'showOptionList') {
      _.map(this.showOptionList, d => {
        if (_.toUpper(d.label).includes(serchStrn)) {
          d.isShow = true;
        } else {
          d.isShow = false;
        }
      });
    } else if (type === 'sectionListArray') {
      _.map(this.sectionListArray, d => {
        if (_.toUpper(d.section.section_name).includes(serchStrn)) {
          d.isShow = true;
        } else {
          d.isShow = false;
        }
      });
    } else if (type === 'chartList') {
      _.map(this.chartList, d => {
        if (_.toUpper(d.chart.chart_name).includes(serchStrn)) {
          d.isShow = true;
        } else {
          d.isShow = false;
        }
      });
    } else if (type === 'careTeamList') {
      _.map(this.careTeamList, d => {
        if (_.toUpper(d.user.user_name).includes(serchStrn)) {
          d.isShow = true;
        } else {
          d.isShow = false;
        }
      });
    } else if (type === 'dateArray') {
      _.map(this.dateArray, d => {
        if (_.toUpper(d.date).includes(serchStrn)) {
          d.isShow = true;
        } else {
          d.isShow = false;
        }
      });
    } else if (type === 'dsTemplateList') {
      _.map(this.dsTemplateList, d => {
        if (_.toUpper(d.templateName).includes(serchStrn)) {
          d.isShow = true;
        } else {
          d.isShow = false;
        }
      });
    } else if (type === 'showOrderList') {
      _.map(this.showOrderList, d => {
        if (_.toUpper(d.label).includes(serchStrn)) {
          d.isShow = true;
        } else {
          d.isShow = false;
        }
      });
    }
  }

}

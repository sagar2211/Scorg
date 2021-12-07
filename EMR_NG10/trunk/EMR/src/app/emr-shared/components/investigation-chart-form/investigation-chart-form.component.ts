import { Component, OnInit, OnDestroy, Input, OnChanges } from '@angular/core';
import { FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { Subject } from 'rxjs';
import { PatientInvestigation } from './../../../public/models/patient-investigation.model';
import * as  _ from 'lodash';
import * as  moment from 'moment';
import { InvestigationMaster, InvestigationSave } from './../../../public/models/investigation-master.model';
import { DynamicChartService } from '../../../dynamic-chart/dynamic-chart.service';
import { Constants } from 'src/app/config/constants';
import { CommonService } from 'src/app/public/services/common.service';

@Component({
  selector: 'app-investigation-chart-form',
  templateUrl: './investigation-chart-form.component.html',
  styleUrls: ['./investigation-chart-form.component.scss']
})
export class InvestigationChartFormComponent implements OnInit, OnDestroy, OnChanges {
  @Input() invesigationType;
  @Input() public componentInfo: any;

  investigationData: InvestigationSave[];
  setGetDataKey = 'investigation_detail';
  dateFormate = 'YYYY-MM-DD';

  isAdd = false;
  investigationFrm: FormGroup;
  destroy$ = new Subject();
  isPanelOpen: boolean;
  chartDetailId: number;

  constructor(
    private fb: FormBuilder,
    private dynamicChartService: DynamicChartService,
    private commonService: CommonService,
  ) { }

  ngOnInit() {
    this.chartDetailId = this.componentInfo.chart_detail_id;
    this.isPanelOpen = (this.componentInfo.activeIdsOfPanels as Array<any>).indexOf(this.componentInfo.section_key) !== -1 ? true : false;
    if (_.isUndefined(this.investigationFrm)) {
      this.createForm();
    } else {
      this.getInitData();
    }
    this.subcriptionOfEvents();
  }

  getInitData() {
    this.dynamicChartService.getChartDataByKey(this.setGetDataKey, true, null, this.chartDetailId).subscribe(result => {
      this.investigationData = [];
      if (result === null || result === undefined) {
        this.investigationData = [];
      } else if (result.length) {
        // if (this.invesigationType !== Constants.investigationKey) {
        //   this.investigationData = _.filter(result, dt => dt.investigation_type === this.invesigationType);
        // } else {
        //   this.investigationData = _.filter(result, dt => dt.source === this.invesigationType);
        // }
        this.investigationData = _.filter(result, dt => dt.source === (this.invesigationType === Constants.investigationKey ? this.invesigationType : (this.invesigationType === Constants.radioInvestigationKey ? 'radiology_investigation' : 'lab_investigation')));
      }
      this.getInvestigationData();
    });
  }

  ngOnChanges(): void {
    // if (_.isUndefined(this.investigationFrm)) {
    //   this.createForm();
    // } else {
    //   this.getInvestigationData();
    // }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  createForm() {
    this.investigationFrm = this.fb.group({
      investigationListFrm: this.fb.array([])
    });
    this.getInitData();
  }

  get investigationListFrm() {
    return this.investigationFrm.get('investigationListFrm') as FormArray;
  }

  getSelectInvestigation($event, indx, from?) {
    const val = $event !== undefined ? $event : '';
    if (val === '') {
      this.investigationListFrm.at(indx).patchValue({
        investigation: '',
        investigationName: '',
      });
    } else {
      this.investigationListFrm.at(indx).patchValue({
        investigation: val,
        investigationName: val.name,
      });
    }
    this.sendAllSelectedListData();
  }

  getInvestigationData() {
    if (this.investigationData.length > 0) {
      const investigationData = [];
      _.map(this.investigationData, dt => {
        if (this.invesigationType === Constants.investigationKey) {
          const invMaster = new InvestigationMaster();
          const obj = {
            InvestigationHeadID: dt.investigation_head_id,
            label: dt.investigation,
            id: dt.investigation_id,
            type: dt.investigation_type
          };
          invMaster.generateObject(obj);
          const tempObj = {
            investigation: invMaster,
            investigationName: invMaster.name,
            comment: dt.comment,
            date: dt.date ? new Date(dt.date) : null,
            id: dt.tran_id,
            type: dt.investigation_type
          };
          investigationData.push(tempObj);
        } else {
          if (dt.investigation_type === this.invesigationType) {
            const invMaster = new InvestigationMaster();
            const obj = {
              InvestigationHeadID: dt.investigation_head_id,
              label: dt.investigation,
              id: dt.investigation_id,
              type: dt.investigation_type
            };
            invMaster.generateObject(obj);
            const tempObj = {
              investigation: invMaster,
              investigationName: invMaster.name,
              comment: dt.comment,
              date: dt.date ? new Date(dt.date) : null,
              id: dt.tran_id,
              type: dt.investigation_type
            };
            investigationData.push(tempObj);
          }
        }

      });
      this.investigationFrm.setControl('investigationListFrm', this.fb.array([]));
      this.updateFormValue(investigationData);
    } else {
      this.investigationFrm.setControl('investigationListFrm', this.fb.array([]));
      this.patchDefaultValue();
    }
  }

  updateFormValue(res): void {
    _.map(res, Obj => {
      const obj = {
        investigation: Obj['investigation'],
        investigationName: Obj['investigation'] ? Obj['investigation']['name'] : null,
        comment: Obj['comment'],
        date: Obj['date'],
        id: Obj['id'],
        chart_detail_id: this.chartDetailId
      };
      const patientInvestigation = new PatientInvestigation();
      if (patientInvestigation.isObjectValid(obj)) {
        patientInvestigation.generateObject(obj);
        this.investigationListFrm.push(this.fb.group(patientInvestigation));
        if (this.investigationListFrm.controls.length > 1) {
          const findIndx = _.findIndex(this.investigationListFrm.value, rfm => {
            return (rfm.investigation === '' || rfm.investigation === null);
          });
          if (findIndx !== -1) {
            this.investigationListFrm.removeAt(findIndx);
          }
        }
      }
    });
  }

  // -- push form default value into formArray
  patchDefaultValue() {
    const patInvestigation = {
      investigation: null,
      investigationName: null,
      comment: null,
      date: null,
      id: null,
      chart_detail_id: this.chartDetailId
    };
    const patientInvestigation = new PatientInvestigation();
    if (patientInvestigation.isObjectValid(patInvestigation)) {
      patientInvestigation.generateObject(patInvestigation);
      this.investigationListFrm.push(this.fb.group(patientInvestigation));
    }
  }

  // -- add radiology test when click on add button
  addInvestigation(rowData, from?): void {
    this.isAdd = true;
    if (rowData.valid) {
      this.openModalPopupSugg(true);
      this.isAdd = false;
      this.patchDefaultValue();
      this.sendAllSelectedListData();
      if (!from) {
        this.openSuggesstionBox('ADD', rowData.value.investigation);
      }
    }
  }

  // -- delete radiology test from list
  deleteInvestigation(rowData, indx): void {
    this.openModalPopupSugg(false);
    this.investigationListFrm.removeAt(indx);
    if (this.investigationListFrm.controls.length <= 0) {
      this.patchDefaultValue();
    }
    this.sendAllSelectedListData();
    if (rowData.value.investigation) {
      this.openSuggesstionBox('ADD', rowData.value.investigation);
    }
  }

  menuClicked(event) {
    this.isPanelOpen = event.nextState;
    this.openSuggesstionBox('UPDATE');
    this.commonService.openSuggesstionPanelOnFixedComponentSearchCallFunction('open');
  }

  sendAllSelectedListData() {
    const listData = _.filter(this.investigationListFrm.value, dt => {
      return dt.investigation !== null;
    });
    let invData = [];
    _.map(listData, dt => {
      const dataSaveObj = {
        tran_id: null,
        investigation_head_id: dt.investigation.headId,
        investigation_type: this.invesigationType === Constants.investigationKey ? dt.investigation.type : this.invesigationType,
        investigation_id: dt.investigation.id,
        investigation: dt.investigation.name,
        comment: dt.comment,
        date: dt.date ? moment(dt.date).format(this.dateFormate) : null,
        chart_detail_id: this.chartDetailId,
        source: this.invesigationType === Constants.investigationKey ? this.invesigationType : (this.invesigationType === Constants.radioInvestigationKey ? 'radiology_investigation' : 'lab_investigation')
      };
      const invSave = new InvestigationSave();
      invSave.generateObject(dataSaveObj);
      invData.push(invSave);
    });
    const otherInv = this.dynamicChartService.getChartDataByKey(this.setGetDataKey, false, null, this.chartDetailId);
    if (otherInv && otherInv.length && this.invesigationType !== Constants.investigationKey) {
      invData = invData.concat(_.filter(otherInv, dt => dt.investigation_type !== this.invesigationType));
    }
    this.dynamicChartService.updateLocalChartData(this.setGetDataKey, invData, 'update', this.chartDetailId);
    // console.log(invData);
    // this.selectedInvestigationList.emit(listData);
  }

  openSuggesstionBox(eventName, selectedObj?): void {
    let listData = null;
    if (eventName === 'UPDATE') {
      listData = _.map(_.filter(this.investigationListFrm.value, dt => {
        return dt.investigation !== null;
      }), 'investigation');
    } else {
      listData = selectedObj;
    }
    this.dynamicChartService.sendEventToParentChartContainer.next({ source: 'other_component', content: { prescriptionDetails: null } });
    setTimeout(() => {
      this.dynamicChartService.sendEventToSuggestion.next({
        sectionKeyName: this.invesigationType === Constants.investigationKey ? this.invesigationType : (this.invesigationType === Constants.radioInvestigationKey ? 'radiology_investigation' : 'lab_investigation'),
        action: eventName,
        selectedData: listData,
        componentData: { chartDetailId: this.chartDetailId }
      });
    });
  }

  addFromSuggestion() {
    this.dynamicChartService.$getEventFrmSuggestion.subscribe(data => {
      if (data.sectionKeyName === (this.invesigationType === Constants.investigationKey ?
        this.invesigationType : (this.invesigationType === Constants.radioInvestigationKey ?
          'radiology_investigation' : 'lab_investigation'))
        && data.componentData.chartDetailId === this.chartDetailId) {
        if (data.action === 'ADD') {
          this.addDataGetFromSuggestion(data.selectedSuggestion);
        }
      }
    });
  }

  addDataGetFromSuggestion(dataSugg) {
    // check last index have value or not
    const lstIndData = this.investigationListFrm.value[this.investigationListFrm.value.length - 1];
    if (lstIndData.investigation === null) {
      this.getSelectInvestigation(dataSugg, this.investigationListFrm.value.length - 1);
      // this.addInvestigation(this.investigationListFrm.controls[this.investigationListFrm.value.length - 1], 'suggestion');
    } else {
      this.addInvestigation(this.investigationListFrm.controls[this.investigationListFrm.value.length - 1], 'suggestion');
      this.getSelectInvestigation(dataSugg, this.investigationListFrm.value.length - 1);
    }
  }

  subcriptionOfEvents() {
    this.addFromSuggestion();
  }

  openSuggestionPanelForSearch(search): void {
    this.openModalPopupSugg(true);
    this.dynamicChartService.sendEventToSuggestion.next({
      sectionKeyName: this.invesigationType === Constants.investigationKey ? this.invesigationType : (this.invesigationType === Constants.radioInvestigationKey ? 'radiology_investigation' : 'lab_investigation'),
      action: 'SEARCH',
      selectedData: search,
      componentData: { chartDetailId: this.chartDetailId }
    });
  }

  openModalPopupSugg(val) {
    if (this.commonService.isTabModeOn) {
      this.commonService.openSuggesstionPanelWhenTabModeOnForComponents(val);
    }
  }

}

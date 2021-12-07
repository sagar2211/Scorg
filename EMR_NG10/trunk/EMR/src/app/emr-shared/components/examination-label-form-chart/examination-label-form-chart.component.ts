import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import * as _ from 'lodash';
import { ExaminationLabelsService } from '../../../public/services/examination-labels.service';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { ExaminationTags, ExaminationSave } from '../../../public/models/examination-tags';
import { NgbModal, NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { ExaminationLabelEditComponent } from '../examination-label-edit/examination-label-edit.component';
import { DynamicChartService } from '../../../dynamic-chart/dynamic-chart.service';
import { CommonService } from '../../../public/services/common.service';

@Component({
  selector: 'app-examination-label-form-chart',
  templateUrl: './examination-label-form-chart.component.html',
  styleUrls: ['./examination-label-form-chart.component.scss']
})
export class ExaminationLabelFormChartComponent implements OnInit, OnDestroy {

  @Input() exminationHeadId;
  @Input() public componentInfo: any;

  selectedExaminationData: any;
  selectedExaminationType: number;
  // 1 -> Multiple Input with Severity
  // 2 -> Multiple Input without Severity
  // 3 -> Suggestions Box
  // 4 -> Free Text
  examinationTagInput: any[] = [];
  compInstance = this;
  examinationTagInputSuggessgtionList = [];
  saveMasterSetting: string;
  examinationSuggesstionOrFreeText: any;
  setGetDataKey = 'examination_detail';
  isPanelOpen: boolean;
  chartDetailId: number;
  strictKeywordEnabled = true;
  semanticTags: any;
  constructor(
    private examinationLabelsService: ExaminationLabelsService,
    private modalService: NgbModal,
    private dynamicChartService: DynamicChartService,
    private commonService: CommonService
  ) { }

  ngOnInit() {
    this.chartDetailId = this.componentInfo.chart_detail_id;
    this.strictKeywordEnabled = this.componentInfo.editable_suggestion;
    this.semanticTags = (this.componentInfo.semantic_tags === undefined || this.componentInfo.semantic_tags === '' || this.componentInfo.semantic_tags === null) ? [] :
      (_.isArray(this.componentInfo.semantic_tags)) ? this.componentInfo.semantic_tags : JSON.parse(this.componentInfo.semantic_tags);
    this.defaultSetObjects();
    this.getExaminationData();
    this.listenToSubjectEvents();
    this.isPanelOpen = (this.componentInfo.activeIdsOfPanels as Array<any>).indexOf(this.componentInfo.section_key) !== -1 ? true : false;
  }

  ngOnDestroy() { }

  defaultSetObjects() {
    this.selectedExaminationType = null;
    this.selectedExaminationData = null;
    this.saveMasterSetting = 'no_master_save';
    this.examinationSuggesstionOrFreeText = {
      id: null,
      transId: null,
      value: null,
      conceptData: []
    };
  }

  getInitData() {
    this.dynamicChartService.getChartDataByKey(this.setGetDataKey, true, null, this.chartDetailId).subscribe(result => {
      if (result && result.length) {
        const examData = _.filter(result, dt => dt.examination_head_id === this.exminationHeadId);
        this.setSelectedExaminationValue(examData);
      }
    });
  }

  setSelectedExaminationValue(examData) {
    if (this.selectedExaminationType === 2 || this.selectedExaminationType === 1) {
      this.examinationTagInput = [];
      _.map(examData, tg => {
        const exmTag = new ExaminationTags();
        const exmObj = {
          id: tg.exam_id,
          transId: tg.tran_id,
          headId: tg.examination_head_id,
          tagKey: tg.examination_text.replace(/\s+/g, '').toLowerCase(),
          tagName: tg.examination_text,
          tagPriority: tg.severity,
          masterSave: tg.add_to_master,
          chart_detail_id: tg.chart_detail_id,
          conceptData: tg.conceptData
        };
        exmTag.generateObject(exmObj);
        this.examinationTagInput.push(exmTag);
      });
    } else if (this.selectedExaminationType === 3 || this.selectedExaminationType === 4) {
      _.map(examData, tg => {
        this.examinationSuggesstionOrFreeText = {
          transId: tg.tran_id,
          id: tg.exam_id,
          value: tg.examination_text,
          chart_detail_id: tg.chart_detail_id,
          conceptData: (!_.isUndefined(tg.conceptData) && tg.conceptData !== null && tg.conceptData.length) ? (_.isArray(tg.conceptData)) ? tg.conceptData : JSON.parse(tg.conceptData) : []
        };
      });
    }
  }

  getExaminationData() {
    this.examinationLabelsService.getExaminationLabelById(this.exminationHeadId).subscribe(res => {
      if (res) {
        this.selectedExaminationType = res.exam_type_id;
        this.saveMasterSetting = res.save_setting ? res.save_setting : 'no_master_save';
        const obj = this.examinationLabelsService.generateExaminationData(res);
        this.selectedExaminationData = obj;
        if (this.selectedExaminationType === 1 || this.selectedExaminationType === 2) {
          this.loadExaminationTagList().subscribe();
        }
        this.getInitData();
      }
    });
  }

  loadExaminationTagList(searchString?): Observable<any> {
    const param = {
      exam_head_id: this.compInstance.selectedExaminationData.headId,
      search_keyword: searchString ? searchString : ''
    };
    return this.examinationLabelsService.getExaminationBySearchKeyword(param).pipe(map(res => {
      _.map(res, dt => {
        const tag = new ExaminationTags();
        tag.generateObject(dt);
        this.examinationTagInputSuggessgtionList.push(tag);
      });
      // console.log(this.examinationTagInputSuggessgtionList);
      // console.log(this.selectedExaminationData);
      return res;
    }));
  }

  onTagAdded(val, fromSuggestion?) {
    // if (val) {
    //   val.tagKey = (!_.isUndefined(val.value)) ? '' : val.tagKey;
    // }
    this.examinationTagInput = this.generateTagObject(this.examinationTagInput, val);
    this.getAlltypeUpdatedValue();
    if (!fromSuggestion) {
      this.openSuggestionPanel();
    }
  }

  onTagRemoved(val) {
    this.getAlltypeUpdatedValue();
    const suggestionPostData = { action: 'ADD', selectedData: val };
    this.openSuggestionPanel(suggestionPostData);
  }

  // onTagEdited(val) {
  //   this.examinationTagInput = this.generateTagObject(this.examinationTagInput, val);
  //   this.getAlltypeUpdatedValue();
  // }

  updateTagPriority(item, priority) {
    // console.log(item, priority);
    item.tagPriority = priority;
    this.getAlltypeUpdatedValue();
  }

  updateIsSaveMaster(item, isSaved) {
    item.masterSave = isSaved;
    this.getAlltypeUpdatedValue();
  }

  updateSuggesstionTextVal() {
    this.getAlltypeUpdatedValue();
  }

  updateFreeTextVal() {
    this.getAlltypeUpdatedValue();
  }

  updateTagText(item, isEdited, index) {
    const modalInstance = this.modalService.open(ExaminationLabelEditComponent, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      windowClass: 'custom-modal',
      container: '#homeComponent'
    });
    modalInstance.componentInstance.examinationData = item;
    modalInstance.result.then((result) => {
      if (result.type === 'Ok') {
        this.examinationTagInput[index] = result.data;
        this.getAlltypeUpdatedValue();
      }
    });
  }

  generateTagObject(mdlArray, tagVal) {
    const tagObj = {
      id: tagVal.id ? tagVal.id : null,
      transId: tagVal.transId ? tagVal.transId : null,
      headId: this.compInstance.selectedExaminationData.headId,
      tagKey: tagVal.id ? tagVal.tagKey : tagVal.tagKey.replace(/\s+/g, '').toLowerCase(),
      tagName: tagVal.tagName,
      tagPriority: tagVal.tagPriority ? tagVal.tagPriority : null,
      masterSave: this.saveMasterSetting === 'auto_master_save' && !tagVal.id ? true : false,
      isTagEdited: false,
      chart_detail_id: this.chartDetailId,
    };
    const tag = new ExaminationTags();
    tag.generateObject(tagObj);
    const findIndx = _.findIndex(mdlArray, dt => {
      return dt.tagKey === tagVal.tagKey;
    });
    if (!_.isUndefined(tagVal.value)) {
      const conceptDataObj = { key: tagVal.value, value: tagVal.display };
      tag.conceptData.push(conceptDataObj);
    }
    if (findIndx === -1) {
      mdlArray.push(tag);
    } else {
      mdlArray[findIndx] = tag;
    }
    return mdlArray;
  }

  getAlltypeUpdatedValue() {
    let exmData = [];
    if (this.selectedExaminationType === 2 || this.selectedExaminationType === 1) {
      _.map(this.examinationTagInput, tg => {
        const exmSave = new ExaminationSave();
        const svObj = {
          tran_id: tg.transId,
          examination_head_id: tg.headId,
          examination_text: tg.tagName,
          exam_id: tg.id,
          severity: tg.tagPriority,
          add_to_master: tg.masterSave,
          chart_detail_id: this.chartDetailId,
          conceptData: (tg.conceptData) ? JSON.stringify(tg.conceptData) : ''
        };
        exmSave.generateObject(svObj);
        exmData.push(svObj);
      });
    } else if (this.selectedExaminationType === 3 || this.selectedExaminationType === 4) {
      const exmSave = new ExaminationSave();
      const svObj = {
        tran_id: this.examinationSuggesstionOrFreeText.transId,
        examination_head_id: this.exminationHeadId,
        examination_text: this.examinationSuggesstionOrFreeText.value,
        exam_id: this.examinationSuggesstionOrFreeText.id,
        severity: null,
        add_to_master: false,
        chart_detail_id: this.chartDetailId,
        conceptData: (this.examinationSuggesstionOrFreeText.conceptData) ? JSON.stringify(this.examinationSuggesstionOrFreeText.conceptData) : ''
      };
      exmSave.generateObject(svObj);
      exmData.push(svObj);
    }
    const otherExamination = this.dynamicChartService.getChartDataByKey(this.setGetDataKey, false, null, this.chartDetailId);
    if (otherExamination && otherExamination.length) {
      exmData = exmData.concat(_.filter(otherExamination, dt => dt.examination_head_id !== this.exminationHeadId));
    }
    this.dynamicChartService.updateLocalChartData(this.setGetDataKey, exmData, 'update', this.chartDetailId);
    // console.log(exmData);
  }

  openSuggestionPanel(data?): void {
    const inputToSuggestionObj = {
      sectionKeyName: 'examination_label',
      sectionName: this.selectedExaminationData.labelName,
      action: 'UPDATE',
      selectedData: this.examinationTagInput,
      examLabelData: { headId: this.exminationHeadId },
      componentData: { chartDetailId: this.chartDetailId }
    };
    if (data) {
      inputToSuggestionObj.action = data.action;
      inputToSuggestionObj.selectedData = data.selectedData;
    }
    this.dynamicChartService.sendEventToParentChartContainer.next({ source: 'other_component', content: { prescriptionDetails: null } });
    setTimeout(() => {
      this.dynamicChartService.sendEventToSuggestion.next(inputToSuggestionObj);
    });
  }

  listenToSubjectEvents() {
    this.dynamicChartService.$getEventFrmSuggestion.subscribe(data => {
      if (data.sectionKeyName === 'examination_label' && data.selectedSuggestion.headId === this.exminationHeadId && data.componentData.chartDetailId === this.chartDetailId) {
        if (data.action === 'ADD') {
          if (this.selectedExaminationType === 2 || this.selectedExaminationType === 1) {
            this.onTagAdded(data.selectedSuggestion, 'suggestion');
          }
          if (this.selectedExaminationType === 3) {
            this.examinationSuggesstionOrFreeText = {
              id: data.selectedSuggestion.id,
              transId: null,
              value: data.selectedSuggestion.tagName
            };
          }
        }
      }
    });
  }

  openSuggPanel() {
    if (this.selectedExaminationType === 3 || this.selectedExaminationType === 4) {
      this.commonService.openSuggesstionPanelOnFixedComponentSearchCallFunction('open');
    } else {
      this.commonService.openSuggesstionPanelOnFixedComponentSearchCallFunction('close');
    }
  }

  panelChange(event: NgbPanelChangeEvent): void {
    this.isPanelOpen = event.nextState;
  }

  public requestAutocompleteItems = (text: string): Observable<any> => {
    if (text.length < 2 || this.strictKeywordEnabled) {
      return of([]);
    }
    return this.commonService.getSnowedCTData(text, this.semanticTags).pipe(map((response: any) => {
      let dataArray = [];
      if (response) {
        if (!(response.items === undefined || response.items.length === 0 || !response.items)) {
          dataArray = this.formatTerms(response);
        }
      }
      return dataArray;
      // }
    }));
  }

  formatTerms(response) {
    const collectionArr = [];
    _.forEach(response.items, (o) => {
      const collectionObj = {
        value: o.concept.conceptId,
        display: o.term
      };
      collectionArr.push(collectionObj);
    });
    return collectionArr;
  }

  updateConceptData($event) {
    // console.log($event);
  }

  processAction($event) {
    if ($event.action === 'model_changes') {
      this.openModalPopupSugg(true);
      this.examinationSuggesstionOrFreeText.value = $event.data;
      this.updateSuggesstionTextVal();
    } else if ($event.action === 'focus') {
      this.openModalPopupSugg(true);
      this.openSuggestionPanel();
    } else if ($event.action === 'snomed_item_selected') {
      this.openModalPopupSugg(true);
      if ($event.data !== undefined) {
        this.examinationSuggesstionOrFreeText.conceptData.push($event.data);
        this.updateSuggesstionTextVal();
      }
    } else if ($event.action === 'snomed_item_removed') {
      this.openModalPopupSugg(false);
      _.remove(this.examinationSuggesstionOrFreeText.conceptData, (keyword) => {
        return keyword.key === $event.data.key;
      });
      this.updateSuggesstionTextVal();
    }
  }

  openModalPopupSugg(val) {
    if (this.commonService.isTabModeOn) {
      this.commonService.openSuggesstionPanelWhenTabModeOnForComponents(val);
    }
  }

}

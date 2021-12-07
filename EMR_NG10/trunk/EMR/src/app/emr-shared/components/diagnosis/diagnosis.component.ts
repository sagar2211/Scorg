import { DynamicChartService } from './../../../dynamic-chart/dynamic-chart.service';
import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { Subject, of, Observable, concat } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import * as _ from 'lodash';
import { PublicService } from './../../../public/services/public.service';
import { DiagnosisService } from './../../../public/services/diagnosis.service';
import { takeUntil, map, catchError, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { CommonService } from 'src/app/public/services/common.service';

@Component({
  selector: 'app-diagnosis',
  templateUrl: './diagnosis.component.html',
  styleUrls: ['./diagnosis.component.scss']
})
export class DiagnosisComponent implements OnInit, OnDestroy {
  diagnosisFrm: FormGroup;
  isAdd = false;
  patientId: any;
  isHeightClass = false;
  isDisable = false;
  selectedValueFromSugList: any;
  diagnosisList: any[] = [];

  diagnosisMasterList$ = new Observable<any>();
  diagnosisMasterInput$ = new Subject<any>();
  destroy$ = new Subject();
  @Input() public componentInfo: any;
  isPanelOpen: boolean;
  chartDetailId: number;
  strictKeywordEnabled = false;
  constructor(
    private fb: FormBuilder,
    private diagnosisService: DiagnosisService,
    public publicService: PublicService,
    private route: ActivatedRoute,
    private dynamicChartService: DynamicChartService,
    private commonService: CommonService,
  ) { }

  ngOnInit() {
    this.chartDetailId = this.componentInfo.chart_detail_id;
    this.strictKeywordEnabled = this.componentInfo.editable_suggestion;
    this.patientId = this.route.snapshot.paramMap.get('patientId');
    this.isHeightClass = this.route.snapshot.data.isRoute ? true : false;
    this.isDisable = false;
    this.isPanelOpen = (this.componentInfo.activeIdsOfPanels as Array<any>).indexOf('diagnosis') !== -1 ? true : false;
    this.loadDiagnosisMasterList();
    this.createForm();
    this.getDiagnosisInitialData();
    this.subcriptionOfEvents();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  createForm() {
    this.diagnosisFrm = this.fb.group({
      diagnosisListArray: this.fb.array([])
    });
  }

  patchDefaultValue(): void {
    const icdCode = (this.strictKeywordEnabled) ? null : '';
    const diagnosisId = (this.strictKeywordEnabled) ? null : 0;
    this.diagnosisListArray.push(this.fb.group({
      tran_id: [0],
      diagnosis_id: [diagnosisId],
      diagnosis: [null, Validators.required],
      icd_code: [icdCode],
      remark: [null],
      diagnosisObj: [null],
      isPrimary: [false],
      chart_detail_id: [this.chartDetailId],
      conceptData: [[]]
    }));
  }

  // -- get formArray name from template form group
  get diagnosisListArray() {
    return this.diagnosisFrm.get('diagnosisListArray') as FormArray;
  }

  // -- add data into diagnosis array form
  addDiagnosis(rowData): void {
    this.isAdd = true;
    if (rowData.valid) {
      this.openModalPopupSugg(true);
      this.isAdd = false;
      this.patchDefaultValue();
    }
  }

  // -- delete row from form array
  deleteDiagnosis(indx, item): void {
    this.diagnosisListArray.removeAt(indx);
    this.openModalPopupSugg(false);
    if (this.diagnosisListArray.controls.length <= 0) {
      this.patchDefaultValue();
    }
    this.setPrimaryDiagnosis();
    this.openSuggestionPanel('ADD', item.value);
  }

  onClickSetPrimaryDiagnosis(diagnosis, index): void {
    const isPrimary = (this.diagnosisListArray.value[index].isPrimary === true) ? false : true;
    this.setPrimaryDiagnosis();
  }

  setPrimaryDiagnosis(): void {
    const isExistPrimaryObject = _.filter(this.diagnosisListArray.value, (o) => {
      return (o.isPrimary === 1 || o.isPrimary === true) && o.diagnosis_id !== null;
    });
    if (this.diagnosisListArray.value.length > 0 && isExistPrimaryObject.length === 0) {  // first Diagnosis default set primary
      this.diagnosisListArray.at(0).patchValue({ isPrimary: true });
    }
  }

  getDiagnosisInitialData() {
    this.dynamicChartService.getChartDataByKey('diagnosis_detail', true, null, this.chartDetailId).pipe(takeUntil(this.destroy$)).subscribe((result: any) => {
      if ((_.isArray(result) && !result.length) || result === null) {
        this.patchDefaultValue();
        this.setPrimaryDiagnosis();
      } else {
        _.map(result, (x) => {
          this.updateInitialValue(x);
        });
      }
    });
  }

  updateInitialValue(x): void {
    const diagnosisName = (x.diagnosis || x.name);
    const diagnosisId = (x.diagnosis_id || x.id);
    const diagnosisObj = { value: diagnosisId, label: diagnosisName };

    let conceptDataArray = [];
    if (!_.isUndefined(x.conceptData) && x.conceptData !== null) {
      if (x.conceptData.length) {
        conceptDataArray = JSON.parse(x.conceptData);
      }
    }

    this.diagnosisListArray.push(this.fb.group({
      tran_id: [x.tran_id],
      diagnosis_id: [diagnosisId.toString(), Validators.required],
      diagnosis: [diagnosisName, Validators.required],
      icd_code: [x.icd_code],
      remark: [x.remark],
      diagnosisObj: [diagnosisObj],
      isPrimary: [x.isPrimary],
      chart_detail_id: [this.chartDetailId],
      conceptData: [conceptDataArray]
    }));

    if (this.diagnosisListArray.length > 1) {
      const indx = _.findIndex(this.diagnosisListArray.value, (cs: any) => (cs.diagnosisObj === null || cs.diagnosisObj === ''));
      if (indx !== -1) {
        this.diagnosisListArray.removeAt(indx);
      }
    }
    this.setPrimaryDiagnosis();
  }

  menuClicked(event) {
    this.isPanelOpen = event.nextState;
    // this.openModalPopupSugg(true);
    this.openSuggestionPanel();
    this.commonService.openSuggesstionPanelOnFixedComponentSearchCallFunction('open');
  }

  subcriptionOfEvents() {
    this.diagnosisFrm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((x) => {
      const dList = [...x.diagnosisListArray];
      if (dList.length > 1) {
        _.map(dList, (o) => {
          if (o.diagnosis !== '' && o.diagnosis !== null) {
            o.diagnosis_id = (o.diagnosis_id === null) ? 0 : o.diagnosis_id;
            if ((o.diagnosisObj === null || o.diagnosisObj === '')) {
              const diagnosisObj = { value: o.diagnosis_id, label: o.diagnosis };
              o.diagnosisObj = diagnosisObj;
            }
          }
        });
        const indx = _.findIndex(dList, (cs: any) => (cs.diagnosisObj === null || cs.diagnosisObj === ''));
        if (indx !== -1) {
          dList.splice(indx, 1);
        }
      }
      const cloneddList = _.cloneDeep(_.map(dList, d => {
        d.isPrimary = d.isPrimary ? d.isPrimary : false;
        return d;
      }));

      _.map(cloneddList, (o) => {
        o.conceptData = o.conceptData ? JSON.stringify(o.conceptData) : o.conceptData;
      });
      this.dynamicChartService.updateLocalChartData('diagnosis_detail', cloneddList, 'update', this.chartDetailId);
      this.openSuggestionPanel();
    });

    this.dynamicChartService.$getEventFrmSuggestion.subscribe(data => {
      if (data.sectionKeyName === 'diagnosis' && data.componentData.chartDetailId === this.chartDetailId) {
        if (data.action === 'ADD') {
          this.updateInitialValue(data.selectedSuggestion);
          // this.updateInitialValue(data.selectedSuggestion);
        } else if (data.action === 'DELETE') {
          this.diagnosisListArray.removeAt(data.selectedSuggestion);
          if (this.diagnosisListArray.controls.length <= 0) { this.patchDefaultValue(); }
        }
      }
    });
  }

  openSuggestionPanel(action?: string, data?: any): void {
    this.dynamicChartService.sendEventToParentChartContainer.next({ source: 'other_component', content: { prescriptionDetails: null } });
    setTimeout(() => {
      this.dynamicChartService.sendEventToSuggestion.next({
        sectionKeyName: 'diagnosis',
        action: action ? action : 'UPDATE',
        selectedData: action ? data : this.diagnosisListArray.value,
        componentData: { chartDetailId: this.chartDetailId }
      });
    });
  }

  // -- select complaints type
  selectItem(e, item) {
    item.patchValue({
      diagnosis_id: e ? e.value : '',
      diagnosis: e ? e.label : '',
    });
    this.openSuggestionPanel();
  }

  getAllDiagnosisListBySearch(searchKey?): Observable<any[]> {
    searchKey = searchKey ? searchKey : '';
    if (searchKey.length && searchKey.length <= 2) {
      return of(this.diagnosisList);
    }
    const param = {
      search_keyword: searchKey ? searchKey : '',
    };
    return this.diagnosisService.getDiagnosisListBySearchKeyword(param).pipe(map((res: any) => {
      this.diagnosisList = [];
      if (res.data.length > 0) {
        res.data.forEach(element => {
          this.diagnosisList.push({
            value: element.id, label: element.name
          });
        });
      }
      return this.diagnosisList;
    }));
  }

  openSuggestionPanelForSearch(search): void {
    this.openModalPopupSugg(true);
    this.dynamicChartService.sendEventToSuggestion.next({
      sectionKeyName: 'diagnosis',
      action: 'SEARCH',
      selectedData: search,
      componentData: { chartDetailId: this.chartDetailId }
    });
  }

  private loadDiagnosisMasterList(searchTxt?) {
    this.diagnosisMasterList$ = concat(
      this.getAllDiagnosisListBySearch(searchTxt),
      // default items
      this.diagnosisMasterInput$.pipe(
        distinctUntilChanged(),
        switchMap(term => this.getAllDiagnosisListBySearch(term).pipe(
          catchError(() => of([])) // empty list on error
        ))
      )
    );
  }

  processAction($event, item) {
    if ($event.action === 'model_changes') {
      item.patchValue({ diagnosis: $event.data });
      this.openModalPopupSugg(true);
      this.openSuggestionPanel();
      this.openSuggestionPanelForSearch($event.data);
    } else if ($event.action === 'keyup') {
      this.openModalPopupSugg(true);
      this.openSuggestionPanel();
      this.openSuggestionPanelForSearch(item.value.diagnosis);
    } else if ($event.action === 'focus') {
      this.openModalPopupSugg(true);
      this.openSuggestionPanel();
    } else if ($event.action === 'snomed_item_selected') {
      if ($event.data !== undefined) {
        this.openModalPopupSugg(true);
        const prevConceptData = item.value.conceptData;
        prevConceptData.push($event.data);
        item.patchValue({ conceptData: prevConceptData });
      }
    } else if ($event.action === 'snomed_item_removed') {
      this.openModalPopupSugg(false);
      const prevConceptData = item.value.conceptData;
      _.remove(prevConceptData, (keyword) => {
        return keyword.key === $event.data.key;
      });
      item.patchValue({ conceptData: prevConceptData });
    }
  }

  openModalPopupSugg(val) {
    if (this.commonService.isTabModeOn) {
      this.commonService.openSuggesstionPanelWhenTabModeOnForComponents(val);
    }
  }

}


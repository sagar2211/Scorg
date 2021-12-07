import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import { Subject, Observable, of, concat } from 'rxjs';
import * as _ from 'lodash';
import { takeUntil, map, distinctUntilChanged, tap, switchMap, catchError } from 'rxjs/operators';
import { ComplaintsService } from './../../../public/services/complaints.service';
import { DynamicChartService } from './../../../dynamic-chart/dynamic-chart.service';
import { CommonService } from 'src/app/public/services/common.service';

@Component({
  selector: 'app-complaints',
  templateUrl: './complaints.component.html',
  styleUrls: ['./complaints.component.scss']
})
export class ComplaintsComponent implements OnInit, OnDestroy {
  pattern = '^[0-9]*$';
  complaintFrm: FormGroup;
  isAdd = false;
  complaintList: any[] = [];

  complaintTypeList$ = new Observable<any>();
  complaintTypeInput$ = new Subject<string>();
  destroy$: Subject<boolean> = new Subject<boolean>();
  @Input() public componentInfo: any;
  isPanelOpen: boolean;
  chartDetailId: number;
  strictKeywordEnabled = false;
  constructor(
    private fb: FormBuilder,
    private complaintService: ComplaintsService,
    private dynamicChartService: DynamicChartService,
    private commonService: CommonService,
  ) { }

  ngOnInit() {
    this.chartDetailId = this.componentInfo.chart_detail_id;
    this.strictKeywordEnabled = this.componentInfo.editable_suggestion;
    this.loadCompliantTypeList();
    this.createForm();
    this.getInitialData();
    this.subcriptionOfEvents();
    this.isPanelOpen = (this.componentInfo.activeIdsOfPanels as Array<any>).indexOf('complaints') !== -1 ? true : false;
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  createForm() {
    this.complaintFrm = this.fb.group({
      complaints: this.fb.array([])
    });
  }

  get complaints() {
    return this.complaintFrm.get('complaints') as FormArray;
  }

  // -- select complaints type
  selectComplaint(e, item) {
    item.patchValue({
      complaint_id: e ? e.value : '',
      complaint_name: e ? e.label : '',
    });
    this.openSuggestionPanel();
  }

  // -- patch the default values to formArray
  patchDefaultValue(): void {
    this.complaints.push(this.fb.group({
      tran_id: [0],
      complaintObj: [null],
      complaint_name: [null, Validators.required],
      complaint_id: [null],
      day: [null, Validators.pattern(this.pattern)],
      month: [null, Validators.pattern(this.pattern)],
      year: [null, Validators.pattern(this.pattern)],
      chart_detail_id: [this.chartDetailId],
      conceptData: [[]]
    }));
  }

  // -- update form value using array objects
  updateFormValue(obj: any): any {
    const complaintName = (obj.complaint_name || obj.complaintName || obj.name);
    const complaintId = (obj.complaint_id || obj.id.toString());
    const complaintObj = { value: complaintId, label: complaintName };

    let conceptDataArray = [];
    if (!_.isUndefined(obj.conceptData) && obj.conceptData !== null) {
      if (obj.conceptData.length) {
        conceptDataArray = JSON.parse(obj.conceptData);
      }
    }
    this.complaints.push(this.fb.group({
      tran_id: [obj.tran_id],
      complaintObj: [complaintObj],
      complaint_name: [complaintName, Validators.required],
      complaint_id: [complaintId, Validators.required],
      day: [obj.day, Validators.pattern(this.pattern)],
      month: [obj.month, Validators.pattern(this.pattern)],
      year: [obj.year, Validators.pattern(this.pattern)],
      chart_detail_id: [this.chartDetailId],
      conceptData: [conceptDataArray]
    }));

    if (this.complaints.length > 1) {
      const indx = _.findIndex(this.complaints.value, (cs: any) => (cs.complaintObj === null || cs.complaintObj === ''));
      if (indx !== -1) {
        this.complaints.removeAt(indx);
      }
    }
  }

  // -- get complaints types data
  getInitialData() {
    this.dynamicChartService.getChartDataByKey('complaint_detail', true, null, this.chartDetailId).pipe(takeUntil(this.destroy$)).subscribe((result: any) => {
      if ((_.isArray(result) && !result.length) || result === null) {
        this.patchDefaultValue();
      } else {
        _.map(result, (x) => {
          this.updateFormValue(x);
        });
      }
    });
  }

  // -- get all complaint List
  getAllComplaints(searchKey, openSugg?): Observable<any[]> {
    searchKey = searchKey ? searchKey : '';
    if (searchKey.length && searchKey.length <= 2) {
      return of(this.complaintList);
    }
    if (_.isUndefined(openSugg)) {
      this.openSuggestionPanelForSearch(searchKey);
    }
    return this.complaintService.getAllComplaintListsBySearchKey(searchKey).pipe(map((res: any) => {
      this.complaintList = [];
      _.map(res, (val, index) => {
        this.complaintList.push({
          value: val.id, label: val.complaintName
        });
        // const icomplaintsMasterList = new IcomplaintsMasterList();
        // icomplaintsMasterList.generateObject(val);
        // this.complaintList.push(icomplaintsMasterList);
      });
      return this.complaintList;
    })
    );
  }

  // -- add complaints
  addComplaints(row): void {
    this.isAdd = true;
    if (row.valid) {
      this.openModalPopupSugg(true);
      this.isAdd = false;
      this.patchDefaultValue();
    }
  }

  // -- delete rows/complaints
  removeComplaints(item: FormGroup, index): void {
    this.complaints.removeAt(index);
    if (this.complaints.controls.length <= 0) {
      this.patchDefaultValue();
    }
    this.openModalPopupSugg(false);
    this.openSuggestionPanel('ADD', item.value);
  }

  menuClicked(event) {
    this.isPanelOpen = event.nextState;
    this.openSuggestionPanel();
    this.commonService.openSuggesstionPanelOnFixedComponentSearchCallFunction('open');
  }

  subcriptionOfEvents() {
    this.dynamicChartService.$getEventFrmSuggestion.subscribe(data => {
      if (data.sectionKeyName === 'complaints' && data.componentData.chartDetailId === this.chartDetailId) {
        if (data.action === 'ADD') {
          // this.loadCompliantTypeList(data.selectedSuggestion.complaintName)
          this.updateFormValue(data.selectedSuggestion);
        } else if (data.action === 'DELETE') {
          this.complaints.removeAt(data.selectedSuggestion);
          if (this.complaints.controls.length <= 0) { this.patchDefaultValue(); }
        }
      }
    });

    // -- update local data
    this.complaintFrm.valueChanges.subscribe((form: any) => {
      const cList = [...form.complaints];
      if (cList.length > 1) {
        _.map(cList, (o) => {
          if (o.complaint_name !== '' && o.complaint_name !== null) {
            if ((o.complaintObj === null || o.complaintObj === '')) {
              const complaintObj = { value: o.complaint_id, label: o.complaint_name };
              o.complaintObj = complaintObj;
            }
          }
        });
        const indx = _.findIndex(cList, (cs: any) => (cs.complaintObj === null || cs.complaintObj === ''));
        if (indx !== -1) {
          cList.splice(indx, 1);
        }
      }
      const clonedcList = _.cloneDeep(cList);
      _.map(clonedcList, (o) => {
        o.conceptData = JSON.stringify(o.conceptData);
      });
      this.dynamicChartService.updateLocalChartData('complaint_detail', clonedcList, 'update', this.chartDetailId);
      this.openSuggestionPanel();
    });
  }

  openSuggestionPanel(action?, values?): void {
    this.dynamicChartService.sendEventToParentChartContainer.next({ source: 'other_component', content: { prescriptionDetails: null } });
    setTimeout(() => {
      this.dynamicChartService.sendEventToSuggestion.next({
        sectionKeyName: 'complaints',
        action: action ? action : 'UPDATE',
        selectedData: action ? values : this.complaints.value,
        componentData: { chartDetailId: this.chartDetailId }
      });
    });
  }

  openSuggestionPanelForSearch(search): void {
    this.openModalPopupSugg(true);
    this.dynamicChartService.sendEventToSuggestion.next({
      sectionKeyName: 'complaints',
      action: 'SEARCH',
      selectedData: search,
      componentData: { chartDetailId: this.chartDetailId }
    });
  }

  // --
  private loadCompliantTypeList(searchTxt?) {
    // const test$ = new Subject<any>();
    this.complaintTypeList$ = concat(
      this.getAllComplaints(searchTxt, false),
      // default items
      this.complaintTypeInput$.pipe(
        distinctUntilChanged(),
        switchMap(term => this.getAllComplaints(term).pipe(
          catchError(() => of([])) // empty list on error
        ))
      )
    );
  }

  processAction($event, item) {
    if ($event.action === 'model_changes') {
      this.openModalPopupSugg(true);
      item.patchValue({ complaint_name: $event.data });
      this.openSuggestionPanelForSearch($event.data);
    } else if ($event.action === 'keyup') {
      this.openModalPopupSugg(true);
      this.openSuggestionPanelForSearch(item.value.complaint_name);
    } else if ($event.action === 'focus') {
      this.openModalPopupSugg(true);
      this.openSuggestionPanel();
    } else if ($event.action === 'snomed_item_selected') {
      this.openModalPopupSugg(true);
      if ($event.data !== undefined) {
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

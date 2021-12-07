import { Component, OnInit, EventEmitter, Output, Input, OnChanges } from '@angular/core';
import { concat, Observable, of, Subject } from 'rxjs';
import * as _ from 'lodash';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { catchError, debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { NursingReportService } from '../../../public/services/nursing-report.service';

@Component({
  selector: 'app-iv-fluid-feed',
  templateUrl: './iv-fluid-feed.component.html',
  styleUrls: ['./iv-fluid-feed.component.scss']
})
export class IvFluidFeedComponent implements OnInit, OnChanges {
  @Output() selectedFluidFeedValueObj = new EventEmitter<any>();
  @Input() disableFluidFeed;
  @Input() searchStringEdit;
  @Input() setValue;
  @Input() loadType;
  valueList: [] = [];
  loadForm: boolean;
  isNgSelectTypeHeadDisabled: boolean;
  fluidFeedForm: FormGroup;
  feedList$ = new Observable<any>();
  feedListInput$ = new Subject<any>();
  compInstance = this;
  constructor(
    private fb: FormBuilder,
    private nursingReportService: NursingReportService,
  ) { }

  ngOnInit() {
    this.loadForm = false;
    this.generateDataForForm();
    this.getAllDataList().subscribe();
  }

  ngOnChanges() {
    this.generateDataForForm();
  }

  generateDataForForm() {
    if (this.disableFluidFeed) {
      this.isNgSelectTypeHeadDisabled = true;
    } else {
      this.isNgSelectTypeHeadDisabled = false;
    }
    if (!this.loadForm) {
      this.createForm();
    } else {
      this.fluidFeedForm.patchValue({ fluidFeedVal: this.setValue });
    }

  }

  getAllDataList(searchKey?): Observable<any> {
    return this.compInstance.nursingReportService
      .getAllFluidChartOptionData(this.compInstance.loadType)
      .pipe(map(resultList => {
        this.compInstance.valueList = [];
        if (this.compInstance.loadType === 'fluid') {
          this.compInstance.valueList = resultList;
        } else if (this.compInstance.loadType === 'feed') {
          this.compInstance.valueList = resultList;
        }
        return this.compInstance.valueList;
      }));
  }

  createForm() {
    this.patchDefaultValue();
  }

  patchDefaultValue() {
    const basicForm = {
      fluidFeedVal: [null, Validators.required],
    };
    if (!_.isEmpty(this.setValue)) {
      basicForm['fluidFeedVal'] = [this.setValue, Validators.required];
    }
    this.fluidFeedForm = this.fb.group(basicForm);
    this.loadForm = true;
  }

  selectValue(e) {
    if (e) {
      this.selectedFluidFeedValueObj.emit(this.fluidFeedForm.value.fluidFeedVal);
    }
    // if (e === '') {
    //   this.fluidFeedForm.controls.fluidFeedVal.patchValue(null);
    //   return;
    // }
    // const isTrue = typeof e === 'object';
    // if (isTrue) {
    //   this.fluidFeedForm.controls.fluidFeedVal.patchValue({
    //     type: isTrue ? e.type : this.loadType,
    //     name: isTrue ? e.name : e,
    //     id: isTrue ? e.id : e
    //   });
    //   this.selectedFluidFeedValueObj.emit(e);
    // } else {
    //   this.fluidFeedForm.controls.fluidFeedVal.patchValue(null);
    //   this.selectedFluidFeedValueObj.emit(null);
    // }
  }


}

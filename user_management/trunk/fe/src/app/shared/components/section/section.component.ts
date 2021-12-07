import { Component, OnInit, Output, EventEmitter, Input, OnChanges } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import * as _ from 'lodash';
import { environment } from 'src/environments/environment';
import { RoomMasterService } from 'src/app/modules/qms/services/room-master.service';
import { Section } from 'src/app/modules/qms/models/section.model';

@Component({
  selector: 'app-section',
  templateUrl: './section.component.html',
  styleUrls: ['./section.component.scss']
})
export class SectionComponent implements OnInit, OnChanges {
  @Output() selectedSectionValueObj = new EventEmitter<any>();
  @Input() disableSection;
  @Input() searchStringEdit;
  @Input() setValue;
  @Input() isValChanged;
  valueList: [] = [];
  loadForm: boolean;
  isNgSelectTypeHeadDisabled: boolean;
  sectionForm: FormGroup;
  compInstance = this;
  sectionList: Section[] = [];
  constructor(
    private roomMasterService: RoomMasterService,
    private fb: FormBuilder,
  ) { }

  ngOnInit() {
    this.loadForm = false;
    this.generateDataForForm();
  }

  ngOnChanges() {
    this.generateDataForForm();
  }

  generateDataForForm() {
    if (this.disableSection) {
      this.isNgSelectTypeHeadDisabled = true;
    } else {
      this.isNgSelectTypeHeadDisabled = false;
    }
    if (_.isEmpty(this.sectionForm)) {
      this.createForm();
    } else {
      this.sectionForm.patchValue({ sectionVal: this.setValue });
    }

  }

  getAllSectionList(searchKey?): Observable<any> {
    const params = {
      limit: environment.limitDataToGetFromServer,
      search_text: searchKey ? searchKey : null,
    };
    if (!_.isEmpty(this.compInstance.searchStringEdit) && !searchKey) {
      params.search_text = this.compInstance.searchStringEdit;
    }
    return this.compInstance.roomMasterService.getAllSectionMaster(params).pipe(map(res => {
      this.sectionList = [];
      if (res.length > 0) {
        this.sectionList = res;
        _.map(this.sectionList, (v) => {
          v.remark = null;
        });
      }
      return this.sectionList;
    }));
  }

  createForm() {
    this.patchDefaultValue();
  }

  patchDefaultValue() {
    const basicForm = {
      sectionVal: _.isEmpty(this.setValue) ? null : this.setValue,
    };
    this.sectionForm = this.fb.group(basicForm);
    this.loadForm = true;
  }

  selectValue(e) {
    if (e === '') {
      return;
    }
    const isTrue = typeof e === 'object';
    if (isTrue) {
      this.sectionForm.patchValue({ sectionVal: e });
      this.selectedSectionValueObj.emit(e);
    } else {
      this.sectionForm.patchValue({ sectionVal: null });
      this.selectedSectionValueObj.emit(null);
    }
  }

}

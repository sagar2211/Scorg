import { Component, OnInit, OnChanges, EventEmitter, Output, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MappingService } from './../../public/services/mapping.service';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';
import * as _ from 'lodash';

@Component({
  selector: 'speciality',
  templateUrl: './speciality.component.html',
  styleUrls: ['./speciality.component.scss']
})
export class SpecialityComponent implements OnInit, OnChanges {
  @Output() selectedSpecilityValueObj = new EventEmitter<any>();
  @Input() disableSpeciality;
  @Input() searchStringEdit;
  @Input() setValue;
  valueList: [] = [];
  loadForm: boolean;
  isNgSelectTypeHeadDisabled: boolean;
  specialityForm: FormGroup;
  compInstance = this;
  constructor(
    private fb: FormBuilder,
    private mappingService: MappingService,
  ) { }

  ngOnInit() {
    this.loadForm = false;
    this.generateDataForForm();
  }

  ngOnChanges() {
    this.generateDataForForm();
  }

  getAllSpecialityList(searchKey?): Observable<any> {
    if (!_.isEmpty(this.compInstance.specialityForm.controls.specialityVal.value
      && this.compInstance.valueList.length > 0)) {
      return of([]);
    }
    const param = {
      search_string: searchKey ? searchKey : null,
      page_number: 1,
      limit: environment.limitDataToGetFromServer
    };
    return this.compInstance.mappingService.getSpecialityList(param).pipe(map(res => {
      this.valueList = [];
      if (res.length > 0) {
        this.valueList = res;
      }
      return this.valueList;
    }));
  }

  generateDataForForm() {
    if (this.disableSpeciality) {
      this.isNgSelectTypeHeadDisabled = true;
    } else {
      this.isNgSelectTypeHeadDisabled = false;
    }
    if (!this.loadForm) {
      this.createForm();
    } else {
      this.specialityForm.patchValue({ specialityVal: this.setValue });
    }
  }

  createForm() {
    this.patchDefaultValue();
  }

  patchDefaultValue() {
    const basicForm = {
      specialityVal: [null, Validators.required],
    };
    this.specialityForm = this.fb.group(basicForm);
    this.loadForm = true;
    if (!_.isEmpty(this.setValue)) {
      this.specialityForm.patchValue({ specialityVal: this.setValue });
    }
  }

  selectValue(e) {
    if (e === '') {
      return;
    }
    const isTrue = typeof e === 'object';
    if (isTrue) {
      this.specialityForm.controls.specialityVal.patchValue({
        id: isTrue ? e.id : '',
        name: isTrue ? e.name : e,
      });
      this.selectedSpecilityValueObj.emit(e);
    } else {
      this.specialityForm.controls.specialityVal.patchValue(null);
      this.selectedSpecilityValueObj.emit(null);
    }
  }

}

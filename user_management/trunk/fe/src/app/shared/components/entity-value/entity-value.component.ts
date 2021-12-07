import { Component, OnInit, Output, EventEmitter, Input, OnChanges } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { EntityBasicInfoService } from 'src/app/modules/schedule/services/entity-basic-info.service';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import * as _ from 'lodash';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-entity-value',
  templateUrl: './entity-value.component.html',
  styleUrls: ['./entity-value.component.scss']
})
export class EntityValueComponent implements OnInit, OnChanges {
  @Output() selectedEntityValueObj = new EventEmitter<any>();
  @Input() disableEntity;
  @Input() selectedEntity;
  @Input() selectedSpeciality;
  @Input() searchStringEdit;
  @Input() setValue;
  valueList: [] = [];
  loadForm: boolean;
  isNgSelectTypeHeadDisabled: boolean;
  entityForm: FormGroup;
  compInstance = this;
  constructor(
    private entityBasicInfoService: EntityBasicInfoService,
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
    if (this.disableEntity) {
      this.isNgSelectTypeHeadDisabled = true;
    } else {
      this.isNgSelectTypeHeadDisabled = false;
    }
    if (!this.loadForm) {
      this.createForm();
    } else {
      this.entityForm.patchValue({ entityVal: this.setValue });
    }

  }

  getAllEntityValueList(searchKey?): Observable<any> {
    if (_.isEmpty(this.compInstance.selectedEntity)) {
      return of([]);
    }
    const params = {
      limit: environment.limitDataToGetFromServer,
      search_text: searchKey ? searchKey : '',
      id: this.compInstance.selectedEntity['id'],
      key: this.compInstance.selectedEntity['key'],
      specialityId: _.isEmpty(this.compInstance.selectedSpeciality) ? null : this.compInstance.selectedSpeciality.id
    };
    if (!_.isEmpty(this.compInstance.searchStringEdit) && !searchKey) {
      params.search_text = this.compInstance.searchStringEdit;
    }
    return this.compInstance.entityBasicInfoService.getAllServiceProviderList(params).pipe(map(res => {
      this.valueList = [];
      if (res.length > 0) {
        this.valueList = res;
      }
      return this.valueList;
    }));
  }

  createForm() {
    this.patchDefaultValue();
  }

  patchDefaultValue() {
    const basicForm = {
      entityVal: [null, Validators.required],
    };
    if (!_.isEmpty(this.setValue)) {
      basicForm['entityVal'] = [this.setValue, Validators.required];
    }
    this.entityForm = this.fb.group(basicForm);
    this.loadForm = true;
  }

  selectValue(e) {
    if (e === '') {
      return;
    }
    const isTrue = typeof e === 'object';
    if (isTrue) {
      this.entityForm.controls.entityVal.patchValue({
        id: isTrue ? e.id : '',
        name: isTrue ? e.name : e,
        key: isTrue ? e.key : e,
      });
      this.selectedEntityValueObj.emit(e);
    } else {
      this.entityForm.controls.entityVal.patchValue(null);
      this.selectedEntityValueObj.emit(null);
    }
  }

}

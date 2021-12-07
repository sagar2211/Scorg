import { Component, OnInit, Output, EventEmitter, Input, OnChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable, of } from 'rxjs';
import * as _ from 'lodash';
import { MappingService } from './../../../public/services/mapping.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-service-type-select',
  templateUrl: './service-type-select.component.html',
  styleUrls: ['./service-type-select.component.scss']
})
export class ServiceTypeSelectComponent implements OnInit, OnChanges {
  @Output() selectedserviceTypeValueObj = new EventEmitter<any>();
  @Input() disableServiceType;
  @Input() setValue;
  valueList: [] = [];
  loadForm: boolean;
  isNgSelectTypeHeadDisabled: boolean;
  serviceTypeForm: FormGroup;
  compInstance = this;

  constructor(
    private fb: FormBuilder,
    private mappingService: MappingService,
  ) { }

  ngOnInit(): void {
    this.loadForm = false;
    this.generateDataForForm();
  }

  ngOnChanges() {
    this.generateDataForForm();
  }

  getAllServiceTypeList(searchKey?): Observable<any> {
    if (!_.isEmpty(this.compInstance.serviceTypeForm.controls.serviceTypeVal.value)
    && this.compInstance.valueList.length > 0) {
      return of([]);
    }
    return this.compInstance.mappingService.getServiceTypeList().pipe(map((res: any) => {
      this.valueList = [];
      if (res.length > 0) {
        this.valueList = res;
      }
      return this.valueList;
    }));
  }

  generateDataForForm() {
    if (this.disableServiceType) {
      this.isNgSelectTypeHeadDisabled = true;
    } else {
      this.isNgSelectTypeHeadDisabled = false;
    }
    if (!this.loadForm) {
      this.createForm();
    } else {
      this.serviceTypeForm.patchValue({ serviceTypeVal: this.setValue });
    }
  }

  createForm() {
    this.patchDefaultValue();
  }

  patchDefaultValue() {
    const basicForm = {
      serviceTypeVal: [null, Validators.required],
    };
    this.serviceTypeForm = this.fb.group(basicForm);
    this.loadForm = true;
    if (!_.isEmpty(this.setValue)) {
      this.serviceTypeForm.patchValue({ serviceTypeVal: this.setValue });
    }
  }

  selectValue(e) {
    if (e === '') {
      return;
    }
    const isTrue = typeof e === 'object';
    if (isTrue) {
      this.serviceTypeForm.controls.serviceTypeVal.patchValue({
        id: isTrue ? e.id : '',
        name: isTrue ? e.name : e,
      });
      this.selectedserviceTypeValueObj.emit(e);
    } else {
      this.serviceTypeForm.controls.serviceTypeVal.patchValue(null);
      this.selectedserviceTypeValueObj.emit(null);
    }
  }

}

import { Component, OnInit, Output, EventEmitter, Input, OnChanges } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EntityBasicInfoService } from 'src/app/modules/schedule/services/entity-basic-info.service';
import { Entity } from 'src/app/modules/schedule/models/entity.model';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import * as _ from 'lodash';

@Component({
  selector: 'app-entity',
  templateUrl: './entity.component.html',
  styleUrls: ['./entity.component.scss']
})
export class EntityComponent implements OnInit, OnChanges {
  @Output() selectedEntityObj = new EventEmitter<any>();
  @Input() disableEntity;
  @Input() setEntity;
  entityList: Entity[] = [];
  loadForm: boolean;
  isNgSelectTypeHeadDisabled: boolean;
  entityForm: FormGroup;
  constructor(
    private entityBasicInfoService: EntityBasicInfoService,
    private fb: FormBuilder,
  ) { }

  ngOnInit() {
    this.getAllEntityList().subscribe();
    this.loadForm = false;
    if (this.disableEntity) {
      this.isNgSelectTypeHeadDisabled = true;
    } else {
      this.isNgSelectTypeHeadDisabled = false;
    }
    this.createForm();
  }

  ngOnChanges() {
    if (this.disableEntity) {
      this.isNgSelectTypeHeadDisabled = true;
    } else {
      this.isNgSelectTypeHeadDisabled = false;
    }
  }

  createForm() {
    this.patchDefaultValue();
  }

  patchDefaultValue() {
    const basicForm = {
      selectedEntity: [null, Validators.required],
    };
    if (!_.isEmpty(this.setEntity)) {
      basicForm['selectedEntity'] = [this.setEntity, Validators.required];
    }
    this.entityForm = this.fb.group(basicForm);
    this.loadForm = true;
  }

  getAllEntityList(): Observable<any> {
    return this.entityBasicInfoService.getAllEntityList().pipe(map(res => {
      if (res.length > 0) {
        this.entityList = res;
      }
      return this.entityList;
    }));
  }

  selectEntity(e) {
    if (e === '') {
      return;
    }
    const isTrue = typeof e === 'object';
    if (isTrue) {
      this.entityForm.controls.selectedEntity.patchValue({
        id: isTrue ? e.id : '',
        name: isTrue ? e.name : e,
        key: isTrue ? e.key : e,
      });
      this.selectedEntityObj.emit(e);
    } else {
      this.entityForm.controls.selectedEntity.patchValue(null);
      this.selectedEntityObj.emit(null);
    }
  }

}

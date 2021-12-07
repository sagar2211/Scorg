import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable, of, concat, Subject } from 'rxjs';
import * as _ from 'lodash';
import { map, distinctUntilChanged, tap, switchMap, catchError } from 'rxjs/operators';
import { EMRService } from './../../../public/services/emr-service';
import { MappingService } from './../../../public/services/mapping.service';

@Component({
  selector: 'app-add-update-mapping-popup',
  templateUrl: './add-update-mapping-popup.component.html',
  styleUrls: ['./add-update-mapping-popup.component.scss'],
  providers: [EMRService]
})
export class AddUpdateMappingPopupComponent implements OnInit {
  compInstance = this;
  mapingForm: FormGroup;

  minFromMinDate = new Date();
  formLoading = false;
  fromList$ = new Observable<any>();
  fromListInput$ = new Subject<string>();
  toListInput$ = new Subject<string>();
  toLoading = false;
  toList$ = new Observable<any>();
  // mappingFromKey rmo,doctor,nurse (user) ,dept,speciality,ward
  @Input() mappingFromObj: { mappingFromKey: '', label: '', placeholder: '', isMultipleSeletion: false };
  @Input() mappingToObj: { mappingToKey: '', label: '', placeholder: '', isMultipleSeletion: false };
  @Input() addEditObj: any;
  @Input() isDateRequire: boolean = true;
  @Output() saveObject: EventEmitter<any> = new EventEmitter();
  constructor(
    public modal: NgbActiveModal,
    public fb: FormBuilder,
    private emrServices: EMRService,
    private mappingServ: MappingService
  ) { }

  ngOnInit() {
    this.defaultForm();
    this.loadFromList();
    this.loadToList();
    if (this.addEditObj.data) {
      this.mapingForm.patchValue({
        mapId: this.addEditObj.data.mapId ? this.addEditObj.data.mapId : 0,
        mapFrom: this.addEditObj.data.mapFrom,
        mapTo: this.addEditObj.data.mapTo,
        mapFromDate: new Date(this.addEditObj.data.mapFromDate),
        mapToDate: new Date(this.addEditObj.data.mapToDate),
      });
    }
  }

  private loadFromList(searchTxt?) {
    this.fromList$ = concat(
      this.getMapppingList(this.mappingFromObj.mappingFromKey, searchTxt), // default items
      this.fromListInput$.pipe(
        distinctUntilChanged(),
        tap(() => this.formLoading = true),
        switchMap(term => this.getMapppingList(this.mappingFromObj.mappingFromKey, term).pipe(
          catchError(() => of([])), // empty list on error
          tap(() => this.formLoading = false)
        ))
      )
    );
  }
  private loadToList(searchTxt?) {
    this.toList$ = concat(
      this.getMapppingList(this.mappingToObj.mappingToKey, searchTxt), // default items
      this.toListInput$.pipe(
        distinctUntilChanged(),
        tap(() => this.toLoading = true),
        switchMap(term => this.getMapppingList(this.mappingToObj.mappingToKey, term).pipe(
          catchError(() => of([])), // empty list on error
          tap(() => this.toLoading = false)
        ))
      )
    );
  }

  defaultForm(): void {
    this.mapingForm = this.fb.group({
      mapId: [''],
      mapFrom: [null, Validators.required],
      mapTo: [null, Validators.required],
      mapFromDate: ['', Validators.required],
      mapToDate: [''],
    });
    if (!this.isDateRequire) {
      this.mapingForm.controls.mapFromDate.clearValidators();
      this.mapingForm.controls.mapFromDate.updateValueAndValidity();
      // this.mapingForm.controls.mapToDate.clearValidators();
      // this.mapingForm.controls.mapToDate.updateValueAndValidity();
    }
  }

  getMapppingList(key?, searchString?): Observable<any> {
    if (key === 'rmo' || key === 'doctor' || key === 'nurse') {
      const roleTypeId = (key === 'rmo' || key === 'doctor') ? 3 : key === 'nurse' ? 4 : 0;
      return this.getuserList(roleTypeId, key, searchString);
    } else if (key === 'dept') {
      return this.getDepartmentList(searchString);
    } else if (key === 'speciality') {
      return this.getAllSpecialityList(searchString);
    } else if (key === 'ward') {
      return this.getAllWardList(searchString);
    } else if (key === 'nursingStation') {
      return this.getNursingStationList(searchString);
    }
  }

  getNursingStationList(searchKey?): Observable<any> { // department
    const params = {
      search_string: searchKey ? searchKey : '',
      page_number: 1,
      limit: 20
    };
    return this.mappingServ.getNursingStationList(params).pipe(map(res => res));
  }

  getuserList(roleTypeId, key?, searchString?): Observable<any> { // rmo,nurse,doctor
    const reqParam = {
      search_keyword: searchString,
      dept_id: 0,
      speciality_id: 0,
      designation_id: key === 'rmo' ? 4 : 0,
      role_type_id: roleTypeId,
      limit: 20
    };
    return this.emrServices.getUsersList(reqParam).pipe(map(res => {
      const userArrayList = [];
      _.map(res, (o) => {
        const obj = {
          id: o.user_id,
          name: o.user_name
        };
        userArrayList.push(obj);
      });
      return userArrayList;
    }));
  }
  getDepartmentList(searchKey?): Observable<any> { // department
    const params = {
      search_string: searchKey ? searchKey : '',
      page_number: 1,
      limit: 20
    };
    return this.mappingServ.getDepartmentList(params).pipe(map(res => res));
  }

  getAllWardList(searchKey?): Observable<any> { // wardList
    const param = {
      search_string: searchKey ? searchKey : null,
      page_number: 1,
      limit: 20
    };
    return this.mappingServ.getWardList(param).pipe(map(res => {
      return res;
    }));
  }

  getAllSpecialityList(searchKey?): Observable<any> { // specialityList
    const param = {
      search_string: searchKey ? searchKey : null,
      page_number: 1,
      limit: 20
    };
    return this.mappingServ.getSpecialityList(param).pipe(map(res => {
      return res;
    }));
  }

  selectMappingValue(event, key) {
    this.mapingForm.patchValue({
      key: event
    });
  }

  saveUpdate() {
    if (this.mapingForm.valid) {
      this.saveObject.emit(this.mapingForm.value);
      this.modal.close('ok');
    }
  }

}

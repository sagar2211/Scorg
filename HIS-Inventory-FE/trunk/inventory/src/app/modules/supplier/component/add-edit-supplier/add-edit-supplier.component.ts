import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { IAlert } from 'src/app/public/models/AlertMessage';
import { Constants } from 'src/app/config/constants';
import * as _ from 'lodash';
import { Observable, forkJoin, of, concat, Subject } from 'rxjs';
import { map, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { MastersService } from 'src/app/modules/masters/services/masters.service';
import { GstCode } from 'src/app/modules/masters/modals/gstcode';

@Component({
  selector: 'app-add-edit-supplier',
  templateUrl: './add-edit-supplier.component.html',
  styleUrls: ['./add-edit-supplier.component.scss']
})
export class AddEditSupplierComponent implements OnInit {
  @Input() supplierData: any;
  supplierForm: FormGroup;
  loadForm: boolean;
  alertMsg: IAlert;
  searchString = '';

  submitted = false;
  gstCodeList$ = new Observable<any>();
  gstCodeList: GstCode[] = [];
  compInstance = this;
  isNgSelectTypeHeadDisabled = false;

  countryList$ = new Observable<any>();
  countryListInput$ = new Subject<any>();
  stateList$ = new Observable<any>();
  stateListInput$ = new Subject<any>();
  cityList$ = new Observable<any>();
  cityListInput$ = new Subject<any>();

  defaultCountryObj = null;
  constructor(
    public modal: NgbActiveModal,
    private fb: FormBuilder,
    private mastersService: MastersService,
  ) { }

  ngOnInit(): void {
    this.loadForm = false;
    const forkArray = [];
    this.defaultCountryObj = Constants.defaultIndiaCountryObject;
    this.loadCountryList('');
    this.loadStateList('');
    forkArray.push(this.getGstCodeList());
    forkJoin(forkArray).subscribe(res => {
      if (this.supplierData) {
        this.createForm(this.supplierData.supplierData);
      } else {
        this.createForm();
      }
    });
  }

  createForm(form?) {
    const formObj = {
      id: [null],
      name: [null, Validators.required],
      address: [null],
      country: [this.defaultCountryObj, Validators.required],
      state: [null, Validators.required],
      city: [null],
      phone: [null, [Validators.pattern(/^[6-9]\d{9}$/)]],
      email: [null, [Validators.email]],
      pinCode: [null, Validators.required],
      contactPerson: [null],
      contactPersonPhone: [null],
      gstRegNo: [null],
      gstCode: [null, Validators.required],
      registrationNo: [null],
      isActive: [true, Validators.required]
    };
    this.supplierForm = this.fb.group(formObj);
    this.loadForm = true;
    if (form && form.supplierId) {
      this.patchDefaultValue(form);
    } else {
      this.loadStateList('', this.defaultCountryObj.id);
    }
  }

  patchDefaultValue(val?) {
    let stateObj = null;
    let cityObj = null;
    let countryObj = null;
    let gstObj = null;
    if (val) {
      stateObj = {
        id: val.stateId,
        name: val.stateName
      };
      cityObj = {
        id: val.cityId,
        name: val.city
      };
      countryObj = {
        id: val.countryId,
        name: val.countryName
      };
      if (val.gstCode) {
        gstObj = _.find(this.gstCodeList, v => v.gstCode === val.gstCode);
      }
      if (val.countryId) {
        this.loadCountryList(val.countryName);
      }
      if (val.countryId && val.stateId) {
        this.loadStateList(val.stateName, val.countryId);
      }
      if (val.cityId && val.stateId) {
        this.loadCityList(val.cityName, val.stateId);
      }
    }
    if (val.supplierInUse) {
      this.supplierForm.controls.gstCode.disable();
    }
    this.supplierForm.patchValue({
      id: val.supplierId,
      name: val.supplierName,
      address: val.address,
      country: countryObj,
      state: stateObj,
      city: cityObj,
      phone: val.phone,
      email: val.email,
      pinCode: val.pinCode ? val.pinCode : null,
      contactPerson: val.contactPerson,
      contactPersonPhone: val.contactPersonMobile,
      gstRegNo: val.gstRegNo,
      gstCode: gstObj,
      registrationNo: val.registrationNo,
      isActive: val.isActive,
    });
  }

  get supplierFrmCntrols() {
    return this.supplierForm.controls;
  }

  saveSupplierMasterData() {
    this.submitted = true;
    if (this.submitted && this.supplierForm.valid) {
      const formVal = this.supplierForm.getRawValue();
      const param = {
        supplierId: formVal.id ? formVal.id : 0,
        supplierName: formVal.name,
        address: formVal.address,
        countryId: formVal.country && formVal.country.id ? formVal.country.id : null,
        stateId: formVal.state && formVal.state.id ? formVal.state.id : null,
        cityId: formVal.state && formVal.city.id ? formVal.city.id : null,
        countryName: formVal.country && formVal.country.name ? formVal.country.name : null,
        stateName: formVal.state && formVal.state.name ? formVal.state.name : null,
        city: formVal.state && formVal.city.name ? formVal.city.name : null,
        phone: formVal.phone,
        email: formVal.email,
        pinCode: formVal.pinCode,
        contactPerson: formVal.contactPerson,
        contactPersonMobile: formVal.contactPersonPhone,
        gstRegNo: formVal.gstRegNo,
        gstCode: formVal.gstCode && formVal.gstCode.gstCode ? formVal.gstCode.gstCode : null,
        registrationNo: formVal.registrationNo,
        isActive: formVal.isActive
      };
      this.mastersService.saveSupplierMaster(param).subscribe(res => {
        if (res) {
          const obj = {
            status: formVal.id ? 'save' : 'edit',
            data: res
          };
          this.modal.close(obj);
        } else {
          this.alertMsg = {
            message: 'Something Went Wrong!',
            messageType: 'warning',
            duration: Constants.ALERT_DURATION
          };
        }
      });
    }
  }

  onCountryChange(val) {
    if (_.isEmpty(val)) {
      this.compInstance.supplierForm.controls.country.patchValue(null);
      return;
    }
    this.compInstance.supplierForm.controls.country.patchValue(val);
    this.loadStateList(null, val.id);
  }

  onStateChange(val) {
    if (_.isEmpty(val)) {
      this.compInstance.supplierForm.controls.state.patchValue(null);
      return;
    }
    this.compInstance.supplierForm.controls.state.patchValue(val);
    this.loadCityList(null, val.id);
  }

  onCityChange(val) {
    if (_.isEmpty(val)) {
      this.compInstance.supplierForm.controls.city.patchValue(null);
      return;
    }
    this.compInstance.supplierForm.controls.city.patchValue(val);
  }

  private loadCountryList(searchTxt?): void {
    this.countryList$ = concat(
      this.mastersService.getCountryList(searchTxt ? searchTxt : ''), // default items
      this.countryListInput$.pipe(
        distinctUntilChanged(),
        switchMap(term => this.mastersService.getCountryList(term).pipe(
          catchError(() => of([])), // empty list on error
        ))
      )
    );
  }

  private loadStateList(searchTxt?, countryId?): void {
    this.stateList$ = concat(
      this.mastersService.getStateList(searchTxt ? searchTxt : '', countryId), // default items
      this.stateListInput$.pipe(
        distinctUntilChanged(),
        switchMap(term => this.mastersService.getStateList(term, countryId).pipe(
          catchError(() => of([])), // empty list on error
        ))
      )
    );
  }

  private loadCityList(searchTxt?, stateId?): void {
    this.cityList$ = concat(
      this.mastersService.getCityList(searchTxt ? searchTxt : '', stateId), // default items
      this.cityListInput$.pipe(
        distinctUntilChanged(),
        switchMap(term => this.mastersService.getCityList(term, stateId).pipe(
          catchError(() => of([])), // empty list on error
        ))
      )
    );
  }

  getGstCodeList(): Observable<any> {
    return this.gstCodeList$ = this.mastersService.getGSTCodeList().pipe(map(res => {
      this.gstCodeList = res;
      return this.gstCodeList;
    }));
  }

}

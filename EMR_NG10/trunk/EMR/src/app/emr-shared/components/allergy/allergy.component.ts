import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ValidatorFn, AbstractControl, FormArray } from '@angular/forms';
import { concat, Observable, of, Subject } from 'rxjs';
import { IAllergyTypes, IMedicineListAllergy } from './../../../public/models/iallergy';
import { PublicService } from './../../../public/services/public.service';
import { ConsultationService } from './../../../public/services/consultation.service';
import { AllergiesService } from './../../../public/services/allergies.service';
import { catchError, debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { IallergyListPatient } from './../../../public/models/iallergy-list-patient.model';
import * as _ from 'lodash';
import { DynamicChartService } from '../../../dynamic-chart/dynamic-chart.service';
import { CommonService } from 'src/app/public/services/common.service';

@Component({
  selector: 'app-allergy',
  templateUrl: './allergy.component.html',
  styleUrls: ['./allergy.component.scss']
})
export class AllergyComponent implements OnInit {

  medicineList$ = new Observable();
  medicineListInput$ = new Subject<any>();
  allergyTypes = [];
  allergyList: any[] = [];
  medicineList: IMedicineListAllergy[] = [];
  isAdd = false;
  allergiesFrm: FormGroup;
  activeFormId: number;
  patientId: any;
  isNgSelectTypeHeadDisabled = false;
  compInstance = this;
  isPanelOpen: boolean;
  chartDetailId: number;
  loadForm = false;
  @Input() public componentInfo: any;

  constructor(
    private fb: FormBuilder,
    private allergyService: AllergiesService,
    private commonService: CommonService,
    private publicService: PublicService,
    public consultationService: ConsultationService,
    public dynamicChartService: DynamicChartService
  ) { }

  ngOnInit(): void {
    this.loadForm = false;
    this.chartDetailId = this.componentInfo.chart_detail_id;
    this.patientId = null;
    this.getAllergyTypes('').then(r => {
      this.createForm();
      this.getAllergyInitData();
      this.loadMedicineList();
      this.isPanelOpen = (this.componentInfo.activeIdsOfPanels as Array<any>).indexOf('allergies') !== -1 ? true : false;
      this.subcriptionOfEvents();
    });
  }

  createForm(): void {
    this.allergiesFrm = this.fb.group({
      isAllergySelected: ['YES'],
      allergiesListFrm: this.fb.array([])
    });
    this.loadForm = true;
  }

  // -- get formArray name from template form group
  get allergiesListFrm() {
    return this.allergiesFrm.get('allergiesListFrm') as FormArray;
  }

  getAllergyInitData() {
    this.dynamicChartService.getChartDataByKey('allergy_detail', true, null, this.chartDetailId).subscribe(result => {
      if (result.length === 0 || result === null) {
        this.allergiesFrm.patchValue({ isAllergySelected: null });
        this.patchDefaultValue();
        return;
      } else {
        if (result.length) { // added for duplicate component
          result = result[0];
        }
        if (result.is_allergy_selected === 'no_select' || result.is_allergy_selected === null) { // is_allergy_selected values: yes, no,  no_select
          this.allergiesFrm.patchValue({ isAllergySelected: null });
          this.patchDefaultValue();
          this.clearAllergies();
        } else if (result.is_allergy_selected === 'no') {
          this.allergiesFrm.patchValue({ isAllergySelected: 'NO' });
          this.patchDefaultValue();
        } else {
          this.allergiesFrm.patchValue({ isAllergySelected: 'YES' });
          if (result.allergy_data && result.allergy_data.length) {
            _.map(result.allergy_data, (x) => {
              this.updateFormValue(x);
            });
          }
        }
      }
    });
  }

  updateFormValue(Obj): void {
    this.patchDefaultValue();
    const form = this.allergiesListFrm;
    const medObj = (Obj['medicine_name'] !== null && Obj['medicine_name'] !== '') ? { id: Obj.medicine_id, name: Obj.medicine_name } : {};
    const indx = form.controls.length - 1;
    if (!form.value[indx].type) {
      form.at(indx).patchValue({
        transId: Obj['tran_id'],
        type: Obj['allergy_type_id'],
        name: Obj['allergy_type'],
        medicine: Obj['medicine_name'],
        medicineObject: medObj,
        remark: Obj['remarks']
      });
    }
    // const iallergyListPatient = new IallergyListPatient();
    // const tempObj = {
    //   transId: [Obj['tran_id'], Validators.required],
    //   type: [Obj['allergy_type_id'], Validators.required],
    //   name: [Obj['allergy_type']],
    //   medicine: [Obj['medicine_name']],
    //   medicineObject: [medObj],
    //   remark: [Obj['remarks'], Validators.required]
    // };
    // iallergyListPatient.generateObject(tempObj);
    // this.allergiesListFrm.push(this.fb.group(iallergyListPatient));
  }

  // --add default value to formArray  ie this.allergiesListFrm
  patchDefaultValue(): void {
    const allergyObj = {
      transId: 0,
      type: null,
      name: null,
      medicine: null,
      medicineObject: {},
      remark: null,
    };
    allergyObj.type = [null, Validators.required];
    allergyObj.remark = [null, Validators.required];
    allergyObj.name = [null];
    allergyObj.medicine = [null];
    allergyObj.medicineObject = [{}, [this.test]];

    this.allergiesListFrm.push(this.fb.group(allergyObj));
  }

  // -- to get allergy types
  getAllergyTypes(searchText) {
    const promise = new Promise((resolve, reject) => {
      this.compInstance.allergyService.getAllergyTypes(searchText).subscribe(res => {
        this.allergyTypes = [];
        this.allergyTypes = res;
        this.allergyTypes.map(d => {
          d.id = +d.id;
        });
        resolve(this.allergyTypes);
      });
    });
    return promise;
  }

  private loadMedicineList(searchTxt?) {
    this.medicineList$ = concat(
      this.getMedicineList(searchTxt ? searchTxt : ''), // default items
      this.medicineListInput$.pipe(
        distinctUntilChanged(),
        debounceTime(500),
        switchMap(term => this.getMedicineList(term).pipe(
          catchError(() => of([]))
        ))
      )
    );
  }

  // -- get medicine list
  getMedicineList(searchKey): Observable<any> {
    searchKey = (searchKey) ? searchKey : '';
    return this.publicService.getMedicinesBySearchKeyword(searchKey).pipe(map((res: any) => {
      this.medicineList = [];
      _.map(res, (val, key) => {
        const imedicineList = new IMedicineListAllergy();
        if (imedicineList.isObjectValid(val)) {
          // val.id = val.id.toString();
          imedicineList.generateObject(val);
          this.medicineList.push(imedicineList);
        }
      });
      return this.medicineList;
    })
    );
  }

  // -- add data into allergy array form
  addAllergy(item): void {
    this.isAdd = true;
    if (item.valid) {
      this.isAdd = false;
      this.patchDefaultValue();
    }
  }

  // -- delete row from form array
  deleteAllergy(indx): void {
    this.allergiesListFrm.removeAt(indx);
    if (this.allergiesListFrm.controls.length <= 0) {
      this.patchDefaultValue();
    }
  }

  onAllergySelected($event, item) {
    if ($event) {
      item.patchValue({
        type: $event ? $event.id : '',
        name: $event ? $event.name : ''
      });
    } else {
      item.patchValue({
        type: null,
        name: null
      });
    }
  }

  selectMedicine($event, item) {
    if ($event !== '') {
      item.patchValue({
        medicine: typeof $event === 'object' ? $event.id : $event,
        medicineObject: typeof $event === 'object' ? $event : null
      });
      // console.log(this.allergiesFrm.value);
    }

    // else {
    //   // call to API
    //   this.getMedicineList($event);
    // }
  }

  test = (): ValidatorFn => {
    return (control: AbstractControl): { [key: string]: boolean } => {
      return { ageRange: true };
    };
  }

  clearAllergies() {
    this.allergiesFrm.reset();
    if (this.allergiesListFrm.controls.length > 1) {
      this.allergiesListFrm.controls.forEach((element, index) => {
        this.deleteAllergy(index);
      });
    }
    this.allergiesFrm.value.isAllergySelected = null;
    // this.allergiesFrm.patchValue({ isAllergySelected: null, allergiesListFrm: [] });
    //  this.subcriptionOfEvents();
  }

  subcriptionOfEvents(): void {
    this.allergiesFrm.valueChanges.pipe().subscribe(res => {
      // format for post save data
      this.prepareAndSaveLocalTransData();
    });
  }

  prepareAndSaveLocalTransData() {
    const transactionData = [];
    if (this.allergiesFrm.value.isAllergySelected === 'YES') {
      _.forEach(this.allergiesListFrm.value, (allergy) => {
        if (allergy.type && allergy.type !== null) {
          const transactionObj = this.setTransactionObject(allergy);
          transactionData.push(transactionObj);
        }
      });
      if (!transactionData.length) {
        return;
      }
    }
    const requestAllergyObject = {
      is_allergy_selected: (this.allergiesFrm.value.isAllergySelected !== null) ? this.allergiesFrm.value.isAllergySelected.toLowerCase() : 'no_select',
      allergy_data: transactionData,
      chart_detail_id: this.chartDetailId
    };
    this.dynamicChartService.updateLocalChartData('allergy_detail', [requestAllergyObject], 'update', this.chartDetailId);
  }

  setTransactionObject(Obj) {
    return {
      tran_id: Obj.transId,
      allergy_type_id: Obj.type,
      allergy_type: Obj.name,
      medicine_id: (Obj.medicineObject) ? Obj.medicineObject.id : 0,
      medicine_name: (Obj.medicineObject) ? Obj.medicineObject.name : '',
      remarks: Obj.remark
    };
  }

  panelChange(event): void {
    this.isPanelOpen = event.nextState;
  }

  openCloseSuggPanel() {
    this.commonService.openSuggesstionPanelOnFixedComponentSearchCallFunction('close');
  }

}

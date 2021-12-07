import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { IAlert } from 'src/app/public/models/AlertMessage';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Constants } from 'src/app/config/constants';
import { Observable, of, concat, Subject } from 'rxjs';
import { map, distinctUntilChanged, switchMap, catchError, debounceTime } from 'rxjs/operators';
import * as _ from 'lodash';
import { MastersService } from 'src/app/modules/masters/services/masters.service';
import { MainGroup } from 'src/app/modules/masters/modals/maingroup.model';
import { SubGroup } from 'src/app/modules/masters/modals/subgroup.model';
import { Unit } from 'src/app/modules/masters/modals/unit.model';
import { ItemClass } from 'src/app/modules/masters/modals/itemclass.model';
import { ItemType } from 'src/app/modules/masters/modals/itemtype.model';
import { Manufacturer } from 'src/app/modules/masters/modals/manufacturer.model';
import { itemCategory } from 'src/app/modules/masters/modals/itemcategory';
import { NgSelectComponent } from '@ng-select/ng-select';

@Component({
  selector: 'app-item-master-add-update',
  templateUrl: './item-master-add-update.component.html',
  styleUrls: ['./item-master-add-update.component.scss']
})
export class ItemMasterAddUpdateComponent implements OnInit {
  @Input() supplierData: any;
  @ViewChild('categoryListComp') categoryListSelect: NgSelectComponent;
  @ViewChild('manufectureSelect') manufectureSelectComp: NgSelectComponent;
  @ViewChild('brandSelect') brandSelectComp: NgSelectComponent;
  @ViewChild('purcheseUnitSelect') purcheseUnitSelectComp: NgSelectComponent;
  @ViewChild('issueUnitSelect') issueUnitSelectComp: NgSelectComponent;
  @ViewChild('otConsumpSelect') otConsumpSelectComp: NgSelectComponent;
  @ViewChild('itemDesc') itemDescComp: ElementRef;
  @ViewChild('otConsumptionAdd') otConsumptionAddComp: ElementRef;
  @ViewChild('issueUnitAdd') issueUnitAddComp: ElementRef;
  @ViewChild('purchaseUnitAdd') purchaseUnitAddComp: ElementRef;
  @ViewChild('brandAdd') brandAddComp: ElementRef;
  @ViewChild('manufectureAdd') manufectureAddComp: ElementRef;
  itemMasterForm: FormGroup;
  loadForm: boolean;
  alertMsg: IAlert;
  searchString = '';
  grpListAll = [];
  subgrpListAll = [];
  itemClassListAll = [];
  itemTypeList = [];
  manufecturerList = [];
  gstList = [];
  unitListOt = [];
  unitList = [];
  unitList$ = new Observable();
  unitListOT$ = new Observable();
  compInstance = this;
  isNgSelectTypeHeadDisabled: boolean;
  submitted = false;
  isSubGroupActive = true;

  grpListAll$ = new Observable<any>();
  grpListAllInput$ = new Subject<any>();
  grpListSubAll$ = new Observable<any>();
  grpListSubAllInput$ = new Subject<any>();
  itemClassListAll$ = new Observable<any>();
  itemClassListAllInput$ = new Subject<any>();
  itemTypeListAll$ = new Observable<any>();
  itemTypeListAllInput$ = new Subject<any>();
  manufecturerListAll$ = new Observable<any>();
  manufecturerListAllInput$ = new Subject<any>();
  categoryList$ = new Observable<any>();
  categoryListInput$ = new Subject<any>();
  genCodeList$ = new Observable<any>();
  genCodeListInput$ = new Subject<any>();
  scheduleDrugList$ = new Observable<any>();
  scheduleDrugListInput$ = new Subject<any>();
  brandList$ = new Observable<any>();
  brandListInput$ = new Subject<any>();

  addMode = {
    manufacturer: false,
    brandName: false,
    purcheseUnit: false,
    issueUnit: false,
    otConsumptionUnit: false,
  }
  editForm: boolean = false;

  constructor(
    public modal: NgbActiveModal,
    private fb: FormBuilder,
    private mastersService: MastersService,
  ) { }

  ngOnInit(): void {
    this.loadForm = false;
    this.isNgSelectTypeHeadDisabled = false;
    this.getTaxMasterData().subscribe(res => {
      this.getAllUnitBySearch();
      this.getAllOTConsumptionUnitBySearch();
      this.loadMainGroupList('');
      this.loadItemClassList('');
      this.loadItemTypeList('');
      this.loadManufecturerList('');
      this.loadcategoryList('');
      this.loadGenricItemList('');
      this.loadScheduleDrugList('');
      this.loadBrandList('');
      if (this.supplierData && this.supplierData.supplierData) {
        this.isNgSelectTypeHeadDisabled = true;
        this.createForm(_.clone(this.supplierData.supplierData));
      } else {
        this.createForm();
      }
    });
  }

  createForm(form?) {
    const formObj = {
      id: [null],
      category: [null, [Validators.required]],
      mainGrp: [null], // [Validators.required]
      subGrp: [null], // [Validators.required]
      code: [null],
      hsnCode: [null],
      description: [null, Validators.required],
      brandName: [null],
      brandNameAdd: [null],
      brandNameMsg: [null],
      // saleQty: [null],
      class: [null],
      unitPurchaseAdd: [null],
      unitPurchaseMsg: [null],
      unitIssueAdd: [null],
      unitIssueMsg: [null],
      otConsumptionAdd: [null],
      otConsumptionMsg: [null],
      unitPurchase: [null],
      otConsumption: [null],
      unitIssue: [null],
      conversionFactor: [null, Validators.required],
      packSize: [null, Validators.required],
      // type: [null, [Validators.required]],
      reOrderLevel: [null, [Validators.required]],
      gstOnPurchase: [null, [Validators.required]],
      gstOnSale: [null],
      manufacturer: [null],
      manufacturerAdd: [null],
      manufacturerMsg: [null],
      genericCode: [null],
      scheduleDrug: [null],
      isAsset: [true],
      stockOnBatch: [true],
      issueOnBatch: [true],
      isSelleable: [true],
      expiryApplicable: [true],
      isPostedInPatientBill: [true],
      isMedicineOnHold: [false],
      isActive: [true, [Validators.required]]
    };
    this.compInstance.itemMasterForm = this.fb.group(formObj);
    this.loadForm = true;
    setTimeout(() => {
      this.categoryListSelect.focus();
    }, 500);
    this.compInstance.itemMasterForm.controls.gstOnSale.disable();
    if (form && form.itemId) {
      this.patchDefaultValue(form);
      this.editForm = true;
    }
  }

  patchDefaultValue(val?) {
    let mainGrp = null;
    let subGrp = null;
    let unitPurchase = null;
    let unitIssue = null;
    let classObj = null;
    let itemType = null;
    let manufacturer = null;
    let vatVal = null;
    let category = null;
    let otConsumptionUnit = null;
    if (val && val.primaryGroupId) {
      const mainGrpObj = {
        id: val.primaryGroupId,
        name: val.priGroupDesc,
        aliasName: null,
        isActive: true
      };
      const mainGrpMdl = new MainGroup();
      mainGrpMdl.generateObject(mainGrpObj);
      mainGrp = mainGrpMdl;
    }
    if (val && val.subgroupId) {
      const subGrpObj = {
        mainGroup: val.primaryGroupId ? mainGrp : null,
        id: val.subgroupId,
        name: val.subGroupDesc,
        aliasName: null,
        assetCode: null,
        depreciationPercent: null,
        isActive: true
      };
      const subGrpMdl = new SubGroup();
      subGrpMdl.generateObject(subGrpObj);
      subGrp = subGrpMdl;
    }
    if (val && val.issueUnitId) {
      const unitObj = {
        id: val.issueUnitId,
        name: val.issueUnitName,
      };
      const unitMdl = new Unit();
      unitMdl.generateObject(unitObj);
      unitIssue = unitMdl;
    }
    if (val && val.purchaseUnitId) {
      const unitObj = {
        id: val.purchaseUnitId,
        name: val.purchaseUnitName,
      };
      const unitMdl = new Unit();
      unitMdl.generateObject(unitObj);
      unitPurchase = unitMdl;
    }
    if (val && val.itemClassId) {
      const classDObj = {
        id: val.itemClassId,
        name: val.className,
      };
      const itemClassMdl = new ItemClass();
      itemClassMdl.generateObject(classDObj);
      classObj = itemClassMdl;
    }
    if (val && val.itemTypeId) {
      const itemTypeObj = {
        id: val.itemTypeId,
        desc: val.itemTypeDesc,
        isActive: true
      };
      const itemTypeMdl = new ItemType();
      itemTypeMdl.generateObject(itemTypeObj);
      itemType = itemTypeMdl;
    }
    if (val && val.manufactureId) {
      const manufacturerObj = {
        id: val.manufactureId,
        name: val.manufacturerName,
        shortName: null,
        isActive: true
      };
      const manufacturerMdl = new Manufacturer();
      manufacturerMdl.generateObject(manufacturerObj);
      manufacturer = manufacturerMdl;
    }
    if (val.taxRate !== null) {
      const vatObj = _.find(this.gstList, lst => {
        return lst.value === val.taxRate;
      });
      vatVal = vatObj;
    }
    if (val.categoryId) {
      const categoryObj = {
        id: val.categoryId,
        name: val.categoryName,
        isActive: true
      };
      const cat = new itemCategory();
      cat.generateObject(categoryObj);
      category = cat;
    }
    if (val && val.otConsumptionUnitId) {
      const unitObj = {
        id: val.otConsumptionUnitId,
        name: val.otConsumptionUnitName,
      };
      const unitMdl = new Unit();
      unitMdl.generateObject(unitObj);
      otConsumptionUnit = unitMdl;
    }

    this.compInstance.itemMasterForm.patchValue({
      id: val.itemId,
      category: category,
      mainGrp: mainGrp,
      subGrp: subGrp,
      code: val.itemCode,
      hsnCode: val.hsnSacCode,
      description: val.itemDescription,
      brandName: val.brandName,
      // saleQty: val.saleQty,
      class: classObj,
      unitPurchase: unitPurchase,
      unitIssue: unitIssue,
      conversionFactor: val.conversionFactor,
      packSize: val.packSize,
      // type: itemType,
      reOrderLevel: val.reorderLevel,
      gstOnPurchase: vatVal,
      gstOnSale: vatVal,
      manufacturer: manufacturer,
      isAsset: val.isAsset,
      stockOnBatch: val.stockOnBatch,
      issueOnBatch: val.issueOnBatch,
      isSelleable: val.isSelleable,
      expiryApplicable: val.expiryApplicable,
      isActive: val.isActive,
      isPostedInPatientBill: val.isPostedInPatientBill,
      isMedicineOnHold: val.isMedicineOnHold,
      genericCode: {
        id: val.genericCode,
        name: val.genericDescription
      },
      scheduleDrug : {
        id: val.scheduledDrugsTypeId,
        scheduledDrugsTypeName: val.scheduledDrugsTypeName
      },
      otConsumption: otConsumptionUnit,
    });
    if (this.compInstance.itemMasterForm.value.subgroup) {
      this.isSubGroupActive = false;
    }
  }

  checkValidation() {
    let submitform = true;
    this.itemMasterForm.patchValue({ manufacturerMsg: null });
    this.itemMasterForm.patchValue({ brandNameMsg: null });
    this.itemMasterForm.patchValue({ unitPurchaseMsg: null });
    this.itemMasterForm.patchValue({ unitIssueMsg: null });
    this.itemMasterForm.patchValue({ otConsumptionMsg: null });
    if (this.addMode.manufacturer && !this.itemMasterForm.value.manufacturerAdd) {
      this.itemMasterForm.patchValue({ manufacturerMsg: 'Please Add Manufacturer' });
    } else if (!this.addMode.manufacturer && !this.itemMasterForm.value.manufacturer) {
      this.itemMasterForm.patchValue({ manufacturerMsg: 'Please Select Manufacturer' });
    }
    if (this.addMode.brandName && !this.itemMasterForm.value.brandNameAdd) {
      this.itemMasterForm.patchValue({ brandNameMsg: 'Please Add Brand' });
    } else if (!this.addMode.brandName && !this.itemMasterForm.value.brandName) {
      this.itemMasterForm.patchValue({ brandNameMsg: 'Please Select Brand' });
    }
    if (this.addMode.purcheseUnit && !this.itemMasterForm.value.unitPurchaseAdd) {
      this.itemMasterForm.patchValue({ unitPurchaseMsg: 'Please Add Unit' });
    } else if (!this.addMode.purcheseUnit && !this.itemMasterForm.value.unitPurchase) {
      this.itemMasterForm.patchValue({ unitPurchaseMsg: 'Please Select Unit' });
    }
    if (this.addMode.issueUnit && !this.itemMasterForm.value.unitIssueAdd) {
      this.itemMasterForm.patchValue({ unitIssueMsg: 'Please Add Unit' });
    } else if (!this.addMode.issueUnit && !this.itemMasterForm.value.unitIssue) {
      this.itemMasterForm.patchValue({ unitIssueMsg: 'Please Select Unit' });
    }
    if (this.addMode.otConsumptionUnit && !this.itemMasterForm.value.otConsumptionAdd) {
      this.itemMasterForm.patchValue({ otConsumptionMsg: 'Please Add Unit' });
    } else if (!this.addMode.otConsumptionUnit && !this.itemMasterForm.value.otConsumption) {
      this.itemMasterForm.patchValue({ otConsumptionMsg: 'Please Select Unit' });
    }
    if (this.itemMasterForm.value.otConsumptionMsg ||
      this.itemMasterForm.value.unitIssueMsg ||
      this.itemMasterForm.value.unitPurchaseMsg ||
      this.itemMasterForm.value.brandNameMsg ||
      this.itemMasterForm.value.manufacturerMsg ||
      this.itemMasterForm.value.brandNameMsg) {
      submitform = false;
    }
    return submitform;
  }

  generateSaveObj() {
    const formVal = this.compInstance.itemMasterForm.value;
    const param = {
      itemId: formVal.id ? formVal.id : 0,
      itemCode: formVal.code ? formVal.code : null,
      itemDescription: formVal.description ? formVal.description : null,
      // itemTypeId: formVal.type ? formVal.type.id : null,
      conversionFactor: formVal.conversionFactor ? formVal.conversionFactor : null,
      packSize: formVal.packSize ? formVal.packSize : null,
      // saleQty: formVal.saleQty ? formVal.saleQty : null,
      reorderLevel: formVal.reOrderLevel ? formVal.reOrderLevel : null,
      taxRate: formVal.gstOnPurchase ? formVal.gstOnPurchase.value : null,
      // manufactureId: formVal.manufacturer ? formVal.manufacturer.id : null,
      itemClassId: formVal.class ? formVal.class.id : null,
      primaryGroupId: 1, // formVal.mainGrp ? formVal.mainGrp.id : null, default for pharama
      subgroupId: 1, // formVal.subGrp ? formVal.subGrp.id : null,  default for pharma
      // purchaseUnitId: formVal.unitPurchase ? formVal.unitPurchase.id : null,
      // issueUnitId: formVal.unitIssue ? formVal.unitIssue.id : null,
      // brandName: formVal.brandName ? formVal.brandName : null,
      hsnSacCode: formVal.hsnCode ? formVal.hsnCode : null,
      isAsset: true, // formVal.isAsset ? formVal.isAsset : false, default for pharma
      stockOnBatch: true, // formVal.stockOnBatch ? formVal.stockOnBatch : false, default for pharma
      issueOnBatch: true, // formVal.issueOnBatch ? formVal.issueOnBatch : false, default for pharma
      isSelleable: true, // formVal.isSelleable ? formVal.isSelleable : false, default for pharma
      expiryApplicable: true, // formVal.expiryApplicable ? formVal.expiryApplicable : false, default for pharma
      isActive: formVal.isActive,
      isPostedInPatientBill: formVal.isPostedInPatientBill,
      holdProduct : formVal.isMedicineOnHold,
      genericCode: formVal.genericCode ? formVal.genericCode.id : 0,
      genericDescription: formVal.genericCode ? formVal.genericCode.name : 0,
      scheduledTypeId : formVal.scheduleDrug ? formVal.scheduleDrug.scheduledDrugsTypeId : 0,
      // otConsumptionUnitId: formVal.otConsumption ? formVal.otConsumption.id : null,
      categoryId: formVal.category ? formVal.category.id : null,
      manufacture: null,
      purchaseUnit: null,
      issueUnit: null,
      brand: null,
      otConsumptionUnit: null,
    };
    if (this.addMode.manufacturer) {
      param.manufacture = {
        id: 0,
        name: this.itemMasterForm.value.manufacturerAdd
      };
    } else if (!this.addMode.manufacturer) {
      param.manufacture = this.itemMasterForm.value.manufacturer;
    }
    if (this.addMode.brandName) {
      param.brand = {
        id: 0,
        name: this.itemMasterForm.value.brandNameAdd
      };
    } else if (!this.addMode.brandName) {

      if (this.editForm === true) {
        param.brand = {
          id: 0,
          name : this.itemMasterForm.value.brandName
        }
      } else {
        param.brand = this.itemMasterForm.value.brandName;
      }

    }
    if (this.addMode.purcheseUnit) {
      param.purchaseUnit = {
        id: 0,
        name: this.itemMasterForm.value.unitPurchaseAdd
      };
    } else if (!this.addMode.purcheseUnit) {
      param.purchaseUnit = this.itemMasterForm.value.unitPurchase;
    }
    if (this.addMode.issueUnit) {
      param.issueUnit = {
        id: 0,
        name: this.itemMasterForm.value.unitIssueAdd
      };
    } else if (!this.addMode.issueUnit) {
      param.issueUnit = this.itemMasterForm.value.unitIssue;
    }
    if (this.addMode.otConsumptionUnit) {
      param.otConsumptionUnit = {
        id: 0,
        name: this.itemMasterForm.value.otConsumptionAdd
      };
    } else if (!this.addMode.otConsumptionUnit) {
      param.otConsumptionUnit = this.itemMasterForm.value.otConsumption;
    }
    return param;
  }

  saveValue() {
    this.submitted = true;
    if (!this.checkValidation()) {
      return;
    }
    if (this.submitted && this.compInstance.itemMasterForm.valid) {
      this.submitted = false;
      const formVal = this.compInstance.itemMasterForm.value;
      const param = this.generateSaveObj();
      this.mastersService.saveItemMasterData(param).subscribe(res => {
        if (res) {
          this.modal.close(formVal.id ? 'save' : 'edit');
        } else {
          this.alertMsg = {
            message: 'Not Saved Please try again!',
            messageType: 'warning',
            duration: Constants.ALERT_DURATION
          };
        }
      });
    }
  }

  private loadMainGroupList(searchTxt?): void {
    this.grpListAll$ = concat(
      this.mastersService.getGroupBySearchKeyword(searchTxt ? searchTxt : '', true), // default items
      this.grpListAllInput$.pipe(
        distinctUntilChanged(),
        debounceTime(500),
        switchMap(term => this.mastersService.getGroupBySearchKeyword(term, true).pipe(
          catchError(() => of([])), // empty list on error
        ))
      )
    );
  }

  private loadSubGroupList(searchTxt?): void {
    this.grpListSubAll$ = concat(
      this.mastersService.getSubGroupBySearchKeyword(searchTxt ? searchTxt : '', this.itemMasterForm.controls.mainGrp.value ?
        this.itemMasterForm.controls.mainGrp.value.id : null), // default items
      this.grpListSubAllInput$.pipe(
        distinctUntilChanged(),
        debounceTime(500),
        switchMap(term => this.mastersService.getSubGroupBySearchKeyword(term, this.itemMasterForm.controls.mainGrp.value ?
          this.itemMasterForm.controls.mainGrp.value.id : null).pipe(
            catchError(() => of([]))
          ))
      )
    );
  }

  private loadItemClassList(searchTxt?): void {
    this.itemClassListAll$ = concat(
      this.mastersService.getItemClassBySearchKeyword(searchTxt ? searchTxt : '', true), // default items
      this.itemClassListAllInput$.pipe(
        distinctUntilChanged(),
        debounceTime(500),
        switchMap(term => this.mastersService.getItemClassBySearchKeyword(term, true).pipe(
          catchError(() => of([]))
        ))
      )
    );
  }

  private loadItemTypeList(searchTxt?): void {
    this.itemTypeListAll$ = concat(
      this.mastersService.getItemTypeBySearchKeyword(searchTxt ? searchTxt : '', true), // default items
      this.itemTypeListAllInput$.pipe(
        distinctUntilChanged(),
        debounceTime(500),
        switchMap(term => this.mastersService.getItemTypeBySearchKeyword(term, true).pipe(
          catchError(() => of([]))
        ))
      )
    );
  }

  private loadManufecturerList(searchTxt?): void {
    this.manufecturerListAll$ = concat(
      this.mastersService.getManufacturerBySearchKeyword(searchTxt ? searchTxt : '', true), // default items
      this.manufecturerListAllInput$.pipe(
        distinctUntilChanged(),
        debounceTime(500),
        switchMap(term => this.mastersService.getManufacturerBySearchKeyword(term, true).pipe(
          catchError(() => of([]))
        ))
      )
    );
  }

  private loadcategoryList(searchTxt?): void {
    this.categoryList$ = concat(
      this.mastersService.getcategoryBySearchKeyword(searchTxt ? searchTxt : '', true), // default items
      this.categoryListInput$.pipe(
        distinctUntilChanged(),
        debounceTime(500),
        switchMap(term => this.mastersService.getcategoryBySearchKeyword(term, true).pipe(
          catchError(() => of([]))
        ))
      )
    );
  }

  private loadGenricItemList(searchTxt?): void {
    this.genCodeList$ = concat(
      this.mastersService.getGenericItemBySearchKeyword(searchTxt ? searchTxt : '', true), // default items
      this.genCodeListInput$.pipe(
        distinctUntilChanged(),
        debounceTime(500),
        switchMap(term => this.mastersService.getGenericItemBySearchKeyword(term, true).pipe(
          catchError(() => of([]))
        ))
      )
    );
  }

  private loadScheduleDrugList(searchTxt?): void {
    this.scheduleDrugList$ = concat(
      this.mastersService.getScheduleDrugBySearchKeyword(searchTxt ? searchTxt : '', true), // default items
      this.scheduleDrugListInput$.pipe(
        distinctUntilChanged(),
        debounceTime(500),
        switchMap(term => this.mastersService.getScheduleDrugBySearchKeyword(term, true).pipe(
          catchError(() => of([]))
        ))
      )
    );
  }

  private loadBrandList(searchTxt?): void {
    this.brandList$ = concat(
      this.mastersService.getBrandListBySearchKeyword(searchTxt ? searchTxt : '', true), // default items
      this.brandListInput$.pipe(
        distinctUntilChanged(),
        debounceTime(500),
        switchMap(term => this.mastersService.getBrandListBySearchKeyword(term, true).pipe(
          catchError(() => of([]))
        ))
      )
    );
  }

  getTaxMasterData(): Observable<any> {
    return this.mastersService.getTaxMasterData().pipe(map(res => {
      return this.gstList = res;
    }));
  }

  getAllUnitBySearch() {
    this.compInstance.unitList$ = this.mastersService.getUnitMasterList().pipe(map(res => {
      this.compInstance.unitList = res;
      return this.compInstance.unitList;
    }));
  }

  getAllOTConsumptionUnitBySearch() {
    this.compInstance.unitListOT$ = this.mastersService.getUnitMasterList().pipe(map(res => {
      this.compInstance.unitListOt = res;
      return this.compInstance.unitListOt;
    }));
  }

  selectValueBrand(val) {

  }

  selectGenCode(val) {

  }

  selectScheduleDrug(val){

  }

  selectValueMainGrp(grp) {
    if (_.isEmpty(grp)) {
      this.compInstance.itemMasterForm.patchValue({
        id: null,
        mainGrp: null,
        subGrp: null,
        code: null,
        hsnCode: null,
        description: null,
        brandName: null,
        // saleQty: null,
        class: null,
        unitPurchase: null,
        unitIssue: null,
        conversionFactor: null,
        packSize: null,
        // type: null,
        reOrderLevel: null,
        gstOnPurchase: null,
        manufacturer: null,
        isAsset: true,
        stockOnBatch: true,
        issueOnBatch: true,
        isSelleable: true,
        expiryApplicable: true,
        isActive: true,
      });
      this.isSubGroupActive = true;
      return;
    }
    this.compInstance.itemMasterForm.controls.mainGrp.patchValue(grp);
    this.compInstance.loadSubGroupList(null);
  }

  selectCategory(grp) {
    if (_.isEmpty(grp)) {
      this.compInstance.itemMasterForm.patchValue({
        id: null,
        category: null,
        mainGrp: null,
        subGrp: null,
        code: null,
        hsnCode: null,
        description: null,
        brandName: null,
        // saleQty: null,
        class: null,
        unitPurchase: null,
        unitIssue: null,
        conversionFactor: null,
        packSize: null,
        // type: null,
        reOrderLevel: null,
        gstOnPurchase: null,
        manufacturer: null,
        isAsset: true,
        stockOnBatch: true,
        issueOnBatch: true,
        isSelleable: true,
        expiryApplicable: true,
        isActive: true,
      });
      this.isSubGroupActive = true;
      return;
    }
    this.compInstance.itemMasterForm.controls.category.patchValue(grp);
    this.itemDescComp.nativeElement.focus();
  }

  selectValueSubGrp(grp) {
    if (_.isEmpty(grp)) {
      this.compInstance.itemMasterForm.controls.subGrp.patchValue(null);
      return;
    }
    this.compInstance.itemMasterForm.controls.subGrp.patchValue(grp);
  }

  selectValueItemClass(item) {
    if (_.isEmpty(item)) {
      this.compInstance.itemMasterForm.controls.class.patchValue(null);
      return;
    }
    this.compInstance.itemMasterForm.controls.class.patchValue(item);
  }

  selectValueItemType(item) {
    // if (_.isEmpty(item)) {
    //   this.compInstance.itemMasterForm.controls.type.patchValue(null);
    //   return;
    // }
    // this.compInstance.itemMasterForm.controls.type.patchValue(item);
  }

  selectValueManufecturer(item) {
    if (_.isEmpty(item)) {
      this.compInstance.itemMasterForm.controls.manufacturer.patchValue(null);
      return;
    }
    this.compInstance.itemMasterForm.controls.manufacturer.patchValue(item);
  }

  get getFrmCntrols() {
    return this.compInstance.itemMasterForm.controls;
  }

  updateGstSale() {
    const formVal = _.cloneDeep(this.compInstance.itemMasterForm.value);
    this.itemMasterForm.controls.gstOnSale.patchValue(formVal.gstOnPurchase);
  }

  focusManufecture() {
    if (this.addMode.manufacturer) {
      setTimeout(() => {
        this.manufectureAddComp.nativeElement.focus();
      }, 500);
    } else {
      setTimeout(() => {
        this.manufectureSelectComp.focus();
      }, 500);
    }
  }

  focusBrand() {
    if (this.addMode.brandName) {
      setTimeout(() => {
        this.brandAddComp.nativeElement.focus();
      }, 500);
    } else {
      setTimeout(() => {
        this.brandSelectComp.focus();
      }, 500);
    }
  }

  focusPurchaseUnit() {
    if (this.addMode.purcheseUnit) {
      setTimeout(() => {
        this.purchaseUnitAddComp.nativeElement.focus();
      }, 500);
    } else {
      setTimeout(() => {
        this.purcheseUnitSelectComp.focus();
      }, 500);
    }
  }

  focusIssueUnit() {
    if (this.addMode.issueUnit) {
      setTimeout(() => {
        this.issueUnitAddComp.nativeElement.focus();
      }, 500);
    } else {
      setTimeout(() => {
        this.issueUnitSelectComp.focus();
      }, 500);
    }
  }

  focusOtConsumption() {
    if (this.addMode.otConsumptionUnit) {
      setTimeout(() => {
        this.otConsumptionAddComp.nativeElement.focus();
      }, 500);
    } else {
      setTimeout(() => {
        this.otConsumpSelectComp.focus();
      }, 500);
    }
  }

}

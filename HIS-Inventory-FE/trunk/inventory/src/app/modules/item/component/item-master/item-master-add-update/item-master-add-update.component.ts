import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { IAlert } from 'src/app/public/models/AlertMessage';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Constants } from 'src/app/config/constants';
import { Observable, of, concat, Subject } from 'rxjs';
import { map, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import * as _ from 'lodash';
import { MastersService } from 'src/app/modules/masters/services/masters.service';
import { MainGroup } from 'src/app/modules/masters/modals/maingroup.model';
import { SubGroup } from 'src/app/modules/masters/modals/subgroup.model';
import { Unit } from 'src/app/modules/masters/modals/unit.model';
import { ItemClass } from 'src/app/modules/masters/modals/itemclass.model';
import { ItemType } from 'src/app/modules/masters/modals/itemtype.model';
import { Manufacturer } from 'src/app/modules/masters/modals/manufacturer.model';

@Component({
  selector: 'app-item-master-add-update',
  templateUrl: './item-master-add-update.component.html',
  styleUrls: ['./item-master-add-update.component.scss']
})
export class ItemMasterAddUpdateComponent implements OnInit {
  @Input() supplierData: any;
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
  unitList = [];
  unitList$ = new Observable();
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
      this.loadMainGroupList('');
      this.loadItemClassList('');
      this.loadItemTypeList('');
      this.loadManufecturerList('');
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
      mainGrp: [null, [Validators.required]],
      subGrp: [null, [Validators.required]],
      code: [null],
      hsnCode: [null],
      description: [null, Validators.required],
      brandName: [null],
      // saleQty: [null],
      class: [null],
      unitPurchase: [null, Validators.required],
      unitIssue: [null, Validators.required],
      conversionFactor: [null, Validators.required],
      // type: [null, [Validators.required]],
      reOrderLevel: [null, [Validators.required]],
      gstOnPurchase: [null, [Validators.required]],
      gstOnSale: [null],
      manufacturer: [null],
      isAsset: [true],
      stockOnBatch: [true],
      issueOnBatch: [true],
      isSelleable: [true],
      expiryApplicable: [true],
      isActive: [true, [Validators.required]]
    };
    this.compInstance.itemMasterForm = this.fb.group(formObj);
    this.loadForm = true;
    this.compInstance.itemMasterForm.controls.gstOnSale.disable();
    if (form && form.itemId) {
      this.patchDefaultValue(form);
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
    if (val.vatPurchaseRate) {
      const vatObj = _.find(this.gstList, lst => {
        return lst.value === val.vatPurchaseRate;
      });
      vatVal = vatObj ? vatObj : null;
    }

    this.compInstance.itemMasterForm.patchValue({
      id: val.itemId,
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
    });
    if (this.compInstance.itemMasterForm.value.subgroup) {
      this.isSubGroupActive = false;
    }
  }

  saveValue() {
    this.submitted = true;
    if (this.submitted && this.compInstance.itemMasterForm.valid) {
      this.submitted = false;
      const formVal = this.compInstance.itemMasterForm.value;
      const param = {
        itemId: formVal.id ? formVal.id : 0,
        itemCode: formVal.code ? formVal.code : null,
        itemDescription: formVal.description ? formVal.description : null,
        // itemTypeId: formVal.type ? formVal.type.id : null,
        conversionFactor: formVal.conversionFactor ? formVal.conversionFactor : null,
        // saleQty: formVal.saleQty ? formVal.saleQty : null,
        reorderLevel: formVal.reOrderLevel ? formVal.reOrderLevel : null,
        vatPurchaseRate: formVal.gstOnPurchase ? formVal.gstOnPurchase.value : null,
        manufactureId: formVal.manufacturer ? formVal.manufacturer.id : null,
        itemClassId: formVal.class ? formVal.class.id : null,
        primaryGroupId: formVal.mainGrp ? formVal.mainGrp.id : null,
        subgroupId: formVal.subGrp ? formVal.subGrp.id : null,
        purchaseUnitId: formVal.unitPurchase ? formVal.unitPurchase.id : null,
        issueUnitId: formVal.unitIssue ? formVal.unitIssue.id : null,
        brandName: formVal.brandName ? formVal.brandName : null,
        hsnSacCode: formVal.hsnCode ? formVal.hsnCode : null,
        isAsset: formVal.isAsset ? formVal.isAsset : false,
        stockOnBatch: formVal.stockOnBatch ? formVal.stockOnBatch : false,
        issueOnBatch: formVal.issueOnBatch ? formVal.issueOnBatch : false,
        isSelleable: formVal.isSelleable ? formVal.isSelleable : false,
        expiryApplicable: formVal.expiryApplicable ? formVal.expiryApplicable : false,
        isActive: formVal.isActive,
      };
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
        switchMap(term => this.mastersService.getManufacturerBySearchKeyword(term, true).pipe(
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
}

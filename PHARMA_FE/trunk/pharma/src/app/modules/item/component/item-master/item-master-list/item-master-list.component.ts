import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DatatableComponent } from '@swimlane/ngx-datatable';
// import { ItemMasterService } from './../../../services/item-master.service';
import { Component, OnInit, ViewChild, OnDestroy, OnChanges, Input, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { ItemMasterAddUpdateComponent } from '../item-master-add-update/item-master-add-update.component';
import { CommonService } from 'src/app/public/services/common.service';
import { ActivatedRoute } from '@angular/router';
import { PermissionsConstants } from 'src/app/config/PermissionsConstants';
import { IAlert } from 'src/app/public/models/AlertMessage';
import * as _ from 'lodash';
import { Constants } from 'src/app/config/constants';
import { ConfirmationPopupComponent } from 'src/app/shared/confirmation-popup/confirmation-popup.component';
import { MastersService } from 'src/app/modules/masters/services/masters.service';
import { Observable, of, concat, Subject } from 'rxjs';
import { NgSelectComponent } from '@ng-select/ng-select';
import { map, takeUntil, distinctUntilChanged, switchMap, catchError, debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-item-master-list',
  templateUrl: './item-master-list.component.html',
  styleUrls: ['./item-master-list.component.scss']
})
export class ItemMasterListComponent implements OnInit, OnDestroy, OnChanges {
  @Input() supplierData: any;
  @ViewChild('categoryListComp') categoryListSelect: NgSelectComponent;
  @ViewChild(DatatableComponent, { static: false }) public table: DatatableComponent;
  @ViewChild('itemDesc') itemDescComp: ElementRef;
  pageSize;
  itemList = [];
  page: {
    size: number, // The number of elements in the page
    totalElements: number, // The total number of elements
    totalPages: number, // The total number of pages
    pageNumber: number, // The current page number
  };
  searchString: any;
  externalPaging: boolean;
  sortUserList: { sort_order: string, sort_column: string };
  alertMsg: IAlert;
  subject: Subject<string> = new Subject();
  ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  compInstance = this;
  isNgSelectTypeHeadDisabled = false;
  isFilterApply: boolean;
  datatableBodyElement: any;
  editPermission: boolean;
  PermissionConstantList: any = [];
  isActive: boolean;
  showAddPopup = false;
  $destroy: Subject<boolean> = new Subject();

  //start declaration by SB
  showPatientListFilter = false;
  itemListFilterForm: FormGroup;
  loadForm: boolean;
  isSubGroupActive = true;
  
  gstList = [];
  unitListOt = [];
  unitList = [];

  categoryList$ = new Observable<any>();
  unitList$ = new Observable();
  unitListOT$ = new Observable();
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
  categoryListInput$ = new Subject<any>();
  genCodeList$ = new Observable<any>();
  genCodeListInput$ = new Subject<any>();
  brandList$ = new Observable<any>();
  brandListInput$ = new Subject<any>();
  scheduleDrugList$ = new Observable<any>();
  scheduleDrugListInput$ = new Subject<any>();

  constructor(
    private commonService: CommonService,
    private route: ActivatedRoute,
    private mastersService: MastersService,
    public modalService: NgbModal,
    private fb: FormBuilder,
  ) { }

  ngOnInit(): void {
    console.log("Inside Init")
    this.PermissionConstantList = PermissionsConstants;
    this.defaultObject();
    this.pageSize = '15';
    this.subjectFun();
    this.createForm();
    this.getItemList();
    this.getCacheMasters();
    this.commonService.routeChanged(this.route);
    this.showActivePopup();
    this.getTaxMasterData().subscribe(res => {
      this.getAllUnitBySearch();
      this.getAllOTConsumptionUnitBySearch();
      this.loadMainGroupList('');
      this.loadItemClassList('');
      this.loadItemTypeList('');
      this.loadManufecturerList('');
      this.loadcategoryList('');
      this.loadGenricItemList('');
      this.loadBrandList('');
      this.loadScheduleDrugList('');
    });
  }

  createForm() {
    const formObj = {
      category: [null],
      manufacturer: [null],
      brandName: [null],
      unitPurchase: [null],
      unitIssue: [null],
      gstOnSale: [null],
      class: [null],
      genericCode: [null],
      scheduleDrug: [null]
    };
    this.compInstance.itemListFilterForm = this.fb.group(formObj);
    this.loadForm = true;
  }


  ngOnDestroy(): void {
    this.$destroy.next(true);
    this.$destroy.unsubscribe();
  }

  ngOnChanges() {
    this.getItemList();
  }

  defaultObject() {
    this.isFilterApply = false;
    this.page = { size: 15, totalElements: 0, totalPages: 10, pageNumber: 1 };
    this.sortUserList = { sort_order: 'desc', sort_column: 'itemId' };
    this.searchString = null;
    this.externalPaging = true;
    this.isActive = true;
  }

  subjectFun() {
    // -- Subscribe to the subject, which is triggered from search input and when section clicked
    // -- When the debounce time has passed, we call getActiveScheduleData()
    this.subject
      .pipe(debounceTime(500), takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.page.pageNumber = 1;
        this.getItemList();
      }
      );
  }

  getItemList(): void {

    const formValue = this.itemListFilterForm.getRawValue();
    const reqParams = {
      itemTypeId: 0,
      categoryId: formValue.category ? formValue.category.id : 0,
      genericCode: formValue.genericCode ? formValue.genericCode.id : 0,
      scheduledDrugsId: formValue.scheduleDrug ? formValue.scheduleDrug.scheduledDrugsTypeId : 0,
      manufactureId: formValue.manufacturer ? formValue.manufacturer.id : 0,
      brandId: formValue.brandName ? formValue.brandName.id : 0,
      purchaseUnitId: formValue.unitPurchase ? formValue.unitPurchase.id : 0,
      issueUnitId: formValue.unitIssue ? formValue.unitIssue.id : 0,
      itemClassId: formValue.class ? formValue.class.id : 0,
      primaryGroupId: 0,
      subgroupId: 0,
      stockUnitId: 0,
      searchKeyword: this.searchString,
      sortOrder: this.sortUserList.sort_order,
      sortColumn: this.sortUserList.sort_column,
      pageNumber: this.page.pageNumber,
      limit: this.page.size,
      isActive: this.isActive
    };
    this.mastersService.getItemMasterList(reqParams).subscribe(res => {
      if (res.data.length > 0) {
        this.itemList = res.data;
        console.log(this.itemList)
        this.page.totalElements = res.totalCount ? res.totalCount : res.data.length;
      } else {
        this.itemList = [];
        this.page.totalElements = 0;
      }
    });
  }

  clearSearchString(): void {
    this.searchString = null;
    this.getItemList();
  }

  editItemMaster(row): void {
    this.mastersService.getItemMasterDataByID(row.id).subscribe(response => {
      if (response.status_code === 200 && response.status_message === 'Success') {
        this.openPopup(response.data);
      } else {

      }
    });
  }

  addItemMaster(): void {
    this.openPopup(null);
  }

  openPopup(supplier) {
    const supplierDetail = {
      supplierData: supplier,
      type: supplier ? 'edit' : 'add'
    };
    const modalInstance = this.modalService.open(ItemMasterAddUpdateComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false,
        size: 'xl',
        windowClass: 'visit-modal',
        container: '#homeComponent'
      });
    modalInstance.result.then((result) => {
      if (result === 'save') {
        this.alertMsg = {
          message: 'Value Saved Successfully',
          messageType: 'success',
          duration: Constants.ALERT_DURATION
        };
      } else {
        this.alertMsg = {
          message: 'Value Updated Successfully',
          messageType: 'success',
          duration: Constants.ALERT_DURATION
        };
      }
      this.getItemList();
    }, (dis) => {

    });
    modalInstance.componentInstance.supplierData = supplierDetail;
  }

  onPageSizeChanged(newPageSize): void {
    this.sortUserList = { sort_order: 'desc', sort_column: 'itemId' };
    this.page.size = Number(newPageSize);
    this.page.pageNumber = 1;
    this.getItemList();
  }

  onSortChanged(event): void {
    if (event.sorts.length > 0) {
      const obj = event.sorts[0];
      this.sortUserList.sort_order = obj.dir;
      this.sortUserList.sort_column = this.getSortColumnName(obj.prop);
      this.getItemList();
    }
  }

  getSortColumnName(clmName): string {
    if (clmName === 'mainGroup') {
      return 'priGroupDesc';
    } else if (clmName === 'code') {
      return 'itemCode';
    } else if (clmName === 'description') {
      return 'itemDescription';
    } else if (clmName === 'conversionFactor') {
      return 'conversionFactor';
    } else if (clmName === 'saleQty') {
      return 'saleQty';
    } else if (clmName === 'reorderLevel') {
      return 'reorderLevel';
    } else if (clmName === 'vatPurchaseRate') {
      return 'vatPurchaseRate';
    } else if (clmName === 'manufacturer') {
      return 'manufacturerName';
    } else if (clmName === 'subGroup') {
      return 'subGroupDesc';
    } else if (clmName === 'category') {
      return 'categoryName';
    } else {
      return '';
    }
  }

  onSetPage(pageInfo) {
    this.table.offset = pageInfo.offset - 1;
    return;
  }

  deleteItem(row) {
    const modalTitleobj = 'Delete';
    const modalBodyobj = 'Do you want to delete this Item Master <span class="font-weight-500"> (' + row.code + ') </span>';
    const messageDetails = {
      modalTitle: modalTitleobj,
      modalBody: modalBodyobj
    };
    const modalInstance = this.modalService.open(ConfirmationPopupComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false
      });
    modalInstance.result.then((result) => {
      if (result === 'Ok') {
        this.mastersService.deleteItemMasterDataById(row.id).subscribe(response => {
          if (response.status_code === 200 && response.status_message === 'Success') {
            this.getItemList();
            this.alertMsg = {
              message: response.message,
              messageType: 'success',
              duration: Constants.ALERT_DURATION
            };
          } else {
            this.alertMsg = {
              message: response.message,
              messageType: 'warning',
              duration: Constants.ALERT_DURATION
            };
          }
        });
      }
    });
    modalInstance.componentInstance.messageDetails = messageDetails;
  }

  updateDataTable() {
    this.getItemList();
  }

  getCacheMasters() {
    const param = {
      searchKeyword: null
    };
    this.mastersService.getItemClassBySearchKeyword(param).subscribe();
    this.mastersService.getUnitMasterList().subscribe();
  }

  onFooterPage(event): void {
    this.page.pageNumber = event.page;
    this.getItemList();
  }

  showActivePopup() {
    this.commonService.$addPopupEvent.pipe(takeUntil(this.$destroy)).subscribe(popup => {
      if (popup && popup.redirectFromPage === '/inventory/masters/item/itemMaster') {
        this.showAddPopup = popup.isShowAddPopup;
        this.openPopup(null);
      } else {
        this.showAddPopup = false;
      }
    });
  }

  //start code by SB

  clearSearchFilter() {
    this.searchString = null;
    this.itemListFilterForm.reset();
    this.getItemList();
  }

  searchByFilter() {
    this.page.pageNumber = 1;
    this.showSearchFilter();
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
      this.mastersService.getSubGroupBySearchKeyword(searchTxt ? searchTxt : '', this.itemListFilterForm.controls.mainGrp.value ?
        this.itemListFilterForm.controls.mainGrp.value.id : null), // default items
      this.grpListSubAllInput$.pipe(
        distinctUntilChanged(),
        debounceTime(500),
        switchMap(term => this.mastersService.getSubGroupBySearchKeyword(term, this.itemListFilterForm.controls.mainGrp.value ?
          this.itemListFilterForm.controls.mainGrp.value.id : null).pipe(
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

  showSearchFilter() {
    this.showPatientListFilter = !this.showPatientListFilter;
    this.commonService.setPopupFlag(false, this.showPatientListFilter);
    this.getItemList();
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

  selectValueMainGrp(grp) {
    if (_.isEmpty(grp)) {
      this.compInstance.itemListFilterForm.patchValue({
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
    this.compInstance.itemListFilterForm.controls.mainGrp.patchValue(grp);
    this.compInstance.loadSubGroupList(null);
  }

  selectCategory(grp) {
    if (_.isEmpty(grp)) {
      this.compInstance.itemListFilterForm.patchValue({
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
    this.compInstance.itemListFilterForm.controls.category.patchValue(grp);
    // this.itemDescComp.nativeElement.focus();
  }

  selectValueSubGrp(grp) {
    if (_.isEmpty(grp)) {
      this.compInstance.itemListFilterForm.controls.subGrp.patchValue(null);
      return;
    }
    this.compInstance.itemListFilterForm.controls.subGrp.patchValue(grp);
  }

  selectValueItemClass(item) {
    if (_.isEmpty(item)) {
      this.compInstance.itemListFilterForm.controls.class.patchValue(null);
      return;
    }
    this.compInstance.itemListFilterForm.controls.class.patchValue(item);
  }

  selectValueItemType(item) {
    // if (_.isEmpty(item)) {
    //   this.compInstance.itemListFilterForm.controls.type.patchValue(null);
    //   return;
    // }
    // this.compInstance.itemListFilterForm.controls.type.patchValue(item);
  }

  selectValueManufecturer(item) {
    if (_.isEmpty(item)) {
      this.compInstance.itemListFilterForm.controls.manufacturer.patchValue(null);
      return;
    }
    this.compInstance.itemListFilterForm.controls.manufacturer.patchValue(item);
  }

}

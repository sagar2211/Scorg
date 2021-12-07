import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MastersService } from 'src/app/modules/masters/services/masters.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'src/app/public/services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { IAlert } from 'src/app/public/models/AlertMessage';
import { Observable, Subject, concat, of } from 'rxjs';
import { distinctUntilChanged, tap, switchMap, catchError, map, debounceTime } from 'rxjs/operators';
import * as _ from 'lodash';
import { Constants } from 'src/app/config/constants';
import { IndentService } from '../../../indent/services/indent.service';
import { IndentType } from '../../../indent/modals/indentType.model';
import { ConfirmationPopupComponent } from 'src/app/shared/confirmation-popup/confirmation-popup.component';
import { ConfirmationPopupWithReasonComponent } from 'src/app/shared/confirmation-popup-with-reason/confirmation-popup-with-reason.component';
import { PermissionsConstants } from "../../../../config/PermissionsConstants";
import { CommonService } from 'src/app/public/services/common.service';
import { DxDataGridComponent } from "devextreme-angular";
import CustomStore from "devextreme/data/custom_store";
import { NgSelectComponent } from '@ng-select/ng-select';
import * as moment from 'moment';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-material-indent-add-update',
  templateUrl: './material-indent-add-update.component.html',
  styleUrls: ['./material-indent-add-update.component.scss']
})
export class MaterialIndentAddUpdateComponent implements OnInit {
  @ViewChild('selectItem') select: NgSelectComponent;
  @ViewChild(DxDataGridComponent, { static: false }) public dataGrid: DxDataGridComponent;
  materialIndentForm: FormGroup;
  loadForm: boolean;
  alertMsg: IAlert;
  compInstance = this;
  isEditModeEnable: boolean;
  submitted: boolean;
  constants = null;
  editIndentData = null;
  userId;
  formLoading = false;
  indentTypesList = [];
  itemArray = [];
  focusIndex = null;
  selectedIndex = null;
  isAddedNewRow = false;
  editorOptions: object;

  toStoreList$ = new Observable<any>();
  toStoreListInput$ = new Subject<any>();
  categoryList$ = new Observable<any>();
  categoryListInput$ = new Subject<any>();
  itemMasterDataSource: any;
  itemList$ = new Observable<any>();
  itemListInput$ = new Subject<any>();
  indentDate : any;
  showDeptStrType = 'dept';
  constpermissionList: any = [];
  storeName: any;
  categoryList: CustomStore;
  selectedCategory = '';
  printData = null;
  deptName: any;
  constructor(
    private fb: FormBuilder,
    private mastersService: MastersService,
    private indentService: IndentService,
    private modalService: NgbModal,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private commonService: CommonService,
  ) { 
    this.editorOptions = {
      itemTemplate: "itemTemplate"
    }

    this.onEditorPreparing = this.onEditorPreparing.bind(this);
    this.onDelete = this.onDelete.bind(this);
    this.isAddIconVisible = this.isAddIconVisible.bind(this);
    this.onAddButtonClick = this.onAddButtonClick.bind(this);
  }

  ngOnInit(): void {
    this.getItemMasterDataSource();
    this.loadcategoryList('');
    this.constants = Constants;
    this.isEditModeEnable = false;
    this.submitted = false;
    this.userId = this.authService.getLoggedInUserId();
    this.storeName = JSON.parse(localStorage.getItem('globals')).storeName;
    this.deptName = JSON.parse(localStorage.getItem('globals')).dept_name;
    this.indentDate = moment(new Date()).format('DD-MM-YYYY');
    // this.loadStoreList('');
    // this.loadItemList('');
    this.addItemInArray(null, null);
    const id = +this.route.snapshot.params.id;
    this.getIndentTypesList().subscribe(res => {
      if (id && id > -1) {
        this.getIndentDataById(id).subscribe(res => {
          this.editIndentData = res;
          this.isEditModeEnable = true;
          this.createForm();
        });
      } else {
        this.createForm();
      }
    });
    this.constpermissionList = PermissionsConstants;
    this.commonService.routeChanged(this.route);
    setTimeout(() => {
      this.dataGrid?.instance.editCell(0,'itemDescription');
    }, 1500);
  }

  createForm() {
    this.patchDefaultValue();
  }

  patchDefaultValue() {
    const form = {
      // indentId: [null],
      // indentTypeId: [null, Validators.required],
      // indentTypeValue: [null],
      deptId: [this.authService.getLoginDepartmentId()],
      deptName: [this.authService.getLoginDepartmentName()],
      storeId: [this.authService.getLoginStoreId()],
      storeName: [this.authService.getLoginStoreName()],
      toStoreId: [null],
      toStore: [null],
      remark: [null, Validators.required],
      // itemTabelId: [null],
      itemId: [null],
      indentDate : [null],
      item: [null],
      indentQty: [null],
      isApproved: [false],
    };
    this.materialIndentForm = this.fb.group(form);
    if (this.isEditModeEnable) {
      this.patchFormValues();
    } else {
      this.loadForm = true;
    }
  }

  patchFormValues() {
    this.storeName = this.editIndentData?.storeName;
    this.deptName = this.editIndentData?.deptName;
    this.indentDate = moment(this.editIndentData?.indentDate).format('DD-MM-YYYY');
    const indentObj = {
      indentType: this.editIndentData.indentType,
      description: this.editIndentData.indentTypeName
    };

    const toStoreObj = {
      id: this.editIndentData.toStoreId,
      name: this.editIndentData.toStoreName,
      isActive: true,
      isMainStore: false,
      deptId: null
    };
    // this.materialIndentForm.controls.indentId.patchValue(this.editIndentData.indentId);
    // this.materialIndentForm.controls.indentTypeId.patchValue(this.editIndentData.indentType);
    // this.materialIndentForm.controls.indentTypeValue.patchValue(indentObj);
    this.materialIndentForm.controls.deptId.patchValue(this.editIndentData.deptId);
    this.materialIndentForm.controls.deptName.patchValue(this.editIndentData.deptName);
    this.materialIndentForm.controls.storeId.patchValue(this.editIndentData.storeId);
    this.materialIndentForm.controls.storeName.patchValue(this.editIndentData.storeName);
    this.materialIndentForm.controls.toStoreId.patchValue(this.editIndentData.toStoreId);
    this.materialIndentForm.controls.toStore.patchValue(toStoreObj);
    this.materialIndentForm.controls.remark.patchValue(this.editIndentData.remark);
    // this.showDeptStrType = this.materialIndentForm.value.indentTypeValue.indentType === 'DC' ? 'dept' : 'store';
    this.itemArray = [];
    _.map(this.editIndentData.indentDetailList, dt => {
      const obj = {
        tempId: Math.random(),
        id: dt.id,
        itemId: dt.itemId,
        item: {
          itemCode: dt.itemCode,
          itemDescription: dt.itemDescription,
          itemId: dt.itemId,
          unitId: dt.unitId ? dt.unitId : 0,
          unitName: dt.units,
        },
        category : 0,
        categoryName : dt.categoryName,
        itemDescription : dt.itemDescription,
        closingStock : 0,
        indentQty: dt.indentQty
      };
      this.itemArray.push(_.cloneDeep(obj));
    });
    this.isEditModeEnable = false;
    this.loadForm = true;
    // this.materialIndentForm.controls.indentTypeId.disable();
    // this.materialIndentForm.controls.toStoreId.disable();
  }

  private loadcategoryList(searchTxt?): void {
    let compObj = this;
    const param = {searchKeyword:"",sortOrder:"asc",sortColumn:"categoryName",pageNumber:1,limit:10,isActive:true};
    this.categoryList = new CustomStore({
      key: "itemCode",
      
      load: function (loadOptions: any) {
        return compObj.getcategoryListPromise(compObj, loadOptions.searchValue).then((result) => {
          return result;
        });
      },
      // Needed to process selected value(s) in the SelectBox, Lookup, Autocomplete, and DropDownBox
      byKey: (key) => {
        return compObj.getcategoryListPromise(compObj, key).then((result) => {
              return result;
            });
      }
    });
  }

  getcategoryListPromise(compObj, searchTxt) {
    const param = {
      searchKeyword: "",
      sortOrder: "",
      sortColumn: "",
      pageNumber: 1,
      limit: 10,
      isActive: true
    }
    searchTxt = '';
    return new Promise((resolve, reject) => {
      this.mastersService.getcategoryBySearchKeyword(param,'').subscribe(result => {
        _.map(result, item=>{
          item.categoryName = item.name;
        })
        resolve(result);
      });
    });
  }

  addItemInArray(item, index = null) {
    if (index !== null) {
      this.selectedIndex = null;
      this.focusIndex = null;
      //this.clearItemForm()
    }
    if ((item && item.indentQty) || index === null) {
      const form = {
        tempId: Math.random(),
        category : null,
        categoryName : null,
        item: null,
        itemDescription : null,
        closingStock : 0,
        indentQty: null,
      };
      this.itemArray.push({ ...form });
      this.isAddedNewRow = true;
      
    }
  }


  savematerialIndentForm() {
    this.submitted = true;
    
    _.remove(this.itemArray,item=>{
      return (!item.item || !item.indentQty)
    })
    _.map(this.itemArray,item=>{
      item.itemId = item.item.itemId;
      // item.categoryId = item.category.id;
    })
    if (this.submitted && this.materialIndentForm.valid && this.itemArray.length) {
      const formVal = this.materialIndentForm.value;
      const param = {
        indentId: this.editIndentData ? this.editIndentData.indentId : 0,
        deptId: JSON.parse(localStorage.getItem('globals')).dept_id,
        storeId: JSON.parse(localStorage.getItem('globals')).storeId,
        remark: formVal.remark,
        isApproved: formVal.isApproved,
        indentItemList: this.itemArray
      };
      this.indentService.saveIndent(param).subscribe(res => {
        this.alertMsg = {
          message: res.message,
          messageType: 'success',
          duration: Constants.ALERT_DURATION
        };
        this.redirectToListPage();
      });
    } else if (this.itemArray.length === 0) {
      this.alertMsg = {
        message: 'Please add items',
        messageType: 'warning',
        duration: Constants.ALERT_DURATION
      };
    }
  }

  // private loadItemList(searchTxt?): void {
  //   this.itemList$ = concat(
  //     this.mastersService.getItemBySearchKeyword(searchTxt ? searchTxt : ''), // default items
  //     this.itemListInput$.pipe(
  //       distinctUntilChanged(),
  //       debounceTime(500),
  //       tap(() => this.formLoading = true),
  //       switchMap(term => this.mastersService.getItemBySearchKeyword(term).pipe(
  //         catchError(() => of([])), // empty list on error
  //         tap(() => this.formLoading = false)
  //       ))
  //     )
  //   );
  // }

  getItemMasterDataSource() {
    let compObj = this;
    this.itemMasterDataSource = new CustomStore({
      key: "itemCode",
      load: function (loadOptions: any) {
        return compObj.getSupplierItemsListPromise(compObj, loadOptions.searchValue).then((result) => {
          return result;
        });
      },
      // Needed to process selected value(s) in the SelectBox, Lookup, Autocomplete, and DropDownBox
      byKey: (key) => {
        return compObj.getSupplierItemsListPromise(compObj, key).then((result) => {
              return result;
            });
      }
    });
  }

  getSupplierItemsListPromise(compObj, searchTxt) {
    searchTxt = searchTxt ? searchTxt : this.selectedCategory;
    return new Promise((resolve, reject) => {
      this.mastersService.getItemBySearchKeyword(searchTxt ? searchTxt : '').subscribe(result => {
        resolve(result);
      });
    });
  }

  getIndentTypesList(): Observable<any> {
    return this.indentService.getIndentTypes().pipe(map((res: any) => {
      this.indentTypesList = res;
      return res;
    }));
  }

  getIndentDataById(id): Observable<any> {
    return this.indentService.getIndentById(id).pipe(map((res: any) => {
      this.editIndentData = res;
      return res;
    }));
  }

  onStoreChange(event) {
    if (_.isEmpty(event)) {
      return;
    }
    else {
      this.materialIndentForm.patchValue({
        toStoreId: event.id,
        toStore: event,
      });
    }
  }

  // onItemChange(event) {
  //   if (_.isEmpty(event)) {
  //     this.clearItemValue();
  //     return;
  //   } else {
  //     this.materialIndentForm.patchValue({
  //       item: event,
  //     });
  //   }
  // }

  updateQty(newData, value, currentRowData){
    currentRowData.indentQty = parseFloat(value).toFixed(2);
  }

  // updateCategory(newData, value, currentRowData){
  //   currentRowData.category = value.name;
  // }

  onEditorPreparing(evt: any): void {

    evt.editorOptions.onValueChanged = (e: any) => {
      evt.setValue(e.value);
      this.selectedIndex = evt.row.rowIndex;
      let rowObj = this.itemArray[evt.row.rowIndex];
      //let rowObj = evt.row.data;

      // on qty change update total qty, amount, net amount
      if (evt.dataField == 'categoryName') {
        var category = e.component.option("selectedItem");
        this.selectedCategory = '';
        this.selectedCategory = e.value.name;
        rowObj.category = category;
        rowObj.categoryName = category.categoryName;
        evt.setValue(category.categoryName);
      } else if (evt.dataField == 'itemDescription') {
        const isExist = _.find(this.itemArray,(item, indx)=>{
          return (item.item?.itemId === e.value.itemId && indx !== evt.row.rowIndex)
        })
        if(isExist){
          this.notifyAlertMessage({
            msg: 'Item is already added...',
            class: 'danger',
          });
          rowObj.item = {};
          rowObj.itemDescription = '';
          this.dataGrid.instance.refresh();
          return 
        }
        var item = e.component.option("selectedItem");
        rowObj.item = item;
        rowObj.itemDescription = item.itemDescription;
        rowObj.categoryName = item.categoryName;
        evt.setValue(item.itemDescription);
        
        
        if(item.StockDetails)
        {
          let stock = _.sumBy(item.StockDetails,obj=>{
            console.log(obj)
            return obj.closingQty
          })
          console.log(stock)
          rowObj.closingStock = stock;
        }
        let el = this.dataGrid.instance.getCellElement(evt.row.rowIndex, 'indentQty');
        this.dataGrid.instance.focus(el);
        this.dataGrid.instance.refresh();
      }  else if (evt.dataField == 'indentQty') {
        rowObj.indentQty = _.toNumber(parseFloat(e.value || 0).toFixed(2));
        this.addNewEmptyRow();
        this.validateRowDetail(evt.row.rowIndex, 'indentQty');
      }
    }
  }

  onToolbarPreparing(e){  
    e.toolbarOptions.visible = false;  
}

  notifyAlertMessage(data): void {
    this.alertMsg = {
      message: data.msg,
      messageType: data.class,
      duration: Constants.ALERT_DURATION
    };
  }

  validateRowDetail(rowIndex, dataField?) {
    let flag = '';
    let rowObj = this.itemArray[rowIndex];
    if ((dataField == 'item' || !dataField) && (!rowObj.item || (rowObj.item && !rowObj.item.itemId))) {
      this.showValidationMsg('Item name is required');
      flag = 'item';
    } else if ((dataField == 'indentQty' || !dataField) && (!rowObj.indentQty || parseFloat(rowObj.indentQty || 0) <= 0)) {
      this.showValidationMsg('Indent Qty is required');
      flag = 'indentQty';
    }
    return flag;
  }

  showValidationMsg(msg) {
    this.alertMsg = {
      message: msg,
      messageType: 'warning',
      duration: Constants.ALERT_DURATION
    };
  }

  onDelete (e) {
    let rowIndex = e.row.rowIndex;
    _.remove(this.itemArray,(elmt,indx)=>{
      return (rowIndex === indx)
    })
    this.dataGrid.instance.refresh();
  }

  getPrintData(data) {
    const url = environment.REPORT_API + 'Report/PurchaseOrderPrint/?auth_token=' + this.authService.getAuthToken() + '&poId=' + data.id;
    this.printData = { url: url, returnType: false };
  }

  // addItemValue() {
  //   const checkIndex = _.findIndex(this.itemArray, itm => {
  //     return itm.itemId === this.materialIndentForm.value.item.itemId;
  //   });
  //   const obj = {
  //     id: 0,
  //     itemId: this.materialIndentForm.value.item.itemId,
  //     item: this.materialIndentForm.value.item,
  //     indentQty: this.materialIndentForm.value.qty
  //   };
  //   if (checkIndex === -1) {
  //     this.itemArray.push(_.cloneDeep(obj));
  //   } else if (this.materialIndentForm.value.itemTabelId === 0) {
  //     this.itemArray[checkIndex] = _.cloneDeep(obj);
  //   } else if (this.materialIndentForm.value.itemTabelId !== 0) {
  //     this.itemArray[checkIndex] = {
  //       id: this.materialIndentForm.value.itemTabelId,
  //       itemId: this.materialIndentForm.value.item.itemId,
  //       item: this.materialIndentForm.value.item,
  //       indentQty: this.materialIndentForm.value.qty
  //     };
  //   }
  //   this.clearItemValue();
  // }

  // clearItemValue() {
  //   this.materialIndentForm.patchValue({
  //     item: null,
  //     itemId: null,
  //     itemTabelId: null,
  //     qty: null,
  //   });
  // }

  get materialIndentFormControl() {
    return this.materialIndentForm.controls;
  }

  private get newRowIndex() {
    return 0; // this.billServiceArray.length - 1;
  }

  onAddButtonClick(evt) {
    let isValidDataField = this.validateRowDetail(evt.row.rowIndex)
    if (!isValidDataField) {
      this.addNewEmptyRow();
    }
  }

  isAddIconVisible(e) {
    return e.row.rowIndex === this.newRowIndex;
  }

  // editItem(item) {
  //   this.materialIndentForm.patchValue({
  //     itemId: item.itemId,
  //     item: item.item,
  //     qty: item.indentQty,
  //     itemTabelId: item.id
  //   });
  // }

  confirmDelete(item, index) {
    this.openConfirmPopup(index, 'Are you sure?', 'item');
  }

  // updateDeptStore(data) {
  //   if (_.isEmpty(data)) {
  //     this.materialIndentForm.patchValue({
  //       indentId: null,
  //       indentTypeId: null,
  //       indentTypeValue: null,
  //       toStoreId: null,
  //       toStore: null,
  //       remark: null,
  //       itemTabelId: null,
  //       itemId: null,
  //       item: null,
  //       qty: null,
  //     });
  //     this.showDeptStrType = null;
  //     return;
  //   }
  //   this.materialIndentForm.controls.indentTypeValue.patchValue(data);
  //   this.showDeptStrType = this.materialIndentForm.value.indentTypeValue.indentType === 'DC' ? 'dept' : 'store';
  // }

  addNewEmptyRow() {
    let index = this.itemArray.length-1;
    
    const form = {
      tempId: Math.random(),
      category : null,
      categoryName : null,
      item: null,
      itemDescription : null,
      closingStock : 0,
      indentQty: null,
      // indexFocus: (index !== null) ? (index + 1) : 0,
      // indexSelected: (index !== null) ? (index + 1) : 0,
    };
    this.itemArray.push({ ...form });
    setTimeout(() => {
      this.dataGrid.instance.editCell(this.itemArray.length-1,'itemDescription');
    }, 1000);
  }

  redirectToListPage() {
    this.router.navigate(['/inventory/indent/materialIndent/materialIndentList']);
  }

  updateStatus(status) {
    const msg = 'Do you want to ' + status + ' this Indent?';
    if (status === 'Delete') {
      this.openConfirmPopup(null, msg, status);
      return;
    }
    if (status !== this.constants.inventoryStatusApproved) {
      this.openConfirmReasonPopup(msg, status);
    } else {
      this.openConfirmPopup(null, msg, status);
    }
  }

  openConfirmPopup(val, msg, from) {
    const modalTitleobj = 'Confirm';
    const modalBodyobj = msg;
    const messageDetails = {
      modalTitle: modalTitleobj,
      modalBody: modalBodyobj,
      buttonType: 'yes_no'
    };
    const modalInstance = this.modalService.open(ConfirmationPopupComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false
      });
    modalInstance.result.then((result) => {
      if (result === 'yes') {
        if (from === 'item') {
          this.itemArray.splice(val, 1);
        }
        if (from === this.constants.inventoryStatusApproved) {
          this.approveIndent();
        }
        if (from === 'Delete') {
          this.deleteIndent();
        }
        return;
      } else {
        if (from === 'supplier') {

        }
        return;
      }
    });
    modalInstance.componentInstance.messageDetails = messageDetails;
  }

  openConfirmReasonPopup(msg, from) {
    const modalTitleobj = 'Confirm';
    const modalBodyobj = msg;
    const messageDetails = {
      modalTitle: modalTitleobj,
      modalBody: modalBodyobj,
      buttonType: 'yes_no',
    };
    const modalInstance = this.modalService.open(ConfirmationPopupWithReasonComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false
      });
    modalInstance.result.then((result) => {
      if (result.status === 'yes') {
        if (from === this.constants.inventoryStatusCancel) {
          this.cancelIndent(result.reason);
          return;
        } else if (from === this.constants.inventoryStatusRejected) {
          this.rejectIndent(result.reason);
          return;
        }
      }
    });
    modalInstance.componentInstance.messageDetails = messageDetails;
  }

  cancelIndent(val) {
    const param = {
      Id: this.materialIndentForm.value.indentId,
      remark: val ? val : null
    };
    this.indentService.cancelIndent(param).subscribe(res => {
      if (res.status_code === 200) {
        this.alertMsg = {
          message: 'Indent Cancel!',
          messageType: 'success',
          duration: Constants.ALERT_DURATION
        };
        setTimeout(() => {
          this.redirectToListPage();
        }, 1000);
      }
    });
  }

  approveIndent() {
    this.indentService.approveIndent(this.materialIndentForm.value.indentId).subscribe(res => {
      if (res.status_code === 200) {
        this.alertMsg = {
          message: 'Indent Approved!',
          messageType: 'success',
          duration: Constants.ALERT_DURATION
        };
        setTimeout(() => {
          this.redirectToListPage();
        }, 1000);
      }
    });
  }

  rejectIndent(val) {
    const param = {
      Id: this.materialIndentForm.value.indentId,
      remark: val ? val : null
    };
    this.indentService.rejectIndent(param).subscribe(res => {
      if (res.status_code === 200) {
        this.alertMsg = {
          message: 'Indent Rejected!',
          messageType: 'success',
          duration: Constants.ALERT_DURATION
        };
        setTimeout(() => {
          this.redirectToListPage();
        }, 1000);
      }
    });
  }

  deleteIndent() {
    this.indentService.deleteIndent(this.materialIndentForm.value.indentId).subscribe(res => {
      if (res.status_code === 200) {
        this.alertMsg = {
          message: 'Indent Deleted!',
          messageType: 'success',
          duration: Constants.ALERT_DURATION
        };
        setTimeout(() => {
          this.redirectToListPage();
        }, 1000);
      }
    });
  }

  decimalWithPrecision(data: any) {
    return parseFloat(data.value || 0).toFixed(2);
  }
}

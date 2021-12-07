import { Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DxDataGridComponent } from 'devextreme-angular';
import CustomStore from 'devextreme/data/custom_store';
import { Constants } from 'src/app/config/constants';
import { IssueService } from 'src/app/modules/issue/services/issue.service';
import { IAlert } from 'src/app/public/models/AlertMessage';
import { BatchListComponent } from '../batch-list/batch-list.component';
import * as _ from 'lodash';
import { AuthService } from 'src/app/public/services/auth.service';
import { MastersService } from 'src/app/modules/masters/services/masters.service';

@Component({
  selector: 'app-item-data-grid',
  templateUrl: './item-data-grid.component.html',
  styleUrls: ['./item-data-grid.component.scss']
})
export class ItemDataGridComponent implements OnInit, OnChanges {
  @ViewChild(DxDataGridComponent, { static: false }) public dataGrid: DxDataGridComponent;
  @Input() isBatchSelectSettingApply = true;
  @Input() itemListOperation = null;
  @Input() seletcedItemList = [];
  @Input() isEditingAllow = true;
  @Output() updatedItemList = new EventEmitter<any>();
  storeId: number;

  editorOptions: object;
  itemMasterDataSource: any;
  selectedIndex = 0;
  selectedIndexKey = 0;
  allowEditing = true;
  selectedItem;
  itemList: Array<any> = [];
  itemDropdownList: Array<any> = [];
  alertMsg: IAlert;
  itemStockList: Array<any> = [];
  itemBatchArray = [];
  cloneItemList = [];
  itemStockSetting = true;

  constructor(
    private issueService: IssueService,
    private modalService: NgbModal,
    private authService: AuthService,
    private mastersService: MastersService,
  ) {
    this.editorOptions = {
      itemTemplate: "itemTemplate"
    }
    this.getItemMasterDataSource();
    this.onEditorPreparing = this.onEditorPreparing.bind(this);
    this.onDelete = this.onDelete.bind(this);
    this.onAddNewItem = this.onAddNewItem.bind(this);
    this.isAddIconVisible = this.isAddIconVisible.bind(this);
  }

  ngOnInit(): void {
    this.storeId = this.authService.getLoginStoreId();
    this.addEmptyRow();
    this.getItemSetting()
  }

  ngOnChanges(): void {
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    //Add '${implements OnChanges}' to the class.
    if (this.itemListOperation === 'clear') {
      this.itemListOperation = null;
      this.itemList = [];
      this.cloneItemList = [];
      this.modalService.dismissAll();
      this.addEmptyRow();
    }
    if (this.itemListOperation === 'update' && this.seletcedItemList.length) {
      this.modalService.dismissAll();
      this.itemList = [...this.seletcedItemList];
      if (this.cloneItemList.length === 0) {
        this.cloneItemList = [...this.itemList];
      }
    }
    if (this.itemListOperation === 'update_prescription' && this.seletcedItemList.length) {
      this.addPrescriptionData();
    }
    if (this.itemListOperation === 'update_indent' && this.seletcedItemList.length) {
      this.addindentData();
    }
    this.allowEditing = this.isEditingAllow;
    if (this.allowEditing) {
      this.initDataGrid();
    }
  }

  getItemSetting() {
    return new Promise((resolve, reject) => {
      // let supplierId = compObj.purchaseForm && compObj.purchaseForm.value && compObj.purchaseForm.value.supplier ? compObj.purchaseForm.value.supplier.id : 3;
      this.mastersService.getPharmacySettings().subscribe(result => {
        this.itemStockSetting = result && result.length > 0 && result[0].value === 'N' ? false : true;
        resolve(result);
      });
    });
  }

  getItemMasterDataSource() {
    let compObj = this;
    this.itemMasterDataSource = new CustomStore({
      key: "itemName",
      load: function (loadOptions: any) {
        return compObj.getItemsListPromise(compObj, loadOptions.searchValue).then((result) => {
          return result;
        });
      },
      // Needed to process selected value(s) in the SelectBox, Lookup, Autocomplete, and DropDownBox
      byKey: (key) => {
        return compObj.getItemsListPromise(compObj, key).then((result) => {
          return result;
        });
      }
    });
  }

  getItemsListPromise(compObj, searchValue) {
    return new Promise((resolve, reject) => {
      // let supplierId = compObj.purchaseForm && compObj.purchaseForm.value && compObj.purchaseForm.value.supplier ? compObj.purchaseForm.value.supplier.id : 3;
      if (searchValue.length > 2) {
        compObj.mastersService.getItemBySearchKeyword(searchValue, this.itemStockSetting, this.storeId).subscribe(result => {
          result.map(d => {
            d.itemName = d.itemDescription;
            d.closingQty = _.sumBy(d.StockDetails, d => {
              return d.storeId === this.storeId ? d.closingQty : 0;
            });
            d.companyShortName = d.companyShortName ? d.companyShortName.slice(0, 3) : null;
            d.mrp = this.getMrp(d.StockDetails);
          })
          this.itemDropdownList = result;
          resolve(result);
        });
      } else {
        this.itemDropdownList = [];
        resolve([]);
      }
    });
  }

  getMrp(data) {
    if (data && data.length > 0) {
      const maxData = _.maxBy(data, 'stockId');
      return maxData.mrp;
    } else {
      return 0;
    }

  }

  addEmptyRow() {
    const form = {
      amount: 0,
      batchNo: null,
      expiryDate: null,
      id: 0,
      itemCode: null,
      itemId: null,
      itemName: null,
      item: null,
      qty: null,
      remark: null,
      stockId: null,
      tempHoldId: null,
      unitRate: 0,
      discountPercent: null,
      discountAmount: null,
      netAmount: 0,
      gstAmount: 0,
      gstPercent: 0,
      prescriptionData: [],
      indentData: [],
      tempId: Math.random()
    };
    this.itemList.push({ ...form });
  }

  allowDeleting(e) {
    return e.component.totalCount() == 1 ? e.row.rowIndex != 0 : true;
  }

  updateEditItemQty(item, e, evt) {
    const findData = _.find(this.cloneItemList, itm => {
      return itm.id === item.id;
    });
    let qty = 0;
    if (e.value > findData.qty) {
      qty = e.value - findData.qty;
      this.updateQtyVal(evt.row.rowIndex, this.itemList[evt.row.rowIndex], qty, findData.qty);
    } else if (e.value < findData.qty) {
      qty = e.value;
      const index = evt.row.rowIndex;
      const stk = this.itemList[index];
      this.itemList[index].qty = qty;
      this.itemList[index].amount = +((qty * stk.unitRate).toFixed(2));
      this.itemList[index].discountAmount = ((this.itemList[index].amount * stk.discountPercent) / 100).toFixed(2);
      this.itemList[index].netAmount = ((+this.itemList[index].amount - +this.itemList[index].discountAmount)).toFixed(2);
      this.itemList[index].gstAmount = this.calculateGstAmount(stk.gstPercent, this.itemList[index].amount, this.itemList[index].discountAmount);
    }
  }

  clearCurrentItemRow(index) {
    const reqParams = [this.itemList[index].tempHoldId];
    this.issueService.itemStockRelease(reqParams).subscribe();
    this.itemList[index].qty = 0;
    this.itemList[index].amount = 0;
    this.itemList[index].discountAmount = 0;
    this.itemList[index].netAmount = 0;
    this.itemList[index].gstAmount = 0;
    this.itemList[index].batchNo = null;
    this.itemList[index].discountPercent = null;
    this.itemList[index].expiryDate = null;
    this.itemList[index].remark = null;
    this.itemList[index].stockId = null;
    this.itemList[index].tempHoldId = null;
    this.itemList[index].unitRate = null;
    this.itemList[index].id = null;
    this.itemList[index].itemCode = null;
    this.itemList[index].itemId = null;
    this.itemList[index].itemName = null;
    this.itemList[index].item = null;
    this.itemList[index].gstPercent = null;
    this.itemList[index].prescriptionData = null;
    this.itemList[index].indentData = null;
    this.itemList[index].tempId = Math.random();
  }

  onEditorPreparing(evt: any): void {
    if (evt.parentType == "dataRow") {
      evt.editorOptions.onKeyDown = (arg) => {
        if (evt.dataField == "itemName" && arg.event.keyCode == 9 && parseFloat(arg.component.option("text") || 0) <= 0) {
          this.showValidationMsg('Item should be not be empty');
          arg.event.preventDefault();
        }
        if (evt.dataField == "qty" && arg.event.keyCode == 9 && parseFloat(arg.component.option("text") || 0) <= 0) {
          this.showValidationMsg('Qty should be not be empty');
          arg.event.preventDefault();
        }
        if ((evt.dataField === "discountAmount" || evt.dataField === "discountPercent") && arg.event.keyCode == 9) {
          let isValidDataField = this.validateRowDetail(evt.row.rowIndex);
          if (isValidDataField) {
            let el = evt.component.getCellElement(evt.row.rowIndex, isValidDataField);
            evt.component.focus(el);
            arg.event.preventDefault();
          }
        }
        if (evt.dataField == "remark" && arg.event.keyCode == 9 && (evt.row.dataIndex === (this.itemList.length - 1))) {
          let isValidDataField = this.validateRowDetail(evt.row.rowIndex);
          if (!isValidDataField) {
            this.addEmptyRow();
            this.initDataGrid(this.itemList.length - 1);
          } else {
            let el = evt.component.getCellElement(evt.row.rowIndex, isValidDataField);
            evt.component.focus(el);
            arg.event.preventDefault();
          }
        }
      }
    }

    evt.editorOptions.onValueChanged = (e: any) => {
      // evt.setValue(e.value);
      this.selectedIndex = evt.row.rowIndex;
      this.selectedIndexKey = evt.dataField;
      let rowObj = this.itemList[evt.row.rowIndex];
      if (evt.dataField == 'itemName') {
        var itemObj = e.component.option("selectedItem");
        if (rowObj.itemId && rowObj.itemId !== itemObj.itemId) {
          this.clearCurrentItemRow(evt.row.rowIndex);
        }
        if (itemObj.closingQty > 0) {
          this.selectedItem = { ...itemObj };
          this.itemList[evt.row.rowIndex].itemCode = _.cloneDeep(this.selectedItem.itemCode);
          this.itemList[evt.row.rowIndex].itemId = _.cloneDeep(this.selectedItem.itemId);
          this.itemList[evt.row.rowIndex].itemName = _.cloneDeep(this.selectedItem.itemName);
          this.itemList[evt.row.rowIndex].item = { ...this.selectedItem };
          this.onItemChange(this.selectedItem).then(res => {
            this.selectedItem = null;
            if (this.isBatchSelectSettingApply) {
              this.getBatchListPopup();
            } else {
              this.dataGrid.instance.editCell(evt.row.rowIndex, 'qty');
            }
          });
        } else {
          this.dataGrid.instance.editCell(evt.row.rowIndex, 'itemName');
          this.showValidationMsg('No Stock Found');
          rowObj.itemId = null;
          return;
        }
      } else if (evt.dataField == 'qty') {
        this.onItemChange(this.itemList[evt.row.rowIndex].item).then(res => {
          if (this.itemList[evt.row.rowIndex].id) {
            this.updateEditItemQty(this.itemList[evt.row.rowIndex], e, evt);
          } else {
            this.itemList[evt.row.rowIndex].qty = e.value;
            this.updateQtyVal(evt.row.rowIndex, rowObj);
            if (this.itemList[evt.row.rowIndex].qty) {
              setTimeout(() => {
                this.dataGrid.instance.editCell(evt.row.rowIndex, 'discountAmount');
              }, 100);
            } else {
              this.dataGrid.instance.editCell(evt.row.rowIndex, 'itemName');
            }
          }
          this.updatedItemList.emit(this.itemList);
        });
      } else if (evt.dataField == 'discountAmount') {
        if (e.value > rowObj.amount) {
          rowObj.discountAmount = 0;
          this.showValidationMsg('Discount Amount must be less or equal to Amount');
          return;
        }
        const discPerMain = ((e.value * 100) / +rowObj.amount).toFixed(2);
        rowObj.discountAmount = e.value;
        rowObj.discountPercent = discPerMain;
        rowObj.netAmount = (+rowObj.amount - +rowObj.discountAmount).toFixed(2);
        this.itemList[evt.row.rowIndex].gstAmount = this.calculateGstAmount(this.itemList[evt.row.rowIndex].gstPercent, rowObj.amount, rowObj.discountAmount);
      } else if (evt.dataField == 'discountPercent') {
        if (e.value > 100) {
          this.showValidationMsg('Discount Percent must be less or equal to 100');
          rowObj.discountPercent = 0;
          return;
        }
        rowObj.discountAmount = ((rowObj.amount * e.value) / 100).toFixed(2);;
        rowObj.discountPercent = e.value;
        rowObj.netAmount = (+rowObj.amount - +rowObj.discountAmount).toFixed(2);
        this.itemList[evt.row.rowIndex].gstAmount = this.calculateGstAmount(this.itemList[evt.row.rowIndex].gstPercent, rowObj.amount, rowObj.discountAmount);
      } else if (evt.dataField == 'remark') {
        rowObj.remark = e.value;
      }
      this.updatedItemList.emit(this.itemList);
    }

    evt.editorOptions.onOpened = (arg) => {
      var popupInstance = arg.component._popup;
      popupInstance.option('width', 750);
      popupInstance.off("optionChanged", this.optionChangedHandler);
      popupInstance.on("optionChanged", this.optionChangedHandler);
    }
  }

  optionChangedHandler(args) {
    if (args.name == "width" && args.value < 700) {
      args.component.option("width", 750);
    }
  }

  updateQtyVal(index, rowObj, isForEdit?, cloneQty?) {
    this.updateItemBatchValue(rowObj, isForEdit);
    const batchArryData = this.onAddItem();
    if (!batchArryData) {
      this.itemList[index].itemCode = null;
      this.itemList[index].itemId = 0;
      this.itemList[index].itemName = null;
      this.itemList[index].item = null;
      this.itemList[index].qty = 0;
      return;
    }
    const batchArry = batchArryData.batch;
    const holdQtyArray = batchArryData.hold;
    if (isForEdit) {

    } else {
      this.itemStockHoldList(holdQtyArray);
    }
    _.map(batchArry, (d, i) => {
      if (isForEdit) {
        if (this.itemList[index].stockId === d.stockId) {
          // need to update hold data
          holdQtyArray.map(s => {
            if (this.itemList[index].stockId === s.stockId) {
              s.holdQty = (s.holdQty + +(cloneQty || 0));
            }
          });
          this.itemStockHoldList(holdQtyArray);
        } else {
          // add new row

        }
      }
      if (i === 0) {
        this.itemList[index].qty = (+d.qty + +(cloneQty || 0));
        this.itemList[index].amount = +((this.itemList[index].qty * d.unitRate).toFixed(2));
        this.itemList[index].discountAmount = ((this.itemList[index].amount * d.discountPercent) / 100).toFixed(2);
        this.itemList[index].netAmount = ((this.itemList[index].amount - +this.itemList[index].discountAmount)).toFixed(2);
        this.itemList[index].gstAmount = this.calculateGstAmount(this.itemList[index].gstPercent, this.itemList[index].amount, +this.itemList[index].discountAmount);

        this.itemList[index].batchNo = d.batchNo;
        this.itemList[index].discountPercent = d.discountPercent || 0;
        this.itemList[index].expiryDate = d.expiryDate;
        this.itemList[index].remark = d.remark;
        this.itemList[index].stockId = d.stockId;
        this.itemList[index].tempHoldId = d.tempHoldId;
        this.itemList[index].unitRate = d.unitRate;
        this.itemList[index].id = d.id;
        this.itemList[index].itemCode = d.itemCode;
        this.itemList[index].itemId = d.itemId;
        this.itemList[index].itemName = d.itemName;
        this.itemList[index].item = d.item;
        this.itemList[index].gstPercent = this.itemList[index].gstPercent || d.gstPercent;
        this.itemList[index].prescriptionData = d.prescriptionData || [];
        this.itemList[index].indentData = d.indentData || [];
        this.itemList[index].tempId = Math.random();
      } else {
        const obj = {
          amount: d.amount,
          batchNo: d.batchNo,
          discountAmount: d.discountAmount || null,
          discountPercent: d.discountPercent || null,
          expiryDate: d.expiryDate,
          netAmount: d.netAmount,
          qty: d.qty,
          remark: d.remark,
          gstAmount: d.gstAmount,
          gstPercent: d.gstPercent,
          stockId: d.stockId,
          tempHoldId: d.tempHoldId,
          unitRate: d.unitRate,
          id: 0,
          itemCode: rowObj.itemCode,
          itemId: rowObj.itemId,
          itemName: rowObj.itemName,
          item: rowObj.item,
          prescriptionData: rowObj.prescriptionData || null,
          indentData: rowObj.indentData || null,
          tempId: Math.random()
        }
        this.itemList.push({ ...obj });
      }
    });
  }

  isAddIconVisible(e) {
    return e.row.rowIndex === this.itemList.length - 1;
  }

  initDataGrid(index?) {
    setTimeout(() => {
      this.dataGrid.instance.editCell(index ? index : 0, 'itemName');
    }, 500);
  }

  onAddNewItem(e) {
    let rowIndex = e.row.rowIndex;
    if (this.itemList[rowIndex].itemId && this.itemList[rowIndex].qty) {
      this.addEmptyRow();
      this.initDataGrid(this.itemList.length - 1);
      this.updatedItemList.emit(this.itemList);
    }
  }

  onDelete(e) {
    let rowIndex = e.row.rowIndex;
    this.onDeleteItem(rowIndex);
    this.dataGrid.instance.refresh();
    this.initDataGrid();
    this.updatedItemList.emit(this.itemList);
  }

  validateRowDetail(rowIndex, dataField?) {
    let flag = '';
    let rowObj = this.itemList[rowIndex];
    if ((dataField == 'itemName' || !dataField) && (!rowObj.item || (rowObj.item && !rowObj.item.itemId))) {
      this.showValidationMsg('Item name is required');
      flag = 'item';
    } else if ((dataField == 'qty' || !dataField) && (!rowObj.qty || parseFloat(rowObj.qty || 0) <= 0)) {
      this.showValidationMsg('Qty is required');
      flag = 'qty';
    } else if ((dataField == 'discountAmount' || !dataField) && (rowObj.discountAmount > rowObj.amount)) {
      this.showValidationMsg('Check Discount');
      flag = 'discountAmount';
    } else if ((dataField == 'discountPercent' || !dataField) && (+rowObj.discountPercent > 100)) {
      this.showValidationMsg('Check Discount');
      flag = 'discountPercent';
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

  decimalWithPrecision(data: any) {
    return parseFloat(data.value || 0).toFixed(2);
  }

  setItemStock(stock, itemId) {
    const findIndex = _.findIndex(this.itemStockList, d => {
      return d.itemId === itemId;
    });
    if (findIndex === -1) {
      const obj = {
        itemId: itemId,
        stock: stock,
        selectedStock: null
      };
      this.itemStockList.push({ ...obj });
    } else {
      this.itemStockList[findIndex].stock = stock;
    }
  }

  setItemStockSelected(stock, itemId) {
    const findIndex = _.findIndex(this.itemStockList, d => {
      return d.itemId === itemId;
    });
    if (findIndex === -1) {

    } else {
      this.itemStockList[findIndex].selectedStock = stock;
    }
  }

  getItemStock(itemId) {
    const findIndex = _.findIndex(this.itemStockList, d => {
      return d.itemId === itemId;
    });
    if (findIndex !== -1) {
      return this.itemStockList[findIndex].stock;
    } else {
      return [];
    }
  }

  getItemStockSelcted(itemId) {
    const findIndex = _.findIndex(this.itemStockList, d => {
      return d.itemId === itemId;
    });
    if (findIndex !== -1) {
      return this.itemStockList[findIndex].selectedStock;
    } else {
      return null;
    }
  }

  onItemChange(event) {
    const promise = new Promise((resolve, reject) => {
      if (!event) {
        this.itemBatchArray.length = 0;
        return;
      }
      // if (this.getItemStock(event.itemId).length > 0) {
      //   resolve(true);
      // }
      this.itemBatchArray.length = 0;
      const reqParams = {
        storeId: this.storeId,
        itemId: event.itemId
      };
      this.issueService.getItemStockById(reqParams).subscribe(res => {
        if (res && res.length) {
          this.setItemStock(res, event.itemId);
        } else {
          this.alertMsg = {
            message: 'No Stock Found',
            messageType: 'danger',
            duration: Constants.ALERT_DURATION
          };
        }
        resolve(true);
      });
    });
    return promise;
  }

  getBatchListPopup() {
    const modalInstance = this.modalService.open(BatchListComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false,
        size: 'xl',
        container: '#homeComponent'
      });
    modalInstance.result.then((result) => {
      if (result.type === 'yes') {
        this.setItemStockSelected(result.data, this.itemList[this.selectedIndex].itemId);
        this.dataGrid.instance.editCell(this.selectedIndex, 'qty');
        return;
      } else if (result.type === 'no') {
        this.itemList[this.selectedIndex].item = null;
        this.initDataGrid(this.selectedIndex);
        return;
      }
    });
    modalInstance.componentInstance.stockData = this.getItemStock(this.itemList[this.selectedIndex].itemId);
    modalInstance.componentInstance.stockDataSelected = this.getItemStockSelcted(this.itemList[this.selectedIndex].itemId);
  }

  calculateGstAmount(gstPercent, amount, discount) {
    return ((+amount - +discount) * +gstPercent) / (100 + +gstPercent);
  }

  updateItemBatchValue(rowData, isForEdit?) {
    this.itemBatchArray = []
    const data = rowData;
    if (isForEdit) {
      data.qty = isForEdit;
    }
    let stockList = this.getItemStock(rowData.itemId);
    if (this.getItemStockSelcted(rowData.itemId)) {
      stockList = [this.getItemStockSelcted(rowData.itemId)];
    }
    const ttlAvlQty = _.sumBy(stockList, 'closingQty');
    if (data.qty > 0) {
      if (ttlAvlQty >= data.qty) {
        let currentQty = _.cloneDeep(data.qty);
        _.map(stockList, stkData => {
          if (currentQty === 0) {
            return;
          }
          const stk = _.cloneDeep(stkData);
          if (stkData.closingQty >= currentQty) {
            stk.tempHoldId = isForEdit ? rowData.tempHoldId : new Date().getTime();
            stk.qty = currentQty;
            stk.amount = +((stk.qty * stk.unitRate).toFixed(2));
            stk.discountPercent = data.discountPercent || 0;
            stk.discountAmount = ((stk.amount * stk.discountPercent) / 100).toFixed(2);
            stk.netAmount = ((+stk.amount - +stk.discountAmount)).toFixed(2);
            stk.remark = data.remark ? data.remark : null;
            stk.gstPercent = stk.gstPer ? stk.gstPer : 0;
            stk.gstAmount = this.calculateGstAmount(stk.gstPer, stk.amount, stk.discountAmount);
            stk.itemId = data.itemId;
            stk.itemName = data.itemName;
            stk.itemCode = data.itemCode;
            stk.item = data.item;
            stk.id = 0;
            currentQty = 0;
            stk.itemStk = stkData;
            stk.prescriptionData = data.prescriptionData || null;
            stk.indentData = data.indentData || null;
            this.itemBatchArray.push(_.cloneDeep(stk));
          } else if (stkData.closingQty > 0 && stkData.closingQty <= currentQty) {
            stk.tempHoldId = new Date().getTime();
            stk.qty = stkData.closingQty;
            stk.amount = +((stk.qty * stk.unitRate).toFixed(2));
            stk.discountPercent = data.discountPercent || 0;
            stk.discountAmount = ((stk.amount * stk.discountPercent) / 100).toFixed(2);
            stk.netAmount = ((+stk.amount - +stk.discountAmount)).toFixed(2);
            stk.remark = data.remark ? data.remark : null;
            stk.itemId = data.itemId;
            stk.itemName = data.itemName;
            stk.itemCode = data.itemCode;
            stk.item = data.item;
            stk.prescriptionData = data.prescriptionData || null;
            stk.indentData = data.indentData || null;
            stk.id = 0;
            stk.gstPercent = data.gstPer ? data.gstPer : 0;
            stk.gstAmount = this.calculateGstAmount(data.gstPer, stk.amount, stk.discountAmount);
            currentQty = +currentQty - stk.qty;
            stk.itemStk = stkData;
            this.itemBatchArray.push(_.cloneDeep(stk));
          }
        });
      } else {
        this.alertMsg = {
          message: 'Only ' + ttlAvlQty + ' unit is available',
          messageType: 'warning',
          duration: Constants.ALERT_DURATION
        };
        rowData.qty = ttlAvlQty;
        this.updateItemBatchValue(rowData, isForEdit);
      }
    }
  }

  onDeleteItem(indx): void {
    this.itemStockRelease(this.itemList[indx]);
    this.itemList.splice(indx, 1);
  }

  itemStockRelease(data): void {
    const reqParams = [data.tempHoldId];
    this.issueService.itemStockRelease(reqParams).subscribe();
  }

  itemStockHoldList(data): void {
    this.issueService.itemStockHoldList(data).subscribe();
  }

  onAddItem() {
    if (this.itemBatchArray.length == 0) {
      // this.isItemSubmit = false;
      this.alertMsg = {
        message: 'Please Add Items',
        messageType: 'danger',
        duration: Constants.ALERT_DURATION
      };
      return;
    }
    const holdQtyArray = [];
    const batchAry = [];
    _.map(this.itemBatchArray, stk => {
      const obj = {
        amount: stk.amount,
        batchNo: stk.batchNo,
        expiryDate: stk.expiryDate,
        id: stk.id,
        itemCode: stk.itemCode,
        itemId: stk.itemId,
        prescriptionData: stk.prescriptionData || null,
        indentData: stk.indentData || null,
        itemName: stk.itemName,
        item: stk.item,
        qty: stk.qty,
        remark: stk.remark,
        stockId: stk.stockId,
        tempHoldId: stk.tempHoldId,
        unitRate: stk.unitRate,
        discountPercent: stk.discPer || 0,
        discountAmount: stk.discAmt || 0,
        netAmount: stk.netAmount,
        gstPercent: stk.gstPer ? stk.gstPer : 0,
        gstAmount: this.calculateGstAmount(stk.gstPer, stk.amount, stk.discountAmount)
      };
      batchAry.push({ ...obj });
      // this.itemList[this.dataGrid.focusedRowIndex] = { ...obj };
      const reqParams = {
        tempHoldId: stk.tempHoldId,
        storeId: this.storeId,
        stockId: stk.stockId,
        itemId: stk.itemId,
        holdQty: stk.qty
      };
      holdQtyArray.push(_.cloneDeep(reqParams));
    });
    // this.clearItemForm();
    // this.itemBatchArray.length = 0;
    // this.totolAmtCal();
    // this.itemStockHoldList(holdQtyArray);
    return { batch: batchAry, hold: holdQtyArray };
  }

  addPrescriptionData() {
    const prescriptionData = [...this.seletcedItemList];
    const callArray = [];
    prescriptionData.map(d => {
      this.setItemStock(d.closingStockData, d.medicineId);
      if (this.itemList[this.selectedIndex].item && this.itemList[this.selectedIndex].qty) {
        this.addEmptyRow();
        this.selectedIndex = this.itemList.length - 1;
      }
      this.updatePrescriptionItem(d);
    });
    this.updatedItemList.emit(this.itemList);
  }

  addindentData() {
    const indentData = [...this.seletcedItemList];
    indentData.map(d => {
      this.setItemStock(d.closingStockData, d.itemId);
      if (this.itemList[this.selectedIndex].item && this.itemList[this.selectedIndex].qty) {
        this.addEmptyRow();
        this.selectedIndex = this.itemList.length - 1;
      }
      this.updateIndentItem(d);
    });
    this.updatedItemList.emit(this.itemList);
  }

  updatePrescriptionItem(item) {
    this.itemList[this.selectedIndex].itemCode = _.cloneDeep(item.itemCode || null);
    this.itemList[this.selectedIndex].itemId = _.cloneDeep(item.medicineId);
    this.itemList[this.selectedIndex].itemName = _.cloneDeep(item.medicineName);
    this.itemList[this.selectedIndex].item = {
      itemId: item.medicineId,
      itemName: item.medicineName,
      itemCode: item.itemCode || null
    };
    this.selectedItem = { ...this.itemList[this.selectedIndex].item };
    this.itemList[this.selectedIndex].qty = item.saleQty;
    this.itemList[this.selectedIndex].prescriptionData = item.prescriptionData || null;
    this.updateQtyVal(this.selectedIndex, this.itemList[this.selectedIndex]);
    this.onItemChange(this.itemList[this.selectedIndex].item).then(res => { });
  }

  updateIndentItem(item) {
    this.itemList[this.selectedIndex].itemCode = _.cloneDeep(item.itemCode || null);
    this.itemList[this.selectedIndex].itemId = _.cloneDeep(item.itemId);
    this.itemList[this.selectedIndex].itemName = _.cloneDeep(item.itemName);
    this.itemList[this.selectedIndex].item = {
      itemId: item.itemId,
      itemName: item.itemName,
      itemCode: item.itemCode || null
    };
    this.selectedItem = { ...this.itemList[this.selectedIndex].item };
    this.itemList[this.selectedIndex].qty = item.saleQty;
    this.itemList[this.selectedIndex].indentData = item.indentData || null;
    this.updateQtyVal(this.selectedIndex, this.itemList[this.selectedIndex]);
    this.onItemChange(this.itemList[this.selectedIndex].item).then(res => { });
  }

}

import { Component, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DxDataGridComponent } from 'devextreme-angular';
import { IssueService } from 'src/app/modules/issue/services/issue.service';
import { IAlert } from 'src/app/public/models/AlertMessage';
import { AuthService } from 'src/app/public/services/auth.service';
import * as _ from 'lodash';
import { Constants } from 'src/app/config/constants';
import * as moment from 'moment';

@Component({
  selector: 'app-show-indent-item-data',
  templateUrl: './show-indent-item-data.component.html',
  styleUrls: ['./show-indent-item-data.component.scss']
})
export class ShowIndentItemDataComponent implements OnInit {
  @ViewChild(DxDataGridComponent, { static: false }) public dataGrid: DxDataGridComponent;
  @ViewChild(DxDataGridComponent, { static: false }) public dataGridItem: DxDataGridComponent;
  @Input() formData;
  @Input() indentItemListSelected = [];
  @Input() indentItemList = [];
  alertMsg: IAlert;
  allMode: string;
  checkBoxesMode: string;
  selectedPrescription = [];
  editorOptions: object;
  selectedRowKeys = [];
  allowEditingSale = false;

  constructor(
    public modal: NgbActiveModal,
    public issueService: IssueService,
    public authService: AuthService,
  ) {
    this.allMode = 'page';
    this.checkBoxesMode = 'onClick'
    this.editorOptions = {
      itemTemplate: "itemTemplate"
    }
    this.onEditorPreparing = this.onEditorPreparing.bind(this);
    this.onRowPrepared = this.onRowPrepared.bind(this);
  }

  ngOnInit(): void {
    this.getIndentItemList();
    if (this.indentItemListSelected.length > 0) {
      this.selectedRowKeys = _.map(this.indentItemListSelected, d => {
        return d.prescriptionId;
      });
      this.selectedRowKeys = _.uniq(this.selectedRowKeys);
    }
    this.initDataGrid();
  }

  initDataGrid(index?) {
    setTimeout(() => {
      let el = this.dataGrid.instance.getCellElement(0, 'prescriptionId');
      this.dataGrid.instance.focus(el);
      this.dataGrid.instance.selectRows(this.selectedRowKeys, true);
    }, 500);
  }

  initItemDataGrid(index?, keys?) {
    setTimeout(() => {
      this.dataGridItem.instance.editCell(index ? index : 0, 'saleQty');
      if (keys) {
        this.dataGridItem.instance.selectRows(keys, true);
      }
    }, 500);
  }

  closePopup(from?) {
    const obj = {
      data: from || null,
      type: from ? 'yes' : 'no'
    }
    this.modal.close(obj);
  }

  getIndentItemList() {
    let res = [...this.indentItemList];
    res.map(d => {
      d.closingStock = _.sumBy(d.closingStockData, 'closingQty');
      d.id = Math.random();
      if (d.closingStock === 0) {
        d.saleQty = 0;
      }
    });
    this.indentItemList = [...res];
    if (this.indentItemListSelected.length > 0) {
      const keys = [];
      _.map(this.indentItemListSelected, d => {
        const find = _.find(this.indentItemList, p => {
          return p.indentId === d.indentId && p.indentId === d.indentId;
        });
        if (find) {
          keys.push(find.id);
        }
      });
      this.dataGridItem.instance.selectRows(keys, true);
      this.initItemDataGrid(null, keys);
    } else {
      this.initItemDataGrid();
    }
  }

  onSelectIndentItem() {
    if (this.dataGridItem.instance.getSelectedRowsData().length === 0) {
      this.alertMsg = {
        message: 'NO Indent Selected',
        messageType: 'danger',
        duration: Constants.ALERT_DURATION
      };
      return;
    }
    const obj = {
      indentItemListSelected: this.getMergedIndentItem(),
    }
    this.closePopup(obj);
  }

  getMergedIndentItem() {
    const grpList = _.groupBy(this.dataGridItem.instance.getSelectedRowsData(), 'itemId');
    const itemData = [];
    _.map(grpList, (list, indx) => {
      const obj = {
        itemId: 0,
        itemName: null,
        itemCode: null,
        requiredQty: 0,
        saleQty: 0,
        issueQty: 0,
        indentData: [],
        closingStockData: []
      }
      _.map(list, d => {
        obj.itemId = d.itemId;
        obj.itemName = d.itemName;
        obj.itemCode = d.itemCode;
        obj.requiredQty += +d.requiredQty;
        obj.saleQty += +d.saleQty;
        obj.issueQty += +d.issueQty;
        obj.closingStockData = d.closingStockData;
        obj.indentData.push({ ...d });
      });
      itemData.push({ ...obj });
    });
    return itemData;
  }

  getCurrentindentItemListIndex(data) {
    const findIndex = _.findIndex(this.indentItemList, d => {
      return d.id === data.id;
    });
    return findIndex;
  }

  onEditorPreparing(evt: any): void {
    if (evt.row && evt.row.data) {
      evt.editorOptions.onValueChanged = (e: any) => {
        const index = this.getCurrentindentItemListIndex(evt.row.data);
        let rowObj = this.indentItemList[index];
        if (rowObj.closingStock === 0) {
          this.allowEditingSale = false;
        } else {
          this.allowEditingSale = true;
          this.dataGridItem.instance.editCell(evt.row.rowIndex, 'saleQty');
        }
        if (evt.dataField == 'saleQty') {
          if (rowObj.closingStock < e.value) {
            this.alertMsg = {
              message: 'Only' + rowObj.closingStock + ' is available',
              messageType: 'danger',
              duration: Constants.ALERT_DURATION
            };
            this.indentItemList[index].saleQty = rowObj.closingStock;
            return;
          } else {
            this.indentItemList[index].saleQty = e.value
          }
        }
      }
    }
  }

  onRowPrepared(evt: any): void {
    if (evt.data && evt.rowType === 'data' && evt.data.closingStock === 0) {
      evt.rowElement.style.backgroundColor = "#ffebeb";
    }
    if (evt.data && evt.rowType === 'data' && evt.data.closingStock > 0 && evt.data.requiredQty > evt.data.closingStock) {
      evt.rowElement.style.backgroundColor = "#ffff8f";
    }
  }

  selectionChangedHandler(evt: any) {
    const idArray = [];
    evt.selectedRowsData.map((d, i) => {
      if (d.closingStock === 0) {
        idArray.push(d.id);
      }
    });
    this.dataGridItem.instance.deselectRows(idArray);
  }


  getCellData(data) {
    if (data.data && data.data.items && data.data.items.length > 0) {
      return 'Indent Date: ' + moment(data.data.items[0].indentDate).format('DD/MM/YYYY hh:mm A') + ' - Indent No.:' + data.data.items[0].indentNo;
    } else {
      const id = data.data.key;
      const listData = _.filter(this.indentItemList, d => {
        return d.indentId === id;
      });
      if (listData.length > 0) {
        return 'Indent Date: ' + moment(listData[0].indentDate).format('DD/MM/YYYY hh:mm A') + ' - Indent No.:' + listData[0].indentNo;
      }
      return 'Indent';
    }
  }

  @HostListener('document:keyup', ['$event'])
  handleDeleteKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      // this.closePopup(true);
    } else if (event.key === 'Escape') {
      // this.closePopup();
    }
  }


}

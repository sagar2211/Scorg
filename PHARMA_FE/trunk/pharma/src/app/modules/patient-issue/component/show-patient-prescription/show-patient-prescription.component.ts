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
  selector: 'app-show-patient-prescription',
  templateUrl: './show-patient-prescription.component.html',
  styleUrls: ['./show-patient-prescription.component.scss']
})

export class ShowPatientPrescriptionComponent implements OnInit {
  @ViewChild(DxDataGridComponent, { static: false }) public dataGrid: DxDataGridComponent;
  @ViewChild(DxDataGridComponent, { static: false }) public dataGridItem: DxDataGridComponent;
  @Input() formData;
  @Input() prescriptionItemListSelected = [];
  @Input() prescriptionItemList = [];
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
    // if (this.list.length === 1) {
    //   this.selectedPrescription = [...this.list];
    //   this.getPrescriptionItemList();
    // }
    this.getPrescriptionItemList();
    if (this.prescriptionItemListSelected.length > 0) {
      this.selectedRowKeys = _.map(this.prescriptionItemListSelected, d => {
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

  getPrescriptionItemList() {
    let res = [...this.prescriptionItemList];
    res.map(d => {
      d.closingStock = _.sumBy(d.closingStockData, 'closingQty');
      d.id = Math.random();
      if (d.closingStock === 0) {
        d.saleQty = 0;
      }
    });
    this.prescriptionItemList = [...res];
    if (this.prescriptionItemListSelected.length > 0) {
      const keys = [];
      _.map(this.prescriptionItemListSelected, d => {
        const find = _.find(this.prescriptionItemList, p => {
          return p.medicineId === d.medicineId && p.prescriptionId === d.prescriptionId;
        });
        if (find) {
          keys.push(find.id);
        }
      });
      this.dataGridItem.instance.selectRows(keys, true);
      this.initItemDataGrid(null, keys);
    }
  }

  onSelectPrescriptionItem() {
    if (this.dataGridItem.instance.getSelectedRowsData().length === 0) {
      this.alertMsg = {
        message: 'NO Presciption Selected',
        messageType: 'danger',
        duration: Constants.ALERT_DURATION
      };
      return;
    }
    const obj = {
      prescriptionItemListSelected: this.getMergedPrescriptionItem(),
    }
    this.closePopup(obj);
  }

  getMergedPrescriptionItem() {
    const grpList = _.groupBy(this.dataGridItem.instance.getSelectedRowsData(), 'medicineId');
    const itemData = [];
    _.map(grpList, (list, indx) => {
      const obj = {
        medicineId: 0,
        medicineName: null,
        itemCode: null,
        requiredQty: 0,
        saleQty: 0,
        issueQty: 0,
        prescriptionData: [],
        closingStockData: []
      }
      _.map(list, d => {
        obj.medicineId = d.medicineId;
        obj.medicineName = d.medicineName;
        obj.itemCode = d.itemCode;
        obj.requiredQty += +d.requiredQty;
        obj.saleQty += +d.saleQty;
        obj.issueQty += +d.issueQty;
        obj.closingStockData = d.closingStockData;
        obj.prescriptionData.push({ ...d });
      });
      itemData.push({ ...obj });
    });
    return itemData;
  }

  getCurrentPrescriptionItemListIndex(data) {
    const findIndex = _.findIndex(this.prescriptionItemList, d => {
      return d.id === data.id;
    });
    return findIndex;
  }

  onEditorPreparing(evt: any): void {
    if (evt.row && evt.row.data) {
      evt.editorOptions.onValueChanged = (e: any) => {
        const index = this.getCurrentPrescriptionItemListIndex(evt.row.data);
        let rowObj = this.prescriptionItemList[index];
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
            this.prescriptionItemList[index].saleQty = rowObj.closingStock;
            return;
          } else {
            this.prescriptionItemList[index].saleQty = e.value
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
      return 'Prescription : ' + moment(data.data.items[0].prescriptionDate).format('DD/MM/YYYY hh:mm A') + ' - Dr. ' + data.data.items[0].doctorName;
    } else {
      const id = data.data.key;
      const listData = _.filter(this.prescriptionItemList, d => {
        return d.prescriptionId === id
      });
      if (listData.length > 0) {
        return 'Prescription : ' + moment(listData[0].prescriptionDate).format('DD/MM/YYYY hh:mm A') + ' - Dr. ' + listData[0].doctorName;
      }
      return 'Prescription';
    }
  }

  @HostListener('document:keyup', ['$event'])
  handleDeleteKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      // this.closePopup(true);
    } else if (event.key === 'Escape') {
      this.closePopup();
    }
  }

}

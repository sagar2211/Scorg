import {Component, Input, OnInit} from '@angular/core';
import {Constants} from '../../../../config/constants';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'lodash';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {TransactionsService} from '../../../transactions/services/transactions.service';
import {CommonService} from '../../../../public/services/common.service';
import { MastersService } from 'src/app/modules/masters/services/masters.service';
import { GstCode } from 'src/app/modules/masters/modals/gstcode';
@Component({
  selector: 'app-add-edit-item-supplier-tax-master',
  templateUrl: './add-edit-item-supplier-tax-master.component.html',
  styleUrls: ['./add-edit-item-supplier-tax-master.component.scss']
})
export class AddEditItemSupplierTaxMasterComponent implements OnInit {

  @Input() supplierDetails: {supplierId: number, supplierName: string, country: any, state: any, city: any, gstCode: any};
  @Input() inputItemSupplierTax: any;
  gstCodeList: any[] = [];
  setAlertMessage: any;
  compInstance: any;
  itemSupplierTaxData: {
    istId: number,
    item: {
      itemId: number,
      itemCode: string,
      itemDescription: string,
      gstPercent: number,
      hsnSacCode: string,
    },
    gstCode: '',
    igstPercent: number,
    cgstPercent: number,
    sgstPercent: number,
    isActive: boolean
  };
  constructor(
    public modal: NgbActiveModal,
    private mastersService: MastersService,
    private commonService: CommonService,
  ) { }

  ngOnInit(): void {
    this.compInstance = this;
    this.setDefaultObject();
    if (this.inputItemSupplierTax.type === 'edit') {
      this.preloadEditData();
    }
    this.getGstCodeList();
  }

  getGstCodeList(): void {
    const result = [];
    this.mastersService.getGstCodeList().subscribe(res => {
      _.forEach(res, (o) => {
        const gstCode = new GstCode();
        gstCode.generateObject(o);
        result.push(gstCode);
      });
      this.gstCodeList = result;
    });
  }
  setDefaultObject(): void {
    this.itemSupplierTaxData = {
        istId: 0,
        item: this.Item(),
        gstCode: this.supplierDetails.gstCode,
        igstPercent: 0,
        cgstPercent: 0,
        sgstPercent: 0,
        isActive: true
    };
  }

  preloadEditData(): void {
    const inputData = _.cloneDeep(this.inputItemSupplierTax.data);
    this.itemSupplierTaxData = {
      istId: inputData.Id,
      item: this.Item(inputData),
      gstCode: inputData.gstCode,
      igstPercent: inputData.igstPercent,
      cgstPercent: inputData.cgstPercent,
      sgstPercent: inputData.sgstPercent,
      isActive: inputData.isActive
    };
  }

  selectValueConfirm (typ: string) {
    if (typ === 'Ok') {
      if (this.checkSaveData()) {
        this.saveItemSupplierTaxMaster();
      }
    } else {
      this.modal.close(false);
    }
  }

  checkSaveData() {
    if (!this.itemSupplierTaxData.item || this.itemSupplierTaxData.item === null) {
      this.notifyAlertMessage({
        msg: 'Please Provide Item Details',
        class: 'danger',
      });
      return false;
    } else if (!this.itemSupplierTaxData.gstCode || this.itemSupplierTaxData.gstCode === null) {
      this.notifyAlertMessage({
        msg: 'Please Provide GST Code Details',
        class: 'danger',
      });
      return false;
    } else {
      return true;
    }
  }

  saveItemSupplierTaxMaster() {
    const param = {
      id: this.itemSupplierTaxData.istId,
      supplierId: this.supplierDetails.supplierId,
      itemId: this.itemSupplierTaxData.item.itemId,
      stateId: this.supplierDetails.state.id,
      itemCode: this.itemSupplierTaxData.item.itemCode,
      hsnSacCode: this.itemSupplierTaxData.item.hsnSacCode,
      gstCode: this.itemSupplierTaxData.gstCode,
      gstPercent: this.itemSupplierTaxData.item.gstPercent,
      igstPercent: this.itemSupplierTaxData.igstPercent,
      cgstPercent: this.itemSupplierTaxData.cgstPercent,
      sgstPercent: this.itemSupplierTaxData.sgstPercent,
      isActive: this.itemSupplierTaxData.isActive,
    };
    this.mastersService.saveItemSupplierTaxMaster(param).subscribe(res => {
      if (res) {
        this.modal.close(true);
      } else {
        this.notifyAlertMessage({
          msg: 'Something Went Wrong',
          class: 'danger',
        });
        return false;
      }
    });
  }

  notifyAlertMessage(data): void {
    this.setAlertMessage = {
      message: data.msg,
      messageType: data.class,
      duration: Constants.ALERT_DURATION
    };
  }

  closePopup(): void {
    this.modal.close(false);
  }

  selectValue($event) {
    if (!$event || $event === undefined) {
      this.itemSupplierTaxData.item = this.Item();
    } else {
      this.itemSupplierTaxData.item = this.Item($event);
    }
    this.divideGstCalculations();
  }

  getItemList(searchKey?): Observable<any> {
    const params = {
      searchKeyword: searchKey ? searchKey : '',
      sortOrder: 'desc',
      sortColumn: 'itemId',
      pageNumber: 1,
      limit: 50,
      isActive: true,
      supplierId: this.compInstance.supplierDetails.supplierId
    };
    if (this.compInstance.inputItemSupplierTax.type === 'edit') {
      return this.compInstance.mastersService.getItemList(params).pipe(map((res: any) => {
        const itemList = [];
        if (res.length > 0) {
          _.forEach(res, (o) => {
            itemList.push(this.compInstance.Item(o));
          });
        }
        return itemList;
      }));
    } else {
      return this.compInstance.mastersService.getSupplierItemList(params).pipe(map((res: any) => {
        const itemList = [];
        if (res.length > 0) {
          _.forEach(res, (o) => {
            itemList.push(this.compInstance.Item(o));
          });
        }
        return itemList;
      }));
    }
  }

  // calculate cgst, sgst, igst
  divideGstCalculations() {
    if (this.itemSupplierTaxData.gstCode && this.itemSupplierTaxData.item) {
      const gstPercentage = this.itemSupplierTaxData.item.gstPercent;
      if (!gstPercentage || gstPercentage === 0) {
        return;
      }
      const dividedValues = this.commonService.divideGstCalculations(this.itemSupplierTaxData.gstCode, gstPercentage);
      this.itemSupplierTaxData.igstPercent = dividedValues.igstPercent;
      this.itemSupplierTaxData.cgstPercent = dividedValues.cgstPercent;
      this.itemSupplierTaxData.sgstPercent = dividedValues.sgstPercent;

      // if (this.itemSupplierTaxData.gstCode === 'GST') {
      //   const halfValue = (gstPercentage / 2).toFixed(2);
      //   this.itemSupplierTaxData.cgstPercent = +halfValue;
      //   this.itemSupplierTaxData.sgstPercent = +halfValue;
      // } else if (this.itemSupplierTaxData.gstCode === 'IGST') {
      //   this.itemSupplierTaxData.igstPercent = gstPercentage;
      // }
    }
  }

  Item(inputData?): any {
    return {
      itemId: (inputData) ? inputData.itemId : 0,
      hsnSacCode: (inputData) ? inputData.hsnSacCode : '',
      itemDescription: (inputData) ? inputData.itemDescription : '',
      itemCode: (inputData) ? inputData.itemCode : '',
      gstPercent: (inputData) ? (inputData.gstPercent || inputData.vatPurchaseRate || 0) : 0
    };
  }
}

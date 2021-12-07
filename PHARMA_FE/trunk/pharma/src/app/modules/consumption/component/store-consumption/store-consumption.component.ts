import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ActivationStart, Router } from '@angular/router';
import { concat, Observable, of, Subject } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Constants } from 'src/app/config/constants';
import { IAlert } from 'src/app/public/models/AlertMessage';
import { AuthService } from 'src/app/public/services/auth.service';
import { MastersService } from './../../../masters/services/masters.service';
import { PermissionsConstants } from '../../../../config/PermissionsConstants';
import { environment } from 'src/environments/environment';
import { IssueService } from 'src/app/modules/issue/services/issue.service';
import { CommonService } from 'src/app/public/services/common.service';

@Component({
  selector: 'app-store-consumption',
  templateUrl: './store-consumption.component.html',
  styleUrls: ['./store-consumption.component.scss']
})
export class StoreConsumptionComponent implements OnInit {
  storeConsumptionFrm: FormGroup;
  consumptionId: number;
  alertMsg: IAlert;
  itemList$ = new Observable<any>();
  itemListInput$ = new Subject<any>();
  itemStockList: Array<any> = [];
  storeId: number;
  itemList: Array<any> = [];
  constpermissionList: any = [];
  printData = null;
  constructor(
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private issueService: IssueService,
    private mastersService: MastersService,
    private authService: AuthService,
    private router: Router,
    private commonService: CommonService,
  ) { }

  ngOnInit(): void {
    this.storeId = this.authService.getLoginStoreId();
    this.createForm();
    this.loadItemList();
    this.commonService.routeChanged(this.activatedRoute);
    this.activatedRoute.paramMap.subscribe(data => {
      this.consumptionId = +data.get('id');
      if (this.consumptionId !== -1) { // update
        this.issueService.getStoreConsumptionById(this.consumptionId).subscribe(res => {
          if (res.status_message === 'Success') {
            const consumptionData = res.data;
            this.storeConsumptionFrm.patchValue({
              consumptionId: consumptionData.consumptionId,
              consumptionNo: consumptionData.consumptionNo,
              consumptionDate: new Date(consumptionData.consumptionDate),
              storeId: this.storeId,
              totalAmount: consumptionData.totalAmount,
              remark: consumptionData.remark,
              stockId: consumptionData.stockId
            });
            this.itemList = consumptionData.itemlist;
          }
        });
      } else { // add

      }
    });

    // form change detection
    this.storeConsumptionFrm.get('itemObjForm').get('qty').valueChanges.subscribe(qty => {
      const rowVal = this.storeConsumptionFrm.getRawValue();
      if (qty <= 0) {
        this.storeConsumptionFrm.get('itemObjForm').get('qty').setErrors({ isQtyLess: true });
      } if ((+rowVal.itemObjForm.balanceQty < qty)) {
        this.storeConsumptionFrm.get('itemObjForm').get('qty').setErrors({ isQtyGreater: true });
      }
      else {
        this.storeConsumptionFrm.get('itemObjForm').get('qty').setErrors(null);
      }

      this.storeConsumptionFrm.get('itemObjForm').patchValue({
        amount: +qty * (+rowVal.itemObjForm.unitRate),
      });
    });
    this.constpermissionList = PermissionsConstants;
  }

  createForm(): void {
    this.storeConsumptionFrm = this.fb.group({
      consumptionId: [0],
      consumptionNo: [''],
      consumptionDate: [new Date()],
      storeId: [this.storeId],
      totalAmount: [0],
      remark: [''],
      isTakePrint: [false],
      // itemDetails: [null],
      // stockDetails: [null],
      itemObjForm: this.fb.group({
        id: [0],
        tempHoldId: [''],
        itemId: [null, Validators.required],
        itemCode: [''],
        itemName: [''],
        unit: [''],
        batchNo: [null, Validators.required],
        expiryDate: [new Date(), Validators.required],
        qty: [0, Validators.required],
        balanceQty: [0],
        unitRate: [0],
        amount: [0],
        remark: [''],
        stockId: ['']
      })
    });
    this.storeConsumptionFrm.get('consumptionNo').disable();
    this.storeConsumptionFrm.get('itemObjForm').get('amount').disable();
    this.storeConsumptionFrm.get('itemObjForm').get('unitRate').disable();
    this.storeConsumptionFrm.get('itemObjForm').get('balanceQty').disable();
    this.storeConsumptionFrm.get('itemObjForm').get('itemName').disable();
    this.storeConsumptionFrm.get('itemObjForm').get('unit').disable();
  }

  getItemListObjControls(): FormGroup {
    return this.storeConsumptionFrm.get('itemObjForm') as FormGroup;
  }

  createItemListForm(): void { }

  private loadItemList(searchTxt?): void {
    this.itemList$ = concat(
      this.mastersService.getItemBySearchKeyword(''), // default items
      this.itemListInput$.pipe(
        distinctUntilChanged(),
        debounceTime(500),
        switchMap(term => this.mastersService.getItemBySearchKeyword(term).pipe(
          catchError(() => of([])), // empty list on error
        ))
      )
    );
  }


  saveStoreConsumption(): void {
    const formValue = this.storeConsumptionFrm.getRawValue();
    delete formValue.itemObjForm;
    formValue.itemList = this.itemList;
    if (this.itemList.length === 0) {
      this.alertMsg = {
        message: 'Please Add Item',
        messageType: 'warning',
        duration: Constants.ALERT_DURATION
      };
      return;
    }
    this.issueService.saveStoreConsumption(formValue).subscribe(res => {
      if (res.status_message === 'Success') {
        this.alertMsg = {
          message: res.message,
          messageType: 'success',
          duration: Constants.ALERT_DURATION
        };
        if (this.storeConsumptionFrm.value.isTakePrint) {
          this.getPrintData(this.consumptionId ? this.consumptionId : res.data);
        } else {
          this.router.navigate(['/inventory/issue/consumption/storeConsumptionSummary']);
        }
      }
    });
  }

  onClear(): void { }

  onItemChange(event): void {
    if (!event) {
      this.clearItemForm();
      return;
    }
    this.storeConsumptionFrm.get('itemObjForm').patchValue({
      itemId: event.itemId,
      itemCode: event.itemCode,
      itemName: event.itemDescription,
      unit: event.unitName
    });
    this.storeConsumptionFrm.get('itemObjForm').patchValue({
      batchNo: null,
      expiryDate: null,
      qty: null,
      balanceQty: null,
      unitRate: null,
      amount: null,
      stockId: null
    });

    const reqParams = {
      storeId: this.storeId,
      itemId: event.itemId
    };
    this.issueService.getItemStockById(reqParams).subscribe(res => {
      // console.log(res);
      if (res && res.length) {
        this.itemStockList = res;
      }
    });
  }

  onBatchSelect(event): void {
    if (!event) {
      this.storeConsumptionFrm.get('itemObjForm').patchValue({
        batchNo: null,
        expiryDate: null,
        qty: 0,
        balanceQty: null,
        unitRate: null,
        amount: null,
        stockId: null
      });
      return;
    }
    this.storeConsumptionFrm.get('itemObjForm').patchValue({
      batchNo: event.batchNo,
      expiryDate: new Date(event.expiryDate),
      qty: 0,
      balanceQty: event.closingQty,
      unitRate: event.unitRate,
      amount: +((event.closingQty * event.unitRate).toFixed(2)),
      stockId: event.stockId
    });
  }

  // -- called when click on add button
  onAddItem(): void {
    if (this.storeConsumptionFrm.invalid) {
      this.alertMsg = {
        message: 'Please check form fields',
        messageType: 'danger',
        duration: Constants.ALERT_DURATION
      };
      return;
    }
    const data = this.storeConsumptionFrm.getRawValue().itemObjForm;
    data.tempHoldId = new Date().getTime();
    this.itemList.push(data);
    this.totolAmtCal();
    this.itemStockHold(data);
    this.clearItemForm();
  }

  clearItemForm() {
    this.storeConsumptionFrm.get('itemObjForm').patchValue({
      itemId: null,
      itemCode: null,
      itemName: null,
      unit: null,
      batchNo: null,
      expiryDate: null,
      qty: 0,
      balanceQty: null,
      unitRate: null,
      amount: null,
      stockId: null
    });
  }

  onDeleteItem(indx): void {
    this.storeConsumptionFrm.patchValue({
      totalAmount: this.storeConsumptionFrm.value.totalAmount - this.itemList[indx].amount,
    });
    this.itemStockRelease(this.itemList[indx]);
    this.itemList.splice(indx, 1);
  }

  totolAmtCal(): void {
    let amt = 0;
    this.itemList.forEach(res => {
      amt += res.amount;
    });
    this.storeConsumptionFrm.patchValue({
      totalAmount: amt,
    });
  }

  itemStockHold(data): void {
    const reqParams = {
      tempHoldId: data.tempHoldId,
      storeId: this.storeId,
      stockId: data.stockId,
      itemId: data.itemId,
      holdQty: data.qty
    };
    this.issueService.itemStockHold(reqParams).subscribe();
  }

  itemStockRelease(data): void {
    const reqParams = [data.tempHoldId];
    this.issueService.itemStockRelease(reqParams).subscribe();
  }

  getPrintData(id?) {
    const idVal = id || this.storeConsumptionFrm.value.consumptionId;
    const url = environment.REPORT_API + 'Report/ConsumptionPrint/?auth_token=' + this.authService.getAuthToken() + '&consumptionId=' + idVal;
    this.printData = { url: url, returnType: id ? true : false };
  }

}

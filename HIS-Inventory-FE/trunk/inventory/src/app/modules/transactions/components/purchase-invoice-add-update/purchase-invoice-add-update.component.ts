import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { concat, Observable, of, Subject } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Constants } from 'src/app/config/constants';
import { IAlert } from 'src/app/public/models/AlertMessage';
import { ConfirmationPopupWithReasonComponent } from 'src/app/shared/confirmation-popup-with-reason/confirmation-popup-with-reason.component';
import { InvoiceListModel, InvoiceReceiptItem } from '../../modals/invoice-list.model';
import { TransactionsService } from '../../services/transactions.service';
import { PermissionsConstants } from '../../../../config/PermissionsConstants';
import { CommonService } from 'src/app/public/services/common.service';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/public/services/auth.service';

@Component({
  selector: 'app-purchase-invoice-add-update',
  templateUrl: './purchase-invoice-add-update.component.html',
  styleUrls: ['./purchase-invoice-add-update.component.scss']
})
export class PurchaseInvoiceAddUpdateComponent implements OnInit {
  purInvoiceFrm: FormGroup;
  supplierList$ = new Observable<any>();
  supplierListInput$ = new Subject<any>();
  storeId: number;
  receiptList: Array<InvoiceReceiptItem> = [];
  isAllSelected: boolean;
  alertMsg: IAlert;
  submitted = false;
  invoiceId: number;
  constpermissionList: any = [];
  printData = null;
  isEditMode = false;
  constructor(
    private transactionsService: TransactionsService,
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private route: Router,
    private modalService: NgbModal,
    private commonService: CommonService,
    private authService: AuthService,
  ) { }

  ngOnInit(): void {
    this.storeId = JSON.parse(localStorage.getItem('globals')).storeId;
    this.loadSupplierList();
    this.createInitForm();

    this.activatedRoute.paramMap.subscribe(data => {
      this.invoiceId = +data.get('id');
      if (this.invoiceId !== -1) { // update
        this.transactionsService.getInvoiceById(this.invoiceId).subscribe(res => {
          this.isEditMode = true;
          this.updateForm(res.data);
          this.isAllSelected = true;
          res.data.receiptList.forEach(element => { element.selected = true; });
          this.receiptList = res.data.receiptList;
        });
      } else {
        // add
      }
    });

    this.purInvoiceFrm.get('adjustmentAmount').valueChanges.pipe(debounceTime(500)).subscribe(res => {
      const formVal = this.purInvoiceFrm.getRawValue();
      this.purInvoiceFrm.patchValue({
        netAmount: res ? +formVal.totalAmount + (+res) : +formVal.totalAmount - +formVal.adjustmentAmount
      });
    });
    this.constpermissionList = PermissionsConstants;
    this.commonService.routeChanged(this.activatedRoute);
  }

  createInitForm(): void {
    this.purInvoiceFrm = this.fb.group({
      supplierId: [null, Validators.required],
      invoiceId: [0],
      storeId: [this.storeId],
      fromDate: [new Date()],
      toDate: [new Date()],
      paymentPostingDate: [new Date()],
      paymentMode: ['', Validators.required],
      totalAmount: [0],
      adjustmentAmount: [0],
      roundOff: [0],
      netAmount: [0],
      remark: [''],
      isApproved: [false],
      isTakePrint: [false],
      status: [''],
      receiptList: this.fb.array([])
    });
    this.purInvoiceFrm.get('totalAmount').disable();
    this.purInvoiceFrm.get('netAmount').disable();
  }

  updateForm(obj): void {
    this.purInvoiceFrm.patchValue({
      supplierId: obj.supplierId ? obj.supplierId : null,
      invoiceId: obj.invoiceId ? obj.invoiceId : 0,
      storeId: this.storeId,
      fromDate: new Date(),
      toDate: new Date(),
      paymentPostingDate: obj.paymentPostingDate ? new Date(obj.paymentPostingDate) : new Date(),
      paymentMode: obj.paymentMode,
      totalAmount: obj.totalAmount ? obj.totalAmount : 0,
      adjustmentAmount: obj.adjustmentAmount ? obj.adjustmentAmount : 0,
      netAmount: obj.netAmount ? obj.netAmount : 0,
      remark: obj.remark,
      roundOff: obj.roundOff,
      isApproved: obj.isApproved ? obj.isApproved : false,
      receiptList: obj.receiptList,
      status: obj.status
    });
    this.purInvoiceFrm.controls.supplierId.disable();
  }

  saveInvoice(): void {
    this.submitted = true;
    if (this.purInvoiceFrm.invalid) { return; }
    const filt = this.receiptList.filter(r => r.selected === true);
    const temp = [];
    filt.forEach(r => {
      temp.push({
        // id: r.id,
        grnId: r.grnId,
        invoiceDcNo: r.grnNo,
        invoiceDcDate: r.grnDate
      });
    });
    const formObj = this.purInvoiceFrm.getRawValue();
    formObj.receiptList = temp;
    if (temp.length === 0) {
      this.notifyAlertMessage({
        msg: 'Please Select Receipt!',
        class: 'danger',
      });
      return;
    }
    this.transactionsService.saveInvoiceList(formObj).subscribe(res => {
      this.submitted = false;
      this.notifyAlertMessage({
        msg: 'Data Saved Successfully!',
        class: 'success',
      });
      if (this.purInvoiceFrm.value.isTakePrint) {
        this.getPrintData(this.purInvoiceFrm.value.invoiceId ? this.purInvoiceFrm.value.invoiceId : res.data);
      } else {
        this.redirectToList();
      }
    });
  }

  private loadSupplierList(searchTxt?): void {
    this.supplierList$ = concat(
      this.transactionsService.getSupplierBySearchKeyword(''), // default items
      this.supplierListInput$.pipe(
        distinctUntilChanged(),
        // tap(() => this.formLoading = true),
        switchMap(term => this.transactionsService.getSupplierBySearchKeyword(term).pipe(
          catchError(() => of([])), // empty list on error
          // tap(() => this.formLoading = false)
        ))
      )
    );
  }

  getGrnForInvoice(): void {
    const reqParams = {
      supplierId: this.purInvoiceFrm.value.supplierId,
      storeId: this.purInvoiceFrm.value.storeId,
      fromDate: this.purInvoiceFrm.value.fromDate,
      toDate: this.purInvoiceFrm.value.toDate
    };
    if (!reqParams.supplierId) { return; }
    this.transactionsService.getGRNForInvoice(reqParams).subscribe(res => {
      // console.log(res);
      if (res.status_message === 'Success') {
        this.receiptList = res.data;
      }
    });
  }

  onSupplierChange(event): void {
    this.getGrnForInvoice();
  }

  toggleAll(event): void {
    this.isAllSelected = event;
    this.calculations(this.isAllSelected);
    this.receiptList.forEach((itm) => { itm.selected = this.isAllSelected; });
    // this.calculations();
  }

  optionToggled(item, event): void {
    const prevSelected = item.selected;
    const formVal = this.purInvoiceFrm.getRawValue();
    this.purInvoiceFrm.patchValue({
      totalAmount: prevSelected ? formVal.totalAmount - item.netAmount : formVal.totalAmount + item.netAmount,
      netAmount: prevSelected ? formVal.netAmount - item.netAmount : formVal.netAmount + item.netAmount,
    });
    item.selected = event;
    this.isAllSelected = this.receiptList.every((itm) => itm.selected === true);
    // this.calculations();
  }

  calculations(isSelectAll: boolean): void {
    if (isSelectAll) {
      let totAmt = 0;
      let netAmt = 0;
      this.receiptList.forEach(r => {
        totAmt += (+r.netAmount);
        netAmt += (+r.netAmount);
      });
      this.purInvoiceFrm.patchValue({
        totalAmount: totAmt,
        netAmount: netAmt,
      });
    } else {
      this.purInvoiceFrm.patchValue({
        totalAmount: 0,
        netAmount: 0,
      });
    }

  }

  onClear(): void {
    this.purInvoiceFrm.reset({
      supplierId: [null],
      invoiceNo: [0],
      invoiceId: [0],
      storeId: [this.storeId],
      invoiceDate: [new Date()],
      fromDate: [new Date()],
      toDate: [new Date()],
      paymentPostingDate: [new Date()],
      totalAmount: [0],
      adjustmentAmount: [0],
      roundOff: [0],
      netAmount: [0],
      ReceiptList: []
    });
    this.submitted = false;
  }

  updateStatus(status): void {
    const msg = 'Do you really want to ' + status + ' this GRN?';
    if (status !== 'Approve') {
      this.openConfirmReasonPopup(msg, status);
      return;
    } else {
      this.purInvoiceFrm.patchValue({
        isApproved: true
      });
      this.saveInvoice();
    }
  }

  openConfirmReasonPopup(msg, status): void {
    const modalTitleobj = `${status} GDN`;
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
        if (status === 'Cancel') {
          this.cancelInvoice(result.reason);
          return;
        } else if (status === 'Reject') {
          this.rejectInvoice(result.reason);
          return;
        }
      }
    });
    modalInstance.componentInstance.messageDetails = messageDetails;
  }

  rejectInvoice(reason): void {
    const reqParams = {
      Id: this.purInvoiceFrm.value.invoiceId,
      remark: reason
    };
    this.transactionsService.rejectInvoice(reqParams).subscribe(res => {
      if (res) {
        this.notifyAlertMessage({
          msg: 'Data Saved Successfully!',
          class: 'Success',
        });
        this.redirectToList();
      } else {
        this.notifyAlertMessage({
          msg: 'Something Went Wrong',
          class: 'danger',
        });
        return false;
      }
    });
  }

  cancelInvoice(reason): void {
    const reqParams = {
      Id: this.purInvoiceFrm.value.invoiceId,
      remark: reason
    };
    this.transactionsService.cancelInvoice(reqParams).subscribe(res => {
      if (res) {
        this.notifyAlertMessage({
          msg: 'Data Saved Successfully!',
          class: 'Success',
        });
        this.redirectToList();
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
    this.alertMsg = {
      message: data.msg,
      messageType: data.class,
      duration: Constants.ALERT_DURATION
    };
  }

  getPrintData(id?) {
    const idVal = id || this.invoiceId;
    const url = environment.REPORT_API + 'Report/InvoicePrint/?auth_token=' + this.authService.getAuthToken() + '&invoiceId=' + idVal;
    this.printData = { url: url, returnType: id ? true : false };
  }

  redirectToList() {
    this.route.navigate(['/inventory/transactions/purchaseInvoiceList']);
  }

}

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MastersService } from 'src/app/modules/masters/services/masters.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'src/app/public/services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { IAlert } from 'src/app/public/models/AlertMessage';
import { Observable, Subject, concat, of } from 'rxjs';
import { distinctUntilChanged, tap, switchMap, catchError, map } from 'rxjs/operators';
import * as _ from 'lodash';
import { Constants } from 'src/app/config/constants';
import { IndentService } from '../../services/indent.service';
import { IndentType } from '../../modals/indentType.model';
import { ConfirmationPopupComponent } from 'src/app/shared/confirmation-popup/confirmation-popup.component';
import { ConfirmationPopupWithReasonComponent } from 'src/app/shared/confirmation-popup-with-reason/confirmation-popup-with-reason.component';
import { PermissionsConstants } from "../../../../config/PermissionsConstants";
import { CommonService } from 'src/app/public/services/common.service';

@Component({
  selector: 'app-material-indent-add-update',
  templateUrl: './material-indent-add-update.component.html',
  styleUrls: ['./material-indent-add-update.component.scss']
})
export class MaterialIndentAddUpdateComponent implements OnInit {
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

  toStoreList$ = new Observable<any>();
  toStoreListInput$ = new Subject<any>();
  itemList$ = new Observable<any>();
  itemListInput$ = new Subject<any>();
  showDeptStrType = null;
  constpermissionList: any = [];
  constructor(
    private fb: FormBuilder,
    private mastersService: MastersService,
    private indentService: IndentService,
    private modalService: NgbModal,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private commonService: CommonService,
  ) { }

  ngOnInit(): void {
    this.constants = Constants;
    this.isEditModeEnable = false;
    this.submitted = false;
    this.userId = this.authService.getLoggedInUserId();
    this.loadStoreList('');
    this.loadItemList('');
    const id = +this.route.snapshot.params.id;
    this.getIndentTypesList().subscribe(res => {
      if (id && id > -1) {
        this.getIndentDataById(id).subscribe(res => {
          this.isEditModeEnable = true;
          this.createForm();
        });
      } else {
        this.createForm();
      }
    });
    this.constpermissionList = PermissionsConstants;
    this.commonService.routeChanged(this.route);
  }

  createForm() {
    this.patchDefaultValue();
  }

  patchDefaultValue() {
    const form = {
      indentId: [null],
      indentTypeId: [null, Validators.required],
      indentTypeValue: [null],
      deptId: [this.authService.getLoginDepartmentId()],
      deptName: [this.authService.getLoginDepartmentName()],
      storeId: [this.authService.getLoginStoreId()],
      storeName: [this.authService.getLoginStoreName()],
      toStoreId: [null, Validators.required],
      toStore: [null],
      remark: [null, Validators.required],
      itemTabelId: [null],
      itemId: [null],
      item: [null],
      qty: [null],
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
    this.materialIndentForm.controls.indentId.patchValue(this.editIndentData.indentId);
    this.materialIndentForm.controls.indentTypeId.patchValue(this.editIndentData.indentType);
    this.materialIndentForm.controls.indentTypeValue.patchValue(indentObj);
    this.materialIndentForm.controls.deptId.patchValue(this.editIndentData.deptId);
    this.materialIndentForm.controls.deptName.patchValue(this.editIndentData.deptName);
    this.materialIndentForm.controls.storeId.patchValue(this.editIndentData.storeId);
    this.materialIndentForm.controls.storeName.patchValue(this.editIndentData.storeName);
    this.materialIndentForm.controls.toStoreId.patchValue(this.editIndentData.toStoreId);
    this.materialIndentForm.controls.toStore.patchValue(toStoreObj);
    this.materialIndentForm.controls.remark.patchValue(this.editIndentData.remark);
    this.showDeptStrType = this.materialIndentForm.value.indentTypeValue.indentType === 'DC' ? 'dept' : 'store';
    this.itemArray = [];
    _.map(this.editIndentData.indentDetailList, dt => {
      const obj = {
        id: dt.id,
        itemId: dt.itemId,
        item: {
          itemCode: dt.itemCode,
          itemDescription: dt.itemDescription,
          itemId: dt.itemId,
          unitId: dt.unitId ? dt.unitId : 0,
          unitName: dt.units,
        },
        indentQty: dt.indentQty
      };
      this.itemArray.push(_.cloneDeep(obj));
    });
    this.loadForm = true;
    this.materialIndentForm.controls.indentTypeId.disable();
    this.materialIndentForm.controls.toStoreId.disable();
  }


  savematerialIndentForm() {
    this.submitted = true;
    if (this.submitted && this.materialIndentForm.valid && this.itemArray.length) {
      const formVal = this.materialIndentForm.value;
      const param = {
        indentId: formVal.indentId ? formVal.indentId : 0,
        indentType: formVal.indentTypeValue.indentType,
        deptId: formVal.deptId,
        storeId: formVal.storeId,
        toStoreId: formVal.toStore.id,
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

  private loadStoreList(searchTxt?): void {
    this.toStoreList$ = concat(
      this.mastersService.getStoresBySearchKeyword(searchTxt ? searchTxt : '', true), // default items
      this.toStoreListInput$.pipe(
        distinctUntilChanged(),
        tap(() => this.formLoading = true),
        switchMap(term => this.mastersService.getStoresBySearchKeyword(term, true).pipe(
          catchError(() => of([])), // empty list on error
          tap(() => this.formLoading = false)
        ))
      )
    );
  }

  private loadItemList(searchTxt?): void {
    this.itemList$ = concat(
      this.mastersService.getItemBySearchKeyword(searchTxt ? searchTxt : ''), // default items
      this.itemListInput$.pipe(
        distinctUntilChanged(),
        tap(() => this.formLoading = true),
        switchMap(term => this.mastersService.getItemBySearchKeyword(term).pipe(
          catchError(() => of([])), // empty list on error
          tap(() => this.formLoading = false)
        ))
      )
    );
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

  onItemChange(event) {
    if (_.isEmpty(event)) {
      this.clearItemValue();
      return;
    } else {
      this.materialIndentForm.patchValue({
        item: event,
      });
    }
  }

  addItemValue() {
    const checkIndex = _.findIndex(this.itemArray, itm => {
      return itm.itemId === this.materialIndentForm.value.item.itemId;
    });
    const obj = {
      id: 0,
      itemId: this.materialIndentForm.value.item.itemId,
      item: this.materialIndentForm.value.item,
      indentQty: this.materialIndentForm.value.qty
    };
    if (checkIndex === -1) {
      this.itemArray.push(_.cloneDeep(obj));
    } else if (this.materialIndentForm.value.itemTabelId === 0) {
      this.itemArray[checkIndex] = _.cloneDeep(obj);
    } else if (this.materialIndentForm.value.itemTabelId !== 0) {
      this.itemArray[checkIndex] = {
        id: this.materialIndentForm.value.itemTabelId,
        itemId: this.materialIndentForm.value.item.itemId,
        item: this.materialIndentForm.value.item,
        indentQty: this.materialIndentForm.value.qty
      };
    }
    this.clearItemValue();
  }

  clearItemValue() {
    this.materialIndentForm.patchValue({
      item: null,
      itemId: null,
      itemTabelId: null,
      qty: null,
    });
  }

  get materialIndentFormControl() {
    return this.materialIndentForm.controls;
  }

  editItem(item) {
    this.materialIndentForm.patchValue({
      itemId: item.itemId,
      item: item.item,
      qty: item.indentQty,
      itemTabelId: item.id
    });
  }

  confirmDelete(item, index) {
    this.openConfirmPopup(index, 'Are you sure?', 'item');
  }

  updateDeptStore(data) {
    if (_.isEmpty(data)) {
      this.materialIndentForm.patchValue({
        indentId: null,
        indentTypeId: null,
        indentTypeValue: null,
        toStoreId: null,
        toStore: null,
        remark: null,
        itemTabelId: null,
        itemId: null,
        item: null,
        qty: null,
      });
      this.showDeptStrType = null;
      return;
    }
    this.materialIndentForm.controls.indentTypeValue.patchValue(data);
    this.showDeptStrType = this.materialIndentForm.value.indentTypeValue.indentType === 'DC' ? 'dept' : 'store';
  }

  redirectToListPage() {
    this.router.navigate(['/inventory/indent/materialIndentList']);
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

}

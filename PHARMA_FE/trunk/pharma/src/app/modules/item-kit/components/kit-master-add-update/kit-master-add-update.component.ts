import { Component, ElementRef, Input, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectComponent } from '@ng-select/ng-select';
import { concat, Observable, of, Subject } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { KitMastersService } from 'src/app/modules/masters/services/kitmasters.service';
import { MastersService } from 'src/app/modules/masters/services/masters.service';
import { IAlert } from 'src/app/public/models/AlertMessage';
import { ConfirmationPopupComponent } from 'src/app/shared/confirmation-popup/confirmation-popup.component';

@Component({
  selector: 'app-kit-master-add-update',
  templateUrl: './kit-master-add-update.component.html',
  styleUrls: ['./kit-master-add-update.component.scss']
})
export class KitMasterAddUpdateComponent implements OnInit {
  @Input() kitData: any;
  @ViewChild('kitName') kitNameComp: ElementRef;
  @ViewChildren('itemNameSel') itemNameSelComp: QueryList<NgSelectComponent>;

  itemMasterForm: FormGroup;
  loadForm: boolean;
  submitted: boolean;
  alertMsg: IAlert;
  addedRow: boolean;

  itemList$ = new Observable<any>();
  itemInput$ = new Subject<any>();
  constructor(
    public modal: NgbActiveModal,
    private fb: FormBuilder,
    private kitMastersService: KitMastersService,
    private mastersService: MastersService,
    public modalService: NgbModal,
  ) { }

  ngOnInit(): void {
    this.loadForm = false;
    this.submitted = false;
    this.addedRow = false;
    this.loadItemList();
    this.createForm(this.kitData ? this.kitData.kitData : null);
  }

  createForm(form?) {
    const formObj = {
      id: [0],
      name: [null, [Validators.required]],
      itemKitList: this.fb.array([]),
    };
    this.itemMasterForm = this.fb.group(formObj);
    this.loadForm = true;
    setTimeout(() => {
      this.kitNameComp.nativeElement.focus();
    }, 500);
    if (form && form.kitId) {
      this.patchDefaultValue(form);
    } else {
      this.addBlankItem();
    }
  }

  patchDefaultValue(val) {
    this.itemMasterForm.patchValue({
      id: val.kitId,
      name: val.kitName
    });
    val.kitMasterItemsList.map((d, i) => {
      this.addBlankItem();
      this.itemKitList.controls[i].patchValue({
        id: d.kitItemId,
        item: {
          itemId: d.itemId,
          itemName: d.itemName,
          customName: d.itemName
        },
        qty: d.quantity,
      });
    });
  }

  get itemKitList() {
    return this.itemMasterForm.get('itemKitList') as FormArray;
  }

  get getFrmCntrols() {
    return this.itemMasterForm.controls;
  }

  addBlankItem() {
    const obj = {
      id: [0],
      item: [null, Validators.required],
      qty: [null, Validators.required]
    };
    this.itemKitList.push(this.fb.group(obj));
    setTimeout(() => {
      this.itemNameSelComp.last.focus();
    }, 500);
  }

  private loadItemList(searchTxt?): void {
    this.itemList$ = concat(
      this.mastersService.getItemBySearchKeyword(searchTxt ? searchTxt : ''), // default items
      this.itemInput$.pipe(
        distinctUntilChanged(),
        debounceTime(500),
        switchMap(term => this.mastersService.getItemBySearchKeyword(term).pipe(
          catchError(() => of([]))
        ))
      )
    );
  }

  addNewItem(indx) {
    this.addedRow = true;
    if (this.itemKitList.controls[indx].valid) {
      this.addedRow = false;
      this.addBlankItem();
      // if (this.itemKitList.controls[this.itemKitList.length - 1].get('item').invalid) {
      //   const a = this.itemKitList.controls[this.itemKitList.length - 1].get('item');
      //   console.log(a);
      // }
    }
  }

  deleteItem(indx, row) {
    if (row.item && row.item.customName) {
      const modalTitleobj = 'Delete';
      const modalBodyobj = 'Do you want to delete this Item <span class="font-weight-500"> (' + row.item.customName + ') </span>';
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
          this.itemKitList.removeAt(indx);
          if (this.itemKitList.length === 0) {
            this.addBlankItem();
          }
        }
      });
      modalInstance.componentInstance.messageDetails = messageDetails;
    } else {
      this.itemKitList.removeAt(indx);
      if (this.itemKitList.length === 0) {
        this.addBlankItem();
      }
    }
  }

  selectItem(val, index) {
    const itemAry = this.itemKitList.getRawValue();
    let indxFind = false;
    itemAry.map((d, i) => {
      if (i !== index) {
        if (d.item.itemId === val.itemId) {
          indxFind = true;
        }
      }
    });
    if (indxFind) {
      this.itemKitList.controls[index].patchValue({
        item: null
      });
    }
  }

  saveValue() {
    this.submitted = true;
    this.addedRow = true;
    if (this.itemMasterForm.valid && this.submitted) {
      this.submitted = false;
      this.addedRow = false;
      const frmval = this.itemMasterForm.getRawValue();
      const param = {
        kitId: frmval.id,
        kitName: frmval.name,
        KitListForSave: []
      }
      frmval.itemKitList.map(dt => {
        const obj = {
          kitItemId: dt.id,
          itemId: dt.item.itemId,
          quantity: dt.qty
        }
        param.KitListForSave.push({ ...obj })
      });
      this.kitMastersService.saveKitData(param).subscribe(res => {
        this.modal.close(frmval.id ? 'update' : 'save');
      });
    }
  }

}

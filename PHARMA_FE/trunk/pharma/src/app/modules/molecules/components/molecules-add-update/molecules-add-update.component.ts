import { Component, ElementRef, Input, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectComponent } from '@ng-select/ng-select';
import { concat, Observable, of, Subject } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, switchMap, takeWhile } from 'rxjs/operators';
import { GenericCodeService } from 'src/app/modules/masters/services/genericCode.service';
import { MastersService } from 'src/app/modules/masters/services/masters.service';
import { IAlert } from 'src/app/public/models/AlertMessage';
import { ConfirmationPopupComponent } from 'src/app/shared/confirmation-popup/confirmation-popup.component';

@Component({
  selector: 'app-molecules-add-update',
  templateUrl: './molecules-add-update.component.html',
  styleUrls: ['./molecules-add-update.component.scss']
})
export class MoleculesAddUpdateComponent implements OnInit {
  @Input() compData: any;
  @ViewChild('genName') genNameComp: ElementRef;
  @ViewChildren('moleculeSelect') moleculeSelectComp: QueryList<NgSelectComponent>;

  itemMasterForm: FormGroup;
  loadForm: boolean;
  submitted: boolean;
  alertMsg: IAlert;
  addedRow: boolean;
  alive: boolean;

  itemList$ = new Observable<any>();
  itemInput$ = new Subject<any>();
  unitList$ = new Observable<any>();
  unitListInput$ = new Subject<any>();
  constructor(
    public modal: NgbActiveModal,
    private fb: FormBuilder,
    private genericCodeService: GenericCodeService,
    private mastersService: MastersService,
    public modalService: NgbModal,
  ) { }

  ngOnInit(): void {
    this.loadForm = false;
    this.alive = false;
    this.submitted = false;
    this.addedRow = false;
    this.loadItemList();
    this.getMoleculeUnitBySearch();
    this.createForm(this.compData ? this.compData.compData : null);
  }

  createForm(form?) {
    const formObj = {
      id: [0],
      name: [null],
      moleculesList: this.fb.array([]),
    };
    this.itemMasterForm = this.fb.group(formObj);
    this.loadForm = true;
    if (form && form.genericId) {
      this.patchDefaultValue(form);
    } else {
      this.addBlankItem();
      setTimeout(() => {
        this.moleculeSelectComp.last.focus();
      }, 500);
    }
  }

  patchDefaultValue(val) {
    this.itemMasterForm.patchValue({
      id: val.genericId,
      name: val.genericName
    });
    val.linkMoleculesList.map((d, i) => {
      this.addBlankItem();
      this.moleculesList.controls[i].patchValue({
        molecule: {
          moleculeId: d.moleculeId,
          moleculeName: d.moleculeName,
        },
        strength: d.strength,
        unit: {
          unitName: d.unit,
          unitId: d.unitId
        }
      });
    });
  }

  get moleculesList() {
    return this.itemMasterForm.get('moleculesList') as FormArray;
  }

  get getFrmCntrols() {
    return this.itemMasterForm.controls;
  }

  addBlankItem() {
    const obj = {
      id: [0],
      molecule: [null],
      moleculeAdd: [null],
      moleculeAddMode: [false],
      moleculeMsg: [null],
      strength: [null, Validators.required],
      unit: [null],
      unitAdd: [null],
      unitAddMode: [false],
      unitMsg: [null],
    };
    this.moleculesList.push(this.fb.group(obj));
    setTimeout(() => {
      this.moleculeSelectComp.last.focus();
    }, 500);
  }

  addNewItem(indx) {
    this.addedRow = true;
    if (this.checkValidation()) {
      this.addedRow = false;
      this.addBlankItem();
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
          this.moleculesList.removeAt(indx);
          if (this.moleculesList.length === 0) {
            this.addBlankItem();
          }
        }
      });
      modalInstance.componentInstance.messageDetails = messageDetails;
    } else {
      this.moleculesList.removeAt(indx);
      if (this.moleculesList.length === 0) {
        this.addBlankItem();
      }
    }
  }

  selectMoleculeItem(val, index) {
    if (!val) {
      return;
    }
    const itemAry = this.moleculesList.getRawValue();
    this.moleculesList.controls[index].patchValue({
      moleculeMsg: null
    });
    let indxFind = false;
    itemAry.map((d, i) => {
      if (i !== index) {
        if (d.molecule.moleculeId === val.moleculeId) {
          indxFind = true;
        }
      }
    });
    if (indxFind) {
      this.addedRow = true;
      this.moleculesList.controls[index].patchValue({
        molecule: null,
        moleculeMsg: 'Already Selected'
      });
    }
  }

  selectItem(val, index) {
    if (!val) {
      return;
    } else {
      this.moleculesList.controls[index].patchValue({
        unitMsg: null
      });
    }
  }

  checkValidation() {
    let frmStatus = true;
    this.moleculesList.controls.map((d, i) => {
      if (d.value.moleculeAddMode && !d.value.moleculeAdd) {
        d.patchValue({
          moleculeMsg: 'Please Add Value'
        });
        frmStatus = false;
      } else if (!d.value.moleculeAddMode && !d.value.molecule) {
        d.patchValue({
          moleculeMsg: 'Please Select Value'
        });
        frmStatus = false;
      }
      if (d.value.unitAddMode && !d.value.unitAdd) {
        d.patchValue({
          unitMsg: 'Please Add Value'
        });
        frmStatus = false;
      } else if (!d.value.unitAddMode && !d.value.unit) {
        d.patchValue({
          unitMsg: 'Please Select Value'
        });
        frmStatus = false;
      }
    });
    return frmStatus;
  }

  generateSaveObj() {
    const formVal = this.itemMasterForm.value;
    const param = {
      genericId: formVal.id,
      genericName: formVal.name,
      SaveMoleculeList: []
    }
    formVal.moleculesList.map(d => {
      const obj = {
        moleculeId: d.moleculeAddMode ? 0 : d.molecule.moleculeId,
        moleculeName: d.moleculeAddMode ? d.moleculeAdd : d.molecule.moleculeName,
        strenght: d.strength,
        unitId: d.unitAddMode ? 0 : d.unit.unitId,
        unitName: d.unitAddMode ? d.unitAdd : d.unit.unitName,
      }
      param.SaveMoleculeList.push({ ...obj });
    })
    return param;
  }

  saveValue() {
    this.submitted = true;
    this.addedRow = true;
    if (!this.checkValidation()) {
      return;
    }
    if (this.itemMasterForm.valid && this.submitted) {
      this.submitted = false;
      this.addedRow = false;
      const formVal = this.itemMasterForm.value;
      const param = this.generateSaveObj();
      this.genericCodeService.saveGenericComponent(param).subscribe(res => {
        this.modal.close(formVal.id ? 'update' : 'save');
      });
    }
  }

  moleculeAddMode(index) {
    this.moleculesList.controls[index].patchValue({
      moleculeAddMode: !this.moleculesList.value[index].moleculeAddMode
    });
  }

  unitAddMode(index) {
    this.moleculesList.controls[index].patchValue({
      unitAddMode: !this.moleculesList.value[index].unitAddMode
    });
  }

  private loadItemList(searchTxt?): void {
    this.itemList$ = concat(
      this.mastersService.getMoleculeBySearchKeyword(searchTxt ? searchTxt : ''), // default items
      this.itemInput$.pipe(
        distinctUntilChanged(),
        debounceTime(500),
        switchMap(term => this.mastersService.getMoleculeBySearchKeyword(term).pipe(
          catchError(() => of([]))
        ))
      )
    );
  }

  getMoleculeUnitBySearch(searchTxt?) {
    this.unitList$ = concat(
      this.mastersService.getMoleculeUnitBySearchKeyword(searchTxt ? searchTxt : ''), // default items
      this.unitListInput$.pipe(
        distinctUntilChanged(),
        debounceTime(500),
        switchMap(term => this.mastersService.getMoleculeUnitBySearchKeyword(term).pipe(
          catchError(() => of([]))
        ))
      )
    );
  }
}

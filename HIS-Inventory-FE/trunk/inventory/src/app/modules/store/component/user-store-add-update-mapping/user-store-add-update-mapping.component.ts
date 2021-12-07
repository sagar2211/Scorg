import { Component, OnInit, Input } from '@angular/core';
import { Observable, Subject, of, concat } from 'rxjs';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'lodash';
import { distinctUntilChanged, tap, catchError, switchMap } from 'rxjs/operators';
import { IAlert } from 'src/app/public/models/AlertMessage';
import { MastersService } from 'src/app/modules/masters/services/masters.service';

@Component({
  selector: 'app-user-store-add-update-mapping',
  templateUrl: './user-store-add-update-mapping.component.html',
  styleUrls: ['./user-store-add-update-mapping.component.scss']
})
export class UserStoreAddUpdateMappingComponent implements OnInit {

  @Input() popupDetails: any;
  toUserList$ = new Observable<any>();
  toUserListInput$ = new Subject<any>();
  toStoreList$ = new Observable<any>();
  toStoreListInput$ = new Subject<any>();
  mappingForm: FormGroup;
  loadForm = false;
  submitted = false;
  formLoading = false;
  alertMsg: IAlert;

  constructor(
    private mastersService: MastersService,
    public modal: NgbActiveModal,
    private fb: FormBuilder,
  ) { }

  ngOnInit(): void {
    // console.log(this.popupDetails);
    this.loadUserList('');
    this.loadStoreList('');
    this.createUserForm();
  }

  createUserForm() {
    const form = {
      userId: [null, Validators.required],
      user: [null],
      stores: [null, Validators.required],
    };
    this.mappingForm = this.fb.group(form);
    if (this.popupDetails.data) {
      this.loadUserList(this.popupDetails.data.user_name);
      this.mappingForm.patchValue({
        stores: [],
        user: this.popupDetails.data,
        userId: this.popupDetails.data.user_id
      });
      // console.log(this.mappingForm.value);
      this.onUserChange(this.popupDetails.data);
      this.mappingForm.controls.userId.disable();
    }
    this.loadForm = true;
  }

  addUpdateMaping() {
    this.submitted = true;
    if (this.mappingForm.valid && this.submitted) {
      const formVal = this.mappingForm.value;
      const param = {
        userId: formVal.userId ? formVal.userId : formVal.user.user_id,
        storeList: this.getSaveStoreList(formVal.stores)
      };
      this.mastersService.saveUserStoreMapping(param).subscribe(res => {
        this.submitted = false;
        if (res) {
          this.modal.close('save');
        }
      });
    }
  }

  getSaveStoreList(list) {
    const ary = [];
    _.map(list, str => {
      const obj = {
        storeId: str.id,
        storeName: str.name,
      };
      ary.push(_.cloneDeep(obj));
    });
    return ary;
  }

  private loadUserList(searchTxt?): void {
    this.toUserList$ = concat(
      this.mastersService.getUserList(searchTxt ? searchTxt : ''), // default items
      this.toUserListInput$.pipe(
        distinctUntilChanged(),
        tap(() => this.formLoading = true),
        switchMap(term => this.mastersService.getUserList(term).pipe(
          catchError(() => of([])), // empty list on error
          tap(() => this.formLoading = false)
        ))
      )
    );
  }

  private loadStoreList(searchTxt?): void {
    this.toStoreList$ = concat(
      this.mastersService.getStoresBySearchKeyword('', null, false), // default items
      this.toStoreListInput$.pipe(
        distinctUntilChanged(),
        tap(() => this.formLoading = true),
        switchMap(term => this.mastersService.getStoresBySearchKeyword(term, null, false).pipe(
          catchError(() => of([])), // empty list on error
          tap(() => this.formLoading = false)
        ))
      )
    );
  }

  onUserChange(user) {
    if (_.isEmpty(user)) {
      this.mappingForm.patchValue({
        stores: [],
        userData: null,
        userId: null
      });
      return;
    }
    this.mastersService.getUserStoreMappingByUserId(user.user_id).subscribe(res => {
      if (res && res.storeMapping.length > 0) {
        const strAry = [];
        _.map(res.storeMapping, str => {
          const obj = {
            id: str.storeId,
            name: str.storeName
          };
          strAry.push(obj);
        });
        this.mappingForm.patchValue({
          stores: strAry,
          userData: user,
        });
      } else {
        this.mappingForm.patchValue({
          stores: [],
          userData: user,
        });
      }
    });
  }

  onStoreChange(store) {
    this.mappingForm.patchValue({
      stores: store,
    });
  }

  closePopup() {
    this.modal.close('close');
  }


  get mapFormControl() {
    return this.mappingForm.controls;
  }

}

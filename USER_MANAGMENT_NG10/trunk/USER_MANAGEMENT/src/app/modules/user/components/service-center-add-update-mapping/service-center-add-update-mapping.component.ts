import { Component, OnInit, Input } from '@angular/core';
import { Observable, Subject, of, concat } from 'rxjs';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'lodash';
import { distinctUntilChanged, tap, catchError, switchMap, map } from 'rxjs/operators';
import { IAlert } from 'src/app/public/models/AlertMessage';
import { UsersService } from 'src/app/public/services/users.service';

@Component({
  selector: 'app-service-center-add-update-mapping',
  templateUrl: './service-center-add-update-mapping.component.html',
  styleUrls: ['./service-center-add-update-mapping.component.scss']
})
export class ServiceCenterAddUpdateMappingComponent implements OnInit {

  @Input() popupDetails: any;
  toUserList$ = new Observable<any>();
  toUserListInput$ = new Subject<any>();
  mappingForm: FormGroup;
  loadForm = false;
  submitted = false;
  formLoading = false;
  page: {
    size: number, // The number of elements in the page
    totalElements: number, // The total number of elements
    totalPages: number, // The total number of pages
    pageNumber: number, // The current page number
  };
  alertMsg: IAlert;
  searchString: any;
  sortUserList: { sort_order: string, sort_column: string };
  pageSize;
  serviceCenterList: any;

  constructor(
    private usersService: UsersService,
    public modal: NgbActiveModal,
    private fb: FormBuilder,
  ) { }

  ngOnInit(): void {
    // console.log(this.popupDetails);
    this.defaultObject();
    this.pageSize = '15';
    this.loadUserList('');
    this.createUserForm();
    this.loadServiceCenterList();
  }

  defaultObject() {
    this.page = { size: 15, totalElements: 0, totalPages: 10, pageNumber: 1 };
    this.sortUserList = { sort_order: 'desc', sort_column: 'userId' };
    this.searchString = null;
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
        serviceCenterList: this.getSaveStoreList(formVal.stores)
      };
      this.usersService.saveUserStoreMapping(param).subscribe(res => {
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
        serviceCenterId: str.serviceCenterId,
        serviceCenterName: str.serviceCenterName,
      };
      ary.push(_.cloneDeep(obj));
    });
    return ary;
  }

  private loadUserList(searchTxt?): void {
    this.toUserList$ = concat(
      this.getUserList(searchTxt ? searchTxt : ''), // default items
      this.toUserListInput$.pipe(
        distinctUntilChanged(),
        tap(() => this.formLoading = true),
        switchMap(term => this.getUserList(term).pipe(
          catchError(() => of([])), // empty list on error
          tap(() => this.formLoading = false)
        ))
      )
    );
  }

  getUserList(searchTxt):Observable<any>{
    const param = {
      limit: this.page.size,
      pageNumber: this.page.pageNumber,
      sortOrder: this.sortUserList.sort_order,
      sortColumn: this.sortUserList.sort_column,
      searchKeyword: searchTxt,
    };

    return this.usersService.getUserServiceMappingList(param).pipe(
      map((res: any) => {
        return res
      })
    );
  }

  private loadServiceCenterList(): void {
    this.usersService.getUserServiceCenterMappingList(this.popupDetails.data.user_id).subscribe((res)=>{
      if(res){
        this.serviceCenterList = res.serviceMapping;
      }
    })
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
    console.log(user)
    this.usersService.getUserServiceCenterMappingList(user.userId).subscribe(res => {
      if(res){
        this.serviceCenterList = res.serviceMapping;
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

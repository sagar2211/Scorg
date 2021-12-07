import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { IAlert } from 'src/app/public/models/AlertMessage';
import { CommonService } from 'src/app/public/services/common.service';
import { PatientDeathService } from '../../services/patient-death.service';
import * as moment from 'moment';
import { ConfirmationPopupComponent } from 'src/app/shared/confirmation-popup/confirmation-popup.component';
import { Constants } from 'src/app/config/constants';
import { AuthService } from 'src/app/public/services/auth.service';
import { UsersService } from 'src/app/public/services/users.service';
import { NgxPermissionsService } from 'ngx-permissions';
import { ApplicationConstants, PermissionsConstants } from 'src/app/config/PermissionsConstants';

@Component({
  selector: 'app-death-patient-list',
  templateUrl: './death-patient-list.component.html',
  styleUrls: ['./death-patient-list.component.scss']
})
export class DeathPatientListComponent implements OnInit {
  @ViewChild(DatatableComponent, { static: false }) public table: DatatableComponent;
  pageSize;
  itemList = [];
  page: {
    size: number, // The number of elements in the page
    totalElements: number, // The total number of elements
    totalPages: number, // The total number of pages
    pageNumber: number, // The current page number
  };
  searchString: any;
  externalPaging: boolean;
  sortUserList: { sort_order: string, sort_column: string };
  alertMsg: IAlert;
  subject: Subject<string> = new Subject();
  ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  compInstance = this;
  isNgSelectTypeHeadDisabled = false;
  isFilterApply: boolean;
  datatableBodyElement: any;
  editPermission: boolean;
  PermissionConstantList: any = [];
  isActive: boolean;
  showAddPopup = false;
  $destroy: Subject<boolean> = new Subject();
  fromDate: Date = new Date(moment().format('YYYY-MM-01'));
  toDate: Date = new Date(moment().format('YYYY-MM-DD'));
  appKey = null;
  isPartialLoad = false;
  constructor(
    private commonService: CommonService,
    private route: ActivatedRoute,
    private modalService: NgbModal,
    private router: Router,
    private patientDeathService: PatientDeathService,
    private authService: AuthService,
    private userService: UsersService,
    private permissionsService: NgxPermissionsService,
  ) { }

  ngOnInit(): void {
    this.PermissionConstantList = PermissionsConstants;
    this.pageSize = '15';
    this.route.paramMap.subscribe(data => {
      const token = data.get('token');
      this.appKey = data.get('appKey');
      if (token) {
        this.isPartialLoad = true;
        this.loginThroghSSO(token).then(res1 => {
          this.defaultObject();
          this.getItemList();
        });
      }
      else {
        this.defaultObject();
        this.getItemList();
      }
    })

    this.subjectFun();
    this.commonService.routeChanged(this.route);
  }

  loginThroghSSO(token) {
    const promise = new Promise((resolve, reject) => {
      this.authService.loginThroghSSO(token, this.appKey).subscribe(res => {
        if (res.status_message === 'Success') {
          const userObject = res.data;
          this.commonService.storeKeyValues = [];
          this.commonService.userListTempParams = null;
          this.commonService.getScheduleDataParams = null;
          this.userService.masterUserDetails = {};
          this.authService.redirectUrl = null;
          // store login info to local storage
          this.authService.storeLoginInfo(userObject);
          this.assignRoleAndRedirect(userObject);
          resolve(true);
        } else if (res) {
          resolve(false);
        }
      });
    });
    return promise;
  }

  assignRoleAndRedirect(userObject): void {
    this.userService.GetAssignedRolePermissionsByUserId(userObject.id)
      .subscribe((result) => {
        const userPermission = this.userService.userPermission;
        this.permissionsService.loadPermissions(userPermission);
      });
  }

  ngOnDestroy(): void {
    this.$destroy.next(true);
    this.$destroy.unsubscribe();
  }

  ngOnChanges() {
    this.getItemList();
  }

  defaultObject() {
    this.isFilterApply = false;
    this.page = { size: 15, totalElements: 0, totalPages: 10, pageNumber: 1 };
    this.sortUserList = { sort_order: 'desc', sort_column: 'deathRegId' };
    this.searchString = null;
    this.externalPaging = true;
    this.isActive = true;
  }

  subjectFun() {
    // -- Subscribe to the subject, which is triggered from search input and when section clicked
    // -- When the debounce time has passed, we call getActiveScheduleData()
    this.subject
      .pipe(debounceTime(500), takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.page.pageNumber = 1;
        this.getItemList();
      }
      );
  }

  getItemList(): void {
    const reqParams = {
      searchKeyword: this.searchString,
      sortOrder: this.sortUserList.sort_order,
      sortColumn: this.sortUserList.sort_column,
      pageNumber: this.page.pageNumber,
      limit: this.page.size,
      fromDate: this.fromDate,
      toDate: this.toDate,
      isActive: this.isActive
    };
    this.patientDeathService.getDeathRegisterList(reqParams).subscribe(res => {
      if (res.data.length > 0) {
        this.itemList = res.data;
        console.log(this.itemList)
        this.page.totalElements = res.totalCount ? res.totalCount : res.data.length;
      } else {
        this.itemList = [];
        this.page.totalElements = 0;
      }
    });
  }

  clearSearchString(): void {
    this.searchString = null;
    this.getItemList();
  }

  editPatient(evt): void {
    const parentAppUrl = window.location.ancestorOrigins.length ? window.location.ancestorOrigins[0] : '';
    if(parentAppUrl && this.isPartialViewInHmis){
      let redirectionUrl = '';
      const appName = window.location.href.includes('/emr-fe/') ? '/hmis-web/' : '/';
      redirectionUrl = parentAppUrl + appName + this.appKey + '/Patient/AddMlcDetails?id=' + evt.encounterId;
      window.top.location.href = redirectionUrl;
    } else if (evt) {
      // navigate to url
      this.router.navigate(['/nursingApp/nursing/deathRegister/updatePatient/' + evt.encounterId]);
    }
  }

  onPageSizeChanged(newPageSize): void {
    this.sortUserList = { sort_order: 'desc', sort_column: 'deathRegId' };
    this.page.size = Number(newPageSize);
    this.page.pageNumber = 1;
    this.getItemList();
  }

  onSortChanged(event): void {
    if (event.sorts.length > 0) {
      const obj = event.sorts[0];
      this.sortUserList.sort_order = obj.dir;
      this.sortUserList.sort_column = obj.prop;
      this.getItemList();
    }
  }

  onSetPage(pageInfo) {
    this.table.offset = pageInfo.offset - 1;
    return;
  }

  deleteItem(row) {
    const modalTitleobj = 'Delete';
    const modalBodyobj = 'Do you want to delete this';
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
        this.patientDeathService.deleteDeathRegisterById(row.deathRegId).subscribe(response => {
          if (response.status_code === 200 && response.status_message === 'Success') {
            this.getItemList();
            this.alertMsg = {
              message: response.message,
              messageType: 'success',
              duration: Constants.ALERT_DURATION
            };
          } else {
            this.alertMsg = {
              message: response.message,
              messageType: 'warning',
              duration: Constants.ALERT_DURATION
            };
          }
        });
      }
    });
    modalInstance.componentInstance.messageDetails = messageDetails;
  }

  private get isPartialViewInHmis() {
    return this.appKey == ApplicationConstants.Registration
      || this.appKey == ApplicationConstants.IPD || this.appKey == ApplicationConstants.OPD
      || this.appKey == ApplicationConstants.Emergency || this.appKey == ApplicationConstants.Billing
      || this.appKey == ApplicationConstants.admin
      || this.appKey == ApplicationConstants.HMIS;
  }

  updateDataTable() {
    this.getItemList();
  }

  onFooterPage(event): void {
    this.page.pageNumber = event.page;
    this.getItemList();
  }

}

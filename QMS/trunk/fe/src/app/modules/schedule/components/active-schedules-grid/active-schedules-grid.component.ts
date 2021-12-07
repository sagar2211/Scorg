import { Component, OnInit, ViewChild, OnChanges } from '@angular/core';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { ScheduleMakerService } from '../../services/schedule-maker.service';
import { IAlert } from 'src/app/models/AlertMessage';
import { Subject, Observable, of } from 'rxjs';
import { debounceTime, takeUntil, map, catchError } from 'rxjs/operators';
import { EntityBasicInfoService } from '../../services/entity-basic-info.service';
import { Entity } from '../../models/entity.model';
import { environment } from 'src/environments/environment';
import { ServiceProvider } from '../../models/service-provider.model';
import { FormBuilder, FormGroup } from '@angular/forms';
import * as _ from 'lodash';
import { Router, ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { CommonService } from '../../../../services/common.service';
import { Constants } from 'src/app/config/constants';
import { NgbModal, NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationPopupComponent } from 'src/app/components/confirmation-popup/confirmation-popup.component';
import { PermissionsConstants } from 'src/app/shared/constants/PermissionsConstants';
import { SlideInOutLogAnimation } from 'src/app/config/animations';

@Component({
  selector: 'app-active-schedules-grid',
  templateUrl: './active-schedules-grid.component.html',
  styleUrls: ['./active-schedules-grid.component.scss'],
  animations: [SlideInOutLogAnimation]
})
export class ActiveSchedulesGridComponent implements OnInit, OnChanges {
  @ViewChild(DatatableComponent, { static: false }) public table: DatatableComponent;
  pageSize;
  activeScheduleList = [];
  page: {
    size: number, // The number of elements in the page
    totalElements: number, // The total number of elements
    totalPages: number, // The total number of pages
    pageNumber: number, // The current page number
  };
  searchString: string;
  externalPaging: boolean;
  sortUserList: { sort_order: string, sort_column: string };
  alertMsg: IAlert;
  subject: Subject<string> = new Subject();
  ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  entityList: Entity[] = [];
  serviceProviderList: ServiceProvider[] = [];
  activeScheduleFilterForm: FormGroup;
  compInstance = this;
  isNgSelectTypeHeadDisabled = false;
  showFilter: boolean;
  isFilterApply: boolean;
  showOnlyNoSchedule: boolean;
  modalService: NgbModal;
  permissionconstList: any = [];
  animationState = 'out';
  isShowInstruction = false;
  destroy$ = new Subject();
  selectedEntity = '';
  selectedProvider = '';
  ngbPopover: NgbPopover;


  constructor(
    private scheduleMakerService: ScheduleMakerService,
    private entityBasicInfoService: EntityBasicInfoService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private commonService: CommonService,
    private confirmationModalService: NgbModal,
  ) {
    this.modalService = confirmationModalService;
  }

  ngOnInit() {
    this.commonService.routeChanged(this.route);
    this.defaultObject();
    this.createForm();
    this.pageSize = '15';
    this.permissionconstList = PermissionsConstants;
    if (this.commonService.getScheduleDataParams) { // fetch tempsearch Value
      this.page.size = this.commonService.getScheduleDataParams.paramObj.limit_per_page;
      this.page.pageNumber = this.commonService.getScheduleDataParams.paramObj.current_page;
      this.sortUserList.sort_order = this.commonService.getScheduleDataParams.paramObj.sort_order;
      this.sortUserList.sort_column = this.commonService.getScheduleDataParams.paramObj.sort_column;
      this.searchString = this.commonService.getScheduleDataParams.paramObj.searchString;
      this.showOnlyNoSchedule = this.commonService.getScheduleDataParams.paramObj.showOnlyNoSchedule;
      this.isFilterApply = this.commonService.getScheduleDataParams.filterValue;
      const objForm = {
        selectedEntity: this.commonService.getScheduleDataParams.formValue.value.selectedEntity,
        selectedServiceProvider: this.commonService.getScheduleDataParams.formValue.value.selectedServiceProvider,
        startDate: this.commonService.getScheduleDataParams.formValue.value.startDate,
        endDate: this.commonService.getScheduleDataParams.formValue.value.endDate,
      };
      this.activeScheduleFilterForm = this.fb.group(objForm);
    }
    this.getActiveScheduleData();
    this.getAllEntityList().subscribe();
    this.subjectFun();
    this.showActivePopup(); // Global Filter Button
    this.commonService.$logSliderOpenClose.pipe(takeUntil(this.destroy$)).subscribe((obj: any) => {
      if (obj === 'open') {
        this.isShowInstruction = true;
        this.animationState = this.isShowInstruction ? 'in' : 'out';
      } else {
        this.isShowInstruction = false;
        this.selectedEntity = '';
        this.selectedProvider = '';
        this.animationState = 'out';
      }
    });
  }

  ngOnChanges() {
    this.getServiceProviderList().subscribe();
  }

  createForm() {
    this.patchDefaultValue();
  }

  patchDefaultValue() {
    const objForm = {
      selectedEntity: [null],
      selectedServiceProvider: [null],
      startDate: [null],
      endDate: [null],
    };
    this.activeScheduleFilterForm = this.fb.group(objForm);
  }

  subjectFun() {
    // -- Subscribe to the subject, which is triggered from search input and when section clicked
    // -- When the debounce time has passed, we call getActiveScheduleData()
    this.subject
      .pipe(debounceTime(500), takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.page.pageNumber = 1;
        this.getActiveScheduleData();
      }
      );
  }

  getActiveScheduleData() {
    if (this.showOnlyNoSchedule && this.sortUserList.sort_column === 'start_date') {
      this.sortUserList.sort_column = 'entity_name';
    }
    const param = {
      limit_per_page: this.page.size,
      current_page: this.page.pageNumber,
      sort_order: this.sortUserList.sort_order,
      sort_column: this.sortUserList.sort_column,
      searchString: this.searchString,
      selectedEntity: null,
      selectServiceProvider: null,
      startDate: null,
      endDate: null,
      showOnlyNoSchedule: this.showOnlyNoSchedule
    };
    if (this.isFilterApply && this.compInstance.activeScheduleFilterForm) {
      const formVal = this.compInstance.activeScheduleFilterForm.value;
      param.searchString = null;
      param.selectedEntity = formVal.selectedEntity ? formVal.selectedEntity.id : null;
      param.selectServiceProvider = formVal.selectedServiceProvider ? formVal.selectedServiceProvider.id : null;
      param.startDate = formVal.startDate ? moment(formVal.startDate).format(Constants.apiDateFormate) : null;
      param.endDate = formVal.endDate ? moment(formVal.endDate).format(Constants.apiDateFormate) : null;
    }
    if (this.searchString) {
      param.startDate = null;
      param.endDate = null;
    }
    this.scheduleMakerService.getActiveScheduleList(param).subscribe(res => {
      this.commonService.getScheduleDataParams = {
        paramObj: param,
        formValue: this.compInstance.activeScheduleFilterForm,
        filterValue: this.isFilterApply
      };
      if (res.data.length > 0) {
        this.activeScheduleList = res.data;
        this.page.totalElements = res.total_count;
      } else {
        this.activeScheduleList = [];
        this.page.totalElements = 0;
      }
    });
  }

  defaultObject() {
    this.isFilterApply = false;
    this.showOnlyNoSchedule = false;
    this.page = { size: 15, totalElements: 0, totalPages: 10, pageNumber: 1 };
    this.sortUserList = { sort_order: 'desc', sort_column: 'start_date' };
    this.searchString = '';
    this.externalPaging = true;
    this.showFilter = false;
    this.commonService.setPopupFlag(false, this.showFilter);
  }

  onPageSizeChanged(newPageSize) {
    this.sortUserList = { sort_order: 'desc', sort_column: '' };
    this.page.size = Number(newPageSize);
    this.page.pageNumber = 1;
    this.getActiveScheduleData();
  }

  onFooterPage(event): void {
    this.page.pageNumber = event.page;
    this.getActiveScheduleData();
  }

  onSortChanged(event) {
    if (event.sorts.length > 0) {
      const obj = event.sorts[0];
      this.sortUserList.sort_order = obj.dir;
      this.sortUserList.sort_column = this.getSortColumnName(obj.prop);
      this.getActiveScheduleData();
    }
  }

  getSortColumnName(clmName) {
    if (clmName === 'entity') {
      return 'entity_name';
    } else if (clmName === 'provider') {
      return 'entity_data_name';
    } else if (clmName === 'activeSchedule') {
      return 'start_date';
    } else {
      return '';
    }
  }

  onSetPage(pageInfo) {
    this.table.offset = pageInfo.offset - 1;
    if (this.externalPaging) {
      return;
    }
  }

  selectEntityType(event) {
    this.compInstance.activeScheduleFilterForm.patchValue({ selectedEntity: event ? event : null });
  }

  selectServiceProvider(event) {
    // this.activeScheduleFilterForm.patchValue({ selectServiceProvider: event ? event : null });
    this.compInstance.activeScheduleFilterForm.patchValue({ selectedServiceProvider: event ? event : null });
  }

  getAllEntityList(): Observable<any> {
    return this.compInstance.entityBasicInfoService.getAllEntityList().pipe(map(res => {
      this.entityList = res;
      return this.entityList;
    }),
      catchError(error => [])
    );
  }

  getServiceProviderList(searchKey?): Observable<any> {
    if (_.isUndefined(this.compInstance.activeScheduleFilterForm)
      || _.isEmpty(this.compInstance.activeScheduleFilterForm.value.selectedEntity)
      || this.compInstance.activeScheduleFilterForm.value.selectedEntity == null) {
      return of([]);
    } else {
      const entity = this.compInstance.activeScheduleFilterForm.value
        ? this.compInstance.activeScheduleFilterForm.value.selectedEntity.id : null;
      const params = {
        limit: environment.limitDataToGetFromServer,
        search_text: searchKey ? searchKey : null,
        id: entity,
        specialityId: null
      };
      return this.compInstance.entityBasicInfoService.getAllServiceProviderList(params).pipe(map(res => {
        this.serviceProviderList = [];
        if (res.length > 0) {
          _.map(res, (val, key) => {
            const serviceProvider = new ServiceProvider();
            if (serviceProvider.isObjectValid(val)) {
              serviceProvider.generateObject(val);
              this.serviceProviderList.push(serviceProvider);
            }
          });
        }
        return this.serviceProviderList;
      }),
        catchError(error => [])
      );
    }
  }

  activeInactiveFilter() {
    this.showFilter = !this.showFilter;
    this.commonService.setPopupFlag(false, this.showFilter);
  }

  clearFilterFormData() {
    this.defaultObject();
    this.compInstance.activeScheduleFilterForm.patchValue({ selectedEntity: null });
    this.compInstance.activeScheduleFilterForm.patchValue({ selectedServiceProvider: null });
    this.compInstance.activeScheduleFilterForm.patchValue({ startDate: null });
    this.compInstance.activeScheduleFilterForm.patchValue({ endDate: null });
    this.commonService.getScheduleDataParams = null;
    this.getActiveScheduleData();
  }

  checkFormSubmit() {
    // this.defaultObject();
    this.page.size = this.pageSize;
    this.isFilterApply = true;
    this.getActiveScheduleData();
  }

  clearSearchString() {
    this.searchString = null;
    this.commonService.getScheduleDataParams = null;
    this.getActiveScheduleData();
  }

  viewScheduleData(data) {
    this.entityBasicInfoService.activeScheduleDataForEdit = data;
    this.router.navigate(['/app/qms/schedule/editScheduleMaster', data.entity.id, data.provider.id]);
  }

  editTimeSchedule(data) {
    this.entityBasicInfoService.activeScheduleDataForEdit = data;
    this.router.navigate(['/app/qms/schedule/updateTimeSchedule', data.entity.id, data.provider.id, _.snakeCase(data.provider.name, ' ', '_'), data.scheduleId]);
  }
  addTimeSchedule() {
    this.entityBasicInfoService.activeScheduleDataForEdit = {};
    this.router.navigate(['/app/qms/schedule/addTimeSchedule']);
  }

  addNewScheduleData() {
    this.entityBasicInfoService.activeScheduleDataForEdit = {};
    this.router.navigate(['/app/qms/schedule/addScheduleMaster']);
  }

  redirectToManageCalendar(data) {
    this.router.navigate(['/appointmentApp/appointments/settings/entitySettings'], {
      queryParams: {
        entity_id: data.entity.id,
        provider_id: data.provider.id,
        providerName: data.provider.name,
        providerTypeName: data.entity.name,
      },
    });
  }

  redirectToManageAppointment(data) {
    this.router.navigate(['/appointmentApp/appointments/list/appointmentsList'], {
      queryParams: {
        entity_id: data.entity.id,
        provider_id: data.provider.id,
        providerName: data.provider.name,
        providerTypeName: data.entity.name,
      }
    });
  }

  showActivePopup() {
    this.commonService.$addPopupEvent.subscribe(popup => {
      if (popup) {
        this.showFilter = popup.isShowFilterPopup;
      } else {
        this.showFilter = false;
      }
    });
  }

  loadConfirmationPopup(scheduleData, index) {
    const status = scheduleData.status ? 'Inactive' : 'Active';
    const modalTitleobj = 'CONFIRMATION';
    const modalBodyobj = 'Do you want to change the user status of <span class="font-weight-500">' + scheduleData.provider.name + '</span> to <span class="font-weight-500">' + status + '</span>';
    const messageDetails = {
      modalTitle: modalTitleobj,
      modalBody: modalBodyobj
    };
    const modalInstance = this.confirmationModalService.open(ConfirmationPopupComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false
      });
    modalInstance.result.then((result) => {
      if (result === 'Ok') {
        this.updateScheduleStatus({ ...scheduleData }, index);
      }
    }, () => { });
    modalInstance.componentInstance.messageDetails = messageDetails;
  }

  updateScheduleStatus(data, index) {
    const result = _.clone(data, true);
    const param = {
      entity_id: result.entity.id,
      entity_value_id: result.provider.id,
      is_active: data.status = !result.status
    };
    this.scheduleMakerService.updateScheduleStatus(param).subscribe(res => {
      if (res.status_code === 200 && res.message === 'Updated successfully') {
        this.activeScheduleList[index].status = result.status = !result.status;
        this.alertMsg = {
          message: 'Status updated successfully.',
          messageType: 'success',
          duration: 3000
        };
      } else {
        this.alertMsg = {
          message: res.message,
          messageType: 'danger',
          duration: 3000
        };
      }
    });
  }
  showscheduleHistory(rowData) {
    this.selectedEntity = rowData.entity.id;
    this.selectedProvider = rowData.provider.id;
    this.commonService.openCloselogSlider('open');
  }
  closeInstruction() {
    this.commonService.openCloselogSlider('close');
  }

  onPopoverClick(ele: NgbPopover): void {
    if (ele) {
      this.ngbPopover = ele;
    }
  }
  onScrollForPopOver(): void {
    if (this.ngbPopover) {
      this.ngbPopover.close();
    }
  }
}

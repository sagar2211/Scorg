import { Component, OnInit, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { map, catchError, takeUntil } from 'rxjs/operators';
import { Observable, Subject, of, forkJoin } from 'rxjs';
import * as _ from 'lodash';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { fadeInOut } from 'src/app/config/animations';
import { DatatableComponent } from '@swimlane/ngx-datatable';

// new imports
import { NgxPermissionsService } from 'ngx-permissions';
import { RoleType } from 'src/app/public/models/roletype';
import { Roles } from 'src/app/public/models/roles';
import { IAlert } from 'src/app/public/models/AlertMessage';
import { UsersService } from 'src/app/public/services/users.service';
import { CommonService } from 'src/app/public/services/common.service';
import { TemplatesService } from 'src/app/modules/communication/services/templates.service';
import { EntityBasicInfoService } from 'src/app/public/services/entity-basic-info.service';
import { PermissionsConstants } from 'src/app/config/PermissionsConstants';
import { TemplateMapping } from 'src/app/modules/communication/models/template-mapping';


@Component({
  selector: 'app-template-mapping',
  templateUrl: './template-mapping.component.html',
  styleUrls: ['./template-mapping.component.scss'],
  animations: [
    fadeInOut
  ],
})
export class TemplateMappingComponent implements OnInit, OnDestroy, AfterViewInit {

  sortUserList: { sort_order: string, sort_colum: string };
  page: {
    size: number, // The number of elements in the page
    totalElements: number, // The total number of elements
    totalPages: number, // The total number of pages
    pageNumber: number, // The current page number
  };
  createRoleForm: FormGroup;
  isNgSelectTypeHeadDisabled = false;
  submitted = false;
  compInstance = this;
  rolesTypeList: RoleType[] = [];
  editUserId: '';
  // reSizeCoulmnWidth = 300;
  swapColumns = false;
  roleList: any[] = [];
  externalPaging = true;
  addEditDiv = false;
  modalService: NgbModal;
  datatableBodyElement: any;
  tempEditedObject = {
    roleName: ''
  };

  templateMappingListFilterForm: FormGroup;
  primaryRolesList: Roles[] = [];

  // new code from here
  @ViewChild(DatatableComponent, { static: false }) public table: DatatableComponent;
  alertMsg: IAlert;
  destroy$ = new Subject();
  templateMappingList: TemplateMapping[] = [];
  entityList: any[];
  templateCategoryList: [];
  templateEventList: any[];
  templateMasterList: any[];
  entityTemplateMapForm: FormGroup;
  showTemplateFilter = false;
  globalSearchKeyword: string = '';
  editPermission: boolean;

  constructor(
    public userService: UsersService,
    public router: Router,
    private confirmationModalService: NgbModal,
    public fb: FormBuilder,
    private route: ActivatedRoute,
    private commonService: CommonService,
    private tempalteService: TemplatesService,
    private entityBasicInfoService: EntityBasicInfoService,
    private ngxPermissionsService: NgxPermissionsService

  ) {
    this.modalService = confirmationModalService;
  }

  ngOnInit() {
    this.commonService.routeChanged(this.route);
    this.showActivePopup();
    this.editPermission = _.isUndefined(this.ngxPermissionsService.getPermission(PermissionsConstants.Update_Template_Mapping)) ? false : true;
    this.defaultTemplateObject();
    this.getEmailTemplateMappingList();
    this.getEntityList().subscribe();
    this.getTemplateCategoryList().subscribe();
    //this.getTemplateMasterList().subscribe();
    //this.getTemplateCategoryEventList();

  }

  defaultTemplateObject(): void {
    this.page = { size: 15, totalElements: 0, totalPages: 10, pageNumber: 1 };
    this.sortUserList = { sort_order: 'asc', sort_colum: 'role_type_name' };

    this.entityTemplateMapForm = this.fb.group({
      id: [''],
      entity: ['', Validators.required],
      templateCategory: ['', Validators.required],
      templateEvent: ['', Validators.required],
      templateName: ['', Validators.required],
      isActive: [true]
    });

    this.templateMappingListFilterForm = this.fb.group({
      entity: '',
      templateCategory: '',
      status: '',
    });
  }
  get entityTemplateMapFormControls() {
    return this.entityTemplateMapForm.controls;
  }

  // GRID Events

  onPageSizeChanged(newPageSize) {
    this.sortUserList = { sort_order: 'asc', sort_colum: 'entity_name' };
    this.page.size = Number(newPageSize);
    this.page.pageNumber = 1;
  }
  onSetPage(pageInfo) {
    this.table.offset = pageInfo.offset;
    if (this.externalPaging) {
      return;
    }
  }
  onFooterPage(event): void {
    this.page.pageNumber = event.page;
  }
  addTableBodyHeight(): void {
    this.isNgSelectTypeHeadDisabled = false;
    this.datatableBodyElement.setAttribute('style', 'height:calc(100vh - 376px)');
  }
  ngAfterViewInit(): void {
    this.datatableBodyElement = this.table.element.children[0].children[1];
    this.datatableBodyElement.setAttribute('style', 'height:calc(100vh - 200px)');
  }

  getEmailTemplateMappingList(): void {
    const filterTemplateCategoryId = [];
    this.tempalteService.getEmailTemplateMappingList(filterTemplateCategoryId).subscribe(res => {
      this.page.totalElements = res.length;
      this.templateMappingList = res;
    });
  }

  // CRUD Field Data Load

  getEntityList(): Observable<any>  {
    return this.entityBasicInfoService.getAllEntityList().pipe(map(res => {
      this.entityList = res;
      return this.entityList;
    }),
      catchError(error => [])
    );
  }

  getTemplateCategoryList(): Observable<any> {
    return this.tempalteService.getTemplateCategoryList().pipe(map(res => {
      this.templateCategoryList = res;
      return this.templateCategoryList;
    }),
      catchError(error => [])
    );
  }
  getTemplateEventList(categoryId): Observable<any> {
    const params = categoryId;
    return this.tempalteService.getTemplateEventsByCategory(params).pipe(map(res => {
      const eventList = [];
      _.map(res, (v) => {
        eventList.push({ id: v.event_value, name: v.event_name });
      })
      return this.templateEventList = eventList;
    }),
      catchError(error => [])
    );
  }
  getTemplateListByEvent(event): void {
    this.entityTemplateMapForm.patchValue({
      templateEvent: event ? event : null,
      templateName: null,
    });
  }
  getTemplateMasterList(CategoryId): Observable<any> {
      return this.tempalteService.getAllTemplateList(CategoryId).pipe(map(res => {
        return this.templateMasterList = [...res];
      }));
  }

  // Function and Method for Custom Operation

  filterDataBySearchKeyword(event) {
    const val = event.target.value.toLowerCase().trim();
    let temp = [];
    // filter our data
    if (val) {
      temp = _.filter(this.tempalteService.templateMappingList, (d) =>
        d.entity_name.toLowerCase().trim().indexOf(val) !== -1
        || d.category_name.toLowerCase().trim().indexOf(val) !== -1
        || d.event_name.toLowerCase().trim().indexOf(val) !== -1
        || d.template_name.toLowerCase().trim().indexOf(val) !== -1
        || !val
      );
      // update the rows
      this.templateMappingList = [...temp];
    } else {
      this.getEmailTemplateMappingList();
    }
    // Whenever the filter changes, always go back to the first page
    this.table.offset = 0;
  }

  // Type Ahead Change Events

  onSelectEntity(event) {
    this.submitted = false;
    this.entityTemplateMapForm.patchValue({
      entity: event ? event : null,
      templateCategory: null,
      templateEvent: null,
      templateName: null
    });
    this.templateEventList = [];
    this.templateMasterList = [];
  }
  onSelectTemplateCategory(event) {
    this.submitted = false;
    this.entityTemplateMapForm.patchValue({
      templateCategory: event ? event : null,
      templateEvent: null,
      templateName: null
    });
    this.templateEventList = [];
    this.templateMasterList = [];
    if (event) {
      this.getTemplateEventList(event.id).subscribe();
      this.getTemplateMasterList(event.id).subscribe();
    }
  }
  onSelectTemplateEvent(event) {
    this.submitted = false;
    this.entityTemplateMapForm.patchValue({
      templateEvent: event ? event : null,
      templateName: null
    });
  }
  onSelectTemplateName(event) {
    this.submitted = false;
    this.entityTemplateMapForm.patchValue({
      templateName: event ? event : null
    });
  }

  // CRUD Events

  cancelTemplateMapping(): void {
    this.entityTemplateMapForm.reset({});
    this.entityTemplateMapForm = this.fb.group({
      id: [''],
      entity: ['', Validators.required],
      templateCategory: ['', Validators.required],
      templateEvent: ['', Validators.required],
      templateName: ['', Validators.required],
      isActive: [true]
    });

    this.submitted = false;
    this.addEditDiv = false;
    this.isNgSelectTypeHeadDisabled = false;
    this.tempEditedObject.roleName = '';
    this.commonService.setPopupFlag(this.addEditDiv, false);
    this.datatableBodyElement.setAttribute('style', 'height:calc(100vh - 200px)');
  }
  editTemplateMapping(editObject): void {
    this.getTemplateEventList(editObject.template_category_id).subscribe(res => {
      this.getTemplateMasterList(editObject.template_category_id).subscribe(res1 => {
        this.isNgSelectTypeHeadDisabled = true;
        this.datatableBodyElement.setAttribute('style', 'height:calc(100vh - 376px)');
        this.entityTemplateMapForm.patchValue({
          id: editObject.id,
          entity: { id: editObject.entity_id, name: editObject.entity_name },
          templateCategory: { id: editObject.template_category_id, name: editObject.category_name },
          templateEvent: { id: editObject.event_name, name: editObject.event_name },
          templateName: { id: editObject.template_id, name: editObject.template_name },
          isActive: editObject.template_isactive
        });
        this.commonService.isAddButtonDisable = true;
      });
    });
  }
  addUpdateTemplateMapping(): void {
    this.submitted = true;
    if (this.entityTemplateMapForm.valid && this.submitted) {
      const newobject = {
        id: this.entityTemplateMapForm.value.id ? this.entityTemplateMapForm.value.id : 0,
        entity_id: this.entityTemplateMapForm.value.entity.id,
        entity_name: this.entityTemplateMapForm.value.entity.name,
        template_category_id: this.entityTemplateMapForm.value.templateCategory.id,
        category_name: this.entityTemplateMapForm.value.templateCategory.name,
        event_name: this.entityTemplateMapForm.value.templateEvent.id,
        template_id: this.entityTemplateMapForm.value.templateName.id,
        template_name: this.entityTemplateMapForm.value.templateName.name,
        template_isactive: this.entityTemplateMapForm.value.isActive,
        event_display_name: this.entityTemplateMapForm.value.templateEvent.name
      };

      let addUpdateTemplateMapping = newobject.id ? this.tempalteService.editEmailTemplateMapping(newobject)
         : this.tempalteService.SaveEmailTemplateMapping(newobject);

      forkJoin([addUpdateTemplateMapping]).subscribe(results => {
        if (results[0].status_code === 200) {
          this.templateMappingList = [...results[0].templateMappingList];
          this.page.totalElements = this.templateMappingList.length;
          //this.getEmailTemplateMappingList();
          this.isNgSelectTypeHeadDisabled = false;
          this.datatableBodyElement.setAttribute('style', 'height:calc(100vh - 200px)');
          this.alertMsg = {
            message: this.entityTemplateMapForm.value.id ? 'Event Template Mapping Updated Successfully.' : 'Event Template Mapping Saved Successfully.',
            messageType: 'success',
            duration: 3000
          };
          this.cancelTemplateMapping();
        }
        else if(results[0].status_message === 'Error') {
          this.alertMsg = {
            message: 'Mapping Already Exists',
            messageType: 'warning',
            duration: 3000
          };
        }
      });

      // this.tempalteService.SaveEmailTemplateMapping(newobject).pipe(takeUntil(this.destroy$)).subscribe(res => {
      // });
    }
  }
  // Filter Options

  showSearchFilter() {
    this.showTemplateFilter = !this.showTemplateFilter;
    if (this.commonService.ConstantNav.isShowAddPopup) {
      this.commonService.setPopupFlag(true, this.showTemplateFilter);
    } else {
      this.commonService.setPopupFlag(false, this.showTemplateFilter);
    }
  }
  selectFilterEntity(event) {
    this.templateMappingListFilterForm.patchValue({ entity: event ? event : null });
    this.templateMappingListFilterForm.patchValue({ templateCategory: null});
  }
  selectFilterTemplateCategory(event) {
    this.templateMappingListFilterForm.patchValue({ templateCategory: event ? event : '' });
  }
  customeTemplateMappingFilter() {
    let tempTemplateMappingFilterList = [];
    const entityId = this.templateMappingListFilterForm.value.entity ? this.templateMappingListFilterForm.value.entity.id : '';
    const categoryId = this.templateMappingListFilterForm.value.templateCategory ? this.templateMappingListFilterForm.value.templateCategory.id : '';
    const isActive = this.templateMappingListFilterForm.value.status ? this.templateMappingListFilterForm.value.status.toLowerCase() : this.templateMappingListFilterForm.value.status;
    const globalSearchKeyword = this.globalSearchKeyword.toLowerCase().trim();

    if (entityId === '' && categoryId === '' && isActive === '' && globalSearchKeyword === '') {
      this.templateMappingList = [...this.tempalteService.templateMappingList];
    } else {
      if (entityId !== '') {
        tempTemplateMappingFilterList = _.filter(this.tempalteService.templateMappingList, (d) =>
          (d.entity_id.toString().indexOf(entityId.toString()) !== -1));
      }
      if (categoryId !== '') {
        const tempList = tempTemplateMappingFilterList.length ? tempTemplateMappingFilterList : this.tempalteService.templateMappingList;
        tempTemplateMappingFilterList = _.filter(tempList, (d) =>
          (d.template_category_id.toString().indexOf(categoryId.toString()) !== -1));
      }
      if (isActive !== '') {
        const tempList = tempTemplateMappingFilterList.length ? tempTemplateMappingFilterList : this.tempalteService.templateMappingList;
        tempTemplateMappingFilterList = _.filter(tempList, (d) =>
          (d.template_isactive.toString().toLowerCase().indexOf(isActive) !== -1));
      }
      if (globalSearchKeyword !== '') {
        const tempList = tempTemplateMappingFilterList.length ? tempTemplateMappingFilterList : this.tempalteService.templateMappingList;
        tempTemplateMappingFilterList = _.filter(tempList, (d) =>
          d.entity_name.toLowerCase().trim().indexOf(globalSearchKeyword) !== -1
          || d.category_name.toLowerCase().trim().indexOf(globalSearchKeyword) !== -1
          || d.event_name.toLowerCase().trim().indexOf(globalSearchKeyword) !== -1
          || d.template_name.toLowerCase().trim().indexOf(globalSearchKeyword) !== -1
          || !globalSearchKeyword
        );
      }

      this.templateMappingList = [...tempTemplateMappingFilterList];
      this.showTemplateFilter = false;
    }
    this.showTemplateFilter = false;
    this.table.offset = 0;
  }
  clearSearchFilter(): void {
    this.globalSearchKeyword = '';
    this.templateMappingListFilterForm.reset();
    this.templateMappingListFilterForm = this.fb.group({
      entity: '',
      templateCategory: '',
      status: '',
    });
    this.getEmailTemplateMappingList();
    this.table.offset = 0;
  }
  showActivePopup() {
    this.commonService.$addPopupEvent.subscribe(popup => {
      if (popup) {
        this.addEditDiv = popup.isShowAddPopup;
        this.showTemplateFilter = popup.isShowFilterPopup;
        if (popup.isShowAddPopup) {
          this.addTableBodyHeight();
        } else {
          this.datatableBodyElement.setAttribute('style', 'height:calc(100vh - 200px)');
        }
      } else {
        this.addEditDiv = false;
        this.showTemplateFilter = false;
      }
    });
  }

  // Page Destroy

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

}

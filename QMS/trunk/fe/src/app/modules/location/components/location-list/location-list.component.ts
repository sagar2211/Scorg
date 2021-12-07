import {AfterViewInit, Component, OnChanges, OnInit, ViewChild} from '@angular/core';
import {DatatableComponent} from "@swimlane/ngx-datatable";
import {IAlert} from "../../../../models/AlertMessage";
import {Subject} from "rxjs";
import {ActivatedRoute, Router} from "@angular/router";
import {CommonService} from "../../../../services/common.service";
import {debounceTime, takeUntil} from "rxjs/operators";
import {fadeInOut} from "../../../../config/animations";
import { PermissionsConstants } from 'src/app/shared/constants/PermissionsConstants';
import { NgxPermissionsService } from 'ngx-permissions';
import * as _ from 'lodash';
import { Constants } from 'src/app/config/constants';
import { LocationModel } from 'src/app/modules/qms/models/location.model';
import { LocationMasterService } from 'src/app/modules/qms/services/location-master.service';



@Component({
  selector: 'app-location-list',
  templateUrl: './location-list.component.html',
  styleUrls: ['./location-list.component.scss'],
  animations: [
    fadeInOut
  ],
})
export class LocationListComponent implements OnInit, OnChanges, AfterViewInit {


  @ViewChild(DatatableComponent, { static: false }) public table: DatatableComponent;
  pageSize;
  LocationList: LocationModel[] = [];
  page: {
    size: number, // The number of elements in the page
    totalElements: number, // The total number of elements
    totalPages: number, // The total number of pages
    pageNumber: number, // The current page number
  };
  searchString: string;
  externalPaging: boolean = true;
  sortUserList: { sort_order: string, sort_column: string };
  alertMsg: IAlert;
  subject: Subject<string> = new Subject();
  ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  compInstance = this;
  isNgSelectTypeHeadDisabled = false;
  showFilter: boolean;
  isFilterApply: boolean;
  showActiveLocation = true;
  showAddUpdateLocationComponent: boolean;
  selectedLocationData: Location;
  datatableBodyElement: any;
  editpermission: boolean;
  PermissionConstantList:any=[];
  constructor(
    private router: Router,
    private locationMasterService: LocationMasterService,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private ngxPermissionsService: NgxPermissionsService
  ) { }

  ngOnInit() {
    this.PermissionConstantList = PermissionsConstants;
    this.editpermission = _.isUndefined(this.ngxPermissionsService.getPermission(PermissionsConstants.Location_Master_Update)) ? true : false;
    this.defaultObject();
    this.pageSize = '15';
    this.subjectFun();
    this.getAllLocationMasterData();
    this.commonService.routeChanged(this.route);
    this.showActivePopup(); // Global Add button
  }

  ngOnChanges() {
    this.getAllLocationMasterData();
  }

  ngAfterViewInit(): void {
    this.datatableBodyElement = this.table.element.children[0].children[1];
    this.datatableBodyElement.setAttribute('style', 'height:calc(100vh - 200px)');
  }

  defaultObject() {
    this.showAddUpdateLocationComponent = false;
    this.showActiveLocation = true;
    this.isFilterApply = false;
    this.page = { size: 15, totalElements: 0, totalPages: 10, pageNumber: 1 };
    this.sortUserList = { sort_order: 'desc', sort_column: 'Location_id' };
    this.searchString = '';
    this.externalPaging = true;
    this.showFilter = false;

  }

  subjectFun() {
    // -- Subscribe to the subject, which is triggered from search input and when section clicked
    // -- When the debounce time has passed, we call getActiveScheduleData()
    this.subject
      .pipe(debounceTime(500), takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
          this.page.pageNumber = 1;
          this.getAllLocationMasterData();
        }
      );
  }

  getAllLocationMasterData() {
    const param = {
      limit: this.page.size,
      search_text: this.searchString,
      current_page: this.page.pageNumber,
      is_active: true
    };
    this.locationMasterService.getAllLocationMasterList(param).subscribe(res => {
      if (res.locationData.length > 0) {
        this.LocationList = res.locationData;
        this.page.totalElements = res.totalCount;
      } else {
        this.LocationList = [];
        this.page.totalElements = 0;
      }
    });
  }


  onPageSizeChanged(newPageSize) {
    this.sortUserList = { sort_order: 'desc', sort_column: 'Location_id' };
    this.page.size = Number(newPageSize);
    this.page.pageNumber = 1;
    this.getAllLocationMasterData();
  }

  onFooterPage(event): void {
    this.page.pageNumber = event.page;
    this.getAllLocationMasterData();
  }

  onSortChanged(event) {
    if (event.sorts.length > 0) {
      const obj = event.sorts[0];
      this.sortUserList.sort_order = obj.dir;
      this.sortUserList.sort_column = this.getSortColumnName(obj.prop);
      this.getAllLocationMasterData();
    }
  }

  getSortColumnName(clmName) {
    if (clmName === 'id') {
      return 'Location_id';
    } else if (clmName === 'name') {
      return 'Location_name';
    } else if (clmName === 'location') {
      return 'Location_location';
    } else if (clmName === 'isActive') {
      return 'Location_isactive';
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

  clearSearchString() {
    this.searchString = null;
    this.getAllLocationMasterData();
  }

  addLocationMaster() {
    this.showAddUpdateLocationComponent = true;
    this.selectedLocationData = null;
    this.datatableBodyElement.setAttribute('style', 'height:calc(100vh - 315px)');
  }

  hideLocationMasterSection(eventData) {
    this.showAddUpdateLocationComponent = (typeof eventData === 'boolean') ? eventData : !eventData.isHide;
    if (eventData.locationAdded) {
      this.alertMsg = eventData.alertMsg;
    }

    this.getAllLocationMasterData();
    this.selectedLocationData = null;
    this.commonService.setPopupFlag(this.showAddUpdateLocationComponent, false);
    this.datatableBodyElement.setAttribute('style', 'height:calc(100vh - 200px)');
  }

  editLocationMaster(data) {
    this.showAddUpdateLocationComponent = true;
    this.selectedLocationData = data;
    this.commonService.isAddButtonDisable = true;
    this.datatableBodyElement.setAttribute('style', 'height:calc(100vh - 315px)');
  }
  showActivePopup() {
    this.commonService.$addPopupEvent.subscribe(popup => {
      if (popup) {
        this.showAddUpdateLocationComponent = popup.isShowAddPopup;
        if (popup.isShowAddPopup) {
          this.addLocationMaster();
        } else {
          this.datatableBodyElement.setAttribute('style', 'height:calc(100vh - 200px)');
        }
      } else {
        this.showAddUpdateLocationComponent = false;
      }
    });
  }

  deleteLoaction(row){
    let locationId = row.id;
    this.locationMasterService.deleteLoactionMaster(locationId).subscribe(response=>{
      if (response.status_code === 200 && response.status_message === 'Success'){
        this.getAllLocationMasterData();
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
    })
  }
}

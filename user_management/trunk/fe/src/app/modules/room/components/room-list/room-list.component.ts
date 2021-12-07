import { Component, OnInit, ViewChild, OnChanges, AfterViewInit } from '@angular/core';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { IAlert } from 'src/app/models/AlertMessage';
import { Subject } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { debounceTime, takeUntil } from 'rxjs/operators';
import * as _ from 'lodash';
import { fadeInOut } from 'src/app/config/animations';
import { NgxPermissionsService } from 'ngx-permissions';
import { PermissionsConstants } from 'src/app/shared/constants/PermissionsConstants';
import { Constants } from 'src/app/config/constants';
import { Room } from 'src/app/modules/qms/models/room.model';
import { LocationModel } from 'src/app/modules/qms/models/location.model';
import { RoomMasterService } from 'src/app/modules/qms/services/room-master.service';
import { CommonService } from 'src/app/services/common.service';
import { LocationMasterService } from 'src/app/modules/qms/services/location-master.service';

@Component({
  selector: 'app-room-list',
  templateUrl: './room-list.component.html',
  styleUrls: ['./room-list.component.scss'],
  animations: [
    fadeInOut
  ],
})
export class RoomListComponent implements OnInit, OnChanges, AfterViewInit {
  @ViewChild(DatatableComponent, { static: false }) public table: DatatableComponent;
  pageSize;
  roomList: Room[] = [];
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
  compInstance = this;
  isNgSelectTypeHeadDisabled = false;
  showFilter: boolean;
  isFilterApply: boolean;
  showActiveRoom: boolean;
  showAddUpdateRoomComponent: boolean;
  selectedRoomData: Room;
  datatableBodyElement: any;
  editPermission: boolean;
  LocationList: LocationModel[] = [];
  PermissionConstantList: any = [];
  constructor(
    private router: Router,
    private roomMasterService: RoomMasterService,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private ngxPermissionsService: NgxPermissionsService,
    private locationMasterService: LocationMasterService

  ) { }

  ngOnInit() {
    this.PermissionConstantList = PermissionsConstants;
    this.defaultObject();
    this.editPermission = _.isUndefined(this.ngxPermissionsService.getPermission(PermissionsConstants.Update_Room_Master)) ? true : false;
    this.pageSize = '15';
    this.subjectFun();
    this.getAllRoomMasterData();
    this.commonService.routeChanged(this.route);
    this.showActivePopup(); // Global Add button
    this.getAllLocationMasterData();
  }

  ngOnChanges() {
    this.getAllRoomMasterData();
  }

  ngAfterViewInit(): void {
    this.datatableBodyElement = this.table.element.children[0].children[1];
    this.datatableBodyElement.setAttribute('style', 'height:calc(100vh - 200px)');
  }

  defaultObject() {
    this.showAddUpdateRoomComponent = false;
    this.showActiveRoom = true;
    this.isFilterApply = false;
    this.page = { size: 15, totalElements: 0, totalPages: 10, pageNumber: 1 };
    this.sortUserList = { sort_order: 'desc', sort_column: 'room_id' };
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
        this.getAllRoomMasterData();
      }
      );
  }

  getAllRoomMasterData() {
    const param = {
      limit_per_page: this.page.size,
      current_page: this.page.pageNumber,
      sort_order: this.sortUserList.sort_order,
      sort_column: this.sortUserList.sort_column,
      searchString: this.searchString,
      showActiveRoom: true
    };
    this.roomMasterService.getAllRoomMasterList(param).subscribe(res => {
      if (res.roomData.length > 0) {
        this.roomList = res.roomData;
        this.page.totalElements = res.totalCount;
      } else {
        this.roomList = [];
        this.page.totalElements = 0;
      }
    });
  }

  onPageSizeChanged(newPageSize) {
    this.sortUserList = { sort_order: 'desc', sort_column: 'room_id' };
    this.page.size = Number(newPageSize);
    this.page.pageNumber = 1;
    this.getAllRoomMasterData();
  }

  onFooterPage(event): void {
    this.page.pageNumber = event.page;
    this.getAllRoomMasterData();
  }

  onSortChanged(event) {
    if (event.sorts.length > 0) {
      const obj = event.sorts[0];
      this.sortUserList.sort_order = obj.dir;
      this.sortUserList.sort_column = this.getSortColumnName(obj.prop);
      this.getAllRoomMasterData();
    }
  }

  getSortColumnName(clmName) {
    if (clmName === 'id') {
      return 'room_id';
    } else if (clmName === 'name') {
      return 'room_name';
    } else if (clmName === 'location') {
      return 'room_location';
    } else if (clmName === 'isActive') {
      return 'room_isactive';
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
    this.getAllRoomMasterData();
  }

  addRoomMaster() {
    this.showAddUpdateRoomComponent = true;
    this.selectedRoomData = null;
    this.datatableBodyElement.setAttribute('style', 'height:calc(100vh - 315px)');
  }

  hideRoomMasterSection(eventData) {
    this.showAddUpdateRoomComponent = (typeof eventData === 'boolean') ? eventData : !eventData.isHide;
    if (eventData.roomAdded) {
      this.alertMsg = eventData.alertMsg;
    }

    this.getAllRoomMasterData();
    this.selectedRoomData = null;
    this.commonService.setPopupFlag(this.showAddUpdateRoomComponent, false);
    this.datatableBodyElement.setAttribute('style', 'height:calc(100vh - 200px)');
  }

  editRoomMaster(data) {
    // get location id from name
    const locationObj = _.find(this.LocationList, (o) => o.name === data.location);
    if (!locationObj) { return; }
    data.locationObj = locationObj;
    this.showAddUpdateRoomComponent = true;
    this.selectedRoomData = data;
    this.commonService.isAddButtonDisable = true;
    this.datatableBodyElement.setAttribute('style', 'height:calc(100vh - 315px)');
  }
  showActivePopup() {
    this.commonService.$addPopupEvent.subscribe(popup => {
      if (popup) {
        this.showAddUpdateRoomComponent = popup.isShowAddPopup;
        if (popup.isShowAddPopup) {
          this.addRoomMaster();
        } else {
          this.datatableBodyElement.setAttribute('style', 'height:calc(100vh - 200px)');
        }
      } else {
        this.showAddUpdateRoomComponent = false;
      }
    });
  }

  getAllLocationMasterData() {
    const param = {
      limit: 100,
      search_text: this.searchString,
      is_active: true
    };
    this.locationMasterService.getAllLocationMasterList(param).subscribe(res => {
      if (res.locationData.length > 0) {
        this.LocationList = res.locationData;
      } else {
        this.LocationList = [];
      }
    });
  }

  deleteRoomMaster(row) {
    let roomId = row.id;
    this.roomMasterService.deleteRoomMaster(roomId).subscribe(response => {
      if (response.status_code === 200 && response.status_message === 'Success') {
        this.getAllRoomMasterData();
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

import { Component, OnInit, ViewChild, OnChanges, AfterViewInit } from '@angular/core';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { IAlert } from 'src/app/models/AlertMessage';
import { Subject } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { debounceTime, takeUntil } from 'rxjs/operators';
import * as _ from 'lodash';
import { NgxPermissionsService } from 'ngx-permissions';
import { PermissionsConstants } from 'src/app/shared/constants/PermissionsConstants';
import { RoomMasterService } from 'src/app/modules/qms/services/room-master.service';
import { CommonService } from 'src/app/services/common.service';
import { AuthService } from 'src/app/services/auth.service';
import { Constants } from 'src/app/config/constants';

@Component({
  selector: 'app-entity-room-map-list',
  templateUrl: './entity-room-map-list.component.html',
  styleUrls: ['./entity-room-map-list.component.scss']
})
export class EntityRoomMapListComponent implements OnInit {
  @ViewChild(DatatableComponent, { static: false }) public table: DatatableComponent;
  pageSize;
  roomMapList: [] = [];
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
  datatableBodyElement: any;
  timeFormatKey = '';
  editPermission: boolean;
  PermissionConastantList: any = [];
  constructor(
    private router: Router,
    private roomMasterService: RoomMasterService,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private ngxPermissionsService: NgxPermissionsService
  ) { }

  ngOnInit() {
    this.PermissionConastantList = PermissionsConstants;
    const userId = +this.authService.getLoggedInUserId();
    this.editPermission = _.isUndefined(this.ngxPermissionsService.getPermission(PermissionsConstants.Update_Room_Entity_Mapping)) ? true : false;

    this.commonService.routeChanged(this.route);
    this.defaultObject();
    this.pageSize = '15';
    this.subjectFun();
    this.getAllRoomMapData();
    this.timeFormatKey = this.authService.getUserInfoFromLocalStorage().timeFormat;
  }

  ngOnChanges(): void {
    this.getAllRoomMapData();
  }

  ngAfterViewInit(): void {
    this.datatableBodyElement = this.table.element.children[0].children[1];
    this.datatableBodyElement.setAttribute('style', 'height:calc(100vh - 200px)');
  }

  defaultObject() {
    this.isFilterApply = false;
    this.page = { size: 15, totalElements: 0, totalPages: 10, pageNumber: 1 };
    this.sortUserList = { sort_order: 'desc', sort_column: 'rsm_id' };
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
        this.getAllRoomMapData();
      }
      );
  }

  getAllRoomMapData() {
    const param = {
      limit_per_page: this.page.size,
      current_page: this.page.pageNumber,
      sort_order: this.sortUserList.sort_order,
      sort_column: this.sortUserList.sort_column,
      searchString: this.searchString ? this.searchString : '',
    };
    this.roomMasterService.getRoomEntityMapList(param).subscribe(res => {
      if (res.mapData.length > 0) {
        this.roomMapList = res.mapData;
        this.page.totalElements = res.totalCount;
      } else {
        this.roomMapList = [];
        this.page.totalElements = 0;
      }
    });
  }

  onPageSizeChanged(newPageSize) {
    this.sortUserList = { sort_order: 'desc', sort_column: 'rsm_id' };
    this.page.size = Number(newPageSize);
    this.page.pageNumber = 1;
    this.getAllRoomMapData();
  }

  onFooterPage(event): void {
    this.page.pageNumber = event.page;
    this.getAllRoomMapData();
  }

  onSortChanged(event) {
    if (event.sorts.length > 0) {
      const obj = event.sorts[0];
      this.sortUserList.sort_order = obj.dir;
      this.sortUserList.sort_column = this.getSortColumnName(obj.prop);
      this.getAllRoomMapData();
    }
  }

  getSortColumnName(clmName) {
    if (clmName === 'name') {
      return 'room_name';
    } else if (clmName === 'location') {
      return 'room_location';
    } else if (clmName === 'section') {
      return 'section_name';
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
    this.getAllRoomMapData();
  }

  addRoomMapping() {
    this.router.navigate(['/app/qms/entityRoom/entityRoomMap']);
  }

  editRoomMapping(data) {
    this.router.navigate(['/app/qms/entityRoom/updateEntityRoomMap', data.entity_id,
      _.snakeCase(data.entity_name, ' ', '_'), _.snakeCase(data.entity_key, ' ', '_'), data.entity_value_id, _.snakeCase(data.entity_value, ' ', '_')]);
  }

  getTimeByTimeFormatSetting(time) {
    return this.commonService.convertTime(this.timeFormatKey, time);
  }

  deleteEntityRoomMap(row) {
    let param = {
      entity_id: row.entity_id,
      entity_value_id: row.entity_value_id
    }
    this.roomMasterService.deleteRoomEntityMapping(param).subscribe(response => {
      if (response.status_code === 200 && response.status_message === 'Success') {
        this.getAllRoomMapData();
        this.alertMsg = {
          message: response.message,
          messageType: 'success',
          duration: Constants.ALERT_DURATION
        };
      } else {
        const msg = response.message === 'delete not allowed as already room is mapped.' ?
          'Delete not allowed as already user has appointment/checkedIn' : response.message;
        this.alertMsg = {
          message: msg,
          messageType: 'warning',
          duration: Constants.ALERT_DURATION
        };
      }
    })
  }
}

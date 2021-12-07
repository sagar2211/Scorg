import { Component, OnInit, ViewChild, OnChanges, AfterViewInit } from '@angular/core';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { IAlert } from 'src/app/models/AlertMessage';
import { Subject } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { CommonService } from '../../../../services/common.service';
import * as _ from 'lodash';
import { NgxPermissionsService } from 'ngx-permissions';
import { PermissionsConstants } from 'src/app/shared/constants/PermissionsConstants';
import { Constants } from 'src/app/config/constants';
import { RoomMasterService } from 'src/app/modules/qms/services/room-master.service';


@Component({
  selector: 'app-room-section-map-list',
  templateUrl: './room-section-map-list.component.html',
  styleUrls: ['./room-section-map-list.component.scss']
})
export class RoomSectionMapListComponent implements OnInit, OnChanges, AfterViewInit {
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
  selectedMapData: any;
  showAddUpdateMapComponent: boolean;
  editPermission: boolean;
  PermissionConstantList:any=[];
  constructor(
    private router: Router,
    private roomMasterService: RoomMasterService,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private ngxPermissionsService: NgxPermissionsService
  ) { }

  ngOnInit() {
    this.PermissionConstantList = PermissionsConstants;
    this.commonService.routeChanged(this.route);
    this.editPermission = _.isUndefined(this.ngxPermissionsService.getPermission(PermissionsConstants.Update_Room_Section_Mapping)) ? true : false;
    this.defaultObject();
    this.pageSize = '15';
    this.subjectFun();
    this.getAllRoomMapData();
  }

  ngOnChanges() {
    this.getAllRoomMapData();
  }

  ngAfterViewInit(): void {
    this.datatableBodyElement = this.table.element.children[0].children[1];
    this.datatableBodyElement.setAttribute('style', 'height:calc(100vh - 200px)');
  }

  defaultObject() {
    this.showAddUpdateMapComponent = false;
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
      searchString: this.searchString,
    };
    this.roomMasterService.getAllRoomSectionMappingList(param).subscribe(res => {
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

  addRoomMaster() {
    this.router.navigate(['/app/qms/roomSection/addRoomSectionMapping']);
    // this.datatableBodyElement.setAttribute('style', 'height:calc(100vh - 292px)');
  }

  hideMapSection(eventData) {
    this.showAddUpdateMapComponent = (typeof eventData === 'boolean') ? eventData : !eventData.isHide;
    this.alertMsg = eventData.alertMsg;
    this.selectedMapData = null;
    this.getAllRoomMapData();
    this.datatableBodyElement.setAttribute('style', 'height:calc(100vh - 200px)');
  }

  editRoomMaster(data) {
    this.showAddUpdateMapComponent = true;
    this.selectedMapData = data;
    this.datatableBodyElement.setAttribute('style', 'height:calc(100vh - 333px)');
  }

  deleteRoomSectionMapping(row){
    let mapId = row.id;
    this.roomMasterService.deleteRoomSectionMapping(mapId).subscribe(response=>{
      if (response.status_code === 200 && response.status_message === 'Success'){
        this.getAllRoomMapData();
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

import { Component, OnInit, ViewChild, OnChanges, AfterViewInit } from '@angular/core';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { IAlert } from 'src/app/models/AlertMessage';
import { Subject } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { debounceTime, takeUntil } from 'rxjs/operators';
import * as _ from 'lodash';
import { CommonService } from '../../../../services/common.service';
import { Constants } from 'src/app/config/constants';
import { PermissionsConstants } from 'src/app/shared/constants/PermissionsConstants';
import { NgxPermissionsService } from 'ngx-permissions';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { Room } from 'src/app/modules/qms/models/room.model';
import { RoomMasterService } from 'src/app/modules/qms/services/room-master.service';

@Component({
  selector: 'app-section-list',
  templateUrl: './section-list.component.html',
  styleUrls: ['./section-list.component.scss']
})
export class SectionListComponent implements OnInit, OnChanges, AfterViewInit {
  @ViewChild(DatatableComponent, { static: false }) public table: DatatableComponent;
  pageSize;
  sectionList = [];
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
  showActiveSection: boolean;
  showAddUpdateSectionComponent: boolean;
  selectedSectionData: Room;
  datatableBodyElement: any;
  selectedMapData: any;
  showAddUpdateMapComponent: boolean;
  disableAcionPermission: boolean;
  PermissionsConstantsList: any = [];
  ngbPopover: NgbPopover;

  constructor(
    private router: Router,
    private roomMasterService: RoomMasterService,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private ngxPermissionsService: NgxPermissionsService

  ) { }

  ngOnInit() {
    this.commonService.routeChanged(this.route);
    this.PermissionsConstantsList = PermissionsConstants;
    this.disableAcionPermission = (_.isUndefined(this.ngxPermissionsService.getPermission(PermissionsConstants.Update_Section_Master)) &&
      _.isUndefined(this.ngxPermissionsService.getPermission(PermissionsConstants.section_master_room_mapping)) &&
      _.isUndefined(this.ngxPermissionsService.getPermission(PermissionsConstants.copy_url_display_master))) ? true : false;
    this.defaultObject();
    this.pageSize = '15';
    this.subjectFun();
    this.getAllSectionMasterData();
  }

  ngOnChanges() {
    this.getAllSectionMasterData();
  }

  ngAfterViewInit(): void {
    this.datatableBodyElement = this.table.element.children[0].children[1];
    this.datatableBodyElement.setAttribute('style', 'height:calc(100vh - 200px)');
  }

  defaultObject() {
    this.showAddUpdateMapComponent = false;
    this.showAddUpdateSectionComponent = false;
    this.showActiveSection = true;
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
        this.getAllSectionMasterData();
      }
      );
  }

  getAllSectionMasterData() {
    const param = {
      limit_per_page: this.page.size,
      current_page: this.page.pageNumber,
      sort_order: this.sortUserList.sort_order,
      sort_column: this.sortUserList.sort_column,
      searchString: this.searchString,
      showActiveRoom: this.showActiveSection
    };
    this.roomMasterService.getRoomSectionMasterAllList(param).subscribe(res => {
      if (res.sectionData.length > 0) {
        this.sectionList = res.sectionData;
        this.page.totalElements = res.totalCount;
      } else {
        this.sectionList = [];
        this.page.totalElements = 0;
      }
    });
  }

  onPageSizeChanged(newPageSize) {
    this.sortUserList = { sort_order: 'desc', sort_column: 'rsm_id' };
    this.page.size = Number(newPageSize);
    this.page.pageNumber = 1;
    this.getAllSectionMasterData();
  }

  onFooterPage(event): void {
    this.page.pageNumber = event.page;
    this.getAllSectionMasterData();
  }

  onSortChanged(event) {
    if (event.sorts.length > 0) {
      const obj = event.sorts[0];
      this.sortUserList.sort_order = obj.dir;
      this.sortUserList.sort_column = obj.prop; // this.getSortColumnName(obj.prop);
      this.getAllSectionMasterData();
    }
  }

  getSortColumnName(clmName) {
    if (clmName === 'id') {
      return 'rsm_id';
    } else if (clmName === 'name') {
      return 'rsm_name';
    } else if (clmName === 'remark') {
      return 'rsm_remark';
    } else if (clmName === 'isActive') {
      return 'rsm_isactive';
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
    this.getAllSectionMasterData();
  }

  editSectionMaster(data) {
    this.router.navigate(['/app/qms/section/updateSection', data.rsm_id]);
  }

  copySectionUrlForDisplay(data) {
    const hostUrl = window.location.origin;
    const templateNo = data.rsm_templatetype ? data.rsm_templatetype.split('_')[2] : '';
    const displayUrl = hostUrl + '/#/display/displayList/' + data.rsm_encrpytedurl_text + '/' + templateNo;
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = displayUrl;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
    this.alertMsg = {
      message: '" ' + displayUrl + ' " Url Copied!',
      messageType: 'success',
      duration: Constants.ALERT_DURATION
    };
  }

  hideMapSection(val) {
    this.showAddUpdateMapComponent = !val;
    this.selectedMapData = null;
    this.datatableBodyElement.setAttribute('style', 'height:calc(100vh - 200px)');
  }

  mapRoomToSection(data) {
    this.showAddUpdateMapComponent = true;
    const obj = {
      id: data.rsm_id,
      name: data.rsm_name
    };
    this.selectedMapData = obj;
    this.datatableBodyElement.setAttribute('style', 'height:calc(100vh - 315px)');
  }

  goToSectionMapping(data) {
    this.router.navigate(['/app/qms/mapping/sectionDoctorMapping', data.rsm_name]);
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

  deleteSingleSectionMaster(row){
    let sectionId= row.rsm_id;
    this.roomMasterService.deleteSectionMaster(sectionId).subscribe(response=>{
      if (response.status_code === 200 && response.status_message === 'Success'){
        this.getAllSectionMasterData();
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

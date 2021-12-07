import { Component, OnInit, ViewChild, AfterViewInit, OnChanges } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { IAlert } from 'src/app/models/AlertMessage';
import { CommonService } from 'src/app/services/common.service';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash';
import { map, debounceTime, takeUntil } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { PermissionsConstants } from 'src/app/shared/constants/PermissionsConstants';
import { NgxPermissionsService } from 'ngx-permissions';
import { Constants } from 'src/app/config/constants';
import { FrontDeskEntityMappingService } from 'src/app/modules/qms/services/front-desk-entity-mapping.service';


@Component({
  selector: 'app-front-desk-entity-mapping-master-list',
  templateUrl: './front-desk-entity-mapping-master-list.component.html',
  styleUrls: ['./front-desk-entity-mapping-master-list.component.scss']
})
export class FrontDeskEntityMappingMasterListComponent implements OnInit, OnChanges {
  @ViewChild(DatatableComponent, { static: false }) public table: DatatableComponent;
  // showAddEditMapping: boolean;
  isFilterApply: boolean;
  searchString: string;
  externalPaging: boolean;
  mappingUserData = [];
  page: {
    size: number, // The number of elements in the page
    totalElements: number, // The total number of elements
    totalPages: number, // The total number of pages
    pageNumber: number, // The current page number
  };
  subject: Subject<string> = new Subject();
  ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  sortUserList: { sort_order: string, sort_column: string };
  mappingUserList = [];
  pageSize;
  datatableBodyElement: any;
  alertMsg: IAlert;
  PermissionsConstantsList: any = [];
  constructor(
    private commonService: CommonService,
    private route: ActivatedRoute,
    private frontdeskentityMappingService: FrontDeskEntityMappingService,
    private router: Router,
    private ngxPermissionsService: NgxPermissionsService
  ) { }

  ngOnInit() {
    this.PermissionsConstantsList = PermissionsConstants;
    this.pageSize = 15;
    this.defaultObject();
    this.subjectFun();
    this.commonService.routeChanged(this.route);
    // this.updateMappingList(this.frontdeskentityMappingService.newmappingObject); // get maapingList
    this.getFrontDeskMappingList();

  }
  ngOnChanges() {
    this.getFrontDeskMappingList();
  }
  subjectFun() {
    // -- Subscribe to the subject, which is triggered from search input and when section clicked
    // -- When the debounce time has passed, we call getActiveScheduleData()
    this.subject
      .pipe(debounceTime(500), takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.page.pageNumber = 1;
        this.getFrontDeskMappingList();
      }
      );
  }
  defaultObject() {
    this.isFilterApply = false;
    this.page = { size: 15, totalElements: 0, totalPages: 10, pageNumber: 1 };
    this.searchString = '';
    this.externalPaging = true;
    this.sortUserList = { sort_order: 'desc', sort_column: 'fd_name' };
  }
  clearSearchString() {
    this.searchString = '';
    this.getFrontDeskMappingList();
  }
  getFrontDeskMappingList() {
    const params = {
      limit_per_page: this.page.size,
      current_page: this.page.pageNumber,
      sort_order: this.sortUserList.sort_order,
      sort_column: this.sortUserList.sort_column,
      search_string: this.searchString ? this.searchString : ''
    };
    this.frontdeskentityMappingService.getfrontDeskMappingList(params).subscribe(res => {
      if (res.UserDetails.length) {
        this.mappingUserList = res.UserDetails;
      } else {
        this.mappingUserList = [];
      }
      this.page.totalElements = this.mappingUserList.length;
      // return res;
    });
  }

  onPageSizeChanged(newPageSize) {
    this.sortUserList = { sort_order: 'desc', sort_column: 'fd_name' };
    this.page.size = Number(newPageSize);
    this.page.pageNumber = 1;
    this.getFrontDeskMappingList();
  }
  onSortChanged(event) {
    if (event.sorts.length > 0) {
      const obj = event.sorts[0];
      this.sortUserList.sort_order = obj.dir;
      this.sortUserList.sort_column = obj.prop;
      this.getFrontDeskMappingList();
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
  // updateMappingList(val): void {
  //   if (_.isObject(val)) {
  //     if (val) {
  //       const obj = {
  //         fd_userId: val.fuId.user_id,
  //         fd_name: val.fuId.name,
  //         userMappingList: this.createMappingList(val.userMappingList)
  //       };
  //       this.mappingUserList.push(obj);
  //       this.page.totalElements = this.mappingUserList.length;
  //     }
  //   }
  // }
  // createMappingList(mappingList) {
  //   const mappingArray = [];
  //   _.forEach(mappingList, (o, k) => {
  //     const obj = {
  //       entityTypeId: o.entityType.id,
  //       entityTypeName: o.entityType.name,
  //       entityTypeValueId: o.entityTypeValue.id,
  //       entityTypeValueName: o.entityTypeValue.name,
  //       specialityId: o.entityTypeValue.specialityId
  //     };
  //     mappingArray.push(obj);
  //   });
  //   return mappingArray;
  // }
  editMappingUser(data) {
    if (!_.isUndefined(this.ngxPermissionsService.getPermission(PermissionsConstants.Update_Front_Desk_Entity_Mapping))) {
      this.frontdeskentityMappingService.editMappingData = {};
      this.frontdeskentityMappingService.getMappingDetailsById(data.fd_userId).subscribe((res) => {
        if (res.UserDetails.length) {
          this.frontdeskentityMappingService.editMappingData = res.UserDetails[0]; // set value on service on edit
          this.router.navigate(['/app/qms/frontDeskentityMapping']);
        }
      });
    } else {
      this.displayErrorMsg('Do not have Permission', 'danger');
    }
  }
  onFooterPage(event): void {
    this.page.pageNumber = event.page;
    this.getFrontDeskMappingList();
  }

  displayErrorMsg(message: string, messageType: string): void {
    this.alertMsg = { message, messageType, duration: Constants.ALERT_DURATION };
  }
}

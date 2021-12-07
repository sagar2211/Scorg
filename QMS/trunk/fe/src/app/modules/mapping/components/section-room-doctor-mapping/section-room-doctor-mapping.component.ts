import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from 'src/app/services/common.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { DatatableComponent } from "@swimlane/ngx-datatable";
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import * as moment from 'moment';
import { Constants } from 'src/app/config/constants';
import { SectionMasterService } from 'src/app/modules/qms/services/section-master.service';

@Component({
  selector: 'app-section-room-doctor-mapping',
  templateUrl: './section-room-doctor-mapping.component.html',
  styleUrls: ['./section-room-doctor-mapping.component.scss']
})
export class SectionRoomDoctorMappingComponent implements OnInit {
  public searchBy: string = '';
  public isShowFilter: boolean = false;
  public filterForm: FormGroup;
  public totalRecords: number;
  public currentPage: number = 0;
  page: {
    size: number,
    totalElements: number,
    totalPages: number,
    pageNumber: number,
  };
  compInstance = this;
  public sectionMappingData: Array<SectionMapData> = [];
  subject: Subject<string> = new Subject();
  ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  pageSize: number = 15;
  @ViewChild(DatatableComponent, { static: false })
  public table: DatatableComponent;
  sort_order: any;
  sort_column: any;

  constructor(
    private sectionService: SectionMasterService,
    private commonService: CommonService,
    public fb: FormBuilder,
    private route: ActivatedRoute

  ) {
    this.route.params.subscribe(param => {
      if (param) {
        this.searchBy = param.sectionName === 'sectionDoctorMapping' ? '' : param.sectionName;
      }
    });
    this.subject
      .pipe(debounceTime(500), takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.page.pageNumber = 1;
        this.getSelectedSectionMapDetails();
      }
      );
    this.commonService.$addPopupEvent.subscribe(popup => {
      if (popup) {
        this.isShowFilter = popup.isShowFilterPopup;
      } else {
        this.isShowFilter = false;
      }
    });
  }

  ngOnInit() {
    this.commonService.routeChanged(this.route);
    this.generateFilterForm();
    this.page = { size: 15, totalElements: 0, totalPages: 10, pageNumber: 1 };
    this.sort_column = 'section_name',
      this.sort_order = 'asc'
    this.getSelectedSectionMapDetails();
  }

  getSelectedSectionMapDetails() {
    let param = {
      start_date: this.filterForm.value.from_date === '' ? null :
        (moment(this.filterForm.value.from_date).format(Constants.apiDateFormate)),
      end_date: this.filterForm.value.to_date === '' ? null :
        (moment(this.filterForm.value.to_date).format(Constants.apiDateFormate)),
      limit_per_page: this.page.size,
      current_page: this.page.pageNumber,
      search_by: this.searchBy == '' ? null : this.searchBy,
      sort_order: this.sort_order,
      sort_column: this.sort_column,
      is_active: this.filterForm.value.is_active
    }
    this.sectionService.getSelectedSectionDetails(param).subscribe(response => {
      this.sectionMappingData = response.room_SectionMapping_Details;
      this.page.totalElements = response.total_records;
    })
  }

  showSearchFilter() {
    this.isShowFilter = !this.isShowFilter;
    this.commonService.setPopupFlag(false, this.isShowFilter);
  }

  generateFilterForm() {
    this.filterForm = this.fb.group({
      from_date: '',
      is_active: 'true',
      to_date: '',
    });
  }

  getFilteredData() {
    if (this.filterForm.value.from_date && !this.filterForm.value.to_date) {
      return;
    } else {
      this.showSearchFilter();
      this.getSelectedSectionMapDetails()
    }

  }

  clearForm() {
    this.searchBy = '';
    this.filterForm.reset();
    this.filterForm.patchValue({
      from_date: '',
      is_active: 'true',
      to_date: '',
    });
    this.isShowFilter = false;
    this.commonService.setPopupFlag(false, this.isShowFilter);
    this.getSelectedSectionMapDetails();
  }
  onPageSizeChanged(newPageSize) {
    this.page.size = Number(newPageSize);
    this.page.pageNumber = 1;
    this.getSelectedSectionMapDetails();
  }

  onFooterPage(event): void {
    this.page.pageNumber = event.page;
    this.getSelectedSectionMapDetails();
  }
  onSortChanged(event) {
    if (event.sorts.length > 0) {
      const obj = event.sorts[0];
      this.sort_order = obj.dir;
      this.sort_column = obj.prop;
      this.getSelectedSectionMapDetails();
    }
  }
}

class SectionMapData {
  section_id: number;
  section_name: string;
  section_isactive: boolean;
  room_id: number;
  room_name: string;
  room_isactive: boolean;
  location_Id: number;
  location_name: string;
  entity_value_id: number;
  entity_value_name: string;
  entity_id: number;
  entity_name: string;
  entity_key: string;
  start_time: string;
  end_time: string;
  start_date: string;
  end_date: string;
  app_type_id: number;
  app_type: string;
}


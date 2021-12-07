import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from 'src/app/public/services/auth.service';
import { ReportsService } from '../../../reports/services/reports.service';
import * as _ from 'lodash';
import * as moment from 'moment';
import { DxDataGridComponent } from "devextreme-angular";
import { Subject } from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime, takeUntil, map } from 'rxjs/operators';

@Component({
  selector: 'app-prescription-detail',
  templateUrl: './prescription-detail.component.html',
  styleUrls: ['./prescription-detail.component.scss']
})
export class PrescriptionDetailComponent implements OnInit {
  @ViewChild(DxDataGridComponent) dataGrid: DxDataGridComponent;
  page: {
    size: number, // The number of elements in the page
    totalElements: number, // The total number of elements
    totalPages: number, // The total number of pages
    pageNumber: number, // The current page number
  };
  patientDetail :any;
  prescriptionDetail: any;
  isFilterApply: boolean;
  expandedId = [];
  isCheck: boolean = true;
  searchString: string;
  isActiveFilter = true;
  externalPaging: boolean;
  showFilter: boolean;
  showActive: boolean;
  sortingObject: { sort_order: string, sort_column: string };
  expanded: any;
  subject: Subject<string> = new Subject();
  fromDate: Date = new Date(moment().format('YYYY-MM-01'));
  toDate: Date = new Date();
  readonly allowedPageSizes = [15, 30, 45, 100, 'all'];
  readonly displayModes = [{ text: "Display Mode 'full'", value: "full" }, { text: "Display Mode 'compact'", value: "compact" }];
  displayMode = "full";
  showPageSizeSelector = true;
  showInfo = true;
  showNavButtons = true;
  prescriptionFilterForm: FormGroup;
  ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(private reportService: ReportsService,
    private fb: FormBuilder,
    private authService: AuthService) {
      // this.patientDetail = reportService.getPatient();
  }

  ngOnInit(){
    this.defaultObject();
    this.subjectFun();
    this.getListData();
    this.createFormFilter();
  }

  defaultObject() {
    this.isFilterApply = false;
    this.page = { size: 15, totalElements: 0, totalPages: 10, pageNumber: 1 };
    this.sortingObject = { sort_order: 'desc', sort_column: 'patientName' };
    this.searchString = '';
    this.externalPaging = true;
    this.showFilter = false;
    this.showActive = true;
  }

  subjectFun() {
    // -- Subscribe to the subject, which is triggered from search input and when section clicked
    // -- When the debounce time has passed, we call getActiveScheduleData()
    this.subject
      .pipe(debounceTime(500), takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.page.pageNumber = 1;
        this.getListData();
      }
      );
  }

  createFormFilter() {
    this.patchDefaultValue();
  }

  patchDefaultValue() {
    if (this.prescriptionFilterForm) {
      this.showFilter = true;
      return;
    }
    const form = {
      startDate: [new Date(moment().format('YYYY-MM-01'))],
      endDate: [new Date(moment().format('YYYY-MM-DD'))],
    };
    this.prescriptionFilterForm = this.fb.group(form);
    this.showFilter = true;
  }

  checkFormSubmit() {
    this.getListData();
    this.showFilter = !this.showFilter;
  }

  clearFilterFormData() {
    this.prescriptionFilterForm.controls.startDate.patchValue(new Date(moment().startOf('month').format('YYYY-MM-DD hh:mm')));
    this.prescriptionFilterForm.controls.endDate.patchValue(new Date(moment().format('YYYY-MM-DD hh:mm')));
  }

  getListData(){
    let param = {
      fromDate: new Date(moment().format('YYYY-MM-01')),
      toDate: new Date(moment().format('YYYY-MM-DD')),
      searchKeyword: this.searchString,
      sortOrder: this.sortingObject.sort_order,
      sortColumn: this.sortingObject.sort_column,
      pageNumber: this.page.pageNumber,
      limit: this.page.size
    }
    if (this.prescriptionFilterForm) {
      param.fromDate = this.prescriptionFilterForm.value.startDate;
      param.toDate = this.prescriptionFilterForm.value.endDate;
    }
    this.reportService.getAllPrescription(param).subscribe((response)=>{
      _.map(response.data,o=>{
        o.prescriptionDate = moment(o.prescriptionDate).format('DD-MM-YYYY');
      })
      console.log(response)
      this.patientDetail = response.data;
    })
  }

  sortFunction(){
    let column = this as any;
    // console.log(column)
    // console.log(this)
    // if(column.sortOrder && column.dataField){
    //   column.sortingObject.sort_column = column.dataField
    //   column.sortingObject.sort_order = column.sortOrder
    //   column.getListData();
    // }
  }

  handlePropertyChange(evt){
    if(evt.name === 'paging' && evt.fullName === 'paging.pageSize'){
      this.page.size= evt.value;
      this.getListData();
    } else if(evt.name === 'paging' && evt.fullName === 'paging.pageIndex'){
      this.page.pageNumber= evt.value;
      this.getListData();
    }
  }

  clearSearch() {
    if (this.searchString) {
      this.getListData();
    }
  }

  getPatientCellData(data){
    if(data.data && data.data.items && data.data.items.length>0 && data.data.items[0].items && data.data.items.length > 0){
      return 'Patient : ' + data.data.items[0].items[0].patientId + ' - ' + data.data.items[0].items[0].patientName + ' - ' + data.data.items[0].items[0].prescriptionCount;
    } else {
      const patientName = data.data.key;
      const listData = _.filter(this.patientDetail, d => {
        return d.patientName === patientName
      });
      if (listData.length > 0) {
        return 'Patient : ' + listData[0].patientId + ' - ' + listData[0].patientName + ' - ' + listData[0].prescriptionCount;
      }
      return 'Patient';
    }
  }

  getCellData(data) {
    if (data.data && data.data.items && data.data.items.length > 0) {
      return 'Prescription : ' + data.data.items[0].prescriptionDate + ' - ' + data.data.items[0].doctorName + ' - ' + data.data.items[0].visitType + ' - ' + data.data.items[0].itemCount;
      // return 'Prescription : ' + moment(data.data.items[0].prescriptionDate).format('DD/MM/YYYY hh:mm A') + ' - ' + data.data.items[0].doctorName + ' - ' + data.data.items[0].visitType + ' - ' + data.data.items[0].itemCount;
    } else {
      const id = data.data.key;
      const listData = _.filter(this.patientDetail, d => {
        return d.prescriptionId === id
      });
      if (listData.length > 0) {
        return 'Prescription : ' + listData[0].prescriptionDate + ' - ' + listData[0].doctorName + ' - ' + listData[0].visitType + ' - ' + listData[0].itemCount;
        // return 'Prescription : ' + moment(listData[0].prescriptionDate).format('DD/MM/YYYY hh:mm A') + ' - ' + listData[0].doctorName + ' - ' + listData[0].visitType + ' - ' + listData[0].itemCount;
      }
      return 'Prescription';
    }
  }

  onRowPrepared(evt: any): void {
    if (evt.data && evt.rowType === 'data' && evt.data.colorCode) {
      evt.rowElement.style.backgroundColor = evt.data.colorCode;

    }
  }
}

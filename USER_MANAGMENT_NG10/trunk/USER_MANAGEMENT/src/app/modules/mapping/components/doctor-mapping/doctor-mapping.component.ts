import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { fadeInOut } from 'src/app/config/animations';
import { IAlert } from 'src/app/public/models/AlertMessage';
import { Department } from 'src/app/public/models/department';
import { Doctors } from 'src/app/public/models/doctors';
import { Roles } from 'src/app/public/models/roles';
import { CommonService } from 'src/app/public/services/common.service';
import { DoctorMappingService } from 'src/app/public/services/doctor-mapping.service';
import { UsersService } from 'src/app/public/services/users.service';
import * as moment from 'moment';
import * as _ from 'lodash';


@Component({
  selector: 'app-doctor-mapping',
  templateUrl: './doctor-mapping.component.html',
  styleUrls: ['./doctor-mapping.component.scss'],
  animations: [
    fadeInOut
  ],
})
export class DoctorMappingComponent implements OnInit, OnDestroy {
  alertMsg: IAlert;
  doctorMapForm: FormGroup;
  destroy$ = new Subject();
  compInstance = this;
  docRolesList: Roles[] = [];
  docrolesTypeId = Number;
  departmentmasteList: Department[] = [];
  selectedfilterDoctorList: Doctors[] = [];
  mapfilterDoctorList: Doctors[] = [];
  assignDoctor = new Doctors();
  doctorMappingDetails = { id: '', doctorId: '', doctorName: '', mappingListDetails: [] };
  addDoctorMapFlag = false;
  updateDoctorMapFlag = false;
  searchFromMinDate: Date;
  doctorMapList: any[];
  selectedDepartment = new Department();
  checkMappedDocflag: boolean;
  page: {
    size: number, // The number of elements in the page
    totalElements: number, // The total number of elements
    totalPages: number, // The total number of pages
    pageNumber: number, // The current page number
  };
  validateError = {
    mapDoctor: false,
    mapToDate: false,
    mapFromDate: false,
    dateRange: false
  };
  mappedDoctorList: Array<any> = [];
  constructor(
    public fb: FormBuilder,
    public userService: UsersService,
    public docMapService: DoctorMappingService,
    private commonService: CommonService,
    private route: ActivatedRoute,

  ) { }

  ngOnInit() {
    this.commonService.routeChanged(this.route);
    this.searchFromMinDate = new Date();
    this.page = { size: 10, totalElements: 0, totalPages: 10, pageNumber: 1 };
    this.defaultDocForm();
  }
  defaultDocForm(): void {
    this.doctorMapForm = this.fb.group({
      mapDoctor: [''],
      mapFromDate: [''],
      mapToDate: [''],
      mappedId: [''],
      isActive: [true]
    });
  }
  defaulltValidator(): void {
    this.validateError = {
      mapDoctor: false,
      mapToDate: false,
      mapFromDate: false,
      dateRange: false
    };
  }
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }
  getDoctorSearchResult(flag, $event): void {
    if (flag === 'select_doctor' && $event.doctor) {
      this.assignDoctor = !_.isUndefined($event.doctor) ? $event.doctor : new Doctors();
      this.selectedDepartment = !_.isUndefined($event.department) ? $event.department : new Department();
      this.getDoctorMappingDetails(this.assignDoctor);
    } else if (flag === 'map_doctor') {
      this.doctorMapForm.patchValue({ mapDoctor: $event.doctor });
    } else {
      this.assignDoctor = new Doctors();
      this.selectedDepartment = new Department();
      this.doctorMappingDetails.id = '';
      this.doctorMappingDetails.doctorId = '';
      this.doctorMappingDetails.doctorName = '';
      this.doctorMappingDetails.mappingListDetails = [...[]];
      this.cancelMapDoctor();
    }
  }
  getDoctorMappingDetails(event): void {
    if (event) {
      this.defaulltValidator();
      this.docMapService.getDoctorMappingDetails(event.id).pipe(takeUntil(this.destroy$)).subscribe(res => {
        if (res.doctormappinglist.length) {
          this.doctorMappingDetails = this.checkMappingExpiry(res.doctormappinglist[0]);
        } else {
          this.doctorMappingDetails = { id: '', doctorId: '', doctorName: '', mappingListDetails: [] };
        }
      });
    }
  }
  get doctorMapFormCntrols() {
    return this.doctorMapForm.controls;
  }
  saveMapDoctor(): void {
    this.defaulltValidator();
    const fomeSelectedValue = this.doctorMapForm.value;
    const fromDate = moment(fomeSelectedValue.mapFromDate).format('DD/MM/YYYY');
    const toDate = moment(fomeSelectedValue.mapToDate).format('DD/MM/YYYY');
    this.checkMappedDocflag = false;
    if (this.updateDoctorMapFlag) {
      this.mappedDoctorList = this.doctorMappingDetails.mappingListDetails.filter(obj => {
        return obj.mappedId !== fomeSelectedValue.mappedId;
      });
    } else {
      this.mappedDoctorList = this.doctorMappingDetails.mappingListDetails;
    }
    this.mappedDoctorList.map(obj => {
      if (obj.mapdoctorId === fomeSelectedValue.mapDoctor.id && moment(obj.fromDate).format('DD/MM/YYYY') <= fromDate &&
        moment(obj.toDate).format('DD/MM/YYYY') >= toDate) {
        this.checkMappedDocflag = true;
      } else if (obj.mapdoctorId === fomeSelectedValue.mapDoctor.id &&
        (fromDate <= moment(obj.fromDate).format('DD/MM/YYYY') && moment(obj.fromDate).format('DD/MM/YYYY') <= toDate ||
          fromDate <= moment(obj.toDate).format('DD/MM/YYYY') && moment(obj.toDate).format('DD/MM/YYYY') <= toDate)) {
        this.checkMappedDocflag = true;
      }
    });
    if (this.checkMappedDocflag) {
      return;
    }
    if (this.doctorMapForm.value.mapFromDate && !!!this.doctorMapForm.value.mapToDate) {
      this.validateError.mapToDate = true;
    } else if (this.doctorMapForm.value.mapToDate && !!!this.doctorMapForm.value.mapFromDate) {
      this.validateError.mapFromDate = true;
    } else if (!!!this.doctorMapForm.value.mapDoctor.id) {
      this.validateError.mapDoctor = true;
    } else {
      const params = {
        main_Id: this.doctorMappingDetails.id ? this.doctorMappingDetails.id : 0,
        main_Doctor_Id: this.assignDoctor.id,
        main_Isactive: true,
        DoctorMappingDetail: [
          {
            detail_Id: this.doctorMapForm.value.mappedId ? this.doctorMapForm.value.mappedId : 0,
            detail_DoctorId: this.doctorMapForm.value.mapDoctor.id,
            detail_StartDate: this.doctorMapForm.value.mapFromDate ? moment(this.doctorMapForm.value.mapFromDate).format('MM/DD/YYYY') : '',
            detail_EndDate: this.doctorMapForm.value.mapToDate ? moment(this.doctorMapForm.value.mapToDate).format('MM/DD/YYYY') : '',
            detail_Isactive: this.doctorMapForm.value.isActive
          },
        ]
      };
      const tempMapDetailsTable = this.doctorMappingDetails.mappingListDetails;
      if (this.doctorMappingDetails.id) { // updated map Existing Doctor
        this.docMapService.updateDoctorMapping(params).pipe(takeUntil(this.destroy$)).subscribe(res => {
          if (res.status_code === 200) {
            const object = {
              fromDate: this.doctorMapForm.value.mapFromDate,
              isActive: this.doctorMapForm.value.isActive,
              mapdoctorId: this.doctorMapForm.value.mapDoctor.id,
              mapdoctorName: this.doctorMapForm.value.mapDoctor.name,
              mappedId: res.detailId ? res.detailId : '',
              toDate: this.doctorMapForm.value.mapToDate
            };
            const index = _.findIndex(this.doctorMappingDetails.mappingListDetails, (rec) =>
              rec.mappedId === this.doctorMapForm.value.mappedId);
            if (index !== -1 && this.doctorMapForm.value.mappedId) {
              tempMapDetailsTable[index] = this.checkMappingExpiry(object);
            } else {
              tempMapDetailsTable.push(Object.assign({}, this.checkMappingExpiry(object)));
            }
            this.doctorMappingDetails.mappingListDetails = [...tempMapDetailsTable];
            this.alertMsg = {
              message: 'doctor is mapped Successfully',
              messageType: 'success',
              duration: 3000
            };
            this.checkMappedDocflag = false;
            this.updateDoctorMapFlag = false;
            this.cancelMapDoctor();
          }
        });
      } else { // inserted New Mapdoctor
        this.docMapService.saveDoctorMapping(params).pipe(takeUntil(this.destroy$)).subscribe(res => {
          if (res.status_code === 200) {
            const object = {
              fromDate: this.doctorMapForm.value.mapFromDate,
              isActive: true,
              mapdoctorId: this.doctorMapForm.value.mapDoctor.id,
              mapdoctorName: this.doctorMapForm.value.mapDoctor.name,
              mappedId: res.detailId ? res.detailId : '',
              toDate: this.doctorMapForm.value.mapToDate
            };
            this.doctorMappingDetails.id = ''; // get new main Id if no record is there.
            this.doctorMappingDetails = {
              id: res.id, doctorId: this.assignDoctor.id.toString(),
              doctorName: this.assignDoctor.name, mappingListDetails: []
            };
            tempMapDetailsTable.push(Object.assign({}, object));
            this.doctorMappingDetails.mappingListDetails = [...tempMapDetailsTable];
            this.cancelMapDoctor();
            this.alertMsg = {
              message: 'doctor is mapped Successfully',
              messageType: 'success',
              duration: 3000
            };
          }
        });
      }
    }
  }

  cancelMapDoctor(): void {
    this.doctorMapForm.reset({});
    this.addDoctorMapFlag = false;
    this.updateDoctorMapFlag = false;
    this.defaultDocForm();
    this.defaulltValidator();
    this.checkMappedDocflag = false;
    this.searchFromMinDate = new Date();
  }

  editDoctor(rowData, flag?): void {
    this.addDoctorMapFlag = false;
    this.updateDoctorMapFlag = true;
    this.searchFromMinDate = rowData.fromDate ? new Date(rowData.fromDate) : new Date();
    // get row data and  Fetch on form for update
    this.doctorMapForm.patchValue({
      mapDoctor: { id: rowData.mapdoctorId, name: rowData.mapdoctorName },
      mapToDate: rowData.toDate ? new Date(rowData.toDate) : null,
      mapFromDate: rowData.fromDate ? new Date(rowData.fromDate) : null,
      mappedId: rowData.mappedId,
      isActive: rowData.isActive
    });
    if (flag === 'rowIsActive') {
      this.updateDoctorMapFlag = false;
      this.saveMapDoctor();
    }
  }
  toggleOnChange(rowData): void {
    rowData.isActive = !rowData.isActive;
    this.editDoctor(rowData, 'rowIsActive');
  }

  checkMappingExpiry(rowData: any) {
    const todayDate = moment();
    if (_.isArray(rowData.mappingListDetails) && rowData.mappingListDetails.length) {
      _.map(rowData.mappingListDetails, (deatials) => {
        const toDate = moment(deatials.toDate).format('DD-MM-YYYY');
        deatials.isExpiry = (!deatials.toDate) ? false : todayDate.isSameOrAfter(toDate);
        // deatials.isActive = deatials.isExpiry ? false : deatials.isActive;
      });
    } else {
      const toDate = moment(rowData.toDate).format('YYYY-MM-DD');
      rowData.isExpiry = (!rowData.toDate) ? false : todayDate.isSameOrAfter(toDate);
      // rowData.isActive = rowData.isExpiry ? false : rowData.isActive;
    }
    return rowData;
  }
}

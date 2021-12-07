import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Subject, Observable } from 'rxjs';
import { catchError, takeUntil, map } from 'rxjs/operators';
import * as _ from 'lodash';
import { Roles } from 'src/app/public/models/roles';
import { Department } from 'src/app/public/models/department';
import { Doctors } from 'src/app/public/models/doctors';
import { UsersService } from 'src/app/public/services/users.service';
import { DoctorMappingService } from 'src/app/public/services/doctor-mapping.service';
@Component({
  selector: 'app-doctor-search',
  templateUrl: './doctor-search.component.html',
  styleUrls: ['./doctor-search.component.scss']
})
export class DoctorSearchComponent implements OnInit, OnDestroy {
  submitted: false;
  destroy$ = new Subject();
  compInstance = this;
  docRolesList: Roles[] = [];
  docrolesTypeId = Number;
  departmentmasteList: Department[] = [];
  selectedfilterDoctorList: Doctors[] = [];
  mapfilterDoctorList: Doctors[] = [];
  selectedMapDoctor = new Doctors();
  doctorMappingDetails = { id: '', doctorId: '', doctorName: '', mappingListDetils: [] };
  selectedDepartment = null;
  selectedDoctor = null;


  @Input() sourceType: string; // --recieved selected value from parent comp
  @Input() selectedParentDoc: any;
  @Input() validator: boolean;
  @Output() searchResult = new EventEmitter<any>();
  constructor(
    public fb: FormBuilder,
    public userService: UsersService,
    public docMapService: DoctorMappingService,
  ) { }

  ngOnInit() {
    this.getDeprtmentMaster().subscribe();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }
  getDeprtmentMaster(): Observable<any> {
    return this.compInstance.userService.getDepartment().pipe(map(res => {
      this.departmentmasteList = res.Departments;
      return res.Departments;
    }),
      catchError(error => [])
    );
  }
  searchDoctor(event): void {
    this.validator = false;
    if (event) {
      const param = { department_id: event.id };
      this.docMapService.getDoctorList(param).pipe(takeUntil(this.destroy$)).subscribe(res => {
        // this.searchResult.emit(res.doctorList);
        if (this.sourceType === 'select_doctor') {
          this.selectedfilterDoctorList = res.doctorList;
        } else {
          this.selectedfilterDoctorList = _.filter(res.doctorList, (d) => d.id !== this.selectedParentDoc.id);
        }
      });
    } else {
      this.selectedDoctor = null;
      this.selectedfilterDoctorList = [];
      const object = {
        department: null,
        doctor: null
      };
      this.searchResult.emit(object);
    }
  }
  getSelectedDoctorMappingDetails(event): void {
    const object = {
      department: this.selectedDepartment ? this.selectedDepartment : null,
      doctor: event ? event : null
    };
    this.searchResult.emit(object);
  }
}

import { Component, OnInit, Input, OnDestroy, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { IAlert } from 'src/app/public/models/AlertMessage';
import { DoctorMappingService } from 'src/app/public/services/doctor-mapping.service';

@Component({
  selector: 'app-doctor-mapping-edit',
  templateUrl: './doctor-mapping-edit.component.html',
  styleUrls: ['./doctor-mapping-edit.component.scss']
})
export class DoctorMappingEditComponent implements OnInit, OnDestroy {
  editDoctorMapForm: FormGroup;
  alertMsg: IAlert;
  @Input() mappingData: any;
  @Output() editedModalValues: EventEmitter<any> = new EventEmitter();
  searchFromMinDate: Date;
  destroy$ = new Subject();
  constructor(
    private fb: FormBuilder,
    public modal: NgbActiveModal,
    public docMapService: DoctorMappingService
  ) { }

  ngOnInit() {
    this.defaultFormObject();
    this.searchFromMinDate = this.mappingData.fromDate ? (new Date(this.mappingData.fromDate)) : new Date();
    this.editDoctorMapForm.patchValue({
      selecedDoctorId: this.mappingData.selectedDoc_Id,
      selecedDoctor: this.mappingData.selectedDoc_Name,
      mapId: this.mappingData.Id,
      mapDetailsId: this.mappingData.mappedId,
      mapDoctorId: this.mappingData.mapdoctorId,
      mapDoctor: this.mappingData.mapdoctorName,
      fromDate: this.mappingData.fromDate ? (new Date(this.mappingData.fromDate)) : '',
      todate: this.mappingData.toDate ? (new Date(this.mappingData.toDate)) : '',
      isActive: this.mappingData.isActive
    });
  }
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }
  defaultFormObject(): void {
    this.editDoctorMapForm = this.fb.group({
      selecedDoctorId: [''],
      selecedDoctor: [''],
      mapId: [''],
      mapDetailsId: [''],
      mapDoctorId: [''],
      mapDoctor: [''],
      fromDate: [''],
      todate: [],
      isActive: []
    });
  }
  onSubmit(): void {
    const params = {
      main_Id: this.editDoctorMapForm.value.mapId,
      main_Doctor_Id: this.editDoctorMapForm.value.selecedDoctorId,
      main_Isactive: true,
      DoctorMappingDetail: [
        {
          detail_Id: this.editDoctorMapForm.value.mapDetailsId,
          detail_DoctorId: this.editDoctorMapForm.value.mapDoctorId,
          detail_StartDate: this.editDoctorMapForm.value.fromDate != null ?
                            moment(this.editDoctorMapForm.value.fromDate).format('MM/DD/YYYY') : null,
          detail_EndDate: this.editDoctorMapForm.value.todate != null ?
                            moment(this.editDoctorMapForm.value.todate).format('MM/DD/YYYY') : null,
          detail_Isactive: this.editDoctorMapForm.value.isActive
        },
      ]
    };
    this.mappingData = {};
    this.docMapService.updateDoctorMapping(params).pipe(takeUntil(this.destroy$)).subscribe(res => {
      if (res.status_code === 200) {
        this.editedModalValues.emit(this.editDoctorMapForm.value);
        this.alertMsg = {
          message: 'Updated Successfully',
          messageType: 'success',
          duration: 3000
        };
        setTimeout(() => {
          this.modal.close('cancel click');
        }, 500);
        this.searchFromMinDate = new Date();
      }
    });
  }
}

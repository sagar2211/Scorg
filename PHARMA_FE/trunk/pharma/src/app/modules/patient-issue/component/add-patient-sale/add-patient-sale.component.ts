import { Component, createPlatform, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { concat, Observable, of, Subject } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { Constants } from 'src/app/config/constants';
import { MastersService } from 'src/app/modules/masters/services/masters.service';
import { IAlert } from 'src/app/public/models/AlertMessage';
import { CommonService } from 'src/app/public/services/common.service';

@Component({
  selector: 'app-add-patient-sale',
  templateUrl: './add-patient-sale.component.html',
  styleUrls: ['./add-patient-sale.component.scss']
})
export class AddPatientSaleComponent implements OnInit {

  alertMsg: IAlert;
  addPatForm: FormGroup;
  loadForm = false;
  doctorList$ = new Observable<any>();
  doctorListInput$ = new Subject<any>();
  compInstance = this;
  submitted = false;
  constructor(
    public modal: NgbActiveModal,
    private fb: FormBuilder,
    private commonService: CommonService,
    private mastersService: MastersService,
  ) { }

  ngOnInit(): void {
    this.createPatientform();
  }

  createPatientform() {
    this.addPatForm = this.fb.group({
      patientId: [0],
      mobileNo: [null],
      patientFirstname: [null, Validators.required],
      patientMidname: [null],
      patientLastname: [null],
      patientAddress1: [null],
      patientAddress2: [null],
      patientAddress3: [null],
      doctorID: [null],
      doctorName: [null],
      doctor: [null],
      gender: [null],
      isActive: [true],
    });
    this.loadForm = true;
  }

  closePopup(from?) {
    const obj = {
      data: from,
      type: from ? 'yes' : 'no'
    }
    this.modal.close(obj);
  }

  notifyAlertMessage(data): void {
    this.alertMsg = {
      message: data.msg,
      messageType: data.class,
      duration: Constants.ALERT_DURATION
    };
  }

  savePatientData() {
    this.submitted = true;
    if (this.addPatForm.valid) {
      this.submitted = false;
      const param = this.addPatForm.getRawValue();
      const reqParam = {
        patientId: param.patientId ? param.patientId : 0,
        mobileNo: param.mobileNo ? param.mobileNo : '',
        patientFirstname: param.patientFirstname ? param.patientFirstname : '',
        patientMidname: param.patientMidname ? param.patientMidname : '',
        patientLastname: param.patientLastname ? param.patientLastname : '',
        patientAddress1: param.patientAddress1 ? param.patientAddress1 : '',
        patientAddress2: param.patientAddress2 ? param.patientAddress2 : '',
        patientAddress3: param.patientAddress3 ? param.patientAddress3 : '',
        doctorID: param.doctorID ? param.doctorID : 0,
        doctorName: param.doctorName ? param.doctorName : '',
        gender: param.gender ? param.gender : '',
        isActive: true,
      }
      this.mastersService.savePatientMaster(reqParam).subscribe(res => {
        param.patientId = res
        this.closePopup(param);
      });
    }
  }

  get getFrmCntrols() {
    return this.compInstance.addPatForm.controls;
  }

  getDoctorList(searchKey?): Observable<any> {
    const params = {
      search_keyword: searchKey,
      dept_id: null,
      speciality_id: null,
      role_type_id: 3,
      limit: 50
    };
    return this.compInstance.commonService.getUsersList(params).pipe(map((res: any) => {
      const docArray = [];
      res.map(d => {
        const obj = {
          id: d.user_id,
          name: d.user_name
        };
        docArray.push({ ...obj });
      });
      return docArray;
    }));
  }

  selectDoctorValue(val) {
    if (val) {
      this.addPatForm.patchValue({
        doctorID: val.id,
        doctorName: val.name,
      });
    } else {
      this.addPatForm.patchValue({
        doctorID: 0,
        doctorName: '',
      });
    }

  }

}

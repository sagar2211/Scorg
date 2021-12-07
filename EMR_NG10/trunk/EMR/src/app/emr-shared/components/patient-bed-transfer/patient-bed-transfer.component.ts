import { Component, OnInit, Input } from '@angular/core';
import * as _ from 'lodash';
import { FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EncounterPatient } from 'src/app/public/models/encounter-patient.model';
import { PublicService } from 'src/app/public/services/public.service';
import { CommonService } from 'src/app/public/services/common.service';
import { AuthService } from 'src/app/public/services/auth.service';

@Component({
  selector: 'app-patient-transfer',
  templateUrl: './patient-bed-transfer.component.html',
  styleUrls: ['./patient-bed-transfer.component.scss']
})
export class PatientBedTransferComponent implements OnInit {
  bedTransferForm: FormGroup;
  patientId: any;
  isAdd = false;
  compInstance = this;
  loginUser: any;
  isAccepted = false;
  @Input() patientObj: EncounterPatient;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    public publicService: PublicService,
    public commonService: CommonService,
    public authService: AuthService,
    public modal: NgbActiveModal
  ) { }

  ngOnInit() {
    this.loginUser = this.authService.getUserDetailsByKey('userInfo');
    this.patientId = this.route.snapshot.paramMap.get('patientId');
    console.log(this.patientObj)
    console.log(this.patientId)
    this.getBedTypeList().subscribe();
    // this.getBedClassList().subscribe();
    this.createForm();
    this.getPatientBedTransferData();
    // this.getCareTeamData();
  }

  getBedTypeList(searchKey?: string): Observable<any> {
    const params = {
      search_string: searchKey ? searchKey : '',
      page_number: 1,
      limit: environment.limitDataToGetFromServer
    };
    return this.compInstance.commonService.getBedTypeList(params).pipe(map((res: any) => {
      return res;
    }));
  }
  getBedClassList(searchKey?: string): Observable<any> {
    const params = {
      search_string: searchKey ? searchKey : '',
      page_number: 1,
      limit: environment.limitDataToGetFromServer
    };
    return this.compInstance.commonService.getBedClassList(params).pipe(map((res: any) => {
      return res;
    }));
  }
  createForm() {
    this.bedTransferForm = this.fb.group({
      bedType: [null, Validators.required],
      // bedClass: [null, Validators.required],
      comment: [null]
    });
    this.patchDefaultValue();
  }

  patchDefaultValue(value?): void {
    this.bedTransferForm.patchValue({ bedType: (value ? value.bedType : null) });
    // this.bedTransferForm.patchValue({ bedClass: (value ? value.bedClass : null) });
    // this.bedTransferForm.patchValue({ bedClass: (value ? value.comment : null) });
  }

  selectBedType(e): void {
    this.bedTransferForm.patchValue({ bedType: (e ? e : null) });
  }
  // selectBedClass(e): void {
  //   this.bedTransferForm.patchValue({ bedClass: (e ? e : null) });
  // }

  getPatientBedTransferData() {
    const param = {
      serviceTypeId: this.patientObj?.serviceType.id, // 1 for IPD, 2 for OPD
      patientId: this.patientObj?.patientData.id,
      visitNo: this.patientObj?.visitNo,
    };
    this.publicService.GetPatientBedTransferDetail(param).subscribe((result) => {
      if (result) {
        this.bedTransferForm.reset();
        this.isAccepted = false;
        const obj = {
          bedType: { id: result.bedTypeId, name: result.bedTypeName },
          // bedClass: { id: result.bedClassId, name: result.bedClassName },
          comment:  result.comment
        };
        this.patchDefaultValue(obj);
      } else {
        this.isAccepted = true;
      }
    });
  }

  savePatientBedTransfer() {
    const formdata = this.bedTransferForm.value;
    const param = {
      serviceTypeId: this.patientObj.serviceType.id, // 1 for IPD
      patientId: this.patientObj.patientData.id,
      visitNo: this.patientObj.visitNo,
      bedTypeId: formdata.bedType.id,
      // bedClassId: formdata.bedClass.id,
      comment: formdata.comment
    };
    console.log(param);
    // this.publicService.updateTransferData(formdata);
    this.publicService.savePatientBedTransfer(param).subscribe((res) => {
      if (res) {
        const obj = {
          message: res.status_code === 200 ? 'Succesfully bed transfer request raised.' : res.message,
          messageType: res.status_code === 200 ? 'success' : 'warning',
          type: 'close'
        };
        this.modal.close(obj);
      } else {
        this.modal.dismiss('');
      }
    });
  }
}

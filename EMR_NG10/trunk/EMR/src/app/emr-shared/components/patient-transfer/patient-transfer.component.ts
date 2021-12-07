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
  templateUrl: './patient-transfer.component.html',
  styleUrls: ['./patient-transfer.component.scss']
})
export class PatientTransferComponent implements OnInit {
  careTeamFrm: FormGroup;
  patientId: any;
  isAdd = false;
  compInstance = this;
  loginUser: any;
  // depArray: string[] = ['Academics', 'Accounts', 'Blood Bank', 'Cardiac OT', 'Cath Lab', 'Doppler'];
  depArray = [];
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
    this.getDepartmentList().subscribe();
    this.createForm();
    this.getTransferData();
    // this.getCareTeamData();
  }

  getDepartmentList(searchKey?: string): Observable<any> {
    const params = {
      search_string: searchKey ? searchKey : '',
      page_number: 1,
      limit: environment.limitDataToGetFromServer
    };
    return this.compInstance.commonService.getDepartmentList(params).pipe(map((res: any) => {
      if (res.length > 0) {
        return this.compInstance.depArray = res;
      } else {
        return this.compInstance.depArray = [];
      }
    }));
  }
  createForm() {
    this.careTeamFrm = this.fb.group({
      doctorListArray: this.fb.array([])
    });
    this.patchDefaultValue();
  }

  patchDefaultValue(value?): void {
    const userObj = {
      department: [value ? value.department : null],
      comment: [value ? value.comment : null],
    };
    this.doctorListArray.push(this.fb.group(userObj));
  }

  get doctorListArray() {
    return this.careTeamFrm.get('doctorListArray') as FormArray;
  }

  selectValue(e, index): void {
    this.doctorListArray.at(index).patchValue({
      department: e ? e : null, comment: null
    });
  }

  getDepName(dep, index): void {
    this.doctorListArray.at(index).patchValue({
      department: dep ? dep : '',
    });
  }

  // getCareTeamData() {
  //   this.publicService.getTransferData().subscribe(data => {
  //     if (data.length) {
  //       this.careTeamFrm.reset({});
  //       this.createForm();
  //       _.map(data, (x) => {
  //         this.patchDefaultValue(x);
  //       });
  //     }
  //   });
  // }
  getTransferData() {
    const param = {
      service_type_id: this.patientObj.serviceType.id, // 1 for IPD, 2 for OPD
      patient_id: this.patientObj.patientData.id,
      visit_no: this.patientObj.visitNo,
      // dept_id: this.patientObj.deptId,
      sort_column: 'PATIENT_NAME',
      sort_order: 'desc',
      page_number: 1,
      limit: 1
    };
    this.publicService.getPatientTransferList(param).subscribe((res) => {
      if (res.length) {
        this.doctorListArray.clear();
        const result = res[0];
        this.isAccepted = result.is_accepted;
        const obj = {
          department: { department_id: result.dept_id, department_name: result.dept_name },
          comment: result.remark,
        };
        this.patchDefaultValue(obj);
      } else {
        this.isAccepted = true;
      }
    });
  }

  updateValueInService() {
    const formdata = _.filter(this.doctorListArray.value, (v) => {
      return (v.department !== null && v.comment !== '');
    });
    const param = {
      service_type_id: this.patientObj.serviceType.id, // 1 for IPD
      patient_id: this.patientObj.patientData.id,
      visit_no: this.patientObj.visitNo,
      dept_id: formdata[0].department.department_id,
      old_dept_id: this.patientObj.deptId,
      remark: formdata[0].comment
    };
    console.log(param);
    // this.publicService.updateTransferData(formdata);
    this.publicService.savePatientTransfer(param).subscribe((res) => {
      if (res) {
        const obj = {
          message: res.status_code === 200 ? 'Succesfully transfered.' : res.message,
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

import { Component, OnInit, Input } from '@angular/core';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable, of, concat } from 'rxjs';
import * as _ from 'lodash';
import { catchError, distinctUntilChanged, map, switchMap, tap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { EncounterPatient } from 'src/app/public/models/encounter-patient.model';
import { PublicService } from 'src/app/public/services/public.service';
import { CommonService } from 'src/app/public/services/common.service';
import { AuthService } from 'src/app/public/services/auth.service';
import { EMRService } from 'src/app/public/services/emr-service';

@Component({
  selector: 'app-nursing-handover',
  templateUrl: './nursing-handover.component.html',
  styleUrls: ['./nursing-handover.component.css']
})
export class NursingHandoverComponent implements OnInit {
  nursingHandeoverFrm: FormGroup;
  isAdd = false;
  compInstance = this;
  loginUser: any;
  depArray = [];
  isAccepted = false;
  nurseLoading: boolean;
  nurseList$ = new Observable<any>();
  @Input() patientObj: EncounterPatient;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    public publicService: PublicService,
    public commonService: CommonService,
    public authService: AuthService,
    public modal: NgbActiveModal,
    private emrService: EMRService,
  ) { }

  ngOnInit() {
    this.loginUser = +this.authService.getLoggedInUserId();
    this.loadUserList();
    this.createForm();
    // this.getHandOverData();
  }
  private loadUserList(searchTxt?) {
    this.nurseList$ = concat(
      this.getNurseList(searchTxt), // default items
      this.nurseList$.pipe(
        distinctUntilChanged(),
        tap(() => this.nurseLoading = true),
        switchMap(term => this.getNurseList(term).pipe(
          catchError(() => of([])), // empty list on error
          tap(() => this.nurseLoading = false)
        ))
      )
    );
  }

  getNurseList(searchKey?: string): Observable<any> {
    const reqParam = {
      search_keyword: searchKey,
      dept_id: 0,
      speciality_id: 0,
      role_type_id: 4,
      designation_id: 0,
      limit: 50
    };
    return this.compInstance.emrService.getUsersList(reqParam).pipe(map(res => {
      const list = _.filter(res, (d) => d.user_id !== this.loginUser);
      return _.map(list, (o) => {
        return { id: o.user_id, name: (o.title + ' ' + o.user_name) };
      });
    }));
  }
  createForm(value?) {
    this.nursingHandeoverFrm = this.fb.group({
      nurse: [value ? value.nurse : null, Validators.required],
      comment: [value ? value.comment : null],
    });
  }

  selectValue(e): void {
    this.nursingHandeoverFrm.patchValue({
      nurse: e ? e : null
    });
  }

  getHandOverData() {
    const param = {
      searchKeyword: '',
      serviceTypeId: this.patientObj.serviceType.id, // 1 for IPD, 2 for OPD,
      patientId: this.patientObj.patientData.id,
      visitNo: this.patientObj.visitNo,
      userId: this.loginUser,
      isAccepted: true,
      sortColumn: 'PATIENT_NAME',
      sortOrder: 'desc',
      pageNumber: 1,
      limit: 1
    };
    this.publicService.GethandoverPatient(param).subscribe((res) => {
      if (res.length) {
        const result = res[0];
        this.isAccepted = result.is_accepted;
        this.nursingHandeoverFrm.patchValue({
          nurse: { nurse_id: result.userId, nurse_name: result.userName },
          comment: result.remark,
        });
      } else {
        this.isAccepted = true;
      }
    });
  }

  updateValueInService() {
    const param = {
      serviceTypeId: this.patientObj.serviceType.id, // 1 for IPD
      patientId: this.patientObj.patientData.id,
      visitNo: this.patientObj.visitNo,
      userId: this.nursingHandeoverFrm.value.nurse.id,
      oldUserId: this.loginUser,
      remark: this.nursingHandeoverFrm.value.comment
    };
    this.publicService.handOverpatientNursing(param).subscribe((res) => {
      if (res) {
        const obj = {
          message: res.status_code === 200 ? 'Succesfully Hand over.' : res.message,
          messageType: res.status_code === 200 ? 'success' : 'warning'
        };
        this.modal.dismiss(obj);
      } else {
        this.modal.dismiss('');
      }
    });
  }
}

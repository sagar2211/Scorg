import { Component, OnInit, ViewChild, ElementRef, Output, EventEmitter, Input, ViewContainerRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import * as _ from 'lodash';
import { PublicService } from './../../../public/services/public.service';

@Component({
  selector: 'app-add-radiology-test',
  templateUrl: './add-radiology-test.component.html',
  styleUrls: ['./add-radiology-test.component.scss']
})
export class AddRadiologyTestComponent implements OnInit {
  submitted = false;
  radiologyTestFrm: FormGroup;
  errorMsg = '';
  @ViewChild('vc', { read: AddRadiologyTestComponent, static: true }) vc: ViewContainerRef;
  @Output() dataOfAddRadiology = new EventEmitter<any>();
  @Input() onSearchData: (name, strictMode) => Observable<any>;
  @Input() compInstance;

  constructor(
    private fb: FormBuilder,
    private publicService: PublicService
    ) { }

  ngOnInit() {
    this.radiologyTestFrm = this.fb.group({
      radioTestName: [null, Validators.required],
      default_comment: [null],
      currentOpd: [true]
    });
  }

  // convenience getter for easy access to form fields
  get f() { return this.radiologyTestFrm.controls; }

  // -- click on save button
  onSave($model): void {
    this.submitted = true;
    if (this.radiologyTestFrm.invalid) {
      return;
    }
    this.onSearchData(this.radiologyTestFrm.value.radioTestName, true).subscribe(result => {
      const findDt = _.find(result, (i) => {
        return i.label.toLowerCase() == this.radiologyTestFrm.value.radioTestName.toLowerCase();
      });
      if (findDt) {
        this.errorMsg = 'Radio test already exsits';
        return;
      }
      this.errorMsg = '';
      const customHeadObject = this.compInstance.radioInvestigationHead;
      const reqParams = {
        investigation_head_id: customHeadObject.id,
        label: this.radiologyTestFrm.value.radioTestName,
        default_comment: this.radiologyTestFrm.value.default_comment,
      };
      this.publicService.saveInvestigationDetails(reqParams).subscribe(savRes => {
        if (savRes.data) {
          this.errorMsg = '';
          // this.dataOfAddRadiology.emit(this.radiologyTestFrm.value);
          if (this.radiologyTestFrm.value.currentOpd) {
            const obj = {id: savRes.data, ...this.radiologyTestFrm.value};
            this.dataOfAddRadiology.emit(obj);
            $model.dismiss('CLOSED');
            this.clear();
          } else {
            $model.dismiss('CLOSED');
          }
        } else {
          this.errorMsg = 'Radio test already exsits';
        }
      });
    });
  }

  // -- clear form
  clear(): void {
    this.submitted = false;
    this.radiologyTestFrm.reset({
      currentOpd: [true]
    });
  }

}



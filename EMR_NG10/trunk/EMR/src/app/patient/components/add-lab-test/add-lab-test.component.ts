import { Component, OnInit, ViewChild, Output, Input, ElementRef, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { PublicService } from './../../../public/services/public.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-add-lab-test',
  templateUrl: './add-lab-test.component.html',
  styleUrls: ['./add-lab-test.component.scss']
})
export class AddLabTestComponent implements OnInit {
  submitted = false;
  addNewLabTestFrm: FormGroup;
  errorMsg: string;

  @ViewChild('vc', { read: AddLabTestComponent, static: true }) vc: ElementRef;
  @Output() newLabTestData: any = new EventEmitter<any>();
  @Input() compInstance;
  @Input() onSearchData: (name, strictMode) => Observable<any>;

  constructor(
    private fb: FormBuilder,
    private publicService: PublicService
    ) { }

  ngOnInit() {
    this.addNewLabTestFrm = this.fb.group({
      labTestName: ['', Validators.required],
      default_comment: [''],
      currentOpd: [true]
    });
  }

  get f() {
    return this.addNewLabTestFrm.controls;
  }

  onSave($model): void {
    this.submitted = true;
    if (this.addNewLabTestFrm.invalid) {
      return;
    }
    this.onSearchData(this.addNewLabTestFrm.value.labTestName, true).subscribe(result => {
      const findDt = _.find(result, (i) => {
        return i.label.toLowerCase() === this.addNewLabTestFrm.value.labTestName.toLowerCase();
      });
      if (findDt) {
        this.errorMsg = 'Lab test already exsits';
        return;
      }
      this.errorMsg = '';
      const customHeadObject = this.compInstance.labInvestigationHead;
      const reqParams = {
        investigation_head_id: customHeadObject.id,
        label: this.addNewLabTestFrm.value.labTestName,
        default_comment: this.addNewLabTestFrm.value.default_comment,
      };
      this.publicService.saveInvestigationDetails(reqParams).subscribe(savRes => {
        if (savRes.data) {
          this.errorMsg = '';
          if (this.addNewLabTestFrm.value.currentOpd) {
            const obj = { id: savRes.data, ...this.addNewLabTestFrm.value };
            this.newLabTestData.emit(obj);
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

  clear(): void {
    this.addNewLabTestFrm.reset({
      currentOpd: [true]
    });
    this.submitted = false;
  }
}

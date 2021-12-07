import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ExaminationTags } from './../../../public/models/examination-tags';

@Component({
  selector: 'app-examination-label-edit',
  templateUrl: './examination-label-edit.component.html',
  styleUrls: ['./examination-label-edit.component.scss']
})
export class ExaminationLabelEditComponent implements OnInit {
  @Input() examinationData: any;
  examinationText: string;
  constructor(
    public modal: NgbActiveModal,
  ) { }

  ngOnInit() {
    this.examinationText = null;
  }

  selectValueConfirm(typ: string) {
    const obj = {
      type: typ,
      data: null
    };
    if (typ === 'Ok') {
      if (this.examinationText) {
        const exmData = new ExaminationTags();
        exmData.generateObject(exmData);
        exmData.headId = this.examinationData.headId;
        exmData.tagName = this.examinationText;
        exmData.tagKey = this.examinationText.replace(/\s+/g, '').toLowerCase();
        obj.data = exmData;
      }
      this.modal.close(obj);
    } else {
      this.modal.close(obj);
    }
  }

}

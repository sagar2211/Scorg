import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-copy-prescription-chart-list',
  templateUrl: './copy-prescription-chart-list.component.html',
  styleUrls: ['./copy-prescription-chart-list.component.scss']
})
export class CopyPrescriptionChartListComponent implements OnInit {
  @Input() chartList: any;
  constructor(
    public modal: NgbActiveModal,
  ) { }

  ngOnInit(): void {
    this.chartList.map(d => {
      d.chart_details.map(chrt => {
        chrt.isSelected = false;
      });
    });
  }

  closePopup(typ) {
    const obj = {
      type: typ ? 'yes' : 'no',
      data: typ ? typ : []
    }
    this.modal.close(obj);
  }

  copyPrescriptionForSelectedChart() {
    const list = [];
    this.chartList.map(d => {
      d.chart_details.map(comp => {
        if (comp.section_key === 'prescription' && comp.isSelected === true) {
          list.push(d);
        }
      });
    });
    if (list.length > 0) {
      this.closePopup(list);
    } else {
      console.log('please select chart');
    }
  }

}

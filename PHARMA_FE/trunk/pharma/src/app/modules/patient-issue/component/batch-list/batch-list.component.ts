import { Component, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DxDataGridComponent } from 'devextreme-angular';
import { Constants } from 'src/app/config/constants';
import { IAlert } from 'src/app/public/models/AlertMessage';

@Component({
  selector: 'app-batch-list',
  templateUrl: './batch-list.component.html',
  styleUrls: ['./batch-list.component.scss']
})
export class BatchListComponent implements OnInit {
  @ViewChild(DxDataGridComponent, { static: false }) public dataGrid: DxDataGridComponent;
  @Input() stockData: any;
  @Input() stockDataSelected: any;
  alertMsg: IAlert;
  constructor(
    public modal: NgbActiveModal
  ) { }

  ngOnInit(): void {
    this.initDataGrid();
  }

  notifyAlertMessage(data): void {
    this.alertMsg = {
      message: data.msg,
      messageType: data.class,
      duration: Constants.ALERT_DURATION
    };
  }

  initDataGrid(index?) {
    setTimeout(() => {
      let el = this.dataGrid.instance.getCellElement(0, 'batchNo');
      this.dataGrid.instance.focus(el);
    }, 500);
  }

  onFocusedRowChanged(evt) {
    console.log(evt);
    this.stockDataSelected = evt.row.data;
  }

  closePopup(from?) {
    const obj = {
      data: this.stockDataSelected,
      type: from ? 'yes' : 'no'
    }
    this.modal.close(obj);
  }


  @HostListener('document:keyup', ['$event'])
  handleDeleteKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.closePopup(true);
    } else if (event.key === 'Escape') {
      this.closePopup();
    }
  }

}

import { Component, OnInit, Input } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-order-display-on-discharge',
  templateUrl: './order-display-on-discharge.component.html',
  styleUrls: ['./order-display-on-discharge.component.scss']
})
export class OrderDisplayOnDischargeComponent implements OnInit {
  @Input() orderData;
  dataName;
  constructor() { }

  ngOnInit(): void {
  }

  onEditUpdateSection(event, item): void {
    item.isShow = !item.isShow;
    event.stopPropagation();
  }

  onDisplayTypeChange(orderData, event, isSectionObject?: boolean): void {
    if (isSectionObject) {
      orderData['dataDisplayType'] = event.target.value;
    } else {
      orderData.summery.forEach(element => {
        element['dataDisplayType'] = event.target.value;
      });
    }
    event.stopPropagation();
  }

  updateSummeryData(addData, orderData): void {
    if (orderData.isDataAlreadyPushed) {
      orderData.data[orderData.data.length - 1] = addData;
    } else {
      orderData.data.push(addData);
      orderData.isDataAlreadyPushed = true;
    }
    if (!addData) {
      orderData.data.splice(orderData.data.length - 1, 1);
      orderData.isDataAlreadyPushed = false;
    }
  }

  onRemove(event, currentSummery): void {

  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.orderData.data, event.previousIndex, event.currentIndex);
  }
}

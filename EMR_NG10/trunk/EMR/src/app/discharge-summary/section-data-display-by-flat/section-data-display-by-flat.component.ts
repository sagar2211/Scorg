import { Component, OnInit, Input } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-section-data-display-by-flat',
  templateUrl: './section-data-display-by-flat.component.html',
  styleUrls: ['./section-data-display-by-flat.component.scss']
})
export class SectionDataDisplayByFlatComponent implements OnInit {
  @Input() public discharge: any;
  @Input() public orderData: any;

  constructor() { }

  ngOnInit() {
    // console.log(this.discharge, 'app-section-data-display-by-flat');
  }

  onEditUpdateSection(event, item): void {
    item.isShow = !item.isShow;
    event.stopPropagation();
  }

  onDisplayTypeChange(discharge, event, isSectionObject?: boolean): void {
    if (isSectionObject) {
      discharge['dataDisplayType'] = event.target.value;
    } else {
      discharge.summery.forEach(element => {
        element['dataDisplayType'] = event.target.value;
      });
    }
    event.stopPropagation();
  }

  updateSummeryData(currentSummery): void {
    if (currentSummery.isDataAlreadyPushed) {
      currentSummery.summaryData[currentSummery.summaryData.length - 1] = currentSummery.summaryDataTemp;
    } else {
      currentSummery.summaryData.push(currentSummery.summaryDataTemp);
      currentSummery.isDataAlreadyPushed = true;
    }
    if (!currentSummery.summaryDataTemp) {
      currentSummery.summaryData.splice(currentSummery.summaryData.length - 1, 1);
      currentSummery.isDataAlreadyPushed = false;
    }
  }

  onRemove(event, currentSummery): void { }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.discharge.summery, event.previousIndex, event.currentIndex);
  }
}

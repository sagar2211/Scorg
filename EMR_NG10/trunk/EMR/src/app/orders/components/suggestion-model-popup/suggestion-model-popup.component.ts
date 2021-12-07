// import { SuggestionPanelComponent } from './../../../shared/components/suggestion-panel/suggestion-panel.component';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Component, OnInit, Input, ViewContainerRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-suggestion-model-popup',
  templateUrl: './suggestion-model-popup.component.html',
  styleUrls: ['./suggestion-model-popup.component.scss']
})
export class SuggestionModelPopupComponent implements OnInit {
  suggestionPanelSettings: any;
  isOnload: boolean;
  searchKeyword = '';
  showInputSearchBox = false;

  @Input() isFrom;
  @ViewChild('suggestionPanel', {static: false}) suggestionPanelComp: any;

  constructor(
    private ngbActiveModel: NgbActiveModal
  ) { }

  ngOnInit() {
    this.suggestionPanelSettings = {};
    this.suggestionPanelSettings['suggestionIsShow'] =  true;
    this.suggestionPanelSettings['suggestionPin'] = 'pin';
    this.isOnload = true;
  }

  close() {
    this.ngbActiveModel.close();
  }

  showHideSearchInputBox() {
    this.showInputSearchBox = !this.showInputSearchBox;
  }

  onSearch(event) {
    this.suggestionPanelComp.searchKeyword = event;
    this.suggestionPanelComp.subject.next();
  }

  hideHistory() {
    this.suggestionPanelComp.hideHistory();
  }

}

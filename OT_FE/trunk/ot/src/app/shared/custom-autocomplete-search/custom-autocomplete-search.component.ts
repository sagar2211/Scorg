import { Component, OnInit, Input, Output, TemplateRef, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-custom-autocomplete-search',
  templateUrl: './custom-autocomplete-search.component.html',
  styleUrls: ['./custom-autocomplete-search.component.scss']
})
export class CustomAutocompleteSearchComponent implements OnInit {
  @Input() public data = [];
  @Input() public searchKey: string; // keyword to filter the list
  @Input() public placeHolder = ''; // input placeholder
  @Input() public heading = '';
  @Input() public initialValue: any; // set initial value
  @Input() public notFoundText = 'Not found'; // set custom text when filter returns empty result
  @Input() public isLoading: boolean; // loading mask
  @Input() public debounceTime: 400; // delay time while typing
  @Input() public disabled: boolean; // input disable/enable
  @Input() public minQueryLength = 1;

  @Output() selectEvent = new EventEmitter<any>();
  @Output() inputChangedEvent = new EventEmitter<any>();
  @Output() readonly inputFocusedEvent: EventEmitter<void> = new EventEmitter<void>();
  @Output() readonly inputClearedEvent: EventEmitter<void> = new EventEmitter<void>();
  @Output() readonly openedEvent: EventEmitter<void> = new EventEmitter<void>();
  @Output() readonly closedEvent: EventEmitter<void> = new EventEmitter<void>();
  @Output() readonly onScrolledToEnd: EventEmitter<void> = new EventEmitter<void>();


  // Custom templates
  @Input() itemTemplate !: TemplateRef<any>;
  @Input() notFoundTemplate !: TemplateRef<any>;
  constructor() { }

  ngOnInit() {console.log(this.searchKey,this.data,this.itemTemplate)
  }

  selected($event) {
    this.selectEvent.next($event);
  }
  inputChanged($event) {
    this.inputChangedEvent.next($event);
  }
  inputFocused($event) {
    this.inputFocusedEvent.next($event);
  }
  inputCleared($event) {
    this.inputClearedEvent.next($event);
  }
  opened($event) {
    this.openedEvent.next();
  }
  closed($event) {
    this.closedEvent.next($event);
  }
  scrolledToEnd() {
    this.onScrolledToEnd.next();
  }
}

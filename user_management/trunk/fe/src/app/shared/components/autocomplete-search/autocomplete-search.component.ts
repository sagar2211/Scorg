import {
  AfterViewInit, Component, ContentChild, ElementRef, EventEmitter, forwardRef, Input, OnChanges, OnInit, Output, Renderer2, SimpleChanges, TemplateRef, ViewChild, ViewEncapsulation
} from '@angular/core';
import { fromEvent, Observable } from 'rxjs';
import { debounceTime, filter, map } from 'rxjs/operators';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * Keyboard events
 */
const isArrowUp = keyCode => keyCode === 38;
const isArrowDown = keyCode => keyCode === 40;
const isArrowUpDown = keyCode => isArrowUp(keyCode) || isArrowDown(keyCode);
const isEnter = keyCode => keyCode === 13;
const isBackspace = keyCode => keyCode === 8;
const isDelete = keyCode => keyCode === 46;
const isESC = keyCode => keyCode === 27;
const isTab = keyCode => keyCode === 9;


@Component({
  selector: 'app-autocomplete-search',
  templateUrl: './autocomplete-search.component.html',
  styleUrls: ['./autocomplete-search.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AutocompleteSearchComponent),
      multi: true
    }
  ],
  encapsulation: ViewEncapsulation.None,
  host: {
    '(document:click)': 'handleClick($event)',
    'class': 'cls-autocomplete'
  },
})

export class AutocompleteSearchComponent implements OnInit, OnChanges, AfterViewInit, ControlValueAccessor {
  @ViewChild('searchInput', { static: false }) searchInput: ElementRef; // input element
  @ViewChild('filteredListElement', { static: false }) filteredListElement: ElementRef; // element of items
  @ViewChild('historyListElement', { static: false }) historyListElement: ElementRef; // element of history items


  inputKeyUp$: Observable<any>; // input events
  inputKeyDown$: Observable<any>; // input events

  public query = ''; // search query
  public filteredList = []; // list of items
  public historyList = []; // list of history items
  public elementRef;
  public selectedIdx = -1;
  public toHighlight: string = '';
  public notFound = false;
  public isFocused = false;
  public isOpen = false;
  public isScrollToEnd = false;
  public overlay = false;
  private manualOpen = undefined;
  private manualClose = undefined;

  @Input() public data = [];
  @Input() public searchKeyword: string; // keyword to filter the list
  @Input() public placeHolder = ''; // input placeholder
  @Input() public heading = '';
  @Input() public initialValue: any; // set initial value
  @Input() public notFoundText = 'Not found'; // set custom text when filter returns empty result
  @Input() public isLoading: boolean; // loading mask
  @Input() public debounceTime: 400; // delay time while typing
  @Input() public disabled: boolean; // input disable/enable
  /**
   * The minimum number of characters the user must type before a search is performed.
   */
  @Input() public minQueryLength = 1;

  /** Event that is emitted whenever an item from the list is selected. */
  @Output() selected = new EventEmitter<any>();

  /** Event that is emitted whenever an input is changed. */
  @Output() inputChanged = new EventEmitter<any>();

  /** Event that is emitted whenever an input is focused. */
  @Output() readonly inputFocused: EventEmitter<void> = new EventEmitter<void>();

  /** Event that is emitted whenever an input is cleared. */
  @Output() readonly inputCleared: EventEmitter<void> = new EventEmitter<void>();

  /** Event that is emitted when the autocomplete panel is opened. */
  @Output() readonly opened: EventEmitter<void> = new EventEmitter<void>();

  /** Event that is emitted when the autocomplete panel is closed. */
  @Output() readonly closed: EventEmitter<void> = new EventEmitter<void>();

  /** Event that is emitted when scrolled to the end of items. */
  @Output() readonly scrolledToEnd: EventEmitter<void> = new EventEmitter<void>();


  // Custom templates
  @Input() itemTemplate !: TemplateRef<any>;
  @Input() notFoundTemplate !: TemplateRef<any>;

  propagateChange: any = () => { };

  writeValue(value: any) {
    this.query = value;
  }
  registerOnChange(fn) {
    this.propagateChange = fn;
  }
  registerOnTouched(fn: () => void): void {
  }

  onChange(event) {
    this.propagateChange(event.target.value);
  }

  constructor(elementRef: ElementRef, private renderer: Renderer2) {
    this.elementRef = elementRef;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  ngOnInit() {
    this.setInitialValue(this.initialValue);
  }

  ngAfterViewInit() {
    this.initEventStream();
    this.handleScroll();
  }
  public setInitialValue(value: any) {
    if (this.initialValue) {
      this.select(value);
    }
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes &&
      changes.data &&
      Array.isArray(changes.data.currentValue)
    ) {
      this.handleItemsChange();
      if (!changes.data.firstChange && this.isFocused) {
        this.handleOpen();
      }
    }
  }

  public handleItemsChange() {
    this.isScrollToEnd = false;
    if (!this.isOpen) {
      return;
    }

    this.filteredList = this.data;
    this.notFound = !this.filteredList || this.filteredList.length === 0;
  }


  public filterList() {
    this.selectedIdx = -1;
    if (this.query != null && this.data) {
      this.toHighlight = this.query;
      this.filteredList = this.data.filter((item: any) => {
        if (typeof item === 'string') {
          return item.toLowerCase().indexOf(this.query.toLowerCase()) > -1;
        } else if (typeof item === 'object' && item.constructor === Object) {
          return item[this.searchKeyword].toLowerCase().indexOf(this.query.toLowerCase()) > -1;
        }
      });
    } else {
      this.notFound = false;
    }
  }
  isType(item) {
    return typeof item === 'string';
  }
  public select(item) {
    this.query = !this.isType(item) ? item[this.searchKeyword] : item;
    this.isOpen = true;
    this.overlay = false;
    this.selected.emit(item);
    this.propagateChange(item);
    this.handleClose();
    this.query = '';
    this.inputCleared.emit();
  }

  public handleClick(e) {
    let clickedComponent = e.target;
    let inside = false;
    do {
      if (clickedComponent === this.elementRef.nativeElement) {
        inside = true;
        if (this.filteredList.length) {
          this.handleOpen();
        }
      }
      clickedComponent = clickedComponent.parentNode;
    } while (clickedComponent);
    if (!inside) {
      this.handleClose();
    }
  }
  handleOverlay() {
    this.overlay = false;
  }

  // Scroll items
  public handleScroll() {
    this.renderer.listen(this.filteredListElement.nativeElement, 'scroll', () => {
      this.scrollToEnd();
    });
  }

  setPanelState(event) {
    if (event) {
      event.stopPropagation();
    }
    if (typeof this.manualOpen === 'undefined'
      && typeof this.manualClose === 'undefined') {
      this.isOpen = false;
      this.handleOpen();
    }

    if (typeof this.manualOpen === 'undefined'
      && this.manualClose === false
      || typeof this.manualClose === 'undefined'
      && this.manualOpen === false) {
      this.isOpen = false;
      this.handleOpen();
    }

    // if controls are touched but both are deactivated
    if (this.manualOpen === false && this.manualClose === false) {
      this.isOpen = false;
      this.handleOpen();
    }

    // if open control is touched and activated
    if (this.manualOpen) {
      this.isOpen = false;
      this.handleOpen();
      this.manualOpen = false;
    }

    // if close control is touched and activated
    if (this.manualClose) {
      this.isOpen = true;
      this.handleClose();
      this.manualClose = false;
    }
  }
  open() {
    this.manualOpen = true;
    this.isOpen = false;
    this.handleOpen();
  }
  close() {
    this.manualClose = true;
    this.isOpen = true;
    this.handleClose();
  }
  focus() {
    this.handleFocus(event);
  }
  clear() {
    this.remove(event);
  }
  // Remove search query
  public remove(e) {
    e.stopPropagation();
    this.query = '';
    this.inputCleared.emit();
    this.propagateChange(this.query);
    this.setPanelState(e);
  }
  handleOpen() {
    if (this.isOpen || this.isOpen && !this.isLoading) {
      return;
    }
    if (this.data && this.data.length) {
      this.isOpen = true;
      this.overlay = true;
      this.filterList();
      this.opened.emit();
    }
  }
  handleClose() {
    if (!this.isOpen) {
      this.isFocused = false;
      return;
    }
    this.isOpen = false;
    this.overlay = false;
    this.filteredList = [];
    this.selectedIdx = -1;
    this.notFound = false;
    this.isFocused = false;
    this.query = '';
    this.inputCleared.emit();
    this.closed.emit();
  }

  handleFocus(e) {
    this.searchInput.nativeElement.focus();
    if (this.isFocused) {
      return;
    }
    this.inputFocused.emit(e);
    // if data exists then open
    if (this.data && this.data.length) {
      this.setPanelState(event);
    }
    this.isFocused = true;
  }

  scrollToEnd(): void {
    if (this.isScrollToEnd) {
      return;
    }

    const scrollTop = this.filteredListElement.nativeElement
      .scrollTop;
    const scrollHeight = this.filteredListElement.nativeElement
      .scrollHeight;
    const elementHeight = this.filteredListElement.nativeElement
      .clientHeight;
    const atBottom = scrollHeight === scrollTop + elementHeight;
    if (atBottom) {
      this.scrolledToEnd.emit();
      this.isScrollToEnd = true;
    }
  }

  // Initialize keyboard events
  initEventStream() {
    this.inputKeyUp$ = fromEvent(
      this.searchInput.nativeElement, 'keyup'
    ).pipe(map(
      (e: any) => e
    ));

    this.inputKeyDown$ = fromEvent(
      this.searchInput.nativeElement,
      'keydown'
    ).pipe(map(
      (e: any) => e
    ));

    this.listenEventStream();
  }

  // Listen keyboard events
  listenEventStream() {
    this.inputKeyUp$
      .pipe(
        filter(e =>
          !isArrowUpDown(e.keyCode) &&
          !isEnter(e.keyCode) &&
          !isESC(e.keyCode) &&
          !isTab(e.keyCode)),
        debounceTime(this.debounceTime)
      ).subscribe(e => {
        this.onKeyUp(e);
      });

    // cursor up & down
    this.inputKeyDown$.pipe(filter(
      e => isArrowUpDown(e.keyCode)
    )).subscribe(e => {
      e.preventDefault();
      this.onFocusItem(e);
    });

    // enter keyup
    this.inputKeyUp$.pipe(filter(e => isEnter(e.keyCode))).subscribe(e => {
      //this.onHandleEnter();
    });

    // enter keydown
    this.inputKeyDown$.pipe(filter(e => isEnter(e.keyCode))).subscribe(e => {
      this.onHandleEnter();
    });
    this.inputKeyUp$.pipe(
      filter(e => isESC(e.keyCode),
        debounceTime(100))
    ).subscribe(e => {
      this.onEsc();
    });

    // TAB
    this.inputKeyDown$.pipe(
      filter(e => isTab(e.keyCode))
    ).subscribe(e => {
      this.onTab();
    });

    // delete
    this.inputKeyDown$.pipe(
      filter(e => isBackspace(e.keyCode) || isDelete(e.keyCode))
    ).subscribe(e => {
      this.onDelete();
    });
  }

  onKeyUp(e) {
    this.notFound = false; // search results are unknown while typing
    // if input is empty
    if (!this.query) {
      this.notFound = false;
      this.inputChanged.emit(e.target.value);
      this.inputCleared.emit();
      this.setPanelState(e);
    }
    // note that '' can be a valid query
    if (!this.query && this.query !== '') {
      return;
    }
    // if query >= to minQueryLength
    if (this.query.length >= this.minQueryLength) {
      this.inputChanged.emit(e.target.value);
      this.filterList();

      // If no results found
      if (!this.filteredList.length && !this.isLoading) {
        this.notFoundText ? this.notFound = true : this.notFound = false;
      }
    }
  }

  onFocusItem(e) {
    if (!this.historyList.length) {
      // filteredList
      const totalNumItem = this.filteredList.length;
      if (e.key === 'ArrowDown') {
        let sum = this.selectedIdx;
        sum = (this.selectedIdx === null) ? 0 : sum + 1;
        this.selectedIdx = (totalNumItem + sum) % totalNumItem;
        this.scrollToFocusedItem(this.selectedIdx);
      } else if (e.key === 'ArrowUp') {
        if (this.selectedIdx == -1) {
          this.selectedIdx = 0;
        }
        this.selectedIdx = (totalNumItem + this.selectedIdx - 1) % totalNumItem;
        this.scrollToFocusedItem(this.selectedIdx);
      }
    } else {
      // historyList
      const totalNumItem = this.historyList.length;
      if (e.key === 'ArrowDown') {
        let sum = this.selectedIdx;
        sum = (this.selectedIdx === null) ? 0 : sum + 1;
        this.selectedIdx = (totalNumItem + sum) % totalNumItem;
        this.scrollToFocusedItem(this.selectedIdx);
      } else if (e.key === 'ArrowUp') {
        if (this.selectedIdx == -1) {
          this.selectedIdx = 0;
        }
        this.selectedIdx = (totalNumItem + this.selectedIdx - 1) % totalNumItem;
        this.scrollToFocusedItem(this.selectedIdx);
      }
    }
  }

  scrollToFocusedItem(index) {
    let listElement = null;
    if (!this.historyList.length) {
      listElement = this.filteredListElement.nativeElement;
    } else {
      listElement = this.historyListElement.nativeElement;
    }

    const items = Array.prototype.slice.call(listElement.childNodes).filter((node: any) => {
      if (node.nodeType === 1) {
        return node.className.includes('item');
      } else {
        return false;
      }
    });

    if (!items.length) {
      return;
    }

    const listHeight = listElement.offsetHeight;
    const itemHeight = items[index].offsetHeight;
    const visibleTop = listElement.scrollTop;
    const visibleBottom = listElement.scrollTop + listHeight - itemHeight;
    const targetPosition = items[index].offsetTop;

    if (targetPosition < visibleTop) {
      listElement.scrollTop = targetPosition;
    }

    if (targetPosition > visibleBottom) {
      listElement.scrollTop = targetPosition - listHeight + itemHeight;
    }
  }

  // Select item on enter click
  onHandleEnter() {
    if (this.selectedIdx > -1) {
      if (!this.historyList.length) {
        // filteredList
        this.query = !this.isType(this.filteredList[this.selectedIdx])
          ? this.filteredList[this.selectedIdx][this.searchKeyword]
          : this.filteredList[this.selectedIdx];
        this.select(this.filteredList[this.selectedIdx]);
      } else {
        this.query = !this.isType(this.historyList[this.selectedIdx])
          ? this.historyList[this.selectedIdx][this.searchKeyword]
          : this.historyList[this.selectedIdx];
        this.select(this.historyList[this.selectedIdx]);
      }
    }
    this.handleClose();
  }

  onEsc() {
    this.searchInput.nativeElement.blur();
    this.handleClose();
  }

  onTab() {
    this.searchInput.nativeElement.blur();
    this.handleClose();
  }

  onDelete() {
    this.isOpen = true;
  }
}

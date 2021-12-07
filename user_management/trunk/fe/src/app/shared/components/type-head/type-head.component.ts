import {Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {NgbTypeahead} from '@ng-bootstrap/ng-bootstrap';
import {debounceTime, distinctUntilChanged, filter, map, switchMap, tap} from 'rxjs/operators';
import {merge, Observable, of, Subject} from 'rxjs';
import * as _ from 'lodash';

@Component({
  selector: 'app-type-head',
  templateUrl: './type-head.component.html',
  styleUrls: ['./type-head.component.scss']
})
export class TypeHeadComponent implements OnInit, OnChanges {

  click$ = new Subject<string>();
  focus$ = new Subject<string>();
  typeHeadFrm: FormGroup;
  searchKeyVal: string;
  disabled: string;

  @Input() displayList;
  @Input() searchKey;
  @Input() placeHolder;
  @Input() inputValue;
  @Input() compInstance;
  @Input() selectedData;
  @Input() searchDataFromAPI;
  @Input() isDisabled;
  @Input() required: boolean;
  @Input() searchData: (searchVal) => Observable<any>;
  @Output() selectedItem = new EventEmitter<any>();
  @ViewChild('instance', { static: true}) instance: NgbTypeahead;

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.typeHeadFrm = this.fb.group({
      selectedItem: [{}]
    });
    this.patchDefaultValue();
    this.disableControls();
  }

  ngOnChanges() {
    if (this.typeHeadFrm) {
      this.patchDefaultValue();
      this.disableControls();
    }
  }

  patchDefaultValue(): void {
    const tempObj = {
      [this.searchKey]: [this.inputValue]
    };
    const isObj = typeof this.inputValue === 'object';
    const val = isObj ? this.inputValue : tempObj;
    this.typeHeadFrm.patchValue({
      selectedItem: val
    });
    this.disabled = this.isDisabled;
  }

  onSelectItem(e) {
    const val = e.item ? e.item : e.target.value;
    this.selectedItem.emit(val);
  }

  // -- for typhead
  search = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(debounceTime(500), distinctUntilChanged(), tap(() => {
    }));
    const clicksWithClosedPopup$ = this.click$.pipe(filter(() => !this.instance.isPopupOpen()));
    // const inputFocus$ = this.focus$;
    return merge(debouncedText$, clicksWithClosedPopup$).pipe(
      distinctUntilChanged(),
      tap((e) => {
        this.selectedData = this.selectedData == null ? '' : this.selectedData;
        if (this.selectedData[this.searchKey] === e) {
          this.selectedItem.emit(this.selectedData);
        } else {
          this.selectedItem.emit(e);
        }
      }),
      switchMap(term => {
        if (this.searchDataFromAPI) { // if true then data return by server
          return this.searchData(term).pipe(
            map(result => result)
          );
        } else { // if false data return by local var or filter by local
          const data = term === '' ? _.filter(this.displayList, dl => dl).slice(0, 50) :
            _.filter(this.displayList, v => v[this.searchKey].toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 50);
          return of(data);
        }
      })
    );
  }

  formatter = (x) => x[this.searchKey];

  // -- disabled form controls
  disableControls(): void {
    if (this.isDisabled) {
      this.typeHeadFrm.controls.selectedItem.disable();
    } else {
      this.typeHeadFrm.controls.selectedItem.enable();
    }
  }

}

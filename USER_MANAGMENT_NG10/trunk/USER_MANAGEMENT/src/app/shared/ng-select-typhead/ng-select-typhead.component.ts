import { debounceTime, distinctUntilChanged, tap, switchMap, catchError, map, takeUntil } from 'rxjs/operators';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, OnChanges, AfterViewInit, ViewEncapsulation } from '@angular/core';
import * as _ from 'lodash';
import { Observable, Subject, concat, of } from 'rxjs';

@Component({
  selector: 'app-ng-select-typhead',
  templateUrl: './ng-select-typhead.component.html',
  styleUrls: ['./ng-select-typhead.component.scss'],
  // encapsulation: ViewEncapsulation.Emulated
})
export class NgSelectTypheadComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  isLoading = false;
  inputList: Observable<any[]>;
  searchInput$ = new Subject<string>();
  placeholder: string;
  bindLabel: string;
  bindKey: string;
  ngSelectFrm: FormGroup;
  destroy$: Subject<boolean> = new Subject<boolean>();

  @Input() private displayList: Array<any>; // -- received observable for list
  @Input() private inputValue; // --recieved selected value from parent comp
  @Input() private selectedValue;
  @Input() private thDisplayLabel: string; // --recieved display label name key for tH
  @Input() private thDisplayKey: string; // --recieved key for return id or any obj
  @Input() private source: string; // --recieved source
  @Input() private returnDataType: string;
  @Input() private isDisabled: boolean; // -- if true then disabled the input fields from form
  @Input() required: boolean;
  @Input() searchFun: (d, source) => Observable<any>;
  @Input() compInstance; // -- take instance of parent comp
  @Output() private recievedVal = new EventEmitter<any>(); // -- send event to parent comp
  @Input() isOffline: boolean;
  @Input() public searchable: boolean;

  constructor(private _fb: FormBuilder) { }

  ngOnInit() {
    this.placeholder = this.source;
    this.bindLabel = this.thDisplayLabel;
    this.bindKey = this.thDisplayKey;
    this.ngSelectFrm = this._fb.group({
      name: [null]
    });
    this.searchable = this.searchable == undefined ? true : this.searchable;
    this.patchValue();
    this.loadSearchData();
    this.disableControls();
  }

  ngOnChanges() {
    // this.bindLabel = this.thDisplayLabel;
    // this.bindKey = this.thDisplayKey;
    // this.inputList = concat(this.inputData);
    // this.inputList = this.searchFun(this.selectedValue);
    // this.loadSearchData();
    if (this.ngSelectFrm) {
      this.ngSelectFrm.patchValue({
        name: !this.inputValue ? null : this.inputValue.toString()
      });
      this.disableControls();
      this.loadSearchData();
    }
  }

  ngAfterViewInit() {}

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  loadSearchData() {

    // -- this will call when you want to search from local
    if (this.isOffline) {
      this.inputList = concat(of(this.displayList));
      this.searchInput$.pipe(
        switchMap(term => this.displayList)
      );
      return;
    }

    this.inputList = concat(
      this.searchFun(this.selectedValue, this.source).pipe(takeUntil(this.destroy$), tap(() => {
        this.ngSelectFrm.patchValue({
          name: !this.inputValue ? null : this.inputValue.toString()
        });
      })), // -- call to parent funct to fetch the data
      this.searchInput$.pipe(
        debounceTime(500),
        distinctUntilChanged(),
        tap(() => this.isLoading = true),
        switchMap(term => {
          return this.searchFun(term, this.source).pipe( // -- call to parent funct to fetch the data
            map(result => result),
            catchError(() => of([])), // empty list on error
            tap(() => {
              this.isLoading = false;
            })
          );
        })
      )
    );
  }

  // --patch default value came from parent component
  patchValue(): void {
    if (this.inputValue) {
      this.ngSelectFrm.patchValue({
        name: !this.inputValue ? null : this.inputValue
      });
    }
  }

  onSelect($event): void {
    if (this.returnDataType == 'obj') {
      this.recievedVal.emit($event);
    } else {
      this.recievedVal.emit(this.ngSelectFrm.value.name);
    }
  }

  disableControls() {
    if (this.isDisabled) {
      this.ngSelectFrm.controls.name.disable();
    } else {
      this.ngSelectFrm.controls.name.enable();
    }
  }

}

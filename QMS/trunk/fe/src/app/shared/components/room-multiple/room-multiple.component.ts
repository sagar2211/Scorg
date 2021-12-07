import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {concat, Observable, of, Subject} from 'rxjs';
import { Room } from 'src/app/modules/qms/models/room.model';
import { RoomMasterService } from 'src/app/modules/qms/services/room-master.service';
import {catchError, debounceTime, distinctUntilChanged, map, switchMap, takeUntil, tap} from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import * as _ from 'lodash';

@Component({
  selector: 'app-room-multiple',
  templateUrl: './room-multiple.component.html',
  styleUrls: ['./room-multiple.component.scss']
})
export class RoomMultipleComponent implements OnInit, OnChanges {
  @Output() selectedRoomList = new EventEmitter<any>();
  @Input() disableRoom;
  @Input() setRoomList;
  @Input() isValChanged;

  loadForm: boolean;
  roomListForm: FormGroup;
  compInstance = this;
  roomsList: Room[] = [];
  searchString = '';
  subject: Subject<string> = new Subject();
  ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  roomsListSub$: Observable<any[]>;
  constructor(
    private fb: FormBuilder,
    private roomMasterService: RoomMasterService,
  ) { }

  ngOnInit() {
    this.loadForm = false;
    // this.getAllRoomList().subscribe(res => {
    //   this.generateDataForForm();
    // });
    this.generateDataForForm();
    this.loadRoomList();
  }

  ngOnChanges() {
    this.generateDataForForm();
  }

  generateDataForForm() {
    if (!this.loadForm) {
      this.createForm();
    } else {
      this.updateValue();
    }

  }

  createForm() {
    this.patchDefaultValue();
  }

  patchDefaultValue() {
    const form = {
      roomVal: [[]],
    };
    this.roomListForm = this.fb.group(form);
    this.loadForm = true;
    this.updateValue();
  }

  updateValue() {
    // if (!_.isEmpty(this.setRoomList)) {
      this.roomListForm.patchValue({ roomVal: this.setRoomList });
    // }
      if (this.disableRoom) {
      this.roomListForm.get('roomVal').disable();
    } else {
      this.roomListForm.get('roomVal').enable();
    }
  }

  getAllRoomList(searchKey?): Observable<any> {
    console.log(this.roomListForm.value.roomVal);
    const params = {
      limit: environment.limitDataToGetFromServer,
      search_text: searchKey ? searchKey : null,
    };
    return this.compInstance.roomMasterService.getAllRoomMaster(params).pipe(map(res => {
      this.roomsList = [];
      if (res.length > 0) {
        this.roomsList = res;
      }
      return this.roomsList;
    }));
  }

  getSelectedRoomValues() {
    this.selectedRoomList.emit(this.roomListForm.value);
  }

  private loadRoomList() {
    this.roomsListSub$ = concat(
      this.getAllRoomList(), // default items
      this.subject.pipe(
        distinctUntilChanged(),
        switchMap(term => {
          const params = {
            limit: environment.limitDataToGetFromServer,
            search_text: term ? term : null,
          };
          return this.roomMasterService.getAllRoomMaster(params).pipe(
            map(result => {
              this.roomsList = result;
              this.generateDataForForm();
              return result;
            })
        );
        })
      )
    );
  }
}

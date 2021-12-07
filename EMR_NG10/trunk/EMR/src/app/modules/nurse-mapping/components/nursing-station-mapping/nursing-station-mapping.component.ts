import { Component, OnInit } from '@angular/core';
import { Observable, Subject, concat, of } from 'rxjs';
import { MappingService } from 'src/app/public/services/mapping.service';
import { distinctUntilChanged, switchMap, catchError, tap, debounceTime, takeUntil } from 'rxjs/operators';
import { EMRService } from 'src/app/public/services/emr-service';
import * as _ from 'lodash';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { IAlert } from 'src/app/public/models/AlertMessage';
import { CommonService } from 'src/app/public/services/common.service';
import { ActivatedRoute } from '@angular/router';
import { Constants } from 'src/app/config/constants';

@Component({
  selector: 'app-nursing-station-mapping',
  templateUrl: './nursing-station-mapping.component.html',
  styleUrls: ['./nursing-station-mapping.component.scss'],
  providers: [EMRService]
})
export class NursingStationMappingComponent implements OnInit {

  filterObj = {
    level1: null,
    level1Data: null,
    level1Config: null,
    level2: null,
    level2Data: null,
    level2Config: null,
    level3: null,
    level3Data: null,
    level3Config: null,
  }

  showNotMappedNurseOnly: boolean;

  level1list$ = new Observable<any>();
  level1Input$ = new Subject<any>();

  level2list$ = new Observable<any>();
  level2Input$ = new Subject<any>();

  level3list$ = new Observable<any>();
  level3Input$ = new Subject<any>();

  nurseStationList$ = new Observable<any>();
  nurseStationInput$ = new Subject<string>();
  allNurseList = [];
  allNurseListClone = [];
  compInstance = this;
  selectedNurseList = [];
  selectedNurseListClone = [];
  selectedNurseStation = null;
  nurseSearch = null;
  nurseSearchDest = null;
  setAlertMessage: IAlert;
  $destroy: Subject<boolean> = new Subject();
  subject: Subject<string> = new Subject();
  ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  constructor(
    private mappingServ: MappingService,
    private emrServices: EMRService,
    private commonService: CommonService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.selectedNurseStation = null;
    this.showNotMappedNurseOnly = false;
    this.mappingServ.levelParentId = 0;
    this.mappingServ.wardId = 0;
    this.getNursingStationList();
    this.commonService.routeChanged(this.route);
    this.getLevel1Data();
    this.subjectFun();
  }

  ngOnDestroy(): void {
    this.$destroy.next(true);
    this.$destroy.unsubscribe();
  }


  subjectFun() {
    this.subject
      .pipe(debounceTime(500), takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.getuserList(4, 'nurse', this.nurseSearch);
      });
  }

  getNursingStationList(searchTxt?) {
    this.nurseStationList$ = concat(
      this.mappingServ.getNursingStationListTypeHead(searchTxt ? searchTxt : ''),
      this.nurseStationInput$.pipe(
        distinctUntilChanged(),
        switchMap(term => this.mappingServ.getNursingStationListTypeHead(term ? term : (searchTxt ? searchTxt : '')).pipe(
          catchError(() => of([]))
        ))
      )
    );
  }

  getLevel1Data(searchTxt?) {
    this.level1list$ = concat(
      this.mappingServ.getLevelData(searchTxt ? searchTxt : ''),
      this.level1Input$.pipe(
        distinctUntilChanged(),
        debounceTime(500),
        switchMap(term => this.mappingServ.getLevelData(term ? term : (searchTxt ? searchTxt : '')).pipe(
          catchError(() => of([]))
        ))
      )
    );
  }

  getLevel2Data(searchTxt?) {
    this.level2list$ = concat(
      this.mappingServ.getLevelData(searchTxt ? searchTxt : ''),
      this.level2Input$.pipe(
        distinctUntilChanged(),
        debounceTime(500),
        switchMap(term => this.mappingServ.getLevelData(term ? term : (searchTxt ? searchTxt : '')).pipe(
          catchError(() => of([]))
        ))
      )
    );
  }

  getLevel3Data(searchTxt?) {
    this.level3list$ = concat(
      this.mappingServ.getLevelData(searchTxt ? searchTxt : ''),
      this.level3Input$.pipe(
        distinctUntilChanged(),
        debounceTime(500),
        switchMap(term => this.mappingServ.getLevelData(term ? term : (searchTxt ? searchTxt : '')).pipe(
          catchError(() => of([]))
        ))
      )
    );
  }

  getuserList(roleTypeId, key?, searchString?) {
    if (this.showNotMappedNurseOnly) {
      const reqParam = {
        search_keyword: searchString,
        dept_id: 0,
        speciality_id: 0,
        designation_id: key === 'rmo' ? 4 : 0,
        role_type_id: roleTypeId,
        limit: 50
      };
      return this.emrServices.getUsersList(reqParam).subscribe(res => {
        const userArrayList = [];
        _.map(res, (o) => {
          const obj = {
            id: o.user_id,
            name: o.user_name,
            isChecked: false
          };
          userArrayList.push(obj);
        });
        this.allNurseListClone = [...userArrayList];
        this.updateList();
        return userArrayList;
      });
    } else {
      return this.mappingServ.getNonMappedNurseList(this.nurseSearch).subscribe(res => {
        const userArrayList = [];
        _.map(res, (o) => {
          const obj = {
            id: o.user_id,
            name: o.user_name,
            isChecked: false
          };
          userArrayList.push(obj);
        });
        this.allNurseListClone = [...userArrayList];
        this.updateList();
        return userArrayList;
      });
    }
  }

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex);
    }
    this.updateList();
  }

  updateList() {
    this.allNurseList = [];
    const ids = _.map(this.selectedNurseList, d => {
      if (_.isUndefined(d.isCheckedInDestination)) {
        d.isCheckedInDestination = false;
      }
      return d.id;
    });
    this.selectedNurseListClone = [...this.selectedNurseList];
    if (ids.length > 0) {
      this.allNurseList = _.filter(this.allNurseListClone, d => {
        d.isChecked = false;
        const val = !_.includes(ids, d.id);
        return val;
      });
    } else {
      this.allNurseList = [...this.allNurseListClone];
    }
  }

  deleteComponent(item) {
    const copyItemObj = { ...item };
    const index = this.selectedNurseList.findIndex(s => s.id === item.id && s.name === item.name);
    if (index !== -1) {
      this.selectedNurseList.splice(index, 1);
    }
    this.updateList();
  }

  selectNurseStationValue(val) {
    if (val) {
      this.getuserList(4, 'nurse', this.nurseSearch);
      const param = {
        nursingStationId: val.id
      }
      this.mappingServ.getNurseListByStationId(param).subscribe(res => {
        if (res.length > 0) {
          this.selectedNurseList = _.map(res, r => {
            return { id: r.nurseId, name: r.nurseName, isCheckedInDestination: false };
          });
        } else {
          this.selectedNurseList = [];
        }
      });
    } else {
      this.selectedNurseList = [];
      this.nurseSearch = null;
      this.getuserList(4, 'nurse', this.nurseSearch);
    }
    this.selectedNurseListClone = [...this.selectedNurseList];
  }

  saveMappingVal() {
    if (this.selectedNurseList.length > 0) {
      const param = {
        nursingStationId: this.selectedNurseStation.id,
        nurseId: _.map(this.selectedNurseList, d => {
          return d.id;
        })
      }
      this.mappingServ.mapNurseToNursingStation(param).subscribe(res => {
        if (res) {
          this.notifyAlertMessage({
            msg: 'Updated Successfully!',
            class: 'success',
          });
          this.selectedNurseStation = null;
          this.selectNurseStationValue(null);
        } else {
          this.notifyAlertMessage({
            msg: 'Something Went Wrong',
            class: 'danger',
          });
        }
      });
    } else {
      this.notifyAlertMessage({
        msg: 'Please Add Nurse',
        class: 'danger',
      });
    }
  }

  notifyAlertMessage(data): void {
    this.setAlertMessage = {
      message: data.msg,
      messageType: data.class,
      duration: Constants.ALERT_DURATION
    };
  }

  onLevelChange(val, lvl) {
    if (val) {
      this.filterObj['level' + lvl + 'Data'] = val;
      this.filterObj['level' + lvl] = val.levelDataId;
    } else {
      this.filterObj['level' + lvl + 'Data'] = null;
      this.filterObj['level' + lvl] = null;
    }
    this.updateLevelParentId(val, lvl);
  }

  updateLevelParentId(val, lvl) {
    this.mappingServ.wardId = 0;
    if (val) {
      this.mappingServ.levelParentId = val.levelDataId;
    }
    for (let i = (+lvl + 1); i <= 3; i++) {
      this.filterObj['level' + i + 'Data'] = null;
      this.filterObj['level' + i] = null;
    }
    if (lvl === 1 && val) {
      this.mappingServ.levelParentId = this.filterObj.level1Data.levelDataId;
      this.getLevel2Data();
    } else if (lvl === 2 && val) {
      this.mappingServ.levelParentId = this.filterObj.level2Data.levelDataId;
      this.getLevel3Data();
    } else if (lvl === 3 && val) {
      this.mappingServ.wardId = this.filterObj.level2Data.levelDataId;
      this.getNursingStationList();
    } else if (lvl === 1 && !val) {
      this.mappingServ.levelParentId = 0;
      this.getLevel1Data();
    } else if (lvl === 2 && !val) {
      this.mappingServ.levelParentId = this.filterObj.level1Data.levelDataId;
      this.getLevel2Data();
    } else if (lvl === 3 && !val) {
      this.mappingServ.levelParentId = this.filterObj.level2Data.levelDataId;
      this.getLevel3Data();
    }
  }

  moveSelectedFromSourceToDestination() {
    const checkedNurseList = _.filter(this.allNurseList, d => {
      return d.isChecked === true;
    });
    _.map(checkedNurseList, d => {
      this.selectedNurseList.push(d);
    });
    this.updateList();
  }

  moveSelectedFromDestinationToSource() {
    const ary = [..._.filter(this.selectedNurseList, d => {
      return d.isCheckedInDestination === true;
    })];
    this.selectedNurseList = [...ary];
    this.selectedNurseListClone = [...ary];
    this.updateList();
  }

  updateDestinationListArray() {
    if (this.nurseSearchDest) {
      this.selectedNurseList = _.filter(this.selectedNurseListClone, d => {
        return d.name.toLowerCase().indexOf(this.nurseSearchDest.toLowerCase()) !== -1;
      });
    } else {
      this.selectedNurseList = [...this.selectedNurseListClone];
    }

  }

}

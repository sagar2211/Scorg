import { Component, OnInit, ViewChild } from '@angular/core';
import { DxDataGridComponent } from 'devextreme-angular';
import CustomStore from 'devextreme/data/custom_store';
import * as _ from 'lodash';
import { promise } from 'protractor';
import { CommonService } from 'src/app/public/services/common.service';

@Component({
  selector: 'app-doctor-share-policy',
  templateUrl: './doctor-share-policy.component.html',
  styleUrls: ['./doctor-share-policy.component.scss']
})
export class DoctorSharePolicyComponent implements OnInit {
  @ViewChild(DxDataGridComponent, { static: false }) public dataGrid: DxDataGridComponent;
  settingVal = null;
  editorOptions: object;
  allowEditingSale = false;
  allMode: string;
  checkBoxesMode: string;
  selectedUserList = []
  itemMasterDataSource: any;
  allowEditing = true;

  constructor(
    private commonService: CommonService
  ) {
    this.allMode = 'page';
    this.checkBoxesMode = 'onClick';
    this.getItemMasterDataSource();
    this.editorOptions = {
      itemTemplate: "itemTemplate"
    }
    this.onEditorPreparing = this.onEditorPreparing.bind(this);
    this.onDelete = this.onDelete.bind(this);
    this.onAddNewItem = this.onAddNewItem.bind(this);
    this.isAddIconVisible = this.isAddIconVisible.bind(this);
  }

  ngOnInit(): void {
    this.patchDefaultValue();
  }

  onDelete(e) {
    let rowIndex = e.row.rowIndex;
  }

  onAddNewItem(e) {
    let rowIndex = e.row.rowIndex;
  }

  isAddIconVisible(e) {
    // return e.row.rowIndex === this.itemList.length - 1;
  }

  patchDefaultValue() {
    const obj = {
      tempId: Math.random(),
      user: null,
      speciality: null,
      sharePer: 0
    }
    this.selectedUserList.push(obj);
  }

  initDataGrid(index?) {
    setTimeout(() => {
      this.dataGrid.instance.editCell(index ? index : 0, 'user');
    }, 500);
  }


  getItemMasterDataSource() {
    let compObj = this;
    this.itemMasterDataSource = new CustomStore({
      key: "itemName",
      load: function (loadOptions: any) {
        return compObj.getUserListPromise(compObj, loadOptions.searchValue).then((result) => {
          return result;
        });
      },
      byKey: (key) => {
        return compObj.getUserListPromise(compObj, key).then((result) => {
          return result;
        });
      }
    });
  }

  getUserListPromise(compObj, searchValue) {
    const promise = new Promise((resolve, reject) => {
      const reqParam = {
        search_keyword: searchValue,
        dept_id: 0,
        speciality_id: 0,
        designation_id: 0,
        role_type_id: 3,
        limit: 50
      };
      return compObj.commonService.getUsersList(reqParam).subscribe(res => {
        const userArrayList = [];
        _.map(res, (o) => {
          const obj = {
            id: o.user_id,
            name: o.user_name,
            isChecked: false
          };
          userArrayList.push(obj);
        });
        resolve(userArrayList);
      });
    });
    return promise;
  }


  onEditorPreparing(evt: any): void {
    if (evt.row && evt.row.data) {
      evt.editorOptions.onValueChanged = (e: any) => {
        const selectedIndex = evt.row.rowIndex;
        let rowObj = this.selectedUserList[evt.row.rowIndex];
        if (evt.dataField == 'user') {
          const user = _.find(this.selectedUserList, (d, i) => {
            return d.user && i !== selectedIndex && d.user.id === rowObj.id;
          });
          if (user) {
            // this.clearCurrentItemRow(evt.row.rowIndex);
          } else {
            this.selectedUserList[evt.row.rowIndex].user = _.cloneDeep(e.value);
            this.dataGrid.instance.editCell(evt.row.rowIndex, 'qty');
          }
        } else if (evt.dataField == 'sharePer') {
          this.selectedUserList[evt.row.rowIndex].sharePer = _.cloneDeep(e.value);
          this.patchDefaultValue();
          this.dataGrid.instance.editCell(evt.row.rowIndex + 1, 'user');
        }
      }
    }
  }


}

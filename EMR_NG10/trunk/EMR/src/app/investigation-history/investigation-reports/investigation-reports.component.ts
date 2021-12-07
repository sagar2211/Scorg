import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonService } from 'src/app/public/services/common.service';
import { HistoryService } from 'src/app/history/history.service';
import * as _ from 'lodash';
import * as moment from 'moment';
import { ConsultationHistoryService } from 'src/app/public/services/consultation-history.service';
import { TreeComponent, ITreeOptions, TreeNode } from 'angular-tree-component';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { InvestigationReportHistoryFilterComponent } from '../investigation-report-history-filter/investigation-report-history-filter.component';

@Component({
  selector: 'app-investigation-reports',
  templateUrl: './investigation-reports.component.html',
  styleUrls: ['./investigation-reports.component.scss']
})
export class InvestigationReportsComponent implements OnInit {
  @ViewChild('tree', { static: false }) tree: TreeComponent;
  patientObj: any;
  patientId: any;
  loadTree: boolean;
  selectedHashId: any;
  selectedItem: any;
  nodes = [];
  options: ITreeOptions = {
    getChildren: (node: TreeNode) => {
      return this.getPatientDateDataOnExpand(node);
    },
  };
  filterText: any;
  filterData: any;
  documentPath: any;
  documentPathId: any;
  documentName: any;
  documentPathCompare: any;
  documentPathIdCompare: any;
  apiData: any;
  documentNameCompare: any;
  isNextEnable: boolean;
  isPrevEnable: boolean;
  isCompareEnable: boolean;
  currentActivePageNumber: number;
  treeShow = true;
  documentZoom = 1;
  documentCompareZoom = 1;
  constructor(
    private historyService: HistoryService,
    private consultationHistoryService: ConsultationHistoryService,
    private commonService: CommonService,
    private modalService: NgbModal,
  ) { }

  ngOnInit(): void {
    this.loadTree = false;
    this.isCompareEnable = false;
    this.isNextEnable = false;
    this.isPrevEnable = true;
    this.filterData = null;
    this.selectedHashId = null;
    this.currentActivePageNumber = 1;
    this.getpatientData();
    this.getPatientDateDataOnExpand().subscribe(res => {
      // console.log(res);
    });
  }

  getPatientDateDataOnExpand(obj?, type?): Observable<any> {
    const param = {
      searchKeyword: this.filterText ? this.filterText : null,
      patientId: this.patientId,
      fromDate: obj && obj.fromDate > 0 ? obj.fromDate : null,
      toDate: obj && obj.toDate > 0 ? obj.toDate : null,
      visitTypes: obj && obj.visitTypes.length > 0 ? obj.visitTypes : [],
      serviceIds: obj && obj.visitTypes.length > 0 ? obj.visitTypes : [],
      pageNumber: this.currentActivePageNumber,
      limit: 10,
    };
    return this.historyService.getInvestigationReportList(param).pipe(map((res: any) => {
      this.apiData = _.cloneDeep(res.data);
      if (res.data.length === 0) {
        return;
      }
      const listArray = [];
      const serviceTypeWiseList = _.groupBy(res.data, 'serviceType');
      _.map(serviceTypeWiseList, (data, index) => {
        const dateWiseList = _.groupBy(data, dt => {
          return new Date(moment(dt.visitDate).format('YYYY/MM/DD'))
        });
        const dataArry = [];
        _.map(dateWiseList, (dt, i) => {
          const odrDataList = [];
          _.map(dt, od => {
            odrDataList.push(od.orderData);
          });
          const dateObj = {
            date: i,
            data: odrDataList
          }
          dataArry.push(dateObj);
        });
        const obj = {
          serviceTypeName: index,
          serviceTypeId: data[0].serviceTypeId,
          dateData: dataArry
        }
        listArray.push(obj);
      })
      // console.log(listArray);
      this.nodes = [];
      this.isNextEnable = false;
      this.isPrevEnable = false;
      if (listArray.length > 0) {
        if (this.currentActivePageNumber > 1) {
          this.isPrevEnable = true;
        }
        const totalPages = this.apiData.total_records / 10;
        if (totalPages > this.currentActivePageNumber) {
          this.isNextEnable = true;
        }
        this.nodes = this.consultationHistoryService.generateInvestigationHistoryTree(listArray);
        this.selectedItem = this.nodes.length > 0 ?
          (this.nodes[0].children.length > 0 ?
            (this.nodes[0].children[0].children.length > 0 ?
              (this.nodes[0].children[0].children[0].children.length > 0 ?
                (this.nodes[0].children[0].children[0].children[0]) : null) : null) : null) : null;
        const nodeData = this.nodes.length > 0 ?
          (this.nodes[0].children.length > 0 ?
            (this.nodes[0].children[0].children.length > 0 ?
              this.nodes[0].children[0].children : null) : null) : null;
        this.selectedHashId = this.selectedItem.value.hashId;
        this.getSelectedTreeData(nodeData);
        this.loadTree = true;
      }
      return this.nodes;
    }));
  }

  onEvent(event, type) {
    if (type === 'activate' && event.node.data.value.type === 'node_4') {
      this.selectedItem = event.node.data;
      let parentNode = null;
      if (event.node.parent.data.value.type === 'node_2') {
        parentNode = this.nodes[event.node.parent.parent.index].children[event.node.parent.index].children;
      } else if (event.node.parent.data.value.type === 'node_3') {
        parentNode = this.nodes[event.node.parent.parent.parent.index].children[event.node.parent.parent.index].children;
      }
      this.selectedHashId = this.selectedItem.value.hashId;
      this.getSelectedTreeData(parentNode);
    }
    if (type === 'activate' && event.node.data.value.type === 'node_1') {
      _.map(this.tree.treeModel.expandedNodes, nd => {
        if (nd.id !== event.node.id) {
          nd.collapse();
        }
      });
      event.node.expand();
      if (event.node.children.length > 0) {
        event.node.children[0].expand();
        if (event.node.children[0].children && event.node.children[0].children.length > 0) {
          if (event.node.children[0].children[0].children && event.node.children[0].children[0].children.length > 0) {
            event.node.children[0].children[0].expand();
            this.selectedItem = event.node.children[0].children[0].children[0].data;
            this.selectedHashId = this.selectedItem.value.hashId;
            this.getSelectedTreeData(event.node.children[0].data.children);
          }
          if (event.node.children[0].children[0].children === undefined) {
            this.selectedItem = event.node.children[0].children[0].data;
            this.selectedHashId = this.selectedItem.value.hashId;
            this.getSelectedTreeData(event.node.children[0].data.children);
          }
        } else if (event.node.children[0].children === undefined) {
          this.selectedItem = event.node.children[0].children;
          this.selectedHashId = this.selectedItem.value.hashId;
          this.getSelectedTreeData(event.node.children[0]);
        }
      }
    }
    if (event.node.data.value.type === 'node_2' && type === 'activate') {
      if (event.node.children && event.node.children.length > 0) {
        if (event.node.children[0].children) {
          event.node.expand();
          if (event.node.children[0].children && event.node.children[0].children.length > 0) {
            event.node.children[0].children[0].expand();
          } else if (event.node.children[0].children && event.node.children[0].children.length > 0) {

          }
        } else if (event.node.children[0].children === undefined) {
          event.node.children[0].expand();
        }
      } else if (event.node.children === undefined) {
        event.node.expand();
      }
    }
    if (event.node.data.value.type === 'node_3' && type === 'activate') {
      if (event.node.children && event.node.children.length > 0) {
        if (event.node.children[0].children) {
          event.node.expand();
          if (event.node.children[0].children && event.node.children[0].children.length > 0) {
            event.node.children[0].children[0].expand();
          } else if (event.node.children[0].children && event.node.children[0].children.length > 0) {

          }
        } else if (event.node.children[0].children === undefined) {
          event.node.children[0].expand();
        }
      } else if (event.node.children === undefined) {
        event.node.expand();
      }
    }
  }

  onSearchTree() {
    this.getPatientDateDataOnExpand().subscribe(res => {
      // document.querySelector('#' + this.selectedHashId).scrollIntoView();
    });
  }

  getSelectedTreeData(nodeData?) {
    if (this.isCompareEnable) {
      if (!this.documentPath && this.documentPathIdCompare !== this.selectedItem.value.hashId) {
        this.documentName = this.selectedItem.value.data.serviceName;
        this.documentPath = this.selectedItem.value.data.reportUrl;
        this.documentPathId = this.selectedItem.value.hashId;
      } else if (this.selectedItem.value.hashId !== this.documentPathId) {
        this.documentNameCompare = this.selectedItem.value.data.serviceName;
        this.documentPathCompare = this.selectedItem.value.data.reportUrl;
        this.documentPathIdCompare = this.selectedItem.value.hashId;
      }
    } else {
      this.documentName = this.selectedItem.value.data.serviceName;
      this.documentPath = this.selectedItem.value.data.reportUrl;
      this.documentPathId = this.selectedItem.value.hashId;
    }
  }

  getFilterValue() {
    const obj = {
      docType: [],
      fromDate: null,
      toDate: null,
      visitTypes: []
    };
    if (this.filterData) {
      if (this.filterData.serviceType.length > 0) {
        _.map(this.filterData.serviceType, dt => {
          obj.visitTypes.push(dt.id);
        });
      }
      if (this.filterData.startDate) {
        obj.fromDate = this.filterData.startDate;
      }
      if (this.filterData.endDate) {
        obj.toDate = this.filterData.endDate;
      }
    }
    return obj;
  }

  openFilterPopup() {
    const messageDetails = {
      modalTitle: 'Filter',
      patientObj: this.patientObj,
      type: 'visit'
    };
    const modalInstance = this.modalService.open(InvestigationReportHistoryFilterComponent, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      size: 'xl',
      windowClass: 'visit-modal',
      container: '#homeComponent'
    });
    modalInstance.result.then((result) => {
      if (result === 'Ok') {
        this.filterData = this.historyService.getPatientHistoryFilter(this.patientId);
        const obj = this.getFilterValue();
        this.getPatientDateDataOnExpand(obj).subscribe(res => { });
      }
    });
    modalInstance.componentInstance.messageDetails = messageDetails;
  }

  removeFileForCompare(type) {
    if (type === 'main') {
      this.documentName = null;
      this.documentPath = null;
      this.documentPathId = null;
    } else {
      this.documentNameCompare = null;
      this.documentPathCompare = null;
      this.documentPathIdCompare = null;
    }
  }

  getpatientData(patient?) {
    if (patient) {
      this.patientObj = patient;
    } else {
      this.patientObj = this.commonService.getLastActivePatient();
    }
    this.patientId = this.patientObj.patientData.id;
  }

  compareFiles() {
    this.isCompareEnable = !this.isCompareEnable;
    if (!this.isCompareEnable) {
      this.documentNameCompare = null;
      this.documentPathCompare = null;
      this.documentPathIdCompare = null;
      this.treeShow = true;
    } else {
      this.treeShow = false;
      this.tree.treeModel.expandAll();
    }
  }

  getNextPrevTreeData(type) {
    const obj = this.getFilterValue();
    if (type === 'next') {
      this.currentActivePageNumber = this.currentActivePageNumber + 1;
      this.getPatientDateDataOnExpand(obj, type).subscribe(res => {
        // document.querySelector('#' + this.selectedHashId).scrollIntoView();
      });
    } else {
      this.currentActivePageNumber = this.currentActivePageNumber - 1;
      this.getPatientDateDataOnExpand(obj, type).subscribe(res => {
        // document.querySelector('#' + this.selectedHashId).scrollIntoView();
      });
    }
  }

  showHideTree() {
    this.treeShow = !this.treeShow;
  }

  zoomInOut(type, from) {
    if (from === 'com1') {
      if (type === 'plus') {
        this.documentZoom = this.documentZoom + 0.1;
      } else {
        this.documentZoom = this.documentZoom - 0.1;
        this.documentZoom = this.documentZoom < 1 ? 1 : this.documentZoom;
      }
    } else {
      if (type === 'plus') {
        this.documentCompareZoom = this.documentCompareZoom + 0.1;
      } else {
        this.documentCompareZoom = this.documentCompareZoom - 0.1;
        this.documentCompareZoom = this.documentCompareZoom < 1 ? 1 : this.documentCompareZoom;
      }
    }

  }

}

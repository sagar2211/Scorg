import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { CommonService } from './../../../public/services/common.service';
import { Observable, of } from 'rxjs';
import { ConsultationHistoryService } from './../../../public/services/consultation-history.service';
import { map } from 'rxjs/operators';
import * as _ from 'lodash';
import { TreeNode, ITreeOptions, TreeComponent, TreeModel } from 'angular-tree-component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HistoryService } from '../../history.service';
import { PatientHistoryFilterComponent } from '../patient-history-filter/patient-history-filter.component';

@Component({
  selector: 'app-left-tree',
  templateUrl: './left-tree.component.html',
  styleUrls: ['./left-tree.component.scss']
})
export class LeftTreeComponent implements OnInit {

  @Output() selectedFilter = new EventEmitter<any>();
  @Output() secSelected = new EventEmitter<any>();
  @ViewChild('tree', { static: false }) tree: TreeComponent;
  patientId: string;
  patientObj: any;
  filterText: any;
  filterData: any;
  selectedItem: any;
  apiData: any;
  selectedHashId: any;
  isNextEnable: boolean;
  isPrevEnable: boolean;
  loadTree: boolean;

  nodes = [];
  options: ITreeOptions = {
    getChildren: (node: TreeNode) => {
      return this.getPatientDateDataOnExpand(node);
    },
  };

  constructor(
    private commonService: CommonService,
    private consultationHistoryService: ConsultationHistoryService,
    private modalService: NgbModal,
    private historyService: HistoryService,
  ) { }

  ngOnInit() {
    this.loadTree = false;
    this.isNextEnable = false;
    this.isPrevEnable = false;
    this.filterData = null;
    this.selectedHashId = null;
    this.getpatientData();
    this.getPatientTreeNodeData().subscribe(res => {
      // document.querySelector('#' + this.selectedHashId).scrollIntoView();
    });
  }

  getpatientData(patient?) {
    this.patientObj = null;
    if (patient) {
      this.patientObj = patient;
    } else {
      this.patientObj = this.commonService.getLastActivePatient();
    }
    this.patientId = this.patientObj.patientData.id;
  }

  getPatientTreeNodeData(obj?, type?): Observable<any> {
    const param = {
      patientId: this.patientId,
      searchKeyword: this.filterText ? this.filterText : null,
      docTypes: obj && obj.docType.length > 0 ? obj.docType : [],
      fromDate: obj && obj.fromDate > 0 ? obj.fromDate : null,
      toDate: obj && obj.toDate > 0 ? obj.toDate : null,
      visitTypes: obj && obj.visitTypes.length > 0 ? obj.visitTypes : [],
      CurrentVisits: obj && obj.CurrentVisits.length ? obj.CurrentVisits : [],
      showOldVisits: obj && !_.isUndefined(obj.showOldVisits) ? obj.showOldVisits : true,
      limit: 10,
    };
    return this.consultationHistoryService.getPatientVisitHistoryTreeNode(param).pipe(map((res: any) => {
      this.apiData = res;
      this.nodes = this.consultationHistoryService.generateTreeParentNode(res.data);
      this.selectedItem = this.nodes.length > 0 ?
        (this.nodes[0].children.length > 0 ?
          (this.nodes[0].children[0].children.length > 0 ?
            (this.nodes[0].children[0].children[0].children.length > 0 ?
              (this.nodes[0].children[0].children[0].children[0]) : this.nodes[0].children[0].children[0]) :
               this.nodes[0].children[0]) : null) : null;
      const nodeData = this.nodes.length > 0 ?
        (this.nodes[0].children.length > 0 ?
          (this.nodes[0].children[0].children.length > 0 ?
            this.nodes[0].children[0].children : null) : null) : null;
      this.selectedHashId = this.selectedItem.value.hashId;
      this.getSelectedTreeData(nodeData);
      this.loadTree = true;
      if ((type && type === 'next') && !_.isUndefined(obj)) {
        this.isNextEnable = this.apiData.isMoreVisits;
        this.isPrevEnable = true;
      }
      if ((type && type === 'prev') && !_.isUndefined(obj)) {
        this.isPrevEnable = this.apiData.isMoreVisits;
        this.isNextEnable = true;
      }
      return true;
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
  }

  getPatientDateDataOnExpand(event): Promise<any> {
    const filterData = this.getFilterValue();
    const item = event.data;
    const param = {
      patientId: this.patientId,
      serviceTypeId: item.value.serviceType,
      visitNo: item.value.visitNo,
      searchKeyword: this.filterText ? this.filterText : null,
      docTypes: filterData.docType.length > 0 ? filterData.docType : []
    };
    const promise = new Promise((resolve, reject) => {
      this.consultationHistoryService.getPatientVisitTreeData(param).subscribe(res => {
        const childNodeData = this.updateNodeData(res, event);
        if (childNodeData.length > 0 && childNodeData[0].value.type === 'node_4') {
          this.selectedItem = childNodeData[0];
          this.selectedHashId = this.selectedItem.value.hashId;
          this.getSelectedTreeData(childNodeData);
        }
        if (childNodeData.length > 0 && childNodeData[0].value.type === 'node_3') {
          this.selectedItem = childNodeData[0].children[0];
          this.selectedHashId = this.selectedItem.value.hashId;
          this.getSelectedTreeData(childNodeData);
        }
        resolve(childNodeData);
      });
    });
    return promise;
  }

  updateNodeData(res, event) {
    if (event.data.value.type === 'node_2') {
      const nodeAry = [];
      const item = event.data;
      _.map(res, (ct, mi) => {
        if (ct.isHideCategory) {
          _.map(ct.documentData, (doc, indx) => {
            const treChildDocObj = {
              name: doc.documentName,
              id: 'node_' + event.parent.index + '_' + event.index + '_' + mi + '_' + indx,
              value: {
                type: 'node_4',
                data: doc,
                serviceType: item.value.serviceType,
                dateTime: item.value.dateTime,
                visitNo: item.value.visitNo,
                hashId: 'tree' + '_right_' + item.value.serviceType + '_' + doc.documentType + '_' + item.value.visitNo + '_' + doc.emrReferenceId
              },
            };
            nodeAry.push(treChildDocObj);
          });
        } else {
          const treChildCategoryObj = {
            name: ct.categoryName,
            id: 'node_' + event.parent.index + '_' + event.index + '_' + mi,
            value: {
              type: 'node_3',
              data: ct,
              serviceType: item.value.serviceType,
              dateTime: item.value.dateTime,
              visitNo: item.value.visitNo,
            },
            children: [],
            isExpanded: mi === 0 ? true : false,
            hasChildren: true,
            isCollapsed: mi !== 0 ? true : false,
          };
          _.map(ct.documentData, (doc, indx) => {
            const treChildDocObj = {
              name: doc.documentName,
              id: 'node_' + event.parent.index + '_' + event.index + '_' + mi + '_' + indx,
              value: {
                type: 'node_4',
                data: doc,
                serviceType: item.value.serviceType,
                dateTime: item.value.dateTime,
                visitNo: item.value.visitNo,
                hashId: 'tree' + '_right_' + item.value.serviceType + '_' + doc.documentType + '_' + item.value.visitNo + '_' + doc.emrReferenceId
              },
            };
            treChildCategoryObj.children.push(treChildDocObj);
          });
          nodeAry.push(treChildCategoryObj);
        }
      });
      return nodeAry;
    }
  }

  getFilterValue() {
    const obj = {
      docType: [],
      fromDate: null,
      toDate: null,
      visitTypes: [],
      CurrentVisits: [],
      showOldVisits: true
    };
    if (this.filterData) {
      if (this.filterData.docType.length > 0) {
        _.map(this.filterData.docType, dt => {
          const dtObj = {
            docType: dt.key,
            docTypeId: dt.id
          };
          obj.docType.push(dtObj);
        });
      }
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

  getSelectedTreeData(nodeData?) {
    this.secSelected.emit(this.selectedItem);
    this.selectedFilter.emit(nodeData);
  }

  onSearchTree() {
    this.getPatientTreeNodeData().subscribe(res => {
      // document.querySelector('#' + this.selectedHashId).scrollIntoView();
    });
  }

  openFilterPopup() {
    const messageDetails = {
      modalTitle: 'Filter',
      patientObj: this.patientObj,
      type: 'visit'
    };
    const modalInstance = this.modalService.open(PatientHistoryFilterComponent,
      {
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
        this.getPatientTreeNodeData(obj).subscribe(res => {
          // document.querySelector('#' + this.selectedHashId).scrollIntoView();
        });
      } else {

      }
    });
    modalInstance.componentInstance.messageDetails = messageDetails;
  }

  getNextPrevTreeData(type) {
    const obj = this.getFilterValue();
    _.map(this.apiData.data, dt => {
      _.map(dt.dateData, dd => {
        const dataObj = {
          visitDate: dd.visitDate,
          visitNo: dd.visitNo,
        };
        obj.CurrentVisits.push(dataObj);
      });
    });
    if (type === 'next') {
      obj.showOldVisits = false;
      this.getPatientTreeNodeData(obj, type).subscribe(res => {
        // document.querySelector('#' + this.selectedHashId).scrollIntoView();
      });
    } else {
      obj.showOldVisits = true;
      this.getPatientTreeNodeData(obj, type).subscribe(res => {
        // document.querySelector('#' + this.selectedHashId).scrollIntoView();
      });
    }
  }

}

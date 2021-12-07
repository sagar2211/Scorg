import { Component, OnInit, Input } from '@angular/core';
import { NgbModal, NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import { Subject, Observable } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';
import { ConfirmationPopupComponent } from '../../../shared/confirmation-popup/confirmation-popup.component';
import { DynamicChartService } from './../../../dynamic-chart/dynamic-chart.service';
import { environment } from './../../../../environments/environment';
import { AddImageAnnotationComponent } from './../add-image-annotation/add-image-annotation.component';
import { ImageAnnotationService } from './../../../public/services/image-annotation.service';
import { UploadImageAnnotationFileComponent } from './../upload-image-annotation-file/upload-image-annotation-file.component';
import { PublicService } from './../../../public/services/public.service';
import * as _ from 'lodash';
import { CommonService } from 'src/app/public/services/common.service';

@Component({
  selector: 'app-image-annotation',
  templateUrl: './image-annotation.component.html',
  styleUrls: ['./image-annotation.component.scss']
})
export class ImageAnnotationComponent implements OnInit {
  imageAnnotationFrm: FormGroup;
  patientId: any;
  imageAnnotationData = [];
  annotationInputs = [];
  deletedAnnotationInputs = [];
  attachmentList = [];
  patientAnnotationImageList = [];
  fileServePath = '';

  destroy$: Subject<boolean> = new Subject<boolean>();
  @Input() public componentInfo: any;
  isPanelOpen: boolean;
  chartDetailId: number;

  constructor(
    private fb: FormBuilder,
    private publicService: PublicService,
    private imgAnnotationService: ImageAnnotationService,
    private modalService: NgbModal,
    private commonService: CommonService,
    public dynamicChartService: DynamicChartService
  ) { }

  ngOnInit() {
    this.chartDetailId = this.componentInfo.chart_detail_id;
    this.patientId = 123;
    this.fileServePath = environment.FILE_SERVER_IMAGE_URL;
    this.getImageAnnotationInitData();
    this.isPanelOpen = (this.componentInfo.activeIdsOfPanels as Array<any>).indexOf(this.componentInfo.section_key) !== -1 ? true : false;
  }

  // createForm() {
  //   this.imageAnnotationFrm = this.fb.group({
  //     imageAnnotation: this.fb.array([])
  //   });
  // }

  //  get imageAnnotation() {
  //   return this.imageAnnotationFrm.get('imageAnnotation') as FormArray;
  // }

  // -- get complaints types data
  // getImageAnnotationData() {
  //   this.imgAnnotationService.getImageAnnotationData(this.patientId).pipe(takeUntil(this.destroy$)).subscribe(dt => {
  //     this.imageAnnotationData = dt;
  //     if (dt.length) {
  //       _.map(dt, (x) => {
  //       });
  //     } else {
  //       this.patchDefaultValue();
  //     }
  //   });
  // }

  // patchDefaultValue(): void {
  //   const annotationObj = {
  //   };
  //   this.imageAnnotationData.push(annotationObj);
  // }

  menuClicked(event: NgbPanelChangeEvent) {
    this.isPanelOpen = event.nextState;
    this.publicService.componentSectionClicked({
      sectionKeyName: 'image_annotation'
    });
  }
  getImageAnnotationFileList() {
    const UploadModalInstance = this.modalService.open(UploadImageAnnotationFileComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false,
        size: 'xl',
        windowClass: 'custom-modal',
        container: '#homeComponent'
      });
    UploadModalInstance.componentInstance.patientData = null;
    UploadModalInstance.componentInstance.source = 'annotation';
    UploadModalInstance.componentInstance.chartDetailId = this.chartDetailId;
    UploadModalInstance.result.then(result => {
      if (result.isSave) {
        this.patientAnnotationImageList.push(result.data);
        this.prepareAndSaveLocalTransData();
      }
      // this.displayBodyDetails();
    }, reason => { });
  }

  getChartPatientImageList() {
    const docId = 2698;
    const tempObj = {
      serviceTypeId: 1,
      specialityId: 1,
      pageNumber: 1,
      limit: 50
    };
    this.imgAnnotationService.getDoctorImageAnnotationFiles(tempObj).subscribe(data => {
      this.patientAnnotationImageList = data;
    });
  }

  getBase64ImageFile(masterDocId): Observable<any> {
    return this.imgAnnotationService.getBase64FileByMasterDocId(masterDocId).pipe(map((res: any) => {
      return res;
    }));
  }

  editAnnotation(selectedImage) {
    this.getBase64ImageFile(selectedImage.master_doc_id).subscribe(res => {
      const filePath = res.file_data;
      const fileName = res.file_name;
      const annotationText = res.file_title;
      this.openAnnotationPopup(filePath, fileName, annotationText, 'select');
    });
  }

  openAnnotationPopup(path, name, title, source) {
    const modalInstance = this.modalService.open(AddImageAnnotationComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false,
        size: 'xl',
        windowClass: 'custom-modal',
        container: '#homeComponent'
      });
    modalInstance.componentInstance.imagePath = path;
    modalInstance.componentInstance.imageName = name;
    modalInstance.componentInstance.source = source;
    modalInstance.componentInstance.annotationDetail = title;
    modalInstance.componentInstance.docSpetialityImageList = [];
    modalInstance.componentInstance.chartDetailId = this.chartDetailId;
    modalInstance.result.then(result => {
      if (result.isSave) {
        this.patientAnnotationImageList.push(result.data);
        this.prepareAndSaveLocalTransData();
      }
      // this.displayBodyDetails();
    }, reason => { });
  }

  getImageAnnotationInitData() {
    this.dynamicChartService.getChartDataByKey('annotation_detail', true, null, this.chartDetailId).subscribe(result => {
      if (!result || result === null) {
        this.patientAnnotationImageList = [];
        return;
      }
      if (result && result.length) {
        // _.map(result, (x) => {
        // });
        this.patientAnnotationImageList = result;
      }
    });
  }

  prepareAndSaveLocalTransData() {
    const data = this.patientAnnotationImageList;
    this.dynamicChartService.updateLocalChartData('annotation_detail', data, 'update', this.chartDetailId);
  }

  deleteConfirmationPopup(rowData) {
    const modalTitleobj = 'Delete';
    const modalBodyobj = 'Do you want to delete attachment?';
    const messageDetails = {
      modalTitle: modalTitleobj,
      modalBody: modalBodyobj
    };
    const modalInstance = this.modalService.open(ConfirmationPopupComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false
      });
    modalInstance.result.then((result) => {
      if (result === 'Ok') {
        this.deleteAnnotation(rowData);
      }
    });
    modalInstance.componentInstance.messageDetails = messageDetails;
  }

  deleteAnnotation(item) {
    const index = _.findIndex(this.patientAnnotationImageList, (o) => o.master_doc_id === item.master_doc_id);
    this.patientAnnotationImageList.splice(index, 1);
    this.prepareAndSaveLocalTransData();
  }

  openCloseSuggPanel() {
    this.commonService.openSuggesstionPanelOnFixedComponentSearchCallFunction('close');
  }
}

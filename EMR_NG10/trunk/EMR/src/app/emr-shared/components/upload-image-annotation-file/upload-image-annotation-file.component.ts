import { map } from 'rxjs/operators';
import { WebcamImage } from 'ngx-webcam';
import { environment } from './../../../../environments/environment';
import { ImageAnnotationService } from './../../../public/services/image-annotation.service';
import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AddImageAnnotationComponent } from './../add-image-annotation/add-image-annotation.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-upload-image-annotation-file',
  templateUrl: './upload-image-annotation-file.component.html',
  styleUrls: ['./upload-image-annotation-file.component.scss']
})
export class UploadImageAnnotationFileComponent implements OnInit {
  constructor(
    public modal: NgbActiveModal,
    private imgAnnotationService: ImageAnnotationService,
    private modalService: NgbModal,
  ) { }
  docAnnotationImageFiles = [];
  uploadFiles: File[];
  isShowDivUploadImage = false;
  isShowBtnUpload = false;
  progress: number;
  message: string;
  pageNumber = 1;
  pageLimit = 50;
  fileServePath = '';
  isShowCamera = false;
  selectedFileName = '';
  selectedFileNameWithExt = '';
  annotationDetail = '';
  source = '';
  alertMessage = {};
  chartDetailId: number;


    // latest snapshot
  public webcamImage: WebcamImage = null;

  ngOnInit() {
    this.getDoctorAnnotationFile();
    this.fileServePath = environment.FILE_SERVER_IMAGE_URL;
  }

  handleImage(webcamImage: WebcamImage) {
    this.webcamImage = webcamImage;
    this.isShowBtnUpload = true;
  }

  chooseFile(files: File[]) {
    if (files) {
      this.uploadFiles = files;
      this.isShowBtnUpload = true;
      this.isShowCamera = false;
      this.webcamImage = null;
      this.selectedFileName = files[0].name.split('.')[0];
      this.selectedFileNameWithExt = files[0].name;
    }
  }

  // uploadFile() {
  //   const files = this.uploadFiles;
  //   console.log(files);
  //   const fileToUpload = files[0];
  //   const formData: any = new FormData();
  //   formData.append('files', fileToUpload, fileToUpload.name);
  //   this.imgAnnotationService.uploadImageForAnnotation(formData).subscribe(event => {
  //     console.log(files);
  //   });
  // }

  getDoctorAnnotationFile() {
    if (this.docAnnotationImageFiles.length > 0) {
      return;
    }
    const docId = 2698;
    const tempObj = {
      serviceTypeId: 1,
      specialityId: 1,
      pageNumber: this.pageNumber,
      limit: this.pageLimit
    };
    this.imgAnnotationService.getDoctorImageAnnotationFiles(tempObj).subscribe(data => {
      this.docAnnotationImageFiles = data;
    });
  }
  getBase64ImageFile(masterDocId): Observable <any> {
    return this.imgAnnotationService.getBase64FileByMasterDocId(masterDocId).pipe(map((res: any) => {
      return res;
    }));
  }
  editImageAnnotation(selectedObj) {
    if (selectedObj) {
      this.annotationDetail = selectedObj.annotation_detail;
      this.addImageAnnotation(selectedObj);
    }
  }
  addImageAnnotation(selectedObj) {
    if (!this.annotationDetail) {
      this.alertMessage = {
        message: 'Please add annotation detail.',
        messageType: 'danger',
        duration: '3000'
      };
      return;
    }
    let filePath: any;
    let fileName = '';
    const files = this.uploadFiles;
    if (selectedObj && selectedObj === 'upload') {
      if (this.webcamImage && this.webcamImage.imageAsDataUrl) {
        filePath = this.webcamImage.imageAsDataUrl;
        this.source = 'camera';
        this.openAnnotationPopup(filePath, 'webcam.png');
      } else if (files && files[0]) {
        const reader = new FileReader();
        reader.onload = (event) => {
          filePath = event.target['result'];
          this.source = 'browse';
          this.openAnnotationPopup(filePath, this.selectedFileNameWithExt);
        };
        reader.readAsDataURL(files[0]);
      }
    } else {
      this.getBase64ImageFile(selectedObj.master_doc_id).subscribe(res => {
        filePath = res.file_data;
        fileName = res.file_name;
        this.openAnnotationPopup(filePath, fileName);
      });
    }
  }

  openAnnotationPopup(path, name) {
    // this.modal.dismiss('closeUploadModal');
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
    modalInstance.componentInstance.source = this.source;
    modalInstance.componentInstance.annotationDetail = this.annotationDetail;
    modalInstance.componentInstance.docSpetialityImageList = this.docAnnotationImageFiles;
    modalInstance.componentInstance.chartDetailId = this.chartDetailId;
    modalInstance.result.then(result => {
      if (result.isSave) {
        this.modal.close(result);
        // this.prepareAndSaveLocalTransData();
      }
      // this.displayBodyDetails();
    }, reason => { });
  }

  // prepareAndSaveLocalTransData() {
  //   const data = this.patientAnnotationImageList;
  //   this.dynamicChartService.updateLocalChartData('annotation_detail', data, 'update');
  // }

  openCamera() {
    this.isShowCamera = true;
    this.uploadFiles = null;
  }
}

import { NgbModal, NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { environment } from 'src/environments/environment';
import * as _ from 'lodash';
import { FileUploader } from 'ng2-file-upload';
import { FileAttachmentsService } from 'src/app/public/services/file-attachments.service';
import { AuthService } from 'src/app/public/services/auth.service';
import { PublicService } from 'src/app/public/services/public.service';
import { DynamicChartService } from 'src/app/dynamic-chart/dynamic-chart.service';
import { ConfirmationPopupComponent } from 'src/app/shared/confirmation-popup/confirmation-popup.component';
import { ViewAttachementsComponent } from 'src/app/shared/view-attachements/view-attachements.component';

@Component({
  selector: 'app-file-attachments',
  templateUrl: './file-attachments.component.html',
  styleUrls: ['./file-attachments.component.scss']
})
export class FileAttachmentsComponent implements OnInit {
  @Input() filesInputs = [];
  @Input() uploader: FileUploader;
  @Output() filesInputsChild = new EventEmitter<any>();
  isError: boolean;
  isErrorLen: boolean;
  fileSize = false;
  invalidSizeFilename: any[] = [];
  showAtcFiles = true;
  addAtcFiles = false;
  chooseDiagnosisFile = false;
  tempFileCnt: any[] = [];
  uploadedFiles: any[] = [];
  setAlertMessage;
  userId: number;
  fileServePath = '';
  attacmentComment = '';
  isFileNameError = false;
  imgPath = '';
  @Input() public componentInfo: any;
  isPanelOpen: boolean;
  chartDetailId: number;

  constructor(
    public fileAttachmentService: FileAttachmentsService,
    private authService: AuthService,
    private publicService: PublicService,
    public dynamicChartService: DynamicChartService,
    public modalService: NgbModal
  ) { }

  ngOnInit() {
    this.chartDetailId = this.componentInfo.chart_detail_id;
    this.userId = this.authService.getLoggedInUserId();
    this.fileServePath = environment.FILE_SERVER_IMAGE_URL;
    this.imgPath = environment.IMG_PATH;
    // const local = 'http://localhost/DEV_P_QA_P_TRUNK/medsonit-be';
    const apiUrl = environment.dashboardBaseURL + '/Attachment/UploadPatientAttachment';
    if (_.isEmpty(this.uploader)) {
      this.uploader = new FileUploader({
        url: apiUrl,
        method: 'POST',
        headers: [
          {
            name: 'Auth-Key',
            value: 'simplerestapi'
          },
          {
            name: 'auth_token',
            value: this.authService.getAuthToken()
          },
          {
            name: 'User-ID',
            value: this.userId.toString(),
          },
          {
            name: 'Client-Service',
            value: 'frontend-client'
          }
        ],
      });
    }


    this.uploader.options.filters.push({
      name: 'customFilter',
      fn: (item, options) => {
        this.isError = false;
        this.isErrorLen = false;
        let error;
        let errorlen;
        const type = '|' + item.name.split('.').pop().toLowerCase() + '|'; // '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
        // FILTERS gif|jpg|JPG|png|jpeg|JPEG|pdf|PDF|doc|DOC|docx|DOCX|PNG|xps|XPS|vnd.ms-xpsdocument
        const typeofindex = '|gif|jpg|png|jpeg|pdf|'.indexOf(type);
        const sizeInBytes = item.size;
        const sizeInMb = sizeInBytes / (1024 * 1024);
        if (sizeInMb <= 10) {
          if (typeofindex === -1) {
            this.isError = true;
            error = false;
          } else {
            this.isError = false;
            error = true;
          }
          if (this.uploader.queue.length < 10) {
            this.isErrorLen = false;
            errorlen = true;
          } else {
            this.isErrorLen = true;
            errorlen = false;
          }
          return !!(errorlen && error);
        } else {
          this.invalidSizeFilename.push(item.name);
          this.fileSize = true;
          return false;
        }
      }
    });

    this.uploader.onAfterAddingFile = (item) => {
      this.isError = false;
      const itemfilename = item.file.name;
      const name = itemfilename.substr(0, itemfilename.indexOf('.'));
      const lastextn = itemfilename.split('.').pop();
      item.file.name = name;
      item.file.type = lastextn;
      this.uploadedFiles.push(item.file);
    };

    this.uploader.onBeforeUploadItem = (item) => {
      item.file.name = item.file.name + '.' + item.file.type;
      item.withCredentials = false;
    };

    this.uploader.onCompleteItem = (item) => {
      const self = this;
      self.showAtcFiles = true;
      self.addAtcFiles = false;
      self.uploader.clearQueue();
    };

    this.uploader.onCompleteAll = () => {
      const self = this;
      // self.markDirtyObject('medicalHistoryFilesInputs', true);
      if (self.tempFileCnt.length === self.uploader.queue.length) {
        self.showAtcFiles = true;
        self.addAtcFiles = false;
        self.tempFileCnt = [];
        self.uploader.clearQueue();
        const outputData = { filesInputs: this.filesInputs, uploader: {} };
        this.filesInputsChild.emit(outputData);
      } else {
        self.showAtcFiles = true;
      }
    };

    this.uploader.onCompleteItem = (fileItem, responseString, status, headers) => {
      if (responseString === '') {
        return;
      }
      const response = JSON.parse(responseString);
      if (response !== '' && response.data !== undefined && response.data.error === undefined) {
        // this.filesInputs.push({
        //   filename: response.data.filename,
        //   display_name: response.data.display_name,
        //   id: ''
        // });
        response.data[0]['chart_detail_id'] = this.chartDetailId;
        this.filesInputs.push(response.data[0]);
        this.prepareAndSaveLocalTransData();
        this.tempFileCnt.push({
          filename: response.data.filename,
        });
        // this.filterImagefile = angular.copy(this.filesInputs.attachment_data);
        // this.filterImagefile = _.filter(this.filterImagefile, function (o) {
        //   return o.filename.substr(o.filename.lastIndexOf('.') + 1).toLowerCase() != 'pdf' &&
        //     o.filename.substr(o.filename.lastIndexOf('.') + 1).toLowerCase() != 'txt' &&
        //     o.filename.substr(o.filename.lastIndexOf('.') + 1).toLowerCase() != 'docx'
        // })
      } else {
        fileItem.remove();
        if (response.data.error !== undefined) {
          this.setAlertMessage = {
            message: 'Invalid file extension',
            messageType: 'danger',
            duration: 4000
          };
        }
      }
    };

    this.getFileAttachmentInitData();
    this.isPanelOpen = (this.componentInfo.activeIdsOfPanels as Array<any>).indexOf(this.componentInfo.section_key) !== -1 ? true : false;
  }

  viewAtcFiles(): void {
    const self = this;
    this.showAtcFiles = true;
    self.addAtcFiles = true;
    self.chooseDiagnosisFile = true;
    // $scope.$broadcast('chooseDiagnosisFile');
    // self.scrollTo('med_attachment_section');
  }

  addAtcFilesAcr(): void {
    const self = this;
    self.showAtcFiles = true;
    self.addAtcFiles = false;
    self.chooseDiagnosisFile = false;
    self.isError = false;
    // $scope.$broadcast('chooseDiagnosisFile');
    self.invalidSizeFilename = [];
    self.fileSize = false;
    self.isErrorLen = false;
    const outputData = { filesInputs: this.filesInputs, uploader: this.uploader };
    this.filesInputsChild.emit(outputData);
  }

  discardFileUploading(): void {
    const self = this;
    self.uploader.cancelAll();
    self.showAtcFiles = true;
    self.addAtcFiles = false;
    self.tempFileCnt = [];
    self.uploader.clearQueue();
  }

  menuClicked(event: NgbPanelChangeEvent) {
    this.isPanelOpen = event.nextState;
    this.publicService.componentSectionClicked({
      sectionKeyName: 'attachment'
    });
  }

  getFileAttachmentInitData() {
    this.dynamicChartService.getChartDataByKey('attachment_detail', true, null, this.chartDetailId).subscribe(result => {
      if (!result || result === null) {
       this.filesInputs = [];
       return;
      }
      if (result && result.length) {
        // _.map(result, (x) => {
        // });
        this.filesInputs = result;
      }
    });
  }

  prepareAndSaveLocalTransData() {
    const data = this.filesInputs;
    this.dynamicChartService.updateLocalChartData('attachment_detail', data, 'update', this.chartDetailId);
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
        this.deleteAttachment(rowData);
      }
    });
    modalInstance.componentInstance.messageDetails = messageDetails;
  }

  deleteAttachment(item) {
    const index = _.findIndex(this.filesInputs, (o) => o.master_doc_id === item.master_doc_id );
    this.filesInputs.splice(index, 1);
    this.prepareAndSaveLocalTransData();
  }

  renameFile(item, fileName){
    if (fileName) {
      item.file.name = fileName;
      this.isFileNameError = false;
    } else {
      // item.file.name = item.file.rawFile.name.split('.')[0];
      this.isFileNameError = true;
    }
  }

  isImage(item) {
    if (item && item.file_name.split('.')[1].toUpperCase() !== 'PDF') {
      return true;
    } else {
      return false;
    }
  }

  viewAttachedFile(item) {
    const data = {
      fileName: item.orginal_file_name.split('.')[0],
      filePath: this.fileServePath + item.file_path,
      fileType: this.isImage(item) ? 'img' : 'pdf'
    };
    const modalInstance = this.modalService.open(ViewAttachementsComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false,
        size: 'lg'
      });
    modalInstance.result.then((result) => {

    });
    modalInstance.componentInstance.fileData = data;
  }
}

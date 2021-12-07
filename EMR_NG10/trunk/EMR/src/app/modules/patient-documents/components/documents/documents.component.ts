import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import * as _ from 'lodash';
import { MedicalHistoryService } from 'src/app/patient/services/medical-history.service';
import { MedicalHistoryModel } from 'src/app/public/models/medical-history-model';
import { ConsultationService } from 'src/app/public/services/consultation.service';

@Component({
  selector: 'app-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.scss']
})
export class DocumentsComponent implements OnInit {

  // userParentId = 2800;
  // imageBaseURL = 'https://s3.ap-south-1.amazonaws.com/drrescribeattachments';

  medicalHistoryFrm: FormGroup;
  filterImagefile: any = [];
  filesInputs: any = [];
  // imageSliderInput: { imageBaseURL: string, imagesFilesArray: any, userParentId: number, currentFile: any };
  val: any;
  fileUpload = false;
  childUploaderInstance: any = {};
  deletedFilesInputs: any = [];

  constructor(
    private fb: FormBuilder,
    private medicalHistoryService: MedicalHistoryService,
    private consultationService: ConsultationService
  ) { }

  ngOnInit() {
    this.medicalHistoryFrm = this.fb.group({
      medicalHistoryNote: ['']
    });
    this.patchDefaultValue();
  }

  // load server data into form and process attachment data
  patchDefaultValue(): void {
    this.consultationService.getPatientObj('patientId', true).subscribe(res => {
      const patientId = this.consultationService.getPatientObj('patientId');
      this.medicalHistoryService.getMedicalHistoryAttachmentData(patientId).subscribe(data => {
        const medicalHistoryModel = new MedicalHistoryModel();
        if (medicalHistoryModel.isObjectValid(data)) {
          medicalHistoryModel.generateObject(data);
          const medicalHistoryNotes = medicalHistoryModel.medicalHistoryNote;
          const attachmentData = medicalHistoryModel.attachmentData;
          this.medicalHistoryFrm.patchValue({
            medicalHistoryNote: medicalHistoryNotes
          });
          this.filesInputs = attachmentData;
        }
      });
    });
  }

  // loadImageSlider(fileInput, file): void {
  //   // setTimeout(this.imageSlider.currentAttachmentSlide(this.imageSliderInput, file));
  //   this.imageSliderInput = {imageBaseURL: this.imageBaseURL, imagesFilesArray: this.filterImagefile, userParentId: this.userParentId, currentFile: file};
  // }

  viewAtcFiles(): void {
    this.fileUpload = true;
  }

  OnFileUploadResponse(fileInputChild): void {
    this.filesInputs = fileInputChild.filesInputs;
    this.childUploaderInstance = fileInputChild.uploader;
    // this.generateFilterImageFileData();
    this.fileUpload = false;
  }

  // generateFilterImageFileData() {
  //   this.filterImagefile = _.filter(this.filesInputs, (o) => {
  //     return o.filename.substr(o.filename.lastIndexOf('.') + 1).toLowerCase() != 'pdf' &&
  //       o.filename.substr(o.filename.lastIndexOf('.') + 1).toLowerCase() != 'txt' &&
  //       o.filename.substr(o.filename.lastIndexOf('.') + 1).toLowerCase() != 'docx' &&
  //       o.filename.substr(o.filename.lastIndexOf('.') + 1).toLowerCase() != 'doc';
  //   });
  // }

  // delete selected image
  deleteDiagnosisFile($event): void {
    if (confirm('Are you sure to delete ')) {
      this.deletedFilesInputs.push(this.filesInputs[$event.index]);
      const indx = _.findIndex(this.filterImagefile, (a) => a.filename === $event.img.filename);
      if (indx !== -1) {
        this.filterImagefile.splice(indx, 1);
      }
      this.filesInputs.splice($event, 1);
    }
  }

}

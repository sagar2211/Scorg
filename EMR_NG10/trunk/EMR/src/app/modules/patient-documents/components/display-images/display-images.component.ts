import { Component, OnInit, OnChanges, Input, AfterViewInit, DoCheck, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';

@Component({
  selector: 'app-display-images',
  templateUrl: './display-images.component.html',
  styleUrls: ['./display-images.component.scss']
})
export class DisplayImagesComponent implements OnInit, AfterViewInit, DoCheck {
  @Input() uploadedFileList;
  @Input() isDelete;
  @Input() isView;
  @Output() deleteSelectedImg = new EventEmitter<any>();

  filesInputs: any [] = [];
  filterImagefile: any[];
  userParentId = 2800;
  imageBaseURL = 'https://s3.ap-south-1.amazonaws.com/devrescribeattachments';
  innerCaption: string;
  slideIndex = 1;
  minIndex = 0;
  maxIndex = 1;
  activeFileId: number;

  constructor() { }

  ngOnInit() {
    this.filterImagefile = [];
  }

  ngDoCheck() {
    this.filesInputs = this.uploadedFileList;
    this.isDelete = this.isDelete;
    this.isView = this.isView;
    this.generateFilterImageFileData();
  }

  ngAfterViewInit() {
    this.filesInputs = this.uploadedFileList;
    setTimeout(() => {
      this.generateFilterImageFileData();
    }, 500);
  }

  // -- Filter the images or removed pdf, txt and doc images from image lists
  generateFilterImageFileData() {
    this.filterImagefile = _.filter(this.filesInputs, (o) => {
      return o.filename.substr(o.filename.lastIndexOf('.') + 1).toLowerCase() != 'pdf' &&
        o.filename.substr(o.filename.lastIndexOf('.') + 1).toLowerCase() != 'txt' &&
        o.filename.substr(o.filename.lastIndexOf('.') + 1).toLowerCase() != 'docx' &&
        o.filename.substr(o.filename.lastIndexOf('.') + 1).toLowerCase() != 'doc';
    });
  }

  currentAttachmentSlide(fileInput, file): void {
    document.getElementById('m_historyAttachmentLightbox').style.display = 'block';
    const fileIndex = _.findIndex(this.filesInputs, (o) => o.filename == file.filename);
    const n = fileIndex + 1;
    const ImageNameO = fileInput[fileIndex].display_name;
    this.innerCaption = ImageNameO.split('.')[0];
    this.showSlides(this.filterImagefile, this.slideIndex = n);
  }

  plusSlides(fileInput, n): void {
    this.innerCaption = '';
    this.showSlides(fileInput, this.slideIndex += n);
  }

  showSlides(fileInput, n): void {
    let i: number, slides: any;
    slides = document.getElementsByClassName('medicalhistoryAttachmentImage');
    // const dots = document.getElementsByClassName('historyAttachmentThumbnail');
    const captionText = document.getElementById('caption');
    if (n > slides.length) {
      this.slideIndex = 1;
    }
    if (n < 1) {
      this.slideIndex = slides.length;
    }
    for (i = 0; i < slides.length; i++) {
      slides[i].style.display = 'none';
    }

    slides[this.slideIndex - 1].style.display = 'block';
    if (this.innerCaption != '') {
      captionText.innerHTML = this.innerCaption;
    } else {
      const imageName = fileInput[this.slideIndex - 1].display_name;
      captionText.innerHTML = imageName.split('.')[0];
    }

    this.minIndex = this.slideIndex - 1;
    this.maxIndex = this.minIndex + 1;

    if (this.maxIndex > slides.length) {
      this.minIndex = slides.length - 2;
      this.maxIndex = slides.length - 1;
    }
    this.activeFileId = fileInput[this.slideIndex - 1].id;
  }

  closeModal(): void {
    document.getElementById('m_historyAttachmentLightbox').style.display = 'none';
  }

  // -- click on delete icons send event to parent component
  deleteImage(i, selectedImage): void {
    const obj = {index : i, img : selectedImage};
    this.deleteSelectedImg.emit(obj);
  }

}

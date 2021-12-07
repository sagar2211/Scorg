import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FileAttachmentsService {

  imageObjArray = [];
  constructor() { }

  setImage(imageName, imageObject): void {
    const imageRecord = {'imageName': imageName, 'imageObject': imageObject};
    this.imageObjArray.push(imageObject);
  }

  getImages(): any {
    return this.imageObjArray;
  }
}

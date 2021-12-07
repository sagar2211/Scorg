import { Component, NgZone, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { WebcamImage } from 'ngx-webcam';
import { Observable, Subject } from 'rxjs';
import { PatientService } from '../../../../shared/services/patient.service';

@Component({
  selector: 'app-photo-capture-popup',
  templateUrl: './photo-capture-popup.component.html',
  styleUrls: ['./photo-capture-popup.component.scss']
})
export class PhotoCapturePopupComponent implements OnInit {

  public users: any;
  public webcamImage: WebcamImage = null;
  private trigger: Subject<void> = new Subject<void>();

  constructor(public activeModal: NgbActiveModal, private ngZone: NgZone, private patientService : PatientService) { }

  ngOnInit() {
  }

  triggerSnapshot(): void {
    this.trigger.next();
  }
  handleImage(webcamImage: WebcamImage): void {
  this.webcamImage = webcamImage;
  }
    
  public get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }

  submitImg(){
    if(this.webcamImage){
      const imgbase64 = this.webcamImage['_imageAsDataUrl']+"";
      const param = {
        imageData : imgbase64
      }
      this.patientService.uploadTakeImage(param).subscribe((response)=>{
        console.log(response)
      })
    }
  }
}

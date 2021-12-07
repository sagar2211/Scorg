import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-pacs',
  templateUrl: './pacs.component.html',
  styleUrls: ['./pacs.component.scss']
})
export class PacsComponent implements OnInit {
  imgArray = [];
  selectedImg: any;
  cutTime = new Date().getTime();
  constructor() { }

  ngOnInit() {
    this.imgArray = [
      {
        name: 'X-RAY CHEST PA',
        thumbUrl: './assets/images/anotation/thumb/X-RAY-CHEST-PA---post-ETT-CXR.jpg',
        url: './assets/images/anotation/X-RAY-CHEST-PA---post-ETT-CXR.jpg',
      },
      {
        name: 'CT CERVICAL SPINE',
        thumbUrl: './assets/images/anotation/thumb/CT-CERVICAL-SPINE---normal-ct-cervical-spine-paediatric.jpg',
        url: './assets/images/anotation/CT-CERVICAL-SPINE---normal-ct-cervical-spine-paediatric.jpg',
      },
      {
        name: 'X-RAY SKULL',
        thumbUrl: './assets/images/anotation/thumb/X-RAY-SKULL--depressed-skull-fracture-2.jpg',
        url: './assets/images/anotation/X-RAY-SKULL--depressed-skull-fracture-2.jpg',
      },
      {
        name: 'CT BRAIN PLAIN',
        thumbUrl: './assets/images/anotation/thumb/CT-BRAIN-PLAIN---traumatic-subarachnoid-haemorrhage-with-contusion-(1).jpg',
        url: './assets/images/anotation/CT-BRAIN-PLAIN---traumatic-subarachnoid-haemorrhage-with-contusion-(1).jpg',
      },
      {
        name: 'X-RAY CHEST PA Normal-CXR',
        thumbUrl: './assets/images/anotation/thumb/X-RAY-CHEST-PA-Normal-CXR.jpg',
        url: './assets/images/anotation/X-RAY-CHEST-PA-Normal-CXR.jpg',
      },
      {
        name: 'CT BRAIN PLAIN',
        thumbUrl: './assets/images/anotation/thumb/CT-BRAIN-PLAIN---traumatic-subarachnoid-haemorrhage-with-contusion.jpg',
        url: './assets/images/anotation/CT-BRAIN-PLAIN---traumatic-subarachnoid-haemorrhage-with-contusion.jpg',
      }
    ];
    this.selectedImg = this.imgArray[0];
  }

  updateSelectedImg(item) {
    this.selectedImg = item;
    this.cutTime = new Date().getTime();
  }
}

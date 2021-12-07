import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';

@Component({
    selector: 'app-human-body-pain-details',
    templateUrl: './human-body-pain-details.component.html',
    styleUrls: ['./human-body-pain-details.component.scss']
})
export class HumanBodyPainDetailsComponent implements OnInit {

    @Input() partDetails;
    @ViewChild('humanBodyPainDetails', { static: true }) humanBodyPainDetails: ElementRef;

    constructor() { }

    ngOnInit() {
    }

    setColor(from, score) {
        let returnVal = '';
        switch (score) {
            case 1:
                returnVal = (from === 'HumanBody') ? 'label pain-one' : (from === 'Dermatome') ? 'label pain-six' : 'label pain-eight';
                break;
            case 2:
                returnVal = (from === 'HumanBody') ? 'label pain-two' : (from === 'Dermatome') ? 'label pain-one' : 'label pain-six';
                break;
            case 3:
                returnVal = (from === 'HumanBody') ? 'label pain-three' : 'label pain-five';
                break;
            case 4:
                returnVal = (from === 'HumanBody') ? 'label pain-four' : 'label pain-four';
                break;
            case 5:
                returnVal = (from === 'HumanBody') ? 'label pain-five' : 'label pain-one';
                break;
            case 6:
                returnVal = 'label pain-six';
                break;
            case 7:
                returnVal = 'label pain-seven';
                break;
            case 8:
                returnVal = 'label pain-eight';
                break;
            case 9:
                returnVal = 'label pain-nine';
                break;
            case 10:
                returnVal = 'label pain-ten';
                break;
            case 'NT':
                returnVal = 'label pain-NT';
                break;
            default:
                returnVal = (from === 'Dermatome') ? 'label pain-eight' : 'label pain-ten';
                break;
        }
        return returnVal;
    }

    close() {
        // this._activeModel.close();
    }

}

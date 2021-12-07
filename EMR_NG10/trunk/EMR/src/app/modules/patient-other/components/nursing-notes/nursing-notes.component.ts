import { Component, OnInit } from '@angular/core';
import * as _ from 'lodash';
import * as moment from 'moment';
import { AuthService } from 'src/app/public/services/auth.service';
import { PublicService } from 'src/app/public/services/public.service';

@Component({
  selector: 'app-nursing-notes',
  templateUrl: './nursing-notes.component.html',
  styleUrls: ['./nursing-notes.component.scss']
})
export class NursingNotesComponent implements OnInit {
  nursingCare: string;
  nursingcarePreviousTime: Date;
  nursingNotePreviousTime: Date;
  nursingNote: string;
  nursingNoteArray = [];
  loginUserDetails: any;
  previousnoteFocusTime: string;
  previouscareFocusTime: string;
  constructor(
    private authService: AuthService,
    private publicService: PublicService
  ) { }

  ngOnInit() {
    this.previousnoteFocusTime = '';
    this.previouscareFocusTime = '';
    this.loginUserDetails = this.authService.getUserDetails();
    const notData = this.publicService.getNursingcareDetails(this.loginUserDetails.userInfo.id);
    this.nursingCare = (notData.nursingNoteDetails && notData.nursingNoteDetails[0].nursingCareText) ?
      notData.nursingNoteDetails[0].nursingCareText : '';
    this.nursingcarePreviousTime = (notData.nursingNoteDetails && notData.nursingNoteDetails[0].inputCareTime) ?
      notData.nursingNoteDetails[0].inputCareTime : moment().format('DD/MM/YYYY HH:mm');
    this.nursingNotePreviousTime = (notData.nursingNoteDetails && notData.nursingNoteDetails[1].inputNoteTime) ?
      notData.nursingNoteDetails[1].inputNoteTime : moment().format('DD/MM/YYYY HH:mm');
    this.nursingNote = (notData.nursingNoteDetails && notData.nursingNoteDetails[1].nursingNoteText) ?
      notData.nursingNoteDetails[1].nursingNoteText : '';
  }

  focusNursingTextArea(flag) {
    const currentTime = moment().format('DD/MM/YYYY HH:mm');
    const defualtString = this.loginUserDetails.userInfo.doctor_name + ' ' + currentTime + ':';
    const priviousTime = flag === 'care' && this.previouscareFocusTime ? this.previouscareFocusTime :
      flag === 'note' && this.previousnoteFocusTime ? this.previousnoteFocusTime :
        flag === 'care' ? this.nursingcarePreviousTime :
          flag === 'note' ? this.nursingNotePreviousTime : moment().format('DD/MM/YYYY HH:mm');
    const diffTime = moment.utc(moment(currentTime, 'DD/MM/YYYY HH:mm').diff(moment(priviousTime, 'DD/MM/YYYY HH:mm'))).format('m');
    console.log('diffTime', diffTime);
    if (flag === 'care' && !this.nursingCare) {
      this.nursingCare = defualtString;
      this.previouscareFocusTime = moment().format('DD/MM/YYYY HH:mm');
    } else if (flag === 'care' && this.nursingCare && diffTime !== '0') {
      this.nursingCare = this.nursingCare + '\n' + '' + defualtString;
      this.previouscareFocusTime = moment().format('DD/MM/YYYY HH:mm');
    } else if (flag === 'note' && !this.nursingNote) {
      this.nursingNote = defualtString;
      this.previousnoteFocusTime = moment().format('DD/MM/YYYY HH:mm');
    } else if (flag === 'note' && this.nursingNote && diffTime !== '0') {
      this.nursingNote = this.nursingNote + '\n' + '' + defualtString;
      this.previousnoteFocusTime = moment().format('DD/MM/YYYY HH:mm');
    }
  }

  AddnursingData(flag) {
    if (flag === 'care') {
      const careDetails = {
        inputCareTime: moment().format('DD/MM/YYYY HH:mm'),
        nursingCareText: this.nursingCare
      };
      const priviousText = _.find(this.nursingNoteArray, Data => {
        return Data.nursingCareText;
      });
      if (priviousText) {
        priviousText.nursingCareText = this.nursingCare;
      } else {
        this.nursingNoteArray.push(careDetails);
      }
    } else if (flag === 'note') {
      const noteDetails = {
        inputNoteTime: moment().format('DD/MM/YYYY HH:mm'),
        nursingNoteText: this.nursingNote
      };
      const priviousText = _.find(this.nursingNoteArray, Data => {
        return Data.nursingNoteText;
      });
      if (priviousText) {
        priviousText.nursingNoteText = this.nursingNote;
      } else {
        this.nursingNoteArray.push(noteDetails);
      }
    }
    const setObject = {
      userId: this.loginUserDetails.userInfo.id,
      nursingNoteDetails: this.nursingNoteArray
    };
    this.publicService.setNursingData(setObject);
  }

}

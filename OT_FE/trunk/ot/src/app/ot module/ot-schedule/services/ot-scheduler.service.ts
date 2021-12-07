import { Injectable } from '@angular/core';
import { PatientData, TheatreData, Data } from "../modal/ot-scheduler";
import { HttpClient } from "@angular/common/http";
import { environment } from './../../../../environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as _ from 'lodash';

let theatreData = [{
  id: 1,    
  text: "Operation Theatre 1",
  startTime: 9,
  endTime: 18    
}, {
  id: 2,
  text: "Operation Theatre 2",
  startTime: 10,
  endTime: 19 
}, {
  id: 3,
  text: "Operation Theatre 3",
  startTime: 11,
  endTime: 20 
}, {
  id: 4,  
  text: "Operation Theatre 4",
  startTime: 8.20,
  endTime: 24   
}
];

let patientsData = [{
  id: 1,
  patientName: "Akash",
  address: "pune",
  doctor: "pote",
  color: "#56ca85"
}, {
  id: 2,
  patientName: "Rahul",
  address: "mumbai",
  doctor: "lonkar",
  color: "#56ca85"
}, {
  id: 3,
  patientName: "Rohit",
  address: "satara",
  doctor: "kiran shaha",
  color: "#56ca85"
}, {
  id: 4,
  patientName: "Sagar",
  address: "pune",
  doctor: "Bhujbal",
  color: "#56ca85"
}, {
  id: 5,
  patientName: "Vikas",
  address: "pune",
  doctor: "pote",
  color: "#56ca85"
}, {
  id: 6,
  patientName: "Karan",
  address: "pune",
  doctor: "Borate",
  color: "#56ca85"
}];


let data = [{
      theatreId: 4,
      patientId: 3,
      startDate: new Date("2021-07-19T02:30:00.000Z"),
      endDate: new Date("2021-07-19T04:02:00.000Z")
  }, {
      theatreId: 3,
      patientId: 1,
      startDate: new Date("2021-07-19T04:30:00.000Z"),
      endDate: new Date("2021-07-19T06:02:00.000Z")
  }, {
      theatreId: 2,
      patientId: 2,
      startDate: new Date("2021-07-19T06:30:00.000Z"),
      endDate: new Date("2021-07-19T08:02:00.000Z")
  }, {
      theatreId: 1,
      patientId: 4,
      startDate: new Date("2021-07-19T04:30:00.000Z"),
      endDate: new Date("2021-07-19T07:02:00.000Z")
  }, {
    theatreId: 1,
    patientId: 5,
    startDate: new Date("2021-07-19T12:30:00.000Z"),
    endDate: new Date("2021-07-19T14:02:00.000Z")
  }, {
    theatreId: 2,
    patientId: 6,
    startDate: new Date("2021-07-19T12:30:00.000Z"),
    endDate: new Date("2021-07-19T14:02:00.000Z")
  }
];
@Injectable({
  providedIn: 'root'
})
export class OtSchedulerService {

  constructor(private httpClient : HttpClient) { }
}

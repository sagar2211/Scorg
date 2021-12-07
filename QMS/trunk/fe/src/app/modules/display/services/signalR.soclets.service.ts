import { environment } from './../../../../environments/environment';
import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { HubConnectionBuilder, HubConnection } from '@aspnet/signalr';
import { ActivatedRoute } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class SignalRSocket {
  private socketUrl = environment.tvDisplayUrl;
  // private socketUrl = 'http://172.16.100.203:57/notificationHub';

  connectionEstablished = new EventEmitter<Boolean>();
  private connectionIsEstablished = false;
  private streamHubConnection: HubConnection;
  socketData: Subject<object> = new Subject();
  public $changeEvent = this.socketData.asObservable();

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
  ) { }
  public init(sectionName: string, templateNo: string) {
    const tempNo = +templateNo;
    this.socketUrl = `${this.socketUrl}\?SectionName=${sectionName}&TemplateNo=${tempNo}`;
    this.createConnection();
    this.registerOnServerEvents();
    this.startConnection();
  }

  private createConnection() {
    this.streamHubConnection = new HubConnectionBuilder()
      .withUrl(this.socketUrl)
      .build();
  }

  private registerOnServerEvents() {
    this.streamHubConnection.on('SendMessage', (message) => {
      this.socketData.next(message.val1);
      console.log('Message From Server: ' + message);
    });
  }
  private startConnection() {
    this.streamHubConnection
      .start()
      .then(() => {
        this.connectionIsEstablished = true;
        console.log('stream connection started');
        this.connectionEstablished.emit(true);
      }).catch(err => {
        console.log('Error While starting connection');
        console.log(err);
      });
  }



  public startStreaming() {
    this.streamHubConnection.stream('SendMessage', 10, 500)
      .subscribe({
        next: (item) => { console.log(item); },
        complete: () => { console.log('streaming completed'); },
        error: (err) => {
          console.log('Error while streaming');
          console.log(err);
        },
      });
  }

}

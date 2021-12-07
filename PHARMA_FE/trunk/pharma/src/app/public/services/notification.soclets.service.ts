import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { HubConnectionBuilder, HubConnection } from '@aspnet/signalr';
import { ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotificationSocket {
  private socketHubUrl = environment.notificationUrl;
  private socketUrl = '';
  private retryAttemp = 1;

  connectionEstablished = new EventEmitter<Boolean>();
  private connectionIsEstablished = false;
  private streamHubConnection: HubConnection;
  socketData: Subject<object> = new Subject();
  public $changeEvent = this.socketData.asObservable();

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
  ) { }
  public init(userId: string) {
    this.socketUrl = `${this.socketHubUrl}\?UserId=${userId}`;
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
      this.socketData.next(message);
      console.log('Message From Server...');
      console.log(message);
    });
  }
  private startConnection() {
    if (this.retryAttemp > 3) {
      return;
    }
    this.streamHubConnection
      .start()
      .then(() => {
        this.connectionIsEstablished = true;
        console.log('socket stream connection started');
        this.retryAttemp = 1;
        this.connectionEstablished.emit(true);
      }).catch(err => {
        console.log('Error While starting socket connection');
        if (this.retryAttemp == 1) {
          console.log(err);
        }
        this.retryAttemp++;
        setTimeout(() => this.startConnection(), 5000);
      });

    this.streamHubConnection.onclose((error) => {
        console.log('socket connection closed');
        console.log(error);
        this.startConnection();
    });
  }

  public startStreaming() {
    this.streamHubConnection.stream('SendMessage', 10, 500)
      .subscribe({
        next: (item) => { console.log('Message From Server: ' + item); },
        complete: () => { console.log('socket streaming completed'); },
        error: (err) => {
          console.log('Error while socket streaming');
          console.log(err);
        },
      });
  }

}

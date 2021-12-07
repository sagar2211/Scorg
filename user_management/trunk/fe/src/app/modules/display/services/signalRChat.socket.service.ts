import { Injectable, EventEmitter } from '@angular/core';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { HubConnectionBuilder, HubConnection } from '@aspnet/signalr';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Injectable()
export class SignalRCharSocket {

    private chartSocketUrl = environment.charServerUrl;

    connectionEstablished = new EventEmitter<Boolean>();
    private connectionIsEstablished = false;
    private streamHubConnection: HubConnection;
    socketData: Subject<object> = new Subject();
    public $changeEvent = this.socketData.asObservable();

    constructor(
        private http: HttpClient,
        private route: ActivatedRoute,
        private authService: AuthService
    ) { }

    public init() {
        this.chartSocketUrl = `${this.chartSocketUrl}`;
        this.createConnection();
        this.registerOnServerEvents();
        this.startConnection();
    }

    private createConnection() {
        this.streamHubConnection = new HubConnectionBuilder()
            .withUrl(`${this.chartSocketUrl}?auth_token=${this.authService.getAuthToken()}`)
            .build();
    }

    private registerOnServerEvents() {
        this.streamHubConnection.on('OnReceiveMessage', (message) => {
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

    public sendMessage(message: string, userId: string) {
        return this.streamHubConnection.send('SendMessage',
            this.authService.getAuthToken(), Number(userId), message);
    }

    public startStreaming(message: string, userId: string) {
        this.streamHubConnection.stream('SendMessage',this.authService.getAuthToken(), Number(userId), message)
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


export class SignalR {
    private baseUrl: string;
    private signalRUrl: string;

    constructor(connectionUrl: string) {
        this.signalRUrl = connectionUrl;
    }

    public init() {
        // this.signalRUrl = `${this.baseUrl}\${this.signalRUrl}\?SectionName=${sectionName}`;
        this.createConnection();
        this.registerOnServerEvents();
        this.startConnection();
    }

    public initChatService(userId: string) {

    }

    private createConnection() {
        // this.streamHubConnection = new HubConnectionBuilder()
        //     .withUrl(this.tvDisplaysocketUrl)
        //     .build();
    }

    private registerOnServerEvents() {
        // this.streamHubConnection.on('SendMessage', (message) => {
        //     this.socketData.next(message.val1);
        //     console.log('Message From Server: ' + message);
        // });
    }
    private startConnection() {
        // this.streamHubConnection
        //     .start()
        //     .then(() => {
        //         this.connectionIsEstablished = true;
        //         console.log('stream connection started');
        //         this.connectionEstablished.emit(true);
        //     }).catch(err => {
        //         console.log('Error While starting connection');
        //         console.log(err);
        //     });
    }


}

import { ChatUser } from './chat-user';

export class ChatCommunication {
    message: string;
    time: Date;
    isRead: boolean;
    fromUser: ChatUser;
    toUser: ChatUser;
    id: string;

    constructor(message: string, time: Date, fromUser: ChatUser, toUser: ChatUser, isRead?: boolean) {
        this.message = message;
        this.time = time;
        this.isRead = isRead;
        this.fromUser = fromUser;
        this.toUser = toUser;
    }
}
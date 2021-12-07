import { ChatUserStatus } from './charUserStatus';

export class ChatUser {
    id: number;
    name: string;
    status: ChatUserStatus;
    lastActiveTime;

    constructor(userId: number, userName: string, status: string, lastActiveTime: string) {
        this.id = userId;
        this.name = userName;
        this.status = this.getStatusEnum(status);
        this.lastActiveTime = lastActiveTime;
    }

    getStatusEnum(status: string) {
        if (status === 'offline') {
            return ChatUserStatus.OFFLINE;
        }
        if (status === 'online') {
            return ChatUserStatus.ONLINE;
        }
        if (status === 'idle') {
            return ChatUserStatus.IDLE;
        }
        return ChatUserStatus.IDLE;

    }

}

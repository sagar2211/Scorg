import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as _ from 'lodash';
import { SignalRCharSocket } from '../../../display/services/signalRChat.socket.service';
import { AuthService } from 'src/app/services/auth.service';
import { ChatCommunication } from '../../models/chatCommunication';
import { ChatService } from '../../services/chat.service';
import { ChatUser } from '../../models/chat-user';


@Component({
  selector: 'app-chat-room',
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.scss']
})
export class ChatRoomComponent implements OnInit {
  chatWithUserId: string;
  isConnected: false;
  message: string;
  userCommunication: Array<ChatCommunication> = new Array<ChatCommunication>();
  currentActiveChatWithUSer: ChatUser = null;
  currentLoggedInUser: ChatUser = null;

  constructor(
    private route: ActivatedRoute,
    private socket: SignalRCharSocket,
    private authService: AuthService,
    private chatService: ChatService) {
    this.socket.init();
    this.socket.connectionEstablished
      .subscribe(isConnected => {
        this.isConnected = isConnected;
        const userInfo = this.authService.getUserInfoFromLocalStorage();
        this.currentLoggedInUser = new ChatUser(userInfo.user_id, userInfo.user_name, 'online', null);
        // this.sendMessage();
      });

  }

  ngOnInit() {
    this.socket.$changeEvent.subscribe(messages => {
      _.forEach(messages, (messageDetail) => {
        this.userCommunication.push(this.receiveMessages(messageDetail));
      });
      console.log(`Messages: ${JSON.stringify(messages)}`);
    });
    this.route.paramMap.subscribe(param => {
      this.chatWithUserId = param.get('id');
      this.currentActiveChatWithUSer = this.chatService.getChatUserByUserId(Number(this.chatWithUserId));
      this.userCommunication = [];
      // this.sendMessage();
    });
  }


  postMessage() {
    if (this.isConnected) {
      this.sendMessage(this.message)

    }
  }

  receiveMessages(message) {
    const communication = new ChatCommunication(message.chat_message,
      new Date(message.date),
      this.chatService.getChatUserByUserId(Number(message.from_user_id)),
      this.chatService.getChatUserByUserId(Number(message.to_user_id)));
    return communication;
  }

  sendMessage(message) {
    if (this.isConnected) {
      this.socket.sendMessage(message, this.chatWithUserId).
        then(data => {
          const communication = new ChatCommunication(message, new Date(), this.currentLoggedInUser, this.currentActiveChatWithUSer);
          this.userCommunication.push(communication);
          this.message = '';
        },
          err => {
            console.log('Error while chating');
          });
    }

  }


}

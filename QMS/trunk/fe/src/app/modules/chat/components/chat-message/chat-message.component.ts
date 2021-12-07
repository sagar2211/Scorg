import { Component, OnInit, Input } from '@angular/core';
import { ChatCommunication } from '../../models/chatCommunication';
import { ChatUser } from '../../models/chat-user';

@Component({
  selector: 'app-chat-message',
  templateUrl: './chat-message.component.html',
  styleUrls: ['./chat-message.component.scss']
})
export class ChatMessageComponent implements OnInit {

  @Input() chatCommunication: ChatCommunication;
  @Input() currentLoggedInUser: ChatUser;
  constructor() { }

  ngOnInit() {
  }

}

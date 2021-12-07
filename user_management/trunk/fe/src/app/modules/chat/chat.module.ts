import { SignalRCharSocket } from './../display/services/signalRChat.socket.service';
import { ChatService } from './services/chat.service';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatHomeComponent } from './components/chat-home/chat-home.component';
import { ChatUsersComponent } from './components/chat-users/chat-users.component';
import { ChatRoomComponent } from './components/chat-room/chat-room.component';
import { Routes, RouterModule } from '@angular/router';
import { ChatMessageComponent } from './components/chat-message/chat-message.component';


const chatRoutes: Routes = [{
  path: '', component: ChatHomeComponent,
  children: [{
    path: '', redirectTo: 'chat-room', pathMatch: 'full'
  },
  {
    path: 'chat-room',
    component: ChatRoomComponent,
    // data: { displayName: 'Schedule' }
    // data: { breadCrumInfo: { display: 'Schedule', route: 'app/schedule/activeScheduleList', redirectTo: 'app/schedule/addScheduleMaster',
    // isFilter: true,  isAddPopup: true,  btntext: 'ADD MASTER SCHEDULE'  } },
  }, {
    path: 'chat-room/:id',
    component: ChatRoomComponent,
  }]
}];

@NgModule({
  declarations: [
    ChatHomeComponent,
    ChatUsersComponent,
    ChatRoomComponent,
    ChatMessageComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(chatRoutes),
    FormsModule
  ],
  providers: [ChatService, SignalRCharSocket]
})

export class ChatModule { }

import { Component, OnInit } from '@angular/core';
import { UsersService } from 'src/app/services/users.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ChatService } from '../../services/chat.service';
import { ChatUser } from '../../models/chat-user';

@Component({
  selector: 'app-chat-users',
  templateUrl: './chat-users.component.html',
  styleUrls: ['./chat-users.component.scss']
})
export class ChatUsersComponent implements OnInit {
  usersList: Array<ChatUser> = [];
  constructor(
    private router: Router,
    private chatService: ChatService) { }

  ngOnInit() {
    this.getUserList();
  }



  getUserList() {
    const obj = {
      limit_per_page: 20,
      current_page: 1,
      sort_order: 'asc',
      sort_column: 'name',
      global_search: '',
      searchCondition: {
        role_type_id: '',
        status: '',
        from_date: null,
        primary_role_id: '',
        department_id: '',
      }
    };
    this.chatService.getChatUserList().subscribe(result => {
      this.usersList = result;

    });


  }
  selectChatingUser(event) {
    let selectedUserId = event.target.dataset.selectedUser;
    if (selectedUserId) {
      this.router.navigate(['chat-room/', { queryParams: { id: selectedUserId } }]);
    }
  }

}

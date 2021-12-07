import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { ChatUser } from '../models/chat-user';
import * as _ from 'lodash';

@Injectable()
export class ChatService {
  baseUrl = environment.baseUrl;
  private chatUserLists = new Array<ChatUser>();

  constructor(private http: HttpClient) { }

  getChatUserList(): Observable<any> {

    if (this.chatUserLists.length > 0) {
      return of(this.chatUserLists);
    }
    return this.http.get(`${this.baseUrl}/UserIdentity/getChatUserList`).pipe(
      map((res: any) => {
        let userList: Array<ChatUser> = [];
        if (res.status_code === 200 && res.status_message === 'Success') {
          _.forEach(res.user_details, (user) => {
            userList.push(new ChatUser(user.userId, user.userName, user.key, user.lastAccessedTime));
          });
          userList = _.sortBy(userList, 'status');
          this.chatUserLists = userList;
          return userList;
        } else {
          return [];
        }
      })
    );
  }

  getChatUserByUserId(userId: number) {
    return _.find(this.chatUserLists, { id: userId });
  }

}

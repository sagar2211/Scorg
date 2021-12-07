export class LoginModel {
  name: string;
  user_id: string;
  email: string;

  isObjectValid(obj: any) {
    return obj.hasOwnProperty('auth_token') ? true : false;
  }
}

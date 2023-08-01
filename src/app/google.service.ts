import { Injectable } from '@angular/core';
import {AuthConfig, OAuthService} from "angular-oauth2-oidc";
import {Observable, Subject} from "rxjs";
import {HttpClient, HttpHeaders} from "@angular/common/http";


const authCodeFlowConfig: AuthConfig = {
  issuer: 'https://accounts.google.com',
  strictDiscoveryDocumentValidation: false,
  redirectUri: 'http://localhost:4200',
  clientId: '327036694252-bcorsuhabd9gs34mqe0dakmggktk25f1.apps.googleusercontent.com',
  scope:'openid profile email https://www.googleapis.com/auth/userinfo.profile' + ' https://www.googleapis.com/auth/userinfo.email ' +
    ' https://www.googleapis.com/auth/gmail.readonly'
}

@Injectable({
  providedIn: 'root'
})
export class GoogleService {
  userProfileSubject = new Subject<UserInfo>();
  private gmail = 'https://gmail.googleapis.com';
  constructor(private readonly oAuthService: OAuthService, private readonly httpClient: HttpClient) {
    oAuthService.configure(authCodeFlowConfig);
    oAuthService.loadDiscoveryDocument().then(() => {
      oAuthService.tryLoginImplicitFlow().then(() => {
          oAuthService.loadUserProfile().then((userProfile) => {
            oAuthService.getAccessToken();
            oAuthService.getIdToken();
            this.userProfileSubject.next(userProfile as UserInfo);
            localStorage.setItem('user', JSON.stringify(userProfile));
            console.log(userProfile);
          });
      });
    });
  }
  isLoggedIn(): boolean {
    return this.oAuthService.hasValidAccessToken();
  }

  loggin() {
    this.oAuthService.initCodeFlow();
  }

  emails(userId: string): Observable<any> {
    return this.httpClient.get(`${this.gmail}/gmail/v1/users/${userId}/messages`, { headers: this.authHeader() });
  }

  getMail(userId: string, mailId: string): Observable<any> {
    return this.httpClient.get(`${this.gmail}/gmail/v1/users/${userId}/messages/${mailId}`, {
      headers: this.authHeader(),
    });
  }

  private authHeader(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${this.oAuthService.getAccessToken()}`,
    });
  }

}

export interface UserInfo {
  info: {
    sub: string;
    email: string;
    name: string;
    picture: string;
  }
}

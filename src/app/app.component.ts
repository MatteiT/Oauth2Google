import {Component, OnInit} from '@angular/core';
import {GoogleService, UserInfo} from "./google.service";
import {OAuthService} from "angular-oauth2-oidc";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title = 'Oauth2';
  userInfo: UserInfo | undefined;

  constructor( private readonly GoogleService : GoogleService, private readonly oauthService: OAuthService) {
    this.GoogleService = GoogleService;
    this.oauthService = oauthService;
  }

ngOnInit(): void {
  this.oauthService.loadDiscoveryDocument().then(() => {
    this.GoogleService.userProfileSubject.subscribe((userInfo) => {
      this.userInfo = userInfo;
      localStorage.setItem('user', JSON.stringify(userInfo));
      localStorage.setItem('token', this.oauthService.getAccessToken());
      const sub = this.userInfo['info'].sub;
      this.GoogleService.emails(sub).subscribe(emails => {
          console.log(emails);
      }
      );
    });
  });
}

  isLoggedIn(): boolean {
    return this.oauthService.hasValidAccessToken();
  }
  login() {
    this.GoogleService.loggin();
  }

}

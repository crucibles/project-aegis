
// Core imports
import {
    Injectable
} from '@angular/core';

import {
    CookieService
} from 'ngx-cookie-service';

@Injectable()
export class AuthService {

    constructor(
        private cookieService: CookieService
    ) { }

    public isLoggedIn(): boolean {
        if (localStorage.getItem('currentUser')){
            return true;
        }
        return false;
    }

}
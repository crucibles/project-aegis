import { 
    Component, 
    OnInit 
} from '@angular/core';

import {
    Router, 
    ActivatedRoute
} from '@angular/router';

import {
    UserService
} from 'shared/services';

import { 
    ToastsManager 
} from 'ng2-toastr';

@Component({
    selector: 'app-verify-email',
    templateUrl: './verify-email.component.html',
    styleUrls: ['./verify-email.component.css']
})
export class VerifyEmailComponent implements OnInit {
    email: String;
    code: String;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private userService: UserService,
        private toastr: ToastsManager
    ) {}

    ngOnInit() {
        this.email = null;
        this.code = null;
        this.route.queryParams.subscribe(params => {
            if(params.verify) {
                this.code = params.verify;
                this.userService.verifyEmail(params.verify).subscribe(verified => {
                    if (verified) {
                        // User account is successfully verified.
                        this.email = verified.toString();
                        this.toastr.success("Try loggin in to your account now!", "Account verified!");
                    } else {
                        // User account is not verified.
                        this.toastr.warning("Sorry your account verification failed.", "Verification failed!");
                    }
                });
            } else {
                // Verification code cannot be found in URL parameters.
                this.toastr.error("You are not supposed to be here.", "Restricted access!");
            }
        });
    }

    checkEmailAndCode(){
        if(this.email && this.code){
            return 1;
        } else if(this.email && !this.code){
            return 2;
        } else {
            return 3;
        }
    }

    // Redirects to the login page.
    goToLogin() {
        this.router.navigate(['/log-in']);
    }
}
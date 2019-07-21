// Core Imports
import {
    Component,
    OnInit
} from '@angular/core';

import {
    FormBuilder,
    FormControl,
    FormGroup,
    Validators
} from '@angular/forms';

import {
    ActivatedRoute,
    Router
} from '@angular/router';

// Application Imports
import {
    User
} from 'shared/models';

import {
    UserService
} from 'shared/services';

import {
    AlertService
} from 'shared/services/alert.service';

// Third-Party Imports
import {
    ToastsManager
} from 'ng2-toastr';

@Component({
    selector: 'log-in',
    templateUrl: './log-in.component.html',
    styleUrls: ['./log-in.component.css']
})
export class LogInComponent implements OnInit {
    public signupForm: FormGroup;
    loginForm: FormGroup;
    returnUrl: string;

    /**
     * Determines whether the user is still logging in or not.
     * Mainly used for the log-in button (whether it is 'Log In' or 'Logging In...')
     */
    isLoggingIn: boolean = false;

    constructor(
        private formBuilder: FormBuilder,
        private alertService: AlertService,
        private router: Router,
        private route: ActivatedRoute,
        private toastr: ToastsManager,
        private userService: UserService,
    ) {
        this.loginForm = formBuilder.group({
            email: [null, Validators.email],
            password: null
        });
    }

    ngOnInit() {
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'];
        this.isLoggingIn = false;
    }

    logIn() {
        let email = this.loginForm.value.email;
        let password = this.loginForm.value.password;
        this.isLoggingIn = true;
        this.userService.logIn(email, password).subscribe(user => {
            if (user) {
                // User exists.
                user = new User(user);
                this.toastr.success("You are succesfully logged in!", "Welcome " + user.getUserFirstName());
                this.router.navigateByUrl(this.returnUrl? this.returnUrl: user.getUserType()+'/general/select-course');
            } else {
                // Either non-existent user, wrong inputs, or unvalidated accounts.
                this.toastr.warning("Invalid email or password.", "Error");
                this.isLoggingIn = false;
            }
        }, error => {
            // login failed so display error
            this.alertService.error(error);
        });
    }

    /**
     * Redirects the user to the sign-up page.
     */
    userSignUp() {
        this.router.navigate(['/sign-up']);
    }

    /**
     * Redirects the user to the password-recovery page.
     */
    recoverPassword() {
        this.router.navigate(['change-password']);
    }

    get email() {
        return this.loginForm.get('email') as FormControl;
    }

    get password() {
        return this.loginForm.get('password') as FormControl;
    }
}

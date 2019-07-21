//Core Imports
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
    Router
} from '@angular/router';

//Application Imports
import {
    UserService
} from 'shared/services';

// Third-Party Imports
import { 
    ToastsManager 
} from 'ng2-toastr';

@Component({
    selector: 'app-sign-up',
    templateUrl: './sign-up.component.html',
    styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent implements OnInit {
     signupForm: FormGroup;
    // Stored here is the security questions in the sign up form.
     questions: string[] = new Array();

    constructor(
        private formBuilder: FormBuilder,
        private userService: UserService,
        private router: Router,
        private toastr: ToastsManager
    ) {
        this.signupForm = formBuilder.group({
            firstName: null,
            middleName: null,
            lastName: null,
            birthdate: null,
            schoolId: null,
            contactNumber: null,
            // Validates the format of the email input.
            email: [null, Validators.email],
            home: null,
            password: null,
            confirmPassword: null,
            securityQuestion: null,
            securityAnswer: null,
            type: null
        });
    }

    submit() {
        let firstName = this.signupForm.value.firstName;
        let middleName = this.signupForm.value.middleName;
        let lastName = this.signupForm.value.lastName;
        let birthdate = this.signupForm.value.birthdate;
        let schoolId = this.signupForm.value.schoolId;
        let contactNumber = this.signupForm.value.contactNumber;
        let email = this.signupForm.value.email;
        let home = this.signupForm.value.home;
        let password = this.signupForm.value.password;
        let securityQuestion = this.signupForm.value.securityQuestion;
        let securityAnswer = this.signupForm.value.securityAnswer;
        let type = this.signupForm.value.type;
        let verified = false;
        let userConditions = {
            hp: "",
            xp: 0,
            ailment: "",
            status: "",
            log_in_streak: 0,
            log_in_total: [],
            items: [],
            items_used: [],
            items_owned: [],
            head: "",
            footwear: "",
            armor: "",
            left_hand: "",
            right_hand: "",
        }

        this.userService.register(
            firstName,
            middleName,
            lastName,
            birthdate,
            schoolId,
            contactNumber,
            email,
            home,
            password,
            securityQuestion,
            securityAnswer,
            type,
            verified,
            userConditions
        ).subscribe(newUser => {
            if (newUser) {
                // Successful registration of user and redirects to login page.
                this.router.navigate(['/log-in']);
                this.toastr.success("An email has been sent to " + email + ". Please verify before loggin in.", "Verifying Account");
            } else {
                // Unsuccessful registration of new user because of email already existing.
                this.toastr.warning("Email " + email + " already existed.", "Failed to register");
            }
        });
    }

    // Acquires the security questions from the database.
    getSecurityQuestions() {
        this.userService.getSecurityQuestions().subscribe(questions => {
            for (var x = 0; x < (questions[0].question.length); x++) {
                this.questions.push(questions[0].question[x]);
            }
        });
    }

    // Resets the form inputs.
    reset() {
        this.signupForm.reset();
    }

    /**
     * Checks if the input in the 'confirmPassword' form is not correct.
     * Used to call the ".errConfirmClass" in the CSS file. Cannot be combined with "confirmPass()".
     */
    errConfirmPass() {
        if (
            this.signupForm.get('confirmPassword').dirty && 
            (this.signupForm.get('confirmPassword').value != this.signupForm.get('password').value)
        ) {
            return true;
        } else return false;
    }

    /**
     * Checks if the input in the 'confirmPassword' form is correct.
     * Used to call the ".confirmClass" in the CSS file. Cannot be combined with "errConfirmPass()".
     */
    confirmPass() {
        if (
            this.signupForm.get('confirmPassword').dirty && 
            (this.signupForm.get('confirmPassword').value == this.signupForm.get('password').value)
        ) {
            return true;
        } else return false;
    }

    // Checks if the input in the 'securityQuestion' is set.
    selectSecurityQuestion() {
        if (this.signupForm.get('securityQuestion').dirty && this.signupForm.get('securityQuestion').valid) {
            return true;
        } else return false;
    }

    // Redirects the user in the login page.
    userLogin() {
        this.router.navigate(['/log-in']);
    }

    get schoolId() {
        return this.signupForm.get('schoolId') as FormControl;
    }

    get firstName() {
        return this.signupForm.get('firstName') as FormControl;
    }

    get middleName() {
        return this.signupForm.get('middleName') as FormControl;
    }

    get lastName() {
        return this.signupForm.get('lastName') as FormControl;
    }

    get birthdate() {
        return this.signupForm.get('birthdate') as FormControl;
    }

    get email() {
        return this.signupForm.get('email') as FormControl;
    }

    get home() {
        return this.signupForm.get('home') as FormControl;
    }

    get password() {
        return this.signupForm.get('password') as FormControl;
    }

    get confirmPassword() {
        return this.signupForm.get('confirmPassword') as FormControl;
    }

    get type() {
        return this.signupForm.get('type') as FormControl;
    }

    get contactNumber() {
        return this.signupForm.get('contactNumber') as FormControl;
    }

    get securityQuestion() {
        return this.signupForm.get('securityQuestion') as FormControl;
    }

    get securityAnswer() {
        return this.signupForm.get('securityAnswer') as FormControl;
    }

    ngOnInit() {
        this.getSecurityQuestions();
    }
}
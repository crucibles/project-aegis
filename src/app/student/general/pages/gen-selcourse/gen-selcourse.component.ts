//Core Imports
import {
	Component,
	OnInit,
	ViewChild
} from '@angular/core';

import {
	NgModel
} from '@angular/forms';

import {
	Router
} from '@angular/router';

//Application Imports
import {
	Course,
	Quest,
	Section,
	User
} from 'shared/models';

import {
	SectionService,
	UserService,
	PageService
} from 'shared/services';

import {
	ActivatedRouteSnapshot,
	ActivatedRoute
} from '@angular/router/src/router_state';

import {
	ToastsManager
} from 'ng2-toastr/src/toast-manager';

import {
	AsyncAction
} from 'rxjs/scheduler/AsyncAction';

import {
	BadgeModal
} from 'shared/pages/badge-modal/badge-modal';


@Component({
	selector: 'app-gen-selcourse',
	templateUrl: './gen-selcourse.component.html',
	styleUrls: ['./gen-selcourse.component.css']
})
export class GenSelcourseComponent implements OnInit {
	@ViewChild('badgeModal') badgeModal: BadgeModal;

	sections: Section[];
	courseSections: any[];
	table: any;
	courses: Course[];
	user: User;
	allcourses: Course[];
	instructors: User[];

	//for search bar
	course_search: string;
	isSearching: boolean = false;
	course_found: any[];

	dailyBadgeContent: any = {
		heading: "You earned your daily badge!",
		body: "Log in everyday to earn your daily badge. Five daily badges in a week earn you a weekly badge.",
		image: "/assets/images/daily-badge-2.png"
	}

	constructor(
		private pageService: PageService,
		private sectionService: SectionService,
		private userService: UserService,
		private router: Router,
		private toastr: ToastsManager
	) {
		this.pageService.isProfilePage(false);
	}

	ngOnInit() {
		let url = this.router.routerState.snapshot.url.split("/");
		//add toaster or warning to student what happened why redirected here
		if (url[2] == "specific") {
			this.pageService.isProfilePage(false);
			this.router.navigate(['student/general/select-course']);
		}
		this.getUser();
	}

	/**
	 * Obtains information of the current user
	 */
	getUser(): void {
		let currentUser = JSON.parse(localStorage.getItem("currentUser"));
		this.userService.getUser(currentUser._id)
			.subscribe(user => {
				this.user = new User(user);
				this.getUserSections(this.user.getUserId());
				if (!this.user.isLoggedInToday()) {
					this.userService.updateUserConditions(this.user.getUserId()).subscribe(x => {
						this.badgeModal.open();
						this.user.setLoggedInToday();
						this.userService.setCurrentUser(this.user);
					});
				}
			});
	}

	/**
	 * Obtains sections and its respective course of the current use
	 * @description Obtains sections and its respective course of the current user by storing it to 'courses' 
	 * and 'section' array respectively
	 * @param user_id id of the user whose array of 
	 * @returns an Array of objects with a structure of [{section: {Section}, course_name: Section's course_name}, {...}]
	 */
	getUserSections(user_id): void {
		this.sectionService.getUserSections(user_id)
			.subscribe(sections => {
				this.courseSections = sections;
				this.sections = sections.map(section => new Section(section.section));
				this.sections = this.sectionService.getSortedSections(
					this.sections,
					{
						sortColumn: "courseName",
						sortDirection: "asc"
					}
				);
				this.sectionService.setCurrentUserSections(sections);
				this.getInstructors(this.sections);
			});
	}

	/**
	 * Acquires the full name of the instructor based on the instructorId.
	 * @param instructorId 
	 */
	toInstructor(instructorId) {
		let user = instructorId ? this.instructors.filter(
			instructor => instructorId == instructor.getUserId()
		) : AsyncAction;
		
		return user && user.length > 0 ? user[0].getUserFullName() : "";
	}

	/**
	 * Acquires the corresponding instructors after searching for a course in the search bar.
	 */
	getInstructors(sections: any[]) {
		this.instructors = [];
		let tempInstructors: string[] = [];

		// Initializes the instructor array without any duplicates.
		sections.forEach(section => {
			if (tempInstructors == null) {
				// Initialization.
				tempInstructors.push(section.getInstructor());
			} else if (tempInstructors.indexOf(section.getInstructor()) == -1) {
				// Prevents duplication of instructor id.
				tempInstructors.push(section.getInstructor());
			}
		});

		// Converts the instructor id(s) into a new User object.
		tempInstructors.forEach(instructor => {
			this.userService.getUser(instructor).subscribe(user => {
				this.instructors.push(new User(user));
			});
		});
	}

	/**
	 * Obtains status of user's sections
	 */
	getStatusOfSection(students) {
		let currentUser = JSON.parse(localStorage.getItem("currentUser"));
		let student = students ? students.filter(user => user.user_id == currentUser._id) : AsyncAction;
		let status = student[0] ? student[0].status : "";

		if (status == "E") {
			return "Enrolled";
		} else if (status == "R") {
			return "Requesting";
		} else {
			return "Open";
		}

	}

	/**
	 * @summary searches the string entered by the user and stores result in 'course_found' variable
	 */
	search() {
		if (this.course_search == null || this.course_search.length == 0) {
			this.isSearching = false;
		} else if (this.course_search.length == 24) {
			this.isSearching = true;
			this.sectionService.searchSection(this.course_search).subscribe((sections) => {
				this.course_found = sections;
			})
		} else if (this.course_search.length > 0) {
			this.sectionService.searchSection(this.course_search).subscribe((sections) => {
				this.isSearching = true;
				this.course_found = sections;
				this.getInstructors(sections.map(course => new Section(course.section)));
			})
		}
	}

	openSectionPage(section_id: string) {
		this.pageService.openSectionPage(section_id);
	}

	/**
   * @description portal for post requests that regards to sections "api/sections"
   * @author Cedric Yao Alvaro
   * 
   * 1. Student requestin to enroll in a section
   */
	requestToEnroll(section_id: string) {
		this.sectionService.sendRequestToSection(this.user.getUserId(), section_id).subscribe((section) => {
			this.getUserSections(this.user.getUserId());
			this.course_search = null;
			this.search();
		});
	}

	onSorted($event) {
		this.courseSections = this.sectionService.getSortedSections(this.courseSections, $event);
	}
}

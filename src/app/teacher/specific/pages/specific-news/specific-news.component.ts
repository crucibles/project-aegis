//Core Imports
import {
	Component,
	OnInit,
	ViewChild,
	TemplateRef
} from '@angular/core';

import {
	ActivatedRoute
} from '@angular/router';

//Third-part Imports
import {
	Observable
} from 'rxjs/Observable';

import {
	Observer
} from 'rxjs/Observer';

//Application Imports
import {
	CommentPost,
	User
} from 'shared/models'

import {
	CommentPostService,
	UserService,
	PageService,
	SectionService,
	FileService
} from 'shared/services';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { FileUploader } from 'ng2-file-upload/ng2-file-upload';
import { saveAs } from 'file-saver';
import { ToastsManager } from 'ng2-toastr';

@Component({
	selector: 'app-specific-news',
	templateUrl: './specific-news.component.html',
	styleUrls: ['./specific-news.component.css']
})



export class SpecificNewsComponent implements OnInit {
	section_id: string;

	// create post info
	@ViewChild('createPost') createPostModal: TemplateRef<any>;
	private url = 'api/upload';
	public uploader: FileUploader = new FileUploader({ url: this.url, itemAlias: 'file' });
	bsModalRef: BsModalRef;
	createPostForm: FormGroup;

	commentPosts: CommentPost[];
	comments: CommentPost[][] = [];
	posters: User[] = [];
	currentUser: User;

	/**
	 * 
	 */
	commenters: User[][] = [];
	/**
	 * Comment contents of reply box of posts
	 */
	commentContent: string[] = [];
	commentObserver: Observer<any>;
	commentObservable: Observable<any> = new Observable(observer =>
		this.commentObserver = observer
	);

	fileName: string = "";


	constructor(
		private commentPostService: CommentPostService,
		private formBuilder: FormBuilder,
		private modalService: BsModalService,
		private pageService: PageService,
		private route: ActivatedRoute,
		private userService: UserService,
		private toastr: ToastsManager,
		private fileService: FileService
	) {
		this.uploader = new FileUploader({ url: this.url, itemAlias: 'file' });
	}

	ngOnInit() {

		//override the onAfterAddingfile property of the uploader so it doesn't authenticate with //credentials.
		this.uploader.onAfterAddingFile = (file) => { file.withCredentials = false; };
		//overide the onCompleteItem property of the uploader so we are 
		//able to deal with the server response.
		this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
			this.toastr.success("Well done!", "Upload success!");
			this.fileName = JSON.parse(response).uploadName;
			this.createNewPost();
		};

		this.setDefault();
		this.route.paramMap.subscribe(params => {
			this.section_id = params.get('sectionId');
			this.getUser();
			this.getAllCommentPosts();
			let subscription = this.commentObservable.subscribe(value => {
				this.appendComments(value);
			});
			this.initializeForm();
		});
	}

	setDefault() {
		this.pageService.isProfilePage(false);

	}

	getUser() {
		//return this function once working okay
		this.currentUser = new User(JSON.parse(localStorage.getItem("currentUser")));
	}

	createNewPost() {
		if (this.createPostForm.invalid) {
			//AHJ: unimplemented; how to toaster
			return;
		}
		console.warn(this.fileName);
		//setting commentpost
		let newPost = new CommentPost();
		let postContent = this.createPostForm.get('postContent').value;
		let commentable = this.createPostForm.get('commentable').value;
		newPost.setCommentPost(
			this.section_id,
			this.currentUser.getUserId(),
			postContent,
			[],
			new Date(Date.now()),
			commentable,
			true,
			this.fileName
		);

		this.commentPostService.addCommentPost(newPost).subscribe(x => {
			console.log(x);
		});
	}

	/**
	 * Gets the commentposts of the current user
	 * @description Gets the commentposts of current user by adding the obtained commentpost into
	 * 'commentposts' array and adding its respective comments into 'comments' array.
	 * 
	 * @see getAllComments()
	 * @see appendComment()
	 */
	getAllCommentPosts() {
		this.commentPostService.getSectionPosts(this.section_id).subscribe(newCommentPosts => {
			//converts received commentposts into CommentPost class
			if (newCommentPosts) {
				console.warn(newCommentPosts);
				let commentPosts = newCommentPosts.map(posts => new CommentPost(posts));

				//stores only main/parent commentposts to 'commentPosts' variable
				this.commentPosts = commentPosts.filter(post => post.getIsPost() == true);

				//stores comments from the array of section posts
				let newComments = commentPosts.filter(post => post.getIsPost() == false);

				//sorts commentPosts chronologically from recent to oldest
				this.commentPosts = this.commentPosts.sort((a, b) => {
					return this.getTime(b.getPostDate()) - this.getTime(a.getPostDate());
				});

				//obtain users/posters of each commentposts and stores it to 'posters' variable
				this.commentPosts.forEach((post, index) => {
					this.commenters[index] = [];
					this.comments[index] = [];
					this.posters = [];
					console.log(post);
					this.userService.getUser(post.getUserId()).subscribe(user => {
						console.warn(user);
						let newUser = new User(user);
						this.posters[index] = newUser;
						post.getPostComments().forEach(postId => {
							let newComment = newComments.find(comment => comment.getPostCommentId() == postId);
							if (newComment) {
								console.log(newComment);
								this.commentObserver.next({ parent_index: index, comment: newComment });
							}
						});
					});
				});
				// console.warn(this.posters);
				// this.getAllComments();
			}
		});
	}

	/**
	 * Gets the comments of the given (main) commentposts
	 */
	getAllComments() {
		for (let i = 0; i < this.commentPosts.length; i++) {
			this.comments[i] = [];

			this.commentPosts[i].getPostComments().forEach(comment_id => {
				this.commentObserver.next({ parent_index: i, comment_id: comment_id });
			});

			this.comments[i].sort((a, b) => {
				return this.getTime(a.getPostDate()) - this.getTime(b.getPostDate());
			});
		}

		console.log(this.commentPosts);
		console.log(this.comments);
	}

	/**
	 * Appends the received comment into 'comments' array
	 * @description Appends the received comment into 'comments' array by obtaining its information using 
	 * the received 'comment_id' from 'comment_info' parameter and add received comment information
	 * to its parent post's comments which is to the 'commentposts' array whose index is 'parent_index'
	 * which is found in 'comment_info' as well
	 * @param comment_info contains the comment_id and parent_index of the to-be-appended comment;
	 * @param comment_info.comment_id id of the comment to be appended
	 * @param comment_info.parent_index the index of the 'commentposts' array where 
	 * the comment is to be appended
	 */
	appendComments(comment_info: any) {
		//obtains the comment with id of comment_info.comment_id
		// this.commentPostService.getCommentPost(comment_info.comment_id)
		// 	.subscribe(comment => {
		// 		//obtain user/commenter of the commentpost and stores it to 'commenters' variable
		// 		let newComment = new CommentPost(comment);

		// 	});
		let newComment = new CommentPost(comment_info.comment);
		this.userService.getUser(newComment.getUserId()).subscribe(user => {
			let newUser = new User(user);

			this.commenters[comment_info.parent_index].push(newUser);
			this.comments[comment_info.parent_index].push(newComment);
			this.comments[comment_info.parent_index] = this.comments[comment_info.parent_index].sort((a, b) => {
				return this.getTime(b.getPostDate()) - this.getTime(a.getPostDate());
			});
		});

	}

	initializeForm() {
		this.createPostForm = this.formBuilder.group({
			commentable: new FormControl("Y", Validators.required),
			postContent: new FormControl("", Validators.required)
		});
	}



	openCreatePostModal() {
		this.bsModalRef = this.modalService.show(this.createPostModal);
	}

	download(fn: any) {
		this.fileService.download(fn).subscribe(res => {
			saveAs(res, fn);
			err => console.warn(err);
		})
	}

	/**
	 * Submits the added comment to a main post
	 * @param parentPostIndex the index of the parent's post where the comment is to be submitted
	 */
	submitComment(parentPostIndex: number) {
		//creates a CommentPost instance of the new comment
		let newComment: CommentPost = new CommentPost();
		newComment.setCommentPost(this.section_id, this.currentUser.getUserId(), this.commentContent[parentPostIndex], "", new Date(), true, false, "");
		console.log(newComment);
		//add comment to the database
		//Note to self: must change appendComment to accomodate comment instead of comment_id for fewer querying
		this.commentPostService.attachComment(newComment, this.commentPosts[parentPostIndex].getPostCommentId()).subscribe(() => {
			//appends the comments (by calling appendComment() through commentObserver.next())
			this.commentObserver.next(
				{
					parent_index: parentPostIndex,
					comment: newComment
				}
			);
		});

		this.commentContent[parentPostIndex] = ""; //resets the comment
	}

	/* Helper functions */

	/**
	 * Formats the date in datestring of format Month DD, YYYY HH:MM am/pm
	 * @param date Date to be formatted
	 * 
	 * @example "August 2, 1997 11:40 am"
	 */
	private displayTimeDate(date: Date) {
		let displayDateTime: string = this.pageService.formatDateTime(date);
		return displayDateTime;
	}

	/* For undefined checking */
	private getTime(date?: Date) {
		date = new Date(date);
		return date != null ? date.getTime() : 0;
	}
}

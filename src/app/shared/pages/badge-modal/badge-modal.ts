// Core imports
import {
    Component,
    OnInit,
    TemplateRef,
    ViewChild,
    Input
} from '@angular/core';

import {
    ActivatedRoute
} from '@angular/router';

import {
    BsModalRef,
    BsModalService
} from 'ngx-bootstrap';

@Component({
    selector: 'badge-modal',
    templateUrl: './badge-modal.html',
    styleUrls: ['./badge-modal.css']
})
export class BadgeModal implements OnInit {
    @ViewChild('badgeModal') badgeModal: TemplateRef<any>;

    @Input('content') content: any; 

    private heading: string = "";
    private body: string = "";
    private image: string = "";

    private bsModalRef: BsModalRef;

    constructor(
        private modalService: BsModalService
    ) { }

    ngOnInit() {
        console.log(this.content);
        this.heading = this.content && this.content.heading? this.content.heading: ""; 
        this.body = this.content && this.content.body? this.content.body: ""; 
        this.image = this.content && this.content.image? this.content.image: ""; 
    }
    
    open() {
        // and use the reference from the component itself
        this.bsModalRef = this.modalService.show(this.badgeModal);
    }
    
    openContent(content){
        this.heading = content && content.heading? content.heading: ""; 
        this.body = content && content.body? content.body: ""; 
        this.image = content && content.image? content.image: ""; 
        this.open();
    }
    
}

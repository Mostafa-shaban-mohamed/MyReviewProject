import React, { Component } from 'react';
import authService from './api-authorization/AuthorizeService';
import { Modal } from 'react-bootstrap';

export class Comment extends Component {
    static displayName = Comment.name;

    constructor(props) {
        super(props);
        this.state = {
            isShow: false, //shwo or hide modal pop up of comment section
            showAddField: true, //show ot hide comment field (isHidden)
            validSpan: "", //contains type of validation in comment field
            comments: [],
            userEmail: "",
            isEdit: false,
            deleteCount: 0,
            confirmDelete: "",
            toggle: false
        };

        this.handleFetchComments = this.handleFetchComments.bind(this);
        this.EnterCommentDecriptionField = this.EnterCommentDecriptionField.bind(this);
        this.ListOfComments = this.ListOfComments.bind(this);
        this.getUserEmail = this.getUserEmail.bind(this);
        this.handleDeleteComment = this.handleDeleteComment.bind(this);
    }

    //life cycle
    componentDidMount() {
        this.getUserEmail();
    }

    //get user emali and store it for later use
    async getUserEmail() {
        var user = await authService.getUser();
        this.setState({ userEmail: user.name });
    }

    //add new comment to database
    handleCreateComment() {
        //var user = await authService.getUser();
        var commentField = document.getElementById("CommentDescrip").value;
        fetch('https://localhost:44340/api/Comments/', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'Commenter': this.state.userEmail,
                'CommentDescription': commentField,
                'ReviewIDCommentedOn': this.props.reviewID
            })
        }).then((res) => { this.setState({ showAddField: !this.state.showAddField }) });
    }

    //edit certain comment and save it
    handleEditComment() {
        var commentField = document.getElementById("CommentDescrip").value;
        var commentid = document.getElementById("OnlyForID").value;
        fetch('https://localhost:44340/api/Comments/' + commentid, {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "ID": commentid,
                'Commenter': this.state.userEmail,
                'CommentDescription': commentField,
                'ReviewIDCommentedOn': this.props.reviewID
            })
        }).then(() => {
            this.setState({ showAddField: !this.state.showAddField, isEdit: !this.state.isEdit });
            document.getElementById("CommentDescrip").value = "";
            document.getElementById("OnlyForID").value = "";
            //add the changes to the list
            this.handleFetchComments(this.props.reviewID);
        });
    }

    //delete certain comment from DB
    handleDeleteComment(commentid) {
        if (!this.state.toggle) {
            this.setState({ confirmDelete: "Are sure you want to delete this comment?", toggle: !this.state.toggle });
        } else {
            this.setState({ confirmDelete: "", toggle: !this.state.toggle });
        }
        if (this.state.deleteCount >= 2) {
            fetch('https://localhost:44340/api/Comments/' + commentid, { method: 'DELETE' })
                .then((res) => { document.getElementById("viewComments").click(); this.setState({ deleteCount: 0 }) });
        }
        
    }

    //fetch list of comments on certain review
    async handleFetchComments(reviewID) {
        var response = await fetch('https://localhost:44340/api/Comments/'+reviewID, {
            method: 'GET'
        });
        //alert(response.status);
        var data = await response.json();
        this.setState({ comments: data });
        this.ListOfComments(this.state.comments);
    }

    render() {
        return (
            <div>
                <button className="btn-rev" onClick={() => { this.setState({ isShow: !this.state.isShow }) }}>View Comments</button>
                <div>
                    <Modal show={this.state.isShow} onHide={() => { this.setState({ isShow: !this.state.isShow }) }}>
                        <Modal.Header closeButton>
                            <h5>{this.props.title}</h5>
                        </Modal.Header>
                        <Modal.Body>
                            <p className="writtenBy">Written By {this.props.writtenBy}</p>
                            <p>{this.props.decr}</p>
                            <p>Rating: {this.props.rating}</p>
                            <div>
                                <button className="btn-rev" onClick={() => {
                                    this.setState({ showAddField: !this.state.showAddField })
                                }}><i class="fa fa-plus"></i> Add Comment</button>
                                {this.EnterCommentDecriptionField(this.state.showAddField)}
                                <br />
                                <button className="btn-rev" id="viewComments"
                                    onClick={() => { this.handleFetchComments(this.props.reviewID) }}>
                                    <i class="fa fa-eye"></i> Show Comments
                                </button>
                                <div>{this.ListOfComments(this.state.comments)}</div>
                            </div>
                        </Modal.Body>
                        <Modal.Footer>
                            <button className="btn-rev" onClick={() => { this.setState({ isShow: !this.state.isShow }) }}>Close</button>
                        </Modal.Footer>
                    </Modal>
                </div>
            </div>
        );
    }

    //check vaildation when adding new comment
    Validation() {
        var commentField = document.getElementById("CommentDescrip").value;
        if (!commentField) {
            this.setState({ validSpan: "Can't be Empty" });
        } else {
            this.setState({ validSpan: "" });
            //send comment to handleCreateComment or handleEditComment method
            if (this.state.isEdit) {
                this.handleEditComment();
            } else {
                this.handleCreateComment();
            }
            
        }
        
    }

    //renders create comment field
    EnterCommentDecriptionField(isHidden) {
        return (
            <div className="commentField" hidden={isHidden}>
                <input hidden={true} id="OnlyForID" />
                <input className="form-control" id="CommentDescrip" placeholder="Enter Your Comment" />
                <button className="btn-rev" id="SubmitBtn" onClick={() => { this.Validation() }}>Save</button>
                <span className="error">{this.state.validSpan}</span>
            </div>
        );
    }

    //prepare for edit
    prepareEditForm(comment) {
        if (!this.state.isEdit) {
            document.getElementById("CommentDescrip").value = comment.commentDescription;
            document.getElementById("OnlyForID").value = comment.id;
        } else {
            document.getElementById("CommentDescrip").value = "";
            document.getElementById("OnlyForID").value = "";
        }
        this.setState({ showAddField: !this.state.showAddField, isEdit: !this.state.isEdit });
    }

    //render comments list on certain review
    ListOfComments(comments) {
        return (
            <ul id="commentList">
                {comments.map(comment =>
                    <li id="singleComment">
                        {comment.commentDescription}
                        {comment.commenter === this.state.userEmail ?
                            <div><button className="btn-rev" onClick={() => { this.prepareEditForm(comment) }}><i class="fa fa-edit"></i> {this.state.isEdit === false ? "Edit" : "Unedit"}</button>
                                <button className="btn-rev" onClick={() => {
                                    this.setState({ deleteCount: this.state.deleteCount + 1 },
                                        () => { this.handleDeleteComment(comment.id) })
                                }}><i class="fa fa-trash"></i> Delete</button></div> : ""
                        }
                        <span id="confirmDelete" className="error">{this.state.confirmDelete}</span>
                    </li>
                )}
            </ul>
        );
    }

}
import React, { Component } from 'react';
import authService from './api-authorization/AuthorizeService';
import { Modal } from 'react-bootstrap';
import { Comment } from './Comment';

export class Review extends Component {
    static displayName = Review.name;

    constructor(props) {
        super(props);
        this.state = {
            fields: {},
            errors: {},
            isAuthenticated: false,
            reviews: [],
            searchReviews: [],
            loading: true,
            isEditMethod: false,
            isSearch: false,
            show: false,
            deleteID: "",
            userID: "",
            pageNumber: 1
        };
        
        this.handleValidation = this.handleValidation.bind(this);
        this.handleDeleteReview = this.handleDeleteReview.bind(this);

        this.renderReviewList = this.renderReviewList.bind(this);
        this.renderDeleteModalPopUp = this.renderDeleteModalPopUp.bind(this);

        this.renderReviewListOfAllUsers = this.renderReviewListOfAllUsers.bind(this);
        this.Paging = this.Paging.bind(this);
        //this.MyReviewListOfAllUsers = this.MyReviewListOfAllUsers.bind(this);
    }

    // ------------------------------------- life cycle methods ------------------------------

    componentDidMount() {
        // Get the element with id="defaultOpen" and click on it
        document.getElementById("defaultOpen").click();
        //get user review list
        this.MyReviewList();

    }

    componentDidUpdate() {
        //get user review list
        this.MyReviewList();
    }

    // ---------------------------------- Delete review methods -----------------------------------

    //only show modal pop up
    showModalpopUp = (id) => {
        this.setState({ show: !this.state.show, deleteID: id });
    }

    //do the actual delete
    async handleDeleteReview(id) {
        var response = await fetch('https://localhost:44340/api/Reviews/' + id, {
            method: 'DELETE'
        })
            .then(() => { this.setState({ show: !this.state.show, deleteID: "" }) });
    }

    //delete modal pop up
    renderDeleteModalPopUp() {
        return (
            <div>
                <Modal show={this.state.show} onHide={() => { this.setState({ show: !this.state.show }); }}>
                    <Modal.Header closeButton><h5>Delete</h5></Modal.Header>
                    <Modal.Body><p>Are you sure you want to delete this review?</p></Modal.Body>
                    <Modal.Footer>
                        <button className="btn-rev" onClick={() => { this.setState({ show: !this.state.show }); }}>Close</button>
                        <button className="btn-rev"
                            onClick={() => { this.handleDeleteReview(this.state.deleteID) }}>
                            <i class="fa fa-trash"></i> Delete</button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }

    // --------------------------------- Create review methods ----------------------------------

    //handle validation in create review form
    handleValidation = () => {
        //let fields = this.state.fields;
        let errors = {};
        let formIsValid = true;

        var productRev = document.getElementById("ProductReviewed");
        var reviewDescription = document.getElementById("ReviewDescription");
        var rating = document.getElementById("FinalRating");

        //product
        if (!productRev.value) {
            formIsValid = false;
            errors["product"] = "Cannot be empty";
        }

        if (typeof productRev.value !== "undefined") {
            if (!productRev.value.match(/^[a-zA-Z0-9\s]+$/)) {// /^[a-zA-Z]+$/
                formIsValid = false;
                errors["product"] = "Only combination of letters and numbers";
            }
        }

        //reviewDescription
        if (!reviewDescription.value) {
            formIsValid = false;
            errors["reviewDescription"] = "Cannot be empty";
        }

        //Rating
        if (!rating.value) {
            formIsValid = false;
            errors["Rating"] = "Cannot be empty";
        }

        if (rating.value > 10) {
            formIsValid = false;
            errors["Rating"] = "Choose number between 0 t0 10";
        }

        this.setState({ errors: errors });
        return formIsValid;
    }

    // ------------------------------- display reviews methods ----------------------------------

    // ========================== MyReviewList ============================

    //fetch data from database and store it in state "reviews"
    async MyReviewList() {
        var user = await authService.getUser();
        var response = await fetch('https://localhost:44340/api/Reviews?pagenumber=' + this.state.pageNumber, {
            method: 'GET'
        });
        var data = await response.json();
        this.setState({ reviews: data, loading: false, userID: user.name });
    }

    //render user's review list from state "reviews"
    renderReviewList(reviews, user) {
        //handle the switch between myreviewlist and review form
        function handleEditReview(event) {
            document.getElementById("ProductReviewed").value = reviews.find(m => m.id == event.target.id).productReviewed;
            document.getElementById("ReviewDescription").value = reviews.find(m => m.id == event.target.id).reviewDescription;
            document.getElementById("FinalRating").value = reviews.find(m => m.id == event.target.id).finalRating;
            document.getElementById("ForEditOnly").value = reviews.find(m => m.id == event.target.id).id;
            document.getElementById("Keywords").value = reviews.find(m => m.id == event.target.id).keywords;
            //switch to review form tab
            document.getElementsByClassName("reviewForm")[0].click();
        }

        let userReviews = reviews.filter(function (e) {
             return e.reviewer == user;
         });
         
        //there will be comment component added later .....
        return (
            <div>
                {userReviews.map(review =>
                    <div className="reviewBlocks">
                        <h4>{review.productReviewed}</h4>
                        <p>{review.reviewDescription}</p>
                        <p>{review.finalRating}</p>
                        <p>{review.noOfComments}</p>
                        <button className="btn-rev" id={review.id} onClick={(event) => { handleEditReview(event) }}><i class="fa fa-edit"></i> Edit</button>
                        <button className="btn-rev"
                            id={review.id}
                            onClick={() => { this.showModalpopUp(review.id) }}><i class="fa fa-trash"></i> Delete</button>
                    </div>
                )}
            </div>
        );
    }

    // ========================= ReviewList =============================

    //render all reviews on system
    renderReviewListOfAllUsers(reviews) {
        return (
            <div>
                {reviews.map(review =>
                    <div className="reviewBlocks">
                        <h4>{review.productReviewed}</h4>
                        <p>{review.reviewDescription}</p>
                        <p>Rating: {review.finalRating}</p>
                        <p>Number of Comments: {review.noOfComments}</p>
                        <div>
                            <Comment reviewID={review.id} writtenBy={review.reviewer} title={review.productReviewed} rating={review.finalRating} decr={review.reviewDescription} />
                        </div>
                    </div>
                )}
                <br/>
            </div>
        );
    }

    //search method (we will add it to main fetching method later......)
    async Search() {
        var search = document.getElementById("SearchBox");
        if (search.value) {
            var response = await fetch('https://localhost:44340/api/Reviews/' + search.value, {
                method: 'GET',
            });
            var data = await response.json();
            if (data !== null) {
                this.setState({ searchReviews: data, isSearch: true });
            }
        } else {
            this.setState({ isSearch: false });
        }
    }

    //paging method
    async Paging(event) {
        if (event.target.id === "prev" && this.state.pageNumber > 1) {
            this.setState({ pageNumber: this.state.pageNumber - 1 });
        } else if (event.target.id === "next") {
            this.setState({ pageNumber: this.state.pageNumber + 1 });
        }
    }

    render() {
        //switch between tabs
        function openCity(evt, tabName) {
            var i, tabcontent, tablinks;
            tabcontent = document.getElementsByClassName("tabcontent");
            for (i = 0; i < tabcontent.length; i++) {
                tabcontent[i].style.display = "none";
            }
            tablinks = document.getElementsByClassName("tablinks");
            for (i = 0; i < tablinks.length; i++) {
                tablinks[i].className = tablinks[i].className.replace(" active", "");
            }
            document.getElementById(tabName).style.display = "block";
            evt.currentTarget.className += " active";
        }

        //method responsible for submitting create form to create method in backend code
        async function NewReviewForm(event, isvalid) {
            var productRev = document.getElementById("ProductReviewed");
            var reviewDescription = document.getElementById("ReviewDescription");
            var rating = document.getElementById("FinalRating");
            var keywords = document.getElementById("Keywords");
            var isEdit = document.getElementById("ForEditOnly");

            if (isEdit.value) { //check if html element which carries id value has id value.
                EditReviewForm(event);
            }
            //check if variables are not null & make valiadation if true
            else if (isvalid) { //valid
                var user = await authService.getUser();
                fetch('https://localhost:44340/api/Reviews', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        'ProductReviewed': productRev.value,
                        'ReviewDescription': reviewDescription.value,
                        'FinalRating': rating.value,
                        'Keywords': keywords.value,
                        "Reviewer": user.name
                    })
                })
                    .then(() => {
                        productRev.value = "";
                        reviewDescription.value = "";
                        rating.value = "";
                        //id.value = "";
                        keywords.value = "";
                        openCity(event, 'MyReviews');
                    });
            } 
            else { //error
                alert("Please Check validation of form");
            }
        }

        //method responsible for submitting edit form to edit method in backend code
        async function EditReviewForm(event) {
            var productRev = document.getElementById("ProductReviewed");
            var reviewDescription = document.getElementById("ReviewDescription");
            var rating = document.getElementById("FinalRating");
            var keywords = document.getElementById("Keywords");
            var id = document.getElementById("ForEditOnly");

            //there is no need to check if variable is null
            var user = await authService.getUser();
            fetch('https://localhost:44340/api/Reviews/' + id.value, {
                method: 'PUT',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    'ID': id.value,
                    'ProductReviewed': productRev.value,
                    'ReviewDescription': reviewDescription.value,
                    'FinalRating': rating.value,
                    'Keywords': keywords.value,
                    "Reviewer": user.name
                })
            })
                .then(() => {
                    productRev.value = "";
                    reviewDescription.value = "";
                    rating.value = "";
                    id.value = "";
                    keywords.value = "";
                    
                    openCity(event, "MyReviews");
                    
                });
        }

        //for rendering myreview list
        let contents = this.state.loading
            ? <p><em>Loading...</em></p>
            : this.renderReviewList(this.state.reviews, this.state.userID);

        //for rendering modal pop up
        let modalpopup = this.state.show
            ? this.renderDeleteModalPopUp(this.state.show)
            : <div></div>;

        let reviewRendered = this.state.isSearch? this.state.searchReviews : this.state.reviews;

        return (
            <div>
                <div className="tab">
                    <button className="tablinks reviewList" id="defaultOpen" onClick={(event) => { openCity(event, 'ReviewList') }}>Review List</button>
                    <button className="tablinks myReview" onClick={(event) => { openCity(event, 'MyReviews') }}>My Reviews</button>
                    <button className="tablinks reviewForm" onClick={(event) => { openCity(event, 'CreateReview') }}>Create/Edit Review</button>

                    <div className="search-container">
                        <input id="SearchBox" type="text" placeholder="Search..." />
                        <button className="btn" id="SearchBtn" onClick={() => { this.Search() }}><i class="fa fa-search"></i></button>
                    </div>
                </div>

                <div id="ReviewList" className="tabcontent">
                    <h3>Review List</h3>
                    {this.renderReviewListOfAllUsers(reviewRendered)}
                    <div>
                        <button className="btn-rev" id="prev" onClick={(event) => { this.Paging(event) }}><i class="fa fa-arrow-left"></i></button>
                        <button className="btn-rev" id="next" onClick={(event) => { this.Paging(event) }}><i class="fa fa-arrow-right"></i></button>
                    </div>
                </div>

                <div id="MyReviews" className="tabcontent">
                    <h3>My Reviews List</h3>
                    {contents}
                    {modalpopup}
                </div>

                <div id="CreateReview" className="tabcontent">
                    <h3>New Review</h3>
                    <br/>
                    <div>
                        <div>
                            <input hidden id="ForEditOnly" />
                        </div>
                        <div className="createRevField">
                            <label htmlFor="ProductReviewed" className="label-control">Product Being Reviewed</label>
                            <input type="text" id="ProductReviewed" className="form-control" placeholder="Product Name"/>
                            <span className="error">{this.state.errors["product"]}</span>
                        </div>
                        <div className="createRevField">
                            <label htmlFor="ReviewDescription" className="label-control">Review</label>
                            <textarea type="text-area" id="ReviewDescription" className="form-control" rows="5" cols="10" placeholder="Description"/>
                            <span className="error">{this.state.errors["reviewDescription"]}</span>
                        </div>
                        <div className="createRevField">
                            <label htmlFor="Keywords" className="label-control">Rating</label>
                            <input type="text" id="Keywords" className="form-control" placeholder="Example: keyword1, keyword2, ...." />
                            <span className="error">{this.state.errors["Keywords"]}</span>
                        </div>
                        <div className="createRevField">
                            <label htmlFor="FinalRating" className="label-control">Rating</label>
                            <input type="number" id="FinalRating" className="form-control" max="10" min="0" placeholder="Rating"/>
                            <span className="error">{this.state.errors["Rating"]}</span>
                        </div>
                        <div className="createRevField">
                            <p>
                                Before Submitting please notice that if there is anything offensive or illegal in your review,
                                we will remove your review.
                            </p>
                            <button
                                className="btn-rev"
                                type="submit"
                                onClick={(event) => { NewReviewForm(event, this.handleValidation()) }}>
                                <i class="fa fa-save"></i> Save
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
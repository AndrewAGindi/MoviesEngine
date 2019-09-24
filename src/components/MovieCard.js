import React from "react";
import PropTypes from "prop-types";
import * as util from "../util";

import Button from "react-bootstrap/Button";
import ButtonToolbar from "react-bootstrap/ButtonToolbar";
import Card from "react-bootstrap/Card";
import Media from "react-bootstrap/Media";
import Alert from "react-bootstrap/Alert";
import { Link } from "react-router-dom";
import Rating from "react-rating";

import { FaTicketAlt } from "react-icons/fa";
import { MdAddCircleOutline, MdRemoveCircleOutline, MdStarBorder, MdStar } from "react-icons/md";

class MovieCard extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            message: "",
            removed: false, 
        };
    }
    
    getPath = title => `/movies/${title.replace(/ /g, "_")}`;

    async addToWatchlist(title){
        if (util.isAuthenticated()){
            const response = await fetch("/api/watchlist/" + title);
            const movie = await response.json();
            if (movie.hasOwnProperty("title")){
                this.setState(
                    { message: <Alert variant="success">You have added {movie.title} to watchlist</Alert> }
                );             
            }
            else if (!movie.hasOwnProperty("title")){
                this.setState(
                    { message: <Alert variant="danger">This movie is already in your watchlist!</Alert> }
                );
            }
        }
        else {
            // TODO: add log in prompt message
            this.setState(
                { message: <Alert variant="danger">Please log in to use this function.</Alert> }
            );
        }
        console.log(this.state.message);
    }

    async removeFromWatchlist(title){
        title = title.replace(/ /g, "_");
        fetch("/api/watchlist/remove/" + title);
        this.setState({ removed: true });
    }

    renderButton(){
        if (this.props.fromWatchlist){
            return (
                <Button
                    variant="secondary"
                    onClick={() => this.removeFromWatchlist(this.props.title)}
                >
                    <MdRemoveCircleOutline />
                    Remove
                </Button>
            );
        } else {
            return (
                <Button
                    variant="secondary"
                    onClick={() => this.addToWatchlist(this.props.title)}
                >
                    <MdAddCircleOutline />
                    Add to Watchlist
                </Button>
            );
        }
    }

    render() {
        if (!this.state.removed){
            return (
                <Card
                    style={{ "--backdrop-url": `url(${this.props.backdropURL})` }}
                    className="card--movie"
                >
                    <Card.Body>
                        <Media as="article">
                            <img
                                src={this.props.posterURL}
                                width={128}
                                className="mr-3"
                            />
                            <Media.Body>
                                <h2>{this.props.title}</h2>
                                {this.props.rating &&
                                <Rating
                                    start={0}
                                    stop={5}
                                    step={1}
                                    initialRating={this.props.rating || 0}
                                    readonly={true}
                                    emptySymbol={<MdStarBorder />}
                                    fullSymbol={<MdStar />}
                                    className="mb-2"
                                    style={{ color: "var(--orange-light)", position: "relative", top: "-0.5rem" }}
                                /> || null
                                }
                                <p>{this.props.summary}</p>
                            </Media.Body>
                        </Media>
                    </Card.Body>
                    <Card.Footer>
                        <ButtonToolbar>
                            <Link to={this.getPath(this.props.title)}>
                                <Button
                                    variant="primary"
                                    className="mr-3"
                                >
                                    <FaTicketAlt />
                                    Buy ticket
                                </Button> 
                            </Link>    
                            {this.renderButton()}
                        </ButtonToolbar>
                        {this.state.message && this.state.message}
                    </Card.Footer>
                </Card>
            );
        } else {
            return null;
        }
    }
}


MovieCard.propTypes = {
    posterURL: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    summary: PropTypes.string.isRequired,
    rating: PropTypes.number,
};

export default MovieCard;

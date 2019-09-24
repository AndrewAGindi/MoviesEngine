import React from "react";
import PropTypes from "prop-types";

import MovieMap from "./MovieMap";
import Media from "react-bootstrap/Media";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";

import Rating from "react-rating";
import {MdStarBorder, MdStar } from "react-icons/md";


import { withRouter } from "react-router-dom";

class MoviesPage extends React.Component {
    constructor(props) {
        super(props);
        var today = () => {
            var today = new Date();
            var dd = String(today.getDate()).padStart(2, '0');
            var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
            var yyyy = today.getFullYear();

            return yyyy + '-' + mm + '-' + dd;
        }
        this.state = {
            movie: null,
            cinemas: [],
            date: today(),
            isLoading: false,
        };
        this.handleChange = this.handleChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    async componentDidMount() {
        this.setState({isLoading: true});
        // get movie name from URL
        const movie = this.props.match.params.name;
        // Load the API data
        const response1 = await fetch("/api/movies/" + movie);
        const movieInfo = await response1.json();

        if (movie !== movieInfo.title.replace(/ /g, "_")) {
            this.props.history.replace("/");
            this.props.history.replace(`/movies/${movieInfo.title.replace(/ /g, "_")}`);
            return;
        }

        await this.setState({movie: movieInfo});
        const response2 = await fetch("/api/cinemas/movies/" + movie +'/' + this.state.date);
        const cinemas = await response2.json();
        await this.setState({cinemas: cinemas}); 
        this.setState({isLoading: false});
        // DISQUS API 
        var disqus_config = await function () {
            window.page.url = "localhost:5000";  // Replace PAGE_URL with your page's canonical URL variable
            window.page.identifier = this.state.movie; // Replace PAGE_IDENTIFIER with your page's unique identifier variable
        };
        (function() { // DON'T EDIT BELOW THIS LINE
            var d = document, s = d.createElement('script');
            s.src = 'https://sengine.disqus.com/embed.js';
            s.setAttribute('data-timestamp', +new Date());
            (d.head || d.body).appendChild(s);
        })();
    }

    async handleChange(event) {
        await this.setState({date: event.target.value});
        await console.log("updated date to: ", this.state.date);
    }
    async handleSubmit(){
        this.setState({isLoading: true});
        const movie = this.props.match.params.name;
        const response = await fetch("/api/cinemas/movies/" + movie +'/' + this.state.date);
        const status = await response.status;
        if (status === 200) {
            // TODO: add loading screen?
            const cinemas = await response.json();
            this.setState({cinemas: cinemas, isLoading: false}); 
        }
    }
    
    render() {
        var cinemaMap;
        if (this.state.cinemas.length === 0 && !this.state.isLoading) {
            setTimeout(cinemaMap = <Alert variant="danger">Movie is not available on this day. Choose another day.</Alert>, 7000);
        }
        else if (this.state.isLoading){
            //cinemaMap = <p>Loading...</p>
            cinemaMap = (
                <div className="w-100 h-100 d-flex align-items-center justify-content-center">
                    <img src="/static/img/loading.png" />
                </div>
            );
        }
        else {
            cinemaMap = (
                <Container>
                    <MovieMap cinemas={this.state.cinemas} />
                </Container>
            );
        }

        // movie is loaded
        if (this.state.movie != null){
            return (
                <div>
                    <Container>
                        <Media as="article">
                            <img
                                src={this.state.movie.posterURL}
                                width={128}
                                className="mr-3"
                            />
                            <Media.Body>
                                <h2>{this.state.movie.title}</h2>
                                {this.state.movie.rating &&
                                <Rating
                                    start={0}
                                    stop={5}
                                    step={1}
                                    initialRating={this.state.movie.rating || 0}
                                    readonly={true}
                                    emptySymbol={<MdStarBorder />}
                                    fullSymbol={<MdStar />}
                                    className="mb-2"
                                    style={{ color: "var(--orange-light)", position: "relative", top: "-0.5rem" }}
                                /> 
                                }
                                <p>{this.state.movie.summary}</p>
                            </Media.Body>
                        </Media>
                    </Container>
                    <br></br>
                    <Container>
                    
                        Date: <input type="date" value={this.state.date} name="date" onChange={this.handleChange} />
                        <Button type="submit" onClick={this.handleSubmit} className="mr-3">Submit</Button> 
                    

                    {cinemaMap}
                    </Container>

                    <Container>
                        <h3>Reviews:</h3>
                        <div id="disqus_thread"></div>
                    </Container>
                </div>
            );
        }
        // movie not yet loaded
        if (this.state.movie === null){
            return (
                <div className="w-100 h-100 d-flex align-items-center justify-content-center">
                    <img src="/static/img/loading.png" />
                </div>
            );
        }
    }
}

MoviesPage.propTypes = {
    movie: PropTypes.object,
    cinemas: PropTypes.array,
    date: PropTypes.string,
};

export default withRouter(MoviesPage);

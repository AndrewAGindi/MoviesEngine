import React from "react";

import MovieCard from "~/components/MovieCard";

import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import ListGroup from "react-bootstrap/ListGroup";
import Row from "react-bootstrap/Row";

class WatchlistPage extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            movies: []
        }
    }
    async componentWillMount(){
        // Load the API data
        const response = await fetch("/api/watchlist");
        const movies = await response.json();

        await this.setState({movies});
        await console.log(this.state.movies.forEach(function(element){
            for (var property in element){
                if (element.hasOwnProperty(property)){
                    console.log(property, typeof property);
                }
            }
        }));
    }
    render() {
        while (this.state.movies.length === 0){
            return (
                <Container>
                    <Row>
                        <Col xs={9}>
                            <header className="d-flex justify-content-between">
                                <h1>Watchlist</h1>
                            </header>
                            <p>Your Watchlist is empty. </p>
                        </Col>
                    </Row>
                </Container>
            );
        }
        if (this.state.movies.length !== 0){
            return (
                <Container>
                    <Row>
                        <Col xs={9}>
                            <header className="d-flex justify-content-between">
                                <h1>Watchlist</h1>
                            </header>
                            <ListGroup variant="flush">
                                {this.state.movies
                                    .filter(movie => movie !== null)
                                    .map(({ posterURL, title, summary, backdropURL }) => (
                                        <ListGroup.Item
                                            key={title}
                                            className="pl-0 pr-0"
                                        >
                                            <MovieCard
                                                posterURL={posterURL}
                                                title={title}
                                                summary={summary}
                                                backdropURL={backdropURL}
                                                fromWatchlist={true}
                                            />
                                        </ListGroup.Item>
                                    ))
                                }
                            </ListGroup>
                        </Col>
                    </Row>
                </Container>
            );
        }
    }
}

export default WatchlistPage;

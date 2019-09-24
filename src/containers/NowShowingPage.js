import React from "react";
import PropTypes from "prop-types";

import MovieCard from "~/components/MovieCard";

import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import ListGroup from "react-bootstrap/ListGroup";
import Row from "react-bootstrap/Row";

import * as util from "~/util";
import { boundMethod } from "autobind-decorator";

class NowShowingPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            genres: [],
            selectedGenre: props.genre || null,
            movies: [],
            isLoading: true,
            sortBy: "popularity",
        };
    }

    async componentDidMount() {
        // Load the API data
        const response = await fetch("/api/now-showing");
        const movies = await response.json();

        // Extract the genres from the movies
        // Get rid of duplicates
        // Alphabetical sort
        const genres =
            movies
                .flatMap(({ genres }) => genres)
                .filter((g, i, arr) => arr.indexOf(g) == i)
                .sort();

        // Sort the movies
        //movies.sort(util.sortBy(x => x.popularity, true) || util.sortBy(x => x.title.toLowerCase()));
        movies.sort(util.chainSort(
            util.sortBy(x => x.popularity, true),
            util.sortBy(x => x.rating, true),
            util.sortBy(x => x.title.toLowerCase()),
        ));

        this.setState({
            genres,
            movies,
            isLoading: false,
        });
    }

    scrollToTop() {
        window.scrollTo({
            left: 0,
            top: (137 + 24),
            behavior: "smooth",
        });
    }

    @boundMethod
    _updateSort(sortBy) {
        const movies = [...this.state.movies];
        switch (sortBy) {
            case "popularity":
                // Sorts by popularity, falling back to rating then title for entries with equal popularity
                movies.sort(util.chainSort(
                    util.sortBy(x => x.popularity, true),
                    util.sortBy(x => x.rating, true),
                    util.sortBy(x => x.title.toLowerCase()),
                ));
                break;

            case "rating":
                movies.sort(util.chainSort(
                    util.sortBy(x => x.rating, true),
                    util.sortBy(x => x.popularity, true),
                    util.sortBy(x => x.title.toLowerCase()),
                ));
                break;

            case "title":
                movies.sort(util.sortBy(x => x.title.toLowerCase()));
                break;

            default:
                throw new Error(`Unknown sort type: '${sortBy}'`);
        }

        this.setState({
            movies,
            sortBy,
        });
    }

    @boundMethod
    updateSort(event) {
        const sortBy = event.target.value;
        this._updateSort(sortBy);
    }

    render() {
        if (this.state.isLoading) {
            return (
                <div className="w-100 h-100 d-flex align-items-center justify-content-center">
                    <img src="/static/img/loading.png" />
                </div>
            );
        }

        return (
            <Container>
                <Row>
                    <Col xs={3}>
                        <h1>Genres</h1>
                        <ListGroup className="list__filter">
                            {this.state.genres.map(g => (
                                <ListGroup.Item
                                    key={g}
                                    action
                                    active={g === this.state.selectedGenre}
                                    onClick={() => {
                                        if (g === this.state.selectedGenre) {
                                            this.setState({ selectedGenre: null });
                                        } else {
                                            this.setState({ selectedGenre: g });
                                        }

                                        this.scrollToTop();
                                    }}
                                >
                                    {g}
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    </Col>
                    <Col xs={9}>
                        <header className="d-flex justify-content-between now-showing-header">
                            <h1>Now Showing</h1>
                            <Form inline>
                                <label>
                                    Sort by &nbsp;
                                    <select value={this.state.sortBy} onChange={this.updateSort}>
                                        <option value="popularity">Popularity</option>
                                        <option value="rating">Rating</option>
                                        <option value="title">Title</option>
                                    </select>
                                </label>
                            </Form>
                        </header>
                        <ListGroup variant="flush">
                            {this.state.movies
                                .filter(({ genres }) =>
                                    this.state.selectedGenre === null
                                        ? true
                                        : genres.includes(this.state.selectedGenre)
                                )
                                .map(({ posterURL, title, summary, backdropURL, rating }) => (
                                    <ListGroup.Item
                                        key={title}
                                    >
                                        <MovieCard
                                            posterURL={posterURL}
                                            title={title}
                                            summary={summary}
                                            backdropURL={backdropURL}
                                            rating={rating}
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

NowShowingPage.propTypes = {
    genre: PropTypes.string,
};

export default NowShowingPage;

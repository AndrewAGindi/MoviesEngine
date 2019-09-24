import React from "react";
import memoize from "memoize-one";

import Alert from "react-bootstrap/Alert";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import ListGroup from "react-bootstrap/ListGroup";
import Row from "react-bootstrap/Row";

import { boundMethod } from "autobind-decorator";

import CinemaCard from "~/components/CinemaCard";
import CinemaMap from "~/containers/CinemaMap";

import * as util from "~/util";

class MovieMap extends React.PureComponent {
    constructor(props) {
        super(props);

        this.defaultRange = 10;

        this.state = {
            // allow other components to render this component
            cinemas: props.cinemas || [],
            marker: null,
            sortBy: "distance",
            position: null,
            range: this.defaultRange,
            shouldFilter: true,
        };
    }

    async componentWillMount() {
        // Load the API data
        // only load from /api/cinemas if props.cinemas is empty
        if (this.state.cinemas.length === 0){
            console.log("fetching")
            const response = await fetch("/api/cinemas");
            const cinemas = await response.json();
            await console.log("fetched", cinemas);
            this.setState({
                cinemas,
            });
            console.log("state: ", this.state.cinemas);
        }
    }

    @boundMethod
    _updateSort(sortBy) {
        const cinemas = [...this.state.cinemas];
        switch (sortBy) {
            case "distance":
            cinemas.sort(util.sortBy(({ dist }) => dist));
                break;

                case "name":
                cinemas.sort(util.sortBy(({ name }) => name));
                break;

                default:
                throw new Error(`Unknown sort type: '${sortBy}'`);
            }

            this.setState({
                cinemas,
                sortBy,
            });
        }

        @boundMethod
        updateSort(event) {
            const sortBy = event.target.value;
            this._updateSort(sortBy);
        }

        @boundMethod
        viewOnMap(name) {
        const cinema = this.state.cinemas.find(c => c.name === name);

        window.toggleMarker(cinema);
    }

    @boundMethod
    handlePosition(position) {
        const cinemas = this.state.cinemas.map(cinema => ({
            ...cinema,
            dist: window.google.maps.geometry.spherical.computeDistanceBetween(
                position,
                new window.google.maps.LatLng({ lat: cinema.lat, lng: cinema.lng }),
                ),
        }));

        this.setState({ cinemas, position }, () => {
            if (this.state.sortBy === "distance") {
                this._updateSort("distance");
            }
        });
    }

    @boundMethod
    handleRange(range) {
        this.setState({ range });
    }

    @boundMethod
    handleFilter(shouldFilter) {
        this.setState({ shouldFilter });
    }


    @boundMethod
    renderCinemas() {
        if (this.state.position === null && this.state.sortBy === "distance") {
            return (
                <ListGroup.Item key="alert">
                    <Alert key="alert" variant="warning" className="mb-0">
                        You must provide a location to sort by distance.
                    </Alert>
                </ListGroup.Item>
            );
        } else {
            let cinemas = this.state.cinemas;

            if (this.state.shouldFilter && this.state.position !== null) {
                cinemas = cinemas.filter(({ dist }) => dist <= this.state.range * 1000);
            }

            return cinemas
            .map(c => (
                <ListGroup.Item key={c.name}>
                        <CinemaCard
                            logo={c.logo}
                            name={c.name}
                            url={c.url}
                            onClickView={this.viewOnMap}
                            sessions={c.hasOwnProperty("sessions") ? c.sessions : []}
                            />
                    </ListGroup.Item>
                ));
            }
    }

    reloadCinemas = memoize(
        (cinemas) => {
            this.setState({cinemas});
        }
    );

    render() {
        this.reloadCinemas(this.props.cinemas);
        console.log("rerendering map: ", this.state.cinemas);
        return (
            <Container>
                <Row>
                    <Col xs={7}>
                        <CinemaMap
                            cinemas={this.state.cinemas}
                            handlePosition={this.handlePosition}
                            handleRange={this.handleRange}
                            defaultRange={this.defaultRange}
                            handleFilter={this.handleFilter}
                            canFilter={this.state.position !== null}
                        />
                    </Col>
                    <Col xs={5}>
                        <header className="d-flex justify-content-between now-showing-header">
                            <h1>Cinemas</h1>
                            <Form inline>
                                <label>
                                    Sort by &nbsp;
                                    <select value={this.state.sortBy} onChange={this.updateSort}>
                                        <option value="distance">Distance</option>
                                        <option value="name">Name</option>
                                    </select>
                                </label>
                            </Form>
                        </header>
                        <ListGroup variant="flush">
                            {this.renderCinemas()}
                        </ListGroup>
                    </Col>
                </Row>
            </Container>
        );
    }
}

export default MovieMap;

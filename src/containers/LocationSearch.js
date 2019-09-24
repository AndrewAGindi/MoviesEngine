import React from "react";
import PropTypes from "prop-types";

import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";

import { MdGpsFixed } from "react-icons/md";

import { boundMethod } from "autobind-decorator";

import * as util from "~/util";

class LocationSearch extends React.Component {
    constructor(props) {
        super(props);

        this.inputRef = React.createRef();

        this.state = {
            range: props.defaultRange,
            shouldFilter: true,
        };
    }

    componentDidMount() {
        this.searchBox = new window.google.maps.places.Autocomplete(this.inputRef.current, {
            componentRestrictions: {
                country: "AU",
            },
            fields: ["geometry"],
            types: ["geocode"],
        });

        this.searchBox.addListener("place_changed", () => {
            const place = this.searchBox.getPlace();
            
            if (this.props.handleChange) {
                this.props.handleChange(place.geometry.location);
            }
        });
    }

    @boundMethod
    async handleSubmit(event) {
        event.preventDefault();
    }

    @boundMethod
    handleRange(event) {
        const value = event.target.valueAsNumber;

        this.setState({ range: value });

        if (this.props.handleRange) {
            this.props.handleRange(value);
        }
    }

    @boundMethod
    async handleGeolocation() {
        const { coords } = await util.getCurrentPosition();
        
        const gPos = new window.google.maps.LatLng({
            lat: coords.latitude,
            lng: coords.longitude,
        });
        
        if (this.props.handleChange) {
            this.props.handleChange(gPos);
        }

        // TODO: loading indicator        
        const [location] = await util.geocode({
            location: gPos,
        });

        this.inputRef.current.value = location.formatted_address;
    }

    @boundMethod
    handleFilter(event) {
        const value = event.target.checked;

        this.setState({ shouldFilter: value });

        if (this.props.handleFilter) {
            this.props.handleFilter(value);
        }
    }

    render() {
        return (
            <Form onSubmit={this.handleSubmit}>
                <Form.Group>
                    <InputGroup>
                        <InputGroup.Prepend>
                            <Button
                                variant="outline-primary"
                                className="d-flex align-items-center"
                                onClick={this.handleGeolocation}
                            >
                                <MdGpsFixed />
                            </Button>
                        </InputGroup.Prepend>
                        <Form.Control
                            type="text"
                            ref={this.inputRef}
                        />
                    </InputGroup>
                    <div className="d-flex justify-space-between">
                        <Form.Check
                            type="checkbox"
                            id="filter-distance"
                            label="Filter by distance"
                            className="mr-3"
                            style={{ flexShrink: "0" }}
                            checked={this.state.shouldFilter}
                            onChange={this.handleFilter}
                            disabled={!this.props.canFilter}
                        />
                        <Form.Control
                            type="range"
                            className="custom-range"
                            min="1"
                            max="15"
                            value={this.state.range}
                            onChange={this.handleRange}
                            disabled={!this.props.canFilter}
                        />
                    </div>
                </Form.Group>
            </Form>
        );
    }
}

LocationSearch.propTypes = {
    defaultRange: PropTypes.number.isRequired,
    handleChange: PropTypes.func,
    handleRange: PropTypes.func,
    handleFilter: PropTypes.func,
    canFilter: PropTypes.bool.isRequired,
};

export default LocationSearch;

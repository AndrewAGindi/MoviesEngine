import React from "react";
import PropTypes from "prop-types";

import {
    InfoWindow,
    Marker,
} from "react-google-maps";
import { MAP } from "react-google-maps/lib/constants";
import { boundMethod } from "autobind-decorator";

import GeolocationMarker from "~/components/GeolocationMarker";
import LocationSearch from "~/containers/LocationSearch";
import MapEmbed from "~/components/MapEmbed";

class CinemaMap extends React.Component {
    constructor(props) {
        super(props);

        this.defaultRange = 10;

        this.state = {
            activeMarker: null,
        };

        // FIXME: hacky :/
        window.toggleMarker = this.toggleMarker;
    }

    @boundMethod
    async initMap(mapRef) {
        if (this.map === undefined) {
            this.map = mapRef.context[MAP];

            this.geolocationMarker = new GeolocationMarker(this.map);

            this.rangeCircle = new window.google.maps.Circle({
                clickable: false,
                fillColor: "#4285F4",
                fillOpacity: 0.4,
                map: this.map,
                strokeColor: "#4285F4",
                strokeOpacity: 0.7,
                strokeWidth: 1,
                visible: false,
                zIndex: 1,
            });
        }
    }

    @boundMethod
    toggleMarker(cinema) {
        if (this.state.activeMarker === cinema) {
            this.closeAllMarkers();
        } else {
            this.openMarker(cinema);
        }
    }
    
    @boundMethod
    openMarker(cinema) {
        this.setState({ activeMarker: cinema });

        this.map.panTo({ lat: cinema.lat, lng: cinema.lng });
        this.map.setZoom(14);
    }

    @boundMethod
    closeAllMarkers() {
        this.setState({ activeMarker: null });
        
        this.map.setZoom(11);
    }

    @boundMethod
    setUserPos(location) {
        this.geolocationMarker.setPosition(location);
        this.geolocationMarker.setVisible(true);
        
        this.rangeCircle.setRadius(this.defaultRange * 1000);
        this.rangeCircle.setCenter(location);
        this.rangeCircle.setVisible(true);

        this.map.panTo(location);
        this.map.setZoom(11);

        if (this.props.handlePosition) {
            this.props.handlePosition(location);
        }
    }

    @boundMethod
    handleRange(value) {
        this.rangeCircle.setRadius(value * 1000);

        if (this.props.handleRange) {
            this.props.handleRange(value);
        }
    }

    render() {
        return (
            <div style={{ marginTop: "56px", position: "sticky", top: "12px" }}>
                <LocationSearch
                    handleChange={this.setUserPos}
                    handleRange={this.handleRange}
                    defaultRange={this.defaultRange}
                    handleFilter={this.props.handleFilter}
                    canFilter={this.props.canFilter}
                />
                <MapEmbed
                    googleMapURL="https://maps.googleapis.com/maps/api/js?key=AIzaSyAlHWkj4NJYeVN5PhHcwcZK-vtVWJSjdec&libraries=geometry,places"
                    containerElement={<div style={{ height: "400px" }} />}
                    loadingElement={<div style={{ height: "100%" }} />}
                    mapElement={<div style={{ height: "100%" }} />}
                    onMapMounted={this.initMap}
                >
                    {this.props.cinemas.map(c => (
                        <Marker
                            key={c.name}
                            position={{ lat: c.lat, lng: c.lng }}
                            title={c.longName}
                            onClick={() => this.toggleMarker(c)}
                        >
                            {this.state.activeMarker === c &&
                            <InfoWindow
                                onCloseClick={this.closeAllMarkers}
                            >
                                <div className="d-flex flex-column">
                                    <img src={c.logo} height="32"/>
                                    <span>{c.name}</span>
                                </div>
                            </InfoWindow>
                            }
                        </Marker>
                    ))}
                </MapEmbed>
            </div>
        );
    }
}

CinemaMap.propTypes = {
    cinemas: PropTypes.arrayOf(
        PropTypes.shape({
            longName: PropTypes.string,
            name: PropTypes.string.isRequired,
            lat: PropTypes.number.isRequired,
            lng: PropTypes.number.isRequired,
            logo: PropTypes.string,
        })
    ),
    handlePosition: PropTypes.func,
    handleRange: PropTypes.func,
    handleFilter: PropTypes.func,
    canFilter: PropTypes.bool.isRequired,
};

export default CinemaMap;

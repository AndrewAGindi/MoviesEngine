import React from "react";
import PropTypes from "prop-types";

import GoogleMap from "react-google-maps/lib/components/GoogleMap";
import withGoogleMap from "react-google-maps/lib/withGoogleMap";
//import withScriptjs from "react-google-maps/lib/withScriptjs";

// Show all of Australia by default
const defaultZoom = 4;
const defaultCenter = { lat: -25.2744, lng: 133.7751 };
const defaultOptions = {
    disableDefaultUI: true,
    zoomControl: true,
};

class MapEmbed extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <GoogleMap
                defaultZoom={defaultZoom}
                defaultCenter={defaultCenter}
                defaultOptions={defaultOptions}
                clickableIcons={false}
                ref={(ref) => ref && this.props.onMapMounted(ref)}
            >
                {this.props.children}
            </GoogleMap>
        );
    }
}

MapEmbed.propTypes = {
    children: PropTypes.node,
    onMapMounted: PropTypes.func,
};

export default /*withScriptjs(*/withGoogleMap(MapEmbed)/*)*/;

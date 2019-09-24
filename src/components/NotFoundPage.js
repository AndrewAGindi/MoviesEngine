import React from "react";
import PropTypes from "prop-types";

import { withRouter, Link } from "react-router-dom";

import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";

const NotFoundPage = ({ location }) => (
    <Alert variant="danger">
        <Alert.Heading>404: Page Not Found</Alert.Heading>
        <p>
            The page at <code>{location.pathname}</code> could not be found.
        </p>
        <hr />
        <Link to="/">
            <Button variant="danger">
                Go back
            </Button>
        </Link>
    </Alert>
);

NotFoundPage.propTypes = {
    location: PropTypes.shape({
        pathname: PropTypes.string.isRequired,
    }),
};

export default withRouter(NotFoundPage);

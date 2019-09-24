import React from "react";
import PropTypes from "prop-types";

import Button from "react-bootstrap/Button";
import ButtonToolbar from "react-bootstrap/ButtonToolbar";
import Card from "react-bootstrap/Card";

const CinemaCard = ({ logo, name, url, onClickView, sessions, onClickSessions }) => (
    <Card>
        <Card.Header>
            <img
                src={logo}
                height={24}
            />
        </Card.Header>
        <Card.Body>
            <h2 className="mb-0">{name}</h2>
        </Card.Body>
        <Card.Footer>
            <ButtonToolbar>
                <Button
                    variant="outline-secondary"
                    className="mr-3"
                    onClick={() => onClickView(name)}
                >
                    View on map
                </Button>
                <Button
                    variant="primary"
                    href={url}
                >
                    Session times
                </Button>
            </ButtonToolbar>
            <ButtonToolbar>
                {renderSessions(sessions)}
            </ButtonToolbar>
        </Card.Footer>
    </Card>
);


const renderSessions = (sessions) => {
    console.log(sessions);
    return sessions.map(session => {
        const s = session.time.substring(11, 16);
        return <Button className="btn btn-info mr-1 mt-1"  href={session.url}>{s}</Button>
    });
};

CinemaCard.propTypes = {
    logo: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    onClickView: PropTypes.func,
};

export default CinemaCard;

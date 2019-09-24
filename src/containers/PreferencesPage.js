import React from "react";
import PropTypes from "prop-types";

import { MdSettings } from "react-icons/md";

import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

const genres = [
    "Action",
    "Adventure",
    "Animation",
    "Comedy",
    "Crime",
    "Documentary",
    "Drama",
    "Family",
    "Fantasy",
    "History",
    "Horror",
    "Music",
    "Mystery",
    "Romance",
    "Science Fiction",
    "Thriller",
    "War",
];

const Genre = ({ genre }) => (
    <React.Fragment>
        <input
            type="checkbox"
            id={genre}
            className="page--preferences__genre-checkbox"
        />
        <label
            htmlFor={genre}
            className="page--preferences__genre"
        >
            <span>{genre}</span>
        </label>
    </React.Fragment>
);

Genre.propTypes = {
    genre: PropTypes.string.isRequired,
};

const PreferencesPage = () => (
    <main className="page--preferences">
        <div>
            <MdSettings className="page--preferences__icon" />
            <h1>Preferences</h1>
            <Form method="POST">
                <Form.Group className="page--preferences__genre-container">
                    <Form.Label>
                        Select your favourite genres
                    </Form.Label>
                    {genres.map(genre => (
                        <Genre
                            key={genre}
                            genre={genre}
                        />
                    ))}
                </Form.Group>
                <Form.Group className="d-flex justify-content-end align-items-center mb-0">
                    <Button type="submit" className="button--auth">
                            Save preferences
                    </Button>
                </Form.Group>
            </Form>
        </div>
    </main>
);

export default PreferencesPage;

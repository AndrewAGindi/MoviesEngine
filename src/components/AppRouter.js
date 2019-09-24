import React from "react";
import PropTypes from "prop-types";
import {
    BrowserRouter as Router,
    Route,
    NavLink as RouterNavLink,
    Switch,
    Redirect,
} from "react-router-dom";

import NowShowingPage from "~/containers/NowShowingPage";
import CinemasPage from "~/containers/CinemasPage";

import MoviesPage from "~/containers/MoviesPage";
import ComingSoonPage from "~/containers/ComingSoonPage";
import Search from "~/containers/Search";
import NotFoundPage from "~/components/NotFoundPage";
import Watchlist from "~/containers/WatchlistPage";

import SignInPage from "~/containers/SignInPage";
import SignUpPage from "~/containers/SignUpPage";
import PreferencesPage from "~/containers/PreferencesPage";

import Nav from "react-bootstrap/Nav";

import {
    FaFacebook,
    FaTwitter,
    FaInstagram,
    FaYoutube,
} from "react-icons/fa";

import Container from "react-bootstrap/Container";
import Jumbotron from "react-bootstrap/Jumbotron";

import * as util from "~/util";

const NavLink = ({ children, ...props }) => (
    <RouterNavLink className="nav-link" role="button" {...props}>
        {children}
    </RouterNavLink>
);

NavLink.propTypes = {
    children: PropTypes.node
};

const AuthRoutes = () => (
    <React.Fragment>
        <Route path="/sign-in" exact component={SignInPage} />
        <Route path="/sign-up" exact component={SignUpPage} />
        <Route path="/preferences" exact component={PreferencesPage} />
    </React.Fragment>
);

class AuthenticationHeader extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isAuthenticated: false,
        };
    }

    componentDidMount() {
        this.setState({
            isAuthenticated: util.isAuthenticated(),
        });
    }

    render() {
        if (this.state.isAuthenticated) {
            return this.renderUser();
        } else {
            return this.renderGuest();
        }
    }

    renderUser() {
        return (
            <Nav.Link href="/sign-out">Sign Out</Nav.Link>
        );
    }

    renderGuest() {
        return (
            <NavLink to="/sign-in" exact>Sign In</NavLink>
        );
    }
}

const AppRoutes = () => (
    <React.Fragment>
        <header className="nav-bar">
            <Container className="nav-bar__brand">
                <span>M</span>
                <span>oviesEngine</span>
            </Container>
            <Container as="nav" className="nav-bar__links">
                <div className="nav-bar__links--left">
                    <NavLink to="/now-showing" exact>Now Showing</NavLink>
                    <NavLink to="/coming-soon" exact>Coming Soon</NavLink>
                    <NavLink to="/cinemas/">Cinemas</NavLink>
                    <NavLink to="/watchlist"> Watchlist</NavLink>
                    <NavLink to="/search" exact>Search</NavLink>
                </div>
                <div className="nav-bar__links--right">
                    <AuthenticationHeader />
                </div>
            </Container>
        </header>
        <main>
            <Switch>
                {/* TODO: Maybe at some point have a separate home page? */}
                <Route path="/" exact render={() => <Redirect to="/now-showing" />} />
                <Route path="/now-showing" exact component={NowShowingPage} />
                <Route path="/coming-soon" exact component={ComingSoonPage} />
                <Route path="/now-showing/:genre" render={({ match }) => (
                    <NowShowingPage
                        genre={match.params.genre}
                    />
                )} />
                <Route path="/movies/:name" component={MoviesPage} />
                <Route path="/cinemas/" component={CinemasPage} />
                <Route path="/watchlist" component={Watchlist} />
                <Route path="/search" component={Search} />
                <Route component={NotFoundPage} />
            </Switch>
        </main>
        <Jumbotron fluid as="footer" className="footer">
            <span className="footer__social">
                <FaTwitter />
                <FaFacebook />
                <FaInstagram />
                <FaYoutube />
            </span>
        </Jumbotron>
    </React.Fragment>
);

const AppRouter = () => (
    <Router>
        <Switch>
            <Route path="/(sign-in|sign-up|preferences)" exact component={AuthRoutes} />
            <Route component={AppRoutes} />
        </Switch>
    </Router>
);

export default AppRouter;

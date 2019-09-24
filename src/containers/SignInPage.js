import React from "react";
import PropTypes from "prop-types";

import { FaGoogle, FaFacebookF } from "react-icons/fa";
import { MdArrowBack } from "react-icons/md";

import { Link, withRouter } from "react-router-dom";

import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import FacebookLogin from "react-facebook-login/dist/facebook-login-render-props";
import GoogleLogin from "react-google-login";

const signInExternal = async (history, data) => {
    const res = await fetch("/api/sign-in/external", {
        method: "POST",
        credentials: "same-origin",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        redirect: "follow",
    });

    if (res.status !== 200) {
        throw new Error("Failed to send POST request in signInExternal.");
    }

    console.log("Successfully logged in with external provider. Redirecting...");

    const url = new URL(res.url);
    history.push(url.pathname);
};

const handleFacebook = history => async response => {
    const { status } = await new Promise(resolve => {
        window.FB.getLoginStatus(resolve);
    });

    if (status !== "connected") {
        console.log("User fb is not connected...");
        return;
    }

    const { name, email } = await new Promise(resolve => {
        window.FB.api("/me", { fields: "name, email" }, resolve);
    });

    signInExternal(history, { name, email });
};

const handleGoogle = history => async response => {
    if (response.error) {
        // Something went wrong...
        console.log(response);
        return;
    }

    // FIXME: Not actually secure but just for demonstration...
    const profile = window.gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile();
    const name = profile.getGivenName();
    const email = profile.getEmail();

    signInExternal(history, { name, email });
};

const SignInPage = ({ history }) => (
    <main className="page--sign-in">
        <div>
            <Link to="/" className="page--sign-in__back" title="Go back">
                <MdArrowBack />
            </Link>
            <h1>Welcome back</h1>
            <span>Sign in to continue</span>
            <Form className="mt-5" method="POST">
                <Form.Group className="d-flex flex-column-reverse">
                    <Form.Control
                        type="text"
                        placeholder="danvers"
                        name="username"
                    />
                    <Form.Label>
                        Username
                    </Form.Label>
                </Form.Group>
                <Form.Group className="d-flex flex-column-reverse">
                    <Form.Control
                        type="password"
                        placeholder={"\u25CF".repeat(10)}
                        name="password"
                    />
                    <Form.Label>
                        Password
                    </Form.Label>
                </Form.Group>
                <Form.Group className="d-flex justify-content-between">
                    <Form.Check
                        type="checkbox"
                        id="remember"
                        label="Remember me"
                        name="remember"
                    />
                    <Link to="">
                        Forgot your password?
                    </Link>
                </Form.Group>
                <Button className="w-100 mt-5 page--sign-in__login" type="submit">
                    Login
                </Button>
                <div className="page--sign-in__divider" />
                <GoogleLogin
                    clientId="696435952198-mjf6b2ddoac7im29m3gumvuk00kglqbu.apps.googleusercontent.com"
                    render={({ onClick, disabled }) => (
                        <Button
                            onClick={onClick}
                            disabled={disabled}
                            className="w-100 mb-3 page--sign-in__login--google"
                        >
                            <FaGoogle />
                            Login with Google
                        </Button>
                    )}
                    buttonText="Login"
                    onSuccess={handleGoogle(history)}
                    onFailure={handleGoogle(history)}
                    cookiePolicy="single_host_origin"
                />
                <FacebookLogin
                    appId="2272541412842112"
                    scope="public_profile,email"
                    callback={handleFacebook(history)}
                    onFailure={error => console.log(error)}
                    cookie={true}
                    xfbml={true}
                    version={3.2}
                    fields="name,email"
                    render={({ onClick, isDisabled }) => (
                        <Button
                            onClick={onClick}
                            disabled={isDisabled}
                            className="w-100 mb-5 page--sign-in__login--facebook"
                        >
                            <FaFacebookF />
                            Login with Facebook
                        </Button>
                    )}
                />
                <span>
                    Don&apos;t have an account?
                    <Link to="/sign-up" className="ml-1">Register here</Link>
                </span>
            </Form>
        </div>
    </main>
);

SignInPage.propTypes = {
    history: PropTypes.shape({
        push: PropTypes.func.isRequired,
    }),
};

export default withRouter(SignInPage);

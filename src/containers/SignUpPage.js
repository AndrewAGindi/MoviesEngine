import React from "react";

import { FaGoogle, FaFacebookF } from "react-icons/fa";
import { MdArrowBack } from "react-icons/md";

import { Link } from "react-router-dom";

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

const SignUpPage = () => (
    <main className="page--sign-up">
        <div>
            <Link to="/sign-in" className="page--sign-up__back" title="Go back">
                <MdArrowBack />
            </Link>
            <h1>Nice to meet you</h1>
            <span>Tell us about yourself</span>
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
                        type="email"
                        placeholder="vers@kree.empire"
                        name="email"
                    />
                    <Form.Label>
                        Email
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
                <Button className="w-100 mt-5 page--sign-in__login" type="submit">
                    Register
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
                            Register with Google
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
                            Register with Facebook
                        </Button>
                    )}
                />
            </Form>
        </div>
    </main>
);

export default SignUpPage;

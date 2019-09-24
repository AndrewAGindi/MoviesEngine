# Sengine

## Installation

### Server
1. **(Optional)** Create a virtual environment
2. Install the dependencies:
```
pip install -r requirements.txt
```
3. Run the server:

**HTTP:**
```
flask run
```

**HTTPS:**
```
flask run --cert server.crt --key server.key
```

> **NOTE:**
Running the server for the first time will download API data so may take some extra time.

### Client
1. Install node.js if not already installed:
> <https://nodejs.org/en/>
2. Install the dependencies:
```
npm install
```
3. Build the client files:
```
npx webpack
```

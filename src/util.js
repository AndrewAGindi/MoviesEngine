const sortBy = (keyFn, desc = false) => (a, b) => {
    let keyA = keyFn(a);
    let keyB = keyFn(b);

    if (desc) {
        // If we want the opposite order then swap the keys
        [keyA, keyB] = [keyB, keyA];
    }

    if (keyA < keyB) {
        return -1;
    } else if (keyA > keyB) {
        return 1;
    } else {
        return 0;
    }
};

const chainSort = (...sortFns) => (a, b) =>
    [...sortFns].reduce((acc, curr) => acc || curr(a, b), 0);

const getCurrentPosition = () => new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject);
});


const geocode = request => new Promise((resolve, reject) => {
    const geocoder = new window.google.maps.Geocoder();

    geocoder.geocode(request, (results, status) => {
        if (status === "OK") {
            resolve(results);
        } else {
            reject(status);
        }
    });
});


const isAuthenticated = () => (
    document.cookie
        .split(";")
        .some((entry) => entry.trim() === "authenticated=true")
);

export {
    sortBy,
    chainSort,
    getCurrentPosition,
    geocode,
    isAuthenticated,
};

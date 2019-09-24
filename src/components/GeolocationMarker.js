class GeolocationMarker {
    constructor(map = null) {
        this.components = [
            new window.google.maps.Marker({
                "clickable": false,
                "cursor": "pointer",
                "draggable": false,
                "flat": true,
                "icon": {
                    "path": window.google.maps.SymbolPath.CIRCLE,
                    "fillColor": "#C8D6EC",
                    "fillOpacity": 0.7,
                    "scale": 12,
                    "strokeWeight": 0,
                },
                "title": "Current location",
                "zIndex": 2,
                "map": map,
                "position": { lat: 0, lng: 0 },
                "visible": false,
            }),
            new window.google.maps.Marker({
                "clickable": false,
                "cursor": "pointer",
                "draggable": false,
                "flat": true,
                "icon": {
                    "path": window.google.maps.SymbolPath.CIRCLE,
                    "fillColor": "#4285F4",
                    "fillOpacity": 1,
                    "scale": 6,
                    "strokeColor": "white",
                    "strokeWeight": 2,
                },
                "title": "Current location",
                "zIndex": 3,
                "map": map,
                "position": { lat: 0, lng: 0 },
                "visible": false,
            })
        ];
    }

    setPosition(...args) {
        this.components.forEach(x => x.setPosition(...args));
    }

    setVisible(...args) {
        this.components.forEach(x => x.setVisible(...args));
    }
}

export default GeolocationMarker;

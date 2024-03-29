function initMap() {
    var map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 19.4326, lng: -99.1332 },
        zoom: 10,
        streetViewControl: false
    });

    var marker; // Variable local para mantener una referencia al marcador

    map.addListener('click', function (event) {
        fetchQuality(event.latLng.lat(), event.latLng.lng());

        // Eliminar el marcador existente, si hay uno
        if (marker) {
            marker.setMap(null);
        }

        // Agregar un nuevo marcador en la ubicación del clic
        marker = new google.maps.Marker({
            position: event.latLng,
            map: map,
            icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png', // Icono del marcador
            draggable: false // Si quieres que el marcador sea draggable
        });
    });
}

function fetchQuality(latitude, longitude) {
    fetch('https://airquality.googleapis.com/v1/currentConditions:lookup?key=AIzaSyDKZnXXobwgWrd5oT0st0zCuBvCgmIm2jk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            "location": { "latitude": latitude, "longitude": longitude },
            "extraComputations": ["HEALTH_RECOMMENDATIONS", "DOMINANT_POLLUTANT_CONCENTRATION", "POLLUTANT_CONCENTRATION", "LOCAL_AQI", "POLLUTANT_ADDITIONAL_INFO"],
            "languageCode": "es"
        })
    }).then(response => {
        if (!response.ok) throw new Error('Error en la solicitud');
        return response.json();
    }).then(data => {
        displayQuality(data);
    }).catch(error => console.error('Error:', error));
}

function displayQuality(data) {
    if (data.indexes[1].category === "Buena" || data.indexes[1].category === "Calidad del aire buena") {
        document.querySelector("#categoria").style.color = "#1B5E20";
    } else if (data.indexes[1].category === "Aceptable" || data.indexes[1].category === "Calidad del aire aceptable" || data.indexes[1].category === "Calidad del aire moderada") {
        document.querySelector("#categoria").style.color = "#FFD600";
    } else if (data.indexes[1].category === "Mala" || data.indexes[1].category === "Calidad del aire mala") {
        document.querySelector("#categoria").style.color = "#FF6F00";
    } else if (data.indexes[1].category === "Muy mala" || data.indexes[1].category === "Calidad del aire muy mala") {
        document.querySelector("#categoria").style.color = "#D50000";
    } else {
        document.querySelector("#categoria").style.color = "#AA00FF";
    }
    document.querySelector("#categoria").innerHTML = `${data.indexes[1].category}`;
    document.querySelector("#contaminante").innerHTML = `${data.indexes[1].dominantPollutant}`;
    document.querySelector("#aqi").innerHTML = `${data.indexes[0].aqi} (AQI-US)`;
    document.querySelector("#general").innerHTML = data.healthRecommendations.generalPopulation;
    document.querySelector("#ninos").innerHTML = data.healthRecommendations.children;
    document.querySelector("#embarazadas").innerHTML = data.healthRecommendations.pregnantWomen;
    document.querySelector("#elder").innerHTML = data.healthRecommendations.elderly;
    document.querySelector("#atleta").innerHTML = data.healthRecommendations.athletes;
    document.querySelector("#heart").innerHTML = data.healthRecommendations.heartDiseasePopulation;
    document.querySelector("#lung").innerHTML = data.healthRecommendations.lungDiseasePopulation;
}

function mostrarIndicaciones() {
    document.getElementById('tarjetaIndicaciones').style.display = 'block';
}

function ocultarIndicaciones() {
    document.getElementById('tarjetaIndicaciones').style.display = 'none';
}
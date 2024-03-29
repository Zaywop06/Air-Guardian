let coordinates = [], iconElement = document.createElement("i"), iconClasses;

const objetoGeolocalizador = new ol.Geolocation({ trackingOptions: { enableHighAccuracy: true } });
$(document).ready(function () { $("#btnUbicacion").click(function () { objetoGeolocalizador.setTracking(this.click); $("#msg").hide(); }); });
objetoGeolocalizador.on('error', error => alertify.alert('¡Algo no salió bien!', error.message));
const accuracyFeature = new ol.Feature();
objetoGeolocalizador.on('change:accuracyGeometry', () => accuracyFeature.setGeometry(objetoGeolocalizador.getAccuracyGeometry()));
const positionFeature = new ol.Feature();
const dateTime = new Date(), dia = dateTime.getDate(), mes = dateTime.getMonth() + 1, hora = dateTime.getHours(), minutos = dateTime.getMinutes(), mesesAbreviados = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'], mesAbreviado = mesesAbreviados[mes - 1], fechaFormateada = `${dia < 10 ? '0' : ''}${dia} ${mesAbreviado} ${hora < 10 ? '0' : ''}${hora}:${minutos < 10 ? '0' : ''}${minutos}, hora local`;

objetoGeolocalizador.on('change:position', function () {
    coordinates = objetoGeolocalizador.getPosition();
    positionFeature.setGeometry(coordinates ? new ol.geom.Point(coordinates) : null);
    fetch('https://airquality.googleapis.com/v1/currentConditions:lookup?key=AIzaSyDKZnXXobwgWrd5oT0st0zCuBvCgmIm2jk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            "location": { "latitude": coordinates[1], "longitude": coordinates[0] },
            "extraComputations": ["HEALTH_RECOMMENDATIONS", "DOMINANT_POLLUTANT_CONCENTRATION", "POLLUTANT_CONCENTRATION", "LOCAL_AQI", "POLLUTANT_ADDITIONAL_INFO"],
            "languageCode": "es"
        })
    }).then(response => {
        if (!response.ok) throw new Error('Error en la solicitud');
        return response.json();
    }).then(data => {
        console.log(data);
        document.querySelector("#card").style.display = "block";
        document.querySelector("#regionCode").innerHTML = data.regionCode;
        document.querySelector("#dateTime").innerHTML = fechaFormateada;

        iconClasses = ["fas", "fa-2x"];
        if (data.indexes[1].category === "Buena" || data.indexes[1].category === "Calidad del aire buena") {
            document.querySelector("#category").style.color = "#1B5E20";
            iconClasses.push("fa-face-laugh");
        } else if (data.indexes[1].category === "Aceptable" || data.indexes[1].category === "Calidad del aire aceptable" || data.indexes[1].category === "Calidad del aire moderada") {
            document.querySelector("#category").style.color = "#FFD600";
            iconClasses.push("fa-face-smile-beam");
        } else if (data.indexes[1].category === "Mala" || data.indexes[1].category === "Calidad del aire mala") {
            document.querySelector("#category").style.color = "#FF6F00";
            iconClasses.push("fa-face-frown-open");
        } else if (data.indexes[1].category === "Muy mala" || data.indexes[1].category === "Calidad del aire muy mala") {
            document.querySelector("#category").style.color = "#D50000";
            iconClasses.push("fa-face-flushed");
        } else {
            document.querySelector("#category").style.color = "#AA00FF";
            iconClasses.push("fa-face-dizzy");
        }
        iconElement.style.color = document.querySelector("#category").style.color; // Aplicar el mismo color al icono
        iconElement.classList.add(...iconClasses);
        document.querySelector("#face").appendChild(iconElement);
        document.querySelector("#category").innerHTML = `${data.indexes[1].category}`;
        document.querySelector("#dominantPollutant").innerHTML = `Contaminante principal: ${data.indexes[1].dominantPollutant}`;
        document.querySelector("#aqi").innerHTML = `${data.indexes[0].aqi} (AQI-US)`;

        document.querySelector("#card2").style.display = "block";
        document.querySelector("#co").innerHTML = `${data.pollutants[0].concentration.value} (CO)`;
        document.querySelector("#no2").innerHTML = `${data.pollutants[1].concentration.value} (NO2)`;
        document.querySelector("#o3").innerHTML = `${data.pollutants[2].concentration.value} (O3)`;
        document.querySelector("#pm10").innerHTML = `${data.pollutants[3].concentration.value} (PM10)`;
        document.querySelector("#pm25").innerHTML = `${data.pollutants[4].concentration.value} (PM2.5)`;
        document.querySelector("#so2").innerHTML = `${data.pollutants[5].concentration.value} (SO2)`;

        document.querySelector("#recomendaciones").style.display = "block";
        document.querySelector("#generalPopulation").innerHTML = data.healthRecommendations.generalPopulation;
        document.querySelector("#children").innerHTML = data.healthRecommendations.children;
        document.querySelector("#pregnantWomen").innerHTML = data.healthRecommendations.pregnantWomen;
        document.querySelector("#elderly").innerHTML = data.healthRecommendations.elderly;
        document.querySelector("#athletes").innerHTML = data.healthRecommendations.athletes;
        document.querySelector("#heartDiseasePopulation").innerHTML = data.healthRecommendations.heartDiseasePopulation;
        document.querySelector("#lungDiseasePopulation").innerHTML = data.healthRecommendations.lungDiseasePopulation;
    }).catch(error => console.error('Error:', error));
});
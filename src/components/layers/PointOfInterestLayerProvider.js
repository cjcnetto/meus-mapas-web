const weatherData = await fetch('src/assets/weatherCodes.json').then(response => response.json());


export default class PointOfInterestLayerProvider {
    /**
     * 
     * @param {L.Map} map 
     * @param {Function} weatherFuncion 
     */
    constructor(map, weatherFuncion, upsertPoint, deletePoint){
        this.map = map;
        this.mapId = null;
        this.wetherForecast = {};
        this.layer = L.featureGroup([]);
        this.weatherFuncion = weatherFuncion;
        this.upsertPoint = upsertPoint;
        this.deletePoint = deletePoint;
        map.addLayer(this.layer);
    }

    /**
     * Cria um ponto no mapa e adiciona o popup para editar o ponto
     * @param {{id: number, map_id: number, name: string, description: string, latitude: number, longitude: number}} point 
     * @returns 
     */
    async createPoint(point){
        const div = L.DomUtil.create('div', 'point-popup');
        let weatherIcon = null;
        let weatheDesc = null;
        let weather = null;
        let icon = L.icon({
            iconUrl: 'src/assets/map-icons/marker-without-weather.svg',
            iconSize: [32, 32],
        });
        if(point.id !== -1){
            const pointForecast = this.wetherForecast.forecasts[point.id];
            weather = pointForecast;
            const weatherCode = weather.current_weather.weather_code;
            const isDay = weather.current_weather.is_day;
            weatherIcon = weatherData[weatherCode][isDay ? "day" : "night"].image;
            weatheDesc = weatherData[weatherCode][isDay ? "day" : "night"].description;
            icon = await this.createWeatherIcon(weatherIcon);
        }
        
        const marker = L.marker([point.latitude, point.longitude], {icon: icon}).bindPopup(div);
        marker.feature = {
            properties: {
                pointOfInterest: point
            }
        }
        if(weather){
            const weatherDiv = L.DomUtil.create('div', 'weather-info', div);
            const weatherImg = L.DomUtil.create('img', 'weather-icon', weatherDiv);
            weatherImg.src = weatherIcon;
            const tempSpan = L.DomUtil.create('span', 'temperature', weatherDiv);
            tempSpan.innerText = `${weather.current_weather.temperature} °C`;
            const maxTemp = weather.daily[0].temperature_max;
            const minTemp = weather.daily[0].temperature_min;
            const rangeSpan = L.DomUtil.create('span', 'temperature-range', weatherDiv);
            rangeSpan.innerText = ` (Min: ${minTemp} °C / Max: ${maxTemp} °C)`;
            const sunrise  = weather.daily[0].sunrise;
            const sunset  = weather.daily[0].sunset;
            const sunSpan = L.DomUtil.create('span', 'sun-time', weatherDiv);
            sunSpan.innerText = ` (Sunrise: ${new Date(sunrise).toLocaleTimeString()} / Sunset: ${new Date(sunset).toLocaleTimeString()})`;

        }

        const form = L.DomUtil.create('form', '', div);
        L.DomEvent.on(form, 'submit', (event)=>{
            event.preventDefault(); // Previne recarregamento da página
            const formData = new FormData(form);
            const data = {
                id: point.id,
                map_id: point.map_id,
                name: formData.get('name'),
                description: formData.get('description'),
                latitude: marker.getLatLng().lat,
                longitude: marker.getLatLng().lng
            };
            this.upsertPoint(data);
        });
        const labelName = L.DomUtil.create('label', '', form);
        labelName.setAttribute("for", "name");
        labelName.innerText = "Nome";
        
        const inputName = L.DomUtil.create('input', '', form);
        inputName.setAttribute("name", "name");
        inputName.id = "name";
        inputName.value = point.name;

        const labelDescription = L.DomUtil.create('label', '', form);
        labelDescription.setAttribute("for", "description");
        labelDescription.innerText = "Descrição";

        const inputDescription = L.DomUtil.create('textarea', '', form);
        inputDescription.rows = 3;
        inputDescription.id = "description";
        inputDescription.name = "description";
        inputDescription.value = point.description;
        
        L.DomUtil.create('hr', '', form);

        const divBtns = L.DomUtil.create('div', 'popup-buttons', form);
        const cancelButton = L.DomUtil.create('button', 'cancel-button', divBtns);
        cancelButton.type = "button";
        cancelButton.innerText = "Cancelar";
        L.DomEvent.on(cancelButton, 'click', ()=>{
            marker.closePopup();
        });

        /**Caso seja um ponto existente na base apresentar o botão de remover */
        if(point.id >= 0){
            const removeButton = L.DomUtil.create('button', 'cancel-button', divBtns);
            removeButton.type = "button";
            removeButton.innerText = "Remover";
            L.DomEvent.on(removeButton, 'click', ()=>{
                this.deletePoint(point.map_id, point.id)
                marker.closePopup();
            });
        }
        
        marker.on('popupclose', ()=>{
            inputName.value = point.name;
            inputDescription.value = point.description;
            if(point.id === -1){
                this.layer.removeLayer(marker);
            }
        });
        const okButton = L.DomUtil.create('button', 'ok-button', divBtns);
        okButton.type = "submit";
        okButton.innerText = "Salvar";

        this.layer.addLayer(marker);
        return marker;
    }

    async updateLayer(mapId, points) {
        this.mapId = mapId;
        this.layer.clearLayers();
        console.log(this.weatherFuncion);
        this.wetherForecast = await this.weatherFuncion(mapId);
        points.forEach((point)=>{
            this.createPoint(point);
        });
    }

    // Função utilitária para criar um ícone Leaflet com base no pin + SVG externo
    async  createWeatherIcon(url) {
        const response = await fetch(url);
        const text = await response.text();

        const parser = new DOMParser();
        const doc = parser.parseFromString(text, "image/svg+xml");
        const inner = doc.documentElement.innerHTML; // pega só os <path>, <circle>, etc

        const baseSVG = `
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" aria-label="Beach icon">
            <!-- Background circle (marker style) -->
            <circle cx="32" cy="32" r="30" fill="#0a0a0aff" stroke="#2A7BBF" stroke-width="2"/>
            ${inner}
            </svg>
        `;

        // Cria o ícone Leaflet
        return L.icon({
            iconUrl: 'data:image/svg+xml;utf8,' + encodeURIComponent(baseSVG),
            iconSize: [32, 32],
        });
    }

    createFormPoint(){
        
    }
}
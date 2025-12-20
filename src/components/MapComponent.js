import BeachLayerProvider from './layers/BeachLayerProvider.js';
import PointOfInterestLayerProvider from './layers/PointOfInterestLayerProvider.js';

/**
 * Classe que extende um controle do Leaflet para criar um botão de ação para criar pontos no mapa
 * @class CreatePointAction
 * @extends L.Control
 */
L.Control.CreatePointAction = L.Control.extend({
    options: {
        callback: null // Callback que será passado
    },
    onAdd: function (map){
        this.map = map;
        const options = this.options;
        this.turnedOn = false;
        const div = L.DomUtil.create('div', 'point-btn');
        this.backgroundDiv = L.DomUtil.create('div', 'point-btn-off');
        div.appendChild(this.backgroundDiv);
        const icon = document.createElement('img');
        icon.src = 'src/assets/icons/create-point-on.png';
        icon.alt = 'Criar ponto';
        this.backgroundDiv.appendChild(icon);
        L.DomEvent.on(div, 'click', (e) => {
            L.DomEvent.stopPropagation(e);
            this.turnedOn = !this.turnedOn;
            if (this.turnedOn) {
                map.getContainer().style.cursor = 'crosshair'
                this.backgroundDiv.className = 'point-btn-on';
            } else {
                map.getContainer().style.cursor = ''
                this.backgroundDiv.className = 'point-btn-off';
            }
        });
        map.on('click', (e)=>{
            if(!this.turnedOn){
                return;
            }
            options.callback(e.latlng); // Chama o callback com a latitude e longitude do ponto clicado
        });
        return div;
    },
    onRemove: function() {},//Necessário para o Leaflet, mas não faz nada
    disable: function(){
        this.turnedOn = false;
        this.map.getContainer().style.cursor = ''
        this.backgroundDiv.className = 'point-btn-off';
    }
});


/**
 * Classe que representa um mapa com suas camadas e seus pontos
 * @class MapComponent
 */
export default class MapComponent{
    /**
     * 
     * @param {Function} backClick 
     * @param {Function} upsertPoint 
     * @param {Function} deletePoint 
     * @param {Function} getBeaches
     * @param {Function} weatherFunction
     */
    constructor(backClick, upsertPoint, deletePoint, getBeaches, weatherFunction){
        this.upsertPoint = upsertPoint;
        this.deletePoint = deletePoint;
        this.pointsArea = document.getElementById('pointsArea');
        this.mapNameSpan = document.getElementById('pointsAreaMapName');
        this.mapDescriptionSpan = document.getElementById('pointsAreaMapDescription');
        this.weatherControl
        const backButton = document.getElementById('backMapBtn');
        backButton.onclick = () =>{
            backClick();
        };
        this.map = L.map('innerMap'); //Componente do mapa criado pelo leaflet e recebe o id do elemento HTML
        //Camada de tile do mapa, nesse caso o OpenStreetMap
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(this.map);
        this.beachLayerProvider = new BeachLayerProvider(this.map, getBeaches, upsertPoint);
        this.pointOfInterestLayerProvider = new PointOfInterestLayerProvider(this.map, weatherFunction, upsertPoint, deletePoint);

        this.createPointAction = new L.Control.CreatePointAction(
            { 
                position: 'topright',
                callback: async (latlng)=>{
                    const marker = await this.pointOfInterestLayerProvider.createPoint(
                        {
                            id: -1, // id -1 indica que é um novo ponto
                            map_id: this.mapId,
                            name: "Novo Ponto", 
                            description: "Nova descrição", 
                            latitude: latlng.lat, 
                            longitude: latlng.lng
                        });
                    marker.openPopup();
                }
            });
        this.map.addControl(this.createPointAction);
        
    }
    /**
     * Esconde o mapa e a área de pontos
     * @returns {void}
     */
    hide(){
        this.pointsArea.style.display = 'none';
    }
    /**
     * Mostra o mapa e a área de pontos
     * @returns {void}
     */
    show() {
        this.pointsArea.style.display = 'block';
        //DEFAULT do rio de janeiro caso não consiga pegar a localização da maquina
        this.map.setView([-22.970368, -43.1816704], 8);
        this.map.locate();
        this.map.on('locationfound', (e) => {
            this.map.setView([e.latlng.lat, e.latlng.lng], 13);
        });
        this.createPointAction.disable();
    }
    
    /**
     * Atualiza o mapa com os pontos recebidos do servidor
     * @param {{map_name: string, map_description: string, points: {id: number, map_id: number, name: string, description: string, latitude: number, longitude: number}[]}} data
     * @param {number} mapId
     * @returns {void}
     */
    updateMap(data, mapId){
        this.mapId = mapId;
        this.mapNameSpan.innerText = data.map_name;
        this.mapDescriptionSpan.innerText = data.map_description;
        this.beachLayerProvider.setMapId(mapId);
        this.pointOfInterestLayerProvider.updateLayer(mapId, data.points);
    }
}
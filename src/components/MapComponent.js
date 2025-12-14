import BeachLayerProvider from './layers/BeachLayerProvider.js';

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
     */
    constructor(backClick, upsertPoint, deletePoint, getBeaches){
        this.upsertPoint = upsertPoint;
        this.deletePoint = deletePoint;
        this.pointsArea = document.getElementById('pointsArea');
        this.mapNameSpan = document.getElementById('pointsAreaMapName');
        this.mapDescriptionSpan = document.getElementById('pointsAreaMapDescription');
        this.pointLayer = L.featureGroup([]);
        
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
        const beachLayerProvider = new BeachLayerProvider(this.map, getBeaches);

        this.map.addLayer(this.pointLayer);
        
        

        this.createPointAction = new L.Control.CreatePointAction(
            { 
                position: 'topright',
                callback: (latlng)=>{
                    const marker = this._createPoint(
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
     * Cria um ponto no mapa e adiciona o popup para editar o ponto
     * @param {{id: number, map_id: number, name: string, description: string, latitude: number, longitude: number}} point 
     * @returns 
     */
    _createPoint(point){
        const div = L.DomUtil.create('div', 'point-popup');
        const marker = L.marker([point.latitude, point.longitude]).bindPopup(div);
        marker.feature = {
            properties: {
                pointOfInterest: point
            }
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
            console.log('Dados enviados:', data); // Mostra os dados no console
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
                this.pointLayer.removeLayer(marker);
            }
        });
        const okButton = L.DomUtil.create('button', 'ok-button', divBtns);
        okButton.type = "submit";
        okButton.innerText = "Salvar";

        this.pointLayer.addLayer(marker);
        return marker;
    }
    /**
     * Atualiza o mapa com os pontos recebidos do servidor
     * @param {{map_name: string, map_description: string, points: {id: number, map_id: number, name: string, description: string, latitude: number, longitude: number}[]}} data
     * @param {number} mapId
     * @returns {void}
     */
    updateMap(data, mapId){
        this.mapId = mapId;
        this.pointLayer.clearLayers();
        this.mapNameSpan.innerText = data.map_name;
        this.mapDescriptionSpan.innerText = data.map_description;
        data.points.forEach((point)=>{
            this._createPoint(point);
        });
    }
}
/**
 * Função para obter a data e hora local no formato ISO 8601
 * @returns {string} - Retorna a data e hora local no formato ISO 8601
 */
function getLocalDatetimeValue() {
  const now = new Date();
  const pad = n => n.toString().padStart(2, '0');

  const year = now.getFullYear();
  const month = pad(now.getMonth() + 1);
  const day = pad(now.getDate());
  const hours = pad(now.getHours());
  const minutes = pad(now.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}
/**
 * Classe destinada para comunicação com o servidor Flask
 * @class ServerFetch
 */
class ServerFetch{
    constructor(){
        //URL do servidor Flask
        this.url = 'http://127.0.0.1:5000';
    }

    /**
     * Retorna a lista de mapas do servidor
     * @async
     * @returns {Promise<Array>} - List of maps
     */
    async getMapList(){
        const mapsResponse = await fetch(`${this.url}/maps`, {
            method: 'get',
          });
        const  {maps} = await mapsResponse.json();
        return maps;
    }
    /**
     * Remove um mapa do servidor
     * @async
     * @param {number} id 
     * @returns Nome do mapa
     */
    async deleteMap(id){
        const mapsResponse = await fetch(`${this.url}/map?id=${id}`, {
            method: 'delete',
          });
        return await mapsResponse.json();
    }
    /**
     * Adiciona ou atualiza um mapa no servidor
     * @async
     * @param {{id: number, name: string, description: string}} data 
     * @returns 
     */
    async upsertMap(data){
        const {id, name, description} = data;
        const formData = new FormData();
        formData.append('name', name);
        formData.append('id', id.toString());
        formData.append('description', description);
      
        let url = `${this.url}/map`;
        const response = await fetch(url, {
          method: 'post',
          body: formData
        });
        const responseData = await response.json();
        if (!response.ok) {
            const {message} = responseData
            throw new Error(message);
        }
        return responseData;
    }
    /**
     * Retorna os pontos de um mapa do servidor
     * @async
     * @param {number} mapId 
     * @returns 
     */
    async getPoints(mapId){
        const pointsResponse = await fetch(`${this.url}/points?id=${mapId}`, {
            method: 'get',
          });
        return await pointsResponse.json();
    }
    /**
     * Adiciona ou atualiza um ponto no servidor
     * @async
     * @param {{id: number, map_id: number, name: string, description: string, operation_date: Date, shooting_severity: string, latitude: number, longitude: number}} data 
     * @returns 
     */
    async upsertPoint(data){
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('id', data.id.toString());
        formData.append('description', data.description);
        formData.append('operation_date', data.operation_date);
        formData.append('map_id', data.map_id.toString());
        formData.append('latitude', data.latitude.toString());
        formData.append('longitude', data.longitude.toString());
        console.log('upsertPoint', data);
        let url = `${this.url}/point`;
        const mapsResponse = await fetch(url, {
          method: 'post',
          body: formData
        });
        return await mapsResponse.json();
    }
    /**
     * Remove um ponto do servidor
     * @async
     * @param {number} mapId 
     * @param {number} pointId 
     * @returns 
     */
    async deletePoint(mapId, pointId){
        const mapsResponse = await fetch(`${this.url}/point?id=${pointId}&map_id=${mapId}`, {
            method: 'delete',
          });
        return await mapsResponse.json();
    }
          
}

/**
 * Classe destinada para criar o popup de adicionar e editar mapas
 * @class MapListPopupComponent
 */
class MapListPopupComponent{
    /**
     * @param {Function} upsertFunction 
     */
    constructor(upsertFunction){
        this.id = -1; // Sempre inicia com -1 para indicar que é um novo mapa
        this.popup = document.getElementById('popup');
        this.nameInput = document.getElementById('nameInput');
        this.descriptionInput = document.getElementById('descriptionInput');
        this.upsertFunction = upsertFunction;
        const cancelAddMap = document.getElementById('cancelAddMap');
        cancelAddMap.onclick = () =>{
            this.closePopup();
        };
        const form = document.getElementById('popupForm');
        form.addEventListener('submit', (event) => {
            event.preventDefault(); // Previne recarregamento da página
            const formData = new FormData(form);
            const data = {
                id: this.id,
                name: formData.get('name'),
                description: formData.get('description')
            };
            console.log('Dados enviados:', data); // Mostra os dados no console
            this.upsertFunction(data);
            this.closePopup();
        });
    }

    /**
     * Função para criar um novo mapa
     * @returns {void}
     */
    createMap() {
        this.editMap(-1, '', ''); // Chama a função editMap com id -1 para criar um novo mapa
    }

    /**
     * Função para editar um mapa existente
     * @param {number} id id do mapa
     * @param {string} name nome do mapa
     * @param {string} description 
     */
    editMap(id, name, description){
        this.id = id;
        this.nameInput.value = name;
        this.descriptionInput.value = description;
        this.popup.style.visibility = 'visible';
    }

    /**
     * Fecha o popup
     */
    closePopup() {
        this.popup.style.visibility = 'hidden';
    }
}

/**
 * Classe destinada para representar a CRUD de mapas
 * @class MapListTableComponent
 */
class MapListTableComponent{
    /**
     * 
     * @param {Function} upsertFunction Function para adicionar ou editar o mapa
     * @param {Function} viewMapFunction Function para visualizar o mapa
     * @param {Function} deleteFunction Function para remover o mapa
     */
    constructor(upsertFunction, viewMapFunction, deleteFunction){
        this.viewMapFunction = viewMapFunction;
        this.deleteFunction = deleteFunction;
        this.addMapElement = new MapListPopupComponent(upsertFunction);
        this.mapTable = document.getElementById('mapTableList');
        this._mapTableContainer = document.getElementById('tableElementList');
        this._addMapBtn = document.getElementById('addMapBtn');
        this._addMapBtn.addEventListener('click', () => {
            this.addMapElement.createMap();
        });
        this.clearElements();
        this._createEmptyList();
    }
    /**
     * Esconde a tabela de mapas
     * @returns {void}
     */
    hide(){
        this.mapTable.style.display = 'none';
    }
    /**
     * Mostra a tabela de mapas
     * @returns {void}
     */
    show(){
        this.mapTable.style.display = 'block';
    }
    /**
     * 
     * @param {any} value 
     * @param {HTMLElement} row 
     */
    _insertColumn(value, row){
        const column = document.createElement('td');
        column.innerText = value;
        row.appendChild(column);
    }
    /**
     * Cria o botão de ação para editar, remover ou visualizar o mapa
     * @param {string} src Caminho da imagem do botão
     * @param {string} title Nome do botão
     * @returns {HTMLElement}
     */
    _createActionButton(src, title){
        const btn = document.createElement('span');
        btn.className = 'action-btn';
        const img = document.createElement('img');
        btn.appendChild(img);
        img.src = src;
        img.alt = title;
        img.title = title;
        return btn;
    }
    /**
     * Cria uma linha vazia na tabela de mapas
     * @returns {void}
     */
    _createEmptyList(){
        const row = document.createElement('tr');
        const column = document.createElement('td');
        column.innerText = 'Nenhum mapa encontrado';
        column.colSpan = 6;
        row.appendChild(column);
        this._mapTableContainer.appendChild(row);
    }
    /**
     * Cria os botões de ação para editar, remover e visualizar o mapa
     * @param {any} mapElement
     * @param {HTMLElement} row
     * @returns {void}
     */
    _insertActions(mapElement, row){
        const column = document.createElement('td');
        const editButton = this._createActionButton('imgs\\edit-icon.png', 'Editar');
        editButton.addEventListener('click', () => {
            this.addMapElement.editMap(mapElement.id, mapElement.name, mapElement.description);
        });
        column.appendChild(editButton);
        const deleteButton = this._createActionButton('imgs\\delete-icon.png', 'Remover');
        deleteButton.addEventListener('click', () => {
            this.deleteFunction(mapElement.id, mapElement.name);
        });
        column.appendChild(deleteButton);
        const viewMapButton = this._createActionButton('imgs\\view-icon.png', 'Visualizar Mapa');
        viewMapButton.addEventListener('click', () => {
            this.viewMapFunction(mapElement.id);
        });
        column.appendChild(viewMapButton);
        row.appendChild(column);
    }
    /**
     * Limpa todos os elementos da tabela de mapas
     * @returns {void}
     */
    clearElements(){
        const table = this._mapTableContainer;
        while(table.firstChild){
            table.removeChild(table.firstChild);
        }
    }
    /**
     * Insere os elementos na tabela de mapas
     * @param {{name: string, description: string, id: number, creation_date: string, update_date: string, points: number}[]} mapElementList 
     * @returns {void}
     */
    insertElements(mapElementList){
        this.clearElements();
        if(mapElementList.length === 0){
            this._createEmptyList();
            return;
        }
        mapElementList.forEach((mapElement) => {
            this.insertElement(mapElement);
        });
    }
    /**
     * Insere um elemento na tabela de mapas
     * @param {{name: string, description: string, id: number, creation_date: string, update_date: string, points: number}} mapElement 
     */
    insertElement(mapElement){
        const table = this._mapTableContainer;
        const row = document.createElement('tr');
        this._insertColumn(mapElement.name, row);
        this._insertColumn(mapElement.description, row);
        this._insertColumn(mapElement.points, row);
        this._insertColumn(mapElement.creation_date, row);
        this._insertColumn(mapElement.update_date, row);
        this._insertActions(mapElement, row);
        table.appendChild(row);
    }
}

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
        icon.src = 'imgs/create-point-on.png';
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
class MapComponent{
    /**
     * 
     * @param {Function} backClick 
     * @param {Function} upsertPoint 
     * @param {Function} deletePoint 
     */
    constructor(backClick, upsertPoint, deletePoint){
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
                            operation_date: getLocalDatetimeValue(),
                            shooting_severity: null,
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
    show(){
        this.pointsArea.style.display = 'block';
        //DEFAULT do rio de janeiro caso não consiga pegar a localização da maquina
        this.map.setView([-22.970368, -43.1816704], 8)
        this.map.locate();
        this.map.on('locationfound', (e) => {
            this.map.setView([e.latlng.lat, e.latlng.lng], 13);
        });
        this.createPointAction.disable();
    }
    /**
     * Cria um ponto no mapa e adiciona o popup para editar o ponto
     * @param {{id: number, map_id: number, name: string, description: string, operation_date: Date, shooting_severity: string, latitude: number, longitude: number}} point 
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
                operation_date: formData.get('operation_date'),
                shooting_severity: point.shooting_severity,
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

        const labelOperationDate = L.DomUtil.create('label', '', form);
        labelOperationDate.setAttribute("for", "operation_date");
        labelOperationDate.innerText = "Data da operação";
        
        const inputOperationDate = L.DomUtil.create('input', '', form);
        inputOperationDate.id = "operation_date";
        inputOperationDate.name = "operation_date";
        inputOperationDate.type = "datetime-local";
        inputOperationDate.value = point.operation_date;
    
        const labelShootingSeverity = L.DomUtil.create('label', '', form);
        labelShootingSeverity.innerText = "Gravidade do tiroteio";

        const divShootingSeverity = L.DomUtil.create('div', '', form);
        switch (point.shooting_severity) {
            case 'Sem vítimas':
                divShootingSeverity.className = 'shooting_severity_div shooting_severity_sem_vitimas';
                divShootingSeverity.innerText = 'Sem vítimas';
                break;
            case 'Sem mortos':
                divShootingSeverity.className = 'shooting_severity_div shooting_severity_sem_mortos';
                divShootingSeverity.innerText = 'Sem mortos';
                break;
            case 'Com mortos':
                divShootingSeverity.className = 'shooting_severity_div shooting_severity_com_mortos';
                divShootingSeverity.innerText = 'Com mortos';
                break;
            default:
                divShootingSeverity.className = 'shooting_severity_div shooting_severity_none';
                divShootingSeverity.innerText = 'Sem informação';
        }
        

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
            inputOperationDate.value = point.operation_date;
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

/**
 * Classe que representa a página de mapas possuindo todo o controle sobre os componentes de listagem e edição
 * @class MyMapPage
 */
class MyMapPage{
    constructor(){
        this.serverFetch = new ServerFetch();
        this.mapComponent = new MapComponent(
            ()=>{
                console.log('Back clicked');
                this.mapComponent.hide();
                this.atualizarListaMapas()
                this.mapTableList.show();
            },
            async (data)=>{
                console.log('Upsert point clicked', data);
                await this.serverFetch.upsertPoint(data);
                this.atualizarMapa(data.map_id);
            },
            async (mapId, idPoint)=>{
                console.log('delete point clicked');
                await this.serverFetch.deletePoint(mapId, idPoint);
                this.atualizarMapa(mapId);
            }
        );
        this.mapTableList = new MapListTableComponent(
            async (data)=>{
                console.log('UPSERT', data);
                let action = 'atualizar';
                let actionOk = 'atualizado';
                if(data.id === -1){
                    action = 'inserir';
                    actionOk = 'inserido';
                }
                try{
                    await this.serverFetch.upsertMap(data);
                    alert(`O mapa '${data.name}' foi ${actionOk}`);
                    this.atualizarListaMapas();
                }catch(e){
                    const message = `Erro ao ${action} o mapa ${data.name}`;
                    console.error(message, e);
                    alert(message);
                }
            }, 
            async (idMap)=>{
                console.log('viewMap', idMap);
                this.mapTableList.hide();
                this.atualizarMapa(idMap);
                this.mapComponent.show();
            }, 
            async (idMap, mapName)=>{
                console.log('deleteMap', idMap);
                const confirmMessage = `Você tem certeza que deseja remover o mapa de nome ${mapName}`;
                if (confirm(confirmMessage)) {
                    try{
                        await this.serverFetch.deleteMap(idMap);
                        alert(`Mapa ${mapName} removido com sucesso.`);
                        this.atualizarListaMapas();
                    }catch(e){
                        console.error('Erro ao remover o mapa ', e);
                        alert(`Erro ao remover o mapa.`)
                    }
                }
            }
        );
    }
    /**
     * Atualiza a lista de mapas chamando o servidor
     */
    atualizarListaMapas(){
        this.serverFetch.getMapList().then((mapList) => {
            console.log('MAP LIST', mapList);
            this.mapTableList.insertElements(mapList);
        });
    }

    /**
     * Atualiza o mapa com os pontos recebidos do servidor
     * @param {number} mapId 
     */
    atualizarMapa(mapId){
        this.serverFetch.getPoints(mapId).then((pointsList) => {
            console.log('points list', pointsList);
            this.mapComponent.updateMap(pointsList, mapId);
        });
    }

    /**
     * Inicializa a página de mapas
     * @returns {void}
     */
    init(){
        this.atualizarListaMapas();
    }
}
const myMapPage = new MyMapPage();
myMapPage.init();


class ServerFetch{
    constructor(){
        //URL do servidor Flask
        this.url = 'http://127.0.0.1:5000';
    }

    /**
     * @returns {Promise<Array>} - List of maps
     */
    async getMapList(){
        const mapsResponse = await fetch(this.url + '/maps', {
            method: 'get',
          });
        const data = await mapsResponse.json();
        return data.maps;
    }
    async deleteMap(id){
        const mapsResponse = await fetch(this.url + '/map?id=' + id, {
            method: 'delete',
          });
        //const data = await mapsResponse.json();
        return;
    }
    async upsertMap(data){
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('id', data.id);
        formData.append('description', data.description);
      
        let url = this.url + '/map';
        const mapsResponse = await fetch(url, {
          method: 'post',
          body: formData
        });
        const dataResponse = await mapsResponse.json();
        return dataResponse;
    }
    async getPoints(mapId){
        const pointsResponse = await fetch(this.url + '/points?id=' + mapId, {
            method: 'get',
          });
        const data = await pointsResponse.json();
        return data;
    }
    async upsertPoint(data){
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('id', data.id);
        formData.append('description', data.description);
        formData.append('map_id', data.map_id);
        formData.append('latitude', data.latitude);
        formData.append('longitude', data.longitude);
      
        let url = this.url + '/point';
        const mapsResponse = await fetch(url, {
          method: 'post',
          body: formData
        });
        const dataResponse = await mapsResponse.json();
        return dataResponse;
    }
    async deletePoint(mapId, pointId){
        const mapsResponse = await fetch(`${this.url}/point?id=${pointId}&map_id=${mapId}`, {
            method: 'delete',
          });
        //const data = await mapsResponse.json();
        return;
    }
          
}

class AddMapElement{
    constructor(upsertFunction){
        this.id = -1;
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
    createMap() {
        this.editMap(-1, '', '');
    }

    editMap(id, name, description){
        this.id = id;
        this.nameInput.value = name;
        this.descriptionInput.value = description;
        this.popup.style.visibility = 'visible';
    }

    // Função para fechar o popup
    closePopup() {
        this.popup.style.visibility = 'hidden';
    }

}

class MapListTable{
    constructor(upsertFunction, viewMapFunction, deleteFunction){
        this.viewMapFunction = viewMapFunction;
        this.deleteFunction = deleteFunction;
        this.addMapElement = new AddMapElement(upsertFunction);
        this.mapTable = document.getElementById('mapTableList');
        this._addMapBtn = document.getElementById('addMapBtn');
    
        this._addMapBtn.addEventListener('click', () => {
            this.addMapElement.createMap();
        });

        this._mapTableContainer = document.getElementById('tableElementList');
        this.clearElements();
        this._createEmptyList();
    }
    hide(){
        this.mapTable.style.display = 'none';
    }
    show(){
        this.mapTable.style.display = 'block';
    }
    _insertColumn(value, row){
        const column = document.createElement('td');
        column.innerText = value;
        row.appendChild(column);
    }
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
    _createEmptyList(){
        const row = document.createElement('tr');
        const column = document.createElement('td');
        column.innerText = 'Nenhum mapa encontrado';
        column.colSpan = 6;
        row.appendChild(column);
        this._mapTableContainer.appendChild(row);
    }
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
    clearElements(){
        const table = this._mapTableContainer;
        while(table.firstChild){
            table.removeChild(table.firstChild);
        }
    }
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
    insertElement(mapElement){
        const table = this._mapTableContainer;
        const row = document.createElement('tr');
        this._insertColumn(mapElement.name, row);
        this._insertColumn(mapElement.description, row);
        this._insertColumn(0, row);
        this._insertColumn(mapElement.creation_date, row);
        this._insertColumn(mapElement.update_date, row);
        this._insertActions(mapElement, row);
        table.appendChild(row);
    }
}


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
            options.callback(e.latlng);
        });
        return div;
    },
    onRemove: function() {},
    disable: function(){
        this.turnedOn = false;
        this.map.getContainer().style.cursor = ''
        this.backgroundDiv.className = 'point-btn-off';
    }
});

class MapComponent{
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
        this.map = L.map('innerMap');
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
                            id: -1, 
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
    hide(){
        this.pointsArea.style.display = 'none';
    }
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

        if(point.id >= 0){
            const removeButton = L.DomUtil.create('button', 'cancel-button', divBtns);
            removeButton.type = "button";
            removeButton.innerText = "Remover";
            L.DomEvent.on(removeButton, 'click', ()=>{
                this.deletePoint(point.map_id, point.id)
                marker.closePopup();
            });
        }
        
        marker.on('popupclose', (e)=>{
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
        this.mapTableList = new MapListTable(
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
    atualizarListaMapas(){
        this.serverFetch.getMapList().then((mapList) => {
            console.log('MAP LIST', mapList);
            this.mapTableList.insertElements(mapList);
        });
    }

    atualizarMapa(mapId){
        this.serverFetch.getPoints(mapId).then((pointsList) => {
            console.log('points list', pointsList);
            this.mapComponent.updateMap(pointsList, mapId);
        });
    }

    init(){
        this.atualizarListaMapas();
    }
}
const myMapPage = new MyMapPage();
myMapPage.init();


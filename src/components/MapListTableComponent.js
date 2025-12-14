import MapListPopupComponent from "./MapListPopupComponent.js";
/**
 * Classe destinada para representar a CRUD de mapas
 * @class MapListTableComponent
 */
export default class MapListTableComponent{
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
        const editButton = this._createActionButton('src/assets/icons/edit-icon.png', 'Editar');
        editButton.addEventListener('click', () => {
            this.addMapElement.editMap(mapElement.id, mapElement.name, mapElement.description);
        });
        column.appendChild(editButton);
        const deleteButton = this._createActionButton('src/assets/icons/delete-icon.png', 'Remover');
        deleteButton.addEventListener('click', () => {
            this.deleteFunction(mapElement.id, mapElement.name);
        });
        column.appendChild(deleteButton);
        const viewMapButton = this._createActionButton('src/assets/icons/view-icon.png', 'Visualizar Mapa');
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
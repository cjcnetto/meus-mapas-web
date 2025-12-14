/**
 * Classe destinada para criar o popup de adicionar e editar mapas
 * @class MapListPopupComponent
 */
export default class MapListPopupComponent{
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
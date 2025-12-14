/**
 * Classe destinada para comunicação com o servidor Flask
 * @class ServerFetch
 */
export default class ServerFetch{
    constructor(){
        //URL do servidor Flask
        this.url = 'http://127.0.0.1:5000';
    }

    /**
     * Busca a lista de praias a partir de uma box do mapa
     * @param {number} south 
     * @param {number} west 
     * @param {number} north 
     * @param {number} east 
     * @returns 
     */
    async getBeaches(south, west, north, east){
        const response = await fetch(`${this.url}/beaches?south=${south}&west=${west}&north=${north}&east=${east}`, {
            method: 'get',
            headers: {'Accept': 'application/json'}
          });
        const  data = await response.json();
        return data;
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
     * @param {{id: number, map_id: number, name: string, description: string, latitude: number, longitude: number}} data 
     * @returns 
     */
    async upsertPoint(data){
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('id', data.id.toString());
        formData.append('description', data.description);
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
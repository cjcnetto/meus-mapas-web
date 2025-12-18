import ServerFetch from "./services/ServerFetch.js";
import MapListTableComponent from "./components/MapListTableComponent.js";
import MapComponent from "./components/MapComponent.js";

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
            },
            async(south, west, north, east)=>{
                console.log('get beaches in area', south, west, north, east);
                return await this.serverFetch.getBeaches(south, west, north, east);
            },
            async(mapId, pointId)=>{
                console.log('get weather for point', mapId, pointId);
                if(pointId === null || pointId === undefined || pointId === -1){
                    return await this.serverFetch.getWeather(mapId);
                }
                return await this.serverFetch.getWeatherForPoint(mapId, pointId);
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


/**
 * Classe que realiza o controle da camada de praias no mapa
 * @class BeachLayerProvider
 */
export default class BeachLayerProvider {
    /**
     * 
     * @param {L.Map} map 
     * @param {Function} getBeaches
     */
    constructor(map, getBeaches, upsertPoint) {
        this.map = map;
        this.mapId = null;
        this.upsertPoint = upsertPoint;
        this.layer = L.layerGroup();
        this.currentAbort = null;
        let moves = 0;
        map.addLayer(this.layer);
        this.map.on("moveend", () => {
            if(this.map.getZoom() <= 11){
                this.layer.clearLayers();
                return;
            }
            moves++;
            if(moves == 1){
                this.getBeachesInView(getBeaches)
                .finally(() => moves = 0);
            }
        });
    }

    setMapId(mapId){
        this.mapId = mapId;
    }

    async getBeachesInView(getBeaches) {    
        try{
            const bounds = this.map.getBounds();
            const beachIcon = L.icon({
                iconUrl: '../src/assets/map-icons/beach.svg',
                iconSize: [32, 32],
            });
            const beachColor = '#a3ff33ff';
            const beaches = await getBeaches(
                bounds.getSouth(), 
                bounds.getWest(), 
                bounds.getNorth(), 
                bounds.getEast());
            if(!beaches){
                return;
            }
            this.layer.clearLayers();
            console.log('BEACHES:', beaches);
            L.geoJSON(beaches, {
            pointToLayer: (_, latlng) => L.marker(latlng, { icon: beachIcon }),
            style: (_) => ({ color: beachColor })
            }).bindPopup((layer) => {
                const div = document.createElement('div');
                const name = layer.feature.properties.name;
                const h3 = document.createElement('h3');
                h3.textContent = name;
                div.appendChild(h3);

                if(layer.feature.properties.wikipedia_url){
                    const wikiLink = document.createElement('a');
                    wikiLink.href = layer.feature.properties.wikipedia_url;
                    wikiLink.textContent = 'Wikipedia';
                    wikiLink.target = '_blank';
                    div.appendChild(wikiLink);
                }
                if(layer.feature.properties.image){
                    const img = document.createElement('img');
                    img.src = layer.feature.properties.image;
                    img.style.maxWidth = '200px';
                    div.appendChild(img);      
                }
                if(layer.feature.properties.access){
                    const accessP = document.createElement('p');
                    accessP.textContent = `Access: ${layer.feature.properties.access}`;
                    div.appendChild(accessP);
                }

                L.DomUtil.create('hr', '', div);
                const divBtns = L.DomUtil.create('div', 'popup-buttons', div);
                const okButton = L.DomUtil.create('button', 'ok-button', divBtns);
                okButton.type = "button";
                okButton.innerText = "Criar Ponto";
                let latitude = 0;
                let longitude = 0;
                if(layer.feature.geometry.type === 'Point'){
                    latitude = layer.feature.geometry.coordinates[1];
                    longitude = layer.feature.geometry.coordinates[0];
                }else{
                    const center = layer.getBounds().getCenter();
                    latitude = center.lat;
                    longitude = center.lng;
                }

                okButton.onclick = () => {
                    const data = {
                        id: -1,
                        map_id: this.mapId,
                        name: name,
                        description: '',
                        point_type: 1,
                        latitude: latitude,
                        longitude: longitude
                    };
                    this.layer.closePopup();
                    this.upsertPoint(data);
                };
                return div;
            }).addTo(this.layer);
        }
        catch(error){
           console.error('Error fetching beaches:', error);
        }
    }
}
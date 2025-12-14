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
    constructor(map, getBeaches) {
        this.map = map;
        this.layer = L.layerGroup();
        this.currentAbort = null;
        this.inflight = false;

        map.addLayer(this.layer);
        this.map.on("moveend", () => {
            this.debounce(this.getBeachesInView(getBeaches), 500, { leading: false, trailing: true });
        });
    }

    async getBeachesInView(getBeaches) {
        console.log('inflght', this.inflight);
        if (this.inflight && this.currentAbort) {
            this.currentAbort.abort(); // cancela requisição anterior
        }

        this.currentAbort = new AbortController();
        this.inflight = true;
        try{
            const bounds = this.map.getBounds();
            console.log('Map moved, getting beaches in area', bounds);
            const beachIcon = L.icon({
                iconUrl: '/src/assets/map-icons/beach.svg',
                iconSize: [32, 32],
            });
            const beachColor = '#a3ff33ff';
            const beaches = await getBeaches(
                bounds.getSouth(), 
                bounds.getWest(), 
                bounds.getNorth(), 
                bounds.getEast());
            this.layer.clearLayers();
            L.geoJSON(beaches, {
            pointToLayer: (feature, latlng) => L.marker(latlng, { icon: beachIcon }),
            style: (feature) => ({ color: beachColor })
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


                return div;
            }).addTo(this.layer);
        }
        catch(error){
           if (error.name !== 'AbortError') {
            console.error('Erro ao buscar praias:', error);
           }
        }finally{
            this.inflight = false;
        }
    }    
    debounce(fn, delay) {
    let timeout;
    console.log('Debounce called');
    return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => fn.apply(this, args), delay);
        };
    }
}
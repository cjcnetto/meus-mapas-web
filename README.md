# MEUS-MAPAS-WEB

Este é o projeto que se encontra o MVP da disciplina  **Arquitetura de Software** 
esse projeto é uma continuação do projeto do Fullstack Básico.

## Objetivo
Tem como objetivo apresentar uma CRUD de mapas uma tela de popup para editar os dados básicos de um mapa assim como criá-los. Existe também a possibilidade de ver o mapa georeferenciado para poder criar pontos, editar e remove-los. Os pontos criados tem sua previsão do tempo devidamente atualizada, no mapa também é possivel visualizar as praias visiveis do mapa.

## Aquitetura

### Front End
- A aplicação foi desenvolvida utilizando HTML, CSS e JavaScript puro. Dividindo o código em arquivos distintos para melhor organização e manutenção.
- **[index.html](index.html)** -> arquivo principal da aplicação
- [src/](./src/) -> diretório com os arquivos fonte da aplicação
  - **[scripts.js](./src/scripts.js)** -> arquivo principal de JavaScript que inicializa a aplicação e gerencia os componentes
  - **[assets/](./src/assets/)** -> diretório com os arquivos estáticos da aplicação
    - **[icons/](./src/assets/icons/)** -> diretório com os ícones utilizados na aplicação
    - **[map-icons/](./src/assets/map-icons/)** -> diretório com os ícones utilizados nos mapas
  - **[css](./src/css/)** -> diretório com os arquivos CSS para estilização da aplicação
  - **[components/](src/components/)** -> diretório com os componentes reutilizáveis da aplicação
  - **[services/](src/services/)** -> diretório com os serviços para comunicação com a API

### Biblioteca Java Script utilizada: 
- **[Leaflet](https://leafletjs.com/)** -> Para desenho dos mapas e tratamento dos pontos.

## API Back End
- [meus-mapas-api](https://github.com/cjcnetto/meus-mapas-api) -> Projeto Back End que fornece a API RESTful para a aplicação web.

[INSERIR IMAGEM DA AQRUITETURA AQUI]  

## Como executar
1. Clone o repositório:
```
git clone
```
2. Navegue até o diretório do projeto:
```
cd meus-mapas-web
```
3. Caso esteja usando uma extensão de servidor local como a Live Server do VS Code, basta abrir o arquivo `index.html` com o servidor.


## Usando Docker

1. Para criar a imagem do docker, basta executar o comando abaixo no diretório raiz do projeto:
```
docker build -t meus-mapas-web .
```
1. Para executar o container, basta executar o comando abaixo:
```
docker run --rm -p 8080:80 meus-mapas-web
```
1. Para parar o container, basta executar o comando abaixo:
```
docker rm meus-mapas-web
```
1. Abra o [http://localhost:8080](http://localhost:8080) para acessar a aplicação.



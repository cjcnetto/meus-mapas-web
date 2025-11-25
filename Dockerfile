# Usa imagem oficial do Nginx
FROM nginx:alpine

# Define diretório padrão do Nginx
WORKDIR /usr/share/nginx/html

# Remove arquivos padrão
RUN rm -rf ./*

# Copia seus arquivos HTML/CSS/JS para dentro do container
COPY . .

# Expõe a porta 80
EXPOSE 80

# Nginx já inicia automaticamente com CMD padrão
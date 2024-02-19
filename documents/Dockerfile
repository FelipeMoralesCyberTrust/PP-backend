#Ejemplo de tutorial docker de la U
#Establece la imagen base (puedes usar una imagen diferente según tu aplicación)
FROM node:21.6.2-bookworm-slim
#Establece el directorio de trabajo en el contenedor
WORKDIR /app
#Copia los archivos del proyecto al directorio de trabajo en el contenedor
COPY package*.json ./

RUN npm install
#copiar archivos
COPY . .
#Expone el puerto en el que la aplicación escucha
EXPOSE 80
#Comando para iniciar la aplicación
CMD ["npm", "start"]

FROM node:18-alpine

WORKDIR /app

# Copia apenas o package.json (o package-lock.json será gerado)
COPY package.json ./

# Instala as dependências Node.js
RUN npm install

# Copia o restante do código fonte
COPY . .

# Expõe a porta padrão do React (3000)
EXPOSE 3000

# Inicia a aplicação em modo de desenvolvimento
CMD ["npm", "start"]

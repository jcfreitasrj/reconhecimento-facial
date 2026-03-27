cat > README.md << 'EOF'
# Sistema de Reconhecimento Facial

Sistema web para cadastro e reconhecimento facial usando Flask, React, MongoDB e Docker.

## 🚀 Como executar

1. Clone o repositório
2. Execute `docker compose up --build`
3. Acesse `http://localhost:3000`

## 📸 Funcionalidades

- Cadastro de pessoas com foto (webcam ou upload)
- Reconhecimento facial com similaridade
- Armazenamento de embeddings no MongoDB

## 🛠️ Tecnologias

- Backend: Flask, face_recognition, dlib, MongoDB
- Frontend: React, Bootstrap, react-webcam
- Orquestração: Docker, Docker Compose

## 📝 Licença

MIT
EOF

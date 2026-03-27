import os
import base64
import cv2
import numpy as np
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from sklearn.metrics.pairwise import cosine_similarity
from face_utils import detect_faces, get_embedding

# -------------------- Configuração --------------------
app = Flask(__name__)
CORS(app)

# Lê variáveis de ambiente (definidas no docker-compose.yml ou .env)
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://mongo:27017/')
SIMILARITY_THRESHOLD = float(os.getenv('SIMILARITY_THRESHOLD', '0.6'))

# Conecta ao MongoDB
client = MongoClient(MONGO_URI)
db = client['facial_recognition']
users_collection = db['users']

# -------------------- Rotas --------------------
@app.route('/register', methods=['POST'])
def register():
    """
    Cadastra um novo usuário.
    Espera JSON com 'name' e 'image' (base64).
    """
    data = request.get_json()
    name = data.get('name')
    image_data = data.get('image')

    if not name or not image_data:
        return jsonify({'error': 'Nome e imagem são obrigatórios'}), 400

    # Decodifica a imagem base64
    try:
        # Remove o prefixo "data:image/jpeg;base64," se presente
        if ',' in image_data:
            image_data = image_data.split(',')[1]
        img_bytes = base64.b64decode(image_data)
        nparr = np.frombuffer(img_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    except Exception as e:
        return jsonify({'error': f'Erro ao decodificar imagem: {str(e)}'}), 400

    # Detecta faces
    faces = detect_faces(img)
    if len(faces) == 0:
        return jsonify({'error': 'Nenhuma face detectada na imagem'}), 400

    # Usa a primeira face
    x, y, w, h = faces[0]
    face_crop = img[y:y+h, x:x+w]

    # Extrai embedding
    embedding = get_embedding(face_crop)
    if embedding is None:
        return jsonify({'error': 'Não foi possível extrair o embedding da face'}), 400

    # Converte numpy array para lista (para armazenar no MongoDB)
    embedding_list = embedding.tolist()

    # Insere no banco
    user_doc = {
        'name': name,
        'embedding': embedding_list,
        'created_at': datetime.utcnow()
    }
    users_collection.insert_one(user_doc)

    return jsonify({'message': f'Usuário {name} cadastrado com sucesso'})

@app.route('/recognize', methods=['POST'])
def recognize():
    """
    Reconhece uma face em uma imagem.
    Espera JSON com 'image' (base64).
    Retorna o nome da pessoa mais similar (ou 'Desconhecido') e a similaridade.
    """
    data = request.get_json()
    image_data = data.get('image')

    if not image_data:
        return jsonify({'error': 'Imagem não fornecida'}), 400

    # Decodifica a imagem
    try:
        if ',' in image_data:
            image_data = image_data.split(',')[1]
        img_bytes = base64.b64decode(image_data)
        nparr = np.frombuffer(img_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    except Exception as e:
        return jsonify({'error': f'Erro ao decodificar imagem: {str(e)}'}), 400

    # Detecta faces
    faces = detect_faces(img)
    if len(faces) == 0:
        return jsonify({'error': 'Nenhuma face detectada na imagem'}), 400

    x, y, w, h = faces[0]
    face_crop = img[y:y+h, x:x+w]

    # Extrai embedding
    embedding = get_embedding(face_crop)
    if embedding is None:
        return jsonify({'error': 'Não foi possível extrair o embedding da face'}), 400

    # Busca todos os usuários no banco
    users = list(users_collection.find({}, {'_id': 0, 'name': 1, 'embedding': 1}))
    if not users:
        return jsonify({'name': 'Desconhecido', 'similarity': 0.0})

    best_match = None
    best_similarity = -1

    for user in users:
        stored_emb = np.array(user['embedding'])
        sim = cosine_similarity([embedding], [stored_emb])[0][0]
        if sim > best_similarity:
            best_similarity = sim
            best_match = user['name']

    if best_similarity >= SIMILARITY_THRESHOLD:
        return jsonify({'name': best_match, 'similarity': float(best_similarity)})
    else:
        return jsonify({'name': 'Desconhecido', 'similarity': float(best_similarity)})

@app.route('/users', methods=['GET'])
def list_users():
    """Retorna uma lista com os nomes de todos os usuários cadastrados."""
    users = users_collection.find({}, {'_id': 0, 'name': 1})
    names = [u['name'] for u in users]
    return jsonify(names)

# -------------------- Execução --------------------
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)

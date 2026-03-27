import cv2
import numpy as np
import face_recognition
import logging

logging.basicConfig(level=logging.INFO)

def detect_faces(image):
    """
    Detecta faces em imagem BGR usando HOG (face_recognition).
    Retorna lista de (x, y, w, h).
    """
    rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    locations = face_recognition.face_locations(rgb)  # lista de (top, right, bottom, left)
    faces = []
    for top, right, bottom, left in locations:
        faces.append((left, top, right - left, bottom - top))
    logging.info(f"Detectadas {len(faces)} faces com face_recognition")
    return faces

def get_embedding(face_img):
    """
    Extrai embedding de 128 dimensões de uma imagem de face (BGR).
    Retorna array numpy ou None.
    """
    try:
        if face_img is None or face_img.size == 0:
            logging.error("Imagem da face vazia ou nula.")
            return None
        logging.info(f"Dimensões da face: {face_img.shape}")
        rgb = cv2.cvtColor(face_img, cv2.COLOR_BGR2RGB)
        encodings = face_recognition.face_encodings(rgb)
        if encodings:
            embedding = np.array(encodings[0])
            logging.info(f"Embedding extraído com sucesso. Tamanho: {len(embedding)}")
            return embedding
        else:
            logging.error("Nenhum encoding encontrado na face.")
            return None
    except Exception as e:
        logging.error(f"Erro no get_embedding: {e}")
        return None

import React, { useState, useRef } from 'react';
import { Button, Form, Alert } from 'react-bootstrap';
import Webcam from 'react-webcam';
import axios from 'axios';

const Reconhecimento = () => {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const webcamRef = useRef(null);

  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImage(imageSrc);
    setResult(null);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRecognize = async () => {
    if (!image) {
      setError('Capture ou envie uma foto primeiro.');
      return;
    }
    try {
      const response = await axios.post('http://localhost:5000/recognize', {
        image
      });
      setResult(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Erro no reconhecimento');
      setResult(null);
    }
  };

  return (
    <div>
      <h3>Reconhecimento Facial</h3>

      <Form.Group className="mb-3">
        <Form.Label>Foto (via webcam)</Form.Label>
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          width="100%"
          videoConstraints={{ facingMode: "user" }}
        />
        <Button variant="secondary" onClick={capture} className="mt-2">
          Capturar Foto
        </Button>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Ou enviar arquivo</Form.Label>
        <Form.Control type="file" accept="image/*" onChange={handleFileUpload} />
      </Form.Group>

      {image && (
        <div className="mb-3">
          <Form.Label>Pré‑visualização</Form.Label>
          <img src={image} alt="prévia" style={{ maxWidth: '200px' }} />
        </div>
      )}

      <Button variant="primary" onClick={handleRecognize}>
        Reconhecer
      </Button>

      {result && (
        <Alert variant="info" className="mt-3">
          <strong>Resultado:</strong> {result.name} <br />
          <strong>Similaridade:</strong> {(result.similarity * 100).toFixed(2)}%
        </Alert>
      )}

      {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
    </div>
  );
};

export default Reconhecimento;

import React, { useState, useRef } from 'react';
import { Button, Form, Alert } from 'react-bootstrap';
import Webcam from 'react-webcam';
import axios from 'axios';

const Cadastro = () => {
  const [name, setName] = useState('');
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const webcamRef = useRef(null);

  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImage(imageSrc);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !image) {
      setError('Preencha o nome e capture/upload uma foto.');
      return;
    }
    try {
      const response = await axios.post('http://localhost:5000/register', {
        name,
        image
      });
      setMessage(response.data.message);
      setError('');
      setName('');
      setImage(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro no cadastro');
      setMessage('');
    }
  };

  return (
    <div>
      <h3>Cadastrar Nova Pessoa</h3>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Nome</Form.Label>
          <Form.Control
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: João Silva"
          />
        </Form.Group>

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

        <Button variant="primary" type="submit">Cadastrar</Button>
      </Form>

      {message && <Alert variant="success" className="mt-3">{message}</Alert>}
      {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
    </div>
  );
};

export default Cadastro;

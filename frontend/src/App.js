import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Nav, Navbar } from 'react-bootstrap';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Cadastro from './components/Cadastro';
import Reconhecimento from './components/Reconhecimento';

function App() {
  return (
    <BrowserRouter>
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand as={Link} to="/">Reconhecimento Facial</Navbar.Brand>
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/cadastro">Cadastro</Nav.Link>
            <Nav.Link as={Link} to="/reconhecimento">Reconhecimento</Nav.Link>
          </Nav>
        </Container>
      </Navbar>
      <Container className="mt-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/reconhecimento" element={<Reconhecimento />} />
        </Routes>
      </Container>
    </BrowserRouter>
  );
}

function Home() {
  return <h2>Bem‑vindo ao sistema de reconhecimento facial</h2>;
}

export default App;

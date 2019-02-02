import React from "react";
import { Col, Container, ListGroup, Row } from "react-bootstrap";
import { WordCard } from "./WordCard";

function App(props: { card: { title: string; description?: string } }) {
  return (
    <Container>
      <Row className="justify-content-md-center">
        <Col md="6" className="mt-5 mb-5">
          <WordCard {...props.card} />
        </Col>
      </Row>
    </Container>
  );
}

export default App;

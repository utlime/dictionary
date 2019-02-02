import React from "react";
import { Button, Card, Col, Row } from "react-bootstrap";

export function WordCard(props: { title: string; description?: string }) {
  return (
    <Card>
      <Card.Body>
        <Card.Title>{props.title}</Card.Title>
        {props.description ? <Card.Text>{props.description}</Card.Text> : false}
      </Card.Body>
      <Card.Footer>
        <Row>
          <Col>
            <Button variant={"light"} block>
              I don't know
            </Button>
          </Col>
          <Col>
            <Button variant={"success"} block>
              I know
            </Button>
          </Col>
        </Row>
      </Card.Footer>
    </Card>
  );
}

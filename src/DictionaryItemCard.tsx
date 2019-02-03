import React from "react";
import { Button, Card, Col, Row } from "react-bootstrap";
import { DictionaryItem } from "./DictionaryState";

interface WordCardProps extends DictionaryItem {
  onChange?: (updated: Partial<DictionaryItem>) => void;
}

export function DictionaryItemCard<T extends WordCardProps>(props: T) {
  return (
    <Card border={props.isKnown ? "success" : undefined}>
      <Card.Body>
        <Card.Title>{props.word}</Card.Title>
        {props.description != null && props.description.length > 0 ? (
          <Card.Text>{props.description}</Card.Text>
        ) : (
          false
        )}
      </Card.Body>
      <Card.Footer>
        <Row>
          <Col>
            <Button
              onClick={() =>
                props.onChange && props.onChange({ isKnown: false })
              }
              variant={"light"}
              block
            >
              I don't know
            </Button>
          </Col>
          <Col>
            <Button
              onClick={() =>
                props.onChange && props.onChange({ isKnown: true })
              }
              variant={"success"}
              block
            >
              I know
            </Button>
          </Col>
        </Row>
      </Card.Footer>
    </Card>
  );
}

import React from "react";
import {
  Col,
  Container,
  Form,
  InputGroup,
  Row,
  Button,
  Card
} from "react-bootstrap";
import { useAppActions } from "./AppActions";
import { useAppState, Item } from "./AppState";

function Header(props: {
  word: string;
  onAdd: (word: { word: string }) => void;
  onSearch: (word: { word: string }) => void;
}) {
  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        props.onAdd({ word: props.word });
      }}
    >
      <InputGroup className="mt-3 mb-3">
        <Form.Control
          value={props.word}
          // @ts-ignore
          onChange={(e: Event) => {
            if (e.target instanceof HTMLInputElement) {
              props.onSearch({ word: e.target.value });
            }
          }}
        />
        <InputGroup.Append>
          <Button type="submit" variant="outline-secondary">
            add
          </Button>
        </InputGroup.Append>
      </InputGroup>
    </form>
  );
}

function SearchResult(props: {
  items: Item[];
  onSelect: (item: { id: string }) => void;
}) {
  return (
    <React.Fragment>
      {props.items.map(item => (
        <Card className="mt-3 mb-3">
          <Card.Body>
            <Card.Title>{item.word}</Card.Title>
            {item.description !== "" ? (
              <Card.Text>{item.description}</Card.Text>
            ) : (
              false
            )}
            <Card.Link
              href="#"
              // @ts-ignore
              onClick={(e: Event) => {
                e.stopPropagation();
                props.onSelect({ id: item.id });
              }}
            >
              select
            </Card.Link>
          </Card.Body>
        </Card>
      ))}
    </React.Fragment>
  );
}

function ItemView(props: {
  item: Item;
  onChange: (item: {
    id: string;
    description?: string;
    isKnown?: boolean;
  }) => void;
  onNext: (item: { id: string }) => void;
}) {
  return (
    <Card className="mt-3 mb-3">
      <Card.Body>
        <Card.Title>{props.item.word}</Card.Title>
        <Form.Control
          as="textarea"
          rows="2"
          value={props.item.description}
          // @ts-ignore
          onChange={(e: Event) => {
            const description =
              e.target instanceof HTMLTextAreaElement
                ? e.target.value
                : props.item.description;
            props.onChange({ id: props.item.id, description });
          }}
        />
        <Button
          variant={props.item.isKnown ? "success" : "secondary"}
          onClick={() => {
            props.onChange({ id: props.item.id, isKnown: !props.item.isKnown });
          }}
          className="mt-3"
        >
          I know
        </Button>
        <Button
          variant="primary"
          onClick={() => {
            props.onNext({ id: props.item.id });
          }}
          className="mt-3 ml-3"
        >
          Next
        </Button>
      </Card.Body>
    </Card>
  );
}

function App() {
  const [state, dispatch] = useAppState();
  const {
    searchAction,
    addAction,
    selectAction,
    editAction,
    nextAction
  } = useAppActions(state, dispatch);

  return (
    <Container>
      <Row className="justify-content-md-center">
        <Col md="7">
          <React.Fragment>
            <Header
              word={state.search}
              onSearch={searchAction}
              onAdd={addAction}
            />
            {state.searchResult.length > 0 ? (
              <SearchResult
                items={state.searchResult}
                onSelect={selectAction}
              />
            ) : state.search.length > 0 ? (
              "not found"
            ) : (
              false
            )}
            {state.item ? (
              <ItemView
                item={state.item}
                onChange={editAction}
                onNext={nextAction}
              />
            ) : (
              false
            )}
          </React.Fragment>
          <span style={{ display: state.isLoading ? "block" : "none" }}>
            loading ...
          </span>
        </Col>
      </Row>
    </Container>
  );
}

export default App;

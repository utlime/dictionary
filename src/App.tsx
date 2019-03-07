import React, { useCallback, useRef } from "react";
import {
  Col,
  Container,
  Form,
  InputGroup,
  Row,
  Button,
  Card,
  DropdownButton,
  ButtonGroup,
  Dropdown
} from "react-bootstrap";
import { useAppActions } from "./AppActions";
import { useAppState, Item } from "./AppState";

function Header(props: {
  word: string;
  onAdd: (word: {
    word: string;
    description?: string;
    isKnown?: boolean;
  }) => void;
  onLoad: (
    words: {
      word: string;
      description?: string;
      isKnown?: boolean;
    }[]
  ) => void;
  onSearch: (word: { word: string }) => void;
  onDownload: () => void;
}) {
  const fileInput = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(() => {
    if (fileInput.current == null) {
      return;
    }

    const files = fileInput.current.files;
    if (files == null) {
      return;
    }

    const file = files.item(0);
    if (file == null) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        props.onLoad(JSON.parse(reader.result));
      }
    };

    reader.readAsText(file);
  }, [fileInput]);

  const handleLoad = () => {
    if (fileInput.current != null) {
      fileInput.current.click();
    }
  };

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        if (props.word.length > 0) {
          props.onAdd({ word: props.word });
        }
      }}
    >
      <input
        ref={fileInput}
        type="file"
        accept="application/json"
        className="d-none"
        onChange={handleFiles}
      />
      <InputGroup className="mt-3 mb-3">
        <Form.Control
          value={props.word}
          size="lg"
          placeholder="Search or add new word"
          // @ts-ignore
          onChange={(e: Event) => {
            if (e.target instanceof HTMLInputElement) {
              props.onSearch({ word: e.target.value });
            }
          }}
        />
        <InputGroup.Append>
          <Button size="lg" type="submit" variant="outline-secondary">
            add
          </Button>
        </InputGroup.Append>
        <DropdownButton
          as={InputGroup.Append}
          variant="outline-secondary"
          alignRight
          title=""
          size="lg"
          id="app-header-options"
        >
          <Dropdown.Item href="#" onClick={handleLoad}>
            Upload words
          </Dropdown.Item>
          <Dropdown.Item href="#" onClick={props.onDownload}>
            Download words
          </Dropdown.Item>
        </DropdownButton>
      </InputGroup>
    </form>
  );
}

function SearchResult(props: {
  search: string;
  searchResult: Item[];
  onSelect: (item: { id: string }) => void;
}) {
  return (
    <React.Fragment>
      {props.searchResult.map(item => (
        <Card
          key={item.id}
          className={`mt-3 mb-3 ${item.isKnown ? "border-success" : ""}`}
        >
          <Card.Header>Card #{item.id}</Card.Header>
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
      {props.searchResult.length === 0 && props.search.length > 0
        ? "No results"
        : false}
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
  onDelete: (item: { id: string }) => void;
}) {
  return (
    <Card className="mt-3 mb-3">
      <Card.Header>Card #{props.item.id}</Card.Header>
      <Card.Body>
        <Card.Title>{props.item.word}</Card.Title>
        <Form.Control
          as="textarea"
          rows="2"
          size="lg"
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
      </Card.Body>
      <Card.Footer>
        <ButtonGroup className="w-100">
          <Button
            variant={props.item.isKnown ? "success" : "primary"}
            size="lg"
            onClick={() => {
              props.onChange({
                id: props.item.id,
                isKnown: !props.item.isKnown
              });
            }}
          >
            I know
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => {
              props.onNext({ id: props.item.id });
            }}
          >
            Next
          </Button>
          <DropdownButton
            alignRight
            as={ButtonGroup}
            title=""
            size="lg"
            variant="secondary"
            id="card-options"
          >
            <Dropdown.Item
              eventKey="1"
              onClick={() => {
                props.onDelete({ id: props.item.id });
              }}
            >
              delete
            </Dropdown.Item>
          </DropdownButton>
        </ButtonGroup>
      </Card.Footer>
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
    nextAction,
    deleteAction,
    loadAction,
    downloadAction
  } = useAppActions(state, dispatch);

  return (
    <Container>
      <Row className="justify-content-md-center">
        <Col md="7">
          <Header
            word={state.search}
            onSearch={searchAction}
            onAdd={addAction}
            onLoad={loadAction}
            onDownload={downloadAction}
          />
          <SearchResult
            searchResult={state.searchResult}
            search={state.search}
            onSelect={selectAction}
          />
          {state.item ? (
            <ItemView
              item={state.item}
              onChange={editAction}
              onNext={nextAction}
              onDelete={deleteAction}
            />
          ) : (
            false
          )}
          <span style={{ display: state.isLoading ? "block" : "none" }}>
            loading ...
          </span>
        </Col>
      </Row>
    </Container>
  );
}

export default App;

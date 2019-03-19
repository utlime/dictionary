import React, { useCallback, useRef } from "react";
import {
  Container,
  Form,
  InputGroup,
  Button,
  Card,
  DropdownButton,
  ButtonGroup,
  Dropdown,
} from "react-bootstrap";
import {
  AddAction,
  DeleteAction,
  DownloadAction,
  EditAction,
  UploadAction,
  NextAction,
  SearchAction,
  SelectAction,
  useAppActions,
} from "./AppActions";
import { useAppState, AppState, AppStatistic } from "./AppState";

function Header(
  props: Pick<AppState, "search"> & {
    onAdd: AddAction;
    onLoad: UploadAction;
    onSearch: SearchAction;
    onDownload: DownloadAction;
  }
) {
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
        if (props.search.length > 0) {
          props.onAdd({ word: props.search });
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
          value={props.search}
          size="lg"
          placeholder="Search or add new word"
          // @ts-ignore
          onChange={(e: Event) => {
            if (e.target instanceof HTMLInputElement) {
              const search = e.target.value;

              props.onSearch({ search });
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

function SearchResult(
  props: Pick<AppState, "search" | "searchResult"> & {
    onSelect: SelectAction;
  }
) {
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

function ItemView(
  props: Pick<AppState, "item"> & {
    onChange: EditAction;
    onNext: NextAction;
    onDelete: DeleteAction;
  }
) {
  const item = props.item;

  if (item == null) {
    return null;
  }

  return (
    <Card className="mt-3 mb-3">
      <Card.Header>Card #{item.id}</Card.Header>
      <Card.Body>
        <Card.Title>{item.word}</Card.Title>
        <Form.Control
          as="textarea"
          rows="2"
          size="lg"
          value={item.description}
          // @ts-ignore
          onChange={(e: Event) => {
            const description =
              e.target instanceof HTMLTextAreaElement
                ? e.target.value
                : item.description;
            props.onChange({ id: item.id, description });
          }}
        />
      </Card.Body>
      <Card.Footer>
        <ButtonGroup className="w-100">
          <Button
            variant={item.isKnown ? "success" : "primary"}
            size="lg"
            onClick={() => {
              props.onChange({
                id: item.id,
                isKnown: !item.isKnown,
              });
            }}
          >
            I know
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => {
              props.onNext({ id: item.id });
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
                props.onDelete({ id: item.id });
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

function Statistic(props: { statistic: AppStatistic }) {
  return (
    <ul>
      <li>Total: {props.statistic.total}</li>
    </ul>
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
    uploadAction,
    downloadAction,
  } = useAppActions(state, dispatch);

  return (
    <Container>
      <Header
        search={state.search}
        onSearch={searchAction}
        onAdd={addAction}
        onLoad={uploadAction}
        onDownload={downloadAction}
      />
      <SearchResult
        searchResult={state.searchResult}
        search={state.search}
        onSelect={selectAction}
      />
      <ItemView
        item={state.item}
        onChange={editAction}
        onNext={nextAction}
        onDelete={deleteAction}
      />
      <Statistic statistic={state.statistic} />
      <span style={{ display: state.isLoading ? "block" : "none" }}>
        loading ...
      </span>
    </Container>
  );
}

export default App;

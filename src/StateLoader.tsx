import React, { useRef } from "react";
import { Button, Col, Row } from "react-bootstrap";
import { saveAs } from "file-saver";
import {
  DictionaryAction,
  DictionaryActionType,
  DictionaryState
} from "./DictionaryState";

export function StateLoader(props: {
  state: DictionaryState;
  dispatch: (action: DictionaryAction) => void;
}) {
  const fileInput = useRef<HTMLInputElement>(null);

  const handleFiles = () => {
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
        const newState = JSON.parse(reader.result);

        props.dispatch({ type: DictionaryActionType.STATE, payload: newState });
        props.dispatch({ type: DictionaryActionType.INIT });
      }
    };

    reader.readAsText(file);
  };

  const handleLoad = () => {
    if (fileInput.current != null) {
      fileInput.current.click();
    }
  };

  const handleSave = () => {
    saveAs(
      new File([JSON.stringify(props.state)], "dictionary.json", {
        type: "application/octet-stream"
      })
    );

    props.dispatch({ type: DictionaryActionType.SAVED });
  };

  return (
    <Row className="mx-2">
      <Col>
        <input
          ref={fileInput}
          type="file"
          accept="application/json"
          className="d-none"
          onChange={handleFiles}
        />
        <Button
          block
          onClick={handleLoad}
          variant={props.state.items.length === 0 ? "primary" : "light"}
        >
          Load
        </Button>
      </Col>
      <Col>
        <Button
          block
          onClick={handleSave}
          variant={props.state.changed ? "primary" : "light"}
        >
          Save
        </Button>
      </Col>
    </Row>
  );
}

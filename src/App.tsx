import React from "react";
import { Col, Container, Row } from "react-bootstrap";
import { DictionaryActionType, useDictionaryState } from "./DictionaryState";
import { DictionaryItemCard } from "./DictionaryItemCard";
import { StateLoader } from "./StateLoader";

function App() {
  const [state, dispatch] = useDictionaryState();

  return (
    <Container>
      <Row className="justify-content-md-center">
        <Col md="6" className="mt-5 mb-5">
          {state.current != null ? (
            <DictionaryItemCard
              {...state.current}
              onChange={data => {
                dispatch({
                  type: DictionaryActionType.UPDATE_CURRENT,
                  payload: data
                });
                dispatch({
                  type: DictionaryActionType.NEXT
                });
              }}
            />
          ) : (
            "Dictionary is empty"
          )}
        </Col>
      </Row>
      <Row className="justify-content-md-center">
        <Col md="6" className="mb-5">
          <StateLoader dispatch={dispatch} state={state} />
        </Col>
      </Row>
    </Container>
  );
}

export default App;

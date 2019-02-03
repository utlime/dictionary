import React from "react";
import { Col, Container, Row } from "react-bootstrap";
import { DictionaryActionType, useDictionaryState } from "./DictionaryState";
import { DictionaryItemCard } from "./DictionaryItemCard";

const initialState = {
  items: [
    { id: "0", word: "qwe 0", isKnown: false },
    { id: "1", word: "qwe 1", isKnown: false },
    { id: "2", word: "qwe 2", isKnown: false }
  ]
};

function App() {
  const [state, dispatch] = useDictionaryState(initialState);

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
    </Container>
  );
}

export default App;

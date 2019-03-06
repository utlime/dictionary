import { useReducer } from "react";

export interface Item {
  id: string;
  word: string;
  description: string;
  isKnown: boolean;
}

export interface AppState {
  isLoading: boolean;
  search: string;
  searchResult: Item[];
  item?: Item;
}

export enum ActionType {
  INIT,
  SEARCH,
  SEARCH_RESULT,
  ITEM,
  LOADING
}

export type Action =
  | { type: ActionType.SEARCH; payload: { search: string } }
  | { type: ActionType.SEARCH_RESULT; payload: { searchResult: Item[] } }
  | { type: ActionType.ITEM; payload: { item?: Item } }
  | { type: ActionType.LOADING; payload: { isLoading: boolean } }
  | { type: ActionType.INIT; payload: { state: AppState } };

function reducer(state: AppState, action: Action) {
  switch (action.type) {
    case ActionType.INIT: {
      return action.payload.state;
    }
    case ActionType.SEARCH: {
      return { ...state, search: action.payload.search };
    }
    case ActionType.SEARCH_RESULT: {
      return { ...state, searchResult: action.payload.searchResult };
    }
    case ActionType.ITEM: {
      return { ...state, item: action.payload.item };
    }
    case ActionType.LOADING: {
      return { ...state, isLoading: action.payload.isLoading };
    }
  }

  return state;
}

const initialState: AppState = {
  isLoading: false,
  search: "",
  searchResult: []
};

export function useAppState(): [AppState, (action: Action) => void] {
  const [state, dispatch] = useReducer(reducer, initialState);

  return [state, dispatch];
}

import { useReducer } from "react";

export interface Item {
  id: number;
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

type Action =
  | { type: ActionType.SEARCH; payload: Pick<AppState, "search"> }
  | { type: ActionType.SEARCH_RESULT; payload: Pick<AppState, "searchResult"> }
  | { type: ActionType.ITEM; payload: Pick<AppState, "item"> }
  | { type: ActionType.LOADING; payload: Pick<AppState, "isLoading"> }
  | { type: ActionType.INIT; payload: { state: AppState } };

function reducer(state: AppState, action: Action) {
  switch (action.type) {
    case ActionType.INIT: {
      return action.payload.state;
    }
    case ActionType.SEARCH:
    case ActionType.SEARCH_RESULT:
    case ActionType.ITEM:
    case ActionType.LOADING: {
      return { ...state, ...action.payload };
    }
  }

  return state;
}

const initialState: AppState = {
  isLoading: false,
  search: "",
  searchResult: []
};

export type AppAction = (action: Action) => void;

export function useAppState(): [AppState, AppAction] {
  const [state, dispatch] = useReducer(reducer, initialState);

  return [state, dispatch];
}

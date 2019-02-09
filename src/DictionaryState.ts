import { useReducer } from "react";

export interface DictionaryItem {
  id: string;
  word: string;
  description?: string;
  isKnown: boolean;
}

export interface DictionaryState {
  current?: Readonly<DictionaryItem>;
  items: ReadonlyArray<Readonly<DictionaryItem>>;
  changed: Boolean;
}

export enum DictionaryActionType {
  UPDATE_CURRENT,
  NEXT,
  INIT,
  SAVED,
  STATE
}

interface DictionaryActionUpdateCurrent {
  type: DictionaryActionType.UPDATE_CURRENT;
  payload: Partial<DictionaryItem>;
}

interface DictionaryActionState {
  type: DictionaryActionType.STATE;
  payload: DictionaryState;
}

interface DictionaryActionDefault {
  type:
    | DictionaryActionType.NEXT
    | DictionaryActionType.INIT
    | DictionaryActionType.SAVED;
}

export type DictionaryAction =
  | DictionaryActionUpdateCurrent
  | DictionaryActionDefault
  | DictionaryActionState;

function CardStateReducer(state: DictionaryState, action: DictionaryAction) {
  let { current, items, changed } = state;

  switch (action.type) {
    case DictionaryActionType.UPDATE_CURRENT: {
      if (current) {
        current = { ...current, ...action.payload } as DictionaryItem;
        items = items.map(item =>
          current != null && item.id === current.id ? current : item
        );
        changed = true;
      }

      break;
    }
    case DictionaryActionType.INIT: {
      if (current == null && items.length > 0) {
        current = items[0];
      }

      break;
    }
    case DictionaryActionType.SAVED: {
      changed = false;

      break;
    }
    case DictionaryActionType.STATE: {
      ({ current, items } = action.payload);
      changed = false;

      break;
    }
    case DictionaryActionType.NEXT: {
      if (items.length > 1) {
        current = items.reduce((acc, cur, i) =>
          current && items[i - 1].id === current.id ? cur : acc
        );

        changed = true;
      }

      break;
    }
  }

  return { current, items, changed } as DictionaryState;
}

const initialState: DictionaryState = {
  items: [],
  changed: false
};

export function useDictionaryState(): [
  DictionaryState,
  (action: DictionaryAction) => void
] {
  // @ts-ignore
  const [state, dispatch] = useReducer(CardStateReducer, initialState, {
    type: DictionaryActionType.INIT
  });

  return [state, dispatch];
}

import { useReducer } from "react";

export interface DictionaryItem {
  id: string;
  word: string;
  description?: string;
  isKnown: boolean;
}

interface DictionaryState {
  current?: Readonly<DictionaryItem>;
  items: ReadonlyArray<DictionaryItem>;
}

export enum DictionaryActionType {
  UPDATE_CURRENT,
  NEXT,
  INIT
}

interface DictionaryActionUpdateCurrent {
  type: DictionaryActionType.UPDATE_CURRENT;
  payload: Partial<DictionaryItem>;
}

interface DictionaryActionDefault {
  type: DictionaryActionType.NEXT | DictionaryActionType.INIT;
}

type DictionaryAction = DictionaryActionUpdateCurrent | DictionaryActionDefault;

function CardStateReducer(state: DictionaryState, action: DictionaryAction) {
  let { current, items } = state;

  switch (action.type) {
    case DictionaryActionType.UPDATE_CURRENT: {
      if (current) {
        current = { ...current, ...action.payload } as DictionaryItem;
        items = items.map(item =>
          current != null && item.id === current.id ? current : item
        );
      }

      break;
    }
    case DictionaryActionType.INIT: {
      if (current == null && items.length > 0) {
        current = items[0];
      }

      break;
    }
    case DictionaryActionType.NEXT: {
      if (items.length > 1) {
        current = items.reduce((acc, cur, i) =>
          current && items[i - 1].id === current.id ? cur : acc
        );
      }

      break;
    }
  }

  return { current, items } as DictionaryState;
}

export function useDictionaryState(
  initialState: DictionaryState
): [DictionaryState, (action: DictionaryAction) => void] {
  // @ts-ignore
  const [state, dispatch] = useReducer(CardStateReducer, initialState, {
    type: DictionaryActionType.INIT
  });

  return [state, dispatch];
}

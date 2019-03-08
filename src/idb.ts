import { DB, openDb } from "idb";
import { Item } from "./AppState";

export function getDB(): Promise<DB> {
  return openDb("app", 2, upgradeDB => {
    switch (upgradeDB.oldVersion) {
      case 0:
        upgradeDB.createObjectStore("dictionary", {
          keyPath: "id",
          autoIncrement: true
        });
      case 1:
        const store = upgradeDB.transaction.objectStore("dictionary");
        store.createIndex("word", "word");
    }
  });
}

export async function addItem(
  dbPromise: Promise<DB>,
  item: Pick<Item, "word" | "description" | "isKnown">
): Promise<Item> {
  const db = await dbPromise;
  const transaction = db.transaction("dictionary", "readwrite");
  const store = transaction.objectStore("dictionary");

  const id = (await store.add(item)) as number;

  await transaction.complete;

  return { ...item, id };
}

export async function addItems(
  dbPromise: Promise<DB>,
  items: (Pick<Item, "word" | "description" | "isKnown"> &
    Partial<Pick<Item, "id">>)[]
): Promise<string[]> {
  const db = await dbPromise;
  const transaction = db.transaction("dictionary", "readwrite");
  const store = transaction.objectStore("dictionary");

  const ids = (await Promise.all(
    items.map(item => {
      if (item.id != null) {
        return store.put(item);
      } else {
        return store.add(item);
      }
    })
  )) as string[];

  await transaction.complete;

  return ids;
}

export async function updateItem(
  dbPromise: Promise<DB>,
  {
    isKnown,
    description,
    word,
    id
  }: Partial<Pick<Item, "word" | "description" | "isKnown">> & Pick<Item, "id">
): Promise<Item> {
  const db = await dbPromise;
  let transaction = db.transaction("dictionary", "readonly");
  let store = transaction.objectStore("dictionary");
  const item: Item = await store.get(id);
  await transaction.complete;

  if (typeof isKnown === "boolean") {
    item.isKnown = isKnown;
  }

  if (typeof description === "string") {
    item.description = description;
  }

  if (typeof word === "string") {
    item.word = word;
  }

  transaction = db.transaction("dictionary", "readwrite");
  store = transaction.objectStore("dictionary");
  await store.put(item);
  await transaction.complete;

  return item;
}

export async function getItem(
  dbPromise: Promise<DB>,
  { id }: Pick<Item, "id">
): Promise<Item | null> {
  const db = await dbPromise;
  let transaction = db.transaction("dictionary", "readonly");
  let store = transaction.objectStore("dictionary");
  const item: Item = await store.get(id);
  await transaction.complete;

  return item;
}

export async function getAllItems(dbPromise: Promise<DB>): Promise<Item[]> {
  const db = await dbPromise;
  let transaction = db.transaction("dictionary", "readonly");
  let store = transaction.objectStore("dictionary");
  const items: Item[] = await store.getAll();
  await transaction.complete;

  return items;
}

export async function getNextItem(
  dbPromise: Promise<DB>,
  { id }: Pick<Item, "id">
): Promise<Item | null> {
  const db = await dbPromise;
  const transaction = db.transaction("dictionary", "readonly");
  const store = transaction.objectStore("dictionary");
  let cursor = await store.openCursor(IDBKeyRange.lowerBound(id, true));
  if (!cursor) {
    cursor = await store.openCursor(IDBKeyRange.upperBound(id));
  }

  if (!cursor) {
    return null;
  }

  const item: Item = cursor.value;

  await transaction.complete;

  return item;
}

export async function getItems(
  dbPromise: Promise<DB>,
  { word, id }: Partial<Pick<Item, "id" | "word">>
): Promise<Item[]> {
  const db = await dbPromise;

  const searchResult: Item[] = [];

  if (id != null) {
    const searchByKey = await db
      .transaction("dictionary", "readonly")
      .objectStore("dictionary")
      .get(id);

    if (searchByKey) {
      searchResult.push(searchByKey);
    }
  }

  if (word != null) {
    searchResult.push(
      ...(await db
        .transaction("dictionary", "readonly")
        .objectStore("dictionary")
        .index("word")
        .getAll(IDBKeyRange.bound(word, `${word}zzz`), 25))
    );
  }

  return searchResult;
}

export async function deleteItem(
  dbPromise: Promise<DB>,
  { id }: Pick<Item, "id">
): Promise<void> {
  const db = await dbPromise;
  const transaction = db.transaction("dictionary", "readwrite");
  const store = transaction.objectStore("dictionary");

  await store.delete(id);
  await transaction.complete;
}

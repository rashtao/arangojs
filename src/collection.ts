import { Connection } from "./connection";
import { ArrayCursor } from "./cursor";
import { isArangoError } from "./error";
import {
  ArangoResponseMetadata,
  CollectionChecksumOptions,
  CollectionFigures,
  CollectionMetadata,
  CollectionProperties,
  CollectionPropertiesOptions,
  CollectionType,
  CreateCollectionOptions,
  CreateFulltextIndexOptions,
  CreateGeoIndexOptions,
  CreateHashIndexOptions,
  CreateIndexOptions,
  CreatePersistentIndexOptions,
  CreateSkiplistIndexOptions,
  Document,
  DocumentData,
  DocumentLike,
  DocumentMetadata,
  Edge,
  EdgeData,
  EdgesResult,
  ImportOptions,
  ImportResult,
  Index,
  IndexHandle,
  InsertDocumentOptions,
  Patch,
  ReadDocumentOptions,
  RemoveDocumentOptions,
  ReplaceDocumentOptions,
  Selector,
  SimpleQueryAllKeysType,
  SimpleQueryAllOptions,
  SimpleQueryFulltextOptions,
  SimpleQueryOptions,
  SimpleQueryRemoveByKeysOptions,
  SimpleQueryRemoveByKeysResult,
  SimpleQueryRemoveOrReplaceByExampleOptions,
  SimpleQueryUpdateByExampleOptions,
  TraversalOptions,
  UpdateDocumentOptions
} from "./util/types";

export function documentHandle(
  selector: Selector,
  collectionName: string
): string {
  if (typeof selector !== "string") {
    if (selector._id) {
      return selector._id;
    }
    if (selector._key) {
      return `${collectionName}/${selector._key}`;
    }
    throw new Error(
      "Document handle must be a string or an object with a _key or _id"
    );
  }
  if (selector.indexOf("/") === -1) {
    return `${collectionName}/${selector}`;
  }
  return selector;
}

export function isArangoCollection(
  collection: any
): collection is ArangoCollection {
  return Boolean(collection && collection.isArangoCollection);
}

export interface ArangoCollection {
  isArangoCollection: true;
  name: string;
}

export const DOCUMENT_NOT_FOUND = 1202;
export const COLLECTION_NOT_FOUND = 1203;

export interface DocumentCollection<T extends object = any>
  extends ArangoCollection {
  get(): Promise<ArangoResponseMetadata & CollectionMetadata>;
  exists(): Promise<boolean>;
  create(
    properties?: CreateCollectionOptions
  ): Promise<ArangoResponseMetadata & CollectionProperties>;
  properties(): Promise<ArangoResponseMetadata & CollectionProperties>;
  properties(
    properties: CollectionPropertiesOptions
  ): Promise<ArangoResponseMetadata & CollectionProperties>;
  count(): Promise<
    ArangoResponseMetadata & CollectionProperties & { count: number }
  >;
  figures(): Promise<
    ArangoResponseMetadata &
      CollectionProperties & { count: number; figures: CollectionFigures }
  >;
  revision(): Promise<
    ArangoResponseMetadata & CollectionProperties & { revision: string }
  >;
  checksum(
    opts?: CollectionChecksumOptions
  ): Promise<ArangoResponseMetadata & { revision: string; checksum: string }>;
  load(
    count?: boolean
  ): Promise<ArangoResponseMetadata & CollectionMetadata & { count?: number }>;
  unload(): Promise<ArangoResponseMetadata & CollectionMetadata>;
  rename(
    name: string
  ): Promise<ArangoResponseMetadata & CollectionMetadata & { name: string }>;
  rotate(): Promise<ArangoResponseMetadata & { result: boolean }>;
  truncate(): Promise<ArangoResponseMetadata & CollectionMetadata>;
  drop(opts?: { isSystem?: boolean }): Promise<ArangoResponseMetadata>;

  //#region crud
  documentExists(selector: Selector): Promise<boolean>;
  document(
    selector: Selector,
    opts?: ReadDocumentOptions
  ): Promise<Document<T>>;
  document(selector: Selector, graceful?: boolean): Promise<Document<T>>;
  save(
    data: DocumentData<T>,
    opts?: InsertDocumentOptions
  ): Promise<DocumentMetadata & { new?: Document<T> }>;
  save(
    data: Array<DocumentData<T>>,
    opts?: InsertDocumentOptions
  ): Promise<(DocumentMetadata & { new?: Document<T> })[]>;
  replace(
    selector: Selector,
    newValue: DocumentData<T>,
    opts?: ReplaceDocumentOptions
  ): Promise<DocumentMetadata & { old?: Document<T>; new?: Document<T> }>;
  replace(
    newValues: Array<DocumentData<T> & DocumentLike>,
    opts?: ReplaceDocumentOptions
  ): Promise<(DocumentMetadata & { old?: Document<T>; new?: Document<T> })[]>;
  update(
    selector: Selector,
    newValue: Patch<DocumentData<T>>,
    opts?: UpdateDocumentOptions
  ): Promise<DocumentMetadata & { old?: Document<T>; new?: Document<T> }>;
  update(
    newValues: Array<Patch<DocumentData<T>> & DocumentLike>,
    opts?: UpdateDocumentOptions
  ): Promise<(DocumentMetadata & { old?: Document<T>; new?: Document<T> })[]>;
  remove(
    selector: Selector | Array<Selector>,
    opts?: RemoveDocumentOptions
  ): Promise<DocumentMetadata>;
  import(
    data: Buffer | Blob | string,
    opts?: ImportOptions
  ): Promise<ImportResult>;
  import(data: string[][], opts?: ImportOptions): Promise<ImportResult>;
  import(
    data: Array<DocumentData<T>>,
    opts?: ImportOptions
  ): Promise<ImportResult>;
  //#endregion

  //#region simple queries
  /** @deprecated ArangoDB 3.4 */
  list(type?: SimpleQueryAllKeysType): Promise<ArrayCursor<string>>;
  /** @deprecated ArangoDB 3.4 */
  all(opts?: SimpleQueryAllOptions): Promise<ArrayCursor<Document<T>>>;
  /** @deprecated ArangoDB 3.4 */
  any(): Promise<Document<T>>;
  /** @deprecated ArangoDB 3.4 */
  byExample(
    example: Partial<DocumentData<T>>,
    opts?: SimpleQueryOptions
  ): Promise<ArrayCursor<Document<T>>>;
  /** @deprecated ArangoDB 3.4 */
  firstExample(example: Partial<DocumentData<T>>): Promise<Document<T>>;
  /** @deprecated ArangoDB 3.4 */
  removeByExample(
    example: Partial<DocumentData<T>>,
    opts?: SimpleQueryRemoveOrReplaceByExampleOptions
  ): Promise<ArangoResponseMetadata & { deleted: number }>;
  /** @deprecated ArangoDB 3.4 */
  replaceByExample(
    example: Partial<DocumentData<T>>,
    newValue: DocumentData<T>,
    opts?: SimpleQueryRemoveOrReplaceByExampleOptions
  ): Promise<ArangoResponseMetadata & { replaced: number }>;
  /** @deprecated ArangoDB 3.4 */
  updateByExample(
    example: Partial<DocumentData<T>>,
    newValue: Patch<DocumentData<T>>,
    opts?: SimpleQueryUpdateByExampleOptions
  ): Promise<ArangoResponseMetadata & { updated: number }>;
  /** @deprecated ArangoDB 3.4 */
  lookupByKeys(keys: string[]): Promise<Document<T>>;
  /** @deprecated ArangoDB 3.4 */
  removeByKeys(
    keys: string[],
    opts?: SimpleQueryRemoveByKeysOptions
  ): Promise<ArangoResponseMetadata & SimpleQueryRemoveByKeysResult<T>>;
  /** @deprecated ArangoDB 3.4 */
  fulltext(
    attribute: string,
    query: string,
    opts?: SimpleQueryFulltextOptions
  ): Promise<ArrayCursor<Document<T>>>;
  //#endregion

  //#region indexes
  indexes(): Promise<Index[]>;
  index(indexHandle: IndexHandle): Promise<Index[]>;
  createIndex(
    details: CreateIndexOptions
  ): Promise<ArangoResponseMetadata & { id: string }>;
  dropIndex(
    indexHandle: IndexHandle
  ): Promise<ArangoResponseMetadata & { id: string }>;
  createHashIndex(
    fields: string | string[],
    opts?: CreateHashIndexOptions
  ): Promise<ArangoResponseMetadata & { id: string }>;
  createSkiplist(
    fields: string | string[],
    opts?: CreateSkiplistIndexOptions
  ): Promise<ArangoResponseMetadata & { id: string }>;
  createPersistentIndex(
    fields: string | string[],
    opts?: CreatePersistentIndexOptions
  ): Promise<ArangoResponseMetadata & { id: string }>;
  createGeoIndex(
    fields: string | [string] | [string, string],
    opts?: CreateGeoIndexOptions
  ): Promise<ArangoResponseMetadata & { id: string }>;
  createFulltextIndex(
    fields: string | string[],
    opts?: CreateFulltextIndexOptions
  ): Promise<ArangoResponseMetadata & { id: string }>;
  //#endregion
}

export interface EdgeCollection<T extends object = any>
  extends DocumentCollection<T> {
  //#region crud
  edge(selector: Selector, opts?: ReadDocumentOptions): Promise<Edge<T>>;
  edge(selector: Selector, graceful?: boolean): Promise<Edge<T>>;
  document(selector: Selector, opts?: ReadDocumentOptions): Promise<Edge<T>>;
  document(selector: Selector, graceful?: boolean): Promise<Edge<T>>;
  save(
    data: EdgeData<T>,
    opts?: InsertDocumentOptions
  ): Promise<DocumentMetadata & { new?: Edge<T> }>;
  save(
    data: Array<EdgeData<T>>,
    opts?: InsertDocumentOptions
  ): Promise<(DocumentMetadata & { new?: Edge<T> })[]>;
  replace(
    selector: Selector,
    newValue: DocumentData<T>,
    opts?: ReplaceDocumentOptions
  ): Promise<DocumentMetadata & { old?: Edge<T>; new?: Edge<T> }>;
  replace(
    newValues: Array<DocumentData<T> & DocumentLike>,
    opts?: ReplaceDocumentOptions
  ): Promise<(DocumentMetadata & { old?: Edge<T>; new?: Edge<T> })[]>;
  update(
    selector: Selector,
    newValue: Patch<DocumentData<T>>,
    opts?: UpdateDocumentOptions
  ): Promise<DocumentMetadata & { old?: Edge<T>; new?: Edge<T> }>;
  update(
    newValues: Array<Patch<DocumentData<T>> & DocumentLike>,
    opts?: UpdateDocumentOptions
  ): Promise<(DocumentMetadata & { old?: Edge<T>; new?: Edge<T> })[]>;
  import(
    data: Buffer | Blob | string,
    opts?: ImportOptions
  ): Promise<ImportResult>;
  import(data: string[][], opts?: ImportOptions): Promise<ImportResult>;
  import(data: Array<EdgeData<T>>, opts?: ImportOptions): Promise<ImportResult>;
  //#endregion

  //#region simple queries
  /** @deprecated ArangoDB 3.4 */
  all(opts?: SimpleQueryAllOptions): Promise<ArrayCursor<Edge<T>>>;
  /** @deprecated ArangoDB 3.4 */
  any(): Promise<Edge<T>>;
  /** @deprecated ArangoDB 3.4 */
  byExample(
    example: Partial<DocumentData<T>>,
    opts?: SimpleQueryOptions
  ): Promise<ArrayCursor<Edge<T>>>;
  /** @deprecated ArangoDB 3.4 */
  firstExample(example: Partial<DocumentData<T>>): Promise<Edge<T>>;
  /** @deprecated ArangoDB 3.4 */
  lookupByKeys(keys: string[]): Promise<Edge<T>>;
  /** @deprecated ArangoDB 3.4 */
  fulltext(
    attribute: string,
    query: string,
    opts?: SimpleQueryFulltextOptions
  ): Promise<ArrayCursor<Edge<T>>>;
  //#endregion

  //#region edges
  edges(selector: Selector): Promise<ArangoResponseMetadata & EdgesResult>;
  inEdges(selector: Selector): Promise<ArangoResponseMetadata & EdgesResult>;
  outEdges(selector: Selector): Promise<ArangoResponseMetadata & EdgesResult>;
  /** @deprecated ArangoDB 3.4 */
  traversal(startVertex: Selector, opts?: TraversalOptions): Promise<any>;
  //#endregion
}

export class Collection<T extends object = any>
  implements EdgeCollection<T>, DocumentCollection<T> {
  //#region attributes
  isArangoCollection: true = true;
  protected _name: string;
  protected _idPrefix: string;
  protected _connection: Connection;
  //#endregion

  constructor(connection: Connection, name: string) {
    this._name = name;
    this._idPrefix = `${this._name}/`;
    this._connection = connection;
  }

  //#region internals
  protected _documentHandle(documentHandle: Selector) {
    if (typeof documentHandle !== "string") {
      if (documentHandle._id) {
        return documentHandle._id;
      }
      if (documentHandle._key) {
        return this._idPrefix + documentHandle._key;
      }
      throw new Error(
        "Document handle must be a string or an object with a _key or _id"
      );
    }
    if (documentHandle.indexOf("/") === -1) {
      return this._idPrefix + documentHandle;
    }
    return documentHandle;
  }

  protected _indexHandle(indexHandle: IndexHandle) {
    if (typeof indexHandle !== "string") {
      if (indexHandle.id) {
        return indexHandle.id;
      }
      throw new Error("Index handle must be a index or string");
    }
    if (indexHandle.indexOf("/") === -1) {
      return this._idPrefix + indexHandle;
    }
    return indexHandle;
  }

  protected _get(path: string, qs?: any) {
    return this._connection.request(
      { path: `/_api/collection/${this._name}/${path}`, qs },
      res => res.body
    );
  }

  protected _put(path: string, body?: any) {
    return this._connection.request(
      {
        method: "PUT",
        path: `/_api/collection/${this._name}/${path}`,
        body
      },
      res => res.body
    );
  }
  //#endregion

  //#region metadata
  get name() {
    return this._name;
  }

  get() {
    return this._connection.request(
      { path: `/_api/collection/${this._name}` },
      res => res.body
    );
  }

  exists() {
    return this.get().then(
      () => true,
      err => {
        if (isArangoError(err) && err.errorNum === COLLECTION_NOT_FOUND) {
          return false;
        }
        throw err;
      }
    );
  }

  create(properties?: CreateCollectionOptions & { type?: CollectionType }) {
    return this._connection.request(
      {
        method: "POST",
        path: "/_api/collection",
        body: {
          ...properties,
          name: this._name
        }
      },
      res => res.body
    );
  }

  properties(properties?: CollectionPropertiesOptions) {
    if (!properties) return this._get("properties");
    return this._put("properties", properties);
  }

  count() {
    return this._get("count");
  }

  figures() {
    return this._get("figures");
  }

  revision() {
    return this._get("revision");
  }

  checksum(opts?: CollectionChecksumOptions) {
    return this._get("checksum", opts);
  }

  load(count?: boolean) {
    return this._put(
      "load",
      typeof count === "boolean" ? { count: count } : undefined
    );
  }

  unload() {
    return this._put("unload");
  }

  async rename(name: string) {
    const result = await this._connection.request(
      {
        method: "PUT",
        path: `/_api/collection/${this._name}/rename`,
        body: { name }
      },
      res => res.body
    );
    this._name = name;
    this._idPrefix = `${name}/`;
    return result;
  }

  rotate() {
    return this._put("rotate");
  }

  truncate() {
    return this._put("truncate");
  }

  drop(opts?: { isSystem?: boolean }) {
    return this._connection.request(
      {
        method: "DELETE",
        path: `/_api/collection/${this._name}`,
        qs: opts
      },
      res => res.body
    );
  }
  //#endregion

  //#region crud
  documentExists(selector: Selector): Promise<boolean> {
    return this._connection
      .request(
        {
          method: "HEAD",
          path: `/_api/document/${documentHandle(selector, this._name)}`
        },
        () => true
      )
      .catch(err => {
        if (err.statusCode === 404) {
          return false;
        }
        throw err;
      });
  }

  document(selector: Selector, opts: boolean | ReadDocumentOptions = {}) {
    if (typeof opts === "boolean") {
      opts = { graceful: opts };
    }
    const { allowDirtyRead = undefined, graceful = false } = opts;
    const result = this._connection.request(
      {
        path: `/_api/document/${documentHandle(selector, this._name)}`,
        allowDirtyRead
      },
      res => res.body
    );
    if (!graceful) return result;
    return result.catch(err => {
      if (isArangoError(err) && err.errorNum === DOCUMENT_NOT_FOUND) {
        return null;
      }
      throw err;
    });
  }

  edge(selector: Selector, opts: boolean | ReadDocumentOptions = {}) {
    return this.document(selector, opts) as Promise<Edge<T>>;
  }

  save(
    data: DocumentData<T> | Array<DocumentData<T>>,
    opts?: InsertDocumentOptions
  ) {
    return this._connection.request(
      {
        method: "POST",
        path: `/_api/document/${this._name}`,
        body: data,
        qs: opts
      },
      res => res.body
    );
  }

  replace(
    selectorOrNewValues: Selector | Array<DocumentData<T> & DocumentLike>,
    newValueOrOpts?: DocumentData<T> | ReplaceDocumentOptions,
    opts?: ReplaceDocumentOptions
  ) {
    let path;
    let body;
    if (Array.isArray(selectorOrNewValues)) {
      path = this._name;
      body = selectorOrNewValues;
      opts = newValueOrOpts as UpdateDocumentOptions | undefined;
    } else {
      path = documentHandle(selectorOrNewValues, this._name);
      body = newValueOrOpts as Patch<DocumentData<T>>;
    }
    return this._connection.request(
      {
        method: "PUT",
        path: `/_api/${path}`,
        body,
        qs: opts
      },
      res => res.body
    );
  }

  update(
    selectorOrNewValues:
      | Selector
      | Array<Patch<DocumentData<T>> & DocumentLike>,
    newValueOrOpts?: Patch<DocumentData<T>> | UpdateDocumentOptions,
    opts?: UpdateDocumentOptions
  ) {
    let path;
    let body;
    if (Array.isArray(selectorOrNewValues)) {
      path = this._name;
      body = selectorOrNewValues;
      opts = newValueOrOpts as UpdateDocumentOptions | undefined;
    } else {
      path = documentHandle(selectorOrNewValues, this._name);
      body = newValueOrOpts as Patch<DocumentData<T>>;
    }
    return this._connection.request(
      {
        method: "PATCH",
        path: `/_api/document/${path}`,
        body,
        qs: opts
      },
      res => res.body
    );
  }

  remove(selector: Selector | Array<Selector>, opts?: RemoveDocumentOptions) {
    let path;
    let body;
    if (Array.isArray(selector)) {
      path = this._name;
      body = selector;
    } else {
      path = documentHandle(selector, this._name);
    }
    return this._connection.request(
      {
        method: "DELETE",
        path: `/_api/${path}`,
        body,
        qs: opts
      },
      res => res.body
    );
  }

  import(
    data: Buffer | Blob | string | any[],
    { type = "auto", ...opts }: ImportOptions = {}
  ): Promise<ImportResult> {
    if (Array.isArray(data)) {
      data =
        (data as any[]).map((line: any) => JSON.stringify(line)).join("\r\n") +
        "\r\n";
    }
    return this._connection.request(
      {
        method: "POST",
        path: "/_api/import",
        body: data,
        isBinary: true,
        qs: {
          type: type === null ? undefined : type,
          ...opts,
          collection: this._name
        }
      },
      res => res.body
    );
  }
  //#endregion

  //#region edges
  protected _edges(selector: Selector, direction?: "in" | "out") {
    return this._connection.request(
      {
        path: `/_api/edges/${this._name}`,
        qs: {
          direction,
          vertex: documentHandle(selector, this._name)
        }
      },
      res => res.body
    );
  }

  edges(vertex: Selector) {
    return this._edges(vertex);
  }

  inEdges(vertex: Selector) {
    return this._edges(vertex, "in");
  }

  outEdges(vertex: Selector) {
    return this._edges(vertex, "out");
  }

  traversal(startVertex: Selector, opts?: TraversalOptions) {
    return this._connection.request(
      {
        method: "POST",
        path: "/_api/traversal",
        body: {
          ...opts,
          startVertex,
          edgeCollection: this._name
        }
      },
      res => res.body.result
    );
  }
  //#endregion

  //#region simple queries
  list(type: SimpleQueryAllKeysType = "id") {
    return this._connection.request(
      {
        method: "PUT",
        path: "/_api/simple/all-keys",
        body: { type, collection: this._name }
      },
      res => new ArrayCursor(this._connection, res.body, res.host)
    );
  }

  all(opts?: SimpleQueryAllOptions) {
    return this._connection.request(
      {
        method: "PUT",
        path: "/_api/simple/all",
        body: {
          ...opts,
          collection: this._name
        }
      },
      res => new ArrayCursor(this._connection, res.body, res.host)
    );
  }

  any() {
    return this._connection.request(
      {
        method: "PUT",
        path: "/_api/simple/any",
        body: { collection: this._name }
      },
      res => res.body.document
    );
  }

  byExample(example: Partial<DocumentData<T>>, opts?: SimpleQueryOptions) {
    return this._connection.request(
      {
        method: "PUT",
        path: "/_api/simple/by-example",
        body: {
          ...opts,
          example,
          collection: this._name
        }
      },
      res => new ArrayCursor(this._connection, res.body, res.host)
    );
  }

  firstExample(example: Partial<DocumentData<T>>) {
    return this._connection.request(
      {
        method: "PUT",
        path: "/_api/simple/first-example",
        body: {
          example,
          collection: this._name
        }
      },
      res => res.body.document
    );
  }

  removeByExample(
    example: Partial<DocumentData<T>>,
    opts?: SimpleQueryRemoveOrReplaceByExampleOptions
  ) {
    return this._connection.request(
      {
        method: "PUT",
        path: "/_api/simple/remove-by-example",
        body: {
          ...opts,
          example,
          collection: this._name
        }
      },
      res => res.body
    );
  }

  replaceByExample(
    example: Partial<DocumentData<T>>,
    newValue: DocumentData<T>,
    opts?: SimpleQueryRemoveOrReplaceByExampleOptions
  ) {
    return this._connection.request(
      {
        method: "PUT",
        path: "/_api/simple/replace-by-example",
        body: {
          ...opts,
          example,
          newValue,
          collection: this._name
        }
      },
      res => res.body
    );
  }

  updateByExample(
    example: Partial<DocumentData<T>>,
    newValue: Patch<DocumentData<T>>,
    opts?: SimpleQueryUpdateByExampleOptions
  ) {
    return this._connection.request(
      {
        method: "PUT",
        path: "/_api/simple/update-by-example",
        body: {
          ...opts,
          example,
          newValue,
          collection: this._name
        }
      },
      res => res.body
    );
  }

  lookupByKeys(keys: string[]) {
    return this._connection.request(
      {
        method: "PUT",
        path: "/_api/simple/lookup-by-keys",
        body: {
          keys,
          collection: this._name
        }
      },
      res => res.body.documents
    );
  }

  removeByKeys(keys: string[], opts?: SimpleQueryRemoveByKeysOptions) {
    return this._connection.request(
      {
        method: "PUT",
        path: "/_api/simple/remove-by-keys",
        body: {
          options: opts,
          keys,
          collection: this._name
        }
      },
      res => res.body
    );
  }

  fulltext(
    attribute: string,
    query: string,
    opts: SimpleQueryFulltextOptions = {}
  ) {
    if (opts.index) opts.index = this._indexHandle(opts.index);
    return this._connection.request(
      {
        method: "PUT",
        path: "/_api/simple/fulltext",
        body: {
          ...opts,
          attribute,
          query,
          collection: this._name
        }
      },
      res => new ArrayCursor(this._connection, res.body, res.host)
    );
  }
  //#endregion

  //#region indexes
  indexes() {
    return this._connection.request(
      {
        path: "/_api/index",
        qs: { collection: this._name }
      },
      res => res.body.indexes
    );
  }

  index(indexHandle: IndexHandle) {
    return this._connection.request(
      { path: `/_api/index/${this._indexHandle(indexHandle)}` },
      res => res.body
    );
  }

  createIndex(details: CreateIndexOptions) {
    return this._connection.request(
      {
        method: "POST",
        path: "/_api/index",
        body: details,
        qs: { collection: this._name }
      },
      res => res.body
    );
  }

  dropIndex(indexHandle: IndexHandle) {
    return this._connection.request(
      {
        method: "DELETE",
        path: `/_api/index/${this._indexHandle(indexHandle)}`
      },
      res => res.body
    );
  }

  createHashIndex(fields: string[] | string, opts?: CreateHashIndexOptions) {
    if (typeof fields === "string") {
      fields = [fields];
    }
    if (typeof opts === "boolean") {
      opts = { unique: opts };
    }
    return this._connection.request(
      {
        method: "POST",
        path: "/_api/index",
        body: { unique: false, ...opts, type: "hash", fields: fields },
        qs: { collection: this._name }
      },
      res => res.body
    );
  }

  createSkiplist(fields: string[] | string, opts?: CreateSkiplistIndexOptions) {
    if (typeof fields === "string") {
      fields = [fields];
    }
    if (typeof opts === "boolean") {
      opts = { unique: opts };
    }
    return this._connection.request(
      {
        method: "POST",
        path: "/_api/index",
        body: { unique: false, ...opts, type: "skiplist", fields: fields },
        qs: { collection: this._name }
      },
      res => res.body
    );
  }

  createPersistentIndex(
    fields: string[] | string,
    opts?: CreatePersistentIndexOptions
  ) {
    if (typeof fields === "string") {
      fields = [fields];
    }
    if (typeof opts === "boolean") {
      opts = { unique: opts };
    }
    return this._connection.request(
      {
        method: "POST",
        path: "/_api/index",
        body: { unique: false, ...opts, type: "persistent", fields: fields },
        qs: { collection: this._name }
      },
      res => res.body
    );
  }

  createGeoIndex(fields: string[] | string, opts?: CreateGeoIndexOptions) {
    if (typeof fields === "string") {
      fields = [fields];
    }
    return this._connection.request(
      {
        method: "POST",
        path: "/_api/index",
        body: { ...opts, fields, type: "geo" },
        qs: { collection: this._name }
      },
      res => res.body
    );
  }

  createFulltextIndex(
    fields: string | [string] | [string, string],
    opts?: CreateFulltextIndexOptions
  ) {
    if (typeof fields === "string") {
      fields = [fields];
    }
    return this._connection.request(
      {
        method: "POST",
        path: "/_api/index",
        body: { ...opts, fields, type: "fulltext" },
        qs: { collection: this._name }
      },
      res => res.body
    );
  }
  //#endregion
}

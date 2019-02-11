import {
  ArangoCollection,
  Collection,
  DocumentCollection,
  documentHandle,
  DOCUMENT_NOT_FOUND,
  EdgeCollection,
  isArangoCollection
} from "./collection";
import { Connection } from "./connection";
import { isArangoError } from "./error";
import { Document, Edge, ReadDocumentOptions, Selector } from "./util/types";

type TODO_any = any;

export class GraphVertexCollection<T extends object = any>
  implements ArangoCollection {
  isArangoCollection: true = true;
  private _connection: Connection;
  private _name: string;

  graph: Graph;
  collection: DocumentCollection<T>;

  constructor(connection: Connection, name: string, graph: Graph) {
    this._connection = connection;
    this._name = name;
    this.graph = graph;
    this.collection = new Collection(connection, name);
  }

  get name() {
    return this._name;
  }

  vertex(selector: Selector, opts?: ReadDocumentOptions): Promise<Document<T>>;
  vertex(selector: Selector, graceful: boolean): Promise<Document<T>>;
  vertex(
    selector: Selector,
    opts?: boolean | ReadDocumentOptions
  ): Promise<Document<T>> {
    if (typeof opts === "boolean") {
      opts = { graceful: opts };
    }
    const { allowDirtyRead = undefined, graceful = false } = opts || {};
    const result = this._connection.request(
      {
        path: `/_api/gharial/${this.graph.name}/vertex/${documentHandle(
          selector,
          this._name
        )}`,
        allowDirtyRead
      },
      res => res.body.vertex
    );
    if (!graceful) return result;
    return result.catch(err => {
      if (isArangoError(err) && err.errorNum === DOCUMENT_NOT_FOUND) {
        return null;
      }
      throw err;
    });
  }

  save(
    data: TODO_any,
    opts?: { waitForSync?: boolean; returnNew?: boolean }
  ): Promise<TODO_any> {
    return this._connection.request(
      {
        method: "POST",
        path: `/_api/gharial/${this.graph.name}/vertex/${this._name}`,
        body: data,
        qs: opts
      },
      res => res.body.vertex
    );
  }

  replace(selector: Selector, newValue: TODO_any, opts: TODO_any = {}) {
    const headers: { [key: string]: string } = {};
    if (typeof opts === "string") {
      opts = { rev: opts };
    }
    if (opts.rev) {
      let rev: string;
      ({ rev, ...opts } = opts);
      headers["if-match"] = rev;
    }
    return this._connection.request(
      {
        method: "PUT",
        path: `/_api/gharial/${this.graph.name}/vertex/${documentHandle(
          selector,
          this._name
        )}`,
        body: newValue,
        qs: opts,
        headers
      },
      res => res.body.vertex
    );
  }

  update(selector: Selector, newValue: TODO_any, opts: TODO_any = {}) {
    const headers: { [key: string]: string } = {};
    if (typeof opts === "string") {
      opts = { rev: opts };
    }
    if (opts.rev) {
      let rev: string;
      ({ rev, ...opts } = opts);
      headers["if-match"] = rev;
    }
    return this._connection.request(
      {
        method: "PATCH",
        path: `/_api/gharial/${this.graph.name}/vertex/${documentHandle(
          selector,
          this._name
        )}`,
        body: newValue,
        qs: opts,
        headers
      },
      res => res.body.vertex
    );
  }

  remove(selector: Selector, opts: TODO_any = {}) {
    const headers: { [key: string]: string } = {};
    if (typeof opts === "string") {
      opts = { rev: opts };
    }
    if (opts.rev) {
      let rev: string;
      ({ rev, ...opts } = opts);
      headers["if-match"] = rev;
    }
    return this._connection.request(
      {
        method: "DELETE",
        path: `/_api/gharial/${this.graph.name}/vertex/${documentHandle(
          selector,
          this._name
        )}`,
        qs: opts,
        headers
      },
      res => res.body.removed
    );
  }
}

export class GraphEdgeCollection<T extends object = any>
  implements ArangoCollection {
  isArangoCollection: true = true;
  private _connection: Connection;
  private _name: string;

  graph: Graph;
  collection: EdgeCollection<T>;

  constructor(connection: Connection, name: string, graph: Graph) {
    this._connection = connection;
    this._name = name;
    this.graph = graph;
    this.collection = new Collection(connection, name);
  }

  get name() {
    return this._name;
  }

  edge(selector: Selector, graceful: boolean): Promise<Edge<T>>;
  edge(selector: Selector, opts?: ReadDocumentOptions): Promise<Edge<T>>;
  edge(
    selector: Selector,
    opts: boolean | ReadDocumentOptions = {}
  ): Promise<Edge<T>> {
    if (typeof opts === "boolean") {
      opts = { graceful: opts };
    }
    const { allowDirtyRead = undefined, graceful = false } = opts;
    const result = this._connection.request(
      {
        path: `/_api/gharial/${this.graph.name}/edge/${documentHandle(
          selector,
          this._name
        )}`,
        allowDirtyRead
      },
      res => res.body.edge
    );
    if (!graceful) return result;
    return result.catch(err => {
      if (isArangoError(err) && err.errorNum === DOCUMENT_NOT_FOUND) {
        return null;
      }
      throw err;
    });
  }

  save(
    data: TODO_any,
    opts?: { waitForSync?: boolean; returnNew?: boolean }
  ): Promise<TODO_any> {
    return this._connection.request(
      {
        method: "POST",
        path: `/_api/gharial/${this.graph.name}/edge/${this._name}`,
        body: data,
        qs: opts
      },
      res => res.body.edge
    );
  }

  replace(selector: Selector, newValue: TODO_any, opts: TODO_any = {}) {
    const headers: { [key: string]: string } = {};
    if (typeof opts === "string") {
      opts = { rev: opts };
    }
    if (opts.rev) {
      let rev: string;
      ({ rev, ...opts } = opts);
      headers["if-match"] = rev;
    }
    return this._connection.request(
      {
        method: "PUT",
        path: `/_api/gharial/${this.graph.name}/edge/${documentHandle(
          selector,
          this._name
        )}`,
        body: newValue,
        qs: opts,
        headers
      },
      res => res.body.edge
    );
  }

  update(selector: Selector, newValue: TODO_any, opts: TODO_any = {}) {
    const headers: { [key: string]: string } = {};
    if (typeof opts === "string") {
      opts = { rev: opts };
    }
    if (opts.rev) {
      let rev: string;
      ({ rev, ...opts } = opts);
      headers["if-match"] = rev;
    }
    return this._connection.request(
      {
        method: "PATCH",
        path: `/_api/gharial/${this.graph.name}/edge/${documentHandle(
          selector,
          this._name
        )}`,
        body: newValue,
        qs: opts,
        headers
      },
      res => res.body.edge
    );
  }

  remove(selector: Selector, opts: TODO_any = {}) {
    const headers: { [key: string]: string } = {};
    if (typeof opts === "string") {
      opts = { rev: opts };
    }
    if (opts.rev) {
      let rev: string;
      ({ rev, ...opts } = opts);
      headers["if-match"] = rev;
    }
    return this._connection.request(
      {
        method: "DELETE",
        path: `/_api/gharial/${this.graph.name}/edge/${documentHandle(
          selector,
          this._name
        )}`,
        qs: opts,
        headers
      },
      res => res.body.removed
    );
  }
}

export const GRAPH_NOT_FOUND = 1924;
export class Graph {
  private _name: string;

  private _connection: Connection;

  constructor(connection: Connection, name: string) {
    this._name = name;
    this._connection = connection;
  }

  get name() {
    return this._name;
  }

  get() {
    return this._connection.request(
      { path: `/_api/gharial/${this._name}` },
      res => res.body.graph
    );
  }

  exists(): Promise<boolean> {
    return this.get().then(
      () => true,
      err => {
        if (isArangoError(err) && err.errorNum === GRAPH_NOT_FOUND) {
          return false;
        }
        throw err;
      }
    );
  }

  create(properties: TODO_any, opts?: { waitForSync?: boolean }) {
    return this._connection.request(
      {
        method: "POST",
        path: "/_api/gharial",
        body: {
          ...properties,
          name: this._name
        },
        qs: opts
      },
      res => res.body.graph
    );
  }

  drop(dropCollections: boolean = false) {
    return this._connection.request(
      {
        method: "DELETE",
        path: `/_api/gharial/${this._name}`,
        qs: { dropCollections }
      },
      res => res.body.removed
    );
  }

  vertexCollection<T extends object = any>(collectionName: string) {
    return new GraphVertexCollection<T>(this._connection, collectionName, this);
  }

  listVertexCollections(opts?: { excludeOrphans?: boolean }) {
    return this._connection.request(
      { path: `/_api/gharial/${this._name}/vertex`, qs: opts },
      res => res.body.collections
    );
  }

  async vertexCollections(opts?: { excludeOrphans?: boolean }) {
    const names = await this.listVertexCollections(opts);
    return names.map(
      (name: TODO_any) =>
        new GraphVertexCollection(this._connection, name, this)
    );
  }

  addVertexCollection(collection: string | ArangoCollection) {
    if (isArangoCollection(collection)) {
      collection = collection.name;
    }
    return this._connection.request(
      {
        method: "POST",
        path: `/_api/gharial/${this._name}/vertex`,
        body: { collection }
      },
      res => res.body.graph
    );
  }

  removeVertexCollection(
    collection: string | ArangoCollection,
    dropCollection: boolean = false
  ) {
    if (isArangoCollection(collection)) {
      collection = collection.name;
    }
    return this._connection.request(
      {
        method: "DELETE",
        path: `/_api/gharial/${this._name}/vertex/${collection}`,
        qs: {
          dropCollection
        }
      },
      res => res.body.graph
    );
  }

  edgeCollection<T extends object = any>(collectionName: string) {
    return new GraphEdgeCollection<T>(this._connection, collectionName, this);
  }

  listEdgeCollections() {
    return this._connection.request(
      { path: `/_api/gharial/${this._name}/edge` },
      res => res.body.collections
    );
  }

  async edgeCollections() {
    const names = await this.listEdgeCollections();
    return names.map(
      (name: TODO_any) => new GraphEdgeCollection(this._connection, name, this)
    );
  }

  addEdgeDefinition(definition: TODO_any) {
    return this._connection.request(
      {
        method: "POST",
        path: `/_api/gharial/${this._name}/edge`,
        body: definition
      },
      res => res.body.graph
    );
  }

  replaceEdgeDefinition(definitionName: string, definition: TODO_any) {
    return this._connection.request(
      {
        method: "PUT",
        path: `/_api/gharial/${this._name}/edge/${definitionName}`,
        body: definition
      },
      res => res.body.graph
    );
  }

  removeEdgeDefinition(
    definitionName: string,
    dropCollection: boolean = false
  ) {
    return this._connection.request(
      {
        method: "DELETE",
        path: `/_api/gharial/${this._name}/edge/${definitionName}`,
        qs: {
          dropCollection
        }
      },
      res => res.body.graph
    );
  }

  traversal(startVertex: Selector, opts: TODO_any) {
    return this._connection.request(
      {
        method: "POST",
        path: `/_api/traversal`,
        body: {
          ...opts,
          startVertex,
          graphName: this._name
        }
      },
      res => res.body.result
    );
  }
}

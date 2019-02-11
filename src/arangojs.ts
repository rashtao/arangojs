import { aql } from "./aql-query";
import { Config } from "./connection";
import { Database } from "./database";
import { ArangoError } from "./error";
import { CollectionType, StatusType } from "./util/types";

export default Object.assign(
  function arangojs(config: Config) {
    return new Database(config);
  },
  { CollectionType, StatusType, ArangoError, Database, aql }
);

export {
  ArangoCollection,
  DocumentCollection,
  EdgeCollection,
  isArangoCollection
} from "./collection";
export { Graph, GraphEdgeCollection, GraphVertexCollection } from "./graph";
export * from "./util/types";
export { Database, aql };

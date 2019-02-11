export type Errback<T> = (err: Error | null, result?: T) => void;

export enum CollectionType {
  DOCUMENT_COLLECTION = 2,
  EDGE_COLLECTION = 3
}

export enum StatusType {
  NEWBORN = 1,
  UNLOADED = 2,
  LOADED = 3,
  UNLOADING = 4,
  DELETED = 5,
  LOADING = 6
}

export type KeyGeneratorType =
  | "traditional"
  | "autoincrement"
  | "uuid"
  | "padded";

export type ShardingStrategyType =
  | "hash"
  | "enterprise-hash-smart-edge"
  | "community-compat"
  | "enterprise-compat"
  | "enterprise-smart-edge-compat";

/** @deprecated ArangoDB 3.4 */
export type SimpleQueryAllKeysType = "id" | "key" | "path";

// Responses

export interface ArangoResponseMetadata {
  [key: string]: any | undefined;
  error: false;
  code: number;
}

export interface CollectionChecksum {
  checksum: string;
  revision: string;
}

export interface CollectionFigures {
  alive: {
    count: number;
    size: number;
  };
  dead: {
    count: number;
    size: number;
    deletion: number;
  };
  datafiles: {
    count: number;
    fileSize: number;
  };
  journals: {
    count: number;
    fileSize: number;
  };
  compactors: {
    count: number;
    fileSize: number;
  };
  shapefiles: {
    count: number;
    fileSize: number;
  };
  shapes: {
    count: number;
    size: number;
  };
  attributes: {
    count: number;
    size: number;
  };
  indexes: {
    count: number;
    size: number;
  };
  lastTick: number;
  uncollectedLogfileEntries: number;
  documentReferences: number;
  waitingFor: string;
  compactionStatus: {
    time: string;
    message: string;
    count: number;
    filesCombined: number;
    bytesRead: number;
    bytesWritten: number;
  };
}

export interface CollectionMetadata {
  status: StatusType;
  name: string;
  type: CollectionType;
  isSystem: boolean;
}

export interface CollectionProperties extends CollectionMetadata {
  statusString: string;
  waitForSync: boolean;
  keyOptions: {
    allowUserKeys: boolean;
    type: KeyGeneratorType;
    lastValue: number;
  };

  cacheEnabled?: boolean;
  doCompact?: boolean;
  journalSize?: number;
  indexBuckets?: number;

  numberOfShards?: number;
  shardKeys?: string[];
  replicationFactor?: number;
  shardingStrategy?: ShardingStrategyType;
}

export interface ImportResult {
  error: false;
  created: number;
  errors: number;
  empty: number;
  updated: number;
  ignored: number;
  details?: string[];
}

export interface EdgesResult<T extends object = any> {
  edges: Document<T>[];
  stats: {
    scannedIndex: number;
    filtered: number;
  };
}

/** @deprecated ArangoDB 3.4 */
export interface SimpleQueryRemoveByKeysResult<T extends object = any> {
  removed: number;
  ignored: number;
  old?: DocumentMetadata[] | Document<T>[];
}

// Options

export interface CollectionPropertiesOptions {
  waitForSync?: boolean;
  journalSize?: number;
  indexBuckets?: number;
  replicationFactor?: number;
}

export interface CollectionChecksumOptions {
  withRevisions?: boolean;
  withData?: boolean;
}

export interface CreateCollectionOptions {
  waitForSync?: boolean;
  journalSize?: number;
  isVolatile?: boolean;
  isSystem?: boolean;
  keyOptions?: {
    type?: KeyGeneratorType;
    allowUserKeys?: boolean;
    increment?: number;
    offset?: number;
  };
  numberOfShards?: number;
  shardKeys?: string[];
  replicationFactor?: number;
}

export interface ReadDocumentOptions {
  graceful?: boolean;
  allowDirtyRead?: boolean;
}

export interface InsertDocumentOptions {
  waitForSync?: boolean;
  silent?: boolean;
  returnNew?: boolean;
}

export interface ReplaceDocumentOptions extends InsertDocumentOptions {
  overwrite?: boolean;
  returnOld?: boolean;
}

export interface UpdateDocumentOptions extends ReplaceDocumentOptions {
  keepNull?: boolean;
  mergeObjects?: boolean;
}

export interface RemoveDocumentOptions {
  waitForSync?: boolean;
  overwrite?: boolean;
  returnOld?: boolean;
  silent?: boolean;
}

export interface ImportOptions {
  type?: null | "auto" | "documents" | "array";
  fromPrefix?: string;
  toPrefix?: string;
  overwrite?: boolean;
  waitForSync?: boolean;
  onDuplicate?: "error" | "update" | "replace" | "ignore";
  complete?: boolean;
  details?: boolean;
}

/** @deprecated ArangoDB 3.4 */
export interface SimpleQueryOptions {
  skip?: number;
  limit?: number;
  batchSize?: number;
  ttl?: number;
}

/** @deprecated ArangoDB 3.4 */
export interface SimpleQueryAllOptions extends SimpleQueryOptions {
  stream?: boolean;
}

/** @deprecated ArangoDB 3.4 */
export interface SimpleQueryUpdateByExampleOptions {
  keepNull?: boolean;
  waitForSync?: boolean;
  limit?: number;
  mergeObjects?: boolean;
}

/** @deprecated ArangoDB 3.4 */
export interface SimpleQueryRemoveOrReplaceByExampleOptions {
  waitForSync?: boolean;
  limit?: number;
}

/** @deprecated ArangoDB 3.4 */
export interface SimpleQueryRemoveByKeysOptions {
  returnOld?: boolean;
  silent?: boolean;
  waitForSync?: boolean;
}

/** @deprecated ArangoDB 3.4 */
export interface SimpleQueryFulltextOptions {
  index?: string;
  limit?: number;
  skip?: number;
}

/** @deprecated ArangoDB 3.4 */
export interface TraversalOptions {
  graphName?: string;
  edgeCollection?: string;
  init?: string;
  filter?: string;
  sort?: string;
  visitor?: string;
  expander?: string;
  direction?: "inbound" | "outbound" | "any";
  itemOrder?: "forward" | "backward";
  strategy?: "depthfirst" | "breadthfirst";
  order?: "preorder" | "postorder" | "preorder-expander";
  uniqueness?: {
    vertices?: "none" | "global" | "path";
    edges?: "none" | "global" | "path";
  };
  minDepth?: number;
  maxDepth?: number;
  maxIterations?: number;
}

export interface CreateHashIndexOptions {
  unique?: boolean;
  sparse?: boolean;
  deduplicate?: boolean;
}
export type CreateSkiplistIndexOptions = CreateHashIndexOptions;
export interface CreatePersistentIndexOptions {
  unique?: boolean;
  sparse?: boolean;
}
export interface CreateGeoIndexOptions {
  geoJson?: boolean;
}
export interface CreateFulltextIndexOptions {
  minLength?: number;
}
export type CreateIndexOptions =
  | ({ type: "hash"; fields: string[] } & CreateHashIndexOptions)
  | ({ type: "skiplist"; fields: string[] } & CreateSkiplistIndexOptions)
  | ({ type: "persistent"; fields: string[] } & CreatePersistentIndexOptions)
  | ({
      type: "geo";
      fields: [string] | [string, string];
    } & CreateGeoIndexOptions)
  | ({ type: "fulltext"; fields: string[] } & CreateFulltextIndexOptions);

// Document

export type DocumentLike =
  | { [key: string]: any; _key: string }
  | { [key: string]: any; _id: string };

export type Selector = DocumentLike | string;

export type Patch<T> = { [K in keyof T]?: T[K] | Patch<T[K]> };

export interface DocumentMetadata {
  _key: string;
  _id: string;
  _rev: string;
}

export interface UpdateMetadata extends DocumentMetadata {
  _oldRev: string;
}

export interface EdgeMetadata {
  _from: string;
  _to: string;
}

export type Document<T extends object = any> = { [K in keyof T]: T[K] } &
  DocumentMetadata & { _from?: string; _to?: string } & {
    [key: string]: any;
  };

export type DocumentData<T extends object = any> = { [K in keyof T]: T[K] } &
  Partial<DocumentMetadata> &
  Partial<EdgeMetadata>;

export type Edge<T extends object = any> = Document<T> & EdgeMetadata;

export type EdgeData<T extends object = any> = DocumentData<T> & EdgeMetadata;

// Indexes

export interface GenericIndex {
  fields: string[];
  id: string;
  sparse: boolean;
  unique: boolean;
}
export interface SkiplistIndex extends GenericIndex {
  type: "skiplist";
}
export interface HashIndex extends GenericIndex {
  type: "hash";
  selectivityEstimate: number;
}
export interface PrimaryIndex extends GenericIndex {
  type: "primary";
  selectivityEstimate: number;
}
export interface PersistentIndex extends GenericIndex {
  type: "persistent";
}
export interface FulltextIndex extends GenericIndex {
  type: "fulltext";
  minLength: number;
}
export interface GeoIndex extends GenericIndex {
  fields: [string] | [string, string];
  type: "geo";
  geoJson: boolean;
  bestIndexedLevel: number;
  worstIndexedLevel: number;
  maxNumCoverCells: number;
}
export type Index =
  | GeoIndex
  | FulltextIndex
  | PersistentIndex
  | PrimaryIndex
  | HashIndex
  | SkiplistIndex;

export type IndexHandle = string | Index;

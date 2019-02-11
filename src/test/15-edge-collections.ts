import { expect } from "chai";
import { Database } from "../arangojs";
import { DocumentCollection, EdgeCollection } from "../collection";

describe("EdgeCollection API", function() {
  // create database takes 11s in a standard cluster
  this.timeout(20000);

  const name = `testdb_${Date.now()}`;
  let db: Database;
  let collection: EdgeCollection<{ sup?: string; empty?: boolean | null }>;
  before(async () => {
    db = new Database({
      url: process.env.TEST_ARANGODB_URL || "http://localhost:8529",
      arangoVersion: Number(process.env.ARANGO_VERSION || 30400)
    });
    await db.createDatabase(name);
    db.useDatabase(name);
  });
  after(async () => {
    try {
      db.useDatabase("_system");
      await db.dropDatabase(name);
    } finally {
      db.close();
    }
  });
  beforeEach(async () => {
    collection = db.collection(`c_${Date.now()}`);
    await collection.create();
  });
  afterEach(async () => {
    await collection.drop();
  });

  describe("edgeCollection.edge", () => {
    const data = { _from: "d/1", _to: "d/2" };
    let meta: any;
    beforeEach(async () => {
      meta = await collection.save(data);
    });
    it("returns an edge in the collection", async () => {
      const doc = await collection.edge(meta._id);
      expect(doc).to.have.keys("_key", "_id", "_rev", "_from", "_to");
      expect(doc._id).to.equal(meta._id);
      expect(doc._key).to.equal(meta._key);
      expect(doc._rev).to.equal(meta._rev);
      expect(doc._from).to.equal(data._from);
      expect(doc._to).to.equal(data._to);
    });
    it("does not throw on not found when graceful", async () => {
      const doc = await collection.edge("does-not-exist", true);
      expect(doc).to.equal(null);
    });
  });
  describe("edgeCollection.document", () => {
    const data = { _from: "d/1", _to: "d/2" };
    let meta: any;
    beforeEach(async () => {
      meta = await collection.save(data);
    });
    it("returns an edge in the collection", async () => {
      const doc = await collection.document(meta._id);
      expect(doc).to.have.keys("_key", "_id", "_rev", "_from", "_to");
      expect(doc._id).to.equal(meta._id);
      expect(doc._key).to.equal(meta._key);
      expect(doc._rev).to.equal(meta._rev);
      expect(doc._from).to.equal(data._from);
      expect(doc._to).to.equal(data._to);
    });
    it("does not throw on not found when graceful", async () => {
      const doc = await collection.document("does-not-exist", true);
      expect(doc).to.equal(null);
    });
  });
  describe("edgeCollection.documentExists", () => {
    const data = { _from: "d/1", _to: "d/2" };
    let meta: any;
    beforeEach(async () => {
      meta = await collection.save(data);
    });
    it("returns true if the edge exists", async () => {
      const exists = await collection.documentExists(meta._id);
      expect(exists).to.equal(true);
    });
    it("returns false if the edge does not exist", async () => {
      const exists = await collection.documentExists("does-not-exist");
      expect(exists).to.equal(false);
    });
  });
  describe("edgeCollection.save", () => {
    it("creates an edge in the collection", async () => {
      const data = { chicken: "chicken", _from: "d/1", _to: "d/2" };
      const meta = await collection.save(data);
      expect(meta).to.be.an("object");
      expect(meta)
        .to.have.property("_id")
        .that.is.a("string");
      expect(meta)
        .to.have.property("_rev")
        .that.is.a("string");
      expect(meta)
        .to.have.property("_key")
        .that.is.a("string");
      const doc = await collection.edge(meta._id);
      expect(doc).to.have.keys(
        "chicken",
        "_key",
        "_id",
        "_rev",
        "_from",
        "_to"
      );
      expect(doc._id).to.equal(meta._id);
      expect(doc._key).to.equal(meta._key);
      expect(doc._rev).to.equal(meta._rev);
      expect(doc._from).to.equal(data._from);
      expect(doc._to).to.equal(data._to);
      expect(doc.chicken).to.equal(data.chicken);
    });
    it("uses the given _key if provided", async () => {
      const data = {
        chicken: "chicken",
        _key: "banana",
        _from: "d/1",
        _to: "d/2"
      };
      const meta = await collection.save(data);
      expect(meta).to.be.an("object");
      expect(meta)
        .to.have.property("_id")
        .that.is.a("string");
      expect(meta)
        .to.have.property("_rev")
        .that.is.a("string");
      expect(meta)
        .to.have.property("_key")
        .that.equals(data._key);
      const doc = await collection.edge(meta._id);
      expect(doc).to.have.keys(
        "chicken",
        "_key",
        "_id",
        "_rev",
        "_from",
        "_to"
      );
      expect(doc._id).to.equal(meta._id);
      expect(doc._rev).to.equal(meta._rev);
      expect(doc._key).to.equal(data._key);
      expect(doc._from).to.equal(data._from);
      expect(doc._to).to.equal(data._to);
      expect(doc.chicken).to.equal(data.chicken);
    });
    it("takes an options object", async () => {
      const data = { chicken: "chicken", _from: "d/1", _to: "d/2" };
      const meta = await collection.save(data, { returnNew: true });
      expect(meta).to.be.an("object");
      expect(meta)
        .to.have.property("_id")
        .that.is.a("string");
      expect(meta)
        .to.have.property("_rev")
        .that.is.a("string");
      expect(meta)
        .to.have.property("_key")
        .that.is.a("string");
      expect(meta)
        .to.have.property("new")
        .that.is.an("object");
      expect(meta.new).to.have.property("chicken", data.chicken);
      const doc = await collection.edge(meta._id);
      expect(doc).to.have.keys(
        "chicken",
        "_key",
        "_id",
        "_rev",
        "_from",
        "_to"
      );
      expect(doc.chicken).to.equal(data.chicken);
      expect(doc._id).to.equal(meta._id);
      expect(doc._key).to.equal(meta._key);
      expect(doc._rev).to.equal(meta._rev);
      expect(doc._from).to.equal(data._from);
      expect(doc._to).to.equal(data._to);
    });
  });
  describe("edgeCollection.traversal", () => {
    let knows: EdgeCollection<{}>;
    beforeEach(async () => {
      knows = db.collection("knows");
      const person: DocumentCollection<{}> = db.collection("person");
      await Promise.all([person.create(), knows.create()]);
      await Promise.all([
        person.import([
          { _key: "Alice" },
          { _key: "Bob" },
          { _key: "Charlie" },
          { _key: "Dave" },
          { _key: "Eve" }
        ]),
        knows.import([
          { _from: "person/Alice", _to: "person/Bob" },
          { _from: "person/Bob", _to: "person/Charlie" },
          { _from: "person/Bob", _to: "person/Dave" },
          { _from: "person/Eve", _to: "person/Alice" },
          { _from: "person/Eve", _to: "person/Bob" }
        ])
      ]);
    });
    it("executes traversal", async () => {
      const result = await knows.traversal("person/Alice", {
        direction: "outbound"
      });
      expect(result).to.have.property("visited");
      const visited = result.visited;
      expect(visited).to.have.property("vertices");
      const vertices = visited.vertices;
      expect(vertices).to.be.instanceOf(Array);
      expect(vertices.length).to.equal(4);
      const names = vertices.map((d: any) => d._key);
      for (const name of ["Alice", "Bob", "Charlie", "Dave"]) {
        expect(names).to.contain(name);
      }
      expect(visited).to.have.property("paths");
      const paths = visited.paths;
      expect(paths).to.be.instanceOf(Array);
      expect(paths.length).to.equal(4);
    });
  });
  describe("edgeCollection.replace", () => {
    it("replaces the given edge", async () => {
      const data = { potato: "tomato", _from: "d/1", _to: "d/2" };
      const meta = await collection.save(data, { returnNew: true });
      const doc = meta.new!;
      await collection.replace(doc, {
        sup: "dawg",
        _from: "d/1",
        _to: "d/2"
      });
      const newData = await collection.edge(doc._key);
      expect(newData).not.to.have.property("potato");
      expect(newData).to.have.property("sup", "dawg");
    });
  });
  describe("edgeCollection.update", () => {
    it("updates the given document", async () => {
      const data = {
        potato: "tomato",
        empty: false,
        _from: "d/1",
        _to: "d/2"
      };
      const meta = await collection.save(data, { returnNew: true });
      const doc = meta.new!;
      await collection.update(doc, { sup: "dawg", empty: null });
      const newData = await collection.edge(doc._key);
      expect(newData).to.have.property("potato", doc.potato);
      expect(newData).to.have.property("sup", "dawg");
      expect(newData).to.have.property("empty", null);
    });
    it("removes null values if keepNull is explicitly set to false", async () => {
      const data = {
        potato: "tomato",
        empty: false,
        _from: "d/1",
        _to: "d/2"
      };
      const meta = await collection.save(data, { returnNew: true });
      const doc = meta.new!;
      await collection.update(
        doc,
        { sup: "dawg", empty: null },
        { keepNull: false }
      );
      const newData = await collection.edge(doc._key);
      expect(newData).to.have.property("potato", doc.potato);
      expect(newData).to.have.property("sup", "dawg");
      expect(newData).not.to.have.property("empty");
    });
  });
  describe("edgeCollection.remove", () => {
    const key = `d_${Date.now()}`;
    beforeEach(async () => {
      await collection.save({ _key: key, _from: "d/1", _to: "d/2" });
    });
    it("deletes the given edge", async () => {
      await collection.remove(key);
      try {
        await collection.edge(key);
      } catch (e) {
        return;
      }
      expect.fail();
    });
  });
});

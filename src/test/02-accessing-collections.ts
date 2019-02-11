import { expect } from "chai";
import { Database } from "../arangojs";
import { Collection } from "../collection";

const range = (n: number): number[] => Array.from(Array(n).keys());

describe("Accessing collections", function() {
  // create database takes 11s in a standard cluster
  this.timeout(20000);

  const name = `testdb_${Date.now()}`;
  let db: Database;
  let builtinSystemCollections: string[];
  before(async () => {
    db = new Database({
      url: process.env.TEST_ARANGODB_URL || "http://localhost:8529",
      arangoVersion: Number(process.env.ARANGO_VERSION || 30400)
    });
    await db.createDatabase(name);
    db.useDatabase(name);
    const collections = await db.listCollections(false);
    builtinSystemCollections = collections.map((c: any) => c.name);
  });
  after(async () => {
    try {
      db.useDatabase("_system");
      await db.dropDatabase(name);
    } finally {
      db.close();
    }
  });
  describe("database.collection", () => {
    it("returns a DocumentCollection instance for the collection", () => {
      const name = "potato";
      const collection = db.collection(name);
      expect(collection).to.be.an.instanceof(Collection);
      expect(collection)
        .to.have.property("name")
        .that.equals(name);
    });
  });
  describe("database.listCollections", () => {
    const nonSystemCollectionNames = range(4).map(i => `c_${Date.now()}_${i}`);
    const systemCollectionNames = range(4).map(i => `_c_${Date.now()}_${i}`);
    before(async () => {
      await Promise.all([
        ...nonSystemCollectionNames.map(name => db.createCollection(name)),
        ...systemCollectionNames.map(name =>
          db.collection(name).create({ isSystem: true })
        )
      ]);
    });
    after(async () => {
      await Promise.all([
        ...nonSystemCollectionNames.map(name => db.collection(name).drop()),
        ...systemCollectionNames.map(name =>
          db.collection(name).drop({ isSystem: true })
        )
      ]);
    });
    it("fetches information about all non-system collections", async () => {
      const collections = await db.listCollections();
      expect(collections.length).to.equal(nonSystemCollectionNames.length);
      expect(collections.map((c: any) => c.name).sort()).to.eql(
        nonSystemCollectionNames
      );
    });
    it("includes system collections if explicitly passed false", async () => {
      const collections = await db.listCollections(false);
      const allCollectionNames = nonSystemCollectionNames
        .concat(systemCollectionNames)
        .concat(builtinSystemCollections)
        .sort();
      expect(collections.length).to.be.at.least(allCollectionNames.length);
      expect(collections.map((c: any) => c.name).sort()).to.eql(
        allCollectionNames
      );
    });
  });
  describe("database.collections", () => {
    const documentCollectionNames = range(4).map(i => `dc_${Date.now()}_${i}`);
    const edgeCollectionNames = range(4).map(i => `ec_${Date.now()}_${i}`);
    const systemCollectionNames = range(4).map(i => `_c_${Date.now()}_${i}`);
    before(async () => {
      await Promise.all([
        ...documentCollectionNames.map(name => db.createCollection(name)),
        ...edgeCollectionNames.map(
          name => db.createEdgeCollection(name) as Promise<Collection>
        ),
        ...systemCollectionNames.map(name =>
          db.collection(name).create({ isSystem: true })
        )
      ]);
    });
    after(async () => {
      await Promise.all([
        ...documentCollectionNames.map(name => db.collection(name).drop()),
        ...edgeCollectionNames.map(name => db.collection(name).drop()),
        ...systemCollectionNames.map(name =>
          db.collection(name).drop({ isSystem: true })
        )
      ]);
    });
    it("creates Collection instances", async () => {
      const collections = await db.collections();
      expect(collections.length).to.equal(
        documentCollectionNames.length + edgeCollectionNames.length
      );
      expect(collections.map(c => c.name).sort()).to.eql(
        [...documentCollectionNames, ...edgeCollectionNames].sort()
      );
    });
    it("includes system collections if explicitly passed false", async () => {
      const collections = await db.collections(false);
      const allCollectionNames = [
        ...documentCollectionNames,
        ...edgeCollectionNames,
        ...systemCollectionNames,
        ...builtinSystemCollections
      ].sort();
      expect(collections.map((c: any) => c.name).sort()).to.eql(
        allCollectionNames
      );
    });
  });
});

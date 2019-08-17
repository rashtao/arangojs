import { expect } from "chai";
import { Database } from "../arangojs";
import { DocumentCollection } from "../collection";

describe("Transactions", () => {
  let db: Database;
  before(() => {
    db = new Database({
      url: process.env.TEST_ARANGODB_URL || "http://localhost:8529",
      arangoVersion: Number(process.env.ARANGO_VERSION || 30400)
    });
  });
  after(() => {
    db.close();
  });
  describe("database.executeTransaction", () => {
    it("should execute a transaction and return the result", async () => {
      const result = await db.executeTransaction(
        [],
        "function (params) {return params;}",
        { params: "test" }
      );
      expect(result).to.equal("test");
    });
  });
  describe("stream transactions", () => {
    const name = `testdb_${Date.now()}`;
    let collection: DocumentCollection;
    before(async () => {
      await db.createDatabase(name);
      db.useDatabase(name);
    });
    after(async () => {
      db.useDatabase("_system");
      await db.dropDatabase(name);
    });
    beforeEach(async () => {
      collection = db.collection(`collection-${Date.now()}`);
      await collection.create();
    });
    afterEach(async () => {
      try {
        await collection.get();
      } catch (e) {
        return;
      }
      await collection.drop();
    });

    it("can commit an empty transaction", async () => {
      const trx = await db.beginTransaction(collection);
      {
        const { id, status } = await trx.get();
        expect(id).to.equal(trx.id);
        expect(status).to.equal("running");
      }
      {
        const trx2 = db.transaction(trx.id);
        const { id, status } = await trx2.get();
        expect(id).to.equal(trx.id);
        expect(status).to.equal("running");
      }
      const { id, status } = await trx.commit();
      expect(id).to.equal(trx.id);
      expect(status).to.equal("committed");
    });

    it("can abort an empty transaction", async () => {
      const trx = await db.beginTransaction(collection);
      const { id, status } = await trx.abort();
      expect(id).to.equal(trx.id);
      expect(status).to.equal("aborted");
    });

    it("can insert a document", async () => {
      const trx = await db.beginTransaction(collection);
      const meta = await trx.run(() => collection.save({ _key: "test" }));
      expect(meta).to.have.property("_key", "test");
      const { id, status } = await trx.commit();
      expect(id).to.equal(trx.id);
      expect(status).to.equal("committed");
      const doc = await collection.document("test");
      expect(doc).to.have.property("_key", "test");
    });

    it("can insert two documents at a time", async () => {
      const trx = await db.beginTransaction(collection);
      const [meta1, meta2] = await trx.run(() =>
        Promise.all([
          collection.save({ _key: "test1" }),
          collection.save({ _key: "test2" })
        ])
      );
      expect(meta1).to.have.property("_key", "test1");
      expect(meta2).to.have.property("_key", "test2");
      const { id, status } = await trx.commit();
      expect(id).to.equal(trx.id);
      expect(status).to.equal("committed");
      const doc1 = await collection.document("test1");
      expect(doc1).to.have.property("_key", "test1");
      const doc2 = await collection.document("test2");
      expect(doc2).to.have.property("_key", "test2");
    });

    it("does not leak when inserting a document", async () => {
      const trx = await db.beginTransaction(collection);
      await trx.run(() => collection.save({ _key: "test" }));
      let doc: any;
      try {
        doc = await collection.document("test");
      } catch (e) {}
      if (doc) expect.fail("Document should not exist yet.");
      const { id, status } = await trx.commit();
      expect(id).to.equal(trx.id);
      expect(status).to.equal("committed");
    });

    it("does not leak when inserting two documents at a time", async () => {
      const trx = await db.beginTransaction(collection);
      await trx.run(() =>
        Promise.all([
          collection.save({ _key: "test1" }),
          collection.save({ _key: "test2" })
        ])
      );
      let doc: any;
      try {
        doc = await collection.document("test1");
      } catch (e) {}
      if (doc) expect.fail("Document should not exist yet.");
      try {
        doc = await collection.document("test2");
      } catch (e) {}
      if (doc) expect.fail("Document should not exist yet.");
      const { id, status } = await trx.commit();
      expect(id).to.equal(trx.id);
      expect(status).to.equal("committed");
    });

    it("does not insert a document when aborted", async () => {
      const trx = await db.beginTransaction(collection);
      const meta = await trx.run(() => collection.save({ _key: "test" }));
      expect(meta).to.have.property("_key", "test");
      const { id, status } = await trx.abort();
      expect(id).to.equal(trx.id);
      expect(status).to.equal("aborted");
      let doc: any;
      try {
        doc = await collection.document("test");
      } catch (e) {}
      if (doc) expect.fail("Document should not exist yet.");
    });

    it("does not revert unrelated changes when aborted", async () => {
      const trx = await db.beginTransaction(collection);
      const meta = await collection.save({ _key: "test" });
      expect(meta).to.have.property("_key", "test");
      const { id, status } = await trx.abort();
      expect(id).to.equal(trx.id);
      expect(status).to.equal("aborted");
      const doc = await collection.document("test");
      expect(doc).to.have.property("_key", "test");
    });

    it("supports concurrent transactions", async () => {
      const sleep = (millis: number) => new Promise((resolve) => setTimeout(() => resolve(), millis));

      const trx1 = await db.beginTransaction(collection);
      const trx2 = await db.beginTransaction(collection);

      const [meta1, meta2] = await Promise.all([
        trx1.run(() => sleep(500).then(() => collection.save({_key: "test1"}))),
        trx2.run(() => collection.save({_key: "test2"}))
      ]);

      expect(meta1).to.have.property("_key", "test1");
      expect(meta2).to.have.property("_key", "test2");

      // OK
      const doc2InTx2 = await trx2.run(() => collection.documentExists("test2"));
      expect(doc2InTx2).to.eq(true, "doc2 should exist within tx2");

      // FAIL
      const doc1InTx1 = await trx1.run(() => collection.documentExists("test1"));
      expect(doc1InTx1).to.eq(true, "doc1 should exist within tx1");

      // FAIL
      const doc1OutsideTx1 = await collection.documentExists("test1");
      expect(doc1OutsideTx1).to.eq(false, "doc1 should not exist outside tx1");

      await trx1.abort();
      await trx2.abort();
    });

  });
});

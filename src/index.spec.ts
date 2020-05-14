import { get, use, method, paramsKey } from "./index";
import { Request, Response } from "cross-fetch";

describe("fetch router", () => {
  const finalHandler = async () => new Response(null, { status: 404 });
  const successHandler = async (req: Request) => new Response("hello world");

  describe("with path matching", () => {
    const app = use("/test", successHandler);

    it("should match", async () => {
      const req = new Request("/test", { method: "test" });
      const res = await app(req, finalHandler);

      expect(res.status).toBe(200);
    });

    it("should not match", async () => {
      const req = new Request("/other", { method: "test" });
      const res = await app(req, finalHandler);

      expect(res.status).toBe(404);
    });
  });

  describe("with methods", () => {
    const app = method("POST", successHandler);

    it("should match", async () => {
      const req = new Request("/test", { method: "post" });
      const res = await app(req, finalHandler);

      expect(res.status).toBe(200);
    });

    it("should not match", async () => {
      const req = new Request("/other", { method: "get" });
      const res = await app(req, finalHandler);

      expect(res.status).toBe(404);
    });
  });

  describe("with shorthand helpers", () => {
    const app = get("/test", successHandler);

    it("should match", async () => {
      const req = new Request("/test", { method: "get" });
      const res = await app(req, finalHandler);

      expect(res.status).toBe(200);
    });

    it("should not match on invalid path", async () => {
      const req = new Request("/", { method: "get" });
      const res = await app(req, finalHandler);

      expect(res.status).toEqual(404);
    });

    it("should not match on invalid method", async () => {
      const req = new Request("/test", { method: "delete" });
      const res = await app(req, finalHandler);

      expect(res.status).toBe(404);
    });
  });

  describe("with parameters", () => {
    const app = get<{ id: string }>("/:id", (req) => {
      return new Response(req[paramsKey].id);
    });

    it("should expose parameters", async () => {
      const req = new Request("/1", { method: "get" });
      const res = await app(req, finalHandler);

      expect(await res.text()).toEqual("1");
    });

    it("should decode parameters", async () => {
      const req = new Request("/caf%C3%A9", { method: "get" });
      const res = await app(req, finalHandler);

      expect(await res.text()).toEqual("café");
    });
  });

  describe("with unicode paths", () => {
    const app = get("/café", (req) => {
      return new Response(req.url);
    });

    it("should match", async () => {
      const req = new Request("/caf%C3%A9", { method: "get" });
      const res = await app(req, finalHandler);

      expect(res.status).toEqual(200);
      expect(await res.text()).toEqual("/caf%C3%A9");
    });
  });

  describe("mounted", () => {
    const app = use("/here", get("/there", successHandler), { end: false });

    it.only("should match", async () => {
      const req = new Request("/here/there", { method: "get" });
      const res = await app(req, finalHandler);

      expect(res.status).toEqual(200);
    });

    it("should not match", async () => {
      const req = new Request("/there/here", { method: "get" });
      const res = await app(req, finalHandler);

      expect(res.status).toEqual(404);
    });
  });
});

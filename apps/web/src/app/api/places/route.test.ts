import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/server", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/server")>()),
  connection: async () => undefined,
}));
// Limits are counted in Postgres; these tests are about the search itself.
vi.mock("@/lib/rate-limit", () => ({
  createRateLimiter: () => async () => true,
}));

const { GET } = await import("./route");

function request(query: string) {
  return new NextRequest(`https://app.example.test/api/places?${query}`);
}

describe("GET /api/places", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("turns Photon results into labelled points, near the given spot", async () => {
    const seen: string[] = [];
    vi.stubGlobal("fetch", async (url: URL) => {
      seen.push(String(url));
      return Response.json({
        features: [
          {
            geometry: { coordinates: [106.7651, -6.1908] },
            properties: {
              name: "Graha Kencana",
              district: "Kebon Jeruk",
              city: "Jakarta",
            },
          },
          { geometry: {}, properties: { name: "No point" } },
        ],
      });
    });

    const response = await GET(request("q=graha&lat=-6.2&lon=106.8"));

    expect(await response.json()).toEqual({
      places: [
        {
          label: "Graha Kencana, Kebon Jeruk, Jakarta",
          latitude: -6.1908,
          longitude: 106.7651,
        },
      ],
    });
    expect(seen[0]).toContain("q=graha");
    expect(seen[0]).toContain("lat=-6.2");
  });

  it("asks nobody for under three letters or a broken query", async () => {
    let calls = 0;
    vi.stubGlobal("fetch", async () => {
      calls += 1;
      return Response.json({ features: [] });
    });

    for (const query of ["q=ab", "q=graha&lat=999&lon=1", ""]) {
      expect(await (await GET(request(query))).json()).toEqual({ places: [] });
    }
    expect(calls).toBe(0);
  });

  it("answers with nothing when the geocoder fails", async () => {
    vi.stubGlobal("fetch", async () => {
      throw new Error("down");
    });

    const response = await GET(request("q=graha"));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ places: [] });
  });
});

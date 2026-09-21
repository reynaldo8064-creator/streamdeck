import { PocketIc, createIdentity } from "@dfinity/pic";
import type { Actor, CanisterFixture } from "@dfinity/pic";
import { afterAll, beforeAll, expect, it } from "vitest";

import { idlFactory } from "../../src/frontend/src/declarations/backend.did.js";
import type { _SERVICE } from "../../src/frontend/src/declarations/backend.did";

/**
 * Backend behavior lane: installs the app's own compiled wasm into the
 * platform's PocketIC replica and calls the real public API. This is the only
 * place the backend is exercised for real — the frontend suite mocks the actor.
 *
 * Shapes follow the generated agent-js declarations, not the TypeScript wrapper:
 * `?T` is `[] | [T]`, `Nat`/`Int` are `bigint`, and a unit return decodes to
 * `null`.
 */
const PIC_URL = process.env.POCKET_IC_URL ?? "";
const BACKEND_WASM = process.env.BACKEND_WASM ?? "";

let pic: PocketIc | undefined;
let actor: Actor<_SERVICE>;
let canisterId: CanisterFixture<_SERVICE>["canisterId"];

beforeAll(async () => {
  pic = await PocketIc.create(PIC_URL);
  ({ actor, canisterId } = await pic.setupCanister<_SERVICE>({
    idlFactory,
    wasm: BACKEND_WASM,
  }));
});

afterAll(async () => {
  await pic?.tearDown();
});

it("answers the catalog reads instead of trapping", async () => {
  const channels = await actor.listChannels();
  expect(channels.length).toBeGreaterThanOrEqual(24);

  const byCategory = await actor.listChannelsByCategory(
    { news: null },
    { popularity: null },
  );
  expect(byCategory.length).toBeGreaterThan(0);

  const programs = await actor.listPrograms(1n);
  expect(Array.isArray(programs)).toBe(true);
});

it("seeds 24 channels across all six categories", async () => {
  const channels = await actor.listChannels();
  expect(channels).toHaveLength(24);

  const categories = new Set(
    channels.map((channel) => Object.keys(channel.category)[0]),
  );
  expect(categories).toEqual(
    new Set(["news", "sports", "movies", "kids", "music", "documentary"]),
  );
});

it("returns a channel and its detail with now-playing and up-next", async () => {
  const channel = await actor.getChannel(1n);
  expect(channel).toHaveLength(1);
  expect(channel[0]).toMatchObject({ id: 1n, name: "Noticias 24" });

  const detail = await actor.getChannelDetail(1n);
  expect(detail).toHaveLength(1);
  expect(detail[0].channel.id).toBe(1n);
  // The migration anchors one program to the current hour, so a live replica
  // must resolve a now-playing program.
  expect(detail[0].nowPlaying).toHaveLength(1);
  expect(detail[0].upNext).toHaveLength(1);
});

it("returns an empty option for an unknown channel", async () => {
  expect(await actor.getChannel(9999n)).toEqual([]);
  expect(await actor.getChannelDetail(9999n)).toEqual([]);
});

it("orders category listings by the requested sort", async () => {
  const byName = await actor.listChannelsByCategory(
    { sports: null },
    { name: null },
  );
  const names = byName.map((channel) => channel.name);
  expect(names).toEqual([...names].sort());

  const byPopularity = await actor.listChannelsByCategory(
    { sports: null },
    { popularity: null },
  );
  const popularity = byPopularity.map((channel) => channel.popularity);
  expect(popularity).toEqual([...popularity].sort((a, b) => Number(b - a)));
});

it("round-trips a favorite through the real canister", async () => {
  // Favorites are keyed by caller, so this must call as a signed-in principal.
  actor.setIdentity(createIdentity("favorites-round-trip"));

  await actor.addFavorite(5n);
  const favorites = await actor.listFavorites();
  expect(favorites.map((channel) => channel.id)).toContain(5n);

  await actor.removeFavorite(5n);
  const after = await actor.listFavorites();
  expect(after.map((channel) => channel.id)).not.toContain(5n);
});

it("keeps one caller's favorites private from another", async () => {
  const alice = createIdentity("alice");
  const bob = createIdentity("bob");

  actor.setIdentity(alice);
  await actor.addFavorite(7n);

  actor.setIdentity(bob);
  expect(await actor.listFavorites()).toEqual([]);

  actor.setIdentity(alice);
  expect((await actor.listFavorites()).map((channel) => channel.id)).toContain(
    7n,
  );
});

it("rejects an anonymous caller from reading or writing favorites", async () => {
  // A freshly created actor calls as the anonymous principal until an identity
  // is set.
  const guest = pic!.createActor<_SERVICE>(idlFactory, canisterId);
  await expect(guest.listFavorites()).rejects.toThrow();
  await expect(guest.addFavorite(1n)).rejects.toThrow();
});

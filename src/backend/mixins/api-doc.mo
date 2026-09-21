/// Static, human-readable documentation of the public backend API.
///
/// The document is a compile-time constant: it reads no actor state and is
/// served as a plain `query`, so it is safe to call at any time, including
/// before any other endpoint has been used.
mixin () {
  /// Return the backend API documentation as Markdown.
  public query func getApiDoc() : async Text {
    "# IPTV Backend API\n" #
    "\n" #
    "Backend for an IPTV / live-TV channel browsing experience. It serves a bundled\n" #
    "sample channel catalog, a bundled sample program schedule, and per-user\n" #
    "favorite channels.\n" #
    "\n" #
    "## Data model\n" #
    "\n" #
    "- **Channel** — `{ id : Nat; name : Text; category : Category; logoUrl : Text;\n" #
    "  description : Text; streamUrl : Text; popularity : Nat; isLive : Bool }`\n" #
    "- **Program** — `{ id : Nat; channelId : Nat; title : Text; description : Text;\n" #
    "  startTime : Int; endTime : Int }`\n" #
    "- **Category** — variant: `#news`, `#sports`, `#movies`, `#kids`, `#music`,\n" #
    "  `#documentary`\n" #
    "- **ChannelSort** — variant: `#name`, `#popularity`\n" #
    "- **ChannelDetail** — `{ channel : Channel; nowPlaying : ?Program; upNext : ?Program }`\n" #
    "\n" #
    "## Units and encodings\n" #
    "\n" #
    "- `startTime` and `endTime` are **nanoseconds since the Unix epoch** (`Int`),\n" #
    "  the same unit as `Time.now()` on the Internet Computer. They are not\n" #
    "  milliseconds or seconds.\n" #
    "- `id` and `channelId` are `Nat` identifiers. `channelId` on a `Program` refers\n" #
    "  to a `Channel.id`.\n" #
    "- `popularity` is an arbitrary non-negative ranking score; higher means more\n" #
    "  popular. It is not a viewer count.\n" #
    "- `logoUrl` and `streamUrl` are `Text` URLs.\n" #
    "- Optional values (`?Program`) are returned as `null` when absent.\n" #
    "- `Category` and `ChannelSort` cross the API boundary as Candid variants.\n" #
    "\n" #
    "## Bundled sample content\n" #
    "\n" #
    "The channel catalog and the program schedule are **bundled sample content**\n" #
    "seeded at canister initialization. They are not fetched from an external IPTV\n" #
    "provider and are not updated by any endpoint.\n" #
    "\n" #
    "- Every `streamUrl` is a **placeholder** (`https://sample-streams.example.com/...`).\n" #
    "  It does not resolve to a real stream and cannot be played. Real live stream\n" #
    "  playback from an external IPTV provider is out of scope for this backend.\n" #
    "- The program schedule is likewise sample data, not a real EPG feed. Program\n" #
    "  times are seeded relative to a fixed base instant, so \"now playing\" and\n" #
    "  \"up next\" are illustrative rather than tied to the current wall clock.\n" #
    "\n" #
    "## Authentication and authorization\n" #
    "\n" #
    "- `listChannels`, `getChannel`, `listChannelsByCategory`, `listPrograms`,\n" #
    "  `getChannelDetail`, and `getApiDoc` are **public queries**. They require no\n" #
    "  sign-in and are readable by anonymous callers.\n" #
    "- `addFavorite`, `removeFavorite`, and `listFavorites` require a **signed-in\n" #
    "  (non-anonymous) caller**. An anonymous caller receives a trap with the\n" #
    "  message `Authentication required: sign in to manage favorites` (for the two\n" #
    "  mutations) or `Authentication required: sign in to view favorites` (for the\n" #
    "  listing).\n" #
    "- Favorites are keyed by the **caller principal**. Each principal sees and\n" #
    "  mutates only its own favorites; there is no endpoint that reads another\n" #
    "  principal's favorites.\n" #
    "\n" #
    "### Identity derivation\n" #
    "\n" #
    "The frontend pins an Internet Identity derivation origin, published at\n" #
    "`/.well-known/ii-derivation-origin` when available. An agent that already holds\n" #
    "the user's Internet Identity authorization derives the correct per-app\n" #
    "principal against that origin (for example\n" #
    "`icp identity link web <name> --app <host>`). Such a delegation acts with the\n" #
    "user's full authority in this app until it expires.\n" #
    "\n" #
    "A principal derived against a different origin is a **different principal** and\n" #
    "therefore has a different, empty favorites list.\n" #
    "\n" #
    "## Lifecycle and polling\n" #
    "\n" #
    "- The catalog and schedule are static after initialization; there is no\n" #
    "  background job, no ingestion, and no state transition to poll for.\n" #
    "- `getChannelDetail` computes `nowPlaying` / `upNext` from the current time on\n" #
    "  each call. Because the seeded schedule is sample data, these fields may be\n" #
    "  `null` depending on the current clock. Polling is not required; call it when\n" #
    "  the UI needs a fresh view.\n" #
    "- `listFavorites` reflects the caller's current favorites immediately after a\n" #
    "  successful `addFavorite` / `removeFavorite`.\n" #
    "\n" #
    "## Mutation retry safety\n" #
    "\n" #
    "- `addFavorite(channelId)` is **idempotent**: adding a channel that is already\n" #
    "  a favorite is a no-op, so retrying a call that may have succeeded is safe.\n" #
    "- `removeFavorite(channelId)` is **idempotent**: removing a channel that is not\n" #
    "  a favorite is a no-op.\n" #
    "- Neither mutation validates that `channelId` exists in the catalog. Adding an\n" #
    "  unknown id stores it, but `listFavorites` filters to channels that exist, so\n" #
    "  such an entry is simply not returned.\n" #
    "- Both mutations are destructive only in the sense that `removeFavorite`\n" #
    "  deletes one entry from the caller's own list. No endpoint deletes catalog or\n" #
    "  schedule data.\n" #
    "\n" #
    "## Errors and limits\n" #
    "\n" #
    "- Anonymous callers on favorites endpoints get the traps listed above.\n" #
    "- There is no pagination: `listChannels`, `listChannelsByCategory`,\n" #
    "  `listPrograms`, and `listFavorites` return complete arrays. The bundled\n" #
    "  catalog is small (24 channels, 2 programs each), so this is not a practical\n" #
    "  limit.\n" #
    "- `getChannel(id)` and `getChannelDetail(id)` return `null` for an unknown id\n" #
    "  rather than trapping.\n" #
    "\n" #
    "## Queryable data (OQL)\n" #
    "\n" #
    "The catalog and schedule are exposed to the Caffeine Data Intelligence agent\n" #
    "through the Object Query Layer:\n" #
    "\n" #
    "- `channel` — public entity over the channel catalog.\n" #
    "- `program` — public entity over the program schedule, with `channelId` as an\n" #
    "  edge to `channel`.\n" #
    "\n" #
    "Favorites are **not** exposed through OQL. They are per-user data keyed by the\n" #
    "caller principal, and the OQL entity model cannot express a per-caller scope\n" #
    "over a `Map<Principal, List<Nat>>` without risking cross-user reads, so they are\n" #
    "deliberately left out of the exposed entity set. Favorites remain reachable\n" #
    "only through the authenticated `listFavorites` endpoint, which is scoped to the\n" #
    "caller.\n";
  };
};

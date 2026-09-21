import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Cell {
    value: Value;
    name: string;
}
export interface Channel {
    id: ChannelId;
    name: string;
    description: string;
    isLive: boolean;
    logoUrl: string;
    category: Category;
    streamUrl: string;
    popularity: bigint;
}
export interface ChannelDetail {
    nowPlaying?: Program;
    upNext?: Program;
    channel: Channel;
}
export type ChannelId = bigint;
export type Error_ = {
    __kind__: "FrontendOriginsNotConfigured";
    FrontendOriginsNotConfigured: null;
} | {
    __kind__: "MixedSsoSources";
    MixedSsoSources: {
        otherKeys: Array<string>;
        ssoKeys: Array<string>;
    };
} | {
    __kind__: "Stale";
    Stale: {
        ageNs: bigint;
    };
} | {
    __kind__: "MalformedCandid";
    MalformedCandid: null;
} | {
    __kind__: "AmbiguousAttribute";
    AmbiguousAttribute: {
        field: string;
        sources: Array<string>;
    };
} | {
    __kind__: "NoAttributes";
    NoAttributes: null;
} | {
    __kind__: "UnknownNonce";
    UnknownNonce: null;
} | {
    __kind__: "UntrustedSsoSource";
    UntrustedSsoSource: {
        domain: string;
    };
} | {
    __kind__: "MissingField";
    MissingField: string;
} | {
    __kind__: "FrontendOriginMismatch";
    FrontendOriginMismatch: {
        got: string;
        expected: Array<string>;
    };
};
export interface Program {
    id: ProgramId;
    startTime: Timestamp;
    title: string;
    channelId: ChannelId;
    endTime: Timestamp;
    description: string;
}
export type ProgramId = bigint;
export interface Result {
    hasMore: boolean;
    rows: Array<Array<Cell>>;
}
export type Result__1 = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: Error_;
};
export type Timestamp = bigint;
export type Value = {
    __kind__: "int";
    int: bigint;
} | {
    __kind__: "nat";
    nat: bigint;
} | {
    __kind__: "float";
    float: number;
} | {
    __kind__: "bool";
    bool: boolean;
} | {
    __kind__: "null";
    null: null;
} | {
    __kind__: "text";
    text: string;
};
export enum Category {
    music = "music",
    documentary = "documentary",
    kids = "kids",
    news = "news",
    sports = "sports",
    movies = "movies"
}
export enum ChannelSort {
    name = "name",
    popularity = "popularity"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    /**
     * / Add a channel to the caller's favorites. Requires a signed-in caller.
     */
    addFavorite(channelId: ChannelId): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    execute(qJson: string): Promise<Result>;
    /**
     * / Return the backend API documentation as Markdown.
     */
    getApiDoc(): Promise<string>;
    getCallerUserRole(): Promise<UserRole>;
    /**
     * / Get a single channel by id.
     */
    getChannel(id: ChannelId): Promise<Channel | null>;
    /**
     * / Get a channel with its now-playing and up-next programs.
     */
    getChannelDetail(id: ChannelId): Promise<ChannelDetail | null>;
    isCallerAdmin(): Promise<boolean>;
    /**
     * / List every channel in the catalog.
     */
    listChannels(): Promise<Array<Channel>>;
    /**
     * / List channels in a category, ordered by the given sort.
     */
    listChannelsByCategory(category: Category, sort: ChannelSort): Promise<Array<Channel>>;
    /**
     * / List the caller's favorite channels. Requires a signed-in caller.
     */
    listFavorites(): Promise<Array<Channel>>;
    /**
     * / List the programs scheduled on a channel.
     */
    listPrograms(channelId: ChannelId): Promise<Array<Program>>;
    /**
     * / Remove a channel from the caller's favorites. Requires a signed-in caller.
     */
    removeFavorite(channelId: ChannelId): Promise<void>;
    schema(): Promise<string>;
}

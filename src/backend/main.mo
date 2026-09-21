import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";

import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import Expose "mo:caffeineai-oql/Expose";
import MapEntity "mo:caffeineai-oql/MapEntity";
import Entity "mo:caffeineai-oql/Entity";
import NatValue "mo:caffeineai-oql/NatValue";
import IntValue "mo:caffeineai-oql/IntValue";
import TextValue "mo:caffeineai-oql/TextValue";
import BoolValue "mo:caffeineai-oql/BoolValue";

import Common "types/common";
import IptvTypes "types/iptv";
import IptvApi "mixins/iptv-api";
import FavoritesApi "mixins/favorites-api";
import ApiDocMixin "mixins/api-doc";

actor {
  let accessControlState : AccessControl.AccessControlState;

  // Channel catalog, keyed by channel id.
  let channels : Map.Map<Common.ChannelId, IptvTypes.Channel>;
  // Programs, keyed by program id.
  let programs : Map.Map<Common.ProgramId, IptvTypes.Program>;
  // Per-user favorite channel ids, keyed by the caller's principal.
  let favorites : Map.Map<Principal.Principal, List.List<Common.ChannelId>>;

  // Renders a channel category as a stable text column for OQL.
  func categoryToText(category : Common.Category) : Text {
    switch (category) {
      case (#news) { "news" };
      case (#sports) { "sports" };
      case (#movies) { "movies" };
      case (#kids) { "kids" };
      case (#music) { "music" };
      case (#documentary) { "documentary" };
    };
  };

  include MixinAuthorization(accessControlState, null);
  include IptvApi(channels, programs);
  include FavoritesApi(favorites, channels);
  include ApiDocMixin();

  include Expose({
    entities = [
      channels.toEntityManual("channel", "Channel", "id")
        .payload("id", func c = c.id)
        .payload("name", func c = c.name)
        .payload("category", func c = categoryToText(c.category))
        .payload("logoUrl", func c = c.logoUrl)
        .payload("description", func c = c.description)
        .payload("streamUrl", func c = c.streamUrl)
        .payload("popularity", func c = c.popularity)
        .payload("isLive", func c = c.isLive)
        .sample({
          id = 0;
          name = "";
          category = #news;
          logoUrl = "";
          description = "";
          streamUrl = "";
          popularity = 0;
          isLive = false;
        })
        .public_()
        .build(),
      programs.toEntityManual("program", "Program", "id")
        .payload("id", func p = p.id)
        .payload("channelId", func p = p.channelId)
        .payload("title", func p = p.title)
        .payload("description", func p = p.description)
        .payload("startTime", func p : Int = p.startTime)
        .payload("endTime", func p : Int = p.endTime)
        .sample({
          id = 0;
          channelId = 0;
          title = "";
          description = "";
          startTime = 0;
          endTime = 0;
        })
        .edge("channelId", "channel")
        .public_()
        .build(),
    ];
  });
};

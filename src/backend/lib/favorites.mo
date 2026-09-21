import List "mo:core/List";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Types "../types/iptv";

module {
  /// Add a channel to the caller's favorites.
  public func addFavorite(
    favorites : Map.Map<Principal.Principal, List.List<Types.ChannelId>>,
    caller : Principal.Principal,
    channelId : Types.ChannelId,
  ) : () {
    let list = switch (favorites.get(caller)) {
      case (?existing) { existing };
      case null {
        let fresh = List.empty<Types.ChannelId>();
        favorites.add(caller, fresh);
        fresh;
      };
    };
    if (not list.contains(channelId)) {
      list.add(channelId);
    };
  };

  /// Remove a channel from the caller's favorites.
  public func removeFavorite(
    favorites : Map.Map<Principal.Principal, List.List<Types.ChannelId>>,
    caller : Principal.Principal,
    channelId : Types.ChannelId,
  ) : () {
    switch (favorites.get(caller)) {
      case null {};
      case (?list) {
        let kept = list.toArray().filter(func id = id != channelId);
        list.clear();
        for (id in kept.values()) {
          list.add(id);
        };
      };
    };
  };

  /// Return the caller's favorite channels.
  public func listFavorites(
    favorites : Map.Map<Principal.Principal, List.List<Types.ChannelId>>,
    channels : Map.Map<Types.ChannelId, Types.Channel>,
    caller : Principal.Principal,
  ) : [Types.Channel] {
    switch (favorites.get(caller)) {
      case null { [] };
      case (?list) {
        list.toArray().filterMap(func id = channels.get(id));
      };
    };
  };
};

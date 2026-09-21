import List "mo:core/List";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Types "../types/iptv";
import FavoritesLib "../lib/favorites";

mixin (
  favorites : Map.Map<Principal.Principal, List.List<Types.ChannelId>>,
  channels : Map.Map<Types.ChannelId, Types.Channel>,
) {
  /// Add a channel to the caller's favorites. Requires a signed-in caller.
  public shared ({ caller }) func addFavorite(channelId : Types.ChannelId) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Authentication required: sign in to manage favorites");
    };
    FavoritesLib.addFavorite(favorites, caller, channelId);
  };

  /// Remove a channel from the caller's favorites. Requires a signed-in caller.
  public shared ({ caller }) func removeFavorite(channelId : Types.ChannelId) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Authentication required: sign in to manage favorites");
    };
    FavoritesLib.removeFavorite(favorites, caller, channelId);
  };

  /// List the caller's favorite channels. Requires a signed-in caller.
  public query ({ caller }) func listFavorites() : async [Types.Channel] {
    if (caller.isAnonymous()) {
      Runtime.trap("Authentication required: sign in to view favorites");
    };
    FavoritesLib.listFavorites(favorites, channels, caller);
  };
};

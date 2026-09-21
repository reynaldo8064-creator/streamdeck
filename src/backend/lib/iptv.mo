import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Types "../types/iptv";

module {
  /// Return every channel in the catalog.
  public func listChannels(channels : Map.Map<Types.ChannelId, Types.Channel>) : [Types.Channel] {
    channels.values().toArray();
  };

  /// Return a single channel by id.
  public func getChannel(channels : Map.Map<Types.ChannelId, Types.Channel>, id : Types.ChannelId) : ?Types.Channel {
    channels.get(id);
  };

  /// Return channels in a category, ordered by the given sort.
  public func listChannelsByCategory(
    channels : Map.Map<Types.ChannelId, Types.Channel>,
    category : Types.Category,
    sort : Types.ChannelSort,
  ) : [Types.Channel] {
    let matching = channels.values().filter(func c = c.category == category).toArray();
    switch (sort) {
      case (#name) {
        matching.sort(func(a, b) = compareText(a.name, b.name));
      };
      case (#popularity) {
        matching.sort(func(a, b) = Nat.compare(b.popularity, a.popularity));
      };
    };
  };

  /// Return the programs scheduled on a channel, ordered by start time.
  public func listPrograms(
    programs : Map.Map<Types.ProgramId, Types.Program>,
    channelId : Types.ChannelId,
  ) : [Types.Program] {
    programs.values()
      .filter(func p = p.channelId == channelId)
      .toArray()
      .sort(func(a, b) = Int.compare(a.startTime, b.startTime));
  };

  /// Return the now-playing and up-next programs for a channel.
  public func getChannelDetail(
    channels : Map.Map<Types.ChannelId, Types.Channel>,
    programs : Map.Map<Types.ProgramId, Types.Program>,
    id : Types.ChannelId,
  ) : ?Types.ChannelDetail {
    switch (channels.get(id)) {
      case null { null };
      case (?channel) {
        let scheduled = listPrograms(programs, id);
        let now = Time.now();
        let nowPlaying = scheduled.find(func p = p.startTime <= now and now < p.endTime);
        let upNext = scheduled.find(func p = now < p.startTime);
        ?{ channel; nowPlaying; upNext };
      };
    };
  };

  func compareText(a : Text, b : Text) : { #less; #equal; #greater } {
    if (a < b) { #less } else if (a > b) { #greater } else { #equal };
  };
};

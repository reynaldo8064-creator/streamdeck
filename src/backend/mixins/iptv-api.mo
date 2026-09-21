import Map "mo:core/Map";
import Types "../types/iptv";
import IptvLib "../lib/iptv";

mixin (
  channels : Map.Map<Types.ChannelId, Types.Channel>,
  programs : Map.Map<Types.ProgramId, Types.Program>,
) {
  /// List every channel in the catalog.
  public query func listChannels() : async [Types.Channel] {
    IptvLib.listChannels(channels);
  };

  /// Get a single channel by id.
  public query func getChannel(id : Types.ChannelId) : async ?Types.Channel {
    IptvLib.getChannel(channels, id);
  };

  /// List channels in a category, ordered by the given sort.
  public query func listChannelsByCategory(category : Types.Category, sort : Types.ChannelSort) : async [Types.Channel] {
    IptvLib.listChannelsByCategory(channels, category, sort);
  };

  /// List the programs scheduled on a channel.
  public query func listPrograms(channelId : Types.ChannelId) : async [Types.Program] {
    IptvLib.listPrograms(programs, channelId);
  };

  /// Get a channel with its now-playing and up-next programs.
  public query func getChannelDetail(id : Types.ChannelId) : async ?Types.ChannelDetail {
    IptvLib.getChannelDetail(channels, programs, id);
  };
};

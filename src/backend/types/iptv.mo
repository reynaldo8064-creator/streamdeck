import Common "common";

module {
  public type ChannelId = Common.ChannelId;
  public type ProgramId = Common.ProgramId;
  public type Timestamp = Common.Timestamp;
  public type Category = Common.Category;

  /// A live TV channel in the catalog.
  public type Channel = {
    id : ChannelId;
    name : Text;
    category : Category;
    logoUrl : Text;
    description : Text;
    streamUrl : Text;
    popularity : Nat;
    isLive : Bool;
  };

  /// A scheduled program on a channel.
  public type Program = {
    id : ProgramId;
    channelId : ChannelId;
    title : Text;
    description : Text;
    startTime : Timestamp;
    endTime : Timestamp;
  };

  /// A channel together with its now-playing and up-next programs.
  public type ChannelDetail = {
    channel : Channel;
    nowPlaying : ?Program;
    upNext : ?Program;
  };

  /// Sort order for channel listings.
  public type ChannelSort = {
    #name;
    #popularity;
  };
};

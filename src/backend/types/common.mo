module {
  /// Identifier for a channel in the catalog.
  public type ChannelId = Nat;

  /// Identifier for a program in the schedule.
  public type ProgramId = Nat;

  /// Wall-clock instant in nanoseconds since the Unix epoch.
  public type Timestamp = Int;

  /// Category a channel belongs to.
  public type Category = {
    #news;
    #sports;
    #movies;
    #kids;
    #music;
    #documentary;
  };
};

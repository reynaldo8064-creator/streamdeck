import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import AccessControl "mo:caffeineai-authorization/access-control";

module {
  type ChannelId = Nat;
  type ProgramId = Nat;
  type Timestamp = Int;

  type Category = {
    #news;
    #sports;
    #movies;
    #kids;
    #music;
    #documentary;
  };

  type Channel = {
    id : ChannelId;
    name : Text;
    category : Category;
    logoUrl : Text;
    description : Text;
    streamUrl : Text;
    popularity : Nat;
    isLive : Bool;
  };

  type Program = {
    id : ProgramId;
    channelId : ChannelId;
    title : Text;
    description : Text;
    startTime : Timestamp;
    endTime : Timestamp;
  };

  type NewActor = {
    accessControlState : AccessControl.AccessControlState;
    channels : Map.Map<ChannelId, Channel>;
    programs : Map.Map<ProgramId, Program>;
    favorites : Map.Map<Principal.Principal, List.List<ChannelId>>;
  };

  // One hour in nanoseconds.
  let hour : Timestamp = 3_600_000_000_000;

  func channel(
    id : ChannelId,
    name : Text,
    category : Category,
    logoUrl : Text,
    description : Text,
    streamUrl : Text,
    popularity : Nat,
    isLive : Bool,
  ) : Channel {
    { id; name; category; logoUrl; description; streamUrl; popularity; isLive };
  };

  // Sample catalog: 24 channels, four per category. Bundled sample content only.
  func seedChannels() : [Channel] {
    [
      // News
      channel(1, "Noticias 24", #news, "https://picsum.photos/seed/noticias24/200/200", "Cobertura de noticias internacionales las 24 horas.", "https://sample-streams.example.com/noticias24/index.m3u8", 95, true),
      channel(2, "Mundo Hoy", #news, "https://picsum.photos/seed/mundohoy/200/200", "Análisis de la actualidad mundial y reportajes especiales.", "https://sample-streams.example.com/mundohoy/index.m3u8", 88, true),
      channel(3, "Economía Global", #news, "https://picsum.photos/seed/economiaglobal/200/200", "Mercados, finanzas y tendencias económicas.", "https://sample-streams.example.com/economiaglobal/index.m3u8", 74, true),
      channel(4, "Deportes Noticias", #news, "https://picsum.photos/seed/deportesnoticias/200/200", "Resultados, fichajes y toda la actualidad deportiva.", "https://sample-streams.example.com/deportesnoticias/index.m3u8", 81, true),
      // Sports
      channel(5, "Fútbol Total", #sports, "https://picsum.photos/seed/futbolt/200/200", "Partidos en directo y programas de análisis futbolístico.", "https://sample-streams.example.com/futboltotal/index.m3u8", 98, true),
      channel(6, "Motor TV", #sports, "https://picsum.photos/seed/motortv/200/200", "Fórmula 1, MotoGP y competiciones de motor.", "https://sample-streams.example.com/motortv/index.m3u8", 86, true),
      channel(7, "Baloncesto Live", #sports, "https://picsum.photos/seed/baloncestolive/200/200", "Liga, Euroliga y NBA en directo.", "https://sample-streams.example.com/baloncestolive/index.m3u8", 79, true),
      channel(8, "Tenis y Más", #sports, "https://picsum.photos/seed/tenisymas/200/200", "Grand Slams, ATP y WTA con cobertura completa.", "https://sample-streams.example.com/tenisymas/index.m3u8", 72, true),
      // Movies
      channel(9, "Cine Estelar", #movies, "https://picsum.photos/seed/cineestelar/200/200", "Estrenos y grandes títulos del cine internacional.", "https://sample-streams.example.com/cineestelar/index.m3u8", 92, true),
      channel(10, "Clásicos de Oro", #movies, "https://picsum.photos/seed/clasicosdeoro/200/200", "Obras maestras del cine clásico restauradas.", "https://sample-streams.example.com/clasicosdeoro/index.m3u8", 68, true),
      channel(11, "Acción Sin Límite", #movies, "https://picsum.photos/seed/accionsinlimite/200/200", "Películas de acción, aventura y suspense.", "https://sample-streams.example.com/accionsinlimite/index.m3u8", 84, true),
      channel(12, "Cine Independiente", #movies, "https://picsum.photos/seed/cineindependiente/200/200", "Producciones independientes y cine de autor.", "https://sample-streams.example.com/cineindependiente/index.m3u8", 61, true),
      // Kids
      channel(13, "Mundo Infantil", #kids, "https://picsum.photos/seed/mundoinfantil/200/200", "Series animadas y programas para los más pequeños.", "https://sample-streams.example.com/mundoinfantil/index.m3u8", 90, true),
      channel(14, "Aventura Kids", #kids, "https://picsum.photos/seed/aventurakids/200/200", "Aventuras animadas y películas familiares.", "https://sample-streams.example.com/aventurakids/index.m3u8", 77, true),
      channel(15, "Aprende Jugando", #kids, "https://picsum.photos/seed/aprendejugando/200/200", "Contenido educativo y didáctico para niños.", "https://sample-streams.example.com/aprendejugando/index.m3u8", 70, true),
      channel(16, "Pequeños Genios", #kids, "https://picsum.photos/seed/pequenosgenios/200/200", "Ciencia, idiomas y juegos para mentes curiosas.", "https://sample-streams.example.com/pequenosgenios/index.m3u8", 65, true),
      // Music
      channel(17, "Éxitos Pop", #music, "https://picsum.photos/seed/exitospos/200/200", "Los grandes éxitos del pop actual.", "https://sample-streams.example.com/exitospos/index.m3u8", 89, true),
      channel(18, "Rock Clásico", #music, "https://picsum.photos/seed/rockclasico/200/200", "Los mejores clásicos del rock de todos los tiempos.", "https://sample-streams.example.com/rockclasico/index.m3u8", 83, true),
      channel(19, "Latino Total", #music, "https://picsum.photos/seed/latinototal/200/200", "Salsa, reggaetón, bachata y música latina.", "https://sample-streams.example.com/latinototal/index.m3u8", 91, true),
      channel(20, "Jazz & Soul", #music, "https://picsum.photos/seed/jazzsoul/200/200", "Jazz, soul y blues en sesiones ininterrumpidas.", "https://sample-streams.example.com/jazzsoul/index.m3u8", 58, true),
      // Documentary
      channel(21, "Naturaleza Viva", #documentary, "https://picsum.photos/seed/naturalezaviva/200/200", "Documentales de fauna, flora y ecosistemas.", "https://sample-streams.example.com/naturalezaviva/index.m3u8", 87, true),
      channel(22, "Historia y Civilizaciones", #documentary, "https://picsum.photos/seed/historiacivilizaciones/200/200", "Grandes civilizaciones y acontecimientos históricos.", "https://sample-streams.example.com/historiacivilizaciones/index.m3u8", 76, true),
      channel(23, "Ciencia y Tecnología", #documentary, "https://picsum.photos/seed/cienciatecnologia/200/200", "Descubrimientos científicos e innovación tecnológica.", "https://sample-streams.example.com/cienciatecnologia/index.m3u8", 80, true),
      channel(24, "Viajes por el Mundo", #documentary, "https://picsum.photos/seed/viajesporelmundo/200/200", "Rutas, culturas y destinos de todo el planeta.", "https://sample-streams.example.com/viajesporelmundo/index.m3u8", 69, true),
    ];
  };

  // Two programs per channel: one now-playing, one up-next.
  // Anchored to the migration-time clock so time-window queries
  // (startTime <= now < endTime) match at runtime.
  func seedPrograms() : [Program] {
    let channels = seedChannels();
    let now = Time.now();
    let result = List.empty<Program>();
    for (c in channels.values()) {
      let base = c.id * 100;
      result.add({
        id = base;
        channelId = c.id;
        title = "Programa en directo: " # c.name;
        description = "Emisión actual de " # c.name # ".";
        startTime = now - hour;
        endTime = now + hour;
      });
      result.add({
        id = base + 1;
        channelId = c.id;
        title = "A continuación en " # c.name;
        description = "Próximo programa de " # c.name # ".";
        startTime = now + hour;
        endTime = now + 2 * hour;
      });
    };
    result.toArray();
  };

  public func migration(_old : {}) : NewActor {
    let channels = Map.empty<ChannelId, Channel>();
    for (c in seedChannels().values()) {
      channels.add(c.id, c);
    };
    let programs = Map.empty<ProgramId, Program>();
    for (p in seedPrograms().values()) {
      programs.add(p.id, p);
    };
    {
      accessControlState = AccessControl.initState();
      channels;
      programs;
      favorites = Map.empty();
    };
  };
};

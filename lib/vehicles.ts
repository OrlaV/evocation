/* Vehicle make → models list for the resurrection-queue selector.
   Skewed to classics & youngtimers (Evocation's niche) but broad enough to
   cover most requests. Every model list ends with "Other / not sure" and the
   make list ends with "Other (not listed)" so the form is never a dead end.
   The free-text part/ref field still captures the exact part. */

export type Make = { make: string; models: string[] };

const OTHER_MODEL = "Other / not sure";

const RAW: Make[] = [
  { make: "Abarth", models: ["595", "695", "124 Spider", "500", "Punto", "Grande Punto"] },
  { make: "Alfa Romeo", models: ["Giulia", "Giulietta", "GT / GTV", "GTV6", "Spider (Duetto)", "Spider", "33", "75", "90", "145 / 146", "147", "155", "156", "159", "164", "166", "Alfasud", "Alfetta", "Brera", "MiTo", "Montreal", "SZ / RZ", "Stelvio", "Giulia (952)"] },
  { make: "Alpine", models: ["A110", "A310", "A610", "GTA", "A110 (modern)"] },
  { make: "Aston Martin", models: ["DB4", "DB5", "DB6", "DB7", "DB9", "DBS", "V8", "V8 Vantage", "Vantage", "Virage", "Lagonda", "Vanquish", "DB11", "Rapide"] },
  { make: "Audi", models: ["80", "90", "100", "200", "Coupé", "Quattro (Ur-Quattro)", "V8", "Cabriolet", "A1", "A2", "A3", "A4", "A5", "A6", "A8", "TT", "S2", "RS2", "S4", "RS4", "Q5", "Q7"] },
  { make: "Austin", models: ["Mini", "1100 / 1300", "Allegro", "Maxi", "Metro", "Princess", "A30 / A35", "A40", "Cambridge", "Healey 3000"] },
  { make: "Austin-Healey", models: ["100", "3000", "Sprite"] },
  { make: "Bentley", models: ["Continental", "Continental GT", "Mulsanne", "Turbo R", "Arnage", "Eight", "Brooklands", "Azure", "T1 / T2"] },
  { make: "BMW", models: ["1500 / 1600 / 1800 (Neue Klasse)", "02 Series (2002)", "3.0 CS / CSL (E9)", "3 Series (E21)", "3 Series (E30)", "3 Series (E36)", "3 Series (E46)", "3 Series (E90)", "5 Series (E12)", "5 Series (E28)", "5 Series (E34)", "5 Series (E39)", "5 Series (E60)", "6 Series (E24)", "7 Series (E23)", "7 Series (E32)", "7 Series (E38)", "8 Series (E31)", "Z1", "Z3", "Z4", "M3", "M5", "1 Series", "X3", "X5", "Isetta"] },
  { make: "Bugatti", models: ["EB110", "Veyron", "Chiron"] },
  { make: "Buick", models: ["Riviera", "Skylark", "Regal", "LeSabre", "Roadmaster", "Electra", "Grand National", "Century"] },
  { make: "Cadillac", models: ["Eldorado", "DeVille", "Seville", "Fleetwood", "CTS", "Escalade", "Series 62"] },
  { make: "Chevrolet", models: ["Corvette", "Camaro", "Bel Air", "Impala", "Chevelle", "Nova", "El Camino", "Malibu", "Monte Carlo", "C/K Pickup", "Blazer", "Corvair", "Caprice", "Suburban"] },
  { make: "Chrysler", models: ["300", "New Yorker", "Voyager", "PT Cruiser", "Sebring", "Crossfire", "Newport"] },
  { make: "Citroën", models: ["2CV", "DS", "ID", "CX", "GS / GSA", "SM", "BX", "XM", "Traction Avant", "Ami", "Dyane", "Méhari", "Visa", "AX", "ZX", "Xsara", "Xantia", "Saxo", "C2", "C3", "C4", "C5", "HY Van"] },
  { make: "Dacia", models: ["1300", "Sandero", "Duster", "Logan"] },
  { make: "Daimler", models: ["Sovereign", "Double Six", "DS420", "V8 250", "Majestic"] },
  { make: "Datsun", models: ["240Z", "260Z", "280Z", "510", "1200", "Fairlady", "Bluebird"] },
  { make: "De Tomaso", models: ["Pantera", "Mangusta", "Deauville", "Longchamp"] },
  { make: "Dodge", models: ["Charger", "Challenger", "Dart", "Viper", "Ram", "Coronet", "Super Bee"] },
  { make: "Ferrari", models: ["Dino 246", "246 GT", "308", "328", "348", "F355", "360", "F430", "458", "Testarossa", "512", "365 GTB/4 Daytona", "250", "275", "Mondial", "288 GTO", "F40", "F50", "550 Maranello", "575M", "599", "612", "California"] },
  { make: "Fiat", models: ["500", "126", "127", "128", "124", "124 Spider", "131", "X1/9", "Panda", "Uno", "Punto", "Tipo", "Bravo / Brava", "Coupé", "Barchetta", "Multipla", "Croma", "Dino", "850", "Cinquecento", "Seicento", "Stilo"] },
  { make: "Ford", models: ["Escort", "Cortina", "Capri", "Sierra", "Fiesta", "Focus", "Mondeo", "Granada", "Scorpio", "Orion", "Ka", "Puma", "RS200", "Anglia", "Consul", "Zephyr", "Mustang", "Thunderbird", "F-Series", "Bronco", "Falcon", "Galaxie", "Fairlane", "GT40", "Torino"] },
  { make: "Honda", models: ["Civic", "Accord", "Prelude", "CRX", "NSX", "S2000", "S800", "Integra", "Jazz", "Legend", "Beat", "CR-V", "Concerto"] },
  { make: "Hyundai", models: ["Pony", "Coupé", "Accent", "Elantra", "i30", "Sonata", "Lantra"] },
  { make: "Jaguar", models: ["E-Type", "XJ6", "XJ12", "XJ (XJ40)", "XJ (X300)", "XJS", "XK8 / XKR", "XK120", "XK140", "XK150", "Mk2", "S-Type", "X-Type", "F-Type", "Sovereign", "420", "Mk10"] },
  { make: "Jeep", models: ["CJ", "Wrangler", "Cherokee", "Grand Cherokee", "Wagoneer", "Comanche"] },
  { make: "Lada", models: ["Riva / 2107", "Niva", "Samara", "2101", "2105", "110"] },
  { make: "Lamborghini", models: ["Miura", "Countach", "Diablo", "Murciélago", "Gallardo", "Espada", "Jarama", "Jalpa", "Urraco", "Huracán", "Aventador"] },
  { make: "Lancia", models: ["Delta", "Delta HF Integrale", "Fulvia", "Beta", "Stratos", "Montecarlo", "Thema", "Kappa", "Y / Ypsilon", "Gamma", "Flavia", "Aurelia", "Prisma", "Dedra"] },
  { make: "Land Rover", models: ["Series I", "Series II", "Series III", "Defender", "Discovery", "Freelander", "Range Rover Classic", "Range Rover (P38)", "Range Rover (L322)", "Range Rover Sport", "Range Rover Evoque"] },
  { make: "Lexus", models: ["LS", "SC", "IS", "GS", "RX", "LFA", "LC"] },
  { make: "Lincoln", models: ["Continental", "Town Car", "Mark III", "Mark IV", "Mark V", "Navigator"] },
  { make: "Lotus", models: ["Elan", "Esprit", "Elise", "Exige", "Europa", "Eclat", "Excel", "Seven", "Evora", "Cortina"] },
  { make: "Maserati", models: ["Ghibli", "Bora", "Merak", "Quattroporte", "Biturbo", "3200 GT", "Spyder", "Coupé", "GranTurismo", "Khamsin", "Indy", "Mistral"] },
  { make: "Mazda", models: ["MX-5 / Miata", "RX-7", "RX-8", "323", "626", "MX-3", "MX-6", "Cosmo", "121", "6", "3", "Xedos"] },
  { make: "Mercedes-Benz", models: ["190 (W201)", "200–280 (W123)", "E-Class (W124)", "E-Class (W210)", "E-Class (W211)", "S-Class (W116)", "S-Class (W126)", "S-Class (W140)", "S-Class (W220)", "SL (W113 Pagoda)", "SL (R107)", "SL (R129)", "SL (R230)", "SLK", "C-Class (W202)", "C-Class (W203)", "CLK", "300SL", "G-Class", "600 (W100)", "/8 (W114/W115)", "Ponton", "A-Class", "CL", "ML"] },
  { make: "MG", models: ["MGB", "MGB GT", "MGA", "Midget", "MGF", "TD", "TF", "ZR", "ZS", "ZT", "RV8", "Magnette", "Montego"] },
  { make: "Mini", models: ["Classic Mini", "Cooper", "Cooper S", "Clubman", "Countryman", "One", "Hatch (R50/R53)", "Hatch (F56)"] },
  { make: "Mitsubishi", models: ["Lancer", "Lancer Evolution", "Pajero / Shogun", "Colt", "Galant", "3000GT / GTO", "Eclipse", "Starion", "Sapporo"] },
  { make: "Morgan", models: ["4/4", "Plus 4", "Plus 8", "Roadster", "Aero 8", "Plus Six"] },
  { make: "Nissan", models: ["Skyline", "GT-R", "300ZX", "350Z", "370Z", "Micra", "Primera", "Sunny", "Bluebird", "Patrol", "Silvia", "200SX", "Figaro", "Pulsar", "Qashqai"] },
  { make: "Oldsmobile", models: ["Cutlass", "442", "Delta 88", "Toronado", "Ninety-Eight"] },
  { make: "Opel", models: ["Manta", "Kadett", "Ascona", "Corsa", "Astra", "Vectra", "Omega", "Rekord", "Commodore", "GT", "Calibra", "Senator", "Monza", "Tigra", "Zafira"] },
  { make: "Peugeot", models: ["104", "106", "107", "204", "205", "206", "207", "208", "304", "305", "306", "307", "308", "309", "405", "406", "504", "505", "604", "605", "607", "RCZ", "504 Coupé"] },
  { make: "Plymouth", models: ["Barracuda", "Road Runner", "Fury", "Valiant", "GTX", "Duster"] },
  { make: "Pontiac", models: ["GTO", "Firebird / Trans Am", "Bonneville", "Grand Prix", "Le Mans", "Fiero"] },
  { make: "Porsche", models: ["356", "911 (classic)", "911 (964)", "911 (993)", "911 (996)", "911 (997)", "911 (991)", "912", "914", "924", "928", "944", "968", "Boxster (986)", "Boxster (987)", "Cayman", "Cayenne", "Panamera", "959", "Carrera GT", "Macan"] },
  { make: "Reliant", models: ["Scimitar", "Robin", "Regal", "Kitten", "Sabre"] },
  { make: "Renault", models: ["4", "4CV", "5", "8", "12", "16", "18", "21", "25", "Clio", "Mégane", "Espace", "Twingo", "Laguna", "Fuego", "Avantime", "Vel Satis", "Captur", "R5 Turbo", "Scénic", "Safrane"] },
  { make: "Rolls-Royce", models: ["Silver Shadow", "Silver Spirit", "Corniche", "Phantom", "Silver Cloud", "Camargue", "Silver Seraph", "Silver Spur"] },
  { make: "Rover", models: ["P4", "P5", "P6", "SD1", "200", "400", "600", "800", "25", "45", "75", "Metro", "Mini (Rover)"] },
  { make: "Saab", models: ["92", "96", "99", "900", "9000", "9-3", "9-5", "Sonett"] },
  { make: "SEAT", models: ["Ibiza", "Leon", "Toledo", "Córdoba", "Marbella", "Ronda", "600", "Arosa", "Alhambra"] },
  { make: "Škoda", models: ["Octavia", "Fabia", "Felicia", "Favorit", "105 / 120", "Rapid", "Superb", "Estelle", "Yeti"] },
  { make: "Subaru", models: ["Impreza", "Impreza WRX / STI", "Legacy", "Forester", "SVX", "BRZ", "Leone", "Justy"] },
  { make: "Sunbeam", models: ["Tiger", "Alpine", "Rapier", "Stiletto"] },
  { make: "Suzuki", models: ["Swift", "Jimny", "Vitara", "SJ410 / SJ413", "Cappuccino", "Samurai", "Ignis"] },
  { make: "Toyota", models: ["Corolla", "Celica", "Supra", "MR2", "Land Cruiser", "Hilux", "Starlet", "AE86", "2000GT", "Carina", "Camry", "Yaris", "MR-S", "Crown", "Previa"] },
  { make: "Triumph", models: ["Spitfire", "TR4", "TR5", "TR6", "TR7", "TR8", "Stag", "GT6", "Herald", "Dolomite", "2000", "2500", "Vitesse"] },
  { make: "TVR", models: ["Chimaera", "Griffith", "Cerbera", "Tuscan", "S Series", "Tasmin", "Sagaris", "Tamora"] },
  { make: "Vauxhall", models: ["Astra", "Corsa", "Cavalier", "Nova", "Viva", "Chevette", "Carlton", "Cresta", "VX220", "Firenza", "Magnum", "Victor"] },
  { make: "Volkswagen", models: ["Beetle", "Golf Mk1", "Golf Mk2", "Golf Mk3", "Golf Mk4", "Golf Mk5", "Golf Mk6", "Golf Mk7", "Polo", "Passat", "Scirocco", "Corrado", "Type 2 (Bus / Transporter)", "Karmann Ghia", "Type 3", "Jetta", "Lupo", "Vento", "Bora", "Sharan", "Touran", "Type 181", "Caddy"] },
  { make: "Volvo", models: ["Amazon (120)", "P1800", "140", "164", "240", "260", "340 / 360", "740 / 760", "850", "940 / 960", "V70", "C70", "S40", "PV544", "S60"] },
  { make: "Wartburg", models: ["353", "311"] },
];

export const VEHICLES: Make[] = RAW.map((m) => ({
  make: m.make,
  models: [...m.models, OTHER_MODEL],
})).concat([{ make: "Other (not listed)", models: [OTHER_MODEL] }]);

export const MAKES: string[] = VEHICLES.map((v) => v.make);

export function modelsForMake(make: string): string[] {
  return VEHICLES.find((v) => v.make === make)?.models ?? [];
}

/* ---------- canonical matching keys ----------
   Shared between products.fitment and queue_requests so a demand can be
   matched to a product regardless of casing/punctuation. Mirror of the
   SQL `vehicle_slug` function (supabase/schema.sql, Phase 2b). */

export const vehicleSlug = (s: string) =>
  s
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/** "Porsche", "928" -> "porsche|928" (empty if make or model missing) */
export const vehicleKey = (make: string, model: string) => {
  const mk = vehicleSlug(make ?? "");
  const md = vehicleSlug(model ?? "");
  return mk && md ? `${mk}|${md}` : "";
};

/** Snap a typed make to the canonical list spelling (case-insensitive). */
export function resolveMake(input: string): string {
  const s = (input ?? "").trim();
  if (!s) return "";
  return MAKES.find((m) => m.toLowerCase() === s.toLowerCase()) ?? s;
}

/** Snap a typed model to the canonical spelling for its make. */
export function resolveModel(make: string, input: string): string {
  const s = (input ?? "").trim();
  if (!s) return "";
  const models = modelsForMake(resolveMake(make));
  return models.find((m) => m.toLowerCase() === s.toLowerCase()) ?? s;
}

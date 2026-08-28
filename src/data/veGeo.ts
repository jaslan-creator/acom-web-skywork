// ARCHIVO GENERADO — no editar a mano.
//   railway run -s zentral-erp-sync -- .venv/bin/python scripts/gen_ve_cities.py --write
// Corte: 2026-08-28 04:17 UTC  ·  138 ciudades en 24 estados.
//
// Copia para el sitio público del catálogo `res.country.city` de Odoo. La escribe la MISMA corrida que
// genera `FMAPP/src/lib/veCities.ts`, así que las dos no pueden divergir salvo que alguien edite
// una a mano. Autocontenida porque `veStates.ts` vive en FMAPP y no se importa entre repos.
//
// Sirve para que la oficina edite Estado y Ciudad con la MISMA lista cerrada que el vendedor: hasta
// la Fase 4 de zonas el drawer de solicitudes los editaba como texto plano — o sea que la puerta se
// cerraba del lado del móvil y quedaba abierta del lado del escritorio.

export const VE_STATES = [
  "Amazonas",
  "Anzoátegui",
  "Apure",
  "Aragua",
  "Barinas",
  "Bolívar",
  "Carabobo",
  "Cojedes",
  "Delta Amacuro",
  "Distrito Capital",
  "Falcón",
  "Guárico",
  "La Guaira",
  "Lara",
  "Miranda",
  "Monagas",
  "Mérida",
  "Nueva Esparta",
  "Portuguesa",
  "Sucre",
  "Trujillo",
  "Táchira",
  "Yaracuy",
  "Zulia",
] as const;

export type VeState = (typeof VE_STATES)[number];

export const VE_CITIES: Record<VeState, readonly string[]> = {
  "Amazonas": ["Puerto Ayacucho"],
  "Anzoátegui": ["Anaco", "Barcelona", "El Tigre", "Guanta", "Lechería", "Pariaguán", "Puerto La Cruz", "Puerto Píritu", "San José de Guanipa"],
  "Apure": ["Achaguas", "Biruaca", "Guasdualito", "San Fernando de Apure"],
  "Aragua": ["Cagua", "El Limón", "La Victoria", "Maracay", "Palo Negro", "Turmero", "Villa de Cura"],
  "Barinas": ["Barinas", "Barinitas", "Santa Bárbara (Barinas)", "Socopó"],
  "Bolívar": ["Caicara del Orinoco", "Ciudad Bolívar", "Ciudad Guayana", "Puerto Ordaz", "San Félix", "Upata"],
  "Carabobo": ["Guacara", "Güigüe", "Los Guayos", "Mariara", "Morón", "Naguanagua", "Puerto Cabello", "San Diego", "San Joaquín", "Valencia"],
  "Cojedes": ["San Carlos", "Tinaquillo"],
  "Delta Amacuro": ["Tucupita"],
  "Distrito Capital": ["Caracas"],
  "Falcón": ["Bariro", "Churuguara", "Coro", "Dabajuro", "Mene de Mauroa", "Punta Cardón", "Punto Fijo", "Tucacas"],
  "Guárico": ["Altagracia de Orituco", "Calabozo", "San Juan de los Morros", "Valle de la Pascua", "Zaraza"],
  "La Guaira": ["Caraballeda", "Catia La Mar", "La Guaira", "Macuto", "Maiquetía", "Naiguatá"],
  "Lara": ["Barquisimeto", "Cabudare", "Carora", "El Tocuyo", "Quibor", "Siquisique"],
  "Miranda": ["Caracas", "Caucagua", "Charallave", "Cúa", "Guarenas", "Guatire", "Higuerote", "Los Teques", "Ocumare del Tuy", "Río Chico", "San Antonio de los Altos", "San Pedro de los Altos", "Santa Lucía", "Santa Teresa del Tuy"],
  "Monagas": ["Maturín", "Punta de Mata"],
  "Mérida": ["Ejido", "El Vigía", "Guayabones", "La Popita Nueva Bolivia", "Mérida", "Pueblo Llano", "Tabay", "Tovar", "Tucaní"],
  "Nueva Esparta": ["Juan Griego", "La Asunción", "Los Robles", "Pampatar", "Porlamar"],
  "Portuguesa": ["Acarigua", "Araure", "Guanare", "Guanarito", "Villa Bruzual"],
  "Sucre": ["Carúpano", "Cumanacoa", "Cumaná"],
  "Trujillo": ["Boconó", "Trujillo", "Valera"],
  "Táchira": ["Palmira", "San Cristóbal", "San Juan de Colón", "Táriba"],
  "Yaracuy": ["Chivacoa", "Nirgua", "San Felipe", "Yaritagua"],
  "Zulia": ["Bachaquero", "Cabimas", "Caja Seca", "Ciudad Ojeda", "El Caujaro", "El Mojan", "Las Piedras", "Los Puertos de Altagracia", "Machiques", "Maracaibo", "Mene Grande", "Perijá", "Pueblo Nuevo", "Punta Gorda", "San Carlos", "San Francisco", "Santa Bárbara del Zulia", "Tia Juana", "Villa del Rosario"],
};

/**
 * Las ciudades de un estado, ya ordenadas. Vacío si el estado no existe.
 *
 * 🚨 El `.trim()` no es cosmético: ver el gemelo en `FMAPP/src/lib/veCities.ts`. Acá muerde más,
 * porque de esta función cuelgan `GEO_OPTIONS` (la lista cerrada de la oficina) y
 * `esCiudadFueraDelCatalogo` (el aviso ámbar), y las dos se apagan con `[]` sin dar ningún error.
 */
export function citiesForState(state: string | null | undefined): readonly string[] {
  if (!state) return [];
  return VE_CITIES[state.trim() as VeState] ?? [];
}

// Fold: sin acentos, mayúsculas, solo A-Z0-9. Mismo texto que el de `FMAPP/src/lib/veCities.ts`,
// generado por la misma corrida — es UN normalizador, no dos.
function fold(s: string): string {
  return (s ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

/** La ciudad canónica de `state` que corresponde a `raw`, o null si no está en la lista. */
export function matchVeCity(raw: string, state: string): string | null {
  const f = fold(raw);
  if (f.length === 0) return null;
  return (VE_CITIES[state.trim() as VeState] ?? []).find((c) => fold(c) === f) ?? null;
}

/** `res.country.city.id` de cada ciudad, por estado. Misma corrida que `VE_CITIES`. */
export const VE_CITY_IDS: Record<VeState, Readonly<Record<string, number>>> = {
  "Amazonas": { "Puerto Ayacucho": 648 },
  "Anzoátegui": { "Anaco": 634, "Barcelona": 615, "El Tigre": 626, "Guanta": 671, "Lechería": 160, "Pariaguán": 673, "Puerto La Cruz": 51, "Puerto Píritu": 656, "San José de Guanipa": 666 },
  "Apure": { "Achaguas": 679, "Biruaca": 680, "Guasdualito": 647, "San Fernando de Apure": 628 },
  "Aragua": { "Cagua": 35, "El Limón": 657, "La Victoria": 632, "Maracay": 33, "Palo Negro": 637, "Turmero": 621, "Villa de Cura": 640 },
  "Barinas": { "Barinas": 613, "Barinitas": 712, "Santa Bárbara (Barinas)": 681, "Socopó": 658 },
  "Bolívar": { "Caicara del Orinoco": 678, "Ciudad Bolívar": 614, "Ciudad Guayana": 612, "Puerto Ordaz": 706, "San Félix": 705, "Upata": 662 },
  "Carabobo": { "Guacara": 47, "Güigüe": 633, "Los Guayos": 703, "Mariara": 639, "Morón": 672, "Naguanagua": 691, "Puerto Cabello": 629, "San Diego": 697, "San Joaquín": 675, "Valencia": 36 },
  "Cojedes": { "San Carlos": 638, "Tinaquillo": 655 },
  "Delta Amacuro": { "Tucupita": 665 },
  "Distrito Capital": { "Caracas": 34 },
  "Falcón": { "Bariro": 740, "Churuguara": 716, "Coro": 620, "Dabajuro": 742, "Mene de Mauroa": 744, "Punta Cardón": 728, "Punto Fijo": 616, "Tucacas": 731 },
  "Guárico": { "Altagracia de Orituco": 676, "Calabozo": 635, "San Juan de los Morros": 645, "Valle de la Pascua": 651, "Zaraza": 668 },
  "La Guaira": { "Caraballeda": 704, "Catia La Mar": 663, "La Guaira": 683, "Macuto": 689, "Maiquetía": 690, "Naiguatá": 692 },
  "Lara": { "Barquisimeto": 45, "Cabudare": 4, "Carora": 625, "El Tocuyo": 630, "Quibor": 636, "Siquisique": 670 },
  "Miranda": { "Caracas": 751, "Caucagua": 726, "Charallave": 649, "Cúa": 643, "Guarenas": 43, "Guatire": 618, "Higuerote": 687, "Los Teques": 46, "Ocumare del Tuy": 641, "Río Chico": 696, "San Antonio de los Altos": 677, "San Pedro de los Altos": 752, "Santa Lucía": 652, "Santa Teresa del Tuy": 699 },
  "Monagas": { "Maturín": 41, "Punta de Mata": 660 },
  "Mérida": { "Ejido": 661, "El Vigía": 162, "Guayabones": 686, "La Popita Nueva Bolivia": 50, "Mérida": 6, "Pueblo Llano": 695, "Tabay": 700, "Tovar": 717, "Tucaní": 701 },
  "Nueva Esparta": { "Juan Griego": 732, "La Asunción": 650, "Los Robles": 688, "Pampatar": 682, "Porlamar": 2 },
  "Portuguesa": { "Acarigua": 624, "Araure": 644, "Guanare": 622, "Guanarito": 724, "Villa Bruzual": 702 },
  "Sucre": { "Carúpano": 627, "Cumanacoa": 685, "Cumaná": 37 },
  "Trujillo": { "Boconó": 659, "Trujillo": 653, "Valera": 631 },
  "Táchira": { "Palmira": 693, "San Cristóbal": 167, "San Juan de Colón": 674, "Táriba": 646 },
  "Yaracuy": { "Chivacoa": 667, "Nirgua": 669, "San Felipe": 623, "Yaritagua": 642 },
  "Zulia": { "Bachaquero": 684, "Cabimas": 617, "Caja Seca": 52, "Ciudad Ojeda": 619, "El Caujaro": 730, "El Mojan": 746, "Las Piedras": 722, "Los Puertos de Altagracia": 727, "Machiques": 42, "Maracaibo": 49, "Mene Grande": 750, "Perijá": 694, "Pueblo Nuevo": 748, "Punta Gorda": 44, "San Carlos": 723, "San Francisco": 698, "Santa Bárbara del Zulia": 664, "Tia Juana": 738, "Villa del Rosario": 48 },
};

/**
 * El `res.country.city.id` de una ciudad, o `null` si no está en el catálogo.
 *
 * 🚨 `null` significa «no está en el catálogo», JAMÁS «no se sabe todavía» ni un id por defecto.
 */
export function veCityId(state: string | null | undefined, city: string | null | undefined): number | null {
  const canon = state && city ? matchVeCity(city, state) : null;
  if (canon === null) return null;
  return VE_CITY_IDS[state!.trim() as VeState]?.[canon] ?? null;
}

// ── Zonas de venta (mig 252) ────────────────────────────────────────────────────────────────
//
// El mapa Región → Zona → ciudades vive en `zentral-erp-sync/core/zone_map.py`, que es la FUENTE.
// Acá baja ya resuelto a **id de ciudad**, no a nombre, y ésa es la decisión que importa:
//
//   · el lado Python resuelve por nombre normalizado (sin acentos, minúsculas) porque escribe en
//     Odoo al CREAR el partner, cuando todavía no hay id que consultar;
//   · el lado TypeScript lee `Customer.geoCityId`, que ya es un id.
//
// Si acá se resolviera por nombre habría DOS normalizadores de acentos, uno por lenguaje, que es
// exactamente la segunda copia que este archivo generado existe para evitar. Con ids tampoco hay
// ambigüedad: `San Carlos` existe en Cojedes Y en Zulia, y son dos ids distintos.
//
// 🚨 `null` (id ausente de esta tabla) significa «no se sabe», JAMÁS una zona por defecto. Un
// cliente sin ciudad no puede caer en un cubo que después alguien lea como territorio real.

export const VE_REGIONS = [
  "Capital",
  "Central",
  "Centro Occidente",
  "Zuliana",
  "Andina",
  "Oriental",
  "Los Llanos",
  "Guayana",
  "Insular",
] as const;

export type VeRegion = (typeof VE_REGIONS)[number];

/** `res.country.city.id` → `[región, zona]`. Resuelto contra `core/zone_map.py` al generar. */
export const VE_CITY_ZONE: Record<number, readonly [VeRegion, string]> = {
  2: ["Insular", "Margarita"],
  4: ["Centro Occidente", "Barquisimeto-Cabudare"],
  6: ["Andina", "Mérida Metropolitana"],
  33: ["Central", "Maracay-Aragua Centro"],
  34: ["Capital", "Caracas"],
  35: ["Central", "Maracay-Aragua Centro"],
  36: ["Central", "Valencia Metropolitana"],
  37: ["Oriental", "Sucre"],
  41: ["Oriental", "Monagas-Delta"],
  42: ["Zuliana", "Perijá"],
  43: ["Capital", "Guarenas-Guatire"],
  44: ["Zuliana", "Maracaibo-San Francisco"],
  45: ["Centro Occidente", "Barquisimeto-Cabudare"],
  46: ["Capital", "Altos Mirandinos"],
  47: ["Central", "Carabobo Este"],
  48: ["Zuliana", "Perijá"],
  49: ["Zuliana", "Maracaibo-San Francisco"],
  50: ["Andina", "Vigía-Panamericana"],
  51: ["Oriental", "Barcelona-Lechería-PLC"],
  52: ["Andina", "Sur del Lago"],
  160: ["Oriental", "Barcelona-Lechería-PLC"],
  162: ["Andina", "Vigía-Panamericana"],
  167: ["Andina", "Táchira"],
  612: ["Guayana", "Ciudad Guayana"],
  613: ["Los Llanos", "Barinas"],
  614: ["Guayana", "Bolívar Interior"],
  615: ["Oriental", "Barcelona-Lechería-PLC"],
  616: ["Centro Occidente", "Falcón Costa"],
  617: ["Zuliana", "Costa Oriental del Lago"],
  618: ["Capital", "Guarenas-Guatire"],
  619: ["Zuliana", "Costa Oriental del Lago"],
  620: ["Centro Occidente", "Falcón Costa"],
  621: ["Central", "Maracay-Aragua Centro"],
  622: ["Centro Occidente", "Portuguesa"],
  623: ["Centro Occidente", "Yaracuy"],
  624: ["Centro Occidente", "Portuguesa"],
  625: ["Centro Occidente", "Lara Interior"],
  626: ["Oriental", "Anzoátegui Sur"],
  627: ["Oriental", "Sucre"],
  628: ["Los Llanos", "Apure"],
  629: ["Central", "Carabobo Costa"],
  630: ["Centro Occidente", "Lara Interior"],
  631: ["Andina", "Trujillo"],
  632: ["Central", "Aragua Este"],
  633: ["Central", "Carabobo Este"],
  634: ["Oriental", "Anzoátegui Sur"],
  635: ["Los Llanos", "Guárico"],
  636: ["Centro Occidente", "Lara Interior"],
  637: ["Central", "Maracay-Aragua Centro"],
  638: ["Central", "Cojedes"],
  639: ["Central", "Carabobo Este"],
  640: ["Central", "Aragua Este"],
  641: ["Capital", "Valles del Tuy"],
  642: ["Centro Occidente", "Yaracuy"],
  643: ["Capital", "Valles del Tuy"],
  644: ["Centro Occidente", "Portuguesa"],
  645: ["Los Llanos", "Guárico"],
  646: ["Andina", "Táchira"],
  647: ["Los Llanos", "Apure"],
  648: ["Guayana", "Bolívar Interior"],
  649: ["Capital", "Valles del Tuy"],
  650: ["Insular", "Margarita"],
  651: ["Los Llanos", "Guárico"],
  652: ["Capital", "Valles del Tuy"],
  653: ["Andina", "Trujillo"],
  655: ["Central", "Cojedes"],
  656: ["Oriental", "Barcelona-Lechería-PLC"],
  657: ["Central", "Maracay-Aragua Centro"],
  658: ["Los Llanos", "Barinas"],
  659: ["Andina", "Trujillo"],
  660: ["Oriental", "Monagas-Delta"],
  661: ["Andina", "Mérida Metropolitana"],
  662: ["Guayana", "Ciudad Guayana"],
  663: ["Capital", "Litoral Guaireño"],
  664: ["Andina", "Sur del Lago"],
  665: ["Oriental", "Monagas-Delta"],
  666: ["Oriental", "Anzoátegui Sur"],
  667: ["Centro Occidente", "Yaracuy"],
  668: ["Los Llanos", "Guárico"],
  669: ["Centro Occidente", "Yaracuy"],
  670: ["Centro Occidente", "Lara Interior"],
  671: ["Oriental", "Barcelona-Lechería-PLC"],
  672: ["Central", "Carabobo Costa"],
  673: ["Oriental", "Anzoátegui Sur"],
  674: ["Andina", "Táchira"],
  675: ["Central", "Carabobo Este"],
  676: ["Los Llanos", "Guárico"],
  677: ["Capital", "Altos Mirandinos"],
  678: ["Guayana", "Bolívar Interior"],
  679: ["Los Llanos", "Apure"],
  680: ["Los Llanos", "Apure"],
  681: ["Los Llanos", "Barinas"],
  682: ["Insular", "Margarita"],
  683: ["Capital", "Litoral Guaireño"],
  684: ["Zuliana", "Costa Oriental del Lago"],
  685: ["Oriental", "Sucre"],
  686: ["Andina", "Vigía-Panamericana"],
  687: ["Capital", "Barlovento"],
  688: ["Insular", "Margarita"],
  689: ["Capital", "Litoral Guaireño"],
  690: ["Capital", "Litoral Guaireño"],
  691: ["Central", "Valencia Metropolitana"],
  692: ["Capital", "Litoral Guaireño"],
  693: ["Andina", "Táchira"],
  694: ["Zuliana", "Perijá"],
  695: ["Andina", "Páramo"],
  696: ["Capital", "Barlovento"],
  697: ["Central", "Valencia Metropolitana"],
  698: ["Zuliana", "Maracaibo-San Francisco"],
  699: ["Capital", "Valles del Tuy"],
  700: ["Andina", "Mérida Metropolitana"],
  701: ["Andina", "Vigía-Panamericana"],
  702: ["Centro Occidente", "Portuguesa"],
  703: ["Central", "Valencia Metropolitana"],
  704: ["Capital", "Litoral Guaireño"],
  705: ["Guayana", "Ciudad Guayana"],
  706: ["Guayana", "Ciudad Guayana"],
  712: ["Los Llanos", "Barinas"],
  716: ["Centro Occidente", "Falcón Costa"],
  717: ["Andina", "Mocotíes"],
  722: ["Zuliana", "Maracaibo-San Francisco"],
  723: ["Andina", "Sur del Lago"],
  724: ["Centro Occidente", "Portuguesa"],
  726: ["Capital", "Barlovento"],
  727: ["Zuliana", "Zulia Norte-Guajira"],
  728: ["Centro Occidente", "Falcón Costa"],
  730: ["Zuliana", "Maracaibo-San Francisco"],
  731: ["Centro Occidente", "Falcón Costa"],
  732: ["Insular", "Margarita"],
  738: ["Zuliana", "Costa Oriental del Lago"],
  740: ["Centro Occidente", "Falcón Costa"],
  742: ["Centro Occidente", "Falcón Costa"],
  744: ["Centro Occidente", "Falcón Costa"],
  746: ["Zuliana", "Zulia Norte-Guajira"],
  748: ["Zuliana", "Maracaibo-San Francisco"],
  750: ["Zuliana", "Costa Oriental del Lago"],
  751: ["Capital", "Caracas"],
  752: ["Capital", "Altos Mirandinos"],
};

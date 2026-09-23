export type Bench = {
  id: number;
  code: string;
  area: string;
  landmark: string;
  accessibility: "Paved path" | "Packed path" | "Trail access";
  shade: "Full shade" | "Partial shade" | "Open sun";
  mapX: number;
  mapY: number;
};

const areas = [
  {
    name: "Van Cortlandt Lake",
    landmark: "Lake loop",
    access: "Paved path" as const,
    x: 38,
    y: 70,
    width: 21,
    height: 18,
  },
  {
    name: "Parade Ground",
    landmark: "South field",
    access: "Paved path" as const,
    x: 24,
    y: 56,
    width: 19,
    height: 17,
  },
  {
    name: "Old Croton Aqueduct",
    landmark: "Aqueduct trail",
    access: "Trail access" as const,
    x: 45,
    y: 39,
    width: 13,
    height: 29,
  },
  {
    name: "Vault Hill",
    landmark: "Memorial grove",
    access: "Packed path" as const,
    x: 25,
    y: 45,
    width: 18,
    height: 16,
  },
  {
    name: "Northwest Forest",
    landmark: "Putnam trail",
    access: "Trail access" as const,
    x: 25,
    y: 23,
    width: 20,
    height: 20,
  },
  {
    name: "Indian Field",
    landmark: "Indian Field courts",
    access: "Packed path" as const,
    x: 70,
    y: 38,
    width: 24,
    height: 18,
  },
];

const shades: Bench["shade"][] = ["Partial shade", "Full shade", "Open sun"];

export const benches: Bench[] = Array.from({ length: 500 }, (_, index) => {
  const id = index + 1;
  const area = areas[index % areas.length];
  const areaIndex = Math.floor(index / areas.length);
  const column = areaIndex % 10;
  const row = Math.floor(areaIndex / 10);
  const spreadX = (column / 9 - 0.5) * area.width + ((id % 3) - 1) * 0.35;
  const spreadY = (row / 8 - 0.5) * area.height + ((id % 4) - 1.5) * 0.25;
  return {
    id,
    code: `VCP-${String(id).padStart(3, "0")}`,
    area: area.name,
    landmark: area.landmark,
    accessibility: area.access,
    shade: shades[(id * 7) % shades.length],
    mapX: Math.max(8, Math.min(92, area.x + spreadX)),
    mapY: Math.max(8, Math.min(92, area.y + spreadY)),
  };
});

export const areaNames = areas.map((area) => area.name);

"use server";

import * as psgc from "@jobuntux/psgc";

export async function fetchPsgcRegions() {
  return (
    psgc.listRegions() as unknown as { regCode: string; regionName: string }[]
  ).map((r) => ({
    code: r.regCode,
    name: r.regionName,
  }));
}

export async function fetchPsgcProvinces(regionCode: string) {
  if (!regionCode) return [];
  const allProvinces = psgc.listProvinces() as unknown as {
    regCode: string;
    provCode: string;
    provName: string;
  }[];
  return allProvinces
    .filter((p) => p.regCode === regionCode)
    .map((p) => ({
      code: p.provCode,
      name: p.provName,
    }));
}

export async function fetchPsgcCities(territoryCode: string) {
  // territoryCode can be a province code OR a region code (for independent cities like NCR)
  if (!territoryCode) return [];

  const allCitiesMuns = psgc.listMuncities();
  return allCitiesMuns
    .filter(
      (c: { provCode?: string; regCode: string }) =>
        c.provCode === territoryCode || c.regCode === territoryCode,
    )
    .map((c: { munCityCode: string; munCityName: string }) => ({
      code: c.munCityCode,
      name: c.munCityName,
    }));
}

export async function fetchPsgcBarangays(cityMunCode: string) {
  if (!cityMunCode) return [];

  const allBarangays = psgc.listBarangays();
  return allBarangays
    .filter((b: { munCityCode: string }) => b.munCityCode === cityMunCode)
    .map((b: { brgyCode: string; brgyName: string }) => ({
      code: b.brgyCode,
      name: b.brgyName,
    }));
}

"use server";

import * as psgc from "@jobuntux/psgc";

export async function fetchPsgcRegions() {
  return psgc.listRegions().map((r: any) => ({
    code: r.regCode,
    name: r.regionName,
  }));
}

export async function fetchPsgcProvinces(regionCode: string) {
  if (!regionCode) return [];
  const allProvinces = psgc.listProvinces();
  return allProvinces
    .filter((p: any) => p.regCode === regionCode)
    .map((p: any) => ({
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
      (c: any) => c.provCode === territoryCode || c.regCode === territoryCode,
    )
    .map((c: any) => ({
      code: c.munCityCode,
      name: c.munCityName,
    }));
}

export async function fetchPsgcBarangays(cityMunCode: string) {
  if (!cityMunCode) return [];

  const allBarangays = psgc.listBarangays();
  return allBarangays
    .filter((b: any) => b.munCityCode === cityMunCode)
    .map((b: any) => ({
      code: b.brgyCode,
      name: b.brgyName,
    }));
}

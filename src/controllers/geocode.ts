"use server";

export const geoSearch = async ({search: incSearch, region = 'US'} : { search: string, region?: string }) => {
  const geocodeResponse = await fetch(
    `https://geocode.xyz/${encodeURIComponent(incSearch)}?region='${encodeURIComponent(region)}'&json=1`
  );
  const response = await geocodeResponse.json();
  const {latt, longt } = response;

  if (isNaN(latt) || isNaN(longt)) {
    return { error: 'Geocode for Location not Found' };
  }

  return response;
}

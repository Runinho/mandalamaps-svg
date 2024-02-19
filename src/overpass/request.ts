// request data from overpass api

import {TileId} from "@/app/map/tileId";

// hardcoded query for hermeskeiler platz
const INTERESTING_LAYERS = ["highway", "landuse", "railway", "waterway", "natural", "building", "aeroway", "leisure"]
const API_ENDPOINT = "https://overpass.kumi.systems/api/interpreter"

const TILE_CACHE: {[tileId: string]: any} = {}

function getQuery(tileId: TileId) {
  const lat1 = tileId.north();
  const lon1 = tileId.west();
  const lat2 = tileId.south();
  const lon2 = tileId.east();
  const query_main = INTERESTING_LAYERS.map((name) =>
    `way(${lat1}, ${lon1}, ${lat2}, ${lon2})[${name}~"."];relation(${lat1}, ${lon1}, ${lat2}, ${lon2})[${name}~"."];`)
    .join("\n")
  const query = "(" + query_main + "); (._;>;);out qt;"
  return query
}

export async function load_overpass_data(tileId: TileId) {
  const online = true;
  let data;
  if (online) {
    if(tileId.asString() in TILE_CACHE){
      console.log("using local cache for", tileId.asString());
      data = TILE_CACHE[tileId.asString()];
    } else {
      let cache = localStorage.getItem("tile:" + tileId.asString());
      if (cache === null) {
        const response = await fetch(API_ENDPOINT, {
          "body": "data=[out:json];" + getQuery(tileId),
          "cache": "default",
          "credentials": "omit",
          "headers": {
            "Accept": "*/*",
            "Accept-Language": "en-US,en;q=0.9",
            "Cache-Control": "no-cache",
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "Pragma": "no-cache",
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.3 Safari/605.1.15"
          },
          "method": "POST",
          "mode": "cors",
          "redirect": "follow",
          "referrer": "https://overpass-turbo.eu/",
          "referrerPolicy": "strict-origin-when-cross-origin"
        })


        data = await response.json();
        if (response.status == 200) {
          TILE_CACHE[tileId.asString()] = data
          try {
            console.log(`writing tile (${tileId.asString()}) to cache`)
            localStorage.setItem("tile:" + tileId.asString(), JSON.stringify(data))
          }
          catch (e) {
            console.log("Local Storage is full, could not save tile", tileId);
            // fires When localstorage gets full
            // you can handle error here or empty the local storage
          }
        }
      } else {
        // use the cached version.
        console.log(`using cached tile ${tileId.asString()}`)
        data = JSON.parse(cache);
      }
    }
  } else {
    //load data from json
    data = await import("./sample_data.json");
  }
  // the offset of the tile
  const offset = {"lat": tileId.north(), "lon": tileId.west()}
  return {"data": data, "offset": offset}
}

// request data from overpass api

const lat2= 34.00386371911543 // 52.65044048983067
const lon1= -118.49014433394541  // 4.799879969155261
const lat1= 33.997642386607474 // 52.64264576510959
const lon2= -118.47848681450714 // 4.813629252518223

// hardcoded query for hermeskeiler platz
const INTERESTING_LAYERS = ["highway", "landuse", "railway", "waterway", "natural", "building", "aeroway", "leisure"]
const QUERY_MAIN = INTERESTING_LAYERS.map((name) =>
    `way(${lat1}, ${lon1}, ${lat2}, ${lon2})[${name}~"."];relation(${lat1}, ${lon1}, ${lat2}, ${lon2})[${name}~"."];`)
        .join("\n")
const QUERY = "(" + QUERY_MAIN + "); (._;>;);out qt;"
const API_ENDPOINT = "https://overpass.kumi.systems/api/interpreter"
export async function load_overpass_data(){
    const online = false;
    let data;
    if(online) {
        const response = await fetch(API_ENDPOINT, {
            "body": "data=[out:json];"+QUERY,
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
    } else {
        //load data from json
        data = await import("./sample_data.json");
    }
    // the offset of the tile
    const offset = {"lat":lat1, "lon":lon1}
    return {"data":data, "offset":offset}
}

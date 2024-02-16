// request data from overpass api

// hardcoded query for hermeskeiler platz
const QUERY = "(\n" +
    "           way(lat1, long1, lat2, long2)[highway~\".\"];relation(lat1, long1, lat2, long2)[highway~\".\"];\n" +
    "way(lat1, long1, lat2, long2)[landuse~\".\"];relation(lat1, long1, lat2, long2)[landuse~\".\"];\n" +
    "way(lat1, long1, lat2, long2)[railway~\".\"];relation(lat1, long1, lat2, long2)[railway~\".\"];\n" +
    "way(lat1, long1, lat2, long2)[waterway~\".\"];relation(lat1, long1, lat2, long2)[waterway~\".\"];\n" +
    "way(lat1, long1, lat2, long2)[natural~\".\"];relation(lat1, long1, lat2, long2)[natural~\".\"];\n" +
    "way(lat1, long1, lat2, long2)[building~\".\"];relation(lat1, long1, lat2, long2)[building~\".\"];\n" +
    "way(lat1, long1, lat2, long2)[aeroway~\".\"];relation(lat1, long1, lat2, long2)[aeroway~\".\"];\n" +
    "way(lat1, long1, lat2, long2)[leisure~\".\"];relation(lat1, long1, lat2, long2)[leisure~\".\"]; \n" +
    "        );\n" +
    "        (._;>;);out qt;"
const API_ENDPOINT = "https://overpass.kumi.systems/api/interpreter"
export async function load_overpass_data(){
    const online = false;
    let data;
    if(online) {
        const response = await fetch(API_ENDPOINT, {
            "body": "data=[out:json];%2F*%0AThis+is+an+example+Overpass+query.%0ATry+it+out+by+pressing+the+Run+button+above!%0AYou+can+find+more+examples+with+the+Load+tool.%0A*%2F%0A(%0A+++++++++++way(lat1%2C+long1%2C+lat2%2C+long2)%5Bhighway~%22.%22%5D%3Brelation(lat1%2C+long1%2C+lat2%2C+long2)%5Bhighway~%22.%22%5D%3B%0Away(lat1%2C+long1%2C+lat2%2C+long2)%5Blanduse~%22.%22%5D%3Brelation(lat1%2C+long1%2C+lat2%2C+long2)%5Blanduse~%22.%22%5D%3B%0Away(lat1%2C+long1%2C+lat2%2C+long2)%5Brailway~%22.%22%5D%3Brelation(lat1%2C+long1%2C+lat2%2C+long2)%5Brailway~%22.%22%5D%3B%0Away(lat1%2C+long1%2C+lat2%2C+long2)%5Bwaterway~%22.%22%5D%3Brelation(lat1%2C+long1%2C+lat2%2C+long2)%5Bwaterway~%22.%22%5D%3B%0Away(lat1%2C+long1%2C+lat2%2C+long2)%5Bnatural~%22.%22%5D%3Brelation(lat1%2C+long1%2C+lat2%2C+long2)%5Bnatural~%22.%22%5D%3B%0Away(lat1%2C+long1%2C+lat2%2C+long2)%5Bbuilding~%22.%22%5D%3Brelation(lat1%2C+long1%2C+lat2%2C+long2)%5Bbuilding~%22.%22%5D%3B%0Away(lat1%2C+long1%2C+lat2%2C+long2)%5Baeroway~%22.%22%5D%3Brelation(lat1%2C+long1%2C+lat2%2C+long2)%5Baeroway~%22.%22%5D%3B%0Away(lat1%2C+long1%2C+lat2%2C+long2)%5Bleisure~%22.%22%5D%3Brelation(lat1%2C+long1%2C+lat2%2C+long2)%5Bleisure~%22.%22%5D%3B+%0A++++++++)%3B%0A++++++++(._%3B%3E%3B)%3Bout+qt%3B",
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
        // load data from json
        data = await import("./sample_data.json");
    }
    // the offset of the tile
    const offset = {"lat":lat1, "lon":long1}
    return {"data":data, "offset":offset}
}

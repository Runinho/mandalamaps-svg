import {MappedNode} from "@/app/map/mapData";

const MAP_WIDTH    = 40075017/5; // 5m is one pixel.
const MAP_HEIGHT   = MAP_WIDTH/2;

export function mercator(pos: {lat:number, lon:number}){
    // mecrator projection as defined here: https://en.wikipedia.org/wiki/Web_Mercator_projection#Formulas
    // the upper left corner is (0, 0) and the lower right corner is ( 2 zoom level − 1 {\displaystyle 2^{\text{zoom level}}-1}, 2 zoom level − 1 {\displaystyle 2^{\text{zoom level}}-1})

    //x &= \left\lfloor\frac{1}{2\pi} \cdot 2^{\text{zoom level}} \left(\pi + \lambda \right)\right\rfloor \text{ pixels}\\[5pt]
    //y &= \left\lfloor\frac{1}{2\pi} \cdot 2^{\text{zoom level}} \left(\pi - \ln \left[\tan \left(\frac{\pi}{4} + \frac{\varphi}{2} \right) \right]\right)\right\rfloor
    // implemented more closly like described here: https://stackoverflow.com/a/14457180
    // lets make this the number of tiles

    const lon = (MAP_WIDTH/360) * (180 + pos.lon) // x
    const latRad = pos.lat*(Math.PI/180);
    // (mapHeight/2)-(mapWidth*mercN/(2*PI));
    const mercN = Math.log(Math.tan((Math.PI/4) + (latRad/2)))
    const lat = (MAP_HEIGHT/2) - (MAP_WIDTH*mercN/(2*Math.PI));// y

    // update
    return new MappedNode(lat, lon);
}

export function mercator_inv(posPixel: {lat:number, lon:number}){
    // lat and lon are pixel coordinates
    const lon_coords = (posPixel.lon/ ((MAP_WIDTH/360))) - 180;
    const mercN = ((-(posPixel.lat - (MAP_HEIGHT/2)))/MAP_WIDTH)*(2*Math.PI);
    const latRad = (Math.atan(Math.exp(mercN)) - (Math.PI/4)) *2
    const lat = latRad/((Math.PI/180))

    return new MappedNode(lat, lon_coords)
}
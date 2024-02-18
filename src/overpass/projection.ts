import {MappedNode} from "@/app/mapData";

export function mercator(pos: {lat:number, lon:number}, zoomLevel:number){
    // mecrator projection as defined here: https://en.wikipedia.org/wiki/Web_Mercator_projection#Formulas
    // the upper left corner is (0, 0) and the lower right corner is ( 2 zoom level − 1 {\displaystyle 2^{\text{zoom level}}-1}, 2 zoom level − 1 {\displaystyle 2^{\text{zoom level}}-1})

    //x &= \left\lfloor\frac{1}{2\pi} \cdot 2^{\text{zoom level}} \left(\pi + \lambda \right)\right\rfloor \text{ pixels}\\[5pt]
    //y &= \left\lfloor\frac{1}{2\pi} \cdot 2^{\text{zoom level}} \left(\pi - \ln \left[\tan \left(\frac{\pi}{4} + \frac{\varphi}{2} \right) \right]\right)\right\rfloor
    const scaling = (1/(2 * Math.PI)) * Math.pow(2, zoomLevel)
    const lon = scaling * (Math.PI + pos.lon) // x
    const lat = scaling * (Math.PI - Math.log(Math.tan((Math.PI/4) + (pos.lat/2))))// y

    // update
    return new MappedNode(lat, lon);
}
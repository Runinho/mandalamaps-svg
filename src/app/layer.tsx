import {TaggedWays, Way, Ways} from "@/app/mapData";
import React, {FunctionComponent} from "react";
import {LayerStyle} from "@/app/layerStyle";

type PropsLayerLine = {
  way: Way,
}
const LayerLine: FunctionComponent<PropsLayerLine> = ({way}) => {
  return <polyline points={way.nodes.map((n) => n.lon + "," + n.lat).join(" ")}/>
}

type PropsLayerElements = {
  items: Way[],
}

export const LayerElements: FunctionComponent<PropsLayerElements> = ({items}) => {
  return <g>{items.map((way) => <LayerLine key={way.id} way={way}/>)}</g>
};

type PropsLayer = {
  items: Way[],
  layerStyle: LayerStyle,
}

export const Layer: FunctionComponent<PropsLayer> = ({items, layerStyle}) => {
  const fill = layerStyle.fill ? layerStyle.color : "none";


  return (<g stroke={layerStyle.stroke} strokeWidth={layerStyle.width} fill={fill}>
    <LayerElements items={items} />
  </g>);
}

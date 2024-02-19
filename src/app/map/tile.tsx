import {MappedNode, ResolvedWays, TagCountCounter, Way, Ways} from "@/app/map/mapData";
import {Layer} from "@/app/map/layer";
import React, {useEffect, useState} from "react";
import {string} from "prop-types";
import {LayerStyle} from "@/app/layerStyle";
import {TileId} from "@/app/map/tileId";
import {load_overpass_data} from "@/overpass/request";
import {Position, resolveRefs} from "@/app/map/resolveRefs";
import {mercator} from "@/overpass/projection";
import {MapConfig} from "@/app/config/MapConfig";

interface TileProps{
  //data: ResolvedWays | null, // TODO: move this from the page component down here! -> might need to pass the count up.
  layerStyles: {[id: string]:LayerStyle},
  tileId: TileId,
  updateTagCount: (tileId: TileId, counter: TagCountCounter) => void,
  origin: MappedNode,
  load: boolean, // wherever to load the tile.
  highlight: boolean,
  mapConfig: MapConfig,
}

export function Tile({tileId, layerStyles, updateTagCount, origin, load, highlight, mapConfig}: TileProps){
  const [data, setData] = useState<Ways | null>(null);
  const [isLoading, setLoading] = useState("init");

  const tileIdString = tileId.asString()
  useEffect(() => {
    if(load){
      //this should be cached in some way -> move in own provider class
      let ignore = false // https://github.com/facebook/react/issues/24502#issuecomment-1118867879

      setLoading("downloading data for tile" + tileIdString)
      const promise = load_overpass_data(tileId)
        .then((data) => {
          if(!ignore){
            setLoading("parsing data");
            const resolvedWays = resolveRefs(data, origin);
            setData(resolvedWays.ways);
            updateTagCount(tileId, resolvedWays.tagCounts)
            // TODO updat counts.
            setLoading("done");
          }
        });
      return () => { ignore = true }
    }
  }, [tileIdString, load]);

  // draw rect around region
  const polyline = [
    {lat: tileId.north(), lon: tileId.west()},
    {lat: tileId.north(), lon: tileId.east()},
    {lat: tileId.south(), lon: tileId.east()},
    {lat: tileId.south(), lon: tileId.west()},
    {lat: tileId.north(), lon: tileId.west()},
  ]
  const northWest = mercator(polyline[0]);

  const pixelCoords = polyline.map((p) => mercator(p).minus(origin))
  const c = load ? "#3ca0ee": "#f18926"
  const cHighlight = highlight ? "#FFF" : "none";
  const highlightElm =
    <g key="outlineHighlight" strokeWidth="0" fill={cHighlight}>
      <polyline points={pixelCoords.map((n) => n.lon + "," + n.lat).join(" ")}/>
    </g>
  const outline =
    <g key="outline" strokeWidth={mapConfig.gridWidth} stroke={c} fill="none">
      <polyline points={pixelCoords.map((n) => n.lon + "," + n.lat).join(" ")}/>
    </g>

  if(data != null){
    let layers: React.JSX.Element[] = []
    if(load){
      // render only if we should load? maybe always render idk.
      layers =  Object.keys(layerStyles).map((layerId) => {
        // TODO: move this extraction process into an effect. (or Tile Component)
        // TODO: fix ordering (now it is after insertion of the dict. Is this persistent enough??
        const style = layerStyles[layerId];
        // load the needed layers
        // we might want to check for duplicates in way (or is this handled by react when rendering LOL)
        let ways: Way[] = [];

        // for each tagKey gather the ones we need
        for (const tagKey of Object.keys(style.enabled)) {
          const currentTaggedWays = data[tagKey];
          const enableValues = style.enabled[tagKey];
          // can we skip it all
          if (enableValues !== false) {
            if (enableValues === true) {
              // have to render all the layers
              // sadly we have to gather the keys first and then we can get the entries.
              // (there is no value() function :'( like in python):
              // https://stackoverflow.com/a/11734558
              const allWays: Way[] = Object.keys(currentTaggedWays.ways).map((wayId) => currentTaggedWays.ways[wayId]);
              ways = ways.append(allWays);
            } else {
              // `enableValues` is a dict
              // render only for the keyValues that are present in enableValues
              for (const keyValue of enableValues) {
                for (const wayId of currentTaggedWays.tagValue2id.get(keyValue)) {
                  ways.push(currentTaggedWays.ways[wayId]);
                }
              }
            }
          }
        }
        // return <g key={layerId} className="Layer Test"></g>;
        return <Layer key={layerId} items={ways} layerStyle={style}/>;
      })
    }

    const maskId = `mask>${tileId.asString()}`
    const mask =
      <mask id={`mask>${tileId.asString()}`}>
        <polyline fill="white" points={pixelCoords.map((n) => n.lon + "," + n.lat).join(" ")}/>
      </mask>
    return <>
      {highlightElm}
      {/*mask*/}
      {mask}
      {/*layers*/}
      <g mask={`url(#${maskId})`}>
        {layers}
      </g>
      {/*outline*/}
      {outline}
    </>
  } else {
    const gray = "#e0e0e0"

    const onClickHandler = (e) => {
      console.log("click on tile ", tileId.asString());
      setLoad(() => true);
    }

    return <>
      {highlightElm}
      {outline}
      <g transform={`translate(${pixelCoords[0].lon},
                     ${(pixelCoords[0].lat + pixelCoords[3].lat)/2})`}
        font-size="8">
        {!load && <text>placeholder</text>}
        {load && <text>loading String: {isLoading}</text>}
      </g>
      </>
  }
}
'use client'
import styles from "./page.module.css";
import {useEffect, useState} from "react";
import {load_overpass_data} from "@/overpass/request";
import {LayerConfig} from "@/app/layerConfig";
import {Layer} from "@/app/layer";

interface Position {
  lat: number;
  lon: number;
}

function resolve_refs(data) {
  /*** convert the referenced nodes to lat, long Positions.
   data: raw json data from the overpass api.
   */

  // save the location of the node
  let node: { [code: number]: Position } = [];

  // save the waypoints we have to draw (with the mapped positions of the nodes)
  let ways = [];

  // projection properties
  const offset = data["offset"];
  const scale = 40000;

  // load config; and color stuff...
  //TODO: count apperances
  // Filter of tags
  //TODO: maybe the user should be able to adjust these
  const interesting_tags = ["highway", "landuse", "railway", "waterway", "natural", "building", "aeroway", "leisure"]
  // init ways
  for (const tag of interesting_tags) {
    ways[tag] = [];
  }

  for (const elm of data["data"]["elements"]) {
    if (elm["type"] === "node") {
      // might want to map coords here
      // might convert this to the coordstream we also need to render in svg?
      node[elm["id"]] = {
        "lat": (elm["lat"] - offset["lat"]) * scale,
        "lon": (elm["lon"] - offset["lon"]) * scale
      };
    }
    if (elm["type"] === "way") {
      if (elm["tags"]) {
        //TODO: filter after tag value
        const target_tags = interesting_tags.filter((tag) => !!elm["tags"][tag])
        const mapped_nodes = elm["nodes"].map(id => node[id]);
        const way = {"nodes": mapped_nodes, "tags": elm["tags"], "id": elm["id"]};
        for (const targetTag of target_tags) {
          ways[targetTag] = ways[targetTag].concat([way])
        }
      }
    }
  }
  console.log("ways", ways);
  return ways
}

export default function Home() {
  const [data, setData] = useState({})
  const [isLoading, setLoading] = useState("init")

  const [layerStyle, setLayerStyle] = useState({})

  useEffect(() => {
    setLoading("downloading data")
    load_overpass_data()
      .then((data) => {
        setLoading("parsing data");
        setData(resolve_refs(data));
        setLoading("done");
      })
  }, [])

  const getLayerStyle = (layerId: string) => {
    if(layerId in layerStyle){
      return layerStyle[layerId];
    } else {
      // default
      return {"fill": false, "color": "#000000", "stroke": "#070707", "width": "1",}
    }
  }

  const layerConfigs = Object.keys(data).map((layerId) => {
    const config = getLayerStyle(layerId);
    return <LayerConfig key={layerId} layerName={layerId} config={config} setConfig={(newStyleCb) => setLayerStyle((oldSyles) =>{
      let newStyles = {...oldSyles,}
      // get the latest style (use the default if empty)
      const oldStyle = layerId in oldSyles ? oldSyles[layerId] : getLayerStyle(layerId);
      newStyles[layerId] = newStyleCb(oldStyle);
      // console.log(newStyles);
      return newStyles
    })}/>;
  });

  return (
    <main className={styles.main}>
      <div className={styles.MapConfigurator}>
        <div className={styles.Map}>
          {isLoading !== "done" && <div>loading: {isLoading}</div>}
          <svg viewBox="0 0 500 500" id="emoji" xmlns="http://www.w3.org/2000/svg" fill="#000000" width="100%">
            <g transform="translate(0, 400) scale(1,-1)">
              {Object.keys(data).map((layerId) => {
                return <Layer key={layerId} items={data[layerId]} layerStyle={getLayerStyle(layerId)}/>;
              })}
            </g>
          </svg>
        </div>
        <div className={styles.MapStyleConfig}>
          {layerConfigs}
          test after lol
        </div>
      </div>
    </main>
  );
}

'use client'
import styles from "./page.module.css";
import {useEffect, useState} from "react";
import {load_overpass_data} from "@/overpass/request";
import {LayerConfig} from "@/app/layerConfig";
import {Layer} from "@/app/layer";
import {MappedNode, OSMElement, ResolvedWays, TagCount, TaggedWays, Way, Ways} from "@/app/mapData";
import {DefaultDict} from "@/app/defaultdict";
import {LayerStyle} from "@/app/layerStyle";

interface Position {
  lat: number;
  lon: number;
}

function resolve_refs(data: { data: {elements: OSMElement[]}; offset: { lon: number; lat: number } }): ResolvedWays {
  /*** convert the referenced nodes to lat, long Positions.
   data: raw json data from the overpass api.
   */

  // save the location of the node
  let node: { [code: number]: Position } = [];

  // save the waypoints we have to draw (with the mapped positions of the nodes)
  let ways: Ways = {};

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
    ways[tag] = new TaggedWays(tag);
  }
  let tagCount:TagCount = new DefaultDict(() => new DefaultDict<number>(() => 0));

  const elements: OSMElement[] =  data["data"]["elements"]
  for (const elm of elements) {
    if (elm["type"] === "node") {
      // might want to map coords here
      // might convert this to the coordstream we also need to render in svg?
      node[elm["id"]] = new MappedNode((elm["lat"] - offset["lat"]) * scale,
                                       (elm["lon"] - offset["lon"]) * scale);
    }
    if (elm["type"] === "way") {
      if (elm["tags"]) {
        //TODO: filter after tag value
        const target_tags = interesting_tags.filter((tag) => !!elm["tags"][tag])
        const mapped_nodes = elm["nodes"].map((id) => node[id]);
        const way = new Way(mapped_nodes, elm["tags"], elm["id"]);
        for (const targetTag of target_tags) {
          ways[targetTag].addWay(way);
          const tagKeyCounts = tagCount.get(targetTag);
          // increase value
          tagKeyCounts.set(way.tags[targetTag],
            tagKeyCounts.get(way.tags[targetTag]) + 1);
        }
      }
    }
  }
  console.log("ways", ways, tagCount);
  return new ResolvedWays(ways, tagCount);
}

export default function Home() {
  const [data, setData] = useState<ResolvedWays | null>(null)
  const [isLoading, setLoading] = useState("init")

  // array of the layers.
  const [layerStyles, setLayerStyles] = useState<{[id: string]:LayerStyle}>({})

  useEffect(() => {
    setLoading("downloading data")
    load_overpass_data()
      .then((data) => {
        setLoading("parsing data");
        setData(resolve_refs(data));
        setLoading("done");
      })
  }, [])

  const addLayer = () => {
    setLayerStyles( (oldLayer) => {
      const newStyle = new LayerStyle("new layer",
        false,
        "#000000",
        "#070707",
        1);
      // add new Layer into dict.
      let newLayer = {...oldLayer};
      newLayer[newStyle.id] = newStyle;
      return newLayer;
    });
  };

  let layerConfigs = [];
  if(data != null){
    //TODO: we want to use own layer thingy. stuff
    layerConfigs = Object.keys(layerStyles).map((layerId) => {
      const layer = layerStyles[layerId];
      return <LayerConfig
          key={layerId}
          layer={layer}
          tagCounts={data.tagCounts}
          setConfig={(newStyleCb) => setLayerStyles((oldSyles) => {
        let newStyles = {...oldSyles,};
        // get the latest style (use the default if empty)
        const oldStyle = oldSyles[layer.id];
        newStyles[layer.id] = newStyleCb(oldStyle);
        // console.log(newStyles);
        return newStyles;
      })}/>;
    });
  }

  console.log("layerStyled", layerStyles);

  return (
    <main className={styles.main}>
      <div className={styles.MapConfigurator}>
        <div className={styles.Map}>
          {isLoading !== "done" && <div>loading: {isLoading}</div>}
          <svg viewBox="0 0 500 500" id="emoji" xmlns="http://www.w3.org/2000/svg" fill="#000000" width="100%">
            {data != null &&
            <g transform="translate(0, 400) scale(1,-1)">
              {Object.keys(layerStyles).map((layerId) => {
                // TODO: fix ordering (now it is after insertion of the dict. Is this persistent enough??
                const style = layerStyles[layerId];
                // load the layers we need
                // we might want to check for duplicates in way (or is this handled by react when rendering LOL)
                let ways: Way = [];

                // for each tagKey gather the ones we need
                for (const tagKey of Object.keys(style.enabled)) {
                  const currentTaggedWays = data.ways[tagKey];
                  const enableValues = style.enabled[tagKey];
                  // can we skip it all
                  if (enableValues !== false){
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
                      for(const keyValue of enableValues){
                        for(const wayId of currentTaggedWays.tagValue2id.get(keyValue)){
                          ways.push(currentTaggedWays.ways[wayId]);
                        }
                      }
                    }
                  }
                }
                console.log(ways, "layerId", layerId);
                // return <g key={layerId} className="Layer Test"></g>;
                return <Layer key={layerId} items={ways} layerStyle={style}/>;
              })
            }
            </g>
            }
          </svg>
        </div>
        <div className={styles.MapStyleConfig}>
          {layerConfigs}
          <div>
            <button onClick={addLayer}>Add Layer</button>
          </div>
        </div>
      </div>
    </main>
  );
}

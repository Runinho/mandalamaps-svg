'use client'
import Image from "next/image";
import styles from "./page.module.css";
import {useEffect, useState} from "react";
import {load_overpass_data} from "@/overpass/request";

interface Position {
    lat: number;
    lon: number;
}

function resolve_refs(data){
    console.log("data:", data);
    // convert the referenced nodes to lat, long Positions.

    // save the location of the node
    let node:{ [code: number]: Position} = [];

    // save the waypoints we have to draw (with the mapped positions of the nodes)
    let ways =[];

    // projection properties
    const offset = data["offset"];
    const scale = 20000;

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
        if(elm["type"] === "node"){
            // might want to map coords here
            // might convert this to the coordstream we also need to render in svg?
            node[elm["id"]] = {"lat": (elm["lat"] - offset["lat"]) * scale,
                               "lon": (elm["lon"] - offset["lon"]) * scale};
        }
        if(elm["type"] === "way"){
            if (elm["tags"]){
                //TODO: filter after tag value
                const target_tags = interesting_tags.filter((tag) => !!elm["tags"][tag])
                const mapped_nodes = elm["nodes"].map(id => node[id]);
                const way = {"nodes": mapped_nodes, "tags":elm["tags"], "id":elm["id"]};
                for (const targetTag of target_tags) {
                    ways[targetTag] = ways[targetTag].concat([way])
                }
            }
        }
    }
    console.log("ways", ways);
    return ways
}

function Layer(props) {
    console.log(props)

    return  props.items.map((elm) => {
                    return <polyline key={elm["id"]}
                                     points={elm["nodes"].map((n) => n["lon"] + "," + n["lat"]).join(" ")}
                                     fill="none"
                    />
                }
            );
}

export default function Home() {
    const [data, setData] = useState([])
    const [isLoading, setLoading] = useState(true)

    useEffect(() => {
            load_overpass_data()
            .then((data) => {
                setLoading("parsing data");
                setData(resolve_refs(data));
                setLoading(false);
            })
    }, [])


  return (
    <main className={styles.main}>
      <div>
          loading: {isLoading} <br/>
          <svg viewBox="0 0 200 200" id="emoji" xmlns="http://www.w3.org/2000/svg" fill="#000000" width="100%">
              <g transform="scale(1,-1), translate(50,-100)" >
                  <g stroke="black" strokeWidth="1">
                      {Object.keys(data).map((layerId) => {
                          return <Layer key={layerId} items={data[layerId]} />;
                      })}
                  </g>
              </g>
          </svg>
          test after lol
      </div>
        <div>
            objects: <br/>
        </div>
    </main>
  );
}

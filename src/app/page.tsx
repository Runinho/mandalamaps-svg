'use client'
import styles from "./page.module.css";
import {useEffect, useState} from "react";
import {load_overpass_data} from "@/overpass/request";
import {LayerConfig} from "@/app/config/layerConfig";
import {Layer} from "@/app/map/layer";
import {
  MappedNode,
  OSMElement,
  ResolvedWays,
  TagCount,
  TagCountCounter,
  TaggedWays,
  Way,
  Ways
} from "@/app/map/mapData";
import {DefaultDict} from "@/app/defaultdict";
import {LayerStyle} from "@/app/layerStyle";
import {mercator} from "@/overpass/projection";
import {MapView} from "@/app/map/mapView";
import {TileId} from "@/app/map/tileId";
import {LocationSelector} from "@/app/config/locationSelector";
import {Position} from "@/app/map/resolveRefs";
import {getDefaultMapConfig, MapConfig} from "@/app/config/MapConfig";
import {MapConfigurator} from "@/app/config/MapConfigurator";

export default function Home() {
  // array of the layers.
  const [layerStyles, setLayerStyles] = useState<{[id: string]:LayerStyle}>({})
  const [tagCount, setTagCount] = useState<TagCount>(new TagCount())
  // origin of the map
  const [position, setPosition] = useState<Position>({lat: 48.846385, lon:2.3363723}) // someplace in Paris)
  const [mapConfig, setMapConfig] = useState<MapConfig>(getDefaultMapConfig());

  // load style from local storage
  useEffect(() => {
    const storedStyle = localStorage.getItem("style")
    if(storedStyle != null){
      setLayerStyles(JSON.parse(storedStyle))
    }
  }, []);

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

  const updateTagCount = (tile:TileId, counter: TagCountCounter) => {
    setTagCount((prev) => {
      console.log("updateTagCount", tile, counter)
      //TODO check if rerender with id is enough???.
      prev.update(tile, counter)
      const n = prev.clone()
      return n;
    })
  }

  const saveStyle = () => {
    localStorage.setItem("style", JSON.stringify(layerStyles))
  }

  let layerConfigs = [];
    //TODO: we want to use own layer thingy. stuff
  layerConfigs = Object.keys(layerStyles).map((layerId) => {
    const layer = layerStyles[layerId];
    return <LayerConfig
        key={`${layerId} ${tagCount.id}`}
        layer={layer}
        tagCounts={tagCount.all}
        setConfig={(newStyleCb) => setLayerStyles((oldSyles) => {
      let newStyles = {...oldSyles,};
      // get the latest style (use the default if empty)
      const oldStyle = oldSyles[layer.id];
      newStyles[layer.id] = newStyleCb(oldStyle);
      // console.log(newStyles);
      return newStyles;
    })}/>;
  });

  console.log("layerStyled", layerStyles);

  return (
    <main className={styles.main}>
      <div className={styles.MapConfigurator}>
        <div className={styles.Map}>
          <MapView updateTagCount={updateTagCount}
                   layerStyles={layerStyles}
                   position={position}
                   mapConfig={mapConfig}
          />
        </div>
        <div className={styles.MapStyleConfig}>
          <LocationSelector position={position} setPosition={setPosition} />
          <MapConfigurator mapConfig={mapConfig} setMapConfig={setMapConfig} />
          {layerConfigs}
          <div>
            <button onClick={addLayer}>Add Layer</button>
          </div>
          <div>
            <button onClick={saveStyle}>Save style</button>
          </div>
        </div>
      </div>
    </main>
  );
}

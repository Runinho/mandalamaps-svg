import {Position} from "@/app/map/resolveRefs";
import {ChangeEvent, Dispatch, SetStateAction} from "react";
import {MapConfig} from "@/app/config/MapConfig";

export interface MapConfiguratorProp{
  mapConfig: MapConfig,
  setMapConfig: (old: MapConfig) => Dispatch<SetStateAction<MapConfig>> ,
}

export function MapConfigurator({mapConfig, setMapConfig}: MapConfiguratorProp){

  const updateGridWith = (e: ChangeEvent<HTMLInputElement>) => {
    setMapConfig((old) => {
      return {...old.lat, gridWidth: parseFloat(e.target.value)};
    });
  }

  return <div>
    grid width: <input value={mapConfig.gridWidth} onChange={updateGridWith}/>
  </div>
}
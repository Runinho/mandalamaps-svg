import {Position} from "@/app/map/resolveRefs";
import {ChangeEvent, ChangeEventHandler, Dispatch, SetStateAction} from "react";
import {MapConfig} from "@/app/config/MapConfig";

export interface LocationSelectorProp{
  position: Position,
  setPosition: Dispatch<SetStateAction<Position>>,
}

export function LocationSelector({position, setPosition}: LocationSelectorProp){

  const updateLon = (e: ChangeEvent<HTMLInputElement>) => {
    setPosition((old) => {
      return {lat:old.lat, lon: parseFloat(e.target.value)};
    });
  }

  const updateLat = (e: ChangeEvent<HTMLInputElement>) => {
    setPosition((old) => {
      return {lon:old.lon, lat: parseFloat(e.target.value)};
    });
  }

  return <div>
    <input value={position.lon} onChange={updateLon}/>
    <input value={position.lat} onChange={updateLat}/>
    location selector
  </div>
}
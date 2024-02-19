import {FunctionComponent} from "react";
import {TagCount, TagCountCounter} from "@/app/map/mapData";
import styles from "../page.module.css";
import {LayerStyleEnabled} from "@/app/layerStyle";
import {list} from "postcss";

export type PropsLayerSelector = {
  enabled: LayerStyleEnabled,
  setEnabled: (oldEnabled: LayerStyleEnabled) => LayerStyleEnabled,
  tagCounts: TagCountCounter,
};

export const LayerSelector : FunctionComponent<PropsLayerSelector> = ({enabled, tagCounts, setEnabled}) => {

  const getOnChangeHandle = (key, value) => {
    return (e) => {
      // read the new value
      const checkboxValue = e.target.checked
      setEnabled((oldEnabled) => {
        let newEnabled =  {...oldEnabled}; // new copy
        // TODO: handle bool
        if(key in newEnabled){
          // there is already a list.
          if(checkboxValue){
            // add to list (by creating new list)
            newEnabled[key] = newEnabled[key].concat(value);
          } else {
            // remove element from the list
            newEnabled[key] = newEnabled[key].toSpliced(newEnabled[key].indexOf(value), 1);
          }
        } else {
          // there is no list. -> create one if we selected
          if(checkboxValue) {
            newEnabled[key] = [value];
          }
        }
        return newEnabled
      });
    };
  }

  return <div className={styles.LayerSelector}>
    {tagCounts.keys().map((key) => {
      const all_enabled = (key in enabled) && enabled[key] === true;
      const counts = tagCounts.get(key);
      const tagValues = counts.keys()
      return <div key={key} className={styles.LayerSelectorKey}>
        <b>{key}</b>
        { tagValues.map((value) => {
          return (
            <div key={value}>
              <input type="checkbox"
                     checked={all_enabled || ((key in enabled) && enabled[key].includes(value))}
                     onChange={getOnChangeHandle(key, value)}/>
              {value} ({counts.get(value)})
            </div>
          );
        })
        }
      </div>;
    })}
  </div>
}
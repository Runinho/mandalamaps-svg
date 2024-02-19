import styles from "./layerConfig.module.css";
import {LayerStyle} from "@/app/layerStyle";
import {FunctionComponent} from "react";
import {LayerSelector} from "@/app/config/layerSelector";
import {TagCount, TagCountCounter} from "@/app/map/mapData";

export type PropsLayerConfig = {
  layer: LayerStyle,
  setConfig: (old: LayerStyle) => LayerStyle,
  tagCounts: TagCountCounter;
};

export const LayerConfig: FunctionComponent<PropsLayerConfig> = ({layer, setConfig, tagCounts}) => {

  // propagate change upwards to correct value

  const setEnabled = (enabledCb) => {
    // on change event handler
    setConfig((oldConfig) => {
      // on change of the config
      const newConfig = {...oldConfig}
      // change only the `configName` value.
      newConfig.enabled = enabledCb(newConfig.enabled); // call the callback with the old value.
      return newConfig;
    })
  }

  const onChangeHandler = (configName: string) => {
    return (e) => {
      // on change event handler
      setConfig((oldConfig) => {
        // on change of the config
        const newConfig = {...oldConfig}
        // change only the `configName` value.
        newConfig[configName] = e.target.value
        return newConfig;
      })
    }
  }

  // change handler for checkbox :'(
  const onChangeHandlerCheckbox = (configName: string) => {
    return (e) => {
      // on change event handler
      setConfig((oldConfig) => {
        // on change of the config
        const newConfig = {...oldConfig}
        // change only the `configName` value.
        newConfig[configName] = e.target.checked
        return newConfig;
      })
    }
  }

  return <div className="LayerConfig">
    <div className={styles.LayerMain}>
      <div className={styles.LayerName}>
        <input value={layer.name}
               onChange={onChangeHandler("name")}/>
      </div>
    </div>
    <div className={styles.LayerDetail}>
      <div>
        <input value={layer.width}
               onChange={onChangeHandler("width")}/>
      </div>
      <div>
        <input type="checkbox"
               checked={layer.fill}
               onChange={onChangeHandlerCheckbox("fill")}
        />
        <input type="color"
               value={layer.color}
               onChange={onChangeHandler("color")}
        />
      </div>

      <input type="color"
             value={layer.stroke}
             onChange={onChangeHandler("stroke")}
      />
    </div>

    <LayerSelector enabled={layer.enabled} setEnabled={setEnabled} tagCounts={tagCounts}></LayerSelector>
    {Object.keys(layer).map((name) => <div key={name}>{name}: {JSON.stringify(layer[name])}</div>)}
  </div>
}
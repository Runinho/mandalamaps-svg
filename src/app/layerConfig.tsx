import styles from "./page.module.css";

export function LayerConfig({config, layerName, setConfig}) {

  // propagate change upwards to correct value
  const onChangeHandler = (configName) => {
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
  const onChangeHandlerCheckbox = (configName) => {
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
    <div className={styles.LayerName}>{layerName}</div>
    <div>
      <input value={config.width}
             onChange={onChangeHandler("width")}/>
    </div>
    <div>
      <input type="checkbox"
             value={config.fill}
             onChange={onChangeHandlerCheckbox("fill")}
      />
      <input type="color"
             value={config.color}
             onChange={onChangeHandler("color")}
      />
    </div>

    <input type="color"
           value={config.stroke}
           onChange={onChangeHandler("stroke")}
    />
    {Object.keys(config).map((name) => <div key={name}>{name}: {config[name]}</div>)}
  </div>
}
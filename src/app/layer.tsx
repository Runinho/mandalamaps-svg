export function Layer({items, layerStyle}) {
  const fill = layerStyle.fill !== false ? layerStyle.color : "none";
  return (<g stroke={layerStyle.stroke} strokeWidth={layerStyle.width} fill={fill}>
    {items.map((elm) => {
        return <polyline key={elm["id"]}
                         points={elm["nodes"].map((n) => n["lon"] + "," + n["lat"]).join(" ")}
        />
      }
    )}
  </g>);
}
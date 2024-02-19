export interface MapConfig {
    background: string,
    gridWidth: number,
    gridColor: string,
}

export function getDefaultMapConfig(): MapConfig{
    return {
        background: "#FFF",
        gridWidth: 0.5,
        gridColor: "#0755BE",
    };
}



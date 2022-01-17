import React, { useState } from "react"
import ReactDOM from "react-dom"

import * as turf from "@turf/turf"

import data from "~/assets/N02-19_Station.geojson"

type Key = string | number | symbol
type Dict<K extends Key, V> = { [key in K]: V }

function groupBy<K extends Key, V>(values: V[], getId: (value: V) => K): Dict<K, V[]> {
  return values.reduce((acc, v, i) => {
    const id = getId(v)
    if (acc[id]) acc[id].push(v)
    else acc[id] = [v]
    return acc
  }, {} as { [key in K]: V[] })
}


const lines = (data.features as any[]).map(o => (
  turf.lineString(o.geometry.coordinates, o.properties)
))

const App = () => {
  const [coord, setCoord] = useState("35.68543638406881, 139.69807399890567")

  const homePoint = turf.point(coord.split(",").map(v => Number(v)).reverse())

  const linesWithDist = lines.map(line => ({
    name: `${line.properties["運営会社"]}${line.properties["路線名"]}`,
    dist: turf.pointToLineDistance(homePoint, line),
    properties: line.properties,
  }))

  const groupedLines = Object.entries(groupBy(linesWithDist, line => line.name))
    .map(([_, values]) => values.find(v => v.dist === Math.min(...values.map(v => v.dist)))!)

  const sortedLiens = [...groupedLines].sort((line1, line2) => line1.dist - line2.dist)

  return (
    <div>
      <h1>座標から近くの鉄道路線を検索</h1>
      <div>
        <label>座標を入力　</label>
        <input type="text" value={coord} onChange={e => setCoord(e.target.value)} style={{ width: "25em" }} />
      </div>
      <ul>
        {sortedLiens.map(o => (
          <li> {o.name}: {o.dist.toFixed(3)}km</li>
        ))}
      </ul>
    </div>
  )
}

ReactDOM.render(<App />, document.getElementById("root"))
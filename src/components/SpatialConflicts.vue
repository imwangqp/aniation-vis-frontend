<script setup>
import {onMounted} from "vue";
import * as d3 from "d3";
import _ from 'lodash'

const geoJsonPath = '../assets/routes/output_file.geojson'
const backgeoJsonPath = '../assets/routes/clean_route.geojson'
const width = 800,
    height = 600

onMounted(()=>{
  const svg = d3.select("#map").append("svg")
      .attr("width", 800)
      .attr("height", 600);
  const geoJSONUrl = new URL(geoJsonPath, import.meta.url).href;
  fetch(geoJSONUrl)
      .then(response => response.json())
      .then(data => {
        drawMap(data, svg)
      });

  const backgeoJSONUrl = new URL(backgeoJsonPath, import.meta.url).href;
  fetch(backgeoJSONUrl)
      .then(response => response.json())
      .then(data => {
        drawBackground(data, svg)
      });
})

function splitNumber(string) {
  const regex = /\(([^)]+)\)/;
  console.log(string)
  return _.map(_.split(string.match(regex)[1], ', '), item=>{
    const [x,y] = _.split(item, ' ').map(Number)
    return [x,y]
  })
}
function drawBackground(geojsonData, svg) {
  let max_count = _.maxBy(geojsonData.features,o=>o['properties']['COUNT'])['properties']['COUNT'],
      min_count = _.minBy(geojsonData.features,o=>o['properties']['COUNT'])['properties']['COUNT']

  const projection = d3.geoIdentity().reflectY(true)
      .fitSize([width, height], geojsonData);
  const path = d3.geoPath().projection(projection);
  let widthScale = d3.scaleLinear([min_count,max_count], [1,5])

  geojsonData.features.forEach(function(feature, i) {
    let linearGradient = svg.append("defs")
        .append("linearGradient")
        .attr("id", "line-gradient-" + i)
        .attr("gradientUnits", "userSpaceOnUse")

    linearGradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#C6FA7A");

    linearGradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#7A7863");

    let startPoint = feature.geometry.coordinates[0];
    let endPoint = feature.geometry.coordinates[feature.geometry.coordinates.length - 1];

    let projectedStart = projection(startPoint);
    let projectedEnd = projection(endPoint);

    linearGradient.attr("x1", projectedStart[0])
        .attr("y1", projectedStart[1])
        .attr("x2", projectedEnd[0])
        .attr("y2", projectedEnd[1]);
  });

  svg.selectAll('.line')
      .data(geojsonData.features)
      .enter()
      .append('path')
      .attr('class', 'line')
      .attr('d', path)
      .attr("fill", "url(#line-gradient)")
      .attr('stroke', function(d, i) {
        return "url(#line-gradient-" + i + ")";
      })
      .attr('stroke-width', d=>widthScale(d.properties.count))
}
function drawMap(geojsonData, svg) {
  let max_count = _.maxBy(geojsonData.features,o=>o['properties']['geom_count'])['properties']['geom_count'],
      min_count = _.minBy(geojsonData.features,o=>o['properties']['geom_count'])['properties']['geom_count']
  let pointColorScale = d3.scaleLinear([min_count,max_count], ['#fdcdac', '#cbd5e8']),
      lineColorScale = d3.scaleLinear([min_count,max_count], ['#e6f5c9', '#f4cae4'])
  const projection = d3.geoIdentity()
      .reflectY(true)
      .fitSize([width, height], geojsonData);

// 创建一个地理路径生成器
  const path = d3.geoPath().projection(projection);

  svg.selectAll('.line')
      .data(geojsonData.features)
      .enter()
      .append('path')
      .attr('class', 'line')
      .attr('d', path)
      .attr('stroke', d=>{
        if (d.geometry.type === 'Point'){
          return 'black'
        }
        else {
          return 'black'
        }
      })
      .attr('fill', (d)=>{
        if (d.geometry.type === 'Point'){
          return pointColorScale(d['properties']['geom_count'])
        }
        else {
          return 'none'
        }
      })
  // svg.selectAll('.point')
  //     .data(_.map(_.filter(geojsonData.features, ['properties.TYPE', 'Point']), item=>item.geometry))
  //     .enter()
  //     .append('path')
  //     .attr('class', 'point')
  //     .attr('d', path)
  //     .attr('fill', (_, i)=>{
  //       return colorScale(geojsonData.features[i]['properties']['geom_count'])
  //     })
}
</script>

<template>
  <div id="map"></div>
</template>

<style scoped>
#map {
  width: 800px;
  height: 600px;
}
svg{
  position: absolute;
  left: 0;
  top: 0;
}
</style>
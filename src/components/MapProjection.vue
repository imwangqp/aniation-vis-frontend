<script setup>
import {onMounted, ref} from "vue";
import * as d3 from "d3";
import shp from 'shpjs'
import _ from 'lodash'

const geoJsonPath = '../assets/routes/output.geojson'

onMounted(()=>{
  const geoJSONUrl = new URL(geoJsonPath, import.meta.url).href;
  fetch(geoJSONUrl)
      .then(response => response.json())
      .then(data => {
        selectOptions = _(data.features)
            .map(feature => _.get(feature, 'properties.seg_id'))
            .uniq()
            .value();
        console.log(selectOptions)
        drawMap(data, 0)
      });
})

function drawMap(geojsonData, segment_id) {
  let max_count = _.maxBy(geojsonData.features,o=>o['properties']['count'])['properties']['count'],
      min_count = _.minBy(geojsonData.features,o=>o['properties']['count'])['properties']['count']
  const svg = d3.select("#map").append("svg")
      .attr("width", 800)
      .attr("height", 600);
  const projection = d3.geoIdentity().reflectY(true);
  const path = d3.geoPath().projection(projection);
  const colorScale = d3.scaleSequential(d3.interpolateSpectral)
      .domain([min_count, max_count]);
  projection.fitSize([800, 600], geojsonData);
  // _.filter(geojsonData.features, { 'properties':{'seg_id':segment_id} })
  svg.selectAll('.line')
      .data(geojsonData.features)
      .enter()
      .append('path')
      .attr('class', 'line')
      .attr('d', path)
      .attr("fill", d=>colorScale(d.properties.count))
      .attr('stroke', 'black')
}

</script>

<template>
<!--  <el-select v-model="value" placeholder="Select" style="width: 240px">-->
<!--    <el-option-->
<!--        v-for="item in options"-->
<!--        :key="item.value"-->
<!--        :label="item.label"-->
<!--        :value="item.value"-->
<!--    />-->
<!--  </el-select>-->
  <div id="map"></div>
</template>

<style scoped>
#map {
  width: 800px;
  height: 600px;
}
.line {
  fill: none;
  stroke: black;
  stroke-width: 2px;
}
</style>
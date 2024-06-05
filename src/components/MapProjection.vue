<script setup>
import {onMounted} from "vue";
import * as d3 from "d3";
import _ from 'lodash'

const geoJsonPath = '../assets/routes/output_file.geojson'

onMounted(()=>{
  const geoJSONUrl = new URL(geoJsonPath, import.meta.url).href;
  fetch(geoJSONUrl)
      .then(response => response.json())
      .then(data => {
        drawMap(data)
      });
})

function drawMap(geojsonData) {
  let max_count = _.maxBy(geojsonData.features,o=>o['properties']['count'])['properties']['count'],
      min_count = _.minBy(geojsonData.features,o=>o['properties']['count'])['properties']['count']
  const svg = d3.select("#map").append("svg")
      .attr("width", 800)
      .attr("height", 600);
  const projection = d3.geoIdentity().reflectY(true);
  const path = d3.geoPath().projection(projection);
  let widthScale = d3.scaleLinear([min_count,max_count], [1,5])
  projection.fitSize([800, 600], geojsonData);

  geojsonData.features.forEach(function(feature, i) {
    let linearGradient = svg.append("defs")
        .append("linearGradient")
        .attr("id", "line-gradient-" + i) // 为每个渐变创建唯一的ID
        .attr("gradientUnits", "userSpaceOnUse"); // 使用用户坐标系统

// 添加起始色（红色）
    linearGradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#C6FA7A");

// 添加结束色（蓝色）
    linearGradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#7A7863");

// 假设你的feature.geometry.coordinates是一个数组，其中第一个元素是起点，最后一个元素是终点
// 你需要将这些坐标转换为屏幕上的点
    let startPoint = feature.geometry.coordinates[0];
    let endPoint = feature.geometry.coordinates[feature.geometry.coordinates.length - 1];

// 转换坐标到屏幕空间（这里假设你有一个projection函数来进行转换）
    let projectedStart = projection(startPoint);
    let projectedEnd = projection(endPoint);

// 设置渐变的起点和终点
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
        return "url(#line-gradient-" + i + ")"; // 引用对应的渐变ID
      })
      .attr('stroke-width', d=>widthScale(d.properties.count))
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
</style>
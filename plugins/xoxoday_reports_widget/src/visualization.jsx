import React, { useState, useEffect } from 'react';
import WithClient from './with-client';
import render from './render';
import { drawSunburst } from './sunburst';

function Visualization() {
  return (
    <WithClient>
      {(props) =>
        <Content
          {...props}
        />
      }
    </WithClient>
  );
}

function Content({ data, viewConfiguration }) {

  const [ ref, setRef ] = useState();
  const [ sunburstChart, setSunburstChart ] = useState();

  const transformedData = transformData(data);

  useEffect(() => {
    if(ref) {

      if(sunburstChart) {
        sunburstChart.remove();
      }

      const svg = drawSunburst(ref, transformedData, viewConfiguration);
      setSunburstChart(svg);
    }
  }, [ ref, data, viewConfiguration ]);

  return (
    <div
      ref={(ref) => {
        if(ref) {
          setRef(ref);
        }
      }}
    ></div>
  );
}

function transformData(cube) {
  calculateAverageFromChildren(cube.data);

  const transformedData = {
    id: cube.axes[0].label,
    children: cube.data
  };

  return transformedData;

  // Recursively call this to derive the inexact/approximate average
  function calculateAverageFromChildren(childrenNodes) {
    let sumOfAverages = 0;
    childrenNodes.forEach((childNode) => {
      // Checks to see if node has no value and has children to derive it from
      if(!childNode.value && childNode.children) {
        // Derive average
        childNode.value = calculateAverageFromChildren(childNode.children);
        // populate label
        childNode.label = childNode.value.toFixed(3);
      }
      sumOfAverages += childNode.value;
    });
    return sumOfAverages / childrenNodes.length;
  }
}

render(Visualization);

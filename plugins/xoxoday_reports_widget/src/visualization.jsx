import { Label } from '@qualtrics/ui-react';
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import WithClient from './with-client';
import render from './render';
import Chart from 'chart.js';
import isEqual from 'lodash/isEqual';

function Visualization() {
	return (
		<WithClient>
			{(props) =>
				<Content
					// Force re-mount when chart type has changed
					key={props.viewConfiguration.chartType}
					{...props}
				/>
			}
		</WithClient>
	);
}

function Content({ data, viewConfiguration }) {
	const [ref, setRef] = useState();
	const [chart, setChart] = useState();	

	useEffect(() => {
		if (ref) {
			const config = getConfig();
			if (!chart) {
				setChart(new Chart(ref, config));
			} else {
				chart.data = config.data;
				chart.update();
			}
		}
	}, [ref, data, viewConfiguration]);

	return (
		<canvas
			ref={(ref) => {
				if (ref) {
					setRef(ref);
				}
			}}
		></canvas>
	);

	function getConfig() {
		return {
			data: transformData(data),
			type: viewConfiguration.chartType || 'bar',
			options: {
				responsive: true,
				maintainAspectRatio: false,
				scales: {
					yAxes: [{
						ticks: {
							beginAtZero: true
						}
					}]
				}
			}
		};
	}
}

function transformData(cube) {
	const { members, label } = cube.axes[0].dimensions[0];
	const labels = [];
	const dataset = {
		data: [],
		label,
		backgroundColor: [],
		borderColor: [],
		hoverBackgroundColor: [],
		hoverBorderColor: [],
		borderWidth: 1
	};

	cube.data.forEach((datum, index) => {
		labels.push(members[datum.id].label);
		dataset.data.push(datum.value);
		const color = [0, 0, 0].map((_, i) => rainbow(i, index))
		dataset.backgroundColor.push(`rgba(${color}, 0.2)`)
		dataset.borderColor.push(`rgba(${color}, 1)`)
		dataset.hoverBackgroundColor.push(`rgba(${color}, .8)`)
	});

	return {
		labels,
		datasets: [dataset]
	};
}

function rainbow(color, index) {
	const frequency = .9;
	return Math.round(Math.sin(frequency * index + color * 2) * 127 + 128);
}

render(Visualization);

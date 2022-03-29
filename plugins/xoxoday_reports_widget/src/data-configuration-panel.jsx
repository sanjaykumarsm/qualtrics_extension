import './styles.css';
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import WithClient from './with-client';
import { Button, Label, LoadingSpinner, SelectMenu, MenuItem } from '@qualtrics/ui-react';

export default function DataConfigurationPanel({
	client,
	configuration
}) {
	const [definition, setDefinition] = useState();

	useEffect(() => {
		let canceled = false;
		if (!definition) {
			const fetchDefinition = async () => {
				const { fieldsetDefinition } = await client.postMessage('getDataSourceDefinition');
				if (canceled) {
					return;
				}
				setDefinition(fieldsetDefinition);
			};
			fetchDefinition();
		}
		return () => {
			canceled = true;
		};
	}, []);

	if (!definition) {
		return (
			<div className='spinner'>
				<LoadingSpinner
					show
					size="medium"
				/>
			</div>
		);
	}

	let metric;
	let dimension;
	if (configuration) {
		const { metrics, axes } = configuration;
		if (metrics) {
			metric = configuration.metrics[0];
		}
		if (axes) {
			dimension = configuration.axes[0].dimensions[0];
		}
	}

	return (
		<>
			<FieldSelectMenu
				client={client}
				label={client.getText('configurationPanel.metric')}
				defaultValue={metric && metric.field}
				fields={getFieldsOfType(
					'ScalarValue',
					'EnumerableScalarValue'
				)}
				placement='top-start'
				onChange={onMetricChange}
			/>
			<FieldSelectMenu
				client={client}
				label={client.getText('configurationPanel.dimension')}
				defaultValue={dimension && dimension.fieldId}
				fields={getFieldsOfType(
					'DateTime',
					'ScalarValue',
					'EnumerableScalarValue',
					'EnumerableValue'
				)}
				placement='bottom-start'
				onChange={onDimensionChange}
			/>
		</>
	);

	function onMetricChange(field) {
		change((configuration) => ({
			...configuration,
			metrics: [{
				id: 'metric',
				label: field.name,
				field: field.fieldId,
				function: 'avg'
			}]
		}));
	}

	function onDimensionChange(field) {
		change((configuration) => ({
			...configuration,
			axes: [{
				id: 'x-axis',
				label: 'X-Axis',
				dimensions: [{
					id: 'x-axis-dimension',
					label: field.name,
					fieldId: field.fieldId
				}]
			}]
		}));
	}

	function change(map) {
		const newConfiguration = {
			...map(configuration),
			component: 'fieldsets-aggregate',
			fieldsetId: definition.fieldSetId,
		};
		newConfiguration.isComplete = newConfiguration.metrics && newConfiguration.axes;
		client.postMessage('onDataConfigurationChange', newConfiguration);
	}

	function getFieldsOfType(...types) {
		return definition
			.fieldSetView
			.filter((field) => types.includes(field.type));
	}
}

function FieldSelectMenu({
	client,
	defaultValue,
	fields,
	label,
	onChange,
	placement
}) {
	return (
		<div className='form-group'>
			<Label className='label'>{label}</Label>
			<SelectMenu
				defaultValue={defaultValue}
				defaultLabel={client.getText('configurationPanel.selectAField')}
				placement={placement}
				maxHeight='100px'
				disabled={fields.length === 0}
				onChange={(fieldId) => {
					onChange(fields.find((field) => field.fieldId === fieldId));
				}}
			>
				{fields.map(({ fieldId, name }) =>
					<MenuItem
						key={fieldId}
						className='menu-item'
						value={fieldId}
					>
						{name}
					</MenuItem>
				)}
			</SelectMenu>
		</div>
	);
}

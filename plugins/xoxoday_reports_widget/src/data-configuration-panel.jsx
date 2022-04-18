import './styles.css';
import React, { useEffect, useState } from 'react';
import cloneDeep from 'lodash/cloneDeep';
import { Label, LoadingSpinner, Dropdown, DropdownButton, DropdownList, DropdownOption, Divider } from '@qualtrics/ui-react';

export default function DataConfigurationPanel({
  client,
  configuration
}) {
  const [ definition, setDefinition ] = useState();

  useEffect(() => {
    let canceled = false;
    if(!definition) {
      const fetchDefinition = async () => {
        const { fieldsetDefinition } = await client.postMessage('getDataSourceDefinition');
        if(canceled) {
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

  if(!definition) {
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
  let dimensions = [];

  if(!configuration) {

    // Initialize configuration
    const updatedConfiguration = {
      axes: [{
        id: 'levels',
        label: 'Levels',
        dimensions: []
      }]
    };

    updatedConfiguration.component = 'fieldsets-aggregate';
    updatedConfiguration.fieldsetId = definition.fieldSetId,

    // Essentially inform parent component of changes, this will cause a rerender
    emitConfigurationChangeEvent(updatedConfiguration);
  } else {
    // configuration already initialized
    const { metrics, axes } = configuration;

    if(metrics) {
      metric = metrics[0];
    }

    if(axes) {
      dimensions = axes[0].dimensions;
    }
  }

  // indexPosition derived from relative array element position
  const dimensionLevels = [{
    dimensionLabel: client.getText('configurationPanel.dimensionLevel1')
  }, {
    dimensionLabel: client.getText('configurationPanel.dimensionLevel2')
  }, {
    dimensionLabel: client.getText('configurationPanel.dimensionLevel3')
  }];

  const defaultSelectText = client.getText('configurationPanel.selectAField');
  const metricFields = getFieldsOfType('ScalarValue', 'EnumerableScalarValue');

  return (
    <>
      <h3>{client.getText('configurationPanel.dataConfigurationHeading')}</h3>
      <div className='form-group'>
        <Label className='label'>{client.getText('configurationPanel.metric')}</Label>
        <Dropdown
          defaultValue={metric && metric.field}
          aria-label={defaultSelectText}
          onChange={(fieldId) => {
            const field = metricFields.find(metricField => metricField.fieldId === fieldId);
            onMetricChange(field);
          }}
        >
          <DropdownButton
            defaultLabel={defaultSelectText}
          />
          <DropdownList
            placement={'top-start'}
          >
            {metricFields.map(({ fieldId, name }) =>
              <DropdownOption
                key={fieldId}
                value={fieldId}
                label={name}
                className='menu-item'
              />
            )}
          </DropdownList>
        </Dropdown>
      </div>

      {dimensionLevels.map(({ dimensionLabel }, index) => {
        const dimensionFields = getAvailableDimensionFields(index);
        const defaultValue = dimensions[index] && dimensions[index].fieldId;
        const isSelectionRemovable = index >= dimensions.length - 1;

        return (
          <div key={index} className='form-group'>
            <Label className='label'>{dimensionLabel}</Label>
            <Dropdown
              aria-label={defaultSelectText}
              defaultValue={defaultValue}
              disabled={isDisabled(index)}
              onChange={(fieldId) => {
                // check if user is removing field selection
                if(fieldId === 0) {
                  onRemoveSelection(index);
                  return;
                }

                const field = dimensionFields.find((field) => field.fieldId === fieldId);
                onDimensionChange(field, index);
              }}
            >
              <DropdownButton
                defaultLabel={defaultSelectText}
              />
              <DropdownList
                placement={'bottom-start'}
              >
                { defaultValue && isSelectionRemovable &&
                  <>
                    <DropdownOption
                      value={0}
                      label={defaultSelectText}
                      className='reset-selection'
                    />
                    <Divider />
                  </>
                }

                {dimensionFields.map(({ fieldId, name }) =>
                  <DropdownOption
                    key={fieldId}
                    className='menu-item'
                    value={fieldId}
                    label={name}
                  />
                )}
              </DropdownList>
            </Dropdown>
          </div>
        );
      }
      )}
    </>
  );

  function isDisabled(dimensionIndex) {
    if(dimensionIndex === 0) {
      return false;
    }

    if(dimensions[dimensionIndex - 1] && dimensions[dimensionIndex - 1].fieldId) {
      return false;
    }

    return true;
  }

  function getAvailableDimensionFields(skipThisDimensionIndex) {
    const possibleFields = getFieldsOfType(
      'DateTime',
      'ScalarValue',
      'EnumerableScalarValue',
      'EnumerableValue'
    );

    const dimensionsAndMetrics = cloneDeep(dimensions);

    // Append metrics onto dimensions so the skipThisDimensionIndex logic works
    if(metric) {
      dimensionsAndMetrics.push({ ...metric, fieldId: metric.field });
    }

    const availableFields = possibleFields.filter(excludeAlreadySelectedFields);
    return availableFields;

    function excludeAlreadySelectedFields(field) {
      // Inverse if the field has already been selected
      return !(dimensionsAndMetrics.some((dimensionOrMetric, index) => {
        if(index === skipThisDimensionIndex) {
          return false;
        }

        return dimensionOrMetric.fieldId === field.fieldId;
      }));
    }
  }

  function onMetricChange(field) {
    const updatedConfiguration = cloneDeep(configuration);
    // This widget only accepts one metric at a time, so we just replace it here
    updatedConfiguration.metrics = [{
      id: `Metric_${field.fieldId}`,
      label: field.name,
      field: field.fieldId,
      function: 'avg'
    }];

    emitConfigurationChangeEvent(updatedConfiguration);
  }

  function onDimensionChange(field, position) {
    const updatedConfiguration = cloneDeep(configuration);

    const updatedDimension = {
      id: field.name,
      label: field.name,
      fieldId: field.fieldId
    };

    updatedConfiguration.axes[0].dimensions[position] = updatedDimension;
    emitConfigurationChangeEvent(updatedConfiguration);
  }

  function onRemoveSelection(index) {
    const updatedConfiguration = cloneDeep(configuration);
    updatedConfiguration.axes[0].dimensions.splice(index, 1);

    emitConfigurationChangeEvent(updatedConfiguration);
  }

  function emitConfigurationChangeEvent(updatedConfiguration) {
    updatedConfiguration.isComplete = updatedConfiguration.metrics && updatedConfiguration.axes[0].dimensions.length > 0;
    client.postMessage('onDataConfigurationChange', updatedConfiguration);
  }

  function getFieldsOfType(...types) {
    return definition
      .fieldSetView
      .filter((field) => types.includes(field.type));
  }
}

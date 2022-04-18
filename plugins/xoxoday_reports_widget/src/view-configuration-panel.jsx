import React from 'react';
import { Label, Dropdown, DropdownButton, DropdownList, DropdownOption } from '@qualtrics/ui-react';

const arcVisibility = [{
  label: '3 Levels',
  value: 3
}, {
  label: '4 Levels',
  value: 4
}];

const labelVisibility = [{
  label: '3 Levels',
  value: 3
}, {
  label: '4 Levels',
  value: 4
}];

export default function ViewConfigurationPanel({
  client,
  data,
  configuration
}) {

  if(!configuration) {
    // Default configuration
    configuration = {
      arcVisibility: arcVisibility[0].value,
      labelVisibility: labelVisibility[0].value
    };
    change(() => configuration);
  }

  return (
    <>
      <h3>{client.getText('configurationPanel.viewConfigurationHeading')}</h3>
      <div className='form-group'>
        <Label className='label'>{client.getText('configurationPanel.arcLevelsVisibility')}</Label>
        <Dropdown
          defaultValue={configuration.arcVisibility}
          onChange={(level) => {
            change((configuration) => ({
              ...configuration,
              arcVisibility: level
            }));
          }}
        >
          <DropdownButton
            defaultLabel={client.getText('configurationPanel.selectAnOption')}
          />
          <DropdownList
            placement='top-start'
          >
            {arcVisibility.map(({ label, value }) =>
              <DropdownOption
                key={value}
                value={value}
                label={label}
                className='menu-item'
              />
            )}
          </DropdownList>
        </Dropdown>
      </div>
      <div className='form-group'>
        <Label className='label'>{client.getText('configurationPanel.arcLevelsVisibility')}</Label>
        <Dropdown
          defaultValue={configuration.labelVisibility}
          onChange={(level) => {
            change((configuration) => ({
              ...configuration,
              labelVisibility: level
            }));
          }}
        >
          <DropdownButton
            defaultLabel={client.getText('configurationPanel.selectAnOption')}
          />
          <DropdownList
            placement='bottom-start'
          >
            {arcVisibility.map(({ label, value }) =>
              <DropdownOption
                key={value}
                value={value}
                label={label}
                className='menu-item'
              />
            )}
          </DropdownList>
        </Dropdown>
      </div>
    </>
  );

  function change(map) {
    client.postMessage('onViewConfigurationChange', map(configuration));
  }
}

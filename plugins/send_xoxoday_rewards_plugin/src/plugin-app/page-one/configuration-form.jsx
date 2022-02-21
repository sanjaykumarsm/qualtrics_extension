// External (npm) dependencies
import React, { useState, useEffect } from 'react';
import { TaskFields, FieldItem } from '@qualtrics/plugin-ui-react';

// Internal dependencies
import { validateFieldValues, getStaticFields } from './configuration-form-fields';

export function ConfigurationForm(props) {

  /////////////////////////////////////////////
  /////////////   Props Mapping   /////////////
  /////////////////////////////////////////////
  const { client, formFields } = props;

  /////////////////////////////////////
  /////////////   Hooks   /////////////
  /////////////////////////////////////

  // The default form fields defined by the developer
  const [ staticFields, ] = useState(staticFields || getStaticFields(client));
  const [ fieldItems, ] = useState(fieldItems || deriveFieldItemsFromStaticFields);

  // All of the visible fields that are displayed to users
  // Non-visible fields will be turned into visible fields when the user adds new fields
  const [ visibleFields, setVisibleFields ] = useState(loadVisibleFields);

  // Perform form validations and persist fields to taskDefinition
  useEffect(() => {
    handleVisibleFieldUpdates();
  }, [ visibleFields ]);

  /////////////////////////////////////////
  /////////////   Component   /////////////
  /////////////////////////////////////////

  return (
    <TaskFields
      addFieldLabel={client.getText('addFieldDropdownLabel')}
      pipedTextItems={client.context.pipedText}
      onFieldInputChange={onFieldValueChange}
      onFieldRemove={onFieldRemove}
      onFieldAdd={onFieldAdd}
      onFieldSwitch={onFieldSwitch}
      values={visibleFields}
    >
      {fieldItems}
    </TaskFields>
  );

  /////////////////////////////////////////////
  /////////////   Hook Handlers   /////////////
  /////////////////////////////////////////////

  function deriveFieldItemsFromStaticFields() {
    return staticFields.map(staticField => {
      return (
        <FieldItem
          name={staticField.name}
          key={staticField.id}
          id={staticField.id}
          required={staticField.required}
          valuePlaceholder={staticField.valuePlaceholder}
          valueTooltip={staticField.valueTooltip} >
        </FieldItem>
      );
    });
  }

  function handleVisibleFieldUpdates() {
    if(visibleFields.length === 0) {
      return;
    }

    // Form validation
    const canSaveForm = validateFieldValues(visibleFields);

    // Only persist to taskDefinition once form is valid
    if(canSaveForm) {
      props.attachFormFieldsToTaskDefinition(visibleFields);
    }

    // Toggle form save
    props.toggleSaveButtonState(canSaveForm);
  }

  function loadVisibleFields() {
    // Previously edited, but not yet saved
    if(formFields.length) {
      return formFields;
    }

    // Saved Task
    if(client.isSavedTask()) {
      return client.getConfig().config.formFields;
    }

    // New Task
    return staticFields.filter(removeNonVisibleFields).map(formatFields);

    function removeNonVisibleFields(visibleField) {
      // Determines which fields to show by default in the UI
      return visibleField.isVisible;
    }

    function formatFields(field) {
      return {
        value: field.value,
        name: field.name,
        id: field.id,
        required: field.required,
        validate: field.validate
      };
    }
  }

  //////////////////////////////////////////////////
  /////////////   Component Handlers   /////////////
  //////////////////////////////////////////////////

  function onFieldAdd(fieldId) {
    const staticFieldIndex = getFieldIndexById(staticFields, fieldId);

    if(staticFieldIndex === -1) {
      // Could add error handling here
      return;
    }

    const updatedVisibleFields = [ ...visibleFields ];
    updatedVisibleFields.push({
      id: fieldId,
      name: staticFields[staticFieldIndex].name,
      value: '',
      required: false,
      validate: staticFields[staticFieldIndex].validate
    });

    setVisibleFields(updatedVisibleFields);

  }

  function onFieldRemove(fieldId) {
    const visibleFieldIndex = getFieldIndexById(visibleFields, fieldId);

    if(visibleFieldIndex === -1) {
      // Could add error handling here
      return;
    }

    const updatedVisibleFields = [ ...visibleFields ];
    updatedVisibleFields.splice(visibleFieldIndex, 1);
    setVisibleFields(updatedVisibleFields);
  }

  function onFieldSwitch(formerFieldId, newFieldId) {
    const formerFieldIndex = getFieldIndexById(visibleFields, formerFieldId);
    const newFieldIndex = getFieldIndexById(staticFields, newFieldId);

    if(formerFieldIndex === -1 || newFieldIndex === -1) {
      // Could add error handling here
      return;
    }

    const updatedVisibleFields = [ ...visibleFields ];
    updatedVisibleFields[formerFieldIndex] = {
      id: staticFields[newFieldIndex].id,
      name: staticFields[newFieldIndex].name,
      value: '',
      required: staticFields[newFieldIndex].required,
      validate: staticFields[newFieldIndex].validate
    };

    setVisibleFields(updatedVisibleFields);
  }

  function onFieldValueChange(fieldId, value, event) {
    const visibleFieldIndex = getFieldIndexById(visibleFields, fieldId);

    if(visibleFieldIndex === -1) {
      // Could add error handling here
      return;
    }

    const updatedVisibleFields = [ ...visibleFields ];
    const updatedVisibleField = { ...visibleFields[visibleFieldIndex] };
    updatedVisibleField.value = value;
    updatedVisibleFields[visibleFieldIndex] = updatedVisibleField;

    setVisibleFields(updatedVisibleFields);
  }

  ////////////////////////////////////////////////
  /////////////   Helper Functions   /////////////
  ////////////////////////////////////////////////

  function getFieldIndexById(array, fieldId) {
    return array.findIndex(arrayMember => {
      return arrayMember.id === fieldId;
    });
  }

}

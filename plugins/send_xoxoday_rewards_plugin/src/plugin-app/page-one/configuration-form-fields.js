export {
  getStaticFields,
  validateFieldValues
};

function getStaticFields(client) {
  return [
    { name: client.getText('defaultFieldNameRespondentEmail'), required: true, isVisible: true, id: 'email', valueTooltip: client.getText('defaultFieldTooltipRespondentEmail'), valuePlaceholder: '', validate: validateThatKeyAndValueAreStrings },
    { name: client.getText('defaultFieldNameRespondentFirstName'), required: true, isVisible: true, id: 'first-name', valueTooltip: client.getText('defaultFieldTooltipRespondentFirstName'), valuePlaceholder: '', validate: validateThatKeyAndValueAreStrings },
    { name: client.getText('defaultFieldNameRespondentLastName'), required: true, isVisible: true, id: 'last-name', valueTooltip: client.getText('defaultFieldTooltipRespondentLastName'), valuePlaceholder: '', validate: validateThatKeyAndValueAreStrings },
    { name: client.getText('defaultFieldNameRespondentLocation'), required: true, isVisible: true, id: 'location', valueTooltip: client.getText('defaultFieldTooltipRespondentLocation'), valuePlaceholder: '', validate: validateThatKeyAndValueAreStrings }
  ];
}

function validateFieldValues(formFields) {
  return formFields.every(formField => {
    let isFormFieldValid = true;

    // Invokes validation function if the field has one
    if(typeof formField.validate === 'function') {
      isFormFieldValid = formField.validate(formField);
    }

    return isFormFieldValid;
  });
}

// Example validation that the key and values for this field are of type string and are not empty
function validateThatKeyAndValueAreStrings(formField) {
  if(typeof formField.name !== 'string' || typeof formField.value !== 'string') {
    return false;
  }

  return (formField.value.trim().length > 0 && formField.name.trim().length > 0);
}

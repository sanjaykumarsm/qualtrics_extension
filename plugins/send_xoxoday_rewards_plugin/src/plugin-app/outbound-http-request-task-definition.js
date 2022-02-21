export {
  formatConnection,
  formatFormData,
  getDefaultTaskDefinition
};

function formatConnection(credentialId) {
  // Defaults to basic auth, other auth schemes or formats can be used as described in the SDK documentation
  return {
    id: credentialId,
    paramFormat: 'header',
    paramName: 'Authorization',
    paramTemplate: 'Basic %s'
  };
}

function formatFormData(formFields) {
  const formattedFormData = {};

  formFields.forEach(formField => {
    if(Object.prototype.hasOwnProperty.call(formField, 'value') && formField.value) {
      formattedFormData[formField.name] = formField.value;
    }
  });

  return formattedFormData;
}

function getDefaultTaskDefinition(client) {
  // Fill this out with your default/static api values
  return {
    url: 'https://empulsqaenv.xoxoday.com/chef/v1/oauth/api',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: {
      'query': 'qualtrics_ext.mutation.qualtricsResponseFromWorkflow',
      'tag': 'qualtrics_ext',
      'variables': {
        'SurveyID': '',
        'ResponseID': '',
        'reward_email_id': ''
      }
    },
    // The config property can be used to store user selections when the save button is clicked, and those selections can then be retrieved and loaded if/when the user clicks on a saved task
    config: {
      selectedMenuOption: undefined,
      customerMessage: client.getText('defaultCustomerMessage'),
      formFields: []
    }
  };
}

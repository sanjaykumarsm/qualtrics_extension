// Webpack ingested imports
import './plugin-app.scss';

// External (npm) dependencies
import React, { useState, useEffect, useRef } from 'react';
import cloneDeep from 'lodash.clonedeep';

// Internal dependencies
import { ConfigurationForm } from './page-one/configuration-form.jsx';
//import { IntroductorySection } from './page-one/introductory-section.jsx';
import { RideTypeSelectMenu } from './page-one/ride-type-select-menu.jsx';
//import { CustomerMessageForm } from './page-two/customer-message-form.jsx';
import { getDefaultTaskDefinition, formatConnection, formatFormData } from './outbound-http-request-task-definition';

export function PluginApp(props) {

  /////////////////////////////////////////////
  /////////////   Props Mapping   /////////////
  /////////////////////////////////////////////

  const client = props.client;
  const biRef = useRef();
  /////////////////////////////////////
  /////////////   Hooks   /////////////
  /////////////////////////////////////

  const [ canSaveTask, setCanSaveTask ] = useState(loadInitialSaveTaskState);
  const [ taskDefinition, setTaskDefinition ] = useState(loadTaskDefinition);
  const [ pageNum, setPageNum ] = useState(1);

  // Handle logic for enabling the save button
  useEffect(() => {
    updateSaveButtonState();
  }, [ canSaveTask ]);

  // Save Button Handler
  useEffect(() => {
    client.onSave(saveTaskDefinition);
    // Overwrite handler only when the taskDefinition changes
  }, [ taskDefinition ]);

  useEffect(() => {
    client.onNext(page => setPageNum(page));
    client.onBack(page => setPageNum(page));
  }, []);

  /////////////////////////////////////////
  /////////////   Component   /////////////
  /////////////////////////////////////////

  return (
    <div className='plugin-app'>
      {renderPage()}
    </div>
  );

  // function nextPageSetup(page) {
  //   biRef.nextPageSetup();
  //   //from call
  // }

  /////////////////////////////////////////////
  /////////////   Hook Handlers   /////////////
  /////////////////////////////////////////////

  function loadInitialSaveTaskState() {
    const saveTaskState = {
      isFormValid: false
    };

    if(client.isSavedTask()) {
      saveTaskState.isFormValid = true;
    }

    return saveTaskState;
  }

  function loadTaskDefinition() {
    if(client.isSavedTask()) {
      return client.getConfig();
    }
    return getDefaultTaskDefinition(client);
  }

  function updateSaveButtonState() {
    if(canSaveTask.isFormValid) {
      client.enableSaveButton();
    } else {
      client.disableSaveButton();
    }
  }

  function saveSelection(selection) {
    // copy full state
    const updatedTaskDefinition = cloneDeep(taskDefinition);

    // update selected menu option
    updatedTaskDefinition.config.selectedMenuOption = selection;

    // If the customer message is the default, give it some customization
    if(updatedTaskDefinition.config.customerMessage === client.getText('defaultCustomerMessage')) {
      updatedTaskDefinition.config.customerMessage = client.getText('customerMessageWithRideType') + selection.campaignName;
    }

    // save it
    setTaskDefinition(updatedTaskDefinition);
  }

  // function saveMessage(message) {
  //   const updatedTaskDefinition = cloneDeep(taskDefinition);
  //   updatedTaskDefinition.config.customerMessage = message;
  //   setTaskDefinition(updatedTaskDefinition);
  // }

  /////////////////////////////////////////////////////
  /////////////   Client Event Handlers   /////////////
  /////////////////////////////////////////////////////

  function saveTaskDefinition() {
    const updatedTaskDefinition = cloneDeep(taskDefinition);

    // Step 1 - Conditionally attach a connection - see 'Setting Up Authentication' guide in docs for more details
    const credentialId = client.getAvailableConnections().credentialId;
    if(credentialId) {
      updatedTaskDefinition.connection = formatConnection(credentialId);
    }

    // Step 2 - Merge dynamic user-configured form key-value pairs with static default request body parameters
    updatedTaskDefinition.body = Object.assign({}, updatedTaskDefinition.body, formatFormData(updatedTaskDefinition.config.formFields));
    updatedTaskDefinition.body.variables.SurveyID = client.pluginClientInstance.context.userMeta.surveyId;
    updatedTaskDefinition.body.variables.ResponseID = '${rm://Field/ResponseID}';
    updatedTaskDefinition.body.variables.reward_email_id = updatedTaskDefinition.body['Respondent Email'];

    // Step 3 - Update the taskDefinition
    setTaskDefinition(updatedTaskDefinition);

    // Step 4 - Return the task definition object for persistence into backend
    return updatedTaskDefinition;
  }

  //////////////////////////////////////////////////
  /////////////   Component Handlers   /////////////
  //////////////////////////////////////////////////

  function renderPage() {
    switch(pageNum) {
      case 1:
        return (
          <>
            {/*<IntroductorySection
              client={client}
            >
            </IntroductorySection> */}
            <RideTypeSelectMenu
              biRef={biRef}
              client={client}
              selectedMenuOption={taskDefinition.config.selectedMenuOption}
              toggleSaveButtonState={toggleSaveButtonState}
              saveSelection={saveSelection}
            >
            </RideTypeSelectMenu>

          </>
        );
      case 2:
        return (
          <ConfigurationForm
            client={client}
            toggleSaveButtonState={toggleSaveButtonState}
            attachFormFieldsToTaskDefinition={attachFormFieldsToTaskDefinition}
            formFields={taskDefinition.config.formFields}
          >
          </ConfigurationForm>
        );
    }
  }
  // function moveToNextPage(page) {
  //   setPageNum(page);
  // }
  function attachFormFieldsToTaskDefinition(formFields) {
    const updatedTaskDefinition = cloneDeep(taskDefinition);
    updatedTaskDefinition.config.formFields = formFields;
    setTaskDefinition(updatedTaskDefinition);
  }

  function toggleSaveButtonState(isFormValid) {
    const updatedCanSaveTask = { ...canSaveTask };
    updatedCanSaveTask.isFormValid = isFormValid;
    setCanSaveTask(updatedCanSaveTask);
  }
}

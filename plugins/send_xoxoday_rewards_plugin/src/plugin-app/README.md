# Actions Task Plugin Starter
This sample code contains a basic working Actions Task plugin and can serve as a starting point for your own plugin. 

In fact, you may only need to modify a few fields, create an authentication `connection`, and your extension could be ready for submission!

# Contents
The sections below contain a brief summary of the file and highlight key functionality.

## plugin-app.js
### Summary
This is the entrypoint to your plugin functionality.

### Key Functionality
* `client.onSave` => This function enables you to provide a callback that gets invoked when the user clicks the save button
* `function toggleSaveButtonState` => This function toggles whether or not the user can save the form based on the logic you provide

## plugin-app.scss
### Summary
This is where you place any specific styles to apply to your *plugin-app.js* React component.

It may make sense to combine all styles into a single file or you can create one for each React component.

## configuration-form.js
### Summary
This module is the controller for your form and is responsible for validating it and informing its parent component when it is valid.

## configuration-form-fields.js
### Summary
This module contains your default form fields and handles validation logic.

## outbound-http-request-task-definition.js
### Summary
This module contains the initial task definition object with any static values (e.g. API endpoint url, API endpoint method, etc.) as well as other helper functions

### Key Functionality
* `formatConnect` => This function prepares and returns a connection object required for authenticating your outbound http requests

## custom-piped-text-options.js
### Summary
This module is optional and focuses on adding custom piped text options to the default ones provided.

## menu-with-external-data.js
### Summary
This module populates a searchable dropdown, in this case it is called a `SelectMenu` component, with data retrieved from an external API endpoint

### Key Functionality
* `onMenuOptionSelection` => Updates the state with the dropdown selection
* `useEffect` => There are two of these React lifecycle hooks, one that retrieves the menu options and populates the dropdown with them and the other that loads the previously selected value for a saved task

## utils.js
### Summary
This module contains a few helper functions

# That's It!
Good luck building your Actions Task plugin!

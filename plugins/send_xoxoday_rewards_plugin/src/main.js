// Webpack ingested imports
import '@qualtrics/base-styles/dist/base-styles.css';

// External (npm) dependencies
import React from 'react';
import ReactDOM from 'react-dom';
import ActionsTaskClient from '@qualtrics/actions-task-client';
import { languageCodeAdapter } from '@qualtrics/plugin-ui-react';
import i18n from '@qualtrics/ui-i18n';
import { UIProvider } from '@qualtrics/ui-react';

// Internal dependencies
import { PluginApp } from './plugin-app/plugin-app.jsx';
const config = {
  pages: 2
};

(async () => {
  try {
    const actionsTaskClient = await ActionsTaskClient.initialize(config);
    renderPlugin(actionsTaskClient);
  } catch(error) {
    console.error(error);
    ReactDOM.render(<div>{error}</div>, document.getElementById('app-root'));
  }
})();

function renderPlugin(actionsTaskClient) {
  const context = actionsTaskClient.context;
  const languageCode = languageCodeAdapter(context.language);
  const i18nConfig = {
    localizedText: i18n[languageCode].QualtricsDesignSystemUI,
  };

  const Index = () => {
    return (
      <UIProvider config={i18nConfig}>
        <PluginApp client={actionsTaskClient} />
      </UIProvider>
    );
  };

  ReactDOM.render(<Index/>, document.getElementById('app-root'));
}

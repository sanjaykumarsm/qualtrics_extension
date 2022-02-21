import React, { useEffect, useState } from 'react';
import { SelectMenu, MenuItem, LoadingSpinner, Label } from '@qualtrics/ui-react';

export function RideTypeSelectMenu(props) {
  const { client, saveSelection, selectedMenuOption } = props;
  const authConnectionName = client.pluginClientInstance.context.availableConnections[0];

  // client.pluginClientInstance.context.availableConnections[0];

  const [ isLoading, setIsLoading ] = useState(true);
  const [ menuErrorMessage, setMenuErrorMessage ] = useState();
  const [ menuOptions, setMenuOptions ] = useState([]);

  useEffect(retrieveSelectMenuOptions, []);

  function retrieveSelectMenuOptions() {
    (async () => {
      if(authConnectionName) {
        try {

          const url = 'https://empulsqaenv.xoxoday.com/chef/v1/oauth/api';
          const config = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: { 'query': 'storesAdmin.query.getOneClickSiteList', 'tag': 'storeAdmin', 'variables': { 'add_data': { 'limit': 10000, 'offset': 0 } } },
          };

          config.connection = {
            connectionName: authConnectionName,
            paramFormat: 'header',
            paramName: 'Authorization',
            paramTemplate: 'Bearer %s'
          };
          const result = await client.fetch(url, config);
          console.log(JSON.stringify(result));
          if(result.responseData && result.responseData.data && result.responseData.data && result.responseData.data.getOneClickSiteList) {
            const campaign_res = result.responseData.data.getOneClickSiteList;
            if(campaign_res.success) {
              setMenuOptions(campaign_res.data);
            } else {
              setMenuErrorMessage(client.getText('selectMenuGenericErrorMessage'));
            }
          } else {
            setMenuErrorMessage(client.getText('selectMenuGenericErrorMessage'));
          }

        } catch(error) {
          console.log(error);
          setMenuErrorMessage(client.getText('selectMenuGenericErrorMessage'));
        } finally {
          setIsLoading(false);
        }
      } else {
        setMenuErrorMessage(client.getText('selectMenuGenericErrorMessage'));
        setIsLoading(false);
      }
    }
    )();
  }

  function onMenuOptionSelection(menuOptionId) {
    // find the the selection
    const newSelectedMenuOption = menuOptions.find((menuOption) => {
      return menuOption.campaignId === menuOptionId;
    });

    if(newSelectedMenuOption === undefined) {
      // handle the case that the selection doesn't exist
      setMenuErrorMessage(client.getText('selectMenuOptionInvalidErrorMessage'));
      return;
    }

    // Save it to state
    saveSelection(newSelectedMenuOption);

    // Clear out any error messages
    setMenuErrorMessage();
  }

  function getLabel() {
    if(isLoading) {
      return selectedMenuOption ? selectedMenuOption.campaignName : client.getText('selectMenuLabel');
    } else {
      if(selectedMenuOption) {
        const newSelectedMenuOption = menuOptions.find((menuOption) => {
          return menuOption.campaignId === selectedMenuOption.campaignId;
        });

        if(newSelectedMenuOption === undefined) {
          return client.getText('selectMenuLabel');
        }

        return selectedMenuOption.campaignName;
      }
      return client.getText('selectMenuLabel');
    }
  }

  return (
    <div className="selectMenuContainer">
      <Label className='selectMenuWrapperLabel'>
        {client.getText('selectMenuWrapperLabel')}
      </Label>
      <LoadingSpinner background='fade' show={isLoading} size='small'>
        <SelectMenu
          label={getLabel()}
          disabled={isLoading}
          onChange={onMenuOptionSelection}
          className="selectMenu"
        >
          {menuOptions.map(menuOption => {
            return (
              <MenuItem
                key={menuOption.campaignId}
                value={menuOption.campaignId}
              >
                {menuOption.campaignName}
              </MenuItem>
            );
          })}
        </SelectMenu>
      </LoadingSpinner>
      {menuErrorMessage &&
        <div>
          <span>{menuErrorMessage}</span>
        </div>
      }
    </div>
  );
}

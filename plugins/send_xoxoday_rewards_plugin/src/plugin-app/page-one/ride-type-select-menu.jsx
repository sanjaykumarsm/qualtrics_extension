import React, { useEffect, useState } from 'react';
import { SelectMenu, MenuItem, LoadingSpinner, Label, RadioGroup, RadioOption, Switch, Input, Button } from '@qualtrics/ui-react';
import {
  DateRangePicker
}                           from 'react-dates';
import 'react-dates/initialize';
//import {DateRangePicker} from 'react-dates';
import 'react-dates/lib/css/_datepicker.css';
import moment               from 'moment';
import Base64 from 'react-native-base64';
//import { toUpper } from 'lodash';

import configration from '../../../config.json';

export function RideTypeSelectMenu(props, ref) {
  const { client, saveSelection, selectedMenuOption } = props;
  const authConnectionName = client.pluginClientInstance.context.availableConnections[0];
  //const linkExpiryDict = JSON.parse(JSON.stringify(expiryDate));
  const auth = client.pluginClientInstance.context;
  console.log(auth);
  console.log('hnsjakmjdes', configration);
  const expiryDateDict = [
    { value: '365', label: '1 year' },
    { value: '274', label: '9 Months' },
    { value: '180', label: '6 Months' },
    { value: '90', label: '3 Months' },
  ];
  const [ isCreateAutoLoading, setCreateAutoLoading ] = useState(false);
  const [ isLoading, setIsLoading ] = useState(true);
  const [ isLinkExpLoading, setisLinkExpLoading ] = useState(false);

  const [ enableSaveBtn, setEnableSaveBtn ] = useState(false);
  const [ menuErrorMessage, setMenuErrorMessage ] = useState();
  const [ maxCountErrorMessage, setmaxCountErrorMessage ] = useState();
  const [ dateMessage, setDateErrorMessage ] = useState();
  const [ automationDetails, setAutomationDetails ] = useState([]);
  const [ menuOptions, setMenuOptions ] = useState([]);
  const [ selectedCampaign, setSelectedCampaign ] = useState([]);
  const [ isDateToggled, setdateToggled ] = useState(false);
  const [ isMaxRewardToggled, setMaxRewardToggled ] = useState(false);
  const [ isAllowRepeatRewarding,  setAllowRepeat ] = useState(false);
  const [ maxCountValue, setMaxValue ] = useState('');
  const [ startFocused, setStartFocused ] = useState(false);
  const [ startDate, setStartDate ] = useState('');
  const [ endDate, setEndDate ] = useState('');
  const [ approvalType, setApprovalType ] = useState('yes');
  const [ isAlreadyRewardsSent, setAlreadyRewardsSent ] = useState(false);
  const [ rewardsTriggred, setRewardsTriggred ] = useState(0);
  const [ selectedLinkExpiry, setSelectedLinkExpiry ] = useState('360');
  const [ defaultLink, setDefaultLink ] = useState({ value: '365', label: '1 year' });
  const [ pageErrorMsg, setPageErrorMsg ] = useState();
  const [ ispageError, setPageError ] = useState(false);
  const [ isAutomationCreate, setAutomatioCreated ] = useState(false);

  // const [endFocused , setEndFocused] = useState(false);
  const handleChange = e => {
    setMaxValue(e.target.value);
    setEnableSaveBtn(true);
    client.disableSaveButton();
    setmaxCountErrorMessage('');
    setAutomatioCreated(false);
    //console.log('cfvgbhn', expiryDate);
  };

  useEffect(retrieveSelectMenuOptions, []);

  function nextPageSetup() {
    CreateAndEditAutomation();
  }

  function CreateAndEditAutomation() {
    setPageError(false);
    setAutomatioCreated(false);
    if(isDateToggled && approvalType === 'no') {
      if(startDate === '') {
        setDateErrorMessage('Start date can not be empty');
        return;
      } else if(endDate === '') {
        setDateErrorMessage('End date can not be empty');
        return;
      }
    }
    if(isMaxRewardToggled && approvalType === 'no' && maxCountValue < 1) {
      setmaxCountErrorMessage('Field can???t be ???0 or lessthan that??? please enter any number');
      return;
    }
    if(isMaxRewardToggled && approvalType === 'no' && rewardsTriggred > maxCountValue) {
      setmaxCountErrorMessage('Cannot be lower than the count which has already been triggered.');
      return;
    }

    (async () => {
      if(authConnectionName) {
        try {
          const survey_id =  client.pluginClientInstance.context.userMeta.surveyId;
          setCreateAutoLoading(true);
          const start_dateObj = startDate !== '' && approvalType === 'no' ? moment(startDate).format('YYYY-MM-DD') : moment(new Date()).format('YYYY-MM-DD');
          const end_dateObj = endDate !== '' && approvalType === 'no' && isDateToggled ?  moment(endDate).format('YYYY-MM-DD') : '2030-12-30';
          const url = configration.auth_url;
          const config = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: { 'query': 'qualtrics_ext.mutation.setupExtensionBasedAutomation', 'tag': 'qualtrics_ext', 'variables': { 'add_data': { 'is_extension_based': true, 'platform_id': 16, 'effective_from': start_dateObj, 'effective_to': end_dateObj, survey_id, 'max_reward_count': (approvalType === 'yes' || !isMaxRewardToggled) ? null : maxCountValue ? maxCountValue : null, 'instantApproval': approvalType === 'yes' ? false : true, 'reward_amount': selectedCampaign.denomination_value, 'currency_code': selectedCampaign.currencyCode, 'campaignId': selectedCampaign.campaignId, 'template_id': selectedCampaign.mail_template_id, 'batchexpirydate': selectedLinkExpiry, 'enable_repeat_rewarding': approvalType === 'yes' ? true : isAllowRepeatRewarding } } },
          };

          config.connection = {
            connectionName: authConnectionName,
            paramFormat: 'header',
            paramName: 'Authorization',
            paramTemplate: 'Bearer %s'
          };
          const result = await client.fetch(url, config);
          setCreateAutoLoading(false);
          if(result && result.responseData && result.responseData.data && result.responseData.data.setupExtensionBasedAutomation &&  result.responseData.data.setupExtensionBasedAutomation.success) {
            client.enableSaveButton();
            setEnableSaveBtn(false);
            setAutomatioCreated(true);
          } else {
            client.disableSaveButton();
            setEnableSaveBtn(true);
            setPageError(true);
            setPageErrorMsg(result.responseData.data.setupExtensionBasedAutomation.message ? result.responseData.data.setupExtensionBasedAutomation.message  : 'failed to create automation');
            setAutomatioCreated(false);
          }

        } catch(error) {
          console.log(error);

        } finally {
          setIsLoading(false);
        }
      } else {

        setIsLoading(false);
      }
    }
    )();
  }

  props.biRef.nextPageSetup = nextPageSetup;
  function getAutomationDetails(campaignObj) {
    (async () => {
      if(authConnectionName) {
        setisLinkExpLoading(true);
        try {

          const url = configration.auth_url;
          const config = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: { 'query': 'qualtrics_ext.query.getAutomationBySurveyId', 'tag': 'qualtrics_ext', 'variables': { 'survey_id': client.pluginClientInstance.context.userMeta.surveyId, 'platform_id': 16 } },
          };

          config.connection = {
            connectionName: authConnectionName,
            paramFormat: 'header',
            paramName: 'Authorization',
            paramTemplate: 'Bearer %s'
          };
          const result = await client.fetch(url, config);
          if(result && result.responseData && result.responseData.data && result.responseData.data.getAutomationBySurveyId &&  result.responseData.data.getAutomationBySurveyId.success) {
            if(result.responseData.data.getAutomationBySurveyId.data.length === 0) {
              setisLinkExpLoading(false);
            }
            let campainData = result.responseData.data.getAutomationBySurveyId.data[0];
            setEnableSaveBtn(false);
            client.disableSaveButton();
            if(campainData) {
              setAutomationDetails(campainData);
              console.log(automationDetails);
              if(campainData.additional_details) {
                let approvalTypeObj = campainData.additional_details.automation.approval_type  ? 'no' : 'yes';
                setApprovalType(approvalTypeObj);
                let max_reward_count_obj = campainData.additional_details.automation.max_reward_count;
                let effective_from = campainData.effective_from;
                let effective_to = campainData.effective_to;
                let number_of_awards_triggered = campainData.number_of_awards_triggered;
                let number_of_awards_sent = campainData.number_of_awards_sent;
                setRewardsTriggred(number_of_awards_sent);
                setAlreadyRewardsSent(number_of_awards_triggered >= 1 ? true : false);
                setStartDate(effective_from);
                setEndDate(effective_to);
                setMaxValue(max_reward_count_obj >= 1 ? max_reward_count_obj : null);
                setMaxRewardToggled(max_reward_count_obj >= 1 &&  campainData.additional_details.automation.approval_type ? true : false);
                setdateToggled(campainData.additional_details.automation.approval_type);

              }
              if(campainData.created_action_mapping) {
                if(campainData.created_action_mapping[0]) {
                  let created_action_mapping = campainData.created_action_mapping[0];
                  if(created_action_mapping.then[0]) {
                    let actionmapping = created_action_mapping.then[0];
                    let redeemLinkObj = actionmapping.redeem_link
                      ? actionmapping.redeem_link
                      : '';
                    if(redeemLinkObj) {
                      let onClickCapaignID = redeemLinkObj.single_link_campaign;
                      selectedAutomationCampaign(onClickCapaignID, campaignObj);
                      let enable_repeat_rewarding = redeemLinkObj.enable_repeat_rewarding && campainData.additional_details.automation.approval_type
                        ? true
                        : false;
                      let batch_expiry_date = redeemLinkObj.batch_expiry_date;
                      let filteredAutomationDict = expiryDateDict.filter((i) => i.value === `${batch_expiry_date}`);
                      setDefaultLink(filteredAutomationDict.length !== 0 ? filteredAutomationDict[0] : { value: '365', label: '1 year' });
                      setisLinkExpLoading(false);
                      setAllowRepeat(enable_repeat_rewarding);
                    } else {
                      let enable_repeat_rewarding = false;
                      setAllowRepeat(enable_repeat_rewarding);
                    }
                  }
                }
              }
            }
          } else {
            setisLinkExpLoading(false);
            console.log('error in loading automation details');
          }
        } catch(error) {
          console.log(error);
        } finally {
          setisLinkExpLoading(false);
          setIsLoading(false);
        }
      } else {
        setisLinkExpLoading(false);
        setIsLoading(false);
      }
    }
    )();
  }
  function retrieveSelectMenuOptions() {
    client.disableSaveButton();
    (async () => {
      if(authConnectionName) {
        try {
          const url = configration.auth_url;
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
          if(result.responseData && result.responseData.data && result.responseData.data && result.responseData.data.getOneClickSiteList) {
            const campaign_res = result.responseData.data.getOneClickSiteList;
            let  campaignOptions = [];
            if(campaign_res.success) {

              campaign_res.data.map((val) => {
                val.status === 1
                  ? campaignOptions.push(val)
                  : null;
              });
              setMenuOptions(campaignOptions);
              getAutomationDetails(campaignOptions);
              client.disableSaveButton();
              setEnableSaveBtn(true);
            } else {
              setEnableSaveBtn(false);
              setMenuErrorMessage(client.getText('selectMenuGenericErrorMessage'));
            }
          } else {
            setEnableSaveBtn(false);
            setMenuErrorMessage(client.getText('selectMenuGenericErrorMessage'));
          }

        } catch(error) {
          console.log(error);
          setEnableSaveBtn(false);
          setMenuErrorMessage(client.getText('selectMenuGenericErrorMessage'));
        } finally {
          setIsLoading(false);
        }
      } else {
        setEnableSaveBtn(false);
        setMenuErrorMessage(client.getText('selectMenuGenericErrorMessage'));
        setIsLoading(false);
      }
    }
    )();
  }
  function onApprovalChang(event) {
    setAutomatioCreated(false);
    setApprovalType(event.target.value);
    setEnableSaveBtn(true);
    client.disableSaveButton();
    console.log('evemdsjhewhsy', event);
    if(event.target.value === 'yes') {
      setMaxRewardToggled(false);
      setAllowRepeat(false);
      setdateToggled(false);
    }

  }
  function selectedAutomationCampaign(menuOptionId, menuOptionObj) {
    console.log('hdenjwsqaw', menuOptionId, menuOptionObj);
    // find the the selection
    const newSelectedMenuOption = menuOptionObj.find((menuOption) => {
      return menuOption.campaignId === menuOptionId;
    });

    if(newSelectedMenuOption === undefined) {
      // handle the case that the selection doesn't exist
      setMenuErrorMessage(client.getText('selectMenuOptionInvalidErrorMessage'));
      return;
    }
    setSelectedCampaign(newSelectedMenuOption);
    // props.toggleSaveButtonState(true);
    // setEnableSaveBtn(true);
    // Save it to state
    saveSelection(newSelectedMenuOption);

    // Clear out any error messages
    setMenuErrorMessage();
  }
  function onMenuOptionSelection(menuOptionId) {
    setAutomatioCreated(false);
    // find the the selection
    const newSelectedMenuOption = menuOptions.find((menuOption) => {
      return menuOption.campaignId === menuOptionId;
    });

    if(newSelectedMenuOption === undefined) {
      // handle the case that the selection doesn't exist
      setMenuErrorMessage(client.getText('selectMenuOptionInvalidErrorMessage'));
      return;
    }
    setSelectedCampaign(newSelectedMenuOption);
    //props.toggleSaveButtonState(true);
    setEnableSaveBtn(true);
    client.disableSaveButton();
    // Save it to state
    saveSelection(newSelectedMenuOption);

    // Clear out any error messages
    setMenuErrorMessage();
  }

  function onLinkExpiry(linkOpt) {
    setAutomatioCreated(false);
    setEnableSaveBtn(true);
    client.disableSaveButton();
    setSelectedLinkExpiry(linkOpt);
    setmaxCountErrorMessage('');
  }

  function onChangeOfMaxCount()  {
    setAutomatioCreated(false);
    setEnableSaveBtn(true);
    client.disableSaveButton();
    setMaxRewardToggled(!isMaxRewardToggled);
    setmaxCountErrorMessage('');
  }

  function onChangeOfAllowRepeat()  {
    setAutomatioCreated(false);
    setEnableSaveBtn(true);
    client.disableSaveButton();
    setAllowRepeat(!isAllowRepeatRewarding);
  }

  function onDistributeChnage()  {
    setAutomatioCreated(false);
    setEnableSaveBtn(true);
    client.disableSaveButton();
    setdateToggled(!isDateToggled);
  }
  function handleDateFilterChange(startDate, endDate) {
    setAutomatioCreated(false);
    setEnableSaveBtn(true);
    client.disableSaveButton();
    setStartDate(startDate);
    setEndDate(endDate);
    setDateErrorMessage('');
  }

  function switchToPlum() {
    setAutomatioCreated(false);
    let createCampaignLink = '&dashboard';
    let encryptCreateCampaignLink = Base64.encode(createCampaignLink);
    (async () => {
      if(authConnectionName) {
        try {

          const url = configration.sso_url + 'sso/stores/user';
          const config = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: {
              'landing_page_custom': '/admin/dashboard/?' + encryptCreateCampaignLink
            },
          };

          config.connection = {
            connectionName: authConnectionName,
            paramFormat: 'header',
            paramName: 'Authorization',
            paramTemplate: 'Bearer %s'
          };
          const result = await client.fetch(url, config);
          console.log(result);

          if(result.responseData && result.responseData.data && result.responseData.data) {
            window.open(
              configration.sso_url + 'redirect/stores/'  + result.responseData.data.ssoToken,
              '_blank'
            );
          } else {
            console.log('failed to create automation');
          }

        } catch(error) {
          console.log(error);

        } finally {
          setIsLoading(false);
        }
      } else {

        setIsLoading(false);
      }
    }
    )();

  }

  function createCampaign() {
    setAutomatioCreated(false);
    console.log('create campaign');

    let createCampaignLink = '&createCampaignLink=1';
    let encryptCreateCampaignLink = Base64.encode(createCampaignLink);
    (async () => {
      if(authConnectionName) {
        try {

          const url = configration.sso_url + 'sso/stores/user';
          const config = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: {
              'landing_page_custom': '/admin/campaign/xoxo-link-campaign/?' + encryptCreateCampaignLink
            },
          };

          config.connection = {
            connectionName: authConnectionName,
            paramFormat: 'header',
            paramName: 'Authorization',
            paramTemplate: 'Bearer %s'
          };
          const result = await client.fetch(url, config);
          console.log(result);

          if(result.responseData && result.responseData.data && result.responseData.data) {
            window.open(
              configration.sso_url + 'redirect/stores/'  + result.responseData.data.ssoToken,
              '_blank'
            );
          } else {
            console.log('failed to create automation');
          }

        } catch(error) {
          console.log(error);

        } finally {
          setIsLoading(false);
        }
      } else {

        setIsLoading(false);
      }
    }
    )();

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

    <div>
      <div className='wrap'>
        {ispageError ? <div className='error-Banner'>
          <div className='error-banner-text'>
            {pageErrorMsg}
          </div>
        </div> : null}
        <div className='text-center'>
          <Button disabled={ selectedCampaign.length === 0 ? true : !enableSaveBtn  } className="save-btn" kind='primary' onClick={CreateAndEditAutomation}>{isCreateAutoLoading ? <LoadingSpinner background='fade' show={isCreateAutoLoading} size='small'></LoadingSpinner> : isAutomationCreate ? 'Saved' : 'Save'  }</Button>
        </div>
        <div className='config-campaign'>
          <div className='heading'>
          Configure Xoxoday Rewards
          </div>
          <span
            className='helper-text-blue'
            onClick={() => {
              switchToPlum();
            }}          >
            {'Click here'} {' '}
          </span>
          <span
            className='helper-text'

          >
            {'to access your Xoxoday Account.'}{' '}
          </span>
          <span
            className='helper-text-blue'
            onClick={() => {

              window.open('https://help.xoxoday.com/plum/user-guide/integrations/qualtrics/workflow-extension', '_blank');
            }}
            // onClick={this.redirectToCreateCampaign}

          >
            {'Learn how'}{' '}
          </span>
          <span
            className='helper-text'
          >
          to use Xoxodays Qualtrics extension.
          </span>
        </div>
        <div className='config-content'>
          <div className='floatleft'>
            <div className='campaign-section-heading '>
              {client.getText('configCampaign')}
            </div>
            <div className="selectCampaignContainer">
              <Label className='helper-text'>
                {client.getText('selectMenuWrapperLabel')} {' '}
                <span
                  className='helper-text-blue'
                  onClick={() => {
                    createCampaign();
                    console.log('clicked 4');
                  }}
                  // onClick={this.redirectToCreateCampaign}

                >
          Create New Campaign.
                </span>
              </Label>
              <LoadingSpinner background='fade' show={isLoading} size='small'>
                <SelectMenu
                  label={getLabel()}
                  disabled={isLoading || isAlreadyRewardsSent}
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

            <div>
              <RadioGroup label="Approval Required?" name="example1" onChange={onApprovalChang} defaultValue={approvalType} value = {approvalType}>
                <RadioOption value="yes" label="Yes"  disabled = {isAlreadyRewardsSent} />
                <RadioOption value="no" label="No" disabled = {isAlreadyRewardsSent} />
              </RadioGroup>
            </div>

            <div className='linkExpiry'>
              <div className="selectMenuContainer">
                <Label className='section-heading'>
                  {client.getText('linkExpiry')}
                </Label>
                <LoadingSpinner background='fade' show={isLinkExpLoading} size='small'>
                  <SelectMenu
                    //label={getLabel()}
                    defaultLabel={defaultLink.label}
                    defaultValue={defaultLink.label}
                    onChange={onLinkExpiry}
                    className="selectMenu"
                    disabled={isLinkExpLoading }

                  >

                    {expiryDateDict.map(expiry => {
                      return (
                        <MenuItem
                          key={expiry.value}
                          value={expiry.value}
                        >
                          {expiry.label}
                        </MenuItem>
                      );
                    })}
                  </SelectMenu>
                </LoadingSpinner>

              </div>
            </div>
            <div>
            </div>

          </div>
          <div className='floatright'>
            <div className='section-heading'>
              {client.getText('additionalSetting')}
            </div>
            <div
              style={{ display: 'flex', justifyContent: 'space-between', marginRight: '10px', alignItems: 'baseline' }}
            >
              <h4 className='section-description'>
        Set automation date range{' '}
                <p className='sub-section-description'>
          Select the duration for which the reward automation will be active. {' '}
                </p>
              </h4>

              <Switch style={{ marginTop: 12 }} onChange={onDistributeChnage} disabled = {approvalType === 'yes' ? true : false} checked = {isDateToggled}/>
            </div>
            {isDateToggled ?

              <DateRangePicker
                startDate={startDate ? moment(startDate) : null} // momentPropTypes.momentObj or null,
                startDateId="your_unique_start_date_id" // PropTypes.string.isRequired,
                endDate={endDate ? moment(endDate) : null} // momentPropTypes.momentObj or null,
                endDateId="your_unique_end_date_id" // PropTypes.string.isRequired,
                onDatesChange= {({ startDate, endDate }) => handleDateFilterChange(startDate, endDate)} // PropTypes.func.isRequired,
                focusedInput={startFocused} // PropTypes.oneOf([START_DATE, END_DATE]) or null,
                onFocusChange={focusedInput => setStartFocused(focusedInput)} // PropTypes.func.isRequired,
                displayFormat = {'DD/MM/YYYY'}
              />

              : null}
            {dateMessage && isDateToggled &&
              <div>
                <span className='errorMsg'>{dateMessage}</span>
              </div>
            }
            <div
              style={{ display: 'flex', justifyContent: 'space-between', marginRight: '10px', alignItems: 'baseline' }}
            >
              <h4 className='section-description'>
            Set maximum reward count{' '}
                <p className='sub-section-description'>
              Define the maximum number of rewards that will be sent out automatically. {' '}
                </p>
              </h4>
              <Switch style={{ marginTop: 12 }} onChange={onChangeOfMaxCount} disabled = {approvalType === 'yes' ? true : false} checked = {isMaxRewardToggled}/>
            </div>
            {isMaxRewardToggled ?
              <div>
                <Input className="_2NEGNnn" type="number" value={maxCountValue} placeholder = "eg :50" onChange={handleChange}/>
              </div> :  null}
            <div>
              {maxCountErrorMessage && isMaxRewardToggled &&
            <div>
              <span className='errorMsg'>{maxCountErrorMessage}</span>
            </div>
              }
            </div>
            <div
              style={{ display: 'flex', justifyContent: 'space-between', marginRight: '10px', alignItems: 'baseline' }}
            >
              <h4 className='section-description'>
            Allow repeat-rewarding{' '}
                <p className='sub-section-description'>
              On enabling repeat-rewarding, the same person can receive rewards multiple times.  {' '}
                </p>
              </h4>

              <Switch style={{ marginTop: 12 }} onChange={onChangeOfAllowRepeat} disabled = {approvalType === 'yes' ? true : false} checked = {isAllowRepeatRewarding}/>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { SelectMenu, MenuItem, LoadingSpinner, Label, RadioGroup, RadioOption, Switch, Input } from '@qualtrics/ui-react';
import {
  DateRangePicker
}                           from 'react-dates';
import 'react-dates/initialize';
//import {DateRangePicker} from 'react-dates';
import 'react-dates/lib/css/_datepicker.css';
import moment               from 'moment';
//import { toUpper } from 'lodash';
export function RideTypeSelectMenu(props, ref) {
  const { client, saveSelection, selectedMenuOption } = props;
  const authConnectionName = client.pluginClientInstance.context.availableConnections[0];

  // client.pluginClientInstance.context.availableConnections[0];

  const [ isLoading, setIsLoading ] = useState(true);
  const [ menuErrorMessage, setMenuErrorMessage ] = useState();
  const [ maxCountErrorMessage, setmaxCountErrorMessage ] = useState();
  const [ dateMessage, setDateErrorMessage ] = useState();
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
  // const [endFocused , setEndFocused] = useState(false);
  const handleChange = e => {
    console.log('Change handler called!', maxCountValue);
    setMaxValue(e.target.value);
  };
  // const [ isDateToggled, setdateToggled ] = useState(false);
  // const toggledate = () => setdateToggled(!isDateToggled);

  useEffect(retrieveSelectMenuOptions, []);

  //useEffect(nextPageAction, []);

  function nextPageSetup() {
    console.log('came to child page page ....', selectedCampaign, approvalType);
    CreateAndEditAutomation();
  }

  function CreateAndEditAutomation() {
    if(isDateToggled && approvalType === 'yes') {
      if(startDate === '') {
        console.log('start date empty');
        setDateErrorMessage('Start date can not be empty');
        return;
      } else if(endDate === '') {
        console.log('end date empty');
        setDateErrorMessage('End date can not be empty');
        return;
      }
    }
    if(isMaxRewardToggled && approvalType === 'yes' && maxCountValue < 1) {
      setmaxCountErrorMessage('Field can’t be “0 or lessthan that” please enter any number');
      return;
    }

    (async () => {
      if(authConnectionName) {
        try {
          const survey_id =  client.pluginClientInstance.context.userMeta.surveyId;

          const start_dateObj = startDate !== '' ? moment(startDate).format('YYYY-MM-DD') : moment(new Date()).format('YYYY-MM-DD');
          const end_dateObj = endDate !== '' ?  moment(endDate).format('YYYY-MM-DD') : '2030-12-30';
          const url = 'https://empulsqaenv.xoxoday.com/chef/v1/oauth/api';
          const config = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: { 'query': 'qualtrics_ext.mutation.setupExtensionBasedAutomation', 'tag': 'qualtrics_ext', 'variables': { 'add_data': { 'is_extension_based': true, 'platform_id': 16, 'effective_from': start_dateObj, 'effective_to': end_dateObj, survey_id, 'max_reward_count': maxCountValue, 'instantApproval': approvalType === 'yes' ? true : false, 'reward_amount': selectedCampaign.denomination_value, 'currency_code': selectedCampaign.currencyCode, 'campaignId': selectedCampaign.campaignId, 'template_id': selectedCampaign.mail_template_id, 'batchexpirydate': 90, 'enable_repeat_rewarding': isAllowRepeatRewarding } } },
          };

          config.connection = {
            connectionName: authConnectionName,
            paramFormat: 'header',
            paramName: 'Authorization',
            paramTemplate: 'Bearer %s'
          };
          const result = await client.fetch(url, config);
          console.log(result);
          if(result && result.responseData && result.responseData.data && result.responseData.data.setupExtensionBasedAutomation &&  result.responseData.data.setupExtensionBasedAutomation.success) {
            console.log('dcfvgbhnj');
            props.moveToNextPage(2);
          } else {
            console.log('failed to create automation');
          }
          // if(result.responseData && result.responseData.data && result.responseData.data && result.responseData.data.getOneClickSiteList) {
          //   const campaign_res = result.responseData.data.getOneClickSiteList;
          //   if(campaign_res.success) {
          //     setMenuOptions(campaign_res.data);
          //   } else {
          //     setMenuErrorMessage(client.getText('selectMenuGenericErrorMessage'));
          //   }
          // } else {
          //   setMenuErrorMessage(client.getText('selectMenuGenericErrorMessage'));
          // }

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

  props.biRef.nextPageSetup = nextPageSetup;

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
  function onApprovalChang(event) {
    setApprovalType(event.target.value);

    if(event.target.value === 'no') {
      setMaxRewardToggled(false);
      setAllowRepeat(false);
      setdateToggled(false);
    }

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
    setSelectedCampaign(newSelectedMenuOption);
    props.toggleSaveButtonState(true);
    // Save it to state
    saveSelection(newSelectedMenuOption);

    // Clear out any error messages
    setMenuErrorMessage();
  }

  function onChangeOfMaxCount()  {
    setMaxRewardToggled(!isMaxRewardToggled);

  }

  function onChangeOfAllowRepeat()  {
    setAllowRepeat(!isAllowRepeatRewarding);
  }

  function onDistributeChnage()  {
    setdateToggled(!isDateToggled);
  }
  function handleDateFilterChange(startDate, endDate) {
    setStartDate(startDate);
    setEndDate(endDate);
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
        <div className='floatleft'>
          <div className='section-heading'>
            {client.getText('configCampaign')}
          </div>
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

          <div>
            <RadioGroup label="Approval Required?" name="example1" onChange={onApprovalChang} defaultValue={approvalType}>
              <RadioOption value="yes" label="Yes" />
              <RadioOption value="no" label="No" />
            </RadioGroup>
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

            <Switch style={{ marginTop: 12 }} onChange={onDistributeChnage} disabled = {approvalType === 'no' ? true : false} checked = {isDateToggled}/>
          </div>
          {isDateToggled ?

            <DateRangePicker
              startDate={startDate} // momentPropTypes.momentObj or null,
              startDateId="your_unique_start_date_id" // PropTypes.string.isRequired,
              endDate={endDate} // momentPropTypes.momentObj or null,
              endDateId="your_unique_end_date_id" // PropTypes.string.isRequired,
              onDatesChange= {({ startDate, endDate }) => handleDateFilterChange(startDate, endDate)} // PropTypes.func.isRequired,
              focusedInput={startFocused} // PropTypes.oneOf([START_DATE, END_DATE]) or null,
              onFocusChange={focusedInput => setStartFocused(focusedInput)} // PropTypes.func.isRequired,
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
            <Switch style={{ marginTop: 12 }} onChange={onChangeOfMaxCount} disabled = {approvalType === 'no' ? true : false} checked = {isMaxRewardToggled}/>
          </div>
          {isMaxRewardToggled ?
            <div>
              <Input className="_2NEGNnn" type="number"  onChange={handleChange}/>
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
            Allow repeat rewarding{' '}
              <p className='sub-section-description'>
              On enabling repeat rewarding, the same person can recieve rewards multiple times.  {' '}
              </p>
            </h4>

            <Switch style={{ marginTop: 12 }} onChange={onChangeOfAllowRepeat} disabled = {approvalType === 'no' ? true : false} checked = {isAllowRepeatRewarding}/>

          </div>

        </div>
      </div>

    </div>
  );
}

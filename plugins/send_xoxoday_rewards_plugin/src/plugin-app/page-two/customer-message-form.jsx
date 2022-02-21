import React from 'react';
import { InputField } from '@qualtrics/ui-react';

export function CustomerMessageForm(props) {
  const { client, customerMessage, saveMessage } = props;
  return (
    <>
      <div className='section-content'>
        {client.getText('customerMessageInstructions')}
      </div>
      <InputField multiline full
        label={client.getText('customerMessageLabel')}
        value={customerMessage}
        rows={5}
        onChange={(event) => saveMessage(event.target.value)}
      />
    </>
  );
}

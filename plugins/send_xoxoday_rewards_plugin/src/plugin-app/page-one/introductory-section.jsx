// External (npm) dependencies
import React from 'react';

export function IntroductorySection(props) {
  const client = props.client;

  return (
    <div className='section-content'>
      {client.getText('introContent')}
    </div>
  );
}

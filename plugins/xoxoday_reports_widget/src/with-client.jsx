import React, { useEffect, useState } from 'react';
import PluginClient from '@qualtrics/pluginclient';
import isEqual from 'lodash/isEqual';
import mapValues from 'lodash/mapValues';

export default function WithClient({ height, children }) {
	const [client, setClient] = useState();
	const [outerProps, setOuterProps] = useState();
	const [context, setContext] = useState();
	const hasHeight = height !== undefined;

	useEffect(() => {
		let isCanceled = false;
		if (!client) {
			const initializeClient = async () => {
				let previousProps;
				const newClient = await PluginClient.initialize({
					update(newProps) {
						// Preserve object identity when props are deeply equal.
						// Otherwise, you hit issues with the use of useEffect.
						previousProps = avoidCopy(previousProps, newProps)
						setOuterProps(previousProps);
					}
				});
				if (isCanceled) {
					return;
				}
				setContext(newClient.getContext());
				setClient(newClient);

				if (hasHeight) {
					newClient.postMessage('onResize', { height });
				}
			};
			initializeClient();
		}
		return () => {
			isCanceled = true;
		};
	}, []);

	if (!client || !outerProps) {
		return null;
	}

	const style = {
		// Position of parent must be relative in order for resize observer to work.
		position: 'relative',
	};

	if (!hasHeight) {
		style.height = '100%';
	}

	const Content = children;

	return (
		<div style={style}>
			<Content
				client={client}
				context={context}
				{...outerProps}
			/>
		</div>
	);
}

function avoidCopy(previousProps, newProps) {
	if (previousProps) {	
		let foundDifference = false;
		newProps = mapValues(newProps, (newProp, key) => {
			const previousProp = previousProps[key];
			if (isEqual(previousProp, newProp)) {
				return previousProp;
			}
			foundDifference = true;
			return newProp;
		});
		if (!foundDifference) {
			return previousProps;
		}
	}
	return newProps;
}

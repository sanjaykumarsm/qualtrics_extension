import render from './render';
import DataConfigurationPanel from './data-configuration-panel';
import ViewConfigurationPanel from './view-configuration-panel';
import PanelContainer from './panel-container';
import WithClient from './with-client';

function ConfigurationPanel() {
	return (
		<WithClient height={262}>
			{Content}
		</WithClient>
	)
}

function Content({
	client,
	dataConfiguration,
	viewConfiguration,
	dataSource,
	data
}) {
	return (
		<PanelContainer>
			<DataConfigurationPanel
				client={client}
				configuration={dataConfiguration}
			/>
			<ViewConfigurationPanel
				client={client}
				data={data}
				configuration={viewConfiguration}
			/>
		</PanelContainer>
	);
}

render(ConfigurationPanel);

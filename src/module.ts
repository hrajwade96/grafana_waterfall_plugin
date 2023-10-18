import { PanelPlugin } from '@grafana/data';
import { SimpleOptions } from './types';
import { WaterfallPanel } from './components/WaterfallPanel';

// Exporting the plugin
export const plugin = new PanelPlugin<SimpleOptions>(WaterfallPanel).setPanelOptions((builder) => {
  return builder
    // .add... (here you can add input fields, color pickers, etc. to the options pane)
    .addNumberInput({
      path: 'lineWidth',
      name: 'Line Width',
      description: 'Defines the width of the timeline lines',
    })
    // Add other options here
    ;
});

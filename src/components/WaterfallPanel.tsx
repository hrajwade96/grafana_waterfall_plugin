import React, { PureComponent } from 'react';
import { PanelProps } from '@grafana/data';
import { SimpleOptions } from 'types';
import * as vis from 'vis-timeline.js';

interface Props extends PanelProps<SimpleOptions> { }

export class WaterfallPanel extends PureComponent<Props> {
  state = {
    itemsData: [],
  };

  componentDidMount() {
    // Here, you might want to set up additional event listeners or fetch initial data
    const { data } = this.props;
    let sample = '' + data;
    console.log(sample);
    // The 'data' prop will contain the time series or table data.
    // You need to parse this data to a format that your visualization understands.
    //const itemsData = parseData(data);

    // Now you can create the timeline with this data
    // this.createTimeline(itemsData);
  }

  handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    let file = e.target.files?.[0];
    if (!file) {
      return;
    }

    let reader = new FileReader();
    reader.onload = (e) => {
      let contents = e.target?.result;
      try {
        let data = JSON.parse(contents as string);
        this.createTimeline(data);
      } catch (e) {
        alert('Invalid JSON file');
      }
    };

    reader.readAsText(file);
  };

  handleCollapsibleClick = () => {
    const collapsible = document.getElementsByClassName('collapsible')[0];
    collapsible.classList.toggle("active");
    let content = collapsible.nextElementSibling as HTMLElement;
    if (content.style.display === "block") {
      content.style.display = "none";
    } else {
      content.style.display = "block";
    }
  };

  handleLoadData = () => {
    try {
      const jsonData = (document.getElementById('jsonData') as HTMLTextAreaElement).value;
      const itemsData = JSON.parse(jsonData);
      this.createTimeline(itemsData);
    } catch (e) {
      alert('Invalid JSON data');
      console.error(e);
    }
  };

  createTimeline = (itemsData: any[]) => {
    let container = document.getElementById("visualization");
    let items = new vis.DataSet(itemsData);

    let options = {
      format: {
        minorLabels: {
          millisecond: 's.SSS',
        }
      },
      zoomMin: 1000,
      zoomMax: 10000000,
      showCurrentTime: false,
      align: 'left',
      orientation: { axis: 'both', item: 'top' },
      height: 600,
      margin: {
        axis: 100
      }
    };

    let timeline = new vis.Timeline(container, items, options);
    let diff;

    timeline.on('rangechange', function () {
      let range = timeline.getWindow();
      itemsData.forEach(function (item) {
        let start = new Date(item.start).getTime();
        let end = new Date(item.end).getTime();
        if (start >= range.start && end <= range.end) {
          diff = end - start; // Calculate the difference in milliseconds
          let element = timeline.itemSet.items[item.id].dom.box;
          element.setAttribute("title", item.content + " (" + formatDateTimeWithMilliseconds(new Date(item.start)).toLocaleString() + " - " + formatDateTimeWithMilliseconds(new Date(item.end)).toLocaleString() + '\nduration is ' + diff + 'ms' + ")");
        }
      });
    });

    function formatDateTimeWithMilliseconds(date: Date) {
      const options: Intl.DateTimeFormatOptions = { // Explicitly declaring the type here for clarity
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      };

      let formattedDate = date.toLocaleString('en-US', options);

      // Retrieve milliseconds and convert to a 3-character-long string
      const milliseconds = date.getMilliseconds();
      const millisecondsStr = milliseconds.toString().padStart(3, '0');

      // Append milliseconds to the formatted date
      formattedDate += '.' + millisecondsStr;
      return `${formattedDate}`;
    }
  };

  render() {
    const { width, height } = this.props;

    return (
      <div style={{ width, height }}>
        <input
          type="file"
          id="upload"
          accept=".json"
          onChange={this.handleFileUpload}
        />
        <textarea id="jsonData" placeholder="Paste your JSON data here..."></textarea>
        <button onClick={this.handleLoadData}>Load Data</button>
        <button className="collapsible" onClick={this.handleCollapsibleClick}>Toggle Collapsible</button>
        <div className="content" style={{ display: 'none' }}>
          {/* Content here */}
        </div>
        <div id="visualization" style={{ width: '100%', height: '80vh', border: '1px solid lightgray' }}></div>

        {/* Inject styles directly */}
        <style>{`
          /* ... your CSS styles ... */
        `}</style>
      </div>
    );
  }
}

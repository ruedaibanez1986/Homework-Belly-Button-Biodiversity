init();

// ================================
function init() {
	// Reference dropdown menu and store in variable called 'selector'
	var selector = d3.select('#selDataset');

	// Fetch the JSON data
	d3.json('samples.json').then((data) => {
		// Create variable to hold all the names
		var sampleNames = data.names;
		//console.log(data);

		// Modify the selector for each name
		sampleNames.forEach((sample) => {
			selector
				// Add 'option' tag
				.append('option')
				// Text displayed on user interface
				.text(sample)
				// Add 'value' attribute to each tag and assign 'sample' to it
				.property('value', sample);
		});

		// Pick first name to be the default data for our graphs
		var firstSample = sampleNames[0];

		buildCharts(firstSample);
		buildMetadata(firstSample);
		buildGauge(firstSample);
	});
}

// Function to build the tables with user input
// optionChanged found inside index.html
function optionChanged(newSample) {
	buildCharts(newSample);
	buildMetadata(newSample);
	buildGauge(newSample);
}

// Create function to populate 'Demographic Info' table
function buildMetadata(sample) {
	// Fetch the JSON data
	d3.json('samples.json').then((data) => {
		// Create variable to hold all the metadata
		var metadata = data.metadata;

		// Wherever userinput id matches id within the metadata, pull it out and place into variable called 'resultArray'
		var resultArray = metadata.filter((sampleObj) => sampleObj.id == sample);

		// Specify the object that we want and place into variable 'result'
		var result = resultArray[0];

		// Reference location to put metadata and place into variable 'panel'
		var panel = d3.select('#sample-metadata');

		// First empty out any data in that location
		panel.html('');

		// Go through each key:value pair, and add the text to the 'Demographic Info' table
		// 'result' is our parameter specificed above
		Object.entries(result).forEach(([ key, value ]) => {
			panel.append('h6').text(`${key.toUpperCase()}: ${value}`);
		});
	});
}

// Create function that will build the graphs

function buildCharts(sample) {
	// Fetch JSON data
	d3.json('samples.json').then((data) => {
		// 'samples' w/in samples.json contains the data we want to make the graphs, so place that into a variable called 'samples'
		var samples = data.samples;

		// Within 'samples' from samples.json, find the id that matches the user input (=sample) in drop down menu
		var resultArray = samples.filter((sampleObj) => sampleObj.id == sample);

		// Pull that specific samples object out and place into a variable called 'result'
		var result = resultArray[0];

		// Variables to hold the various data for our charts
		var otu_ids = result.otu_ids;
		var otu_labels = result.otu_labels;
		var sample_values = result.sample_values;
		console.log('sample_values:', sample_values);

		// Want bar chart of top 10, highest on top; need to slice and reverse
		var otu_ids_sliced = otu_ids.slice(0, 10).reverse();
		var otu_labels_sliced = otu_labels.slice(0, 10).reverse();
		var sample_values_sliced = sample_values.slice(0, 10).reverse();

		// BAR CHART
		var barData = [
			{
				x: sample_values_sliced,
				y: otu_ids_sliced.map((otuID) => `OTU${otuID}`),
				// hover text
				text: otu_labels_sliced,
				type: 'bar',
				orientation: 'h',
				marker: {
					color: 'rgb(5, 108, 192)',
					opacity: 1.6,
					line: {
						color: 'rgb(8,48,107)',
						width: 1.0
					}
				}
			}
		];
		var barLayout = {
			title: 'Top 10 Bacteria Cultures Found',
			margin: { t: 100, l: 90, r: 40 }
		};
		Plotly.newPlot('bar', barData, barLayout);

		// BUBBLE CHART
		var bubbleLayout = {
			title: 'Bacteria Cultures Per Sample',
			hovermode: 'closest',
			xaxis: { title: 'OTU ID' },
			margin: { t: 30 }
		};
		var bubbleData = [
			{
				x: otu_ids,
				y: sample_values,
				text: otu_labels,
				mode: 'markers',
				marker: {
					size: sample_values,
					color: otu_ids,
					colorscale: 'Bluered'
				}
			}
		];
		Plotly.newPlot('bubble', bubbleData, bubbleLayout);
	});
}

// Function to make the gauge chart
function buildGauge(display) {
	d3.json('samples.json').then((data) => {
		var metadata = data.metadata;
		var resultArray = metadata.filter((sampleObj) => sampleObj.id == display);
		var result = resultArray[0];
		var washFreq = result.wfreq;
		console.log('Gauge washFreq:', washFreq);
		var data = [
			{
				domain: { x: [ 0, 1 ], y: [ 0, 1 ] },
				value: washFreq,
				title: { text: 'Hand Wash Frequency', font: { size: 18 } },
				type: 'indicator',
				mode: 'gauge+number',
				gauge: {
					axis: { range: [ null, 9 ], tickwidth: 1.0, tickcolor: 'darkblue' },
					bar: { color: 'darkblue' },
					borderwidth: 2,
					bordercolor: 'gray',
					steps: [
						{ range: [ 0, 1 ], color: '#33cca6' },
						{ range: [ 1, 2 ], color: '#33cccc' },
						{ range: [ 2, 3 ], color: '#33a6cc' },
						{ range: [ 3, 4 ], color: '#3380cc' },
						{ range: [ 4, 5 ], color: '#3359cc' },
						{ range: [ 5, 6 ], color: '#3333cc' },
						{ range: [ 6, 7 ], color: '#5933cc' },
						{ range: [ 7, 8 ], color: '#8033cc' },
						{ range: [ 8, 9 ], color: '#a633cc' }
					]
				}
			}
		];

		var layout = {
			width: 465,
			height: 400,
			margin: { t: 25, r: 25, l: 25, b: 25 },
			font: {
				color: 'darkblue',
				family: 'Arial'
			}
		};
		Plotly.newPlot('gauge', data, layout);
	});
}

// Thomas Povinelli
// sketch based off Coding Challenge 92: XOR Problem
// from the Coding Train
// https://www.youtube.com/watch?v=188B6k_F9jU

// Neural Network Library also from Coding Train
// https://github.com/CodingTrain/Toy-Neural-Network-JS

let brain;
let going = true;
let hiddenSlider;
let learningRateSlider;
let statusDiv;
let frameRateDiv;

const solutionWidth = 200;
const solutionHeight = 200;

let graphWidth;
let graphHeight;

function setup() {
  // add status message for whether the network is training
  statusDiv = createDiv('Running');
  statusDiv.style('color', 'green');
  statusDiv.style('font-weight', '800');

  // Slider to change number of hidden nodes and div displaying number of hidden nodes
  let nodesDiv = createDiv('Hidden Nodes: 4 (Changing this resets the training!)');
  hiddenSlider = createSlider(1, 10, 4, 1);
  hiddenSlider.input(() => {
    brain = new NeuralNetwork(2, hiddenSlider.value(), 1);
    nodesDiv.html(`Hidden Nodes: ${hiddenSlider.value()} (Changing this resets the training!)`);
    losses = [];
  });

  // Slider to change number of learning rate and div displaying number of learning rate
  let learningDiv = createDiv('Learning Rate: 0.2');
  learningRateSlider = createSlider(0.01, 0.5, 0.2, 0.01);
  learningRateSlider.input(() => {
    brain.setLearningRate(learningRateSlider.value());
    learningDiv.html(`Learning Rate: ${learningRateSlider.value()}`);
  });

  // Slider to change number of training epochs per frame and div displaying number of training epochs per frame
  let epochsDiv = createDiv('Epochs per Frame: 55');
  epochsSlider = createSlider(1, 250, 55, 1);
  epochsSlider.input(() => {
    stepsDiv.html(`Epochs per Frame: ${epochsSlider.value()}`);
  });

  frameRateDiv = createDiv('');

  let canvas = createCanvas(600, 200);
  let container = select('#canvas-container');
  canvas.parent(container);

  pixelDensity(1);

  brain = new NeuralNetwork(2, 5, 1);

  graphWidth = width - 200;
  graphHeight = height;

  let footer = createP('Sketch by Thomas Povinelli.');
  footer.attribute('class', 'footer')
}

function keyPressed() {
  if (key == ' ') {
    if (going) {
      console.log('Sketch Stopped')
      noLoop();
      statusDiv.html('Stopped');
      statusDiv.style('color', 'red');
    } else {
      console.log('Sketch Started')
      loop();
      statusDiv.html('Running');
      statusDiv.style('color', 'green');
    }
    going = !going;
  } else if (key == 'P') {
    brain.print_last_errors();
  }
}


// keep track of error values for drawing the graph
let losses = [];

function draw() {
  background(0);

  // train the NN
  frameRateDiv.html(`Framerate: ${frameRate()}`);
  for (let i = 0; i < epochsSlider.value(); i++) {
    brain.train([0, 0], [0]);
    brain.train([0, 1], [1]);
    brain.train([1, 0], [1]);
    brain.train([1, 1], [0]);
  }

  // Predict XOR for each pixel
  loadPixels();
  for (let x = 0; x < solutionWidth; x++) {
    for (let y = 0; y < solutionHeight; y++) {
      let idx = (x + y * width) * 4;
      let prediction = brain.predict([x / solutionWidth, y / solutionHeight])[0];
      pixels[idx] = prediction * 255;
      pixels[idx + 1] = prediction * 255;
      pixels[idx + 2] = prediction * 255;
    }
  }
  updatePixels();

  // Save the loss this frame
  let loss = brain.last_errors.data[0][0];
  losses.push(loss);


  // Draw the loss graph
  fill(255);
  stroke(255);
  let x = solutionWidth + 10;
  let offset = graphWidth / losses.length;

  let px, py;

  for (let i = 0; i < losses.length; i++) {
    let y = map(losses[i], -1, 0, 10, graphHeight - 10);

    ellipse(x, y, 3, 3);
    if (px && py) {
      line(px, py, x, y);
    }
    px = x;
    py = y;

    x += offset;
  }
}
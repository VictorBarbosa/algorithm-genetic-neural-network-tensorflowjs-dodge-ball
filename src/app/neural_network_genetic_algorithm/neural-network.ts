import * as tf from '@tensorflow/tfjs'
export default class NeuralNetwork {

  model!: tf.Sequential
  constructor(private hidden: number, private inputShape: number, private outputShape: number) {
    tf.setBackend('cpu')
    this.createModel()
  }

  private createModel() {
    const model = tf.sequential();

    model.add(tf.layers.dense({ units: this.hidden, inputShape: [this.inputShape], activation: 'relu' }));

    model.add(tf.layers.dense({ units: this.outputShape, activation: 'softmax' }));

    this.model = model
  }


  predictLabel(input: number[], classes: string[]) {

    const prediction = this.model.predict(tf.tensor([input])) as tf.Tensor
    const arg = (prediction.argMax(1) as any).arraySync()[0] as number

    return classes[arg]


  }

}

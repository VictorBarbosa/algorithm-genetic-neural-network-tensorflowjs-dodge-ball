import * as p5 from "p5";
import * as tf from '@tensorflow/tfjs'
import NeuralNetwork from "../neural_network_genetic_algorithm/neural-network";
import Obstacle from './obstacle';
export default class Player {

  /**
   * Width
   */
  w: number = 50

  /**
   * Heght
   */
  h: number = 50

  /**
   * Y position
   */
  y: number = window.innerHeight - 80

  /**
   * X position
   */
  x: number = (window.innerWidth + (this.w / 2)) / 2

  /**
   *  Tell us if the player is alive or not
   */
  isAlive = true;

  /**
   * Score , count the score to genetic algorithm
   */
  score = 0;

  /**
   * Color of the player
   */
  color: string = ''

  /**
   * Count the size of the movements
   */
  movements = 7;

  /**
   * Tell us what is the current generation
   */
  generation = 0;

  /**
   * Neural network made in tensorflow
   */
  brain!: NeuralNetwork

  /**
  *
  * @param p
  */
  constructor(private p: p5) {
    this.brain = new NeuralNetwork(8, 2, 3)
    this.keyPress(p);
    this.color = this.getColor();
    this.isAlive = true;
  }

  /**
   * Get a ramdon color to player
   * @returns Return a random collor
   */
  getColor() {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  /**
   * You can move the player
   * @param p
   */
  keyPress(p: p5) {
    p.keyPressed = (p: p5) => {
      console.log(p.keyCode)

      if (p.keyCode === 65 || p.keyCode === 37) {
        this.left()
      }
      if (p.keyCode === 68 || p.keyCode === 39) {
        this.right()
      }

    }
  }

  /**
   * left movement
   */
  left() {
    if (this.x > 0) {
      this.x -= this.movements;
    }
  }

  /**
   * Right movement
   */
  right() {
    if (this.x < window.innerWidth - this.w) {
      this.x += this.movements;
    }
  }

  /**
   * Display and draw the player
   */
  show(obs: Obstacle) {
    this.p.fill(this.color)
    this.p.rect(this.x, this.y, this.w, this.h);

    obs.update
    let xPosition = 0


    if (obs.targetX > this.x) {
      xPosition = obs.targetX - this.x
    } else {
      xPosition = this.x - obs.targetX
    }

    this.score = + 1 - xPosition + obs.isOffscreenScore()
  }


  /**
   * The method to predict the movements
   * @param obstacle
   */
  think(obstacle: Obstacle) {

    const input = [];

    input[0] = obstacle.targetX - this.x + 10;
    input[1] = this.y - obstacle.targetY + 50;

    this.p.text("*", this.x + 20, this.y)
    const ret = this.brain.predictLabel(input, ['left', 'right', 'no-move'])

    if (ret === 'left') {
      this.left()
    }
    if (ret === 'right') {
      this.right()
    }
  }


  /**
   *
   * @param mutationRate
   */
  mutate(mutationRate: number) {
    // this.neuralNetwork.mutate(mutationRate)
    const model = this.brain.model; // Clone o modelo para evitar mutações diretas

    // Percorra todas as camadas do modelo
    model.layers.forEach((layer: any) => {
      // Obtenha os pesos da camada
      const weights = layer.getWeights();

      // Percorra cada matriz de pesos e adicione uma mutação
      const mutatedWeights = weights.map((weight: any) => {
        const shape = weight.shape;
        const values = weight.arraySync() as number[][]; // Certifique-se de que o dtype seja compatível

        for (let i = 0; i < shape[0]; i++) {
          for (let j = 0; j < shape[1]; j++) {
            if (Math.random() < mutationRate) {
              // Adicione uma pequena mutação ao peso
              const mutation = (Math.random() * 2 - 1) * 0.1; // Pequena mutação aleatória
              values[i][j] += mutation;
            }
          }
        }

        return tf.tensor(values, shape, 'float32');
      });

      // Defina os novos pesos mutados para a camada
      layer.setWeights(mutatedWeights);
    });

    // Defina o novo modelo mutado no indivíduo
    this.brain.model = model;
  }


  /**
   * Create a new weight for the next generation
   * @param cut where must be cutted
   * @param weights1
   * @param weights2
   * @returns the new weight
   */
  createNewWeight(cut: number, weights1: number[], weights2: number[]): number[] {
    const ret = [];
    const cut1 = weights1.slice(0, cut)
    const cut2 = weights2.slice(cut)
    ret.push(...cut1);
    ret.push(...cut2);
    return ret
  }

  /**
   * crossover
   * @param parent1
   * @param parent2
   * @returns
   */
  crossover(parent1: Player, parent2: Player): [Player, Player] {

    const child1 = new Player(this.p);
    const child2 = new Player(this.p);
    try {

      const parent1Model = parent1.brain.model;
      const parent2Model = parent2.brain.model;

      const childModel1 = tf.sequential();
      const childModel2 = tf.sequential();

      // Iterar pelas camadas dos pais
      parent1Model.layers.forEach((layer1, index) => {
        const layer2 = parent2Model.layers[index];


        if (layer1 && layer2) {

          const weights1 = layer1.getWeights();
          const weights2 = layer2.getWeights();

          const childWeights1: tf.Tensor[] = [];
          const childWeights2: tf.Tensor[] = [];


          for (let i = 0; i < weights1.length; i++) {
            const shape = weights1[i].shape
            const weight1 = Array.from(weights1[i].dataSync()) as number[];
            const weight2 = Array.from(weights2[i].dataSync()) as number[];
            const cut = Math.round(Math.random() * weight2.length)



            // const childWeight1 = tf.cast(tf.add(tf.mul(crossoverMask, weight1), tf.mul(tf.sub(1, crossoverMask), weight2)), 'float32');
            // const childWeight2 = tf.cast(tf.add(tf.mul(crossoverMask, weight2), tf.mul(tf.sub(1, crossoverMask), weight1)), 'float32');

            const childWeight1 = tf.cast(tf.tensor(this.createNewWeight(cut, weight1, weight2), shape), 'float32');
            const childWeight2 = tf.cast(tf.tensor(this.createNewWeight(cut, weight2, weight1), shape), 'float32');

            childWeights1.push(childWeight1);
            childWeights2.push(childWeight2);
          }

          childModel1.add(tf.layers.dense({
            units: (layer1 as any).units,
            inputShape: layer1.batchInputShape ? layer1.batchInputShape.slice(1) : undefined,
            activation: 'relu',

            weights: childWeights1,
          }));

          childModel2.add(tf.layers.dense({
            units: (layer2 as any).units,
            inputShape: layer2.batchInputShape ? layer2.batchInputShape.slice(1) : undefined,
            activation: 'relu',
            weights: childWeights2,
          }));
        }

      });

      child1.brain.model = childModel1;
      child1.generation = this.generation + 1;
      child2.brain.model = childModel2;
      child2.generation = this.generation + 1;

      return [child1, child2];
    } catch (error) {


      return [child1, child2];
    }
  }
}

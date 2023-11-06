import * as p5 from "p5";
import Player from "../game/player";
import * as tfvis from "@tensorflow/tfjs-vis"
export default class GeneticAlgorithm {
  /**
   * Population of player(Individual)
   */
  population: Player[] = []

  constructor(populationSize: number, p: p5) {
    for (let index = 0; index < populationSize; index++) {
      this.population.push(new Player(p))
    }
  }



  /**
   * Select best play of the generation
   * @returns
   */
  select(): Player[] {
    const selectedIndividuals: Player[] = [];
    const totalFitness = this.population.reduce((total, individual) => total + individual.score, 0);

    for (let i = 0; i < this.population.length; i++) {
      let randomNumber = Math.random() * totalFitness;
      let sumFitness = 0;

      for (const individual of this.population) {
        sumFitness += individual.score;
        if (sumFitness >= randomNumber) {
          selectedIndividuals.push(individual);
          break;
        }
      }
    }

    return selectedIndividuals;
  }

  /**
   * Order by the best score
   * @returns
   */
  sortParent() {
    const children = this.population.sort((a, b) => b.score - a.score);
    this.population = children;
    return children[0];
  }


  /**
   *
   * @param population
   * @param tournamentSize
   * @returns
   */
  tournamentSelection(population: Player[], tournamentSize: number): Player {
    let bestIndividual = null as any;
    for (let i = 0; i < tournamentSize; i++) {
      const randomIndex = Math.floor(Math.random() * population.length);
      const candidate = population[randomIndex];
      if (bestIndividual === null || candidate.score > bestIndividual.score) {
        bestIndividual = candidate;
      }
    }
    return bestIndividual as Player;
  }


  /**
   *
   * @param population
   * @returns
   */
  rouletteSelection(population: Player[]): Player {
    const totalFitness = population.reduce((sum, individual) => sum + individual.score, 0);
    let spin = Math.random() * totalFitness;
    let cumulativeFitness = 0;

    for (const individual of population) {
      cumulativeFitness += individual.score;
      if (cumulativeFitness >= spin) {
        return individual;
      }
    }

    // Retornar um indivíduo por padrão (caso ocorra algum erro)
    return population[0];
  }


  /**
   *
   * @param population
   * @returns
   */
  rankSelection(population: Player[]): Player {
    const sortedPopulation = population.slice().sort((a, b) => a.score - b.score);
    const rankSum = (population.length * (population.length + 1)) / 2;
    const randomRank = Math.floor(Math.random() * rankSum);
    let cumulativeRank = 0;

    for (let i = 0; i < sortedPopulation.length; i++) {
      cumulativeRank += i + 1;
      if (cumulativeRank >= randomRank) {
        return sortedPopulation[i];
      }
    }

    // Retornar um indivíduo por padrão (caso ocorra algum erro)
    return sortedPopulation[0];
  }

/**
 *
 * @param mutateRate
 * @param oldGeneration
 * @returns
 */
  generateNextGeneration(mutateRate: number, oldGeneration: Player[]) {
    this.population = oldGeneration
    const bestParent = this.sortParent();
    const selectedIndividuals = this.select();

    const newGeneration: Player[] = [];

    while (newGeneration.length < this.population.length) {
      // const parent1 = selectedIndividuals[Math.floor(Math.random() * selectedIndividuals.length)];
      // const parent2 = selectedIndividuals[Math.floor(Math.random() * selectedIndividuals.length)];
      const parent1 = this.rankSelection(this.population)
      const parent2 = this.rankSelection(this.population)
      // const parent1 = this.rouletteSelection(this.population)
      // const parent2 = this.rouletteSelection(this.population)
      // const parent1 = this.tournamentSelection(this.population,10)
      // const parent2 = this.tournamentSelection(this.population,10)


      const [child1, child2] = parent1.crossover(parent1, parent2);

      child1.mutate(mutateRate);
      child2.mutate(mutateRate);

      newGeneration.push(child1, child2);

    }


    const last = newGeneration.length - 1;
    bestParent.isAlive = true;
    bestParent.score = 0;
    newGeneration[last] = bestParent

    this.population = newGeneration;
    return this.population

  }



}

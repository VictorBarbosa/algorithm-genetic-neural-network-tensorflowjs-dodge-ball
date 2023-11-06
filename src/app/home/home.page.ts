import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as p5 from 'p5'
import Player from '../game/player';
import Obstacle from '../game/obstacle';
import GeneticAlgorithm from '../neural_network_genetic_algorithm/genetic-algorithm';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {


  /**
   *
   */
  @ViewChild('canvas', { static: true }) canvas: ElementRef<HTMLCanvasElement> | null = null;


  populationSize = 10
  ga!: GeneticAlgorithm
  obstacle!: Obstacle;

  get currentGeneration(): number {
    const population = this.ga.population
    if (population.length > 0) {
      return population[0].generation;
    } else {
      return 0;
    }
  }

  get totalAlive(): number {
    return this.ga.population.filter(f=> f.isAlive)?.length || 0
  }


  /**
   *
   */
  constructor() { }

  /**
   *
   */
  ngOnInit(): void {

    new p5(this.sketck.bind(this))
  }

  sketck(p: p5) {
    p.setup = () => this.setup(p);
    p.draw = () => this.draw(p);
  }





  /**
   *
   * @param p
   */
  setup(p: p5) {
    p.createCanvas(window.innerWidth, window.innerHeight - 30, this.canvas?.nativeElement);



    this.ga = new GeneticAlgorithm(this.populationSize, p)
    this.obstacle = new Obstacle(p);
  }

  /**
   *
   * @param p
   */
  draw(p: p5) {
    p.background(220);
    this.obstacle.show();
    this.obstacle.update();

    const population = this.ga.population.filter(pop => pop.isAlive);

    if (population.length > 0) {
      population.forEach(pop => {
        if (!this.obstacle.hits(pop)) {
          pop.show(this.obstacle);
          pop.think(this.obstacle)
        }
      })
    } else {

      this.obstacle.init()
      this.ga.generateNextGeneration(0.2, this.ga.population);
      this.obstacle.countBar = 0
    }


    p.fill('black')
    p.textSize(25)
    p.text(`Generation : ${this.currentGeneration}`, 50, 60)
    p.text(`Alive : ${this.totalAlive}`, 50, 80)
    p.text(`Score-(Counting Bars) : ${this.obstacle.countBar}`, 50, 100)
  }


}

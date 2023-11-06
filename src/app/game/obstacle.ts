import * as p5 from "p5";
import Player from "./player";

export default class Obstacle {


  /**
   * Size of the game screem
   */
  fullSize = window.innerWidth;

  /**
   * Space between the bars
   */
  spacePlace = 100

  /**
   * Width of left bar
   */
  leftBarW = 0;

  /**
   * X of the left bar
   */
  leftBarX = 0;

  /**
   * X of right bar
   */
  rightBarX = 0;

  /**
   * Width of rigth bar
   */
  rightBarW = 0

  /**
   * Y of both bars
   */
  y = 0

  /**
   * X of the targe (the place where the player must be to have a good position to keep alive in the game)
   */
  targetX = 0;
  targetY = 0;

  /**
   * Velocity of the bar
   */
  velocity = 2;

  /**
   * Counter of the bar
   * This counter counts how many bar pass for the player
   */
  countBar = 0

  /**
   *
   * @param p
   */
  constructor(private p: p5) {
    this.init();
  }

  /**
   *
   */
  init() {
    this.leftBarW = this.p.random(this.fullSize) - (this.spacePlace / 2);
    this.rightBarW = window.innerWidth - this.leftBarW - (this.spacePlace);
    this.rightBarX = this.leftBarW + (this.spacePlace);
    this.y = 50;
    this.targetX = this.rightBarX - 45;
    this.targetY = this.y - 100;

  }

  /**
   * Display the bar
   */
  show(showTarge: boolean = false) {
    this.p.fill('red');
    this.p.rect(this.leftBarX, this.y, this.leftBarW, 50);
    this.p.fill('green');
    this.p.rect(this.rightBarX, this.y, this.rightBarW, 50);
    if (showTarge) {
      this.p.fill('black')
      this.p.rect(this.targetX, this.targetY, 10, 10);
    }

  }

  /**
   * Update each frame of the bar
   */
  update() {
    this.y += this.velocity;
    this.targetY += this.velocity;
    this.isOffscreen()
  }

  /**
   * test if had a hit between the bar and player
   * @param player
   */
  hits(player: Player): boolean {
    let hit = false;
    if (this.y < player.y + player.h) {

      if (
        this.y + 50 > player.y && this.leftBarW > player.x ||
        this.y + 50 > player.y && this.leftBarW + this.spacePlace < player.x + player.w
      ) {
        this.p.text("hit", window.innerWidth / 2, window.innerHeight / 2);
        hit = true;
        player.isAlive = false;

      }
    }

    return hit;
  }

  /**
   * Check if the bar is off screen , if yes a new bar is inited
   */
  private isOffscreen() {
    if (this.y > window.innerHeight) {
      this.countBar++;
      this.init();

    }
  }
  /**
   * Check if the bar pass for the for the play to add game score
   * @returns
   */
  isOffscreenScore(): number {
    if (this.y > window.innerHeight) {
      return 1
    } else {
      return 0
    }
  }

}

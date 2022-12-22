
import { _decorator, Component, Node, tween, Vec2, Vec3, ParticleSystem2D, misc, ParticleSystem } from 'cc';
import { Direction } from './DirectionHandler';
const { ccclass, property } = _decorator;

@ccclass('SwordLight')
export class SwordLight extends Component {
    
    @property(ParticleSystem)
    particle: ParticleSystem = null

    getRandom(min: number, max: number)
    {
        return Math.random()*(max-min) + min
    }

    onLoad()
    {
        this.particle.capacity = 0
    }

    start()
    {
    }

    emit(direction: Direction, isBigTarget = false)
    {
        let oldpos = this.node.getPosition()
        let r = (isBigTarget) ? 2.5 : 0.9
        let angle1 = 0
        switch(direction)
        {
            case Direction.RIGHT: angle1 = this.getRandom(160, 200); break
            case Direction.LEFT: angle1 = this.getRandom(-20, 20); break
            case Direction.UP: angle1 = this.getRandom(-110, -70); break
            case Direction.DOWN: angle1 = this.getRandom(70, 110); break
            case Direction.UPRIGHT: angle1 = this.getRandom(-160, -110); break
            case Direction.UPLEFT: angle1 = this.getRandom(-70, -20); break
            case Direction.DOWNRIGHT: angle1 = this.getRandom(110, 160); break
            case Direction.DOWNLEFT: angle1 = this.getRandom(20, 70); break
        }

        let z1 = r * Math.cos(misc.degreesToRadians(angle1))
        let y1 = r * Math.sin(misc.degreesToRadians(angle1))
        let angle_x = (Math.floor(Math.random()*2) == 0) ? 45 : -45
        let x1 = r * Math.sin(misc.degreesToRadians(angle_x))

        let startpos = new Vec3(oldpos.x + x1, oldpos.y + y1, oldpos.z + z1)
        let endpos = new Vec3(oldpos.x - x1, oldpos.y - y1, oldpos.z - z1)

        this.node.setPosition(startpos)
        this.particle.capacity = (isBigTarget) ? 400 : 400
        tween(this.particle.node).to(0.1, {position: endpos}).start()
    }

}

/**
 * [1] Class member could be defined like this.
 * [2] Use `property` decorator if your want the member to be serializable.
 * [3] Your initialization goes here.
 * [4] Your update function goes here.
 *
 * Learn more about scripting: https://docs.cocos.com/creator/3.0/manual/en/scripting/
 * Learn more about CCClass: https://docs.cocos.com/creator/3.0/manual/en/scripting/ccclass.html
 * Learn more about life-cycle callbacks: https://docs.cocos.com/creator/3.0/manual/en/scripting/life-cycle-callbacks.html
 */


import { _decorator, Component, Node, misc, Vec2, macro, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CameraController')
export class CameraController extends Component {

    noise(x: number, y: number)
    {
        let n = x + y * 57
        n = (n << 13) ^ n
        return (1.0 - ((n * ((n * n * 15731) + 789221) + 1376312589) & 0x7fffffff) / 1073741824.0)
    }

    screenShake(strength: number)
    {
        let interval = 0
        let duration = 0.2
        let speed = 2
        let magnitude = strength

        let elapsed = 0

        this.schedule(function shake(dt: number) 
        {
            let randomStart = Math.random() * 2000 - 1000
            elapsed += dt
            let percentComplete = elapsed / duration

            // We want to reduce the shake from full power to 0 starting half way through
            let damper = 1 - misc.clampf(2*percentComplete-1, 0, 1)

            // Calculate the noise parameter starting randomly and going as fast as speed allows
            let alpha = randomStart + speed * percentComplete

            // map noise to [-1, 1]
            let x = this.noise(alpha, 0) * 2 - 1
            let y = this.noise(0, alpha) * 2 - 1

            x *= magnitude * damper
            y *= magnitude * damper

            let vec = new Vec3(x, y, 1000)

            this.node.setPosition(vec)

            if (elapsed >= duration)
            {
                elapsed = 0
                this.unschedule(shake)
                this.node.setPosition(0, 0, 1000)
            }

        }, interval, macro.REPEAT_FOREVER, 0)
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

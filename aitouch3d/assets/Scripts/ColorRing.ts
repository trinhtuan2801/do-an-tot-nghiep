
import { _decorator, Component, Node, color, Color, ParticleSystem2D, ParticleSystem } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ColorRing')
export class ColorRing extends Component {

    onLoad()
    {
        let particle = this.getComponent(ParticleSystem)
        particle.capacity = 0
    }

    emit(isSpecial = false, isSuperSpeial = false)
    {
        let particle = this.getComponent(ParticleSystem)

        if (!isSpecial)
        {
            particle.shapeModule.radius = 0.6
            particle.capacity = 50
        }
        else if (!isSuperSpeial)
        {
            particle.shapeModule.radius = 1
            particle.capacity = 80
        }
        else
        {
            particle.shapeModule.radius = 2
            particle.capacity = 80

        }
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

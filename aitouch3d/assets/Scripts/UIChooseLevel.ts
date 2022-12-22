
import { _decorator, Component, Node, tween, Vec3, UIOpacity } from 'cc';
import { LevelData } from './data';
import { Level } from './Level';
const { ccclass, property } = _decorator;

@ccclass('UIChooseLevel')
export class UIChooseLevel extends Component {

    @property(Node)
    UI: Node = null

    @property(Node)
    cloak: Node = null

    @property(Node)
    content: Node = null

    start()
    {
        this.hideUI()
    }

    showUI()
    {
        this.UI.active = true
        this.cloak.active = true
        this.cloak.getComponent(UIOpacity).opacity = 0
        tween(this.UI).to(0.2, {scale: new Vec3(1, 1, 1)}, {easing: 'quadOut'}).start()
        tween(this.cloak.getComponent(UIOpacity)).to(0.1, {opacity: 255}).start()
    }

    hideUI()
    {
        tween(this.UI).to(0.2, {scale: new Vec3(1, 0, 0)}, {easing: 'quadIn'})
        .call(()=>
        {
            this.UI.active = false
        }).start()
        tween(this.cloak.getComponent(UIOpacity)).to(0.1, {opacity: 0})
        .call(()=>
        {
            this.cloak.active = false
        }).start()

    }

    updateScore()
    {
        let level = LevelData.current_level
        let data = LevelData.levels[level % LevelData.levels.length]
        for (let child of this.content.children)
        {
            if (child.getComponent(Level) && child.getComponent(Level).level == level)
            {
                child.getComponent(Level).setScore(data.percent, data.score)
                break
            }
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

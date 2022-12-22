
import { _decorator, Component, Node, RichText, find, Label, director } from 'cc';
import { GameManager } from './GameManager';
const { ccclass, property } = _decorator;

@ccclass('PoseTimer')
export class PoseTimer extends Component {

    @property(Label)
    time_label: Label | null = null
    
    time = 0
    
    game : GameManager | null = null

    interval = 0

    onLoad()
    {
        this.game = find('GameManager')?.getComponent(GameManager) as GameManager
    }

    timeToString(t: number)
    {
        return t.toString()
    }

    setTime(t: number)
    {
        this.time = t
        if (this.time_label)
        {
            this.time_label.string = this.timeToString(t)
        }
    }

    timeSub()
    {
        this.time --
        this.setTime(this.time)
        if (this.time == 0)
        {
            this.stopTime()
            this.game.poseTimerIsDone()
            this.node.active = false
        }
    }
    
    startTime()
    {
        this.interval = setInterval(()=>{this.timeSub()}, 1000)
    }

    stopTime(isActive = false)
    {
        clearInterval(this.interval)
        this.node.active = isActive
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


import { _decorator, Component, Node, Label, tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CountDownTimer')
export class CountDownTimer extends Component {
    @property(Label)
    time_label: Label = null
    
    time = 0
    
    interval = 0

    onLoad()
    {
        this.time_label.node.active = false
    }

    hide()
    {
        tween(this.time_label.node).delay(1).to(0.1, {scale: new Vec3(0, 0, 0)}).call(()=>{this.time_label.node.active = false}).start()
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
            this.hide()
        }
    }
    
    startTime()
    {
        this.interval = setInterval(()=>{this.timeSub()}, 1000)
        this.time_label.node.active = true
        this.time_label.node.setScale(0, 0, 0)
        tween(this.time_label.node).to(0.1, {scale: new Vec3(1, 1, 1)}).start()
    }

    stopTime()
    {
        clearInterval(this.interval)
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


import { _decorator, Component, Node, tween, Vec3, UIOpacity, Label } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UIResult')
export class UIResult extends Component {

    @property(Node)
    UI: Node = null

    @property(Node)
    cloak: Node = null

    @property(Label)
    percent_label: Label = null

    @property(Label)
    bonus: Label = null

    @property(Label)
    rank: Label = null

    @property(Label)
    score: Label = null

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

    showResult(total: number, destroyed: number, bighit: number, score: number)
    {
        this.percent_label.string = `${Math.floor(destroyed / total * 100)}%`
        this.bonus.string = `${bighit}`
        this.score.string = '' + score
        let rank = Math.floor((destroyed + bighit)/total * 100)
        console.log(destroyed, bighit, total, rank)
        if (rank <= 40) this.rank.string = 'D'
        else if (rank <= 60) this.rank.string = 'C'
        else if (rank <= 80) this.rank.string = 'B'
        else if (rank <= 100) this.rank.string = 'A'
        else this.rank.string = 'S'
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

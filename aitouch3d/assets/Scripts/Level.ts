
import { _decorator, Component, Node, find, LabelComponent, tween, Vec3, Label } from 'cc';
import { LevelData } from './data';
import { GameManager } from './GameManager';
import { UIManager } from './UIManager';
const { ccclass, property } = _decorator;

@ccclass('Level')
export class Level extends Component {

    @property
    level = 0

    UIManager: UIManager = null

    @property(Label)
    percent: Label = null

    @property(Label)
    score: Label = null

    onLoad()
    {
        this.UIManager = find('UIManager').getComponent(UIManager)
        this.node.on('mouse-down', this.onClick, this)
    }

    onClick()
    {
        tween(this.node).to(0.1, {scale: new Vec3(1.1, 1.1, 1.1)}).to(0.1, {scale: new Vec3(1, 1, 1)}).start()
        LevelData.current_level = this.level
        this.UIManager.setLevel()
        this.UIManager.UIChooseLevel.hideUI()
        this.UIManager.setUIHomeScreen()
    }

    setScore(percent: number, score: number)
    {
        this.percent.string = '' + percent + '%'
        this.score.string = 'điểm: ' + score
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

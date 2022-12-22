
import { _decorator, Component, Node, tween, Vec3, Label, UIOpacity } from 'cc';
import { LevelData } from './data';
import { UIChooseLevel } from './UIChooseLevel';
import { UIResult } from './UIResult';
const { ccclass, property } = _decorator;

@ccclass('UIManager')
export class UIManager extends Component {

    @property(Node)
    tutorial_button: Node = null

    @property(Node)
    play_button: Node = null

    @property(Node)
    choose_level_button: Node = null

    @property(UIChooseLevel)
    UIChooseLevel: UIChooseLevel = null

    @property(Label)
    level_label: Label = null

    @property(Label)
    song_label: Label = null

    @property(UIResult)
    UIResult: UIResult = null

    @property(Node)
    home_button: Node = null

    @property(Node)
    reset_button: Node = null

    @property(Node)
    background: Node = null

    start()
    {
        this.play_button.active = false
        this.choose_level_button.active = false
        this.song_label.node.active = false
        this.level_label.node.active = false
        this.home_button.setScale(0, 0, 0)
        this.reset_button.setScale(0, 0, 0)
    }
    
    onClickConfirmTutorial()
    {
        this.animZoomExit(this.tutorial_button)
        this.setUIHomeScreen()
    }

    setUIStartGame()
    {
        this.animZoomExit(this.play_button)
        this.animZoomExit(this.choose_level_button)
        this.animZoomExit(this.song_label.node)
        this.animZoomExit(this.level_label.node)
        this.animZoomEntrance(this.home_button)
        this.animZoomEntrance(this.reset_button)
        tween(this.background.getComponent(UIOpacity)).to(0.1, {opacity: 0}).start()
    }

    setUIHomeScreen()
    {
        this.animZoomEntrance(this.play_button)
        this.animZoomEntrance(this.choose_level_button)
        this.animZoomEntrance(this.song_label.node)
        this.animZoomEntrance(this.level_label.node)
        this.animZoomExit(this.home_button)
        this.animZoomExit(this.reset_button)
        tween(this.background.getComponent(UIOpacity)).to(0.1, {opacity: 255}).start()
    }

    animZoomEntrance(node: Node)
    {
        node.active = true
        node.setScale(0, 0, 0)
        tween(node).to(0.1, {scale: new Vec3(1, 1, 1)}).start()
    }

    animZoomExit(node: Node)
    {
        tween(node).to(0.1, {scale: new Vec3(1.2, 0, 0)}).call(()=>{this.tutorial_button.active = false}).start()
    }

    setLevel()
    {
        let level = LevelData.current_level
        let data = LevelData.levels[level % LevelData.levels.length]
        console.log(data)
        this.level_label.string = 'Level ' + (level+1)
        this.song_label.string = data.name
    }

    showResult(total: number, destroyed: number, bighit: number, score: number)
    {
        this.UIResult.showUI()
        this.UIResult.showResult(total, destroyed, bighit, score)
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

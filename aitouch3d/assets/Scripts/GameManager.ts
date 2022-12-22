
import { _decorator, Component, Node, systemEvent, SystemEvent, Sprite, SpriteFrame, assetManager, Texture2D, ImageAsset, color, Label, director, Vec3, UITransform, Prefab, instantiate, Vec2, EventKeyboard, clamp, AudioSource, AudioClip, tween, NodePool, CubicSplineNumberValue, Color, UIOpacity, Camera, Material, MeshRenderer } from 'cc';
import { APIHandler, APIHelper, MoveGuide, NetworkStatus, PoseResult } from './APIHelper';
import { PlaygroundUser } from './APIPlayground';
import { BigTarget } from './BigTarget';
import { CameraController } from './CameraController';
import { CountDownTimer } from './CountDownTimer';
import { LevelData } from './data';
import { Direction, DirectionHandler } from './DirectionHandler';
import { PoseTimer } from './PoseTimer';
import { SwordLight } from './SwordLight';
import { Target } from './Target';
import { UIManager } from './UIManager';
const { ccclass, property } = _decorator;

interface Window { webkitAudioContext: typeof AudioContext };

export enum GameState {
    HOMESCREEN,
    WARMUP,
    PLAY,
    RELAX,
    PAUSE,
    TUTORIAL,
    UNPLAYABLE
};

class Segment {
    timestart: number
    timeend: number
    targets: TargetInfo[] = []
    constructor(arr: Array<string>) {
        this.timestart = this.strToTime(arr[0])
        this.timeend = this.strToTime(arr[1])
        for (let i = 2; i < arr.length; i++) {
            if (arr[i].includes('-')) {
                let info = arr[i].split('-')
                let direction = info[0]
                let timestart = this.strToTime(info[1])
                this.targets.push(new TargetInfo(direction, timestart))
            }
            else {
                let random = Math.floor(Math.random() * 2)
                let direction = (random == 0) ? 'L' : 'R'
                let timestart = this.strToTime(arr[i])
                console.log(timestart)
                this.targets.push(new TargetInfo(direction, timestart))
            }

        }
    }

    strToTime(str: string) {
        let arr = str.split(':')
        let minute = Number(arr[0])
        let second = Number(arr[1])
        return minute * 60 + second
    }
}

class TargetInfo {
    direction: Direction
    timestart: number

    constructor(direction: string, timestart: number) {
        this.timestart = timestart
        switch (direction) {
            case 'U': this.direction = Direction.UP; break
            case 'D': this.direction = Direction.DOWN; break
            case 'L': this.direction = Direction.LEFT; break
            case 'R': this.direction = Direction.RIGHT; break
            case 'UL': this.direction = Direction.UPLEFT; break
            case 'UR': this.direction = Direction.UPRIGHT; break
            case 'DL': this.direction = Direction.DOWNLEFT; break
            case 'DR': this.direction = Direction.DOWNRIGHT; break
        }
    }
}

@ccclass('GameManager')
export class GameManager extends Component implements APIHandler {

    @property(Node)
    background: Node = null

    promise_array: Promise<Blob>[] = []

    isPromiseArrayShifted = true

    canvas: HTMLCanvasElement = document.createElement('canvas')

    video: HTMLVideoElement = document.createElement('video')

    width = 640
    height = 0

    isStreaming = false

    pose_interval = 0

    @property(Sprite)
    user_picture: Sprite = null

    @property(Sprite)
    guide_arrow: Sprite = null

    @property(Sprite)
    color_frame: Sprite = null

    gamestate = GameState.HOMESCREEN

    prev_gamestate = GameState.HOMESCREEN

    api: APIHelper = new APIHelper(this)

    ping = 0

    @property(Label)
    ping_label: Label = null

    @property(PoseTimer)
    pose_timer: PoseTimer = null

    notInBox = 0

    isCountingPose = false

    // user_info : PlaygroundUser = new PlaygroundUser('','','','','','')
    update_start = true

    @property(SpriteFrame)
    arrow_array: SpriteFrame[] = []

    @property(Prefab)
    target_prefab: Prefab = null

    screen_width = 0
    screen_height = 0

    @property(Node)
    target_layer: Node = null

    LeftDirectioner: DirectionHandler = new DirectionHandler()
    RightDirectioner: DirectionHandler = new DirectionHandler()

    @property(Label)
    direction_right_label: Label = null

    @property(Label)
    direction_left_label: Label = null

    left_target = []
    right_target = []

    @property(Material)
    direction_frame: Material[] = []

    right_segments: Segment[] = []
    left_segments: Segment[] = []
    current_left_segment: Target[] = []
    current_right_segment: Target[] = []

    runtime = 3

    old_z_left = -1.5
    old_z_right = 1.5

    old_y_left = 0
    old_y_right = 0

    rightdata = []
    leftdata = []

    audio: HTMLAudioElement = null

    @property(AudioClip)
    tracks: AudioClip[] = []

    @property(AudioClip)
    whipsounds: AudioClip[] = []

    effect_audio: AudioSource = new AudioSource('whip')

    @property(Prefab)
    SwordLightPrefab: Prefab = null

    @property(UIManager)
    UIManager: UIManager = null

    isMusicAllowed = false

    @property(CameraController)
    camera: CameraController = null

    @property(Sprite)
    background_effect: Sprite = null

    @property(Prefab)
    bigtarget_prefab: Prefab = null

    BigTarget: BigTarget = null

    target_count = 0
    target_destroy = 0
    bigtarget_hit = 0

    @property(Label)
    bonus_label: Label = null

    @property(Label)
    score_label: Label = null

    score = 0

    @property(CountDownTimer)
    countdown_timer: CountDownTimer = null

    @property(AudioClip)
    beat_drop: AudioClip = null

    @property(Prefab)
    target3d_prefab: Prefab = null

    @property(Camera)
    camera3d: Camera = null

    @property(Node)
    beatroot_left: Node = null

    @property(Node)
    beatroot_right: Node = null

    beatnodes_left: Node[] = []
    beatnodes_right: Node[] = []

    @property(Material)
    flow_material: Material = null

    @property(Node)
    beatroot_left2d: Node = null

    @property(Node)
    beatroot_right2d: Node = null

    beatnodes_left2d: Node[] = []
    beatnodes_right2d: Node[] = []

    @property(Texture2D)
    ring_textures: Texture2D[] = []

    @property(Material)
    ring_material: Material = null

    @property(Node)
    ring: Node = null

    ring_oldscale: Vec3 = null

    @property(AudioClip)
    silent_sound: AudioClip = null

    onLoad() {
        systemEvent.on(SystemEvent.EventType.KEY_DOWN, this.testInput, this)
        this.getWebcam()
        this.bonus_label.node.setScale(0, 0, 0)
        this.score_label.node.setScale(0, 0, 0)
        this.ring_oldscale = this.ring.getScale().clone()
        this.ring.setScale(0, 0, 0)
    }

    playSilentSound() {
        this.audio = new Audio()
        this.audio.volume = 0
        this.audio.src = this.silent_sound.nativeUrl
        this.visualizeBeat()
        this.audio.play()
    }

    addBeatNode() {
        this.beatroot_left.children.forEach(child => {
            this.beatnodes_left.unshift(child)
        })
        this.beatroot_right.children.forEach(child => {
            this.beatnodes_right.unshift(child)
        })
        this.beatroot_left2d.children.forEach(child => {
            this.beatnodes_left2d.push(child)
        })
        this.beatroot_right2d.children.forEach(child => {
            this.beatnodes_right2d.push(child)
        })
    }

    visualizeBeat() {
        // let wd: Window
        var context = new AudioContext() || new (window as any).webkitAudioContext();
        var src = context.createMediaElementSource(this.audio);
        var analyser = context.createAnalyser();

        src.connect(analyser);
        analyser.connect(context.destination);

        analyser.fftSize = 128;

        var bufferLength = analyser.frequencyBinCount;

        var dataArray = new Uint8Array(bufferLength);

        let renderFrame = () => {
            if (this.audio.paused) return
            requestAnimationFrame(renderFrame);

            analyser.getByteFrequencyData(dataArray);

            for (var i = 0; i < this.beatnodes_left.length; i++) {
                let y = dataArray[5 + i * 4] * 0.006
                this.setBeatPos(this.beatnodes_left[i], y)
                this.setBeatPos(this.beatnodes_right[i], y)
            }

            for (var i = 0; i < this.beatnodes_left2d.length; i++) {
                let y = dataArray[4 + i * 3] / 255 * 150

                this.setBeatPos(this.beatnodes_left2d[i], y)
            }

            for (var i = 0; i < this.beatnodes_right2d.length; i++) {
                let y = dataArray[4 + (i + 1) * 3] / 255 * 150
                this.setBeatPos(this.beatnodes_right2d[i], y)
            }
        }

        this.audio.onplay = renderFrame
        this.audio.onpause = () => {
            this.beatnodes_left.forEach(node => {
                this.setBeatPos(node, 0, true)
            })
            this.beatnodes_right.forEach(node => {
                this.setBeatPos(node, 0, true)
            })
            this.beatnodes_left2d.forEach(node => {
                this.setBeatPos(node, 0, true)
            })
            this.beatnodes_right2d.forEach(node => {
                this.setBeatPos(node, 0, true)
            })
        }
    }

    start() {
        // this.audio.clip = null
        // audioSource.stop()

        this.gamestate = GameState.HOMESCREEN
        this.prev_gamestate = GameState.HOMESCREEN
        this.notInBox = 8
        this.screen_width = this.background.getComponent(UITransform).width
        this.screen_height = this.background.getComponent(UITransform).height
        let level = LevelData.current_level
        let data = LevelData.levels[level % LevelData.levels.length]
        this.UIManager.setLevel()
        // this.createBigTarget()
        // this.UIManager.showResult(this.target_count, this.target_destroy, this.bigtarget_hit)
        this.UIManager.UIChooseLevel.updateScore()
        this.addBeatNode()
    }

    onClickStartGame() {
        if (this.gamestate != GameState.HOMESCREEN) return
        console.log('lets start game')
        this.gamestate = GameState.PLAY
        this.prev_gamestate = GameState.PLAY
        let level = LevelData.current_level
        let data = LevelData.levels[level % LevelData.levels.length]
        this.leftdata = JSON.parse(JSON.stringify(data.leftdata))
        this.rightdata = JSON.parse(JSON.stringify(data.rightdata))

        this.generateBeat()

        console.log('left data', this.leftdata)
        console.log('right data', this.rightdata)

        // this.audio.stop()
        // this.audio.pause()
        this.audio.muted = false
        this.audio.volume = 1
        // this.audio.clip = this.tracks[level]
        this.audio.src = this.tracks[level].nativeUrl
        this.isMusicAllowed = false
        this.scheduleOnce(() => {
            this.isMusicAllowed = true
            this.audio.play()
        }, this.strToTime(data.timestart))

        this.scheduleOnce(() => {
            this.createBigTarget()
            this.scheduleOnce(() => {
                // this.audio.stop()
                // this.audio.pause()
                this.stopMusic()
            }, 0.4)
        }, this.strToTime(data.timeend))
        this.UIManager.setUIStartGame()
        this.scheduleOnce(() => { this.initData(this.rightdata, this.leftdata) }, this.strToTime(data.beatstart))

        tween(this.score_label.node).to(0.1, { scale: new Vec3(1, 1, 1) }).start()
        this.score_label.string = 'Điểm: 0'
        this.startTakePicture()

        let texture = this.ring_textures[Math.floor(Math.random() * this.ring_textures.length)]
        this.ring_material.setProperty('mainTexture', texture)
        tween(this.ring).to(0.5, { scale: this.ring_oldscale }, { easing: 'quadOut' }).start()
        console.log(this.ring_oldscale)
    }

    generateBeat() {
        if (!this.leftdata[0][2].includes('-')) //check auto them beat
        {
            this.leftdata.forEach((segment, index) => {
                let preset = Math.floor(Math.random() * 5) // left-right / up-down / random (chance: 2-2-1)
                let isSame = Math.floor(Math.random() * 2) // same direction
                if (segment.length >= 8) preset = Math.floor(Math.random() * 2) //nhieu hon 15 not -> left - right
                if (preset == 0 || preset == 1) {
                    let samebeatcount = 0
                    let prevrand = -1
                    if (segment.length >= 10) {
                        for (let i = 2; i <= Math.floor(segment.length / 2); i++) {
                            let rand = Math.floor(Math.random() * 2)
                            if (rand == prevrand) samebeatcount++
                            if (samebeatcount > 0) {
                                samebeatcount = 0
                                rand = (rand == 1) ? rand - 1 : rand + 1
                            }
                            prevrand = rand
                            let beat = ''
                            let rightbeat = ''
                            switch (rand) {
                                case 0: beat = 'L'; rightbeat = (isSame == 1) ? 'L' : 'R'; break
                                case 1: beat = 'R'; rightbeat = (isSame == 1) ? 'R' : 'L'; break
                            }
                            segment[i] = beat + '-' + segment[i]
                            this.rightdata[index][i] = rightbeat + '-' + this.rightdata[index][i]
                        }

                        for (let i = Math.floor(segment.length / 2) + 1; i < segment.length; i++) {
                            let rand = Math.floor(Math.random() * 2)
                            if (rand == prevrand) samebeatcount++
                            if (samebeatcount > 0) {
                                samebeatcount = 0
                                rand = (rand == 1) ? rand - 1 : rand + 1
                            }
                            prevrand = rand
                            let beat = ''
                            let rightbeat = ''
                            switch (rand) {
                                case 0: beat = 'U'; rightbeat = (isSame == 1) ? 'U' : 'D'; break
                                case 1: beat = 'D'; rightbeat = (isSame == 1) ? 'D' : 'U'; break
                            }
                            segment[i] = beat + '-' + segment[i]
                            this.rightdata[index][i] = rightbeat + '-' + this.rightdata[index][i]
                        }
                    }
                    else {
                        for (let i = 2; i < segment.length; i++) {
                            let rand = Math.floor(Math.random() * 2)
                            if (rand == prevrand) samebeatcount++
                            if (samebeatcount > 0) {
                                samebeatcount = 0
                                rand = (rand == 1) ? rand - 1 : rand + 1
                            }
                            prevrand = rand
                            let beat = ''
                            let rightbeat = ''
                            switch (rand) {
                                case 0: beat = 'L'; rightbeat = (isSame == 1) ? 'L' : 'R'; break
                                case 1: beat = 'R'; rightbeat = (isSame == 1) ? 'R' : 'L'; break
                            }
                            segment[i] = beat + '-' + segment[i]
                            this.rightdata[index][i] = rightbeat + '-' + this.rightdata[index][i]
                        }
                    }
                }
                else if (preset == 2 || preset == 3) {
                    let samebeatcount = 0
                    let prevrand = -1
                    if (segment.length >= 10) {
                        for (let i = 2; i <= Math.floor(segment.length / 2); i++) {
                            let rand = Math.floor(Math.random() * 2)
                            if (rand == prevrand) samebeatcount++
                            if (samebeatcount > 0) {
                                samebeatcount = 0
                                rand = (rand == 1) ? rand - 1 : rand + 1
                            }
                            prevrand = rand
                            let beat = ''
                            let rightbeat = ''

                            switch (rand) {
                                case 0: beat = 'U'; rightbeat = (isSame == 1) ? 'U' : 'D'; break
                                case 1: beat = 'D'; rightbeat = (isSame == 1) ? 'D' : 'U'; break
                            }
                            segment[i] = beat + '-' + segment[i]
                            this.rightdata[index][i] = rightbeat + '-' + this.rightdata[index][i]
                        }

                        for (let i = Math.floor(segment.length / 2) + 1; i < segment.length; i++) {
                            let rand = Math.floor(Math.random() * 2)
                            if (rand == prevrand) samebeatcount++
                            if (samebeatcount > 0) {
                                samebeatcount = 0
                                rand = (rand == 1) ? rand - 1 : rand + 1
                            }
                            prevrand = rand
                            let beat = ''
                            let rightbeat = ''
                            switch (rand) {
                                case 0: beat = 'L'; rightbeat = (isSame == 1) ? 'L' : 'R'; break
                                case 1: beat = 'R'; rightbeat = (isSame == 1) ? 'R' : 'L'; break
                            }
                            segment[i] = beat + '-' + segment[i]
                            this.rightdata[index][i] = rightbeat + '-' + this.rightdata[index][i]
                        }
                    }
                    else {
                        for (let i = 2; i < segment.length; i++) {
                            let rand = Math.floor(Math.random() * 2)
                            if (rand == prevrand) samebeatcount++
                            if (samebeatcount > 0) {
                                samebeatcount = 0
                                rand = (rand == 1) ? rand - 1 : rand + 1
                            }
                            prevrand = rand
                            let beat = ''
                            let rightbeat = ''

                            switch (rand) {
                                case 0: beat = 'U'; rightbeat = (isSame == 1) ? 'U' : 'D'; break
                                case 1: beat = 'D'; rightbeat = (isSame == 1) ? 'D' : 'U'; break
                            }
                            segment[i] = beat + '-' + segment[i]
                            this.rightdata[index][i] = rightbeat + '-' + this.rightdata[index][i]
                        }
                    }
                }
                else {
                    let samebeatcount = 0
                    let prevrand = -1
                    for (let i = 2; i < segment.length; i++) {
                        let rand = Math.floor(Math.random() * 4)
                        if (rand == prevrand) samebeatcount++
                        if (samebeatcount > 0) {
                            samebeatcount = 0
                            rand = (rand == 3) ? rand - 1 : rand + 1
                        }
                        prevrand = rand
                        let beat = ''
                        let rightbeat = ''
                        switch (rand) {
                            case 0: beat = 'L'; rightbeat = 'R'; break
                            case 1: beat = 'R'; rightbeat = 'L'; break
                            case 2: beat = 'U'; rightbeat = 'U'; break
                            case 3: beat = 'D'; rightbeat = 'D'; break
                        }
                        segment[i] = beat + '-' + segment[i]
                        this.rightdata[index][i] = rightbeat + '-' + this.rightdata[index][i]
                    }
                }

            })

            this.trimSegment()
        }
    }

    trimSegment() {
        let isRight = false
        for (let i = this.leftdata.length - 1; i >= 0; i--) {
            let rand = Math.floor(Math.random() * 3) // 1 hand / both hand(chance: 2-1)
            if (rand == 2) {
                //do nothing
            }
            else {
                if (isRight) this.rightdata.splice(i, 1)
                else this.leftdata.splice(i, 1)
                isRight = !isRight
            }
        }
    }

    finishLevel() //called by BigTarget
    {

        this.UIManager.showResult(this.target_count, this.target_destroy, this.bigtarget_hit, this.score)

        let level = LevelData.current_level
        let data = LevelData.levels[level % LevelData.levels.length]

        let percent = Math.floor(this.target_destroy / this.target_count * 100)
        if (data.percent < percent) data.percent = percent
        if (data.score < this.score) data.score = this.score
        this.UIManager.UIChooseLevel.updateScore()
        LevelData.current_level++
        this.reset()
    }

    reset() {
        director.resume()
        this.unscheduleAllCallbacks()
        this.current_left_segment.forEach(element => {
            this.scheduleOnce(() => { element.boom() }, 0.02)
        })
        this.current_right_segment.forEach(element => {
            this.scheduleOnce(() => { element.boom() }, 0.02)
        })
        if (this.BigTarget) {
            this.BigTarget.boom()
            this.BigTarget = null
        }
        // this.audio.stop()
        // this.audio.pause()
        this.stopMusic()
        this.gamestate = GameState.HOMESCREEN
        this.prev_gamestate = GameState.HOMESCREEN
        this.notInBox = 8
        this.right_segments = []
        this.left_segments = []
        this.current_left_segment = []
        this.current_right_segment = []
        this.leftdata = []
        this.rightdata = []
        this.target_count = 0
        this.target_destroy = 0
        this.bigtarget_hit = 0
        this.score = 0
        this.UIManager.setLevel()
        tween(this.bonus_label.node).to(0.2, { scale: new Vec3(0, 0, 0) }).start()
        tween(this.score_label.node).to(0.2, { scale: new Vec3(0, 0, 0) }).start()
        this.stopTakePicture()
        this.floorShakeNormal()

        tween(this.ring).to(0.5, { scale: new Vec3(0, 0, 0) }, { easing: 'quadOut' }).start()
    }

    resetLevel() {
        this.reset()
        let reset_time = 5
        this.countdown_timer.stopTime()
        this.countdown_timer.setTime(reset_time)
        this.countdown_timer.startTime()
        this.scheduleOnce(() => { this.onClickStartGame() }, reset_time + 1)
    }

    goHomeScreen() {
        this.reset()
        this.countdown_timer.stopTime()
        this.countdown_timer.hide()
        this.scheduleOnce(() => { this.UIManager.setUIHomeScreen() }, 1)
    }

    initData(rightdata: Array<Array<string>>, leftdata: Array<Array<string>>) {
        rightdata.forEach(segment => {
            this.right_segments.push(new Segment(segment))
        });

        leftdata.forEach(segment => {
            this.left_segments.push(new Segment(segment))
        });

        let initSegment = (isRight: boolean, arr: Array<Segment>) => {
            arr.forEach(segment => {
                this.scheduleOnce(() => {
                    let count = 0
                    segment.targets.forEach(info => {
                        count++
                        let isSpecial = false
                        if (count == segment.targets.length) isSpecial = true

                        let target = this.createTarget(isRight, info.direction, isSpecial)
                        this.target_count++
                        this.scheduleOnce(() => {
                            target.run()
                        }, info.timestart - segment.timestart)
                    })
                }, segment.timestart)
            })
        }
        initSegment(true, this.right_segments)
        initSegment(false, this.left_segments)

    }

    createBigTarget() {
        let big = instantiate(this.bigtarget_prefab)
        this.target_layer.addChild(big)
        big.setPosition(20, 2, 0)
        this.BigTarget = big.getComponent(BigTarget)
        let level = LevelData.current_level
        let data = LevelData.levels[level % LevelData.levels.length]
        this.BigTarget.init(data.frame, this.runtime, this)
        this.BigTarget.run()
    }

    getRandom(min: number, max: number) {
        return Math.random() * (max - min) + min
    }

    createTarget(isRight: boolean, direction: Direction, isSpecial) {
        let target = instantiate(this.target_prefab)
        this.target_layer.addChild(target)

        let z = 0, y = 0.26
        let dirstr = Direction[direction]
        let z_variant = 0

        if (dirstr.includes('RIGHT')) z_variant = 0.3
        else if (dirstr.includes('LEFT')) z_variant = -0.3

        if (isRight) {
            this.current_right_segment.push(target.getComponent(Target))
            z = this.old_z_right + z_variant
            z = clamp(this.old_z_right + z_variant, 0.5, 2.1)
            this.old_z_right = z
        }
        else {
            this.current_left_segment.push(target.getComponent(Target))
            z = this.old_z_left + z_variant
            z = clamp(this.old_z_left + z_variant, -2.1, -0.5)
            this.old_z_left = z
        }

        target.setPosition(35, y, z)
        let material: Material = null
        switch (direction) {
            case Direction.UP: material = this.direction_frame[0]; break
            case Direction.DOWN: material = this.direction_frame[1]; break
            case Direction.LEFT: material = this.direction_frame[2]; break
            case Direction.RIGHT: material = this.direction_frame[3]; break
            // case Direction.UPLEFT: frame = this.direction_frame[4];break
            // case Direction.UPRIGHT: frame = this.direction_frame[5];break
            // case Direction.DOWNLEFT: frame = this.direction_frame[6];break
            // case Direction.DOWNRIGHT: frame = this.direction_frame[7];break
        }
        target.getComponent(Target).init(material, direction, this.runtime, isSpecial, isRight, this)
        return target.getComponent(Target)
    }

    removeTargetFromSegment(isRight: boolean, target: Target) {
        if (isRight) {
            let index = this.current_right_segment.indexOf(target)
            this.current_right_segment.splice(index, 1)
        }
        else {
            let index = this.current_left_segment.indexOf(target)
            this.current_left_segment.splice(index, 1)
        }
    }

    processNewPoint(isRight: boolean, keypoint: Array<number>) {
        // if (keypoint[2] < 0.3) return
        let yscale = 1 - keypoint[0]
        let xscale = 1 - keypoint[1]
        let y = yscale * this.screen_height
        let x = xscale * this.screen_width
        let worldpos = new Vec3(x, y, 0)
        let localpos = worldpos.subtract(this.background.getWorldPosition())
        let direction1: Direction //hand
        let direction2: Direction //check
        if (isRight)
            [direction1, direction2] = this.RightDirectioner.processNewPoint(new Vec2(localpos.x, localpos.y))
        else
            [direction1, direction2] = this.LeftDirectioner.processNewPoint(new Vec2(localpos.x, localpos.y))

        if (direction1 != Direction.NULL) {
            this.playWhipSound()
            this.setDirectionLabel(isRight, direction1)
            if (this.BigTarget) {
                this.playBeatDrop()
                this.BigTarget.getHit()
                this.playBackgroundEffect(isRight)
                // this.createSwordLight(direction1, isRight, this.BigTarget.node.getPosition(), true)
                this.bigtarget_hit++
                this.bonus_label.string = 'Bonus x' + this.bigtarget_hit
                tween(this.bonus_label.node).to(0.1, { scale: new Vec3(1.2, 1.2, 1.2) }).to(0.1, { scale: new Vec3(1, 1, 1) }).start()
                this.addScore(150)
            }
            else {
                this.checkDirection(isRight, direction1, direction2)
            }
        }
    }

    testProcess(isRight: boolean, direction1: Direction) {
        this.playWhipSound()
        if (this.BigTarget) {
            this.playBeatDrop()
            this.BigTarget.getHit()
            this.playBackgroundEffect(isRight)
            // this.createSwordLight(direction1, isRight, this.BigTarget.node.getPosition(), true)
            this.bigtarget_hit++
            this.bonus_label.string = 'Bonus x' + this.bigtarget_hit
            tween(this.bonus_label.node).to(0.1, { scale: new Vec3(1.2, 1.2, 1.2) }).to(0.1, { scale: new Vec3(1, 1, 1) }).start()
            this.addScore(150)
        }
        else {
            this.checkDirection(isRight, direction1, direction1)
        }
    }

    checkDirection(isRight: boolean, direction1: Direction, direction2: Direction) {
        let current_segment = (isRight) ? this.current_right_segment : this.current_left_segment
        let index = current_segment.findIndex(target => target.check(direction2))
        if (index > -1) {
            this.playBeatDrop()
            let target = current_segment[index]
            this.removeTargetFromSegment(isRight, target)
            target.boom()
            this.createSwordLight(direction1, isRight, target.node.getPosition())
            this.playBackgroundEffect(isRight)
            this.target_destroy++
            this.addScore(100)
        }
        else {
            this.createSwordLight(direction1, isRight)
        }
    }

    addScore(amount: number) {
        this.score += amount
        tween(this.score_label.node).to(0.1, { scale: new Vec3(1.3, 0.9, 1.2) }).to(0.1, { scale: new Vec3(1, 1, 1) }).start()
        this.score_label.string = 'Điểm: ' + this.score
    }

    playBackgroundEffect(isRight: boolean) {
        // this.isRingRight = isRight
        this.camera.screenShake(2.5)
        // tween(this.background_effect.getComponent(UIOpacity)).to(0.15, {opacity: 100}).to(0.15, {opacity: 255}).start()
        tween(this.camera.getComponent(Camera)).to(0.15, { orthoHeight: 620 }).to(0.15, { orthoHeight: 640 }).start()
        // tween(this.camera3d.getComponent(Camera)).to(0.15, {fov: 42}).to(0.15, {fov: 44}).start()    
        this.floorShakeHard()
        this.unschedule(this.floorShakeNormal)
        this.scheduleOnce(this.floorShakeNormal, 0.4)
    }

    isRingRight = false
    floorShakeHard() {
        this.isRingRight = !this.isRingRight
        this.flow_material.setProperty('noiseMoveSpeed', new Vec2(5, 5))
        let v = this.isRingRight ? 2.5 : -2.5
        this.ring_material.setProperty('noiseMoveSpeed', new Vec2(v, v))
    }

    floorShakeNormal() {
        this.flow_material.setProperty('noiseMoveSpeed', new Vec2(0.3, 0.3))
        let v = this.isRingRight ? 0.2 : -0.2
        this.ring_material.setProperty('noiseMoveSpeed', new Vec2(v, v))
    }

    createSwordLight(direction: Direction, isRight: boolean, targetpos: Vec3 = null, isBigTarget = false) {
        let obj = instantiate(this.SwordLightPrefab)
        this.target_layer.addChild(obj)
        let [x, y, z] = (targetpos != null) ? [targetpos.x, targetpos.y, targetpos.z] : (isRight) ? [4, 0.26, 1] : [4, 0.26, -1]
        obj.setPosition(x, y, z)
        obj.getComponent(SwordLight).emit(direction, isBigTarget)
    }

    playWhipSound() {
        let index = Math.floor(Math.random() * this.whipsounds.length)
        this.effect_audio.playOneShot(this.whipsounds[index], 0.35)
    }

    playBeatDrop() {
        this.effect_audio.playOneShot(this.beat_drop, 0.4)
    }

    testInput(event: EventKeyboard) {
        let key = String.fromCharCode(event.keyCode).toLocaleLowerCase()
        switch (key) {
            case 'b': this.playBackgroundEffect(true); break
            case 'w': this.testProcess(false, Direction.UP); break
            case 'a': this.testProcess(false, Direction.LEFT); break
            case 's': this.testProcess(false, Direction.DOWN); break
            case 'd': this.testProcess(false, Direction.RIGHT); break
            case 'q': this.testProcess(false, Direction.UPLEFT); break
            case 'e': this.testProcess(false, Direction.UPRIGHT); break
            case 'z': this.testProcess(false, Direction.DOWNLEFT); break
            case 'c': this.testProcess(false, Direction.DOWNRIGHT); break
            case 'i': this.testProcess(true, Direction.UP); break
            case 'j': this.testProcess(true, Direction.LEFT); break
            case 'k': this.testProcess(true, Direction.DOWN); break
            case 'l': this.testProcess(true, Direction.RIGHT); break
            case 'u': this.testProcess(true, Direction.UPLEFT); break
            case 'o': this.testProcess(true, Direction.UPRIGHT); break
            case 'm': this.testProcess(true, Direction.DOWNLEFT); break
            case '.': this.testProcess(true, Direction.DOWNRIGHT); break
        }
    }


    setDirectionLabel(isRight: boolean, direction: Direction) {
        let str = Direction[direction]
        if (isRight) this.direction_right_label.string = str
        else this.direction_left_label.string = str
    }

    strToTime(str: string) {
        let arr = str.split(':')
        let minute = Number(arr[0])
        let second = Number(arr[1])
        return minute * 60 + second
    }

    onPoseResult(poseresult: PoseResult) {
        // console.log('result', poseresult.mguide, GameState[this.gamestate])
        if (this.prev_gamestate == GameState.UNPLAYABLE) return
        if (this.prev_gamestate == GameState.RELAX) return
        if (this.prev_gamestate == GameState.HOMESCREEN) return
        // let type = poseresult.pose
        let guide = poseresult.mguide
        console.log(guide)
        //pause game
        if (guide != MoveGuide.OK && this.gamestate != GameState.PAUSE) {
            this.notInBox++
        }

        if (guide == MoveGuide.OK && this.gamestate == GameState.PLAY) {
            this.processNewPoint(true, poseresult.keypoints[10])
            this.processNewPoint(false, poseresult.keypoints[9])
        }

        //guide
        switch (guide) {
            case MoveGuide.OK:
                if (this.gamestate == GameState.PAUSE) {
                    if (!this.isCountingPose) {
                        this.isCountingPose = true
                        this.pose_timer.node.active = true
                        this.pose_timer.stopTime(true)
                        this.pose_timer.setTime(3)
                        this.pose_timer.startTime()
                    }
                    this.showUserPicture()
                    this.color_frame.color = color(0, 255, 0)
                    this.guide_arrow.spriteFrame = this.arrow_array[4]
                }

                break
            case MoveGuide.MOVE_LEFT:
                if (this.gamestate == GameState.PAUSE) {
                    this.isCountingPose = false
                    this.pose_timer.stopTime()
                    this.showUserPicture()
                    this.color_frame.color = color(255, 128, 0)
                    this.guide_arrow.spriteFrame = this.arrow_array[0]
                }

                break
            case MoveGuide.MOVE_RIGHT:
                if (this.gamestate == GameState.PAUSE) {
                    this.isCountingPose = false
                    this.pose_timer.stopTime()
                    this.showUserPicture()
                    this.color_frame.color = color(255, 128, 0)
                    this.guide_arrow.spriteFrame = this.arrow_array[1]
                }

                break
            case MoveGuide.MOVE_CAMERA_DOWN:
                if (this.gamestate == GameState.PAUSE) {
                    this.isCountingPose = false
                    this.pose_timer.stopTime()
                    this.showUserPicture()
                    this.color_frame.color = color(255, 128, 0)
                    this.guide_arrow.spriteFrame = this.arrow_array[3]
                }

                break
            case MoveGuide.MOVE_AWAY:
                if (this.gamestate == GameState.PAUSE) {
                    this.isCountingPose = false
                    this.pose_timer.stopTime()
                    this.showUserPicture()
                    this.color_frame.color = color(255, 128, 0)
                    this.guide_arrow.spriteFrame = this.arrow_array[2]
                }

                break
        }

        if (this.notInBox > 8) {
            this.notInBox = 0
            this.gamestate = GameState.PAUSE
            console.log('PAUSE')
            director.pause()
            // this.api.startUpdateStart(this.user_info._id)
            this.update_start = true
            this.showUserPicture()
            this.pauseMusic()
        }
    }

    showUserPicture(onlyPicture = false) {
        if (!onlyPicture) {
            this.guide_arrow.node.active = true
            this.color_frame.node.active = true
        }

        this.user_picture.node.active = true
    }

    poseTimerIsDone() {
        this.isCountingPose = false
        this.doneGettingPose()
        director.resume()
        this.gamestate = this.prev_gamestate
        this.startMusic()
    }

    doneGettingPose() {
        if (this.prev_gamestate == GameState.TUTORIAL) {
            this.guide_arrow.node.active = false
        }
        else {
            this.hideUserPicture()
        }
        // this.api.stopUpdateStart(this.user_info._id)
        this.update_start = false
    }


    getWebcam() {
        let isSafari = navigator.userAgent.indexOf('Safari')
        if (isSafari) {
            this.video.muted = true
            this.video.playsInline = true
            navigator.mediaDevices.getUserMedia({ video: true, audio: false })
                .then(stream => {
                    this.video.srcObject = stream
                    this.video.play()
                })
                .catch(err => { console.log(err) })
        }
        else {
            this.video.setAttribute('autoplay', '');
            this.video.setAttribute('muted', '');
            this.video.setAttribute('playsinline', '');
            let constraint = {
                audio: false,
                video: {
                    facingMode: 'user'
                }
            }
            navigator.mediaDevices.getUserMedia(constraint)
                .then(stream => {
                    this.video.srcObject = stream
                })
                .catch(err => { console.log(err) })
        }

        this.video.addEventListener('canplay', () => {
            if (!this.isStreaming) {
                this.isStreaming = true
                this.height = this.video.videoHeight / (this.video.videoWidth / this.width)
                this.video.setAttribute('width', this.width.toString());
                this.video.setAttribute('height', this.height.toString());
                this.canvas.setAttribute('width', this.width.toString());
                this.canvas.setAttribute('height', this.height.toString());
            }
        }, false)
    }

    startTakePicture() {
        let time = 100
        this.pose_interval = setInterval(() => { this.takePicture() }, time)
    }

    stopTakePicture() {
        this.hideUserPicture()
        clearInterval(this.pose_interval)
    }

    hideUserPicture(keepPicture = false) {
        // this.pose_label.node.active = false
        this.guide_arrow.node.active = false
        this.color_frame.node.active = false

        if (!keepPicture) {
            this.user_picture.node.active = false
        }
    }

    takePicture() {
        let result: Promise<Blob> = new Promise((resolve) => {
            this.canvas.getContext('2d').drawImage(this.video, 0, 0, this.width, this.height)
            this.canvas.toBlob(blob => { resolve(blob) }, 'image/jpeg')
        })
        if (this.promise_array.length >= 3) {
            if (this.promise_array[0]) this.promise_array = [this.promise_array[0]]
        }
        this.promise_array.push(result)
        if (this.promise_array.length == 1) this.handlePicturePromise(result)
    }

    handlePicturePromise(promise: Promise<Blob>) {
        promise.then(blob => {
            this.api.predictPose(blob, this.update_start)
            if (this.gamestate == GameState.PAUSE || this.gamestate == GameState.TUTORIAL) {
                const spriteFrame = new SpriteFrame();
                const texture = new Texture2D();
                texture.image = new ImageAsset(this.canvas);
                spriteFrame.texture = texture;
                this.user_picture.spriteFrame = spriteFrame
            }
            this.promise_array.shift()
            if (this.promise_array[0]) this.handlePicturePromise(this.promise_array[0])
        })
    }

    onnetworkStatusChange(ns: NetworkStatus) {
        return null
    }

    pauseMusic() {
        this.audio.pause()
    }

    startMusic() {
        // if (!this.audio.playing && this.isMusicAllowed)
        if (this.audio.paused && this.isMusicAllowed)
            this.audio.play()
    }

    stopMusic() {
        // this.audio.stop()
        this.audio.pause()
        this.isMusicAllowed = false
        this.audio.currentTime = 0
        this.beatnodes_left.forEach(node => {
            this.setBeatPos(node, 0, true)
        })
        this.beatnodes_right.forEach(node => {
            this.setBeatPos(node, 0, true)
        })
        this.beatnodes_left2d.forEach(node => {
            this.setBeatPos(node, 0, true)
        })
        this.beatnodes_right2d.forEach(node => {
            this.setBeatPos(node, 0, true)
        })
    }

    setBeatPos(node: Node, y = 0, isTween = false) {
        let pos = node.getPosition().clone()
        pos.y = y
        if (isTween)
            tween(node).to(1, { position: pos }, { easing: 'quadOut' }).start()
        else
            node.setPosition(pos)
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

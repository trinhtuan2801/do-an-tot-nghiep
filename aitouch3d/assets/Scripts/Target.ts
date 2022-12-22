
import { _decorator, Component, tween, Vec3, SpriteFrame, Sprite, Prefab, instantiate, ParticleSystem2D, Node, isPropertyModifier, Tween, Material, MeshRenderer, ParticleSystem, CurveRange, find, Camera, director, game, Game, Vec2, UITransform } from 'cc';
import { ColorRing } from './ColorRing';
import { Direction } from './DirectionHandler';
import { GameManager } from './GameManager';
import { SpawnLight } from './SpawnLight';
const { ccclass, property } = _decorator;

@ccclass('Target')
export class Target extends Component {

    @property(MeshRenderer)
    direction_frame: MeshRenderer = null

    isBoom = false

    direction: Direction = null

    runtime = 2

    @property(Prefab)
    spread_ring_prefab: Prefab = null

    @property(Prefab)
    special_ring_prefab: Prefab = null

    isSpecial = false

    @property(Node)
    particle: Node = null

    isRight = false

    game: GameManager = null

    start_x = 0

    default_scale: Vec3 = null

    @property(Prefab)
    spawnlight_prefab: Prefab = null

    @property(Prefab)
    miss_label_prefab: Prefab = null

    onLoad()
    {
        this.particle.active = false
        this.default_scale = this.node.getScale().clone()
        this.node.setScale(0, 0, 0)
    }

    init(material: Material, direction: Direction, runtime: number, isSpecial = false, isRight: boolean, game: GameManager)
    {
        this.start_x = this.node.getPosition().x
        this.direction_frame.setMaterial(material, 0)
        this.direction = direction
        this.runtime = runtime
        this.isSpecial = isSpecial
        this.isRight = isRight
        this.game = game
    }

    check(direction: Direction)
    {
        if (!this.node || !this.node.isValid) return false
        if (this.node.position.x > 6 || this.node.position.x < 2) return false
        let inputstr = Direction[direction]
        let thisstr = Direction[this.direction]
        if (inputstr.includes(thisstr)) 
        {
            return true
        }
        else return false
    }

    run()
    {
        if (this.isSpecial) this.particle.active = true
        let time = this.runtime * (this.start_x - 1.9) / (this.start_x - 3)
        tween(this.node).to(0.1, {scale: this.default_scale}).start()
        tween(this.node).to(time, {position: new Vec3(1.9, this.node.position.y, this.node.position.z)})
        .call(()=>
        {
            this.isBoom = true
            this.game.removeTargetFromSegment(this.isRight, this)
            this.createMissLabel()
            this.node.destroy()
        })
        .start()
        this.createSpawnLight()
    }

    boom()
    {
        if (!this.isBoom)
        {
            Tween.stopAllByTarget(this.node)
            this.isBoom = true
            // this.game.removeTargetFromSegment(this.isRight, this)
            this.createSpreadRing()
            this.node.destroy()
        }
    }

    createSpreadRing()
    {
        let x = (Direction[this.direction].includes('UP')||Direction[this.direction].includes('DOWN')) ? this.getRandom(-20, 20) : this.getRandom(70, 110)
        let angle = new Vec3(x, 0, 0)
        let spread_ring = (this.isSpecial) ? instantiate(this.special_ring_prefab) : instantiate(this.spread_ring_prefab)
        this.node.parent.addChild(spread_ring)
        spread_ring.setWorldPosition(this.node.getWorldPosition())
        spread_ring.setRotationFromEuler(angle)
        spread_ring.setScale(1, 1, 1)
        spread_ring.getComponent(ParticleSystem).limitVelocityOvertimeModule.dampen = (this.isSpecial) ? -1.5 : -0.5
        spread_ring.getComponent(ParticleSystem).play()
    }

    getRandom(min: number, max: number)
    {
        return Math.random()*(max-min) + min
    }
    
    createSpawnLight()
    {
        let spawnlight = instantiate(this.spawnlight_prefab)
        this.node.parent.addChild(spawnlight)
        spawnlight.setWorldPosition(this.node.getWorldPosition())
        spawnlight.getComponent(SpawnLight).appear()
    }

    createMissLabel()
    {
        let label = instantiate(this.miss_label_prefab)
        let z = this.node.getPosition().z
        let pos = new Vec3(z * 170, -600, 0)

        find('Canvas').addChild(label)
        label.setPosition(pos)
        tween(label).to(0.1, {scale: new Vec3(1.3, 1.3, 0)}).to(0.2, {scale: new Vec3(0, 0, 0)})
        .call(()=>{label.destroy()}).start()
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


import { _decorator, Component, Node, instantiate, Prefab, Sprite, SpriteFrame, tween, Tween, Vec3, resources, MeshRenderer, Material, ParticleSystem, CurveRange } from 'cc';
import { ColorRing } from './ColorRing';
import { Direction } from './DirectionHandler';
import { GameManager } from './GameManager';
const { ccclass, property } = _decorator;

@ccclass('BigTarget')
export class BigTarget extends Component {
    
    @property(MeshRenderer)
    sphere: MeshRenderer = null

    isBoom = false

    runtime = 2

    // @property(Prefab)
    // color_ring_prefab: Prefab = null

    isRight = false

    game: GameManager = null

    // oldscale: Vec3 = null

    isHittable = true

    @property(ParticleSystem)
    particle: ParticleSystem = null

    default_scale: Vec3 = null

    @property(Prefab)
    spread_ring_prefab: Prefab = null

    onLoad()
    {
        // this.oldscale = this.direction_frame.node.getScale().clone()
        this.default_scale = this.node.getScale().clone()
        this.node.setScale(0, 0, 0)
    }

    init(url: string, runtime: number, game: GameManager)
    {
        this.loadMaterial(url)
        this.runtime = runtime * 1.5
        this.game = game
    }

    loadMaterial(url: string)
    {
        let path = `Material/planet/${url}`
        resources.load(path, Material, (err, material)=>
        {
            this.sphere.setMaterial(material, 0)
        })
    }

    run()
    {
        let time = this.runtime
        tween(this.node).to(1.5, {scale: this.default_scale}, {easing: 'quadOut'}).start()
        tween(this.sphere.node).by(0.8, {eulerAngles: new Vec3(0, 360, 0)}).repeatForever().start()
        tween(this.node).to(time, {position: new Vec3(7, this.node.position.y, this.node.position.z)}, {easing: 'quadOut'})
        .delay(2)
        .call(()=>
        {
            this.isHittable = false
            tween(this.sphere.node).to(0.1, {scale: new Vec3(1.2, 1.2, 1.2)})
            .to(0.1, {scale: new Vec3(0, 0, 0)}).start()
            this.particle.capacity = 0
            this.particle.loop = false
            this.particle.limitVelocityOvertimeModule.enable = false
            this.particle.capacity = 2000
            this.game.BigTarget = null
        })
        .delay(1)
        .call(()=>
        {
            this.isBoom = true
            this.game.finishLevel()
            this.node.destroy()
        })
        .start()
    }

    getHit()
    {
        if (this.isHittable)
        {
            // this.createColorRing()
            this.createSpreadRing()
            // let scale = this.oldscale.clone()
            // tween(this.direction_frame.node).to(0.05, {scale: scale.add3f(1, 1, 1)}).to(0.05, {scale: this.oldscale}).start()
        }
        
    }

    boom()
    {
        if (!this.isBoom)
        {
            Tween.stopAllByTarget(this.node)
            this.isBoom = true
            // this.createColorRing()
            this.node.destroy()
        }
    }

    // createColorRing()
    // {
    //     let ring = instantiate(this.color_ring_prefab)
    //     this.node.parent.addChild(ring)
    //     ring.setWorldPosition(this.node.getWorldPosition())
    //     ring.getComponent(ColorRing).emit(true, true)
    // }

    createSpreadRing()
    {
        let angle = new Vec3(this.getRandom(0, 180), this.getRandom(0, 180), this.getRandom(0, 180))
        let spread_ring = instantiate(this.spread_ring_prefab)
        this.node.addChild(spread_ring)
        spread_ring.setRotationFromEuler(angle)
        spread_ring.setScale(1, 1, 1)
        spread_ring.getComponent(ParticleSystem).play()
    }

    getRandom(min: number, max: number)
    {
        return Math.random()*(max-min) + min
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


import { _decorator, Vec2, misc } from 'cc';

export enum Direction {
    NULL,
    UP,
    DOWN,
    LEFT,
    RIGHT,
    UPLEFT,
    UPRIGHT,
    DOWNLEFT,
    DOWNRIGHT,
}

export class DirectionHandler {

    prev: Vec2 = new Vec2(-1000, -1000)
    near_th = 100
    prev_direction: Direction = Direction.NULL

    processNewPoint(point: Vec2)
    {
        let dist = Math.sqrt((point.x - this.prev.x)**2 + (point.y - this.prev.y)**2)
        let result = [Direction.NULL, Direction.NULL]

        if (dist > this.near_th)
        {
            let directions = this.getDirection(this.prev, point)
            // if (direction != this.prev_direction)
            // {
            //     result = direction
            // }
            result = directions
            this.prev = point
        }

        return result
    }

    getDirection(prev: Vec2, curr: Vec2)
    {
        let angle = this.getAngle(prev, curr)
        let direction1 = Direction.NULL //hand
        let direction2 = Direction.NULL //check
        if (this.isInRange(angle, 0, 22.5) || this.isInRange(angle, -22.5, 0)) direction1 = Direction.RIGHT
        else if (this.isInRange(angle, 22.5, 67.5)) direction1 = Direction.UPRIGHT
        else if (this.isInRange(angle, 67.5, 112.5)) direction1 = Direction.UP
        else if (this.isInRange(angle, 112.5, 157.5)) direction1 = Direction.UPLEFT
        else if (this.isInRange(angle, 157.5, 180) || this.isInRange(angle, -180, -157.5)) direction1 = Direction.LEFT
        else if (this.isInRange(angle, -157.5, -112.5)) direction1 = Direction.DOWNLEFT
        else if (this.isInRange(angle, -112.5, -67.5)) direction1 = Direction.DOWN
        else direction1 = Direction.DOWNRIGHT
        if (this.isInRange(angle, 0, 90)) direction2 = Direction.UPRIGHT
        else if (this.isInRange(angle, 90, 180)) direction2 = Direction.UPLEFT
        else if (this.isInRange(angle, -180, -90)) direction2 = Direction.DOWNLEFT
        else direction2 = Direction.DOWNRIGHT
        return [direction1, direction2]
    }

    getAngle(prev: Vec2, curr: Vec2)
    {
        let rad = Math.atan2(curr.y - prev.y, curr.x - prev.x)
        let angle = misc.radiansToDegrees(rad)
        return angle
    }

    isInRange(num: number, small: number, big: number)
    {
        return num >= small && num <= big
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

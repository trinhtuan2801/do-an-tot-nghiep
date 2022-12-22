
export enum NetworkStatus {
    OK,
    RECONNECTING,
    WEAK,
    ERROR,
    CLOSE
  }
  
  export enum MoveGuide {
    OK,
    MOVE_LEFT,
    MOVE_RIGHT,
    MOVE_CAMERA_DOWN,
    MOVE_AWAY
  }
  
  interface PoseResultJSON {
    mguide: MoveGuide;
    keypoints: object;
  }
  
  export class PoseResult extends Object {
    constructor(
        public mguide: MoveGuide,
        public keypoints: object
    ) {
        super()
    }
  
    toJSON(): PoseResultJSON {
        return Object.assign({}, this)
    }
  
    static fromJSON(pJSON: PoseResultJSON): PoseResult {
        let p = Object.create(PoseResult.prototype);
        return Object.assign(p, pJSON);
    }
  }
  
  export interface APIHandler {
    onnetworkStatusChange(ns: NetworkStatus): void;
    onPoseResult(poseResult: PoseResult): void;
  }
  
  let debug: boolean = false;
  export class APIHelper extends Object {
  
    private ws: WebSocket;
    private mqueue: Array<any>;
    private intervalId: any = null;
  
    constructor(
        private apiHandler: APIHandler
    ) {
        super();
        console.log('Init APIHelper');
        console.log('############create API instance')
        this.mqueue = [];
        // this.ws = new WebSocket('ws://172.28.45.231:21777/');
        // this.ws = new WebSocket('wss://monsters.vn/am/ws/');
        this.ws = new WebSocket('ws://localhost:12345/');
        this.ws.onopen = (ev: Event) => {
            this.wsOnOpen(ev);
        }
        //TODO check the function bind
        this.ws.onmessage = (ev: Event) => {
            this.wsOnMessage(ev);
        }
  
        this.ws.onclose = (ev: CloseEvent) => {
            this.wsOnClose(ev);
        }
        this.ws.onerror = (ev: Event) => {
            this.wsOnError;
        }
  
    }
  
    private shouldQueueMessage(message: any): boolean {
        if (this.ws.readyState != WebSocket.OPEN) {
            console.log('a message has been queued up', message, 'queue length', this.mqueue.length, 'ws status', this.ws.readyState)
            this.mqueue.push(JSON.stringify(message));
            if (this.mqueue.length > 8) {
                console.log('Change network status to WEAK')
                this.apiHandler.onnetworkStatusChange(NetworkStatus.WEAK)
            }
            return true;
        }
        if (this.mqueue.length > 0) {
            while (this.mqueue.length > 0) {
                this.ws.send(this.mqueue.shift())
            }
            this.apiHandler.onnetworkStatusChange(NetworkStatus.OK)
            console.log('WS sent messages in queue successfully');
        }
        return false
    }
  
    wsOnOpen(ev: Event) {
        console.log('WS was oppended');
        console.log('############open connection')
  
        if (this.mqueue.length == 0) return;
        while (this.mqueue.length > 0) {
            this.ws.send(this.mqueue.shift())
        }
        console.log('WS sent messages in queue successfully');
  
    }
    wsOnError(ev: Event) {
        console.log('WS was error!!!!!!!!!');
        this.apiHandler.onnetworkStatusChange(NetworkStatus.ERROR);
    }
    wsOnClose(ev: Event) {
        console.log('WS was on close!!!!!!!!!!!!');
        this.apiHandler.onnetworkStatusChange(NetworkStatus.CLOSE);
    }
  
    wsOnMessage(event: any) {
        if (debug) { console.log("API, response text msg: " + event.data); }
        let data = JSON.parse(event.data);
        this.apiHandler.onPoseResult(PoseResult.fromJSON(data));
    }

  
    public async predictPose(frame: Blob, update_start: boolean) {
        let bdata = await this.blobToData(frame)
        let message = { command: 'detect_pose', frame: bdata, update_start: update_start }
        if (this.shouldQueueMessage(message)) {
            return;
        }
        this.ws.send(JSON.stringify(message))
    }
  
    public close() {
        clearInterval(this.intervalId);
        this.ws.close(1000, 'Finished');
    }
  
  
    blobToData = (blob: Blob) => {
        return new Promise((resolve) => {
            const reader = new FileReader()
            reader.onloadend = function () {
                let base64data = reader.result as string;
                resolve(base64data.split(',')[1]);
            }
            reader.readAsDataURL(blob)
        })
    }
  }
  
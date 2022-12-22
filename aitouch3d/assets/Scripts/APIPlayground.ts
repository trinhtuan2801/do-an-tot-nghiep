
interface PlaygroundUserJSON{
    _id: string;
    cas_id: string;
    from_cas:string;
    email: string;
    mobile: string;
    name: string;
}

export class PlaygroundUser extends Object{
    constructor(
        public _id:string, public cas_id: string, public from_cas:string, public email:string, public mobile: string, public name: string
    ){
        super()
    }

    toJSON(): PlaygroundUserJSON{
        return Object.assign({}, this)
    }

    static fromJSON(pJSON: PlaygroundUserJSON): PlaygroundUser{
        let pu = Object.create(PlaygroundUser.prototype);
        return Object.assign(pu, pJSON);
    }
}

export class ReseponseStatus extends Object{
    constructor(
        public status:string, public message:string, public code:number
    ){
        super()
    }
}

export module APIPlayground{
    // let surl='http://172.28.45.231:21990/';
    let surl='https://pg.monsters.vn/api/';
    function invoke(curl:string, cmethod:string, data:any):any{
        let xhr = new XMLHttpRequest();
        xhr.open(cmethod, curl, false);
        console.log('sending request...', curl);
        // console.log('check datatype or dict', typeof({}))
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify(data));
        let dret = JSON.parse(xhr.responseText);
        return dret;
    }

    function getAccessToken():string|null{
        let access_token = localStorage.getItem("access_token")
        console.log("token game", access_token);
        return access_token;
    }

    export function getUser():PlaygroundUser|ReseponseStatus{
        let access_token = getAccessToken();
        console.log('In getUSER, access_token', access_token);
        if (access_token == null){
            return new ReseponseStatus('Unauthorized', 'Signin web playground is required (null)', 401);
        }

        let curl = surl + 'users';
        let xhr = new XMLHttpRequest();
        xhr.open('GET', curl, false);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
        xhr.send();
        let dret = JSON.parse(xhr.responseText);
        if ('message' in dret && dret['message'] == 'OK'){
            let user = PlaygroundUser.fromJSON(dret.data);
            return user;
        }
        return new ReseponseStatus('Unauthorized', 'Signin web playground is required', 401);
    }

    export function setKeyValue(user_id: string, key: string, value: any, app_id:string='aimove'):object{
        let url = surl + 'keyvalue/' + app_id + '/' + user_id ;
        let xhr = new XMLHttpRequest();
        xhr.open("POST", url, false);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify({"key": key, "value": value}));
        let dret = JSON.parse(xhr.responseText);
        return dret;
    }

    export function getKeyValue(user_id: string, key: string, app_id:string='aimove'):object{
        let url = surl + 'keyvalue/' + app_id + '/' + user_id + '/' + key;
        let xhr = new XMLHttpRequest();
        xhr.open("GET", url, false);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send();
        let dret = JSON.parse(xhr.responseText);
        return dret;
    }
}
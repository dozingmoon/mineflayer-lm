import mineflayer from "mineflayer"
import chalk from "chalk"
import v from "vec3"

var auto_rethrow = 60000;//重抛超时。超过此时间还没有钓到鱼则尝试重新抛竿。 (毫秒)
var fishrod_distance = 25;//浮标落水点与鱼咬钩点之间的距离 小于此值便会收杆
var afterthrow_timeout = 1000;//抛竿与浮标落水的时间差，即抛竿后该段时间内的实体落水事件会被认为是浮标入水。服务器tps较低时需调高。 (毫秒)
var lookThrow_interval = 300;
var AutoReconnect_Interval = 60 * 1000;
let firstLogin = true;

class Do {
    static getDistance(x1, y1, z1, x2, y2, z2) {
        return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1) + (z2 - z1) * (z2 - z1));
    }

    static getTime() {
        var now = new Date();
        return '[' + now.getFullYear() + '/' + (now.getMonth() + 1) + '/' + now.getDay() + ' ' + ("0" + now.getHours()).slice(-2) + ':' + ("0" + now.getMinutes()).slice(-2) + ':' + ("0" + now.getSeconds()).slice(-2) + '] ';
    }
}
class Player {
    static heldItemIndex = 0;
    static fishrod_x = 0;
    static fishrod_y = 0;
    static fishrod_z = 0;
    static throw_time = 0;
    static BobberPos = v(8424, 3, -3210);
    static throwList = [];
}

let botArgs = {
    auth: 'microsoft',
    host: 'mcledream.net',//'localhost',// 
    port: '',
    version: '1.20.1'
}
function CurrentTime() {
    return (new Date().toLocaleString());
};
class MCBot {
    static levelCounts = 1800000 / 200; // 30-min

    // Constructor
    constructor(username) {
        this.username = username;
        this.host = botArgs["host"];
        this.port = botArgs["port"];
        this.version = botArgs["version"];
        this.auth = botArgs["auth"];

        this.view = false;
        this.initBot();
    }
    // Init bot instance
    initBot() {
        this.bot = mineflayer.createBot({
            "username": this.username,
            "host": this.host,
            "port": this.port,
            "version": this.version,
            "auth": this.auth
        });
        // Initialize bot events
        this.initEvents();
    }

    // Logger
    log(...msg) {
        console.log(chalk.ansi256(242)(CurrentTime()),
            //` [${this.username}]`,
            ...msg);
    }
    // Chat intake logger
    chatLog(username, ...msg) {
        this.log(chalk.ansi256(98)(`<${username}>`), ...msg)
    }

    // Init bot events
    initEvents() {
        this.bot.on('login', async () => {
            let botSocket = this.bot._client.socket;
            this.log(chalk.ansi256(34)(`Logged in to ${botSocket.server ? botSocket.server : botSocket._host}`));
        });

        this.bot.on('end', async (reason) => {
            this.log(chalk.red(`Disconnected: ${reason}`));
            throw new Error();
            // exit();
        });

        this.bot.on('spawn', async () => {
            this.log(chalk.ansi256(46)(`Spawned in`));
            /* if (!this.view) {
                this.view = true;
                mineflayerViewer.mineflayer(this.bot, { port: 3000 });
            } */
            if (firstLogin) {
                setTimeout(() => { this.bot.chat("\/sv"); }, 10 * 1000);
                setTimeout(() => { this.bot.chat("\/warp dozingmoon"); }, 10 * 1000 + 1000);
                setTimeout(() => { this.bot.chat("\/home witch"); }, 10 * 1000 + 1000);
                firstLogin = false;
            }
            else {
                setTimeout(() => { this.bot.chat("\/sv"); }, 10 * 60 * 1000);
                setTimeout(() => { this.bot.chat("\/warp dozingmoon"); }, 10 * 60 * 1000 + 2000);
                setTimeout(() => { this.bot.chat("\/home witch"); }, 10 * 60 * 1000 + 2000);
            }

            //Throw first rod at 3000ms
            setTimeout(() => {
                /* this.bot.on('experience',async()=>{
                    console.log("experience updated");
                    let count = 0;
                    if(this.bot.experience.points >= 70){
                        // Clear inventory
                        console.log(this.bot.inventory.slots[9])
                        while(this.bot.inventory.slots[9]!=null){
                            this.bot.tossStack(this.bot.inventory.slots[9])
                            setTimeout(()=>{},200)
                        }
                        // Buy shulker box
                        this.bot.chat("\/menu");
                        setTimeout(()=>{this.bot.simpleClick.leftMouse(2)},500)
                        setTimeout(()=>{this.bot.simpleClick.leftMouse(12)},500)
                        do{
                            setTimeout(()=>{this.bot.simpleClick.leftMouse(15)},500)
                            count=count+1;
                        }while(this.bot.experience.points >= 70)
        
                        this.bot.toss(500,null,count+1);
                        this.bot.closeWindow();
                    }
                });
                this.log(`[FishBot]Look at ${Player.BobberPos}!`)
                this.bot.lookAt(Player.BobberPos)
                setTimeout(() => {
                    this.bot.activateItem(true)
                    Player.throw_time = new Date().getTime();
                }, lookThrow_interval) */
                setTimeout(() => { this.counter = 1; }, 500);
            }, 3000);

            setTimeout(() => {
                setInterval(() => {
                    if (this.counter >= 1) {
                        //Killaura
                        let mobFilter = e => e.name === 'blaze'
                        try {
                            let mob = this.bot.nearestEntity(mobFilter)
                            if (!mob) return;

                            let pos = mob.position;
                            //this.bot.lookAt(pos, true);
                            this.bot.attack(mob, false);
                        }
                        catch {
                            return;
                        }

                        /* if (this.counter % 5 == 1) {
                            //Rethrow fishing rod
                            var tnow = new Date().getTime();
                            if (Player.throw_time != 0 && tnow > Player.throw_time && tnow - Player.throw_time >= auto_rethrow) {
                                this.bot.activateItem(true)
                                this.log('[FishBot]Rethrow');
                                this.log(`[FishBot]Look at ${Player.BobberPos}!`)
                                this.bot.lookAt(Player.BobberPos)
                                setTimeout(() => {
                                    this.bot.activateItem(true)
                                    Player.throw_time = new Date().getTime();
                                }, lookThrow_interval)
                                setTimeout(() => { }, 1000);
                            }
                        } */
                        this.counter++

                        if (this.counter == MCBot.levelCounts) {
                            this.bot.chat("\/jobs stats")
                            this.bot.chat("\/jobs limit")
                            this.bot.chat("\/bal")
                            this.counter = 1;
                        }
                    }
                }, 400)
            }, 3000);
        });

        this.bot.on('hardcodedSoundEffectHeard', async (soundId, soundCategory, position, volume, pitch) => {
            if (soundId == 459) {//咬钩
                /* var sound_distance = (Do.getDistance(position.x, position.y, position.z, Player.fishrod_x, Player.fishrod_y, Player.fishrod_z) / 8).toFixed(2);
                this.log('[FishBot]Sound Distance: ' + sound_distance);
                if (sound_distance <= fishrod_distance) { */
                this.log('[FishBot]Hooked!');
                this.bot.activateItem(true)
                setTimeout(() => {
                    this.log(`[FishBot]Look at ${Player.BobberPos}!`)
                    this.bot.lookAt(Player.BobberPos);
                    setTimeout(() => {
                        this.bot.activateItem(true)
                        Player.throw_time = new Date().getTime();
                    }, 100)
                }, lookThrow_interval);
                /* } else {
                    this.log('[FishBot]Far Fishing Sound');
                } */
            }
            if (soundId == 522) {//入水
                var tnow = new Date().getTime();
                if (tnow > Player.throw_time && tnow - Player.throw_time <= afterthrow_timeout) {//浮标入水后会持续产生入水音效 设置超时以避免重复计入
                    this.log('[FishBot]Bobber in water');
                }
            }
        });
        this.bot.on('messagestr', async (message, messagePosition, jsonMsg, sender, verified) => {
            switch (messagePosition) {
                case 'chat':
                    this.chatLog(sender, message);
                    break;
                case 'system':
                    this.log(message);
                    break;
                default:
                    this.log(chalk.ansi256(130)(message));
                    break;
            }
        });

        this.bot.on('error', async (err) => {
            // Connection error
            if (err.code == 'ECONNREFUSED') {
                this.log(`Failed to connect to ${err.address}:${err.port}`);
            }
            // Unhandled errors
            else {
                this.log(`Unhandled error: ${err}`);
            }
            this.bot.end();
            setTimeout(() => { this.initBot(); }, AutoReconnect_Interval);
        });
    }
}

let Bot = null;
Bot = new MCBot('dozingmoon');
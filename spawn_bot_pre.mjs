import mineflayer from "mineflayer"
import chalk from "chalk"
//import mineflayerViewer from "prismarine-viewer"
import v from "vec3"

var auto_rethrow = 60000;//重抛超时。超过此时间还没有钓到鱼则尝试重新抛竿。 (毫秒)
var fishrod_distance = 25;//浮标落水点与鱼咬钩点之间的距离 小于此值便会收杆
var afterthrow_timeout = 1500;//抛竿与浮标落水的时间差，即抛竿后该段时间内的实体落水事件会被认为是浮标入水。服务器tps较低时需调高。 (毫秒)
var lookThrow_interval = 300;

class Do {
    static getDistance(x1, y1, z1, x2, y2, z2) {
        return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1) + (z2 - z1) * (z2 - z1));
    }

    static getTime() {
        var now = new Date();
        return '[' + now.getFullYear() + '/' + (now.getMonth() + 1) + '/' + now.getDay() + ' ' + ("0" + now.getHours()).slice(-2) + ':' + ("0" + now.getMinutes()).slice(-2) + ':' + ("0" + now.getSeconds()).slice(-2) + '] ';
    }
    static isInRange(pnt, ref, spacing = 0.5) {
        return pnt.distanceTo(ref) <= spacing;
    }
}
class Player {
    static heldItemIndex = 0;
    static mainHand_ThrowTime = 0;
    static offHand_ThrowTime = 0;
    static mainHand_BobberPos = v(0, 0, 0);
    static offHand_BobberPos = v(0, 0, 0);
    static throwList = [895 //cod
        , 896   //salmon
        , 897   //tropical fish
        , 898   //pufferfish
        , 953   //blaze rod
        , 1059  //player head
        , 921   //bone
        , 761   //arrow
    ]
}

let botArgs = {
    //auth: 'microsoft',
    //host: 'mc.ledream.net',
    host: 'localhost',
    port: '3296',
    version: '1.20.1'
}
function CurrentTime() {
    return (new Date().toLocaleString());
};
class MCBot {

    // Constructor
    constructor(username) {
        this.username = username;
        this.host = botArgs["host"];
        this.port = botArgs["port"];
        this.version = botArgs["version"];
        this.auth = botArgs["auth"];

        this.view = false;
        this.initBot()
    }
    // Init bot instance
    initBot() {
        try {
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
        catch {
            this.initBot();
        }
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

            // Attempt to reconnect
            setTimeout(() => this.initBot(), 5000);
        });

        this.bot.on('spawn', async () => {
            this.log(chalk.ansi256(46)(`Spawned in`));
            this.bot.chat('\/tp @p dozingmoon')/* 
                this.bot.equip(this.bot.heldItem,"off-hand")
                this.bot.setQuickBarSlot(1) */
            //this.bot.chat("\/tp @p dozingmoon")
            /* let promise = new Promise((resolve, reject) => {
                let spawnPoint = this.bot.player.entity.position;
                Player.mainHand_BobberPos = spawnPoint.offset(1, 0, 0.5);
                Player.offHand_BobberPos = spawnPoint.offset(1, 0, -0.5);
                resolve();
            })
            await promise;

            if (!this.view) {
                this.view = true;
                mineflayerViewer.mineflayer(this.bot, { port: 3000 });
            }


            //Throw first rod at 3000ms
            setTimeout(() => {
                this.log(`[FishBot]Look at ${Player.mainHand_BobberPos}!`)
                this.bot.lookAt(Player.mainHand_BobberPos)
                setTimeout(() => {
                    this.bot.fish()
                    Player.mainHand_ThrowTime = new Date().getTime();
                }, lookThrow_interval)

                setTimeout(()=>{this.log(`[FishBot]Look at ${Player.offHand_BobberPos}!`)
                this.bot.lookAt(Player.offHand_BobberPos)
                setTimeout(() => {
                    this.bot.activateItem(true)
                    Player.offHand_ThrowTime = new Date().getTime();
                }, lookThrow_interval)},1000)
            }, 3000);

            setInterval(() => {
                console.log(Player.mainHand_ThrowTime, Player.offHand_ThrowTime)
                //Rethrow fishing rod
                var tnow = new Date().getTime();
                if (Player.mainHand_ThrowTime != 0 && tnow > Player.mainHand_ThrowTime && tnow - Player.mainHand_ThrowTime >= auto_rethrow) {
                    this.bot.activateItem()
                    this.log('[FishBot]Rethrow main hand.');
                    this.log(`[FishBot]Look at ${Player.mainHand_BobberPos}!`)
                    this.bot.lookAt(Player.mainHand_BobberPos)
                    setTimeout(() => {
                        this.bot.activateItem()
                        Player.mainHand_ThrowTime = new Date().getTime();
                    }, lookThrow_interval)
                }
                if (Player.offHand_ThrowTime != 0 && tnow > Player.offHand_ThrowTime && tnow - Player.offHand_ThrowTime >= auto_rethrow) {
                    this.bot.activateItem(true)
                    this.log('[FishBot]Rethrow off-hand.');
                    this.log(`[FishBot]Look at ${Player.offHand_BobberPos}!`)
                    this.bot.lookAt(Player.offHand_BobberPos)
                    setTimeout(() => {
                        this.bot.activateItem()
                        Player.offHand_ThrowTime = new Date().getTime();
                    }, lookThrow_interval)
                }
            }, 1000); */
        });
        /* this.bot.on('hardcodedSoundEffectHeard', async (soundId, soundCategory, position, volume, pitch) => {
            console.log(soundId)
            console.log(position.x, position.y, position.z)
            if (soundId == 459) {//咬钩
                if (Do.InRange(pnt = position, ref = mainHand_BobberPos, spacing = 0.5)) {
                    this.log('[FishBot]Hooked main hand!');
                    this.bot.activateItem()
                    setTimeout(() => {
                        this.log(`[FishBot]Look at ${Player.mainHand_BobberPos}!`)
                        this.bot.lookAt(Player.mainHand_BobberPos);
                        setTimeout(() => {
                            this.bot.activateItem()
                            Player.mainHand_ThrowTime = new Date().getTime();
                        }, 100)
                    }, lookThrow_interval);
                }
                else if (Do.InRange(pnt = position, ref = offHand_BobberPos, spacing = 0.5)) {
                    this.log('[FishBot]Hooked off-hand!');
                    this.bot.activateItem(true)
                    setTimeout(() => {
                        this.log(`[FishBot]Look at ${Player.offHand_BobberPos}!`)
                        this.bot.lookAt(Player.offHand_BobberPos);
                        setTimeout(() => {
                            this.bot.activateItem(true)
                            Player.offHand_ThrowTime = new Date().getTime();
                        }, 100)
                    }, lookThrow_interval);
                }
            }
            if (soundId == 522) {//入水
                var tnow = new Date().getTime();
                if (Do.InRange(pnt = position, ref = mainHand_BobberPos, spacing = 0.5)) {
                    if (tnow > Player.mainHand_ThrowTime && tnow - Player.mainHand_ThrowTime <= afterthrow_timeout) {//浮标入水后会持续产生入水音效 设置超时以避免重复计入
                        console.log('main 522', soundId)
                        console.log(position.x, position.y, position.z)
                        this.log('[FishBot]Bobber in water');
                    }
                }
                else if (Do.InRange(pnt = position, ref = offHand_BobberPos, spacing = 0.5)) {
                    if (tnow > Player.offHand_ThrowTime && tnow - Player.offHand_ThrowTime <= afterthrow_timeout) {//浮标入水后会持续产生入水音效 设置超时以避免重复计入
                        console.log('off 522', soundId)
                        console.log(position.x, position.y, position.z)
                        this.log('[FishBot]Bobber in water');
                    }

                }

            }
            
        }); */
        this.bot.on('playerCollect', async (collector, collected) => {
            let meta = collected.metadata[8];
            this.log(meta, collected.entityType);
            if (Player.throwList.includes(meta.itemId)) {
                this.bot.toss(meta.itemId,meta,1)
            }
            //if(collected.name)
            //this.bot.tossStack(item)
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
            try {
                // Connection error
                if (err.code == 'ECONNREFUSED') {
                    this.log(`Failed to connect to ${err.address}:${err.port}`)
                }
                // Unhandled errors
                else {
                    this.log(`Unhandled error: ${err}`);
                }
            }
            catch {
            }
        });
    }
}

let bots = [];
bots.push(new MCBot('dozingmoon1'));
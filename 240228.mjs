import mineflayer from "mineflayer"
import chalk from "chalk"
import v from "vec3"

let botArgs = {
    name: 'dozingmoon',
    auth: '',
    host: '140.117.32.189',//'localhost',// 
    port: '25565',
    version: '1.17.1'
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

        this.posx = '';
        this.posy = '';
        this.posz = '';
        this.targetBlockName = "stone";

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
        });

        this.bot.on('spawn', async () => {
            this.log(chalk.ansi256(46)(`Spawned in`));
            this.posx = this.bot.blockAtCursor().position.x;
            this.posy = this.bot.blockAtCursor().position.y;
            this.posz = this.bot.blockAtCursor().position.z;

            setTimeout(() => {
                this.bot.dig(this.bot.blockAtCursor(), false);
            }, 2000)
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
        this.bot.on('diggingCompleted', async (block) => {
            this.log(`Done mining ${this.targetBlockName} at (${block.position.x}, ${block.position.y}, ${block.position.z})`);
        })

        this.bot.on("blockUpdate", async (oldBlock, newBlock) => {
            if (newBlock.position.x == this.posx &&
                newBlock.position.y == this.posy &&
                newBlock.position.z == this.posz &&
                newBlock.name == this.targetBlockName) {
                this.bot.dig(this.bot.blockAtCursor(), false);
            }
        });

    }
}

let Bot = null;
Bot = new MCBot(botArgs.name);
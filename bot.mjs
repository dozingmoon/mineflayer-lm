import mineflayer from "mineflayer"
import chalk from "chalk"

var AutoReconnect_Interval = 60 * 1000;
let firstLogin = true;

let botArgs = {
    auth: 'microsoft',
    host: 'mcledream.net',//'localhost',// 
    port: '25565',
    version: '1.20.4'
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
        console.log(//chalk.ansi256(242)(CurrentTime()),
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
        });

        this.bot.on('spawn', async () => {
            this.log(chalk.ansi256(46)(`Spawned in`));
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

                            this.bot.attack(mob, false);
                        }
                        catch {
                            return;
                        }

                        this.counter++

                        if (this.counter == MCBot.levelCounts) {
                            // this.bot.chat("\/jobs stats")
                            this.bot.chat("\/jobs limit")
                            this.bot.chat("\/bal")
                            this.counter = 1;
                        }
                    }
                }, 400)
            }, 3000);
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
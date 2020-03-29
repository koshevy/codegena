if (process.env.npm_execpath.indexOf('yarn') !== -1) {
    process.exit(0);
}

console.error(`
\x1b[31m
╔══════════════════════════════════════╗
║ ░ Please use Yarn, not NPM!          ║
║ ░                                    ║
║ ░ This project uses Yarn Workspaces, ║
║ ░ but NPM can't install dependencies ║
║ ░ of libraries in monorepository.    ║
║                                      ║
║ See: https://yarnpkg.com/            ║
╚══════════════════════════════════════╝
\x1b[0m
`);

process.exit(1);

# Chat Game Solver Mod (Fabric 1.21.1)

This mod automatically solves common chat games (Math, Fast Type, Anagrams) on Minecraft servers with a configurable delay to avoid anti-cheat detection.

## Features
- **Math Solver:** Solves simple math problems like `10 + 5`, `20 * 2`, etc.
- **Fast Type Solver:** Automatically types codes or words shown in chat.
- **Anagram Solver:** Unscrambles words (includes a basic dictionary).
- **Anti-Ban:** Configurable delay (default 5-10 seconds) to mimic human response time.
- **Mobile Friendly:** Works on mobile launchers like Mojo Launcher and PojavLauncher.

## Commands
- `/chatgame toggle` - Enable or disable the solver.
- `/chatgame status` - Check current settings.
- `/chatgame delay <min> <max>` - Set the response delay range in seconds (e.g., `/chatgame delay 5 10`).

## How to Install on Mobile (Mojo/Pojav Launcher)
1. Download the Fabric Loader for 1.21.1 in your launcher.
2. Build this mod using `./gradlew build` (or download the `.jar` if provided).
3. Place the `chatgame-1.0.0.jar` into the `mods` folder of your Minecraft directory:
   - Path: `/sdcard/Android/data/net.kdt.pojavlaunch/files/.minecraft/mods/` (for Pojav)
   - Or similar for Mojo Launcher.
4. Launch the game and enjoy!

## Building from Source
Run the following command in the `chat-game-mod` directory:
```bash
./gradlew build
```
The compiled jar will be in `build/libs/`.

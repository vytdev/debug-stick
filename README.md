<div align="center">

![icon](pack/pack_icon.png)

# Debug Stick

This add-on implements a debug stick based on Minecraft: Java Edition.

</div>

> [*Now available on MCPEDL!*](https://mcpedl.com/debug-stick/)

### Features

Similar to Java Edition, you can:

- Modify block properties
- Update property values
- View messages on the action bar
- Block viewer (as of 1.6.0, mc 1.20.60)

This add-on has been tested and functions correctly with Minecraft: Bedrock
Edition 1.20.0 and above.

## How to Obtain

- Download the add-on from the [releases section][releases] or directly [here][dl].
- Import the add-on into Minecraft.
- Activate it in your world.
- Enable Experimental Beta APIs and Holiday Creator Features.
- Open your world.
- Enter the following command in the chat:

    ```text
    /give @s vyt:debug_stick
    ```

Starting from version 1.2.0 (mc 1.20.30), the Holiday Creator Features
experimental toggle is no longer required.

### Limitations

- Some block properties from Minecraft Java Edition are not accessible.


## How to Build Add-On

1. Use npm to install dependent modules:

   ```powershell
   npm i
   ```

1. Use this shortcut command to open the project in Visual Studio Code:

   ```powershell
   code .
   ```

### Running the Add-On

Within the root folder (debug_tools) of this sample, run this command:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

Run this one to deploy in the game.

```powershell
npm run local-deploy
```

If you'd like to run deployment in a watch mode, run the following:

```powershell
npm run local-deploy -- --watch
```

Run this one to deploy in the editor mode.

```powershell
npm run local-deploy-editor
```

## Contribution

Feel free to contribute to the add-on.

## License

Copyright &copy; 2023-2025 Vincent Yanzee J. Tan. Licensed under the MIT License.

[releases]: https://github.com/vytdev/debug-stick/releases
[dl]: https://github.com/vytdev/debug-stick/releases/latest/download/debug-stick.mcpack

## Manifest

- [just.config.ts](https://github.com/microsoft/minecraft-samples/blob/main/debug_tools/just.config.ts): This file contains build instructions for just-scripts, for building out TypeScript code.
- [scripts](https://github.com/microsoft/minecraft-samples/blob/main/debug_tools/scripts): This contains Debug Tools TypeScript files, that will be compiled and built into your projects.
- [behavior_packs](https://github.com/microsoft/minecraft-samples/blob/main/debug_tools/behavior_packs): This contains resources and JSON files that define your behavior pack.
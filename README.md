> [!NOTE]
> We will be updating our version naming convention in upcoming releases.
> Please read [this section](#-version-naming) for more details.

<div align="center">

![icon][img-logo]

# Debug Stick

This add-on is a port of the infamous Debug Stick item that was
exclusive to Minecraft: Java Edition.

[**MCPEDL**][mcpedl] &middot; [**CurseForge**][curseforge]

</div>

> [*Now on CurseForge!*][curseforge]

Ever wish Bedrock had Java's debug stick? Yeah, me too &mdash; so I made one.

This add-on lets you mess with the "block properties" in-game, just like the
Java-exclusive debug stick item. Tap blocks to change their states. Long-press
to choose what you wanna change. Sneak and tap to get detailed info.

## ✨ What Can You Do?

- **Tap blocks** to cycle through their states (e.g., waterlog chests, lit
  or unlit furnaces, make ladders stick on air, etc.)
- **Long-press** to choose what you wanna change (e.g., direction of the
  block, type of wood, etc.)
- **Sneak + tap** to show detailed info about a block (more on that below!)
- **Actionbar messages** help you figure out what you're changing!

## 🔍 Block Viewer (Bonus Feature!)

![Block Viewer Image][img-blk-viewer]

This is a Bedrock-only thing I've added! Just sneak and tap a block to get all
kinds of info you may need:

- **Block ID** (i.e., `minecraft:log`)
- **Location** (`0 1 2`)
- **Matter state** (solid, liquid, gas)
- **Redstone power** (amount of redstone, 0-15)
- **Hard block** (passable by arrows?)
- **Property states** (`pillar_axis`, `waterlogged`, etc.)
- **Tags** (`#wood`, `#log`, etc.)

Very useful for mapmakers, redstoners, or just curious players!

> [!NOTE]
> This feature requires Minecraft Bedrock 1.20.60 or higher

## 🎁 How To Get It?

1. [Download the add-on][releases] for your Minecraft version.
2. Import the add-on to Minecraft.
3. Activate it in your world.
4. If your Minecraft version is *lower than 1.20.30*, enable
   `Holiday Creator Features` experiment.
5. If your Minecraft version is *lower than 1.21.70*, enable
   `Beta APIs` experiment.
6. Load up your world!
7. Type `/give @s vyt:debug_stick`, or find it in the Creative menu.
8. That's it!

## 🧱 Version Compatibility

This add-on supports Minecraft Bedrock **1.20.0 and above**.

- "Block Viewer" requires MCBE >=1.20.60
- Enable `Holiday Creator Features` for MCBE <1.20.30
- Enable `Beta APIs` for MCBE <1.21.70

Make sure you download the version that matches your Minecraft version.

## 📎 Version Naming

We've matched our add-on version numbers with Minecraft Bedrock since 26.0.

- **1st &amp; 2nd numbesr**: The Minecraft version the add-on works with. If
  your game is older, it might not work.
- **3rd number**: The add-on's patch number. It doesn't have to match your
  Minecraft version &mdash; only the first two numbers matter.

Have an older Minecraft version (1.20.0 &ndash; 1.21.132)? Check our
[old releases][dload], which use use the old version style starting with
*1.x.x*.

This new version system makes it easier to find the correct version.

*We don't strictly follow [SemVer](https://semver.org).*

## 🎉 Support

**If this helped you out, consider supporting me on Ko-fi**! Every bit helps
me stay in school and keep the add-on updated! ❤️

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/W7W51I5VSO)

## 📜 License

This add-on is open-source! This means its source code is available to the
public. You can find the source code here:
https://github.com/vytdev/debug-stick

Copyright &copy; 2023-2026 Vincent Yanzee J. Tan.
Licensed under the MIT License.


<!-- long links -->

[mcpedl]: https://mcpedl.com/debug-stick
[curseforge]: https://www.curseforge.com/minecraft-bedrock/addons/debug-stick
[releases]: https://github.com/vytdev/debug-stick/releases
[dload]: https://www.curseforge.com/minecraft-bedrock/addons/debug-stick/files

[img-logo]: https://raw.github.com/vytdev/debug-stick/master/pack/pack_icon.png
[img-blk-viewer]: https://raw.github.com/vytdev/debug-stick/master/doc/img1.jpeg

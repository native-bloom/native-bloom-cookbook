<p align="center">
  <a href="https://nativebloom.dev"><img src="https://nativebloom.dev/android-chrome-512x512.png" width="88" alt="Native Bloom" /></a>
</p>

<p align="center">
  <b>A Native Bloom Cookbook recipe</b><br />
  <a href="https://nativebloom.dev">Native Bloom</a> is a handpicked catalog of React Native UI blocks from real builders.<br />
  Preview every block on video, find it in seconds, and plug the catalog into your agent over <a href="https://nativebloom.dev/mcp">MCP</a>.
</p>

# Agent Crew

**An onboarding where your AI agents are alive.** Pick three, and they get to work. The rest take a nap.

Two blocks from Native Bloom, one MCP connection, a handful of prompts.

<!-- clip: upload agent-crew.mp4 via GitHub and paste the user-attachments URL here -->

## The idea

Two blocks on Native Bloom kept pulling me back.

[Arunabh Verma's onboarding](https://nativebloom.dev/blocks?slug=onboarding-circular-avatars) deals a stack of avatars into a ring that never stops turning. [Jakub Antalik's 3D bots](https://nativebloom.dev/blocks?slug=animated-3d-bot-avatars-grid) blink, follow your finger and hop when you poke them.

The ring is full of strangers. The bots are characters. So what if the ring were your crew of AI agents, and onboarding were choosing who to build with?

## Ingredients

| Block | By | What it brings |
| --- | --- | --- |
| [Onboarding circular avatars](https://nativebloom.dev/blocks?slug=onboarding-circular-avatars) | Arunabh Verma | The deal into a ring, the endless spin |
| [Animated 3D bot avatars grid](https://nativebloom.dev/blocks?slug=animated-3d-bot-avatars-grid) | Jakub Antalik | 18 Skia-shaded bots with faces, three moods, a hop on tap |

## How it was made

### 1. Find the blocks

[Connect the Native Bloom MCP](https://nativebloom.dev/mcp) to your agent, then describe what you're after:

> Find an onboarding with rotating circular avatars, and animated 3D bot avatars

Your agent runs one `search_blocks` per need, and both blocks come back on top:

| Query | #1 result |
| --- | --- |
| onboarding with rotating circular avatars | Onboarding circular avatars |
| animated 3D bot avatars | Animated 3D bot avatars grid |

Rather browse? Search [nativebloom.dev](https://nativebloom.dev/blocks?blockq=circular), watch the clips and copy the links of the blocks you like. The next step works the same either way.

### 2. Pull the context

> Get these two blocks: https://nativebloom.dev/blocks?slug=onboarding-circular-avatars https://nativebloom.dev/blocks?slug=animated-3d-bot-avatars-grid

`get_block` hands your agent each block's author, components, animations and **links to the real source**. The agent reads the actual code instead of guessing from memory, which is the difference between "something like it" and the thing you saw in the clip.

### 3. Cook

```bash
npx create-expo-app@latest agent-crew
cd agent-crew && npm run reset-project
```

> Rebuild the onboarding circular avatars in this app with the 3D bots in place of the avatar photos. Port the bot code from its source.

That's the base: bots dealt into a slowly spinning ring, each one counter-rotating to stay upright.

### 4. The personal touch

This is where it stops being a copy.

> Turn it into an agent crew picker. Give every bot a job. Tap to pick three: the bot hops, glows in its own colour, and its name and job show in the middle of the ring. The others glance at the one you picked. While you drag, the whole ring watches your finger.

> Add a "Start building" button. The three you picked switch to working and spin with a whirl. The rest fall asleep.

> Make the footer feel balanced.

| Bot | Job |
| --- | --- |
| Clover | Writes your tests |
| Droid | Ships the builds |
| Star | Polishes the UI |
| Ghost | Hunts bugs at night |
| Cat | Reviews your PRs |
| Cloud | Deploys on Fridays |
| Hexagon | Wires up the API |
| Flower | Animates everything |

## Run it

```bash
npx degit nativebloom/cookbook/recipes/agent-crew agent-crew
cd agent-crew && npm install && npx expo start
```

It runs in Expo Go (SDK 58). No dev build needed.

## Your turn

Pick two blocks on [nativebloom.dev](https://nativebloom.dev) that have no business being together, connect the MCP, and hand your agent the links. The blocks get you 80% of the way in minutes. You get to spend your time on the 20% that makes it yours.

## Credits

- Circular onboarding animation by [Arunabh Verma](https://x.com/iamarunabh) ([source](https://github.com/arunabhverma/expo-circular-animation))
- Bot avatars by [Jakub Antalik](https://github.com/Jakubantalik) ([source](https://github.com/Jakubantalik/Libraries.dev/tree/main/packages/bot-avatars), MIT)

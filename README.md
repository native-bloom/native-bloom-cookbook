<p align="center">
  <a href="https://nativebloom.dev"><img src="https://nativebloom.dev/android-chrome-512x512.png" width="96" alt="Native Bloom" /></a>
</p>

<h1 align="center">Native Bloom Cookbook</h1>

<p align="center">
  Expo apps built from <a href="https://nativebloom.dev">Native Bloom</a> blocks, a few prompts and a personal touch.<br />
  Every recipe shows how the <a href="https://nativebloom.dev/mcp">Native Bloom MCP</a> found the blocks and handed their real source to the agent.
</p>

## Recipes

| Recipe | What it is | Built from | Runs in |
| --- | --- | --- | --- |
| [Agent Crew](recipes/agent-crew) | An onboarding where your AI agents are alive. Pick three, and they get to work. | Onboarding circular avatars · Animated 3D bot avatars grid | Expo Go |
| [Globe Trotter](recipes/globe-trotter) | Pick how you travel by spinning a tiny planet. | Choose your Poké ball | Development build |

## Cook one yourself

Grab a single recipe, no need to clone the whole repo:

```bash
npx degit native-bloom/native-bloom-cookbook/recipes/agent-crew agent-crew
cd agent-crew && npm install && npx expo start
```

Each recipe is a standalone Expo app with its own SDK version. Its README tells the story: the idea, the blocks it started from, every prompt, and what made it more than a copy.

## Make your own

[Connect the Native Bloom MCP](https://nativebloom.dev/mcp) to your agent, pick a block or two on [nativebloom.dev](https://nativebloom.dev), and ask your agent to build on them. The blocks get you most of the way. The rest is yours.

## License

The code in this repository is MIT licensed. Code ported from Native Bloom blocks and the 3D models keep their own licenses, credited in each recipe's README.

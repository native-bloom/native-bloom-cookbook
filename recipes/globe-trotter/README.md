<p align="center">
  <a href="https://nativebloom.dev"><img src="https://nativebloom.dev/android-chrome-512x512.png" width="88" alt="Native Bloom" /></a>
</p>

<p align="center">
  <b>A Native Bloom Cookbook recipe</b><br />
  <a href="https://nativebloom.dev">Native Bloom</a> is a handpicked catalog of React Native UI blocks from real builders.<br />
  Preview every block on video, find it in seconds, and plug the catalog into your agent over <a href="https://nativebloom.dev/mcp">MCP</a>.
</p>

# Globe Trotter

**Pick how you travel by spinning a tiny planet.** Swipe, and the globe rolls your jeep over the horizon while a boat sails up to take its place.

One block from Native Bloom, one MCP connection, a handful of prompts.

<!-- clip: upload globe-trotter.mp4 via GitHub and paste the user-attachments URL here -->

## The idea

One block on Native Bloom wouldn't leave my head.

[Trần Đình Huy's Poké ball picker](https://nativebloom.dev/blocks?slug=choose-you-pok-ball) renders a glossy 3D ball with Filament, and every swipe turns it a full circle while the next ball takes its place. The big word above it morphs letter by letter, and the whole background shifts colour.

A ball that turns when you swipe is basically a planet. So what if the planet were the picker, and every swipe were a different way to get from Lisbon to Porto?

## Ingredients

| Block | By | What it brings |
| --- | --- | --- |
| [Choose your Poké ball](https://nativebloom.dev/blocks?slug=choose-you-pok-ball) | Trần Đình Huy | The swipe, the 3D turn, the morphing word, the colour backdrop |

Plus four free vehicles from [Poly Pizza](https://poly.pizza) and public-domain map data from [Natural Earth](https://www.naturalearthdata.com).

## How it was made

### 1. Find the block

[Connect the Native Bloom MCP](https://nativebloom.dev/mcp) to your agent, then describe what you're after:

> Find a 3D carousel built with Filament

`search_blocks` brings it straight back:

| Query | #1 result |
| --- | --- |
| 3D carousel built with Filament | Choose your Poké ball |

Rather browse? Open the [Filament blocks on nativebloom.dev](https://nativebloom.dev/blocks?category=animations&animation=filament), watch the clips and copy the link of the one you like. The next step works the same either way.

### 2. Pull the context

> Get this block: https://nativebloom.dev/blocks?slug=choose-you-pok-ball

`get_block` hands your agent the block's author, components, animations and **links to the real source**. The agent reads the actual code instead of guessing from memory, which is the difference between "something like it" and the thing you saw in the clip.

### 3. Cook

```bash
npx create-expo-app@latest globe-trotter --template default@sdk-57
cd globe-trotter && npm run reset-project
```

SDK 57, because Filament doesn't build on SDK 58 yet.

> Rebuild the Choose your Poké ball carousel in this app. Keep the swipe, the 3D turn, the morphing word and the colour backdrop.

That's the base: a glossy 3D object you swipe through, with the word and the colours following along.

### 4. The personal touch

This is where it stops being a copy.

> Turn it into a travel picker for a trip from Lisbon to Porto: drive, sail, fly or ride. Put a jeep, a sailboat, a plane and a bike on a globe instead of the ball. Each swipe turns the globe a quarter, so the next vehicle comes over the top. Use free models from Poly Pizza.

> Make the globe a cute 3D cartoon Earth: vibrant pastel colors, glossy plastic texture, chunky proportions, soft studio lighting, Pixar style. Build it yourself from public-domain map data.

> The footer carousel flickers at the start and end of the list.

> Keep the plane closer to the Earth when it's not on top, it goes off screen.

> The globe is clipped at the bottom.

| Word | Vehicle | Facts |
| --- | --- | --- |
| DRIVE | Jeep | 3H 10M · €42 · SCENIC ROUTE |
| SAIL | Sailboat | 9H · €65 · SLOW & SALTY |
| FLY | Plane | 55M · €89 · WINDOW SEAT |
| RIDE | Bike | 2 DAYS · €0 · LEGS OF STEEL |

## Run it

```bash
npx degit native-bloom/native-bloom-cookbook/recipes/globe-trotter globe-trotter
cd globe-trotter && npm install && npx expo run:ios
```

Filament has native code, so this one needs a development build (Xcode on a Mac). It won't run in Expo Go.

## Your turn

Pick a block on [nativebloom.dev](https://nativebloom.dev) and ask yourself what else it could be. A ball became a planet here. The block gets you 80% of the way in minutes. You get to spend your time on the 20% that makes it yours.

## Credits

- Poké ball carousel by [Trần Đình Huy](https://x.com/TrninhHuy1) ([source](https://github.com/huytdps13400/choose-your-ball), MIT)
- [Jeep](https://poly.pizza/m/4gOfX6DR4yG) by [Alex Safayan](https://poly.pizza/u/Alex%20Safayan), [Sailboat](https://poly.pizza/m/5u49Hzbo5WH) by [jeremy](https://poly.pizza/u/jeremy), [Airplane](https://poly.pizza/m/8ciDd9k8wha) and [Bicycle](https://poly.pizza/m/19VoUuA2pcN) by [Poly by Google](https://poly.pizza/u/Poly%20by%20Google), all [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/)
- Land outlines from [Natural Earth](https://www.naturalearthdata.com) (public domain)

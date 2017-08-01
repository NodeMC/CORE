<p align="center"><img src="https://avatars0.githubusercontent.com/u/17482389?v=3&s=150" /></p>

<p align="center">
  <a href="http://nodemc.space:8080/job/NodeMC/"><img src="https://img.shields.io/badge/build-broken-red.svg" alt="Build Status" /></a>
  <a href="https://nodemc.space/slack"><img src="https://img.shields.io/badge/slack-community-brightgreen.svg" alt="Slack" /></a>
  <a href="https://discord.gg/PnHveq7"><img src="https://img.shields.io/badge/support-discord-7289DA.svg?logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACUAAAAcCAYAAADm63ZmAAAABGdBTUEAALGPC%2FxhBQAAAAlwSFlzAAALEAAACxABrSO9dQAAABl0RVh0U29mdHdhcmUAcGFpbnQubmV0IDQuMC4xMK0KCsAAAARRSURBVFhH7ZddSKRVGMedVRfbHXdLMopCoqwNL5S1zHGpVjZcKbNy2yBGIbEuMrrQiyAIIWIpaVtwly4UlCXFlvAmKNjBpG3Npotl90JnxRzUcdT1i%2FEDFT%2FGj37PO49O47wz6rbrVT%2F4c857nv8553nf95zzzsT8z%2F1gY2MjYX19PRsVU0%2FRZlOIH0WleE9JXZvvDQx4gIEL0U%2FIg75BxyVGeRg9g7LQyygHpdHnQRRP%2FTX0A1pA7ehD9IAx8N3CAKdQJxpE5SsrK6enp6cvLCwsOFdXVyeYOCL4J%2Bbm5q6NjY2dm5mZeZ3r80iSu4M%2BwGLRaXYPHb9EfnRlamrq8tLSki8w3d1Bgp7x8fEGbqZDrhn3KsUBnW5nMD8pCfFkvAyyKoPcKxhz3u%2F3z0qdOd7RKXcGc40xwn2Gef7SKaOD99Da2ppxJ%2FsBiRmbJiqY7OrfF5jvok4dGZbQL%2BrfF5hvjCLygifrREzLAfu%2B8pKmEA5JvaWmiLBzVtje4yS%2Fpk2mSFx8%2BP3aFBHm%2FVpTCIft%2Bp36THG73e3p6envYS3My8t73%2Bv13tRQCKOjo678%2FPxS8WVmZtoHBgacGjJleXn5ppGAGYuLi53qC0PuOikpqchisRSgV9Ebqamp79JnRi0G3NhSTk5OicTVV5CSknKWr8CUWsLgqcohHf75IZZAMOJB2dXV5WCC57HGi596AsoeGhoKeVojIyOdtJ%2BQuPriUVZPT89vajGFpE6IPwQaMzRuCq%2FuKrbtuyTO5%2FP9rRYDPiUukjio8U1i%2B%2Fv7oybFE%2F5IvUFoPKtxU3jvPhI%2FonYDmp%2FjoA1Z8PIqKJ5SiwHXDzF%2B1AOZj%2FYltQfhjj%2FTeDR%2BJ7FjlPJzxoZCntImtN9GWVRjKdPQH4FIZPjo%2F6ypBOGxX9L4jjBJ1ONgk936BH4SOTWVIPzu%2BV7jW8hZMzw8fEtKbfrP8Jq88%2FPzk3q5Be23NZUgHo%2BnQeMhzM7O3qmtrT3X3d39q2x3bd4zk5OT7paWlosul8uhTSGwfG5pKkFyc3NtBPrUEwKLfNHhcDTI%2BdPU1PRtb2%2Fvdc6dsLv9Nxzkq4zndjqdP5aXl39SVVX1qVxrOAQ56yoqKoo1lSBs4zQ5rQcHB2%2BoNwzpXF9fX429UGSz2Yplsrq6uq%2Bam5svSMI1NTVfSBLJyclnxFNWVvbxxMSE6YYQWOCekpISOQ7CzymSikMnY2Nj32xsbDzPwvNqvy1YW66ioqJn8WWiPLoZyZmJeAHlK4mJiWn8lA775cGT9rW2tjboVyIfrxWZIqfvi5SFklxlZWVFW1vbZU7ja%2FKds9vtpcQfC1gNDnKdhB5FT6DH0SPoCDIOWkprRkbG6b6%2Bvj957e0dHR1XqqurP7darW8TluRPosPijQomGTyX6va7l7Y4tBfoZsmi3D5WHnqa%2Bu7%2FPAh0OopS0XGUTdOhQGRv0FeWxgtIXvsx9LA0B6LbiYn5ByPwLbzmp0e3AAAAAElFTkSuQmCC" alt="Discord" /></a>
  <img src="https://img.shields.io/badge/license-GPL3-brightgreen.svg" alt="License" />
</p>

<p align="center">NodeMC is a Minecraft hosting solution, and API provider, written in Node.js and powered by open-source software</p>


## Helpful Links

[Official Documentation](https://nodemc.space/docs)

[Official Website](https://nodemc.space)

[Discord Support Server](https://discord.gg/PnHveq7)

## Requirements

- [Docker](https://docker.io)

- **docker-compose** (usually included with Docker)


## Running

Running NodeMC is easy.

**DO NOT RUN `npm install`, INSTEAD REBUILD CONTAINER.**

`docker-compose build` is your friend.

```bash
git clone https://github.com/NodeMC/CORE.git NodeMC

cd NodeMC

cp config/config.example.js config/config.js

docker-compose up

```

Then navigate to `http://localhost:3000` and go through the setup process.

## Maintainers

| [![Jared Allard](https://avatars.githubusercontent.com/u/2391349?s=130)](https://jaredallard.me/) | [![Mathew Da Costa](https://avatars3.githubusercontent.com/u/1917406?v=4&s=130)](https://github.com/md678685) |
|---|---|
|[Jared Allard](https://github.com/jaredallard) | [Mathew Da Costa](https://github.com/md678685) |


Contributions from other developers are welcome, check out [CONTRIBUTING.md](https://github.com/nodemc/CORE/tree/master/.github/CONTRIBUTING.md) before you submit a pull request.

## Credits

Various OSS modules are used in this project, please check `package.json` for the extended list of them.

## License

MIT

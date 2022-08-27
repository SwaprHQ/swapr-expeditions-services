# Swapr Expedition  Services

Provides a set of APIs for Swapr.eth dapp.

# Deploy

Dockerize the app by running

```bash
npm run dockerize
```

or

```bash
sh ./docker/build.sh
```

Create `.env` file

```shell
MONGO_URI=mongodb://swapr:swapr@localhost
```

Now run the image `swapr-expeditions-services`

```shell
docker run -d \
-p 3000:3000 \
--env-file ./.env \
swapr-expeditions-services
```

# Docs

`http:{baseUrl}/documentation`

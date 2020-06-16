
<p align="center"><img src="https://raw.githubusercontent.com/alfallouji/LIVE-CODING/master/episodes/assets/cestlavie.jpg" /></p>

# LIVE CODING
Github Repository pour les scéances de live coding par Seb & Bashar

## Twitch
Les épisodes sont streamés en live chaque Jeudi (à partir de 18h00 - GMT+1) et disponibles sur :
https://www.twitch.tv/sebaws

## Code 

L'application guestbook (nodejs) est disponible dans le répertoire [guestbook-app/](https://github.com/alfallouji/LIVE-CODING/tree/master/guestbook-app)

Le code de déploiement des resources (via CDK) est disponible dans le répertoire [guestbook-cdk/](https://github.com/alfallouji/LIVE-CODING/tree/master/guestbook-cdk)

Les descriptions des différents épisodes sont disponibles dans le répertoire [episodes/](https://github.com/alfallouji/LIVE-CODING/tree/master/episodes)

### Comment deployer la solution?

Nous utilisons [AWS Cloud Development Kit](https://aws.amazon.com/cdk/) pour automatiser le déploiement. Voici les étapes que vous pouvez suivre pour rapidement déployer la solution : 

1. Avoir un environnement pour déployer le code (vous pouvez utilisez cloud9 ou votre laptop). Nodejs est nécessaire.

2. Cloner le code 

`git clone https://github.com/alfallouji/LIVE-CODING.git`

`cd guestbook-cdk`

3. Copier et configurer le fichier de config pour prod et dev

`copy conf/config.json.sample conf/config.dev.json`
`copy conf/config.json.sample conf/config.production.json`

4. Bootstrap cdk (ca va créer un bucket S3 pour stocker certains assets si besoin)

`cdk bootstrap aws://01234567890/eu-central-1 -c env=dev`

5. Déployer la solution au complet

`cdk deploy guestbook* -c env=dev`


## Episodes 

### S01E01 - Le début d'une aventure

<p align="center" style="background-color:black; padding: 10px;">
  <img witdh="80" height="80" src="https://raw.githubusercontent.com/alfallouji/LIVE-CODING/master/episodes/assets/s01e01-a.png" />
  <img witdh="80" height="80" src="https://raw.githubusercontent.com/alfallouji/LIVE-CODING/master/episodes/assets/s01e01-b.png" />
  <img witdh="80" height="80" src="https://raw.githubusercontent.com/alfallouji/LIVE-CODING/master/episodes/assets/s01e01-c.png" />
  <img witdh="80" height="80" src="https://raw.githubusercontent.com/alfallouji/LIVE-CODING/master/episodes/assets/s01e01-d.png" />
</p>

***Chaque histoire a un début, au menu pour cet épisode : un message mystérieux, un nouveau workload à déployer et peu de temps.***

Jeudi 7 Mai 2020 - 18:00 GMT+1 

Durée: 71 minutes

Video: [Twitch](https://www.twitch.tv/videos/613997283) - [Youtube](https://www.youtube.com/watch?v=ZCRdFMfdCG0)

Récapitulatif: https://github.com/alfallouji/LIVE-CODING/blob/master/episodes/s01E01.md

### S01E02 - Une question de réseau

<p align="center">
  <img witdh="80" height="80" src="https://raw.githubusercontent.com/alfallouji/LIVE-CODING/master/episodes/assets/s01e02-a.png" />
  <img witdh="80" height="80" src="https://raw.githubusercontent.com/alfallouji/LIVE-CODING/master/episodes/assets/s01e02-b.png" />
  <img witdh="80" height="80" src="https://raw.githubusercontent.com/alfallouji/LIVE-CODING/master/episodes/assets/s01e02-c.png" />
  <img witdh="80" height="80" src="https://raw.githubusercontent.com/alfallouji/LIVE-CODING/master/episodes/assets/s01e02-d.png" /></p>

***"La voix" est contente de notre prestation précédente, mais nous invite à penser au futur et revoir les fondations au niveau réseau. Il est temps de concevoir une topologie réseau et d'automatiser le déploiement du nouveau VPC.***

Jeudi 14 Mai 2020 - 18:00 GMT+1

Durée: 68 minutes

Video: [Twitch](https://www.twitch.tv/videos/620885990) - [Youtube](https://www.youtube.com/watch?v=nM-0FbGKfLw)

Récapitulatif: https://github.com/alfallouji/LIVE-CODING/blob/master/episodes/s01E02.md


### S01E03 - Diviser pour mieux régner

<p align="center">
  <img witdh="80" height="80" src="https://raw.githubusercontent.com/alfallouji/LIVE-CODING/master/episodes/assets/s01e03-a.png" />
  <img witdh="80" height="80" src="https://raw.githubusercontent.com/alfallouji/LIVE-CODING/master/episodes/assets/s01e03-b.png" />
  <img witdh="80" height="80" src="https://raw.githubusercontent.com/alfallouji/LIVE-CODING/master/episodes/assets/s01e03-c.png" />
  <img witdh="80" height="80" src="https://raw.githubusercontent.com/alfallouji/LIVE-CODING/master/episodes/assets/s01e03-d.png" /></p>
  
***"La voix" nous demande de casser le monolithe, la première étape consiste à sortir la base de données.***

Jeudi 28 Mai 2020 - 18:00 GMT+1

https://www.twitch.tv/sebaws

Durée : 63 minutes

Video : [Twitch](https://www.twitch.tv/videos/634488159)

Récapitulatif: https://github.com/alfallouji/LIVE-CODING/blob/master/episodes/s01E03.md


### S01E04 - RDS fait connaissance avec CDK - Part 1

<p align="center">
  <img witdh="80" height="80" src="https://raw.githubusercontent.com/alfallouji/LIVE-CODING/master/episodes/assets/s01e04-a.png" />
  <img witdh="80" height="80" src="https://raw.githubusercontent.com/alfallouji/LIVE-CODING/master/episodes/assets/s01e04-b.png" />
  <img witdh="80" height="80" src="https://raw.githubusercontent.com/alfallouji/LIVE-CODING/master/episodes/assets/s01e04-c.png" />
  <img witdh="80" height="80" src="https://raw.githubusercontent.com/alfallouji/LIVE-CODING/master/episodes/assets/s01e04-d.png" /></p>
  
  
***"La voix" aimerait que l'on automatise le déploiement de la base de données***

Jeudi 4 Juin 2020 - 18:00 GMT+1

Durée : 62 minutes

Video : [Twitch](https://www.twitch.tv/videos/647898443)

Récapitulatif: https://github.com/alfallouji/LIVE-CODING/blob/master/episodes/s01E04.md


### S01E05 - RDS fait connaissance avec CDK - Part 2

***Suite et fin de l'épisode précédent***

<p align="center">
  <img witdh="80" height="80" src="https://raw.githubusercontent.com/alfallouji/LIVE-CODING/master/episodes/assets/s01e05-a.png" />
  <img witdh="80" height="80" src="https://raw.githubusercontent.com/alfallouji/LIVE-CODING/master/episodes/assets/s01e05-b.png" />
  <img witdh="80" height="80" src="https://raw.githubusercontent.com/alfallouji/LIVE-CODING/master/episodes/assets/s01e05-c.png" />
  <img witdh="80" height="80" src="https://raw.githubusercontent.com/alfallouji/LIVE-CODING/master/episodes/assets/s01e05-d.png" /></p>
  
  
Suite et fin de l'épisode 

Jeudi 11 Juin 2020 - 18:00 GMT+1

Durée : 60 minutes

Video : [Twitch](https://www.twitch.tv/videos/641191131)

Récapitulatif: https://github.com/alfallouji/LIVE-CODING/blob/master/episodes/s01E05.md


### A venir - Jeudi 18 Juin 2020: S01E06 - Automatisons Automatisons

Jeudi 18 Juin 2020 - 18:00 GMT+1

Video : [Live sur Twitch](https://www.twitch.tv/sebaws)



# Projet AiTunes


## Dossiers

 - Générés automatiquement: ``.next``, ``dist`` (mode production), ``node_modules`` (packages NodeJS), ``private`` (Secrets, base de données sqlite)
 - ``tests``: Tests unitaires de features (Il n'y en a pas beaucoup pour le moment, pas vraiment utiles pour la présentation du projet en tout cas)
 - ``styles``: Fiches de styles globales au projet. 
 - ``src``: Source du serveur back-end et initialisation de NextJS (frontend)
 - ``public``: Fichiers servis automatiquement par NextJS sur le site (Images, fonts, ...). Exemple: http://127.0.0.1:8000/images/Logo_Big.png pour accéder au fichier /public/images/Logo_Big.png
 - ``pages``: Pages servies par NextJS (syntaxe TSX)
 - ``components``: Composants utilisables dans les pages (syntaxe TSX)


## Backend

### Accès à une page quelconque par utilisateur

Des middlewares basiques sont appliqués à la requête avant d'être traitée par l'application (Support des formats JSON, vérification que les bodies sont URL-encoded, ...).

Ensuite, la requête passe par ``src/server/session/session_pipeline.ts``. 

#### Session pipeline
##### Middleware #1:
 - Si la requête ne contient pas de cookie de session ou que celui-ci a expiré (durée de vie définie dans ``src\server\session\session_secret.ts`` @ ``sessionCookieLifetime``), un nouveau est généré et stocké dans la base de donnée (grâce au paramètre ``store: new CustomSessionStore()``). Cet identifiant de session est toujours non null et accessible dans les middlewares qui suivent grâce à ``req.sessionID``

##### Middleware #2
 - L'utilisateur associé à la session ``sessionID`` est entré dans la variable ``req.user``. Cette valeur peut soit être une instance de UserIdentifier, soit être undefined si l'utilisateur n'est pas connecté. **Il faut absolument prévoir les deux cas dans tous les middlewares.** Comme défini dans ``src\server\@types\kapoot-types.d.ts``, un UserIdentifier contient au moins un des champs suivants: ``username``, ``identifier`` ou/et ``mail``. Idéalement les trois seront toujours spécifiés.

 ##### Middlewares à ajouter
 Puisque toutes les requêtes passent par ici avant tout autre traitement, on pourra par exemple y rajouter plus tard un rate-limit.


#### Accès à la page


##### Page BackEnd
Si la page demandée est un accès API (``/api/*``), alors la requête passe par le router associé (défini dans ``src\server\routes\api_routes.ts``). **TODO: Rajouter un fallback après toutes les autres routes dans ce fichier pour indiquer une erreur 404 (e.g. ``res.status(404).json({ 'error': 'Endpoint Not Found' })``)**

Actuellement, seules des routes concernant les comptes (``/api/account/*``) ont été faites:

<br>

###### GET /api/account
Récupère sous format JSON les données associées au compte connecté (ou erreur 404 si l'utilisateur n'est pas connecté, i.e. ``req.user === undefined``).

> **Note**
> Aucune donnée réelle n'est retournée actuellement (voir ``src\server\database\endpoints\database_endpoints.ts`` @ ``accountDetails()``). Il faudra créer une table séparée et stocker des statistiques (Avatar, Nb. Quizz, ...) pour les retourner ici en plus de l'username et email

<br>

###### POST /api/account
Essaye de créer un compte avec les valeurs passées dans la requête (username, email, mot de passe). Les checks nécessaires sont réalisés (l'utilisateur n'est pas connecté, les identifiants ne sont pas déjà utilisés, etc.). Si tout est OK, le compte est créé et la session (``req.sessionID``) est liée au compte.

> **Note**
> Le hachage est fait avec bcrypt (voir ``src\server\utils\security.ts``) qui récupère une chaine de charactère, y applique un ``salt`` pour rendre le hash unique (Ainsi deux mots de passes identiques n'auront pas le même hash), et applique plusieurs opérations de hachage à sens unique (10 rounds). Le ``salt`` est ensuite ajouté à la fin du hash pour être réutilisé lors de la vérification du mot de passe.

<br>

###### POST /api/account/logout

Déconnecte l'utilisateur en supprimant de la table ``userSessions`` et ``allSessions`` toutes les entrées associées à l'ID de l'utilisateur (grâce au paramètre de création de table ``ON DELETE CASCADE``).

<br>

###### POST /api/account/login

Essaye de lier la session (``req.sessionID``) à l'utilisateur associé aux logins fournis dans le body de la requête (``login`` qui peut être l'username ou l'email, et le ``password``). Les checks nécessaires sont réalisés (l'utilisateur n'est pas connecté, les identifiants sont valides).


**TODO: Les prochaines API à ajouter seront la création, la modification et la suppression de quizz (de même pour les questions). Il faudrait d'abord commencer par une structure de table SQL (e.g. une table de quizz avec un identifiant unique et des paramètres, et une table de questions ou chaque entrée contient l'id du quizz, l'id de la question, et la question en format JSON).** 

##### Page FrontEnd

Les pages et composants NextJS/React front end sont compilés en javascript exécutable par le navigateur de l'utilisateur. Les routes vers les pages sont automatiquement servies par NextJS (`server.all('*', (req, res) => handler(req, res));`)

La fonction ``const [ maVariable, monSetter ] = useState(value)`` de React crée une variable ``maVariable`` initialisée avec la valeur ``value`` et s'occupe d'automatiquement changer le contenu de la page lorsque la fonction ``monSetter`` est appelée.

La fonction ``useEffect(callback)`` de React exécute un code côté client pendant/après le chargement de la page pour ne pas avoir besoin d'attendre des réponses du serveur et offrir une expérience plus réactive globalement. 
> Exemple: lorsque la page d'accueil est affichée, on voit pendant un bref instant la barre de navigation comme si l'utilisateur n'est pas connecté, puis cet affichage change quand le serveur répond que l'utilisateur est bel et bien connecté.

###### Index.tsx (/index)

Par défaut la page d'accueil est affichée avec un composant NavBar. Le ``useEffect`` prévoit un fetch de ``GET /api/account`` pour voir si l'utilisateur est connecté. Si c'est le cas, le composant NavBarSignedIn prend la place de NavBarSignedOut.


**TODO: Ajouter un prompt de confirmation avant de logout (En faire un composant, probablement). Je sais pas comment faire, peut être avec un ``useState``**

**TODO: Du joli css**

**TODO plus tard: Vérifier si le cookie de session est associé à une game en cours et si c'est le cas, le reconnecter en ouvrant la bonne page**

###### Login.tsx (/login)

Le ``useRouter`` de React permet notamment de récupérer les paramètres inscrits dans l'url. (e.g. GET https://localhost:8000/login?page=register => le paramètre page est récupérable avec ``const { page } = router.query;``).

Si la page demandée est ``=== "register"``, on affiche le form pour créer un compte. Sinon celui pour se connecter. 

###### Account.tsx (/account)

**TODO: Page de compte, affichage des stats (quand elles seront implémentées), avatar, quizz créés et stockés sur le serveur...**

###### Editor.tsx (/editor)

**TODO: Chargement d'un quizz depuis le résultat d'une requête d'API, puis mise à jour à chaque actions (ajout d'une question, modification d'une property, ...)**

###### Page 404

**TODO, certainement la page _error.tsx, mais à vérifier**

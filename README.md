# SubMate

SubMate est une application permettant de gérer et d’optimiser ses abonnements et dépenses récurrentes.

## Fonctionnalités principales

- **Gestion des abonnements** : Ajout, modification, suppression et suivi des abonnements.
- **Notifications** : Rappels pour les échéances et notifications personnalisées.
- **Simulation d’intérêts** : Estimation des économies potentielles en optimisant ses abonnements.
- **Support utilisateur** : Accès à une interface de support et gestion des demandes.
- **Profil utilisateur** : Création et gestion du profil, préférences et sécurité.

## Structure du projet

- `back/` : Backend Node.js (Express)
  - `models/` : Modèles de données (utilisateurs, abonnements, etc.)
  - `routes/` : Routes API (utilisateurs, abonnements, notifications, support)
  - `services/` : Services (email, notifications, cron, etc.)
  - `middleware/` : Middlewares (authentification, etc.)
  - `public/` : Fichiers statiques
  - `scripts/` : Scripts utilitaires
  - `utils/` : Fonctions utilitaires
- `front/` : Frontend React Native (Expo)
  - `src/` : Code source principal
    - `components/` : Composants réutilisables
    - `screens/` : Écrans de l’application
    - `redux/` : Store et slices Redux
    - `services/` : Services d’accès à l’API
    - `navigation/` : Navigation de l’application
    - `constants/` : Constantes globales
    - `types/` : Types TypeScript
    - `config/` : Configuration API
    - `assets/` : Images et icônes

## Installation

### Backend

```bash
cd back
npm install
```

### Frontend

```bash
cd front
npm install
```

## Lancement du projet

### Backend

```bash
cd back
npm start
```

### Frontend

```bash
cd front
npx expo start
```

## Technologies utilisées

- **Backend** : Node.js, Express, MongoDB
- **Frontend** : React Native, Expo, Redux Toolkit

## Contribuer

Les contributions sont les bienvenues !

1. Forkez le projet
2. Créez une branche (`git checkout -b feature/ma-feature`)
3. Commitez vos modifications (`git commit -am 'Ajout d’une nouvelle fonctionnalité'`)
4. Poussez la branche (`git push origin feature/ma-feature`)
5. Ouvrez une Pull Request

## Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus d’informations.

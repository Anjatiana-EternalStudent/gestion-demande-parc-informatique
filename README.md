# Systeme de gestion des demandes de maintenance informatique
## Description
Cette application permet de gerer les demandes de maintenance informatique au sein d'une organisation.  
Les utilisateurs peuvent creer des tickets pour signaler des problemes, suivre leur etat, tandis que les techniciens et administrateurs peuvent traiter et organiser les interventions.

## Prerequis

Assurez-vous d'avoir installe :
- Python 3.x
- Pipenv
- Git

Si Pipenv n'est pas installe :
pip install pipenv

## Installation
### 1. Cloner le depot
``` cmd
git clone https://github.com/Anjatiana-EternalStudent/gestion-demande-parc-informatique
```

```cmd
cd gestion-demande-parc-informatique
```
---
### 2. Installer les dependances

Pipenv utilisera automatiquement les fichiers Pipfile et Pipfile.lock.

```cmd
pipenv install
```
---

## Activer l'environnement virtuel
```cmd
pipenv shell
```
---

## Configuration de la base de donnees

Appliquer les migrations :
```cmd
python manage.py migrate
```

---
## Configuration de la base de donnees

Creer un fichier .env a la racine du projet afin de pouvoir envoyer les notifications par mail
```env
EMAIL=adresse.email@gmail.com
MDP=mot_de_passe_application
```

## Création d’un mot de passe d’application Google

Pour des raisons de sécurité, Google n’autorise pas l’utilisation du mot de passe principal du compte pour les applications externes. Il est donc nécessaire de générer un mot de passe d’application spécifique.

1. Connectez-vous au compte Google qui sera utilisé pour l’envoi des courriels.

2. Accédez à la gestion du compte Google, puis ouvrez la section **Sécurité**.

3. Activez la validation en deux étapes si elle n’est pas déjà activée. Cette étape est obligatoire.

4. Une fois la validation en deux étapes activée, accédez à la section **Mots de passe des applications**.

5. Créez un nouveau mot de passe d’application en sélectionnant une application de type **Mail**.

6. Google génère alors un mot de passe unique composé de plusieurs caractères.

7. Copiez ce mot de passe généré.

8. Collez ce mot de passe dans la variable `MDP` du fichier `.env` de votre projet.


---

## Creation d'un compte administrateur
```cmd
python manage.py createsuperuser
```

Suivez les instructions affichees dans le terminal.

---

## Lancer le serveur de developpement
```cmd
python manage.py runserver
```

Application accessible a l'adresse :

http://127.0.0.1:8000/

Interface d'administration :

http://127.0.0.1:8000/admin/

---

## Arret du serveur

Dans le terminal :

Ctrl + C

---

## Remarque

Ce guide permet d'executer le projet en local pour le developpement et les tests.

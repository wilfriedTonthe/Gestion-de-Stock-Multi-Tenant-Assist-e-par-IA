# 📦 Gestion de Stock - Fiche Projet

## 🏗️ Architecture Technique

| Composant | Technologie |
|-----------|-------------|
| **Frontend** | React 18 + TypeScript + Vite |
| **Backend** | Node.js + Express + TypeScript |
| **Base de données** | MongoDB + Mongoose |
| **Authentification** | JWT (JSON Web Tokens) |
| **Styling** | TailwindCSS |
| **State Management** | React Query (@tanstack/react-query) |
| **Icons** | Lucide React |

---

## ✅ Fonctionnalités Implémentées

### 🔐 Authentification & Autorisation
- [x] Inscription utilisateur avec validation email
- [x] Connexion avec JWT
- [x] Système RBAC complet (Role-Based Access Control)
- [x] 4 rôles : `superadmin`, `admin`, `manager`, `staff`
- [x] Middleware de permissions backend
- [x] Protection des routes frontend
- [x] Déconnexion

### 🏢 Gestion Multi-tenant (Organisations)
- [x] Modèle Organisation avec statut actif/inactif
- [x] Isolation des données par organisation
- [x] Super Admin peut bloquer/débloquer des organisations
- [x] Les utilisateurs d'une organisation bloquée ne peuvent pas se connecter

### 👥 Gestion des Utilisateurs
- [x] CRUD complet des utilisateurs
- [x] Attribution de rôles
- [x] Assignation à un entrepôt
- [x] Activation/Désactivation de comptes
- [x] Interface moderne avec avatars et badges de rôle

### 🏭 Gestion des Entrepôts
- [x] CRUD complet des entrepôts
- [x] 3 types : Usine, Entrepôt, Boutique
- [x] Informations : nom, adresse, ville, pays, email manager
- [x] Interface avec cards colorées par type
- [x] Recherche et filtrage

### 📦 Gestion des Produits
- [x] CRUD complet des produits
- [x] Champs : SKU, nom, description, catégorie, unité, seuil minimum, prix
- [x] Interface moderne avec tableau et recherche
- [x] Statistiques par catégorie

### 📊 Gestion des Stocks
- [x] Stock par produit et par entrepôt
- [x] Quantité totale et quantité réservée
- [x] Calcul automatique de la disponibilité
- [x] Détection des stocks bas (sous le seuil minimum)
- [x] Interface avec indicateurs visuels

### 🔄 Mouvements de Stock
- [x] 3 types de mouvements : Entrée, Sortie, Transfert
- [x] Traçabilité complète (qui, quand, pourquoi)
- [x] Référence optionnelle (n° commande, bon de livraison)
- [x] Mise à jour automatique des stocks
- [x] Historique complet des mouvements

### ⚠️ Alertes Stock Bas
- [x] Détection automatique des produits sous le seuil
- [x] Classification : Critique (<50% du seuil) vs Avertissement
- [x] Interface avec barres de progression
- [x] Compteurs dans le header

### 📈 Tableaux de Bord
- [x] **Dashboard Admin** : Stats globales, alertes, mouvements récents
- [x] **Dashboard Super Admin** : Stats plateforme, gestion organisations
- [x] Redirection automatique selon le rôle

### 🎨 Interface Utilisateur
- [x] Design moderne avec gradients et ombres
- [x] Responsive (mobile-friendly)
- [x] Modals stylisés pour les formulaires
- [x] Feedback visuel (loading, success, error)
- [x] Navigation latérale adaptée au rôle

---

## 🚧 Fonctionnalités À Développer

### 📧 Notifications
- [ ] Envoi d'emails via Resend API (configuration prête)
- [ ] Notifications de stock bas par email
- [ ] Notifications de nouveaux mouvements
- [ ] Récapitulatif quotidien/hebdomadaire

### 📊 Rapports & Analytics
- [ ] Export PDF des rapports de stock
- [ ] Export Excel/CSV des données
- [ ] Graphiques d'évolution des stocks
- [ ] Analyse des mouvements par période
- [ ] Prévisions de rupture de stock

### 🔍 Recherche Avancée
- [ ] Recherche globale multi-entités
- [ ] Filtres avancés combinés
- [ ] Historique des recherches

### 📱 Fonctionnalités Mobile
- [ ] Scan de codes-barres/QR codes
- [ ] Application mobile native (React Native)
- [ ] Mode hors-ligne avec synchronisation

### 🔒 Sécurité Avancée
- [ ] Authentification 2FA
- [ ] Logs d'audit complets
- [ ] Politique de mots de passe
- [ ] Sessions multiples gérées
- [ ] Rate limiting

### 📦 Gestion Avancée des Stocks
- [ ] Lots et dates d'expiration
- [ ] Numéros de série
- [ ] Emplacements dans l'entrepôt (zones, allées, étagères)
- [ ] Inventaire physique avec écarts
- [ ] Réservations de stock
- [ ] Commandes fournisseurs automatiques

### 🔗 Intégrations
- [ ] API publique documentée (Swagger/OpenAPI)
- [ ] Webhooks pour événements
- [ ] Intégration ERP (SAP, Odoo, etc.)
- [ ] Intégration e-commerce (Shopify, WooCommerce)
- [ ] Intégration comptable

### 👥 Collaboration
- [ ] Commentaires sur les mouvements
- [ ] Système de validation/approbation
- [ ] Notifications en temps réel (WebSocket)
- [ ] Chat interne

### 🎯 Autres
- [ ] Multi-langue (i18n)
- [ ] Thème sombre
- [ ] Personnalisation du branding par organisation
- [ ] Import en masse (CSV/Excel)
- [ ] Corbeille avec restauration

---

## 📁 Structure du Projet

```
gestion-de-stock/
├── apps/
│   ├── frontend/          # Application React
│   │   ├── src/
│   │   │   ├── components/  # Composants réutilisables
│   │   │   ├── hooks/       # Hooks personnalisés (useAuth)
│   │   │   ├── pages/       # Pages de l'application
│   │   │   ├── services/    # Services API
│   │   │   └── types/       # Types TypeScript
│   │   └── ...
│   └── backend/           # API Express
│       ├── src/
│       │   ├── controllers/ # Logique métier
│       │   ├── middlewares/ # Auth, permissions
│       │   ├── models/      # Schémas Mongoose
│       │   ├── routes/      # Routes API
│       │   ├── services/    # Services (email)
│       │   └── seed.ts      # Données de test
│       └── ...
└── package.json           # Monorepo config
```

---

## 🔑 Comptes de Test (après seed)

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Super Admin | `superadmin@inventory-saas.com` | `superadmin123` |
| Admin | `admin@techstore.com` | `password123` |
| Manager Usine | `manager.usine@techstore.com` | `password123` |
| Manager Entrepôt | `manager.entrepot@techstore.com` | `password123` |
| Manager Boutique | `manager.boutique@techstore.com` | `password123` |
| Staff Usine | `staff.usine@techstore.com` | `password123` |

---

## 🚀 Commandes

```bash
# Installation
npm install

# Développement
npm run dev          # Lance frontend + backend

# Seed (données de test)
cd apps/backend && npm run seed

# Build production
npm run build
```

---

## 📝 Notes

- Le projet utilise une architecture monorepo
- Les permissions sont gérées côté backend ET frontend
- Le Super Admin n'a pas d'organisation (accès plateforme)
- Les interfaces ont été modernisées avec un design cohérent

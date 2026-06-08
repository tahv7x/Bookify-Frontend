# Bookify Design System & UI Guidelines

Ce document décrit le design system actuel de l'application Bookify. Utilisez ces directives lorsque vous créez de nouvelles interfaces pour garantir une cohérence visuelle parfaite avec le reste de l'application.

## 1. Typographie

Nous utilisons deux polices de caractères Google Fonts :

*   **Primaire (Texte, UI, Boutons)** : `Poppins` (sans-serif)
    *   *Classe Tailwind* : `font-poppins`
    *   *Poids fréquents* : 400 (normal), 500 (medium), 600 (semibold), 700 (bold).
*   **Secondaire / Accentuation (Titres mis en avant, mots clés)** : `Fraunces` (serif)
    *   *Classe Tailwind* : `font-fraunces`
    *   *Poids fréquents* : 600 (semibold), 700 (bold). Souvent utilisé avec des dégradés de texte.

## 2. Palette de Couleurs

### Couleurs de Marque (Brand)
*   **Bleu Primaire** : `#1A6FD1`
*   **Bleu Foncé (Brand)** : `#004a96`
*   **Bleu Focus / Login** : `#0059B2`
*   **Dégradé Principal** : `bg-gradient-to-br from-[#004a96] to-[#1A6FD1]` ou `to-[#0059B2]`

### Thème Clair (Light Mode)
*   **Background principal** : `#F4F7FE`
*   **Background cartes/surface** : `white` (`#ffffff`) souvent avec opacité (ex: `bg-white/80` ou `bg-white/95`)
*   **Texte principal** : `text-slate-900` ou `text-gray-900`
*   **Texte secondaire (muté)** : `text-slate-600` ou `text-gray-600`
*   **Bordures** : `border-slate-200` ou `border-gray-200`

### Thème Sombre (Dark Mode) - Configuré dans tailwind
*   **Background principal** : `#0f1117` (`dark:bg-[#0f1117]`)
*   **Background cartes/surface** : `#1a1d27` (`dark:bg-[#1a1d27]`)
*   **Texte principal** : `#e2e8f0` (`dark:text-white` ou `dark:text-[#e2e8f0]`)
*   **Texte secondaire (muté)** : `#8892a4` (`dark:text-[#8892a4]`)
*   **Bordures** : `#2d3148` (`dark:border-[#2d3148]`)

## 3. Éléments d'Interface (UI Patterns)

### Cartes (Cards) & Conteneurs
*   **Style "Glassmorphism"** : Très utilisé pour les cartes et la navbar.
    *   *Light mode* : `bg-white/80 backdrop-blur-xl border border-slate-200`
    *   *Dark mode* : `dark:bg-[#1a1d27]/90 backdrop-blur-xl dark:border-[#2d3148]`
*   **Rayons de bordure (Border Radius)** : Très arrondis.
    *   Généralement `rounded-xl`, `rounded-2xl`, ou `rounded-3xl` pour les grandes cartes.
*   **Ombres (Shadows)** : 
    *   Ombres douces et parfois colorées (glow effects).
    *   Exemple de glow primaire : `shadow-[0_0_24px_-6px_#1A6FD1]`
    *   Ombre de carte hover : `hover:shadow-[0_20px_60px_-20px_rgba(26,111,209,0.35)]`

### Boutons
*   **Bouton Primaire (Call to Action)** :
    *   Dégradé bleu : `bg-gradient-to-br from-[#004a96] to-[#1A6FD1]`
    *   Texte : `text-white font-medium` ou `font-semibold`
    *   Bordures : `rounded-xl`
    *   Glow/Shadow au hover : `shadow-[0_0_6px_-2px_#1A6FD1] hover:shadow-[0_0_10px_-2px_#1A6FD1]`
*   **Bouton Secondaire / Outline** :
    *   Bordure : `border border-slate-200 dark:border-[#2d3148]`
    *   Background : Transparent ou `bg-white/60 dark:bg-transparent`
    *   Hover : `hover:border-[#1A6FD1]/50 hover:bg-white dark:hover:bg-[#1a1d27]`

### Inputs / Formulaires
*   **Style par défaut** :
    *   Background : `bg-gray-50 focus:bg-white` (ou équivalent dark)
    *   Bordure : `border-2 border-gray-200 rounded-xl`
    *   Padding généreux : `py-3.5 pl-12 pr-4` (avec icône à gauche)
*   **État Focus** :
    *   `focus:border-[#0059B2] focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-300`

## 4. Animations et Effets

*   **Hover States** : La plupart des éléments interactifs ont `transition-all duration-300`. Les cartes se soulèvent souvent légèrement (`hover:-translate-y-1`) avec une ombre accentuée.
*   **Framer Motion** : Utilisé pour les animations d'entrée au défilement (fade up, stagger children).
*   **Particules / Backgrounds animés** : Des `div` avec `blur-3xl`, des gradients radiaux, et des animations de pulse/ping ou de mouvement subtil flottant sont placés en arrière-plan (`-z-10`) pour donner de la profondeur.

## 5. Icônes
*   Bibliothèque standard utilisée : `lucide-react`.

---
*Note: Passez ce document aux outils de génération d'UI (comme v0, Claude, ChatGPT, Cursor, etc.) pour qu'ils produisent du code React/Tailwind qui s'intègre parfaitement avec l'existant.*
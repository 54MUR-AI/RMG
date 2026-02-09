# How-to: Tailwind CSS for Modern UI Design

**Category:** Frontend  
**Difficulty:** Beginner  
**Tags:** #tailwind #css #styling #design

---

## Overview

Tailwind CSS is a utility-first CSS framework that lets you build custom designs without leaving your HTML. It's our primary styling solution across RMG projects for its speed, flexibility, and maintainability.

## What You'll Learn

- Setting up Tailwind CSS
- Core utility classes
- Responsive design patterns
- Custom configurations
- Dark mode implementation
- Component patterns

---

## Prerequisites

- Basic HTML/CSS knowledge
- Node.js project setup
- Understanding of CSS concepts (flexbox, grid)

---

## Installation

### With Vite

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Configure Tailwind

```javascript
// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### Add Directives

```css
/* src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## Core Utilities

### Layout

```html
<!-- Flexbox -->
<div class="flex items-center justify-between gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

<!-- Grid -->
<div class="grid grid-cols-3 gap-4">
  <div>Column 1</div>
  <div>Column 2</div>
  <div>Column 3</div>
</div>

<!-- Container -->
<div class="container mx-auto px-4">
  Content
</div>
```

### Spacing

```html
<!-- Padding: p-{size} -->
<div class="p-4">Padding all sides</div>
<div class="px-6 py-4">Padding x and y</div>
<div class="pt-2 pr-4 pb-2 pl-4">Individual sides</div>

<!-- Margin: m-{size} -->
<div class="m-4">Margin all sides</div>
<div class="mx-auto">Center horizontally</div>
<div class="mt-8 mb-4">Top and bottom</div>

<!-- Gap (for flex/grid) -->
<div class="flex gap-4">Items with gap</div>
```

### Typography

```html
<!-- Font size -->
<p class="text-xs">Extra small</p>
<p class="text-sm">Small</p>
<p class="text-base">Base</p>
<p class="text-lg">Large</p>
<p class="text-xl">Extra large</p>
<p class="text-2xl">2X large</p>

<!-- Font weight -->
<p class="font-light">Light</p>
<p class="font-normal">Normal</p>
<p class="font-medium">Medium</p>
<p class="font-semibold">Semibold</p>
<p class="font-bold">Bold</p>

<!-- Text alignment -->
<p class="text-left">Left</p>
<p class="text-center">Center</p>
<p class="text-right">Right</p>

<!-- Text color -->
<p class="text-gray-900">Dark gray</p>
<p class="text-blue-600">Blue</p>
<p class="text-red-500">Red</p>
```

### Colors

```html
<!-- Background -->
<div class="bg-white">White background</div>
<div class="bg-gray-100">Light gray</div>
<div class="bg-blue-500">Blue</div>

<!-- Text -->
<p class="text-gray-900">Dark text</p>
<p class="text-white">White text</p>

<!-- Border -->
<div class="border border-gray-300">Border</div>
<div class="border-2 border-red-500">Thick red border</div>
```

### Borders & Rounded Corners

```html
<!-- Border radius -->
<div class="rounded">Small radius</div>
<div class="rounded-lg">Large radius</div>
<div class="rounded-full">Circle/pill</div>
<div class="rounded-t-lg">Top corners only</div>

<!-- Border width -->
<div class="border">1px border</div>
<div class="border-2">2px border</div>
<div class="border-t-4">Top border 4px</div>
```

---

## Responsive Design

Tailwind uses mobile-first breakpoints:

```html
<!-- Responsive utilities -->
<div class="w-full md:w-1/2 lg:w-1/3">
  <!-- Full width on mobile, half on tablet, third on desktop -->
</div>

<!-- Responsive grid -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
  <div>Item 4</div>
</div>

<!-- Responsive text -->
<h1 class="text-2xl md:text-4xl lg:text-6xl">
  Responsive heading
</h1>

<!-- Hide/show on different screens -->
<div class="hidden md:block">Visible on tablet+</div>
<div class="block md:hidden">Visible on mobile only</div>
```

### Breakpoints

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

---

## Custom Configuration

### Extend Theme

```javascript
// tailwind.config.js
export default {
  theme: {
    extend: {
      colors: {
        'samurai-red': '#DC2626',
        'samurai-black': '#0A0A0A',
        'samurai-grey': {
          dark: '#1A1A1A',
          darker: '#141414',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      animation: {
        'flame-flicker': 'flicker 2s ease-in-out infinite',
      },
      keyframes: {
        flicker: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.8 },
        }
      }
    },
  },
}
```

### Usage

```html
<div class="bg-samurai-black text-samurai-red">
  Custom colors
</div>

<div class="animate-flame-flicker">
  Custom animation
</div>
```

---

## Dark Mode

### Enable Dark Mode

```javascript
// tailwind.config.js
export default {
  darkMode: 'class', // or 'media'
  // ...
}
```

### Usage

```html
<!-- Light/dark variants -->
<div class="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  Content adapts to dark mode
</div>

<!-- Toggle dark mode -->
<button onclick="document.documentElement.classList.toggle('dark')">
  Toggle Dark Mode
</button>
```

---

## Component Patterns

### Button Component

```html
<!-- Primary button -->
<button class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl">
  Primary Button
</button>

<!-- Secondary button -->
<button class="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors duration-200">
  Secondary Button
</button>

<!-- Outline button -->
<button class="px-6 py-3 border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold rounded-lg transition-all duration-200">
  Outline Button
</button>
```

### Card Component

```html
<div class="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 overflow-hidden">
  <img src="image.jpg" alt="Card image" class="w-full h-48 object-cover">
  <div class="p-6">
    <h3 class="text-xl font-bold text-gray-900 mb-2">Card Title</h3>
    <p class="text-gray-600 mb-4">Card description goes here.</p>
    <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
      Learn More
    </button>
  </div>
</div>
```

### Form Input

```html
<div class="mb-4">
  <label class="block text-sm font-medium text-gray-700 mb-2">
    Email Address
  </label>
  <input
    type="email"
    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
    placeholder="you@example.com"
  />
</div>
```

### Navigation Bar

```html
<nav class="bg-white shadow-lg">
  <div class="container mx-auto px-4">
    <div class="flex items-center justify-between h-16">
      <div class="flex items-center gap-8">
        <a href="/" class="text-xl font-bold text-gray-900">Logo</a>
        <div class="hidden md:flex gap-6">
          <a href="/about" class="text-gray-600 hover:text-gray-900 transition-colors">About</a>
          <a href="/services" class="text-gray-600 hover:text-gray-900 transition-colors">Services</a>
          <a href="/contact" class="text-gray-600 hover:text-gray-900 transition-colors">Contact</a>
        </div>
      </div>
      <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
        Sign In
      </button>
    </div>
  </div>
</nav>
```

---

## Advanced Techniques

### Glassmorphism

```html
<div class="backdrop-blur-md bg-white/30 border border-white/20 rounded-xl p-6 shadow-xl">
  Glass effect content
</div>
```

### Gradients

```html
<!-- Background gradient -->
<div class="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-8">
  Gradient background
</div>

<!-- Text gradient -->
<h1 class="text-6xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
  Gradient Text
</h1>
```

### Animations

```html
<!-- Hover effects -->
<div class="transform hover:scale-105 transition-transform duration-300">
  Scales on hover
</div>

<!-- Spin animation -->
<div class="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full">
</div>

<!-- Pulse animation -->
<div class="animate-pulse bg-gray-200 h-4 w-full rounded">
</div>
```

### Custom Utilities

```css
/* src/index.css */
@layer utilities {
  .text-shadow {
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
  }

  .glass-card {
    @apply backdrop-blur-md bg-white/10 border border-white/20 rounded-xl shadow-xl;
  }

  .neon-text {
    text-shadow: 0 0 10px currentColor, 0 0 20px currentColor;
  }
}
```

---

## RMG Project Patterns

### Samurai Theme

```html
<!-- Hero section -->
<div class="bg-samurai-black min-h-screen flex items-center justify-center">
  <div class="text-center">
    <h1 class="text-6xl font-black text-white mb-4 neon-text">
      RONIN MEDIA GROUP
    </h1>
    <p class="text-xl text-white/70 mb-8">
      Masterless. Boundless. Unstoppable.
    </p>
    <button class="px-8 py-4 bg-samurai-red hover:bg-samurai-red-dark text-white font-bold rounded-lg transition-all duration-300 shadow-lg shadow-samurai-red/50 hover:shadow-xl hover:shadow-samurai-red/70">
      Enter the Dojo
    </button>
  </div>
</div>

<!-- Glass card -->
<div class="glass-card p-8">
  <h3 class="text-2xl font-bold text-white mb-4">Glass Effect</h3>
  <p class="text-white/80">Modern glassmorphism design</p>
</div>
```

---

## Best Practices

1. **Use @apply sparingly** - Prefer utility classes in HTML
2. **Create component classes for repeated patterns** - Use @layer components
3. **Leverage JIT mode** - Tailwind 3+ compiles only used classes
4. **Use arbitrary values when needed** - `w-[137px]` for one-off sizes
5. **Group related utilities** - Keep layout, spacing, colors together
6. **Use CSS variables for dynamic values** - Better than inline styles
7. **Purge unused CSS** - Ensure content paths are correct in config

---

## Troubleshooting

### Issue: Styles not applying

**Solution:** Check `content` paths in `tailwind.config.js`, restart dev server.

### Issue: Build size too large

**Solution:** Verify purge is working, remove unused plugins.

### Issue: Custom colors not working

**Solution:** Ensure theme.extend is used, not theme (which replaces defaults).

---

## Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Tailwind UI Components](https://tailwindui.com)
- [Headless UI](https://headlessui.com) - Unstyled components
- [Tailwind Play](https://play.tailwindcss.com) - Online playground

---

**Questions?** Drop a reply below or check out our other frontend guides!

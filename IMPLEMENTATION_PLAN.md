# ThinkSync: Next.js → React (Vite) + Express Migration Plan

## Project Structure

```
thinksync/
├── client/                    # Vite + React frontend
│   ├── public/
│   │   ├── thinksync_blacklogo.png
│   │   ├── thinksync_white.png
│   │   ├── laptop.glb
│   │   └── hero-bg.mp4
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header/
│   │   │   ├── Hero/
│   │   │   ├── Services/
│   │   │   ├── Projects/
│   │   │   ├── Process/
│   │   │   ├── Contact/
│   │   │   ├── Footer/
│   │   │   ├── Laptop/
│   │   │   ├── CustomCursor/
│   │   │   ├── Preloader/
│   │   │   ├── Aurora/
│   │   │   ├── HeroVideo/
│   │   │   ├── Reveal/
│   │   │   ├── Logo/
│   │   │   ├── MotionProvider/
│   │   │   └── PageTransition/
│   │   ├── context/
│   │   │   └── LanguageContext.tsx
│   │   ├── lib/
│   │   │   ├── motion.ts
│   │   │   ├── visibility.ts
│   │   │   ├── intro.ts
│   │   │   ├── media.ts
│   │   │   └── translations.ts
│   │   ├── hooks/
│   │   ├── styles/
│   │   │   ├── globals.css
│   │   │   └── variables.css
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── vite-env.d.ts
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── tsconfig.json
├── server/                    # Express backend
│   ├── src/
│   │   ├── routes/
│   │   │   └── contact.ts
│   │   ├── middleware/
│   │   ├── index.ts
│   │   └── types.ts
│   ├── package.json
│   └── tsconfig.json
└── package.json               # Root package.json with workspaces
```

## Migration Steps

### Phase 1: Project Setup
1. Create root package.json with workspaces
2. Set up client (Vite + React + TypeScript + Tailwind)
3. Set up server (Express + TypeScript)
4. Copy static assets to client/public

### Phase 2: Core Infrastructure
1. Migrate `globals.css` → client/src/styles/globals.css (Tailwind v4 syntax)
2. Migrate `translations.ts` → client/src/lib/translations.ts
3. Migrate `motion.ts`, `visibility.ts`, `intro.ts`, `media.ts` → client/src/lib/
4. Migrate `LanguageContext.tsx` → client/src/context/

### Phase 3: Components Migration
1. **Utility Components**: Logo, Reveal, MotionProvider
2. **Layout Components**: Header, Footer
3. **Section Components**: Hero, Services, Projects, Process, Contact
4. **Complex Components**: Laptop, CustomCursor, Preloader, Aurora, HeroVideo
5. **Page Assembly**: App.tsx with all sections

### Phase 4: Backend API
1. Create Express server with TypeScript
2. Migrate `/api/contact` route
3. Add CORS, body parsing, validation

### Phase 5: Integration & Testing
1. Configure Vite proxy for API calls in dev
2. Test all animations and interactions
3. Verify RTL/AR support
4. Build and verify production builds

## Key Technical Decisions

- **Tailwind v4** with Vite plugin (@tailwindcss/vite)
- **Framer Motion** for all animations (preserved)
- **Canvas/WebGL animations** preserved (Preloader, Aurora, Laptop 3D)
- **Custom Cursor** preserved with rAF loop
- **Language Context** with localStorage persistence
- **Express API** separate from frontend in dev (Vite proxy)
- **Production**: Separate deployments (Vercel/Netlify for client, Railway/Render for server)
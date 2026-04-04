# Tottho Vandar - Treasure of Information

[![Next.js](https://img.shields.io/badge/Next.js-14.2-000000?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4-06b6d4?logo=tailwindcss)](https://tailwindcss.com/)
[![Ant Design](https://img.shields.io/badge/Ant%20Design-6.3-1890ff?logo=ant-design)](https://ant.design/)
[![Redux Toolkit](https://img.shields.io/badge/Redux%20Toolkit-2.11-764abc?logo=redux)](https://redux-toolkit.js.org/)

**Tottho Vandar** (Bengali: তোত্থ বন্দার - \"Treasure/Source of Knowledge/Opinions\") is a modern, full-featured social content platform built with Next.js App Router. Users can create, edit, share, and discuss rich-text posts with comments, follow profiles, browse personalized feeds, manage tags, and more. Features seamless authentication, dark/light themes, responsive design, and a scalable Redux-managed state.

## ✨ Features

- **User Authentication**: Email/password signup/login, email verification, protected routes
- **Post Management**: Create/edit posts with rich text editor (React Quill), view individual posts, delete
- **Social Feed**: Personalized feed (`/feed`), user's own posts (`/my-posts`)
- **Profiles**: Public user profiles (`/profile/[id]`), editable profiles (`/profile/edit`)
- **Comments**: Threaded comments on posts
- **Tags**: Tag management for posts
- **Settings**: User account settings
- **UI/UX**: Dark/light mode toggle, responsive Ant Design components, TailwindCSS styling
- **State Management**: Redux Toolkit with slices for auth, posts, comments, profiles, UI
- **API Layer**: Axios-based API clients for auth, posts, comments, users
- **Type Safety**: Full TypeScript with custom types for posts, users, comments, tags

## 🚧 Upcoming Features (Roadmap)

- 🏷️ **Tag Manager** – Admin panel to create, edit, delete tags; users can follow tags.
- 👥 **Follow System** – Follow users and tags to get a personalized feed.
- 📚 **Reading List / Saved Posts** – Save posts to read later, with a dedicated saved page.
- 📝 **Draft Posts** – Save posts as drafts and publish them later.
- 🕒 **Latest Posts** – Dedicated tab for newest posts first.
- 🌟 **Featured Writers** – Show most followed or admin-selected writers in sidebar.
- 🖼️ **Profile Image Upload** – Users can upload and crop their avatar.
- 🔔 **Email Notifications** – Receive notifications for replies and follows (planned).

## 🛠 Tech Stack

| Category | Technologies |
|----------|--------------|
| **Framework** | Next.js 14.2 (App Router, TypeScript) |
| **UI Library** | Ant Design 6.3, TailwindCSS 4 (w/ custom dark mode) |
| **State** | Redux Toolkit 2.11, React-Redux |
| **Editor** | React Quill 2.0 (rich text) |
| **HTTP** | Axios 1.13 |
| **Fonts** | Inter (Google Fonts) |
| **Linting** | ESLint 9 |
| **Build** | Turbopack disabled, SWC minify |

## 📁 Project Structure

```
tottho-vandar-frontend/
├── app/                  # App Router pages & layouts
│   ├── (auth)/           # Auth routes
│   ├── feed/             # Feed page
│   ├── my-posts/         # User's posts
│   ├── posts/            # Posts: create/edit/[id]
│   ├── profile/          # Profiles: [id]/edit
│   ├── settings/         # Settings
│   ├── verify-email/     # Email verification
│   ├── globals.css       # Tailwind + theme vars
│   ├── layout.tsx        # Root layout (Antd + Redux)
│   └── page.tsx          # Home (redirect to /feed)
├── components/           # Reusable UI (Header, Navbar, PostCard, etc.)
├── lib/api/              # API clients (auth.ts, posts.ts, comments.ts, user.ts)
├── store/                # Redux (slices: auth, post, comment, profile, ui)
├── types/                # TS types (posts.ts, users.ts, comments.ts, tags.ts)
├── utils/                # Utilities (imageUtils.ts)
├── package.json          # Dependencies & scripts
├── next.config.js        # Next.js config
├── tailwind.config.ts    # Tailwind config (inferred)
└── tsconfig.json         # TypeScript config
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Yarn (recommended) or npm/pnpm

### Installation
```bash
git clone <repo-url>
cd tottho-vandar-frontend
yarn install
# or npm install
```

### Run Development Server
```bash
yarn dev
# Opens http://localhost:3000 (redirects to /feed)
```

### Build & Start Production
```bash
yarn build
yarn start
```

### Lint
```bash
yarn lint
```

## 🔌 API Overview

Backend API endpoints handled via `lib/api/` (assumed RESTful):

- **Auth**: `/api/auth/*` (login, register, verify)
- **Posts**: `/api/posts/*` (CRUD)
- **Comments**: `/api/comments/*`
- **Users/Profiles**: `/api/users/*`
- **Tags**: Tag management

See `lib/api/*.ts` for exact implementations.

## 🌙 Dark/Light Mode

Toggle via Redux UI slice. Custom CSS variables in `globals.css` with AntD overrides.

## 📸 Screenshots

*(Add screenshots of feed, post create, profile, dark mode)*

![Feed](https://via.placeholder.com/1200x600?text=Feed)  
![Post Editor](https://via.placeholder.com/1200x600?text=Rich+Text+Editor)  
![Profile](https://via.placeholder.com/1200x600?text=User+Profile)

## 🚀 Deployment

Recommended: [Vercel](https://vercel.com) (one-click deploy).

1. Push to GitHub
2. Import to Vercel
3. Set env vars (if backend needed)
4. Deploy!

Other: Docker, Railway, Netlify (static export disabled).

## 🤝 Contributing

1. Fork & clone
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit (`git commit -m 'feat: add amazing'`)
4. Push & PR to `main`

Follow ESLint/Prettier rules. See issues for tasks.

## 📄 License

MIT License - see [LICENSE](LICENSE) (add if needed).

## 🙌 Acknowledgments

Built with ❤️ using Next.js ecosystem. Icons from Ant Design.

---

⭐ Star on GitHub | 🍺 Buy me a coffee | 💬 Join Discord

**Happy Posting on Tottho Vandar! 🚀**


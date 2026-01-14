# 🔥 Lorenzo Blog

A modern, full-featured blog platform built with React, Node.js, and Supabase.

## ✨ Features

### Frontend
- 🎨 **Modern UI/UX** - Clean, responsive design with dark mode elements
- 📱 **Fully Responsive** - Works seamlessly on all devices
- 🔍 **Global Search** - Search across posts, comments, and users
- 💬 **Comments System** - Guest and authenticated commenting
- 📊 **Dynamic Categories** - Auto-generated from post tags
- 🎯 **Founder's Series** - Special section for featured content
- ⚡ **Real-time Analytics** - Live engagement metrics

### Admin Dashboard
- 📈 **Analytics Dashboard** - Post growth, engagement charts
- ✍️ **Rich Text Editor** - ReactQuill with image uploads
- 🖼️ **Cloudinary Integration** - Direct image uploads
- 🔔 **Notifications** - Real-time comment notifications
- 📝 **Post Management** - Create, edit, publish, draft
- 💭 **Comment Moderation** - View and manage all comments
- 🎨 **Categories Management** - Dynamic category system

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **TailwindCSS** - Utility-first CSS
- **React Router** - Client-side routing
- **React Quill** - Rich text editor
- **Moment.js** - Date formatting
- **React Toastify** - Notifications
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Supabase** - PostgreSQL database & authentication
- **Cloudinary** - Image hosting
- **JWT** - Authentication tokens

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm/yarn
- Supabase account
- Cloudinary account (for image uploads)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Azeez-Abiola/Lorenzotv-Blogs.git
cd Lorenzotv-Blogs
```

2. **Install dependencies**
```bash
# Install frontend dependencies
npm install

# Install server dependencies
cd server
npm install
cd ..
```

3. **Setup environment variables**

Create `.env` file in the root:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Create `server/.env` file:
```env
PORT=5000
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

4. **Setup database**

Run the SQL scripts in your Supabase SQL editor:
```bash
server/schema.sql
server/notifications_setup.sql
server/add_columns.sql
server/update_comments_table.sql
```

5. **Run the application**
```bash
# Development (both frontend and backend)
npm run dev

# Or run separately:
# Frontend
npm start

# Backend
npm run server
```

## 📁 Project Structure

```
lorenzo-blog/
├── src/
│   ├── components/      # Reusable components
│   ├── pages/          # Page components
│   │   ├── admin/      # Admin dashboard
│   │   ├── home/       # Homepage
│   │   ├── blogpost/   # Blog post detail
│   │   └── ...
│   ├── hooks/          # Custom React hooks
│   └── store/          # Context/state management
├── server/
│   ├── index.js        # Express server
│   └── *.sql           # Database schemas
└── public/             # Static assets
```

## 🔐 Authentication

The app uses JWT-based authentication with Supabase:
- Admin login required for dashboard access
- Guest commenting allowed
- Secure token validation

## 📝 API Endpoints

### Public
- `GET /api/blogs` - Get all blog posts
- `GET /api/blogs/:id` - Get single blog post
- `GET /api/blogs/:id/comments` - Get post comments
- `POST /api/blogs/:id/comments` - Post comment (guest or auth)
- `GET /api/categories` - Get all categories

### Admin (Protected)
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/analytics/growth` - Post growth data
- `GET /api/admin/analytics/engagement` - Engagement metrics
- `GET /api/admin/notifications` - Get notifications
- `GET /api/admin/comments` - Get all comments
- `GET /api/admin/global-search` - Search everything
- `POST /api/blogs` - Create blog post
- `PATCH /api/blogs/:id` - Update blog post

## 🎨 Design Highlights

- **Brand Colors**: Red (#8C0202) and Gray scale
- **Typography**: Bold, uppercase tracking for headers
- **Components**: Glassmorphism, shadows, smooth transitions
- **Layout**: Maximum content width of 1400px
- **Images**: Cloudinary-hosted with optimization

## 🐛 Known Issues & Solutions

- **Server restart required** after backend changes
- **Comments table**: Run `update_comments_table.sql` for guest comments
- **Categories**: Fetches from database or extracts from blog tags

## 📄 License

This project is private and proprietary.

## 👨‍💻 Author

**Lorenzo Blog**  
A leading digital media platform for storytelling and innovation.

---

Made with ❤️ by the Lorenzo Blog Team

# TryVerse Mobile

**Slogan:** *"Try It Before You Buy It"*

Built with **React Native** (Expo SDK 54)

---

## Features

- **Virtual Try-On:** Upload a selfie and paste a product URL to see the outfit on yourself
- **AI Fashion Store:** Browse curated products from 10+ stores and try them on with AI
- **AI Fashion Stylist:** Chat with AI for style advice, outfit ideas, and trip packing suggestions
- **Pose Studio:** Transform selfies into 20+ professional fashion poses
- **Body Measurements:** Save measurements for size recommendations
- **Pro/Free tiers** with different limits

---

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | React Native with Expo SDK 54 |
| Routing | expo-router (file-based routing) |
| State | React Context (AuthProvider) |
| Storage | expo-secure-store (encrypted tokens) |
| Camera | expo-image-picker (camera + gallery) |
| Animations | react-native-reanimated |
| UI | Custom theme system with LinearGradient |

---

## Project Structure

```
mobile/
├── app/                    # Screens (file-based routing)
│   ├── (auth)/             # Auth flow: onboarding, login, signup, forgot-password
│   ├── (tabs)/             # Main app: home, shop, tryon, style, profile
│   ├── store-tryon.tsx     # Store product try-on modal
│   ├── privacy-policy.tsx  # Privacy policy
│   ├── contact-us.tsx      # Contact & FAQ
│   └── about.tsx           # About the app
├── components/             # Reusable components
├── constants/              # Theme, colors, spacing
├── lib/                    # API client, auth context
└── assets/                 # Images, fonts
```

---

## API Endpoints Used

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login (form-urlencoded: `username`, `password`) |
| POST | `/api/auth/signup` | Signup (JSON: `email`, `full_name`, `source`) |
| POST | `/api/auth/forgot-password` | Password reset (JSON: `email`) |

### Store
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/store/brands` | List all brand stores |
| GET | `/api/store/brands/{id}/products` | List products for a store (query: `limit`, `offset`) |

### Try-On (URL-based)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/tryon/upload-user-photo` | Upload selfie (multipart: `file`) |
| POST | `/api/tryon/fetch-and-tryon` | Fetch product from URL and generate try-on (JSON: `url`) |

### Store Try-On
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/store/upload-user-image` | Upload user image (multipart: `file`, query: `body_type`) |
| POST | `/api/store/try-on` | Generate try-on (JSON: `product_id`, `session_id`, `store_id`) |
| GET | `/api/store/download/{file_id}` | Download generated try-on image |

### Stylist
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/stylist/start-from-tryon` | Start conversation from try-on session |
| POST | `/api/stylist/upload-photo` | Upload photo to start styling session |
| POST | `/api/stylist/chat` | Send chat message (JSON: `conversation_id`, `message`) |

### Pose
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/pose/generate` | Generate pose images (multipart: `file`, `poses` JSON array of 2 pose descriptions) |

### User
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/measurements` | Get saved body measurements |
| PUT | `/api/user/measurements` | Update measurements (JSON: `height`, `chest_cm`, `waist_cm`, `shoulder_cm`, `unit`) |

---

## Privacy Policy Summary

- **User input images are NEVER saved** — selfies and uploads are processed and discarded
- **Generated images are ephemeral** — auto-deleted after a short period
- **Only email, name, and preferences are stored** — minimal personal data
- **No data sold to third parties** — your data stays private

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `EXPO_PUBLIC_API_URL` | Backend API URL (e.g., `http://192.168.1.8:8000`) |

Create a `.env` file in the `mobile` directory:

```
EXPO_PUBLIC_API_URL=http://192.168.1.8:8000
```

---

## Development

```bash
cd mobile
npm install
npx expo start --port 8083
```

---

## Testing on Physical Device

1. Install **Expo Go** from App Store or Play Store
2. Scan the QR code or enter `exp://YOUR_IP:8083` in Expo Go
3. Ensure the backend is running on `0.0.0.0:8000` (accessible from your network)
4. Add a Windows Firewall rule for port 8000 if needed
5. Set `EXPO_PUBLIC_API_URL` to your machine's local IP (e.g., `http://192.168.1.8:8000`)
